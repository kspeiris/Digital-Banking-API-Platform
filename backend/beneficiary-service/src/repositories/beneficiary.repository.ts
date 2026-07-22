import { prisma } from '../config/database';

export class BeneficiaryRepository {
  async findCustomerByUserId(userId: string) {
    return prisma.customer.findUnique({
      where: { userId },
    });
  }

  async findBeneficiariesByCustomerId(customerId: string) {
    return prisma.beneficiary.findMany({
      where: { customerId },
      orderBy: [
        { favorite: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findBeneficiaryById(id: string) {
    return prisma.beneficiary.findUnique({
      where: { id },
    });
  }

  async findBeneficiaryByAccount(customerId: string, accountNumber: string) {
    return prisma.beneficiary.findFirst({
      where: {
        customerId,
        accountNumber,
      },
    });
  }

  async findBeneficiaryByNickname(customerId: string, nickname: string) {
    return prisma.beneficiary.findFirst({
      where: {
        customerId,
        nickname: {
          equals: nickname,
          mode: 'insensitive',
        },
      },
    });
  }

  async createBeneficiary(data: {
    customerId: string;
    nickname: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    branch: string;
    favorite: boolean;
  }) {
    return prisma.beneficiary.create({
      data,
    });
  }

  async updateBeneficiary(
    id: string,
    data: {
      nickname?: string;
      branch?: string;
      favorite?: boolean;
    }
  ) {
    return prisma.beneficiary.update({
      where: { id },
      data,
    });
  }

  async deleteBeneficiary(id: string) {
    return prisma.beneficiary.delete({
      where: { id },
    });
  }
}
