import { CustomerRepository } from '../repositories/customer.repository';
import { NotFoundException } from 'shared-common';
import { redis } from '../config/redis';

export class CustomerService {
  private customerRepository = new CustomerRepository();

  async getProfile(userId: string) {
    const cacheKey = `customer:profile:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const profile = {
      customerId: customer.id,
      userId: customer.userId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.user.email,
      phone: customer.phone,
      nic: customer.nic,
      dob: customer.dob,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      occupation: customer.occupation || '',
      profileImage: customer.profileImage || '',
      kycStatus: customer.kycStatus,
    };

    await redis.set(cacheKey, JSON.stringify(profile), { EX: 600 }); // Cache for 10 minutes
    return profile;
  }

  async updateProfile(userId: string, data: any) {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    await this.customerRepository.updateByUserId(userId, {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      occupation: data.occupation,
    });

    await redis.del(`customer:profile:${userId}`);
  }

  async updateProfileImage(userId: string, relativePath: string) {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    // Update avatar image path
    await this.customerRepository.updateByUserId(userId, {
      profileImage: relativePath,
    });

    await redis.del(`customer:profile:${userId}`);
    return relativePath;
  }

  async getCustomerById(id: string) {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return {
      customerId: customer.id,
      userId: customer.userId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.user.email,
      phone: customer.phone,
      nic: customer.nic,
      dob: customer.dob,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      occupation: customer.occupation || '',
      profileImage: customer.profileImage || '',
      kycStatus: customer.kycStatus,
    };
  }
}
export const customerService = new CustomerService();
