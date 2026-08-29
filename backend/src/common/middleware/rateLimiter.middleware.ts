import rateLimit, { Store, ClientRateLimitInfo, Options } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../../config/redis';
import { AppError } from '../errors/AppError';
import { tenantContext } from '../context/tenant.context'; // Adjust path to your store context

interface LimiterOptions {
  windowMs: number;
  max: number;
  message: string;
  useUserId?: boolean;
}

class UpstashRateLimitStore implements Store {
  private windowMs: number = 60 * 1000;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  /**
   * Called by express-rate-limit to pass initial options.
   */
  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const now = Date.now();
    const windowSeconds = Math.ceil(this.windowMs / 1000);

    try {
      // Atomic INCR + EXPIRE via single Lua script execution
      const [totalHits, ttl] = await redisClient.atomicIncrExpire(key, windowSeconds);

      return {
        totalHits,
        resetTime: new Date(now + ttl * 1000),
      };
    } catch (err) {
      console.error('[RateLimiter] Redis error in increment(), failing open:', err);
      // Fail open: return hit count of 1 to allow request through when Redis is down
      return {
        totalHits: 1,
        resetTime: new Date(now + this.windowMs),
      };
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      await redisClient.decr(key);
    } catch (err) {
      console.error('[RateLimiter] Redis error in decrement():', err);
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.error('[RateLimiter] Redis error in resetKey():', err);
    }
  }
}

export const createRateLimiter = (options: LimiterOptions) => {
  let store: Store | undefined;

  if (redisClient.isUpstash) {
    store = new UpstashRateLimitStore(options.windowMs);
  } else if (redisClient.isOpen) {
    store = new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    });
  }

  return rateLimit({
    store,
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true, // Emits standard RateLimit-* headers
    legacyHeaders: false,   // Suppresses deprecated X-RateLimit-* headers
    passOnStoreError: true, // Prevents total API downtime if Redis goes offline
    
    // Scopes rate limits by userId for authenticated routes; falls back to IP
    keyGenerator: (req: Request) => {
      if (options.useUserId) {
        const storeContext = tenantContext.getStore();
        if (storeContext?.userId) {
          return `rl:user:${storeContext.userId}`;
        }
      }
      return `rl:ip:${req.ip}`;
    },

    // Skip limiting in non-production environments to avoid HMR / test lockouts
    skip: () =>
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test',

    // Enforce explicit Retry-After header for frontend timing / UX triggers
    handler: (req: Request, res: Response, next: NextFunction, optionsUsed: Options) => {
      const resetTime = (req as any).rateLimit?.resetTime;
      if (resetTime instanceof Date) {
        const retryAfterSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
        res.setHeader('Retry-After', Math.max(1, retryAfterSeconds));
      } else {
        res.setHeader('Retry-After', Math.ceil(optionsUsed.windowMs / 1000));
      }

      next(new AppError(options.message, 429));
    },
  });
};

// ─── Rate Limiter Definitions ────────────────────────────────────────────────

// Auth endpoints: login, signup, refresh-token, reset-password (IP Keyed)
export const loginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again after 1 minute.',
});

// File upload endpoint: scoped per user where available
export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many upload attempts. Please try again after 1 minute.',
  useUserId: true,
});

// General authenticated API: high threshold scoped per authenticated user ID
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  message: 'Rate limit exceeded. Please try again after 15 minutes.',
  useUserId: true,
});