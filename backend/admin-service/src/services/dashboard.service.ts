import { AdminRepository } from '../repositories/admin.repository';
import { redis } from '../config/redis';

export class DashboardService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async getDashboardSummary() {
    const cacheKey = 'admin:dashboard';
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const counts = await this.adminRepository.getDashboardCounts();
    await redis.set(cacheKey, JSON.stringify(counts), { EX: 60 });
    return counts;
  }

  async getTransactions(filters: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    from?: string;
    to?: string;
  }) {
    return this.adminRepository.findAllTransactions({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      status: filters.status,
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
    });
  }

  async getFraudAlerts() {
    const notifications = await this.adminRepository.findSecurityNotifications();
    return notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      user: n.user?.email || 'Unknown',
      type: n.title,
      trigger: n.message,
      risk: 'Medium',
      status: n.isRead ? 'Resolved' : 'Pending',
      time: n.createdAt.toISOString(),
      notificationId: n.id,
    }));
  }
}
