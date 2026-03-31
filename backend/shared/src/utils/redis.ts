import Redis from 'ioredis';
import { logger } from '../middleware';

let redisInstance: Redis | null = null;

export class RedisClient {
  static getInstance(): Redis {
    if (!redisInstance) {
      redisInstance = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          const delay = Math.min(times * 200, 5000);
          return delay;
        },
        lazyConnect: true,
      });

      redisInstance.on('error', (err) => {
        logger.error('Redis connection error', { error: err.message });
      });

      redisInstance.on('connect', () => {
        logger.info('Redis connected');
      });
    }
    return redisInstance;
  }

  static async disconnect(): Promise<void> {
    if (redisInstance) {
      await redisInstance.quit();
      redisInstance = null;
    }
  }

  // ─── Cache Helpers ──────────────────────────────────────

  static async getCache<T>(key: string): Promise<T | null> {
    const redis = RedisClient.getInstance();
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  static async setCache<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const redis = RedisClient.getInstance();
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  static async deleteCache(key: string): Promise<void> {
    const redis = RedisClient.getInstance();
    await redis.del(key);
  }

  static async deleteCachePattern(pattern: string): Promise<void> {
    const redis = RedisClient.getInstance();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // ─── Distributed Lock ──────────────────────────────────

  static async acquireLock(key: string, ttlMs: number = 10000): Promise<string | null> {
    const redis = RedisClient.getInstance();
    const lockId = `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await redis.set(key, lockId, 'PX', ttlMs, 'NX');
    return result === 'OK' ? lockId : null;
  }

  static async releaseLock(key: string, lockId: string): Promise<boolean> {
    const redis = RedisClient.getInstance();
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await redis.eval(script, 1, key, lockId);
    return result === 1;
  }

  // ─── Rate Limiter (Sliding Window) ─────────────────────

  static async checkRateLimit(
    key: string,
    windowMs: number,
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const redis = RedisClient.getInstance();
    const now = Date.now();
    const windowStart = now - windowMs;

    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, `${now}_${Math.random()}`);
    pipeline.zcard(key);
    pipeline.pexpire(key, windowMs);

    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number) || 0;

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetAt: now + windowMs,
    };
  }
}
