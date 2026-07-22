import { NotificationRepository } from '../repositories/notification.repository';
import { NotFoundException, ForbiddenException } from 'shared-common';
import { prisma } from '../config/database';
import { redis } from '../config/redis';

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
      m.includes('SENT')
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
      t.includes('FROZEN') ||
      m.includes('FROZEN') ||
      t.includes('UNFROZEN') ||
      m.includes('UNFROZEN')
    ) {
      return 'CARD';
    }
    if (t.includes('LOAN') || m.includes('LOAN')) return 'LOAN';
    if (
      t.includes('SECURITY') ||
      m.includes('SECURITY') ||
      t.includes('PASSWORD') ||
      m.includes('PASSWORD') ||
      t.includes('OTP') ||
      m.includes('OTP')
    ) {
      return 'SECURITY';
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

      // Audit Log
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
}
