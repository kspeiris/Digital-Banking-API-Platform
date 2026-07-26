import { AdminRepository } from '../repositories/admin.repository';
import { NotFoundException, BadRequestException } from 'shared-common';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { UserStatus } from '@prisma/client';

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
      userId: c.userId,
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
      await tx.account.updateMany({
        where: { customerId },
        data: {
          status: 'FROZEN',
        },
      });

      await tx.user.update({
        where: { id: customer.userId },
        data: {
          status: 'SUSPENDED',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'FREEZE_ACCOUNT',
          module: 'CUSTOMERS',
        },
      });

      await tx.notification.create({
        data: {
          userId: customer.userId,
          title: 'Accounts Frozen',
          message: `Your accounts have been suspended due to: ${reason}`,
        },
      });
    });
  }

  async freezeCustomerByUserId(adminUserId: string, userId: string, reason: string) {
    const customer = await this.adminRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found for user');
    }

    await this.freezeCustomer(adminUserId, customer.id, reason);
  }

  async unfreezeCustomerByUserId(adminUserId: string, userId: string, reason?: string) {
    const customer = await this.adminRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found for user');
    }

    await prisma.$transaction(async (tx) => {
      await tx.account.updateMany({
        where: { customerId: customer.id },
        data: {
          status: 'ACTIVE',
        },
      });

      await tx.user.update({
        where: { id: customer.userId },
        data: {
          status: 'ACTIVE',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'UNFREEZE_ACCOUNT',
          module: 'CUSTOMERS',
        },
      });

      await tx.notification.create({
        data: {
          userId: customer.userId,
          title: 'Accounts Unfrozen',
          message: `Your accounts have been reactivated.${reason ? ` Reason: ${reason}` : ''}`,
        },
      });
    });
  }

  async deleteCustomer(adminUserId: string, customerId: string) {
    const customer = await this.adminRepository.findCustomerById(customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.loan.deleteMany({
        where: { customerId },
      });

      await tx.beneficiary.deleteMany({
        where: { customerId },
      });

      const accounts = await tx.account.findMany({
        where: { customerId },
        select: { id: true },
      });

      const cards = await tx.card.findMany({
        where: { accountId: { in: accounts.map(a => a.id) } },
        select: { id: true },
      });

      for (const account of accounts) {
        await tx.card.deleteMany({
          where: { accountId: account.id },
        });
      }

      await tx.cardLimit.deleteMany({
        where: { cardId: { in: cards.map(c => c.id) } },
      });

      await tx.transaction.deleteMany({
        where: {
          OR: [
            { fromAccountId: { in: accounts.map(a => a.id) } },
            { toAccountId: { in: accounts.map(a => a.id) } },
          ],
        },
      });

      await tx.scheduledTransfer.deleteMany({
        where: { fromAccount: { in: accounts.map(a => a.id) } },
      });

      await tx.account.deleteMany({
        where: { customerId },
      });

      await tx.customer.delete({
        where: { id: customerId },
      });

      await tx.user.delete({
        where: { id: customer.userId },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'DELETE_CUSTOMER',
          module: 'CUSTOMERS',
        },
      });
    });
  }

  async createCustomer(adminUserId: string, data: any) {
    const existingUser = await this.adminRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: { nic: data.nic },
    });
    if (existingCustomer) {
      throw new BadRequestException('NIC already registered');
    }

    const role = await this.adminRepository.findCustomerRole();
    if (!role) {
      throw new BadRequestException('Customer role not configured');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await this.adminRepository.createUser({
        email: data.email,
        passwordHash: hashedPassword,
        roleId: role.id,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      });

      const customer = await this.adminRepository.createCustomer({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        nic: data.nic,
        dob: new Date(data.dateOfBirth),
        phone: data.phone,
        address: data.address || 'Not Provided',
        city: data.city || 'Colombo',
        country: data.country || 'Sri Lanka',
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'CREATE_CUSTOMER',
          module: 'CUSTOMERS',
        },
      });

      return {
        customerId: customer.id,
        userId: user.id,
        email: user.email,
        name: `${data.firstName} ${data.lastName}`,
      };
    });

    return result;
  }
}
