import { createClient } from 'redis';
import { Redis as UpstashRedis } from '@upstash/redis';
import type { RedisReply } from 'rate-limit-redis';
import { env } from './env';
import { logger } from '../common/logger';

type RedisClientInstance = ReturnType<typeof createClient>;
let standardClient: RedisClientInstance | null = null;
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
    
    standardClient.on('error', (err: Error) => {
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

  get rawUpstash(): UpstashRedis | null {
    return upstashClient;
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
    return standardClient ? standardClient.get(key) : null;
  },

  async setEx(key: string, ttlSeconds: number, value: string): Promise<string | null> {
    if (useUpstash && upstashClient) {
      const result = await upstashClient.set(key, value, { ex: ttlSeconds });
      return result === 'OK' ? 'OK' : String(result);
    }
    return standardClient ? standardClient.setEx(key, ttlSeconds, value) : null;
  },

  async del(key: string | string[]): Promise<number> {
    if (useUpstash && upstashClient) {
      if (Array.isArray(key)) {
        return upstashClient.del(...key);
      }
      return upstashClient.del(key);
    }
    return standardClient ? standardClient.del(key) : 0;
  },

  async sAdd(key: string, value: string): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.sadd(key, value);
    }
    return standardClient ? standardClient.sAdd(key, value) : 0;
  },

  async sMembers(key: string): Promise<string[]> {
    if (useUpstash && upstashClient) {
      const list = await upstashClient.smembers(key);
      return list.map((item: unknown) => typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item));
    }
    return standardClient ? standardClient.sMembers(key) : [];
  },

  async sRem(key: string, value: string): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.srem(key, value);
    }
    return standardClient ? standardClient.sRem(key, value) : 0;
  },

  async incr(key: string): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.incr(key);
    }
    return standardClient ? standardClient.incr(key) : 0;
  },

  async decr(key: string): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.decr(key);
    }
    return standardClient ? standardClient.decr(key) : 0;
  },

  async expire(key: string, seconds: number): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.expire(key, seconds);
    }
    return standardClient ? standardClient.expire(key, seconds) : 0;
  },

  async ttl(key: string): Promise<number> {
    if (useUpstash && upstashClient) {
      return upstashClient.ttl(key);
    }
    return standardClient ? standardClient.ttl(key) : -1;
  },

  
  async atomicIncrExpire(key: string, windowSeconds: number): Promise<[number, number]> {
    const luaScript = [
      "local current = redis.call('INCR', KEYS[1])",
      "if current == 1 then",
      "  redis.call('EXPIRE', KEYS[1], ARGV[1])",
      "end",
      "local ttl = redis.call('TTL', KEYS[1])",
      "return {current, ttl}",
    ].join('\n');

    if (useUpstash && upstashClient) {
      const result = await upstashClient.eval(
        luaScript,
        [key],
        [String(windowSeconds)]
      ) as [number, number];
      return result;
    }

    if (standardClient) {
      const result = await standardClient.eval(
        luaScript,
        { keys: [key], arguments: [String(windowSeconds)] }
      ) as [number, number];
      return result;
    }

    // No client available — return safe defaults (fail open)
    return [1, windowSeconds];
  },

  async ping(): Promise<string> {
    if (useUpstash && upstashClient) {
      try {
        await upstashClient.get('health-ping');
        return 'PONG';
      } catch (_err) {
        return 'DOWN';
      }
    }
    return standardClient ? standardClient.ping() : 'DOWN';
  },

  async sendCommand(args: string[]): Promise<RedisReply> {
    if (useUpstash || !standardClient) return 0;
    return standardClient.sendCommand(args) as unknown as RedisReply;
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
