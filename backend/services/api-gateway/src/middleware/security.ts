import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';

// Helmet configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

// HTTP Parameter Pollution protection
export const parameterPollutionProtection = hpp();

// SQL Injection pattern detection
const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/i,
  /(--|;|\/\*|\*\/|xp_)/i,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
];

// XSS pattern detection
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
];

// SSRF - Block internal/private IP ranges
const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./,
  /localhost/i,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

function checkPatterns(value: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(value));
}

function scanObject(obj: Record<string, unknown>, patterns: RegExp[]): boolean {
  for (const value of Object.values(obj)) {
    if (typeof value === 'string' && checkPatterns(value, patterns)) {
      return true;
    }
    if (typeof value === 'object' && value !== null) {
      if (scanObject(value as Record<string, unknown>, patterns)) {
        return true;
      }
    }
  }
  return false;
}

export function inputSanitization(req: Request, res: Response, next: NextFunction): void {
  // Check query params for SQL injection
  if (req.query && scanObject(req.query as Record<string, unknown>, SQL_PATTERNS)) {
    res.status(400).json({
      success: false,
      error: { code: 'MALICIOUS_INPUT', message: 'Potentially malicious input detected' },
    });
    return;
  }

  // Check body for XSS
  if (req.body && typeof req.body === 'object') {
    if (scanObject(req.body, XSS_PATTERNS)) {
      res.status(400).json({
        success: false,
        error: { code: 'MALICIOUS_INPUT', message: 'Potentially malicious input detected' },
      });
      return;
    }
  }

  next();
}

export function ssrfProtection(req: Request, res: Response, next: NextFunction): void {
  const urlFields = ['url', 'callback', 'redirect', 'webhook', 'endpoint'];

  if (req.body && typeof req.body === 'object') {
    for (const field of urlFields) {
      const value = req.body[field];
      if (typeof value === 'string') {
        try {
          const parsed = new URL(value);
          if (PRIVATE_IP_PATTERNS.some(p => p.test(parsed.hostname))) {
            res.status(400).json({
              success: false,
              error: { code: 'SSRF_BLOCKED', message: 'Access to internal resources is not allowed' },
            });
            return;
          }
        } catch {
          // Not a valid URL, skip
        }
      }
    }
  }

  next();
}
