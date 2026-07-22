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
    await redis.set(cacheKey, JSON.stringify(counts), { EX: 60 }); // Cache for 1 minute
    return counts;
  }
}
