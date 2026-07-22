import { AdminRepository } from '../repositories/admin.repository';
import { NotFoundException } from 'shared-common';
import { prisma } from '../config/database';

export class CustomerService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async searchCustomers(filters: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    kyc?: string;
  }) {
    const { total, items } = await this.adminRepository.searchCustomers(filters);

    const data = items.map((c) => ({
      customerId: c.id,
      name: `${c.firstName} ${c.lastName}`,
      email: c.user.email,
      status: c.user.status,
      kycStatus: c.kycStatus,
    }));

    return { total, data };
  }

  async freezeCustomer(adminUserId: string, customerId: string, reason: string) {
    const customer = await this.adminRepository.findCustomerById(customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await prisma.$transaction(async (tx) => {
      // Freeze all accounts owned by this customer
      await tx.account.updateMany({
        where: { customerId },
        data: {
          status: 'FROZEN',
        },
      });

      // Update User status to SUSPENDED as well
      await tx.user.update({
        where: { id: customer.userId },
        data: {
          status: 'SUSPENDED',
        },
      });

      // Create Admin Audit Log
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'FREEZE_ACCOUNT',
          module: 'CUSTOMERS',
        },
      });

      // Create Notification for the customer
      await tx.notification.create({
        data: {
          userId: customer.userId,
          title: 'Accounts Frozen',
          message: `Your accounts have been suspended due to: ${reason}`,
        },
      });
    });
  }
}
