import { CardRepository } from '../repositories/card.repository';
import { PinService } from './pin.service';
import { NotFoundException, ForbiddenException, BadRequestException } from 'shared-common';
import { CardStatus, CardRequestStatus } from '@prisma/client';
import { prisma } from '../config/database';

export class CardService {
  private cardRepository: CardRepository;
  private pinService: PinService;

  constructor() {
    this.cardRepository = new CardRepository();
    this.pinService = new PinService();
  }

  async getCardsForUser(userId: string, role: string) {
    if (role?.toUpperCase() === 'ADMIN') {
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

  public mapCardResponse(c: any) {
    return {
      id: c.id,
      cardId: c.id,
      cardType: c.cardType.toUpperCase(),
      cardNetwork: c.cardNumber.startsWith('4') ? 'VISA' : 'MASTERCARD',
      cardNumber: c.cardNumber,
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
      account: c.account
        ? {
            id: c.account.id,
            accountNumber: c.account.accountNumber,
            accountType: c.account.accountType,
            customer: c.account.customer
              ? {
                  firstName: c.account.customer.firstName,
                  lastName: c.account.customer.lastName,
                  nic: c.account.customer.nic,
                }
              : null,
          }
        : null,
    };
  }

  async verifyCardAccess(cardId: string, userId: string, role: string) {
    const card = await this.cardRepository.findCardById(cardId);
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (role?.toUpperCase() !== 'ADMIN') {
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

    const isPinCorrect = await this.pinService.comparePin(currentPin, card.cvvHash);
    if (!isPinCorrect) {
      throw new BadRequestException('Current PIN is incorrect');
    }

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

  async createCard(data: {
    accountId: string;
    cardNumber: string;
    cardType: string;
    expiry: string;
    pin: string;
    onlineEnabled?: boolean;
    internationalEnabled?: boolean;
  }) {
    const account = await this.cardRepository.findAccountById(data.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const hashedPin = await this.pinService.hashPin(data.pin);

    const card = await this.cardRepository.createCard({
      accountId: data.accountId,
      cardNumber: data.cardNumber,
      cardType: data.cardType,
      expiry: data.expiry,
      cvvHash: hashedPin,
      status: 'ACTIVE' as any,
      onlineEnabled: data.onlineEnabled ?? true,
      internationalEnabled: data.internationalEnabled ?? false,
    });

    await prisma.cardLimit.create({
      data: {
        cardId: card.id,
      },
    });

    const customerUserId = account.customer?.userId;
    if (customerUserId) {
      await prisma.notification.create({
        data: {
          userId: customerUserId,
          title: 'New Card Issued',
          message: `A new ${data.cardType.toUpperCase()} card ending in ${data.cardNumber.slice(-4)} has been issued for your account.`,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: customerUserId,
          action: 'CARD_CREATED',
          module: 'CARD',
        },
      });
    }

    return card;
  }

  async deleteCard(cardId: string) {
    const card = await this.cardRepository.findCardById(cardId);
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.status === 'ACTIVE') {
      throw new BadRequestException('Cannot delete an active card. Please freeze or block it first.');
    }

    await this.cardRepository.deleteCard(cardId);
  }

  async requestCard(userId: string, accountId: string) {
    const customer = await this.cardRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const account = await this.cardRepository.findAccountById(accountId);
    if (!account || account.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this account');
    }

    const existingActiveCard = await prisma.card.findFirst({
      where: {
        accountId,
        status: 'ACTIVE',
      },
    });

    if (existingActiveCard) {
      throw new BadRequestException('This account already has an active card');
    }

    const existingPendingRequest = await prisma.cardRequest.findFirst({
      where: {
        customerId: customer.id,
        accountId,
        status: 'PENDING',
      },
    });

    if (existingPendingRequest) {
      throw new BadRequestException('You already have a pending card request for this account');
    }

    await this.cardRepository.createCardRequest({
      customerId: customer.id,
      accountId,
      cardType: 'DEBIT',
    });

    await prisma.notification.create({
      data: {
        userId: customer.userId,
        title: 'Card Request Received',
        message: 'Your card request has been received. An admin will review and issue your card shortly.',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: customer.userId,
        action: 'CARD_REQUEST_SUBMIT',
        module: 'CARD',
      },
    });

    return {
      success: true,
      message: 'Card request submitted successfully. Please wait for admin approval.',
    };
  }

  async getCardRequests(userId: string, status?: CardRequestStatus) {
    const customer = await this.cardRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const where: any = { customerId: customer.id };
    if (status) where.status = status;

    const requests = await prisma.cardRequest.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true,
          },
        },
      },
    });

    return requests;
  }

  async approveCardRequest(requestId: string, adminUserId: string) {
    const request = await this.cardRepository.findCardRequestById(requestId);
    if (!request) {
      throw new NotFoundException('Card request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('This request has already been processed');
    }

    const pinService = this.pinService;
    const pinHash = await pinService.hashPin('1234');

    const cardNumber = `400000000000${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    await prisma.$transaction(async (tx) => {
      const card = await tx.card.create({
        data: {
          accountId: request.accountId,
          cardNumber,
          cardType: request.cardType,
          expiry: `${String(new Date().getFullYear() + 3).slice(-2)}12`,
          cvvHash: pinHash,
          status: 'ACTIVE',
        },
        include: {
          limits: true,
        },
      });

      await tx.cardLimit.create({
        data: {
          cardId: card.id,
        },
      });

      await tx.cardRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: adminUserId,
        },
      });

      await tx.notification.create({
        data: {
          userId: request.customer.userId,
          title: 'Card Approved',
          message: `Your card request for account ${request.account.accountNumber} has been approved. Card ending in ${card.cardNumber.slice(-4)} has been issued.`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'CARD_REQUEST_APPROVE',
          module: 'CARD',
        },
      });
    });

    return { success: true, message: 'Card request approved and card issued' };
  }

  async rejectCardRequest(requestId: string, adminUserId: string, reason: string) {
    const request = await this.cardRepository.findCardRequestById(requestId);
    if (!request) {
      throw new NotFoundException('Card request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('This request has already been processed');
    }

    await prisma.cardRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminUserId,
        rejectionReason: reason,
      },
    });

    await prisma.notification.create({
      data: {
        userId: request.customer.userId,
        title: 'Card Request Rejected',
        message: `Your card request for account ${request.account.accountNumber} has been rejected. Reason: ${reason}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'CARD_REQUEST_REJECT',
        module: 'CARD',
      },
    });

    return { success: true, message: 'Card request rejected' };
  }

  async getAllCardRequests(status?: CardRequestStatus, page = 1, limit = 20) {
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      prisma.cardRequest.count({ where }),
      prisma.cardRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          account: {
            select: {
              accountNumber: true,
              accountType: true,
            },
          },
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
}
