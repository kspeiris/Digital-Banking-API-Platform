import { BeneficiaryRepository } from '../repositories/beneficiary.repository';
import { NotFoundException, ForbiddenException, BadRequestException } from 'shared-common';

export class BeneficiaryService {
  private beneficiaryRepository: BeneficiaryRepository;

  constructor() {
    this.beneficiaryRepository = new BeneficiaryRepository();
  }

  async getBeneficiariesForUser(userId: string) {
    const customer = await this.beneficiaryRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const beneficiaries = await this.beneficiaryRepository.findBeneficiariesByCustomerId(customer.id);
    return beneficiaries.map((b) => ({
      beneficiaryId: b.id,
      nickname: b.nickname,
      accountName: b.accountName,
      accountNumber: b.accountNumber,
      bankName: b.bankName,
      branch: b.branch,
      favorite: b.favorite,
    }));
  }

  async addBeneficiary(
    userId: string,
    data: {
      nickname: string;
      accountName: string;
      accountNumber: string;
      bankName: string;
      branch: string;
      favorite: boolean;
    }
  ) {
    const customer = await this.beneficiaryRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    // Check duplicate account number for this customer
    const existingAccount = await this.beneficiaryRepository.findBeneficiaryByAccount(
      customer.id,
      data.accountNumber
    );
    if (existingAccount) {
      throw new BadRequestException('Beneficiary already exists');
    }

    // Check duplicate nickname for this customer
    const existingNickname = await this.beneficiaryRepository.findBeneficiaryByNickname(
      customer.id,
      data.nickname
    );
    if (existingNickname) {
      throw new BadRequestException('Nickname already exists');
    }

    await this.beneficiaryRepository.createBeneficiary({
      customerId: customer.id,
      ...data,
    });
  }

  async updateBeneficiary(
    id: string,
    userId: string,
    data: {
      nickname?: string;
      branch?: string;
      favorite?: boolean;
    }
  ) {
    const customer = await this.beneficiaryRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const beneficiary = await this.beneficiaryRepository.findBeneficiaryById(id);
    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }

    if (beneficiary.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this beneficiary');
    }

    if (data.nickname) {
      const existingNickname = await this.beneficiaryRepository.findBeneficiaryByNickname(
        customer.id,
        data.nickname
      );
      if (existingNickname && existingNickname.id !== id) {
        throw new BadRequestException('Nickname already exists');
      }
    }

    await this.beneficiaryRepository.updateBeneficiary(id, data);
  }

  async deleteBeneficiary(id: string, userId: string) {
    const customer = await this.beneficiaryRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const beneficiary = await this.beneficiaryRepository.findBeneficiaryById(id);
    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }

    if (beneficiary.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this beneficiary');
    }

    await this.beneficiaryRepository.deleteBeneficiary(id);
  }
}
