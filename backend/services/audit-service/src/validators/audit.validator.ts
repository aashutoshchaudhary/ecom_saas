import { z } from 'zod';

export const createLogSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    userId: z.string().uuid(),
    action: z.string().min(1).max(100),
    resource: z.string().min(1).max(100),
    resourceId: z.string().optional(),
    before: z.record(z.unknown()).optional(),
    after: z.record(z.unknown()).optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const getLogsSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
    userId: z.string().uuid().optional(),
    action: z.string().optional(),
    resource: z.string().optional(),
    resourceId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});

export const searchLogsSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    query: z.string().min(1),
    filters: z.object({
      userId: z.string().uuid().optional(),
      action: z.string().optional(),
      resource: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  }),
});

export const exportLogsSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    format: z.enum(['CSV', 'JSON']).default('CSV'),
    filters: z.object({
      userId: z.string().uuid().optional(),
      action: z.string().optional(),
      resource: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  }),
});
