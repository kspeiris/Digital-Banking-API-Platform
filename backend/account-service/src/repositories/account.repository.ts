import { prisma } from '../config/database';

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
          },
        },
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

  async countTransactionsForAccount(accountId: string, fromDate: Date, toDate: Date) {
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
