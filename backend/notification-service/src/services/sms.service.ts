import { logger } from 'shared-common';

export class SMSService {
  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      logger.info(`[SMS GATEWAY] Sending SMS to ${to}: "${message}"`);
      return true;
    } catch (err) {
      logger.error(`[SMS GATEWAY] Failed to send SMS to ${to}:`, err);
      return false;
    }
  }
}
