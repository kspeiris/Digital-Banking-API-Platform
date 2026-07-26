import { prisma } from '../config/database';

export class AnalyticsService {
  async getAnalyticsSummary(userId: string) {
    const [totalTransactions, successTransactions, failedTransactions] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'SUCCESS' } }),
      prisma.transaction.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      totalRequests: totalTransactions,
      successfulRequests: successTransactions,
      failedRequests: failedTransactions,
      averageResponseTime: '0ms',
    };
  }
}
