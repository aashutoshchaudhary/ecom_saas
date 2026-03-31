import { Router, Request, Response } from 'express';
import { RedisClient } from '@siteforge/shared';
import { logger } from '../middleware/request-logger';

export function setupHealthRoutes(): Router {
  const router = Router();

  // Liveness probe
  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
  });

  // Readiness probe (checks dependencies)
  router.get('/ready', async (_req: Request, res: Response) => {
    const checks: Record<string, string> = {};

    try {
      const redis = RedisClient.getInstance();
      await redis.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }

    const allHealthy = Object.values(checks).every(v => v === 'ok');

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'degraded',
      service: 'api-gateway',
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
