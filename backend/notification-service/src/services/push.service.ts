import { logger } from 'shared-common';

export class PushService {
  async sendPush(toToken: string, title: string, body: string): Promise<boolean> {
    try {
      logger.info(`[FCM PUSH] Delivering Push Notification to device token "${toToken}": [${title}] ${body}`);
      return true;
    } catch (err) {
      logger.error(`[FCM PUSH] Failed to deliver push notification:`, err);
      return false;
    }
  }
}
