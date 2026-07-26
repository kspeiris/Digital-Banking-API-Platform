import { prisma } from '../config/database';
import { TransactionType, TransactionStatus } from '@prisma/client';

export class TransactionRepository {
  async findCustomerByUserId(userId: string) {
    return prisma.customer.findUnique({
      where: { userId },
    });
  }

  async findAccountById(id: string) {
    return prisma.account.findUnique({
      where: { id },
    });
  }

  async findBeneficiaryById(id: string) {
    return prisma.beneficiary.findUnique({
      where: { id },
    });
  }

  async findDuplicateTransaction(params: {
    fromAccountId: string;
    toAccountId?: string;
    beneficiaryId?: string;
    amount: number;
    since: Date;
  }) {
    return prisma.transaction.findFirst({
      where: {
        fromAccountId: params.fromAccountId,
        toAccountId: params.toAccountId || null,
        beneficiaryId: params.beneficiaryId || null,
        amount: params.amount,
        createdAt: {
          gte: params.since,
        },
        status: {
          in: ['SUCCESS', 'PENDING'],
        },
      },
    });
  }

  async getDailySpent(accountId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const aggregate = await prisma.transaction.aggregate({
      where: {
        fromAccountId: accountId,
        status: 'SUCCESS',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        amount: true,
        fee: true,
      },
    });

    const amount = Number(aggregate._sum.amount || 0);
    const fee = Number(aggregate._sum.fee || 0);

    return amount + fee;
  }

  async createScheduledTransfer(data: {
    customerId: string;
    fromAccount: string;
    beneficiaryId: string;
    amount: number;
    frequency: string;
    nextExecution: Date;
    status: string;
  }) {
    return prisma.scheduledTransfer.create({
      data,
    });
  }

  async findDueScheduledTransfers() {
    return prisma.scheduledTransfer.findMany({
      where: {
        status: 'ACTIVE',
        nextExecution: {
          lte: new Date(),
        },
      },
      include: {
        account: true,
        beneficiary: true,
      },
    });
  }

  async updateScheduledTransferStatus(id: string, status: string, nextExecution?: Date) {
    return prisma.scheduledTransfer.update({
      where: { id },
      data: {
        status,
        ...(nextExecution ? { nextExecution } : {}),
      },
    });
  }

  async findTransactions(
    customerId: string,
    filters: {
      page: number;
      limit: number;
      type?: TransactionType;
      status?: TransactionStatus;
      from?: Date;
      to?: Date;
    }
  ) {
    const skip = (filters.page - 1) * filters.limit;
    const where: any = {
      OR: [
        { fromAccount: { customerId } },
        { toAccount: { customerId } },
      ],
    };

    if (filters.type) {
      where.transactionType = filters.type;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        where.createdAt.gte = filters.from;
      }
      if (filters.to) {
        where.createdAt.lte = filters.to;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: filters.limit,
      include: {
        fromAccount: {
          select: {
            accountNumber: true,
          },
        },
        toAccount: {
          select: {
            accountNumber: true,
          },
        },
      },
    });

    const total = await prisma.transaction.count({ where });

    return {
      transactions,
      total,
    };
  }

  async findTransactionById(id: string) {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        fromAccount: {
          include: {
            customer: true,
          },
        },
        toAccount: {
          include: {
            customer: true,
          },
        },
        beneficiary: true,
      },
    });
  }

  async updateTransactionStatus(id: string, status: TransactionStatus) {
    return prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }

  async findTransactionsByAccountId(
    accountId: string,
    status?: TransactionStatus
  ) {
    return prisma.transaction.findMany({
      where: {
        OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
        ...(status ? { status } : {}),
      },
      take: 1,
    });
  }
}
