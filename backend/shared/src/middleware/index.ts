import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { verifyJWT, AppError, UnauthorizedError, ForbiddenError, ValidationError } from '../utils';
import { RedisClient } from '../utils/redis';
import { RedisKeys } from '../constants';
import winston from 'winston';

// ─── Logger ───────────────────────────────────────────────

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: process.env.SERVICE_NAME || 'unknown' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? winston.format.combine(winston.format.colorize(), winston.format.simple())
        : winston.format.json(),
    }),
  ],
});

// ─── Auth Middleware ──────────────────────────────────────

export function authMiddleware(jwtSecret: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7);
      const payload = verifyJWT(token, jwtSecret);

      // Check token blacklist
      const redis = RedisClient.getInstance();
      const isBlacklisted = await redis.get(RedisKeys.TOKEN_BLACKLIST(payload.jti));
      if (isBlacklisted) {
        throw new UnauthorizedError('Token has been revoked');
      }

      req.userId = payload.sub;
      req.tenantId = payload.tenantId;
      req.userRoles = payload.roles || [];
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new UnauthorizedError('Invalid or expired token'));
      }
    }
  };
}

// ─── Tenant Isolation Middleware ──────────────────────────

export function tenantMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (!req.tenantId) {
    next(new ForbiddenError('Tenant context required'));
    return;
  }
  next();
}

// ─── RBAC Middleware ──────────────────────────────────────

export function rbacMiddleware(...requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId || !req.tenantId) {
        throw new ForbiddenError('Authentication and tenant context required');
      }

      // Check cached permissions
      const redis = RedisClient.getInstance();
      const cacheKey = RedisKeys.CACHE_PERMISSIONS(req.userId, req.tenantId);
      const cached = await redis.get(cacheKey);

      let permissions: string[];
      if (cached) {
        permissions = JSON.parse(cached);
      } else {
        // Permissions should be set during auth - fallback to request context
        permissions = req.userPermissions || [];
      }

      const hasPermission = requiredPermissions.every(p => permissions.includes(p));
      if (!hasPermission) {
        throw new ForbiddenError(
          `Missing required permissions: ${requiredPermissions.join(', ')}`
        );
      }

      req.userPermissions = permissions;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// ─── Rate Limiting Middleware ─────────────────────────────

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export function rateLimitMiddleware(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redis = RedisClient.getInstance();
      const key = `${config.keyPrefix || 'sf:ratelimit'}:${req.ip}:${Math.floor(Date.now() / config.windowMs)}`;

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, Math.ceil(config.windowMs / 1000));
      }

      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - current));
      res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / config.windowMs) * config.windowMs);

      if (current > config.maxRequests) {
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
      // If Redis fails, allow the request (fail open for rate limiting)
      logger.warn('Rate limiter Redis error, allowing request', { error });
      next();
    }
  };
}

// ─── Validation Middleware ────────────────────────────────

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        error.errors.forEach((e) => {
          const path = e.path.join('.');
          if (!details[path]) details[path] = [];
          details[path].push(e.message);
        });
        next(new ValidationError(details));
      } else {
        next(error);
      }
    }
  };
}

// ─── Error Handler ────────────────────────────────────────

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn('Application error', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      correlationId: req.correlationId,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    correlationId: req.correlationId,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  });
}

// ─── Request Logger ───────────────────────────────────────

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'authorization', 'cookie', 'mfaSecret'];

function sanitizeForLog(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const correlationId = (req.headers['x-correlation-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      correlationId,
      userId: req.userId,
      tenantId: req.tenantId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      query: sanitizeForLog(req.query as Record<string, unknown>),
    });
  });

  next();
}

// ─── CORS Config ──────────────────────────────────────────

export function corsConfig() {
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');

  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Tenant-ID'],
    exposedHeaders: ['X-Correlation-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400,
  };
}
