import { prisma } from '../config/database';
import { CardStatus } from '@prisma/client';

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
}
