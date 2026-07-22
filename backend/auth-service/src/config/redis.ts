import { createClient } from 'redis';
import { logger } from 'shared-common';

let redisClient: any;

if (process.env.NODE_ENV === 'test') {
  // In-memory mock store
  const store = new Map<string, string>();
  redisClient = {
    connect: async () => {},
    get: async (key: string) => store.get(key) || null,
    set: async (key: string, value: string, options?: any) => {
      store.set(key, value);
      return 'OK';
    },
    del: async (key: string) => {
      const deleted = store.has(key);
      store.delete(key);
      return deleted ? 1 : 0;
    },
    incr: async (key: string) => {
      const val = Number(store.get(key) || 0) + 1;
      store.set(key, String(val));
      return val;
    },
    expire: async (key: string, seconds: number) => 1,
    quit: async () => {},
  };
} else {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  // Throttle error logging — the client retries automatically; logging every attempt floods the console.
  let lastRedisErrorLog = 0;
  redisClient.on('error', (err: any) => {
    const now = Date.now();
    if (now - lastRedisErrorLog > 30_000) {
      lastRedisErrorLog = now;
      logger.error('Redis Client Error (will keep retrying)', { code: err.code, message: err.message });
    }
  });

  redisClient.connect().catch((err: any) =>
    logger.error('Redis initial connection failed', { code: err.code, message: err.message })
  );
}

export const redis = redisClient;
export default redis;
