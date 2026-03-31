import { z } from 'zod';

export const getConfigSchema = z.object({
  query: z.object({
    service: z.string().min(1),
    key: z.string().optional(),
  }),
});

export const updateConfigSchema = z.object({
  body: z.object({
    service: z.string().min(1),
    key: z.string().min(1),
    value: z.unknown(),
    isSecret: z.boolean().optional(),
  }),
});

export const deleteConfigSchema = z.object({
  params: z.object({
    configId: z.string().uuid(),
  }),
});

export const getFeatureFlagsSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid().optional(),
  }),
});

export const toggleFeatureFlagSchema = z.object({
  params: z.object({
    flagId: z.string().uuid(),
  }),
  body: z.object({
    enabled: z.boolean(),
  }),
});

export const createFeatureFlagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    enabled: z.boolean().default(false),
    tenants: z.array(z.string()).default([]),
    config: z.record(z.unknown()).default({}),
  }),
});

export const updateFeatureFlagSchema = z.object({
  params: z.object({
    flagId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    enabled: z.boolean().optional(),
    tenants: z.array(z.string()).optional(),
    config: z.record(z.unknown()).optional(),
  }),
});
