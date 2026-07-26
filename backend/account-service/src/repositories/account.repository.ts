import { prisma } from '../config/database';
import { AccountStatus } from '@prisma/client';

export class AccountRepository {
  async findCustomerByUserId(userId: string) {
    return prisma.customer.findUnique({
      where: { userId },
    });
  }

  async findAccountsByCustomerId(customerId: string) {
    return prisma.account.findMany({
      where: { customerId },
    });
  }

  async findAllAccounts() {
    return prisma.account.findMany({
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            nic: true,
          },
        },
      },
    });
  }

  async findAccountById(id: string) {
    return prisma.account.findUnique({
      where: { id },
    });
  }

  async findAccountWithCustomer(id: string) {
    return prisma.account.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nic: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  }

  async findAccountByAccountNumber(accountNumber: string) {
    return prisma.account.findUnique({
      where: { accountNumber },
    });
  }

  async findAccountByIdWithRelations(id: string) {
    return prisma.account.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        cards: {
          select: {
            id: true,
            status: true,
          },
        },
        sentTransactions: {
          where: {
            status: 'SUCCESS',
          },
          select: {
            id: true,
          },
        },
        receivedTransactions: {
          where: {
            status: 'SUCCESS',
          },
          select: {
            id: true,
          },
        },
        scheduledTransfers: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async createAccount(data: {
    customerId: string;
    accountNumber: string;
    accountType: string;
    currency: string;
    branch: string;
    balance: number;
    availableBalance: number;
  }) {
    return prisma.account.create({
      data,
    });
  }

  async updateAccountStatus(id: string, status: AccountStatus) {
    return prisma.account.update({
      where: { id },
      data: { status },
    });
  }

  async deleteAccount(id: string) {
    return prisma.account.delete({
      where: { id },
    });
  }

  async countActiveCards(accountId: string) {
    return prisma.card.count({
      where: {
        accountId,
        status: 'ACTIVE',
      },
    });
  }

  async countTransactionsForAccount(accountId: string) {
    return prisma.transaction.count({
      where: {
        OR: [
          { fromAccountId: accountId },
          { toAccountId: accountId },
        ],
      },
    });
  }

  async findTransactionsForAccount(
    accountId: string,
    fromDate: Date,
    toDate: Date,
    skip: number,
    take: number
  ) {
    return prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccountId: accountId },
          { toAccountId: accountId },
        ],
        status: 'SUCCESS',
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take,
    });
  }

  async countTransactionsForAccountByDate(accountId: string, fromDate: Date, toDate: Date) {
    return prisma.transaction.count({
      where: {
        OR: [
          { fromAccountId: accountId },
          { toAccountId: accountId },
        ],
        status: 'SUCCESS',
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });
  }

  async calculateBalanceBeforeDate(accountId: string, beforeDate: Date): Promise<number> {
    const account = await this.findAccountById(accountId);
    if (!account) return 0;

    const sent = await prisma.transaction.aggregate({
      where: {
        fromAccountId: accountId,
        status: 'SUCCESS',
        createdAt: {
          gte: beforeDate,
        },
      },
      _sum: {
        amount: true,
        fee: true,
      },
    });

    const received = await prisma.transaction.aggregate({
      where: {
        toAccountId: accountId,
        status: 'SUCCESS',
        createdAt: {
          gte: beforeDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalSent = Number(sent._sum.amount || 0) + Number(sent._sum.fee || 0);
    const totalReceived = Number(received._sum.amount || 0);

    return Number(account.balance) - totalReceived + totalSent;
  }
}
