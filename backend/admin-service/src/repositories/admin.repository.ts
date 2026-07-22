import { prisma } from '../config/database';
import { UserStatus, AccountStatus } from '@prisma/client';

export class AdminRepository {
  async getDashboardCounts() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [customersCount, activeAccountsCount, todayTransactionsCount, pendingLoansCount, activeCardsCount] =
      await Promise.all([
        prisma.customer.count(),
        prisma.account.count({ where: { status: 'ACTIVE' } }),
        prisma.transaction.count({
          where: {
            createdAt: {
              gte: startOfToday,
            },
          },
        }),
        prisma.loan.count({ where: { status: 'SUBMITTED' } }),
        prisma.card.count({ where: { status: 'ACTIVE' } }),
      ]);

    return {
      totalCustomers: customersCount,
      activeAccounts: activeAccountsCount,
      todayTransactions: todayTransactionsCount,
      pendingLoans: pendingLoansCount,
      fraudAlerts: todayTransactionsCount > 0 ? 1 : 0, // Mock metric based on transactions
      activeCards: activeCardsCount,
      apiRequestsToday: 125630, // Mock standard traffic stat
    };
  }

  async searchCustomers(filters: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    kyc?: string;
  }) {
    const where: any = {};

    if (filters.status) {
      where.user = {
        status: filters.status as UserStatus,
      };
    }

    if (filters.kyc) {
      where.kycStatus = filters.kyc;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      where.OR = [
        { firstName: { contains: searchLower, mode: 'insensitive' as const } },
        { lastName: { contains: searchLower, mode: 'insensitive' as const } },
        { nic: { contains: searchLower, mode: 'insensitive' as const } },
        { phone: { contains: searchLower, mode: 'insensitive' as const } },
        {
          user: {
            email: { contains: searchLower, mode: 'insensitive' as const },
          },
        },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const [total, items] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: filters.limit,
        include: {
          user: {
            select: {
              email: true,
              status: true,
            },
          },
        },
      }),
    ]);

    return { total, items };
  }

  async findCustomerById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async freezeCustomerAccounts(customerId: string) {
    return prisma.account.updateMany({
      where: { customerId },
      data: {
        status: AccountStatus.FROZEN,
      },
    });
  }

  async getAuditLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
    ]);

    return { total, items };
  }
}
