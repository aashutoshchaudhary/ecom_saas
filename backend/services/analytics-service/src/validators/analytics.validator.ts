import { z } from 'zod';

export const trackEventSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    websiteId: z.string().uuid().optional(),
    sessionId: z.string().optional(),
    visitorId: z.string().optional(),
    eventType: z.string().min(1).max(100),
    eventData: z.record(z.unknown()).optional(),
    page: z.string().optional(),
    referrer: z.string().optional(),
  }),
});

export const getMetricsSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
    startDate: z.string(),
    endDate: z.string(),
  }),
});

export const getDashboardSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
    period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  }),
});

export const getTrafficSourcesSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
    startDate: z.string(),
    endDate: z.string(),
  }),
});

export const getTopProductsSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
    startDate: z.string(),
    endDate: z.string(),
    limit: z.string().optional(),
  }),
});
