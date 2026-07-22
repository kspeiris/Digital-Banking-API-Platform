import { CustomerRepository } from '../repositories/customer.repository';
import { NotFoundException, logger } from 'shared-common';

export class KycService {
  private customerRepository = new CustomerRepository();

  async submitKyc(userId: string, occupation: string, files: any) {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    logger.info(`KYC files received for customer ${customer.id}:`, files);

    // Save occupation and set status to PENDING/UNDER_REVIEW
    await this.customerRepository.updateKycStatus(userId, {
      occupation,
      kycStatus: 'PENDING',
    });
  }
}
export const kycService = new KycService();
