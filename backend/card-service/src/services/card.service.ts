import { CardRepository } from '../repositories/card.repository';
import { PinService } from './pin.service';
import { NotFoundException, ForbiddenException, BadRequestException } from 'shared-common';
import { CardStatus } from '@prisma/client';
import { prisma } from '../config/database';

export class CardService {
  private cardRepository: CardRepository;
  private pinService: PinService;

  constructor() {
    this.cardRepository = new CardRepository();
    this.pinService = new PinService();
  }

  async getCardsForUser(userId: string, role: string) {
    if (role === 'ADMIN') {
      const cards = await this.cardRepository.findAllCards();
      return cards.map((c) => this.mapCardResponse(c));
    }

    const customer = await this.cardRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const cards = await this.cardRepository.findCardsByCustomerId(customer.id);
    return cards.map((c) => this.mapCardResponse(c));
  }

  private mapCardResponse(c: any) {
    return {
      cardId: c.id,
      cardType: c.cardType.toUpperCase(),
      cardNetwork: c.cardNumber.startsWith('4') ? 'VISA' : 'MASTERCARD',
      maskedNumber: `**** **** **** ${c.cardNumber.slice(-4)}`,
      expiry: c.expiry,
      status: c.status,
      onlinePayments: c.onlineEnabled,
      internationalUsage: c.internationalEnabled,
      limits: c.limits
        ? {
            dailyLimit: Number(c.limits.dailyLimit),
            atmLimit: Number(c.limits.atmLimit),
            onlineLimit: Number(c.limits.onlineLimit),
            contactlessLimit: Number(c.limits.contactlessLimit),
          }
        : null,
    };
  }

  async verifyCardAccess(cardId: string, userId: string, role: string) {
    const card = await this.cardRepository.findCardById(cardId);
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (role !== 'ADMIN') {
      const customer = await this.cardRepository.findCustomerByUserId(userId);
      if (!customer || card.account.customerId !== customer.id) {
        throw new ForbiddenException('You do not have permission to access this card');
      }
    }

    return card;
  }

  async freezeCard(cardId: string, userId: string, role: string, reason?: string) {
    const card = await this.verifyCardAccess(cardId, userId, role);
    if (card.status === CardStatus.FROZEN) {
      throw new BadRequestException('Card is already frozen');
    }
    if (card.status === CardStatus.BLOCKED || card.status === CardStatus.EXPIRED) {
      throw new BadRequestException('Cannot freeze a blocked or expired card');
    }

    await prisma.$transaction(async (tx) => {
      await tx.card.update({
        where: { id: cardId },
        data: { status: CardStatus.FROZEN },
      });

      const customerUserId = card.account?.customer?.userId;
      if (customerUserId) {
        await tx.notification.create({
          data: {
            userId: customerUserId,
            title: 'Card Frozen',
            message: `Your card ending in ${card.cardNumber.slice(-4)} has been frozen. Reason: ${reason || 'User requested'}.`,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: customerUserId,
            action: 'CARD_FREEZE',
            module: 'CARD',
          },
        });
      }
    });
  }

  async unfreezeCard(cardId: string, userId: string, role: string) {
    const card = await this.verifyCardAccess(cardId, userId, role);
    if (card.status !== CardStatus.FROZEN) {
      throw new BadRequestException('Card is not frozen');
    }

    await prisma.$transaction(async (tx) => {
      await tx.card.update({
        where: { id: cardId },
        data: { status: CardStatus.ACTIVE },
      });

      const customerUserId = card.account?.customer?.userId;
      if (customerUserId) {
        await tx.notification.create({
          data: {
            userId: customerUserId,
            title: 'Card Unfrozen',
            message: `Your card ending in ${card.cardNumber.slice(-4)} has been reactivated.`,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: customerUserId,
            action: 'CARD_UNFREEZE',
            module: 'CARD',
          },
        });
      }
    });
  }

  async updateSettings(
    cardId: string,
    userId: string,
    role: string,
    onlinePayments: boolean,
    internationalUsage: boolean
  ) {
    const card = await this.verifyCardAccess(cardId, userId, role);
    if (card.status === CardStatus.BLOCKED || card.status === CardStatus.EXPIRED) {
      throw new BadRequestException('Card is inactive');
    }

    await prisma.$transaction(async (tx) => {
      await tx.card.update({
        where: { id: cardId },
        data: {
          onlineEnabled: onlinePayments,
          internationalEnabled: internationalUsage,
        },
      });

      const customerUserId = card.account?.customer?.userId;
      if (customerUserId) {
        await tx.notification.create({
          data: {
            userId: customerUserId,
            title: 'Card Settings Updated',
            message: `Settings for card ending in ${card.cardNumber.slice(-4)} have been updated.`,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: customerUserId,
            action: 'CARD_SETTINGS_UPDATE',
            module: 'CARD',
          },
        });
      }
    });
  }

  async changePin(
    cardId: string,
    userId: string,
    role: string,
    currentPin: string,
    newPin: string
  ) {
    const card = await this.verifyCardAccess(cardId, userId, role);
    if (card.status === CardStatus.BLOCKED || card.status === CardStatus.EXPIRED) {
      throw new BadRequestException('Card is inactive');
    }

    // Verify current PIN (against cvvHash where PIN is stored)
    const isPinCorrect = await this.pinService.comparePin(currentPin, card.cvvHash);
    if (!isPinCorrect) {
      throw new BadRequestException('Current PIN is incorrect');
    }

    // Hash and update
    const hashedPin = await this.pinService.hashPin(newPin);

    await prisma.$transaction(async (tx) => {
      await tx.card.update({
        where: { id: cardId },
        data: { cvvHash: hashedPin },
      });

      const customerUserId = card.account?.customer?.userId;
      if (customerUserId) {
        await tx.notification.create({
          data: {
            userId: customerUserId,
            title: 'Card PIN Updated',
            message: `The security PIN for your card ending in ${card.cardNumber.slice(-4)} has been changed.`,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: customerUserId,
            action: 'CARD_PIN_CHANGE',
            module: 'CARD',
          },
        });
      }
    });
  }
}
