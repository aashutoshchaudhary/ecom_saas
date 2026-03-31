import { randomUUID, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { JwtPayload, PaginatedResponse } from '../types';

// ─── ID Generation ────────────────────────────────────────

export function generateId(): string {
  return randomUUID();
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

// ─── Password Hashing ────────────────────────────────────

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT ──────────────────────────────────────────────────

export function generateJWT(
  payload: Omit<JwtPayload, 'iat' | 'exp' | 'jti'>,
  secret: string,
  expiresIn: string = '15m'
): string {
  return jwt.sign(
    { ...payload, jti: generateId() },
    secret,
    { expiresIn, algorithm: 'HS256' }
  );
}

export function verifyJWT(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;
}

// ─── Input Sanitization ──────────────────────────────────

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
];

export function sanitizeInput(input: string): string {
  let sanitized = input.trim();
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  return sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ─── Tenant Access ────────────────────────────────────────

export function validateTenantAccess(
  requestTenantId: string,
  resourceTenantId: string
): boolean {
  return requestTenantId === resourceTenantId;
}

// ─── Currency ─────────────────────────────────────────────

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// ─── Pagination ───────────────────────────────────────────

export function paginationHelper<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function parsePagination(query: { page?: string; limit?: string }): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  return { page, limit, skip: (page - 1) * limit };
}

// ─── Slug ─────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 128);
}

// ─── Order Number ─────────────────────────────────────────

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// ─── Error Classes ────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, 'NOT_FOUND', `${resource}${id ? ` with ID ${id}` : ''} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, 'FORBIDDEN', message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super(422, 'VALIDATION_ERROR', 'Validation failed', details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(retryAfter?: number) {
    super(429, 'RATE_LIMITED', `Too many requests${retryAfter ? `. Retry after ${retryAfter}s` : ''}`);
  }
}
