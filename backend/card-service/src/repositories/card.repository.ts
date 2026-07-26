import { prisma } from '../config/database';
import { CardStatus, CardRequestStatus } from '@prisma/client';

export class CardRepository {
  async findCustomerByUserId(userId: string) {
    return prisma.customer.findUnique({
      where: { userId },
    });
  }

  async findCardsByCustomerId(customerId: string) {
    return prisma.card.findMany({
      where: {
        account: {
          customerId,
        },
      },
      include: {
        limits: true,
      },
    });
  }

  async findAllCards() {
    return prisma.card.findMany({
      include: {
        limits: true,
        account: {
          include: {
            customer: true,
          },
        },
      },
    });
  }

  async findCardById(id: string) {
    return prisma.card.findUnique({
      where: { id },
      include: {
        limits: true,
        account: {
          include: {
            customer: true,
          },
        },
      },
    });
  }

  async updateCardStatus(id: string, status: CardStatus) {
    return prisma.card.update({
      where: { id },
      data: { status },
    });
  }

  async updateCardSettings(
    id: string,
    data: {
      onlineEnabled?: boolean;
      internationalEnabled?: boolean;
    }
  ) {
    return prisma.card.update({
      where: { id },
      data,
    });
  }

  async updateCardPin(id: string, hashedPin: string) {
    return prisma.card.update({
      where: { id },
      data: {
        cvvHash: hashedPin,
      },
    });
  }

  async updateCardLimits(
    cardId: string,
    limits: {
      dailyLimit: number;
      atmLimit: number;
      onlineLimit: number;
      contactlessLimit: number;
    }
  ) {
    return prisma.cardLimit.upsert({
      where: { cardId },
      update: {
        dailyLimit: limits.dailyLimit,
        atmLimit: limits.atmLimit,
        onlineLimit: limits.onlineLimit,
        contactlessLimit: limits.contactlessLimit,
        updatedAt: new Date(),
      },
      create: {
        cardId,
        dailyLimit: limits.dailyLimit,
        atmLimit: limits.atmLimit,
        onlineLimit: limits.onlineLimit,
        contactlessLimit: limits.contactlessLimit,
      },
    });
  }

  async createCard(data: {
    accountId: string;
    cardNumber: string;
    cardType: string;
    expiry: string;
    cvvHash: string;
    status?: 'ACTIVE' | 'FROZEN' | 'BLOCKED' | 'EXPIRED';
    onlineEnabled?: boolean;
    internationalEnabled?: boolean;
  }) {
    return prisma.card.create({
      data,
      include: {
        limits: true,
        account: {
          include: {
            customer: true,
          },
        },
      },
    });
  }

  async deleteCard(id: string) {
    return prisma.card.delete({
      where: { id },
    });
  }

  async findAccountById(accountId: string) {
    return prisma.account.findUnique({
      where: { id: accountId },
      include: {
        customer: true,
      },
    });
  }

  async createCardRequest(data: {
    customerId: string;
    accountId: string;
    cardType: string;
  }) {
    return prisma.cardRequest.create({
      data,
    });
  }

  async findCardRequestById(id: string) {
    return prisma.cardRequest.findUnique({
      where: { id },
      include: {
        account: true,
        customer: true,
      },
    });
  }

  async findCardRequests(filters: { status?: CardRequestStatus; page: number; limit: number }) {
    const skip = (filters.page - 1) * filters.limit;
    const where = filters.status ? { status: filters.status } : {};
    const [total, items] = await Promise.all([
      prisma.cardRequest.count({ where }),
      prisma.cardRequest.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          account: true,
          customer: {
            include: {
              user: {
                select: { email: true },
              },
            },
          },
        },
      }),
    ]);
    return { total, items };
  }

  async updateCardRequestStatus(id: string, status: CardRequestStatus, reviewedBy: string, rejectionReason?: string) {
    return prisma.cardRequest.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy,
        ...(rejectionReason ? { rejectionReason } : {}),
      },
    });
  }
}
