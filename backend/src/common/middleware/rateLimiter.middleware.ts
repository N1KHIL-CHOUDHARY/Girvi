import rateLimit, { Store, ClientRateLimitInfo } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../../config/redis';
import { AppError } from '../errors/AppError';

interface LimiterOptions {
  windowMs: number;
  max: number;
  message: string;
}

class UpstashRateLimitStore implements Store {
  constructor(private windowMs: number) {}

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const now = Date.now();
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, Math.ceil(this.windowMs / 1000));
    }
    
    const ttl = await redisClient.ttl(key);
    
    return {
      totalHits: current,
      resetTime: new Date(now + (ttl * 1000))
    };
  }

  async decrement(key: string): Promise<void> {
    await redisClient.decr(key);
  }

  async resetKey(key: string): Promise<void> {
    await redisClient.del(key);
  }
}

export const createRateLimiter = (options: LimiterOptions) => {
  let store: Store | undefined;

  if (redisClient.isUpstash) {
    store = new UpstashRateLimitStore(options.windowMs);
  } else if (redisClient.isOpen) {
    store = new RedisStore({
      // rate-limit-redis expects sending commands via node-redis API
      sendCommand: (...args: string[]) => redisClient.sendCommand(args)
    });
  }

  return rateLimit({
    store,
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new AppError(options.message, 429));
    }
  });
};

// Rate limiter definitions
export const loginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many login attempts. Please try again after 1 minute.'
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many upload attempts. Please try again after 1 minute.'
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Rate limit exceeded. Please try again after 15 minutes.'
});
