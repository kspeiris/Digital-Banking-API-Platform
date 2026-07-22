import { AdminRepository } from '../repositories/admin.repository';

export class AuditService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async getAuditHistory(page: number, limit: number) {
    const { total, items } = await this.adminRepository.getAuditLogs(page, limit);

    const data = items.map((log) => ({
      user: log.user ? log.user.email : 'system@bank.com',
      action: log.action,
      module: log.module,
      ip: log.ipAddress || '127.0.0.1',
      timestamp: log.createdAt.toISOString(),
    }));

    return { total, data };
  }
}
