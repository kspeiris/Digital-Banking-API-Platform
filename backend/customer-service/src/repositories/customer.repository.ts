import { prisma } from '../config/database';

export class CustomerRepository {
  async findByUserId(userId: string) {
    return prisma.customer.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            status: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            status: true,
          },
        },
      },
    });
  }

  async updateByUserId(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      city?: string;
      country?: string;
      occupation?: string;
      profileImage?: string;
      kycStatus?: string;
    }
  ) {
    return prisma.customer.update({
      where: { userId },
      data,
    });
  }

  async updateKycStatus(userId: string, data: { occupation: string; kycStatus: string }) {
    return prisma.customer.update({
      where: { userId },
      data,
    });
  }
}
