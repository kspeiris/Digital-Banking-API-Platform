import { DeveloperRepository } from '../repositories/developer.repository';
import { ApiKeyService } from './apiKey.service';
import { BadRequestException, NotFoundException } from 'shared-common';
import { prisma } from '../config/database';

export class DeveloperService {
  private developerRepository: DeveloperRepository;
  private apiKeyService: ApiKeyService;

  constructor() {
    this.developerRepository = new DeveloperRepository();
    this.apiKeyService = new ApiKeyService();
  }

  async getApis() {
    return [
      { name: 'Authentication API', version: 'v1', status: 'Published' },
      { name: 'Account API', version: 'v1', status: 'Published' },
      { name: 'Beneficiary API', version: 'v1', status: 'Published' },
      { name: 'Transaction API', version: 'v1', status: 'Published' },
      { name: 'Card API', version: 'v1', status: 'Published' },
      { name: 'Loan API', version: 'v1', status: 'Published' },
      { name: 'Notification API', version: 'v1', status: 'Published' },
      { name: 'Admin API', version: 'v1', status: 'Published' },
    ];
  }

  async generateApiKey(userId: string, applicationName: string) {
    const existing = await this.developerRepository.findKeyByApplicationName(
      userId,
      applicationName
    );
    if (existing) {
      throw new BadRequestException('Application already exists');
    }

    const { apiKey, secret } = this.apiKeyService.generateKeyPair();
    const hashedSecret = await this.apiKeyService.hashSecret(secret);

    await prisma.$transaction(async (tx) => {
      await tx.apiKey.create({
        data: {
          userId,
          applicationName,
          apiKey,
          secret: hashedSecret,
          status: 'ACTIVE',
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'API_KEY_GENERATE',
          module: 'DEVELOPER',
        },
      });
    });

    return {
      success: true,
      apiKey,
      secret,
    };
  }

  async revokeApiKey(userId: string, apiKey: string) {
    const key = await this.developerRepository.findKeyByApiKey(userId, apiKey);
    if (!key) {
      throw new NotFoundException('API key not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.apiKey.update({
        where: { id: key.id },
        data: {
          status: 'REVOKED',
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'API_KEY_REVOKE',
          module: 'DEVELOPER',
        },
      });
    });
  }
}
