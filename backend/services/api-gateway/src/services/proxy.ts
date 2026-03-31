import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request, Response, NextFunction, Router } from 'express';
import { ServiceRoute, serviceRoutes } from '../config';
import { createRateLimiter } from '../middleware/rate-limiter';
import { logger } from '../middleware/request-logger';

// ─── Circuit Breaker ──────────────────────────────────────

interface CircuitState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
  nextRetry: number;
}

const circuitStates = new Map<string, CircuitState>();
const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT = 30_000; // 30 seconds

function getCircuitState(target: string): CircuitState {
  if (!circuitStates.has(target)) {
    circuitStates.set(target, {
      failures: 0,
      lastFailure: 0,
      isOpen: false,
      nextRetry: 0,
    });
  }
  return circuitStates.get(target)!;
}

function recordFailure(target: string): void {
  const state = getCircuitState(target);
  state.failures++;
  state.lastFailure = Date.now();

  if (state.failures >= FAILURE_THRESHOLD) {
    state.isOpen = true;
    state.nextRetry = Date.now() + RECOVERY_TIMEOUT;
    logger.error('Circuit breaker OPEN', { target, failures: state.failures });
  }
}

function recordSuccess(target: string): void {
  const state = getCircuitState(target);
  state.failures = 0;
  state.isOpen = false;
}

function isCircuitOpen(target: string): boolean {
  const state = getCircuitState(target);
  if (!state.isOpen) return false;

  // Check if recovery timeout has elapsed (half-open state)
  if (Date.now() >= state.nextRetry) {
    logger.info('Circuit breaker HALF-OPEN, allowing probe', { target });
    return false;
  }

  return true;
}

// ─── Proxy Setup ──────────────────────────────────────────

function createServiceProxy(route: ServiceRoute) {
  const proxyOptions: Options = {
    target: route.target,
    changeOrigin: true,
    timeout: 30_000,
    proxyTimeout: 30_000,
    on: {
      proxyReq: (proxyReq, req) => {
        // Forward correlation ID
        const correlationId = (req as any).headers['x-correlation-id'];
        if (correlationId) {
          proxyReq.setHeader('X-Correlation-ID', correlationId);
        }
      },
      proxyRes: (_proxyRes, _req) => {
        recordSuccess(route.target);
      },
      error: (err, _req, res) => {
        recordFailure(route.target);
        logger.error('Proxy error', {
          target: route.target,
          error: err.message,
        });

        if ('writeHead' in res && typeof res.writeHead === 'function') {
          (res as any).status(502).json({
            success: false,
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'The requested service is temporarily unavailable',
            },
          });
        }
      },
    },
  };

  return createProxyMiddleware(proxyOptions);
}

// ─── Router Setup ─────────────────────────────────────────

export function setupProxyRoutes(): Router {
  const router = Router();

  for (const route of serviceRoutes) {
    const middlewares: any[] = [];

    // Rate limiting
    middlewares.push(createRateLimiter(route.rateLimitTier));

    // Circuit breaker check
    middlewares.push((req: Request, res: Response, next: NextFunction) => {
      if (isCircuitOpen(route.target)) {
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service is temporarily unavailable. Please try again later.',
          },
        });
        return;
      }
      next();
    });

    // Role check
    if (route.allowedRoles?.length) {
      middlewares.push((req: Request, res: Response, next: NextFunction) => {
        const userRoles = (req as any).userRoles || [];
        const hasRole = route.allowedRoles!.some(r => userRoles.includes(r));
        if (!hasRole) {
          res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Insufficient role for this resource' },
          });
          return;
        }
        next();
      });
    }

    // Proxy
    middlewares.push(createServiceProxy(route));

    router.use(route.path, ...middlewares);
    logger.info(`Route registered: ${route.path} → ${route.target}`);
  }

  return router;
}
