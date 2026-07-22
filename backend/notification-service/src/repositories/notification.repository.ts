import { prisma } from '../config/database';

export class NotificationRepository {
  private getKeywordsForCategory(category: string): string[] {
    switch (category.toUpperCase()) {
      case 'LOGIN':
        return ['login'];
      case 'TRANSFER':
        return ['transfer', 'payment', 'received', 'sent'];
      case 'CARD':
        return ['card', 'pin', 'limit', 'frozen', 'unfrozen'];
      case 'LOAN':
        return ['loan'];
      case 'SECURITY':
        return ['security', 'password', 'otp'];
      case 'SYSTEM':
        return ['system', 'maintenance', 'announcement', 'broadcast'];
      default:
        return [];
    }
  }

  async findNotifications(
    userId: string,
    filters: {
      page: number;
      limit: number;
      type?: string;
      category?: string;
      read?: boolean;
    }
  ) {
    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type.toUpperCase();
    }

    if (filters.read !== undefined) {
      where.isRead = filters.read;
    }

    if (filters.category) {
      const keywords = this.getKeywordsForCategory(filters.category);
      if (keywords.length > 0) {
        where.OR = [
          ...keywords.map((kw) => ({ title: { contains: kw, mode: 'insensitive' as const } })),
          ...keywords.map((kw) => ({ message: { contains: kw, mode: 'insensitive' as const } })),
        ];
      }
    }

    const skip = (filters.page - 1) * filters.limit;

    const [total, items] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return { total, items };
  }

  async findNotificationById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async markAsRead(userId: string, ids: string[]) {
    return prisma.notification.updateMany({
      where: {
        userId,
        id: { in: ids },
      },
      data: {
        isRead: true,
      },
    });
  }

  async deleteNotification(userId: string, id: string) {
    return prisma.notification.delete({
      where: {
        id,
        userId,
      },
    });
  }
}
