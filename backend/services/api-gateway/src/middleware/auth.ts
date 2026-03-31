import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RedisClient } from '@siteforge/shared';
import { config } from '../config';
import { logger } from './request-logger';

interface JwtPayload {
  sub: string;
  email: string;
  tenantId?: string;
  roles?: string[];
  jti: string;
}

// Paths that skip authentication
const PUBLIC_PATHS = [
  '/health',
  '/ready',
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/verify-email',
  '/api/v1/auth/social',
  '/api/v1/industries',
  // Payment webhooks (verified by provider signature)
  '/api/v1/payments/webhook',
  '/api/v1/pos/webhook',
];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(pp => path.startsWith(pp));
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (isPublicPath(req.path)) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' },
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      algorithms: [...config.jwt.algorithms],
    }) as JwtPayload;

    // Check token blacklist asynchronously
    const redis = RedisClient.getInstance();
    redis.get(`sf:blacklist:${payload.jti}`).then((blacklisted) => {
      if (blacklisted) {
        res.status(401).json({
          success: false,
          error: { code: 'TOKEN_REVOKED', message: 'Token has been revoked' },
        });
        return;
      }

      // Inject user context into request headers for downstream services
      req.headers['x-user-id'] = payload.sub;
      req.headers['x-user-email'] = payload.email;
      if (payload.tenantId) {
        req.headers['x-tenant-id'] = payload.tenantId;
      }
      if (payload.roles) {
        req.headers['x-user-roles'] = payload.roles.join(',');
      }

      // Also set on req for gateway middleware
      (req as any).userId = payload.sub;
      (req as any).tenantId = payload.tenantId;
      (req as any).userRoles = payload.roles || [];

      next();
    }).catch((err) => {
      logger.warn('Redis check failed, allowing request', { error: err.message });
      req.headers['x-user-id'] = payload.sub;
      req.headers['x-user-email'] = payload.email;
      if (payload.tenantId) req.headers['x-tenant-id'] = payload.tenantId;
      if (payload.roles) req.headers['x-user-roles'] = payload.roles.join(',');
      next();
    });
  } catch {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
    });
  }
}
