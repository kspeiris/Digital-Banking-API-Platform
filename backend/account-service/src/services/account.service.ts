import { AccountRepository } from '../repositories/account.repository';
import { NotFoundException, ForbiddenException, BadRequestException } from 'shared-common';
import { redis } from '../config/redis';

export class AccountService {
  private accountRepository: AccountRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
  }

  async getAccountsForUser(userId: string, role: string) {
    const cacheKey = `accounts:user:${userId}:${role}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    let result: any[];
    if (role === 'ADMIN') {
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
        balance: Number(acc.balance),
        availableBalance: Number(acc.availableBalance),
        status: acc.status,
      }));
    }

    await redis.set(cacheKey, JSON.stringify(result), { EX: 300 }); // 5 minutes cache
    return result;
  }

  async verifyAccountAccess(accountId: string, userId: string, role: string) {
    const account = await this.accountRepository.findAccountWithCustomer(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (role !== 'ADMIN') {
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
    const cacheKey = `balance:account:${accountId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const account = await this.verifyAccountAccess(accountId, userId, role);
    const result = {
      balance: Number(account.balance),
      availableBalance: Number(account.availableBalance),
      currency: account.currency,
    };

    await redis.set(cacheKey, JSON.stringify(result), { EX: 30 }); // 30 seconds cache
    return result;
  }
}
