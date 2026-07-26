import { prisma } from '../config/database';
import { UserStatus, AccountStatus, Role } from '@prisma/client';

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
      fraudAlerts: 0,
      activeCards: activeCardsCount,
      apiRequestsToday: 0,
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

  async findCustomerByUserId(userId: string) {
    return prisma.customer.findUnique({
      where: { userId },
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

  async findAllTransactions(filters: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    from?: Date;
    to?: Date;
  }) {
    const skip = (filters.page - 1) * filters.limit;
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      where.OR = [
        { transactionReference: { contains: searchLower, mode: 'insensitive' as const } },
        { description: { contains: searchLower, mode: 'insensitive' as const } },
        {
          fromAccount: {
            customer: {
              user: {
                email: { contains: searchLower, mode: 'insensitive' as const },
              },
            },
          },
        },
        {
          toAccount: {
            customer: {
              user: {
                email: { contains: searchLower, mode: 'insensitive' as const },
              },
            },
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          fromAccount: {
            include: {
              customer: {
                include: {
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
          toAccount: {
            include: {
              customer: {
                include: {
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
          beneficiary: true,
        },
      }),
    ]);

    return { total, items };
  }

  async findSecurityNotifications() {
    return prisma.notification.findMany({
      where: {
        OR: [
          { title: { contains: 'security', mode: 'insensitive' as const } },
          { title: { contains: 'fraud', mode: 'insensitive' as const } },
          { title: { contains: 'suspicious', mode: 'insensitive' as const } },
          { title: { contains: 'login', mode: 'insensitive' as const } },
          { title: { contains: 'otp', mode: 'insensitive' as const } },
          { title: { contains: 'password', mode: 'insensitive' as const } },
          { message: { contains: 'security', mode: 'insensitive' as const } },
          { message: { contains: 'fraud', mode: 'insensitive' as const } },
          { message: { contains: 'suspicious', mode: 'insensitive' as const } },
        ],
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
  }

  async findCustomerRole() {
    return prisma.role.findFirst({
      where: { name: { equals: 'Customer', mode: 'insensitive' as const } },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    roleId: string;
    status: UserStatus;
    emailVerified: boolean;
  }) {
    return prisma.user.create({
      data,
    });
  }

  async createCustomer(data: {
    userId: string;
    firstName: string;
    lastName: string;
    nic: string;
    dob: Date;
    phone: string;
    address: string;
    city: string;
    country: string;
  }) {
    return prisma.customer.create({
      data,
    });
  }
}
