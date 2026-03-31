import { z } from 'zod';

export const connectPosSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    provider: z.enum(['CLOVER', 'SQUARE']),
    merchantId: z.string().min(1),
    accessToken: z.string().min(1),
    refreshToken: z.string().optional(),
    locationId: z.string().optional(),
    settings: z.record(z.unknown()).optional(),
  }),
});

export const disconnectPosSchema = z.object({
  params: z.object({
    connectionId: z.string().uuid(),
  }),
  body: z.object({
    tenantId: z.string().uuid(),
  }),
});

export const syncSchema = z.object({
  params: z.object({
    connectionId: z.string().uuid(),
  }),
  body: z.object({
    tenantId: z.string().uuid(),
  }),
});

export const webhookSchema = z.object({
  body: z.record(z.unknown()),
});

export const listConnectionsSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
  }),
});

export const getSyncLogsSchema = z.object({
  params: z.object({
    connectionId: z.string().uuid(),
  }),
  query: z.object({
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});
