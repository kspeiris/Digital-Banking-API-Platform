import { logger } from 'shared-common';

// Simple mock Redis client structure to support future Redis caching integration (Phase 13)
// without breaking the present compilation.
export const redisClient = {
  get: async (key: string): Promise<string | null> => {
    logger.debug(`Redis GET mock for key: ${key}`);
    return null;
  },
  set: async (key: string, value: string, expirySeconds?: number): Promise<void> => {
    logger.debug(`Redis SET mock for key: ${key} (expiry: ${expirySeconds}s)`);
  },
  del: async (key: string): Promise<void> => {
    logger.debug(`Redis DEL mock for key: ${key}`);
  },
  connect: async (): Promise<void> => {
    logger.info('Connected to Mock Redis Cache Client');
  }
};
