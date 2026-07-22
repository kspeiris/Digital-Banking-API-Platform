import { prisma } from '../config/database';

export class DeveloperRepository {
  async findKeyByApplicationName(userId: string, applicationName: string) {
    return prisma.apiKey.findFirst({
      where: {
        userId,
        applicationName,
      },
    });
  }

  async createApiKey(data: {
    userId: string;
    applicationName: string;
    apiKey: string;
    secret: string;
    expiresAt?: Date;
  }) {
    return prisma.apiKey.create({
      data: {
        userId: data.userId,
        applicationName: data.applicationName,
        apiKey: data.apiKey,
        secret: data.secret,
        expiresAt: data.expiresAt,
        status: 'ACTIVE',
      },
    });
  }

  async findKeyByApiKey(userId: string, apiKey: string) {
    return prisma.apiKey.findFirst({
      where: {
        userId,
        apiKey,
      },
    });
  }

  async updateKeyStatus(id: string, status: string) {
    return prisma.apiKey.update({
      where: { id },
      data: { status },
    });
  }
}
