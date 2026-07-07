import { createClient } from 'redis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { env } from './env';
import { logger } from '../common/logger';

let standardClient: any = null;
let upstashClient: UpstashRedis | null = null;
let useUpstash = false;

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  upstashClient = new UpstashRedis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN
  });
  useUpstash = true;
  logger.info('✓ Using Upstash Redis REST Client for caching and sessions');
} else {
  try {
    standardClient = createClient({
      url: env.REDIS_URL
    });
    
    standardClient.on('error', (err: any) => {
      logger.error({ err }, 'Redis connection error');
    });

    standardClient.on('connect', () => {
      logger.info('Connecting to Redis...');
    });

    standardClient.on('ready', () => {
      logger.info('✓ Redis client ready and connected');
    });
  } catch (err) {
    logger.error({ err }, 'Failed to create Redis client instance. Verify REDIS_URL.');
  }
}

export const redisClient = {
  get isOpen() {
    return useUpstash ? true : (standardClient ? standardClient.isOpen : false);
  },

  get isUpstash() {
    return useUpstash;
  },

  async connect(): Promise<void> {
    if (useUpstash) return;
    if (standardClient && !standardClient.isOpen) {
      try {
        await standardClient.connect();
      } catch (err) {
        logger.error({ err }, 'Failed to connect to Redis');
      }
    }
  },

  async disconnect(): Promise<void> {
    if (useUpstash) return;
    if (standardClient && standardClient.isOpen) {
      await standardClient.disconnect();
      logger.info('Redis client disconnected');
    }
  },

  async get(key: string): Promise<string | null> {
    if (useUpstash && upstashClient) {
      const val = await upstashClient.get(key);
      if (val === null || val === undefined) return null;
      return typeof val === 'object' ? JSON.stringify(val) : String(val);
    }
    return standardClient.get(key);
  },

  async setEx(key: string, ttlSeconds: number, value: string): Promise<string | null> {
    if (useUpstash && upstashClient) {
      const result = await upstashClient.set(key, value, { ex: ttlSeconds });
      return result === 'OK' ? 'OK' : String(result);
    }
    return standardClient.setEx(key, ttlSeconds, value);
  },

  async del(key: string | string[]): Promise<number> {
    if (useUpstash && upstashClient) {
      if (Array.isArray(key)) {
        return upstashClient.del(...key);
      }
      return upstashClient.del(key);
    }
    return standardClient.del(key);
  },

  async sAdd(key: string, value: string): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.sadd(key, value);
    }
    return standardClient.sAdd(key, value);
  },

  async sMembers(key: string): Promise<string[]> {
    if (useUpstash && upstashClient) {
      const list = await upstashClient.smembers(key);
      return list.map((item: any) => typeof item === 'object' ? JSON.stringify(item) : String(item));
    }
    return standardClient.sMembers(key);
  },

  async sRem(key: string, value: string): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.srem(key, value);
    }
    return standardClient.sRem(key, value);
  },

  async incr(key: string): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.incr(key);
    }
    return standardClient.incr(key);
  },

  async decr(key: string): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.decr(key);
    }
    return standardClient.decr(key);
  },

  async expire(key: string, seconds: number): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.expire(key, seconds);
    }
    return standardClient.expire(key, seconds);
  },

  async ttl(key: string): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.ttl(key);
    }
    return standardClient.ttl(key);
  },

  async ping(): Promise<string> {
    if (useUpstash && upstashClient) {
      try {
        await upstashClient.get('health-ping');
        return 'PONG';
      } catch (err) {
        return 'DOWN';
      }
    }
    return standardClient.ping();
  },

  async sendCommand(args: string[]): Promise<any> {
    if (useUpstash) return null;
    return standardClient.sendCommand(args);
  }
};

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error({ err }, 'Could not establish initial connection to Redis');
  }
};

export const disconnectRedis = async (): Promise<void> => {
  await redisClient.disconnect();
};

export default redisClient;
