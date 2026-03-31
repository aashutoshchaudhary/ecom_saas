import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { config } from './config';
import { authMiddleware } from './middleware/auth';
import {
  securityHeaders,
  parameterPollutionProtection,
  inputSanitization,
  ssrfProtection,
} from './middleware/security';
import { requestLogger } from './middleware/request-logger';
import { setupProxyRoutes } from './services/proxy';
import { setupHealthRoutes } from './services/health';

const app = express();

// ─── Security ─────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(parameterPollutionProtection);

// ─── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Tenant-ID'],
  exposedHeaders: ['X-Correlation-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400,
}));

// ─── Compression ──────────────────────────────────────────
app.use(compression());

// ─── Body Parsing (for security checks before proxy) ──────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────
app.use(requestLogger);

// ─── Input Validation ─────────────────────────────────────
app.use(inputSanitization);
app.use(ssrfProtection);

// ─── Health Checks ────────────────────────────────────────
app.use(setupHealthRoutes());

// ─── Authentication ───────────────────────────────────────
app.use(authMiddleware);

// ─── Proxy Routes ─────────────────────────────────────────
app.use(setupProxyRoutes());

// ─── 404 Handler ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist' },
  });
});

// ─── Error Handler ────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: (err as any).code || 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
  });
});

export default app;
