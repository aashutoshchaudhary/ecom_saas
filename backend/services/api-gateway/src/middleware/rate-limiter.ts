import { Request, Response, NextFunction } from 'express';
import { RedisClient } from '@siteforge/shared';
import { config } from '../config';
import { logger } from './request-logger';

type RateLimitTier = 'public' | 'authenticated' | 'premium';

export function createRateLimiter(tier: RateLimitTier) {
  const limits = config.rateLimits[tier];

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.userId
        ? `${req.userId}:${req.tenantId || 'global'}`
        : req.ip || 'unknown';

      const result = await RedisClient.checkRateLimit(
        `sf:ratelimit:${tier}:${identifier}`,
        limits.windowMs,
        limits.maxRequests
      );

      res.setHeader('X-RateLimit-Limit', limits.maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(result.resetAt).toISOString());

      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          tier,
          identifier,
          ip: req.ip,
          path: req.path,
        });

        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
          },
        });
        return;
      }

      next();
    } catch (error) {
      // Fail open - if Redis is down, don't block requests
      logger.warn('Rate limiter error, allowing request', { error: (error as Error).message });
      next();
    }
  };
}
