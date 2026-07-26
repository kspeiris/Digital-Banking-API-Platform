import { NotificationRepository } from '../repositories/notification.repository';
import { NotFoundException, ForbiddenException, BadRequestException } from 'shared-common';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  getCategory(title: string, message: string): string {
    const t = title.toUpperCase();
    const m = message.toUpperCase();
    if (t.includes('LOGIN') || m.includes('LOGIN')) return 'LOGIN';
    if (
      t.includes('TRANSFER') ||
      m.includes('TRANSFER') ||
      t.includes('PAYMENT') ||
      m.includes('PAYMENT') ||
      t.includes('RECEIVED') ||
      m.includes('RECEIVED') ||
      t.includes('SENT') ||
      m.includes('SENT') ||
      t.includes('FUND') ||
      m.includes('FUND') ||
      t.includes('WIRE') ||
      m.includes('WIRE') ||
      t.includes('WIRED') ||
      m.includes('WIRED') ||
      t.includes('BENEFICIARY') ||
      m.includes('BENEFICIARY') ||
      t.includes('REMITTANCE') ||
      m.includes('REMITTANCE') ||
      t.includes('DEPOSIT') ||
      m.includes('DEPOSIT')
    ) {
      return 'TRANSFER';
    }
    if (
      t.includes('CARD') ||
      m.includes('CARD') ||
      t.includes('PIN') ||
      m.includes('PIN') ||
      t.includes('LIMIT') ||
      m.includes('LIMIT') ||
      t.includes('LIMITS') ||
      m.includes('LIMITS') ||
      t.includes('FROZEN') ||
      m.includes('FROZEN') ||
      t.includes('UNFROZEN') ||
      m.includes('UNFROZEN') ||
      t.includes('FREEZE') ||
      m.includes('FREEZE') ||
      t.includes('DEBIT') ||
      m.includes('DEBIT') ||
      t.includes('CREDIT') ||
      m.includes('CREDIT') ||
      t.includes('VISA') ||
      m.includes('VISA') ||
      t.includes('MASTERCARD') ||
      m.includes('MASTERCARD') ||
      t.includes('CVV') ||
      m.includes('CVV')
    ) {
      return 'CARD';
    }
    if (
      t.includes('LOAN') ||
      m.includes('LOAN') ||
      t.includes('MORTGAGE') ||
      m.includes('MORTGAGE') ||
      t.includes('DEBT') ||
      m.includes('DEBT') ||
      t.includes('REPAYMENT') ||
      m.includes('REPAYMENT') ||
      t.includes('INTEREST') ||
      m.includes('INTEREST') ||
      t.includes('PRINCIPAL') ||
      m.includes('PRINCIPAL')
    ) {
      return 'LOAN';
    }
    if (
      t.includes('SECURITY') ||
      m.includes('SECURITY') ||
      t.includes('PASSWORD') ||
      m.includes('PASSWORD') ||
      t.includes('OTP') ||
      m.includes('OTP') ||
      t.includes('MFA') ||
      m.includes('MFA') ||
      t.includes('2FA') ||
      m.includes('2FA') ||
      t.includes('RESET') ||
      m.includes('RESET') ||
      t.includes('AUTH') ||
      m.includes('AUTH') ||
      t.includes('CREDENTIALS') ||
      m.includes('CREDENTIALS') ||
      t.includes('PASSCODE') ||
      m.includes('PASSCODE')
    ) {
      return 'SECURITY';
    }
    if (
      t.includes('PROMO') ||
      m.includes('PROMO') ||
      t.includes('OFFER') ||
      m.includes('OFFER') ||
      t.includes('CASHBACK') ||
      m.includes('CASHBACK') ||
      t.includes('BONUS') ||
      m.includes('BONUS') ||
      t.includes('DISCOUNT') ||
      m.includes('DISCOUNT') ||
      t.includes('REWARD') ||
      m.includes('REWARD') ||
      t.includes('REWARDS') ||
      m.includes('REWARDS')
    ) {
      return 'PROMOTION';
    }
    if (
      t.includes('SYSTEM') ||
      m.includes('SYSTEM') ||
      t.includes('MAINTENANCE') ||
      m.includes('MAINTENANCE') ||
      t.includes('ANNOUNCEMENT') ||
      m.includes('ANNOUNCEMENT') ||
      t.includes('BROADCAST') ||
      m.includes('BROADCAST')
    ) {
      return 'SYSTEM';
    }
    return 'SYSTEM';
  }

  async getNotifications(
    userId: string,
    filters: {
      page: number;
      limit: number;
      type?: string;
      category?: string;
      read?: boolean;
    }
  ) {
    const version = await redis.get(`notifications:version:${userId}`) || '0';
    const cacheKey = `notifications:user:${userId}:v${version}:${filters.page}:${filters.limit}:${filters.type || ''}:${filters.category || ''}:${filters.read === undefined ? '' : filters.read}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const { total, items } = await this.notificationRepository.findNotifications(
      userId,
      filters
    );

    const data = items.map((item) => ({
      notificationId: item.id,
      title: item.title,
      message: item.message,
      type: item.type,
      category: this.getCategory(item.title, item.message),
      read: item.isRead,
      createdAt: item.createdAt.toISOString(),
    }));

    const result = {
      total,
      page: filters.page,
      limit: filters.limit,
      data,
    };

    await redis.set(cacheKey, JSON.stringify(result), { EX: 120 }); // 2 minutes cache
    return result;
  }

  async markAsRead(userId: string, ids: string[]) {
    await this.notificationRepository.markAsRead(userId, ids);
    await redis.incr(`notifications:version:${userId}`);
  }

  async deleteNotification(userId: string, id: string) {
    const notification = await this.notificationRepository.findNotificationById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this notification');
    }

    await prisma.$transaction(async (tx) => {
      await tx.notification.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'NOTIFICATION_DELETE',
          module: 'NOTIFICATION',
        },
      });
    });

    await redis.incr(`notifications:version:${userId}`);
  }

  async createNotification(userId: string, data: { title: string; message: string; type: string }) {
    const category = this.getCategory(data.title, data.message);
    await prisma.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        type: data.type as NotificationType,
        isRead: false,
      },
    });

    await redis.incr(`notifications:version:${userId}`);
  }

  async broadcastNotifications(adminId: string, data: { title: string; message: string; type: string; targetRole: string }) {
    const category = this.getCategory(data.title, data.message);
    
    let userIds: string[] = [];
    if (data.targetRole === 'ALL') {
      const users = await prisma.user.findMany({ select: { id: true } });
      userIds = users.map(u => u.id);
    } else {
      const role = await prisma.role.findUnique({ where: { name: data.targetRole } });
      if (!role) {
        throw new BadRequestException('Invalid target role');
      }
      const users = await prisma.user.findMany({
        where: { roleId: role.id },
        select: { id: true },
      });
      userIds = users.map(u => u.id);
    }

    await prisma.$transaction(async (tx) => {
      await tx.notification.createMany({
        data: userIds.map(userId => ({
          userId,
          title: data.title,
          message: data.message,
          type: data.type as NotificationType,
          isRead: false,
        })),
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'NOTIFICATION_BROADCAST',
          module: 'NOTIFICATION',
        },
      });
    });

    return { success: true, sentCount: userIds.length };
  }
}
