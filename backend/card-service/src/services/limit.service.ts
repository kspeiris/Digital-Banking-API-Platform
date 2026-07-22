import { CardRepository } from '../repositories/card.repository';
import { BadRequestException } from 'shared-common';
import { prisma } from '../config/database';

export class LimitService {
  private cardRepository: CardRepository;

  // Maximum allowed limits defined by bank
  private readonly MAX_DAILY = 1000000;
  private readonly MAX_ATM = 500000;
  private readonly MAX_ONLINE = 500000;
  private readonly MAX_CONTACTLESS = 50000;

  constructor() {
    this.cardRepository = new CardRepository();
  }

  async updateLimits(
    cardId: string,
    limits: {
      dailyLimit: number;
      atmLimit: number;
      onlineLimit: number;
      contactlessLimit: number;
    }
  ) {
    if (limits.dailyLimit > this.MAX_DAILY) {
      throw new BadRequestException('Requested limit exceeds the maximum allowed');
    }
    if (limits.atmLimit > this.MAX_ATM) {
      throw new BadRequestException('Requested limit exceeds the maximum allowed');
    }
    if (limits.onlineLimit > this.MAX_ONLINE) {
      throw new BadRequestException('Requested limit exceeds the maximum allowed');
    }
    if (limits.contactlessLimit > this.MAX_CONTACTLESS) {
      throw new BadRequestException('Requested limit exceeds the maximum allowed');
    }

    await prisma.$transaction(async (tx) => {
      await tx.cardLimit.upsert({
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

      const card = await tx.card.findUnique({
        where: { id: cardId },
        include: {
          account: {
            include: {
              customer: true,
            },
          },
        },
      });

      if (card) {
        // Create Notification
        await tx.notification.create({
          data: {
            userId: card.account.customer.userId,
            title: 'Card Limits Updated',
            message: `Spending limits for card ending in ${card.cardNumber.slice(-4)} have been updated.`,
          },
        });

        // Create Audit Log
        await tx.auditLog.create({
          data: {
            userId: card.account.customer.userId,
            action: 'CARD_LIMITS_UPDATE',
            module: 'CARD',
          },
        });
      }
    });
  }
}
