import { AccountRepository } from '../repositories/account.repository';
import { NotFoundException, ForbiddenException, BadRequestException } from 'shared-common';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { AccountStatus } from '@prisma/client';

export class AccountService {
  private accountRepository: AccountRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
  }

  async getAccountsForUser(userId: string, role: string) {
    let result: any[];
    if (role?.toUpperCase() === 'ADMIN') {
      const accounts = await this.accountRepository.findAllAccounts();
      result = accounts.map(acc => ({
        accountId: acc.id,
        accountNumber: acc.accountNumber,
        accountType: acc.accountType.toUpperCase(),
        currency: acc.currency,
        branch: acc.branch,
        balance: Number(acc.balance),
        availableBalance: Number(acc.availableBalance),
        status: acc.status,
        createdAt: acc.createdAt.toISOString().split('T')[0],
        customer: acc.customer,
      }));
    } else {
      const customer = await this.accountRepository.findCustomerByUserId(userId);
      if (!customer) {
        throw new ForbiddenException('Customer profile not found');
      }

      const accounts = await this.accountRepository.findAccountsByCustomerId(customer.id);
      result = accounts.map(acc => ({
        accountId: acc.id,
        accountNumber: acc.accountNumber,
        accountType: acc.accountType.toUpperCase(),
        currency: acc.currency,
        branch: acc.branch,
        balance: Number(acc.balance),
        availableBalance: Number(acc.availableBalance),
        status: acc.status,
        createdAt: acc.createdAt.toISOString().split('T')[0],
      }));
    }

    return result;
  }

  async verifyAccountAccess(accountId: string, userId: string, role: string) {
    const account = await this.accountRepository.findAccountWithCustomer(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (role?.toUpperCase() !== 'ADMIN') {
      const customer = await this.accountRepository.findCustomerByUserId(userId);
      if (!customer || account.customerId !== customer.id) {
        throw new ForbiddenException('You do not have permission to access this account');
      }
    }

    if (account.status === 'CLOSED') {
      throw new BadRequestException('Account is closed');
    }

    return account;
  }

  async getAccountDetails(accountId: string, userId: string, role: string) {
    const account = await this.verifyAccountAccess(accountId, userId, role);
    return {
      accountId: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType.toUpperCase(),
      currency: account.currency,
      branch: account.branch,
      balance: Number(account.balance),
      availableBalance: Number(account.availableBalance),
      status: account.status,
      createdAt: account.createdAt.toISOString().split('T')[0],
    };
  }

  async getAccountBalance(accountId: string, userId: string, role: string) {
    const account = await this.verifyAccountAccess(accountId, userId, role);
    const result = {
      balance: Number(account.balance),
      availableBalance: Number(account.availableBalance),
      currency: account.currency,
    };

    return result;
  }

  async createAccount(data: {
    accountNumber: string;
    accountType: string;
    currency: string;
    branch: string;
    initialBalance: number;
    customerId?: string;
  }, userId: string, role: string) {
    let customerId = data.customerId;

    if (!customerId) {
      const customer = await this.accountRepository.findCustomerByUserId(userId);
      if (!customer) {
        throw new ForbiddenException('Customer profile not found');
      }
      customerId = customer.id;
    } else if (role?.toUpperCase() !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create accounts for other customers');
    }

    const existing = await this.accountRepository.findAccountByAccountNumber(data.accountNumber);
    if (existing) {
      throw new BadRequestException('Account number already exists');
    }

    const account = await this.accountRepository.createAccount({
      customerId,
      accountNumber: data.accountNumber,
      accountType: data.accountType,
      currency: data.currency,
      branch: data.branch,
      balance: data.initialBalance,
      availableBalance: data.initialBalance,
    });

    const targetUserId = customerId;
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId: targetUserId,
          action: 'ACCOUNT_CREATED',
          module: 'ACCOUNT',
        },
      });

      await tx.notification.create({
        data: {
          userId: targetUserId,
          title: 'Account Created',
          message: `Account ${data.accountNumber} (${data.accountType}) has been created successfully with initial balance of ${data.currency} ${data.initialBalance}.`,
        },
      });
    });

    return account;
  }

  async updateAccountStatus(
    id: string,
    status: string,
    userId: string,
    role: string
  ) {
    const account = await this.accountRepository.findAccountByIdWithRelations(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (role !== 'ADMIN') {
      const customer = await this.accountRepository.findCustomerByUserId(userId);
      if (!customer || account.customerId !== customer.id) {
        throw new ForbiddenException('You do not have permission to update this account');
      }
    }

    const validStatuses = ['ACTIVE', 'FROZEN', 'CLOSED'] as const;
    if (!validStatuses.includes(status as any)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const statusEnum = status as AccountStatus;

    if (account.status === statusEnum) {
      throw new BadRequestException(`Account is already ${status}`);
    }

    await this.accountRepository.updateAccountStatus(id, statusEnum);

    const customerUserId = account.customer?.user?.id;
    if (customerUserId) {
      await prisma.$transaction(async (tx) => {
        await tx.auditLog.create({
          data: {
            userId: customerUserId,
            action: 'ACCOUNT_STATUS_UPDATED',
            module: 'ACCOUNT',
          },
        });

        await tx.notification.create({
          data: {
            userId: customerUserId,
            title: 'Account Status Updated',
            message: `Your account ${account.accountNumber} status has been changed to ${status}.`,
          },
        });
      });
    }

    return account;
  }

  async deleteAccount(id: string, userId: string, role: string) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete accounts');
    }

    const account = await this.accountRepository.findAccountByIdWithRelations(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.status === 'CLOSED') {
      throw new BadRequestException('Account is already closed');
    }

    if (Number(account.balance) !== 0) {
      throw new BadRequestException('Account balance must be zero before deletion');
    }

    const activeCards = account.cards.filter((c: any) => c.status === 'ACTIVE').length;
    if (activeCards > 0) {
      throw new BadRequestException('Account has active cards. Deactivate all cards before closing the account');
    }

    const totalTransactions = account.sentTransactions.length + account.receivedTransactions.length;
    if (totalTransactions > 0) {
      throw new BadRequestException('Account has transactions. Cannot delete account with transaction history');
    }

    await this.accountRepository.deleteAccount(id);

    const customerUserId = account.customer?.user?.id;
    if (customerUserId) {
      await prisma.$transaction(async (tx) => {
        await tx.auditLog.create({
          data: {
            userId: customerUserId,
            action: 'ACCOUNT_DELETED',
            module: 'ACCOUNT',
          },
        });

        await tx.notification.create({
          data: {
            userId: customerUserId,
            title: 'Account Closed',
            message: `Your account ${account.accountNumber} has been closed and deleted.`,
          },
        });
      });
    }
  }
}