import { prisma } from '../config/database';
import { UserStatus } from '@prisma/client';

export class UserRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findCustomerByNic(nic: string) {
    return prisma.customer.findUnique({
      where: { nic },
    });
  }

  async findRoleByName(name: string) {
    return prisma.role.findUnique({
      where: { name },
    });
  }

  async createCustomerUser(data: {
    email: string;
    passwordHash: string;
    roleId: string;
    firstName: string;
    lastName: string;
    nic: string;
    dob: Date;
    phone: string;
    address: string;
    city: string;
    country: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        roleId: data.roleId,
        status: UserStatus.ACTIVE,
        emailVerified: false,
        customer: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            nic: data.nic,
            dob: data.dob,
            phone: data.phone,
            address: data.address,
            city: data.city,
            country: data.country,
            kycStatus: 'PENDING',
          },
        },
      },
      include: {
        customer: true,
      },
    });
  }

  async updateUserVerification(userId: string, verified: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: verified },
    });
  }

  async updateUserPassword(email: string, passwordHash: string) {
    return prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
  }

  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        customer: true,
      },
    });
  }
}
