import { z } from 'zod';

export const installPluginSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    pluginId: z.string().uuid(),
    config: z.record(z.unknown()).optional(),
  }),
});

export const uninstallPluginSchema = z.object({
  params: z.object({
    installationId: z.string().uuid(),
  }),
  body: z.object({
    tenantId: z.string().uuid(),
  }),
});

export const togglePluginSchema = z.object({
  params: z.object({
    installationId: z.string().uuid(),
  }),
  body: z.object({
    tenantId: z.string().uuid(),
  }),
});

export const listInstalledSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
  }),
});

export const listAvailableSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    industry: z.string().optional(),
    plan: z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']).optional(),
    search: z.string().optional(),
  }),
});

export const getPluginConfigSchema = z.object({
  params: z.object({
    installationId: z.string().uuid(),
  }),
  query: z.object({
    tenantId: z.string().uuid(),
  }),
});

export const updatePluginConfigSchema = z.object({
  params: z.object({
    installationId: z.string().uuid(),
  }),
  body: z.object({
    tenantId: z.string().uuid(),
    config: z.record(z.unknown()),
  }),
});

export type InstallPluginInput = z.infer<typeof installPluginSchema>['body'];
export type ListAvailableQuery = z.infer<typeof listAvailableSchema>['query'];
