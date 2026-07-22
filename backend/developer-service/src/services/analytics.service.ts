export class AnalyticsService {
  async getAnalyticsSummary(userId: string) {
    return {
      totalRequests: 150240,
      successfulRequests: 148520,
      failedRequests: 1720,
      averageResponseTime: '124ms',
    };
  }
}
