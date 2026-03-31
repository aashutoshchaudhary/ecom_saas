import { z } from 'zod';

export const sendEmailSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    to: z.string().email(),
    subject: z.string().min(1).max(500),
    body: z.string().optional(),
    templateId: z.string().uuid().optional(),
    templateData: z.record(z.unknown()).optional(),
  }),
});

export const sendBulkEmailSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    recipients: z.array(z.object({
      to: z.string().email(),
      templateData: z.record(z.unknown()).optional(),
    })).min(1).max(1000),
    subject: z.string().min(1).max(500).optional(),
    body: z.string().optional(),
    templateId: z.string().uuid().optional(),
  }),
});

export const createTemplateSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid().optional(),
    name: z.string().min(1).max(100),
    subject: z.string().min(1).max(500),
    body: z.string().min(1),
    variables: z.array(z.string()).default([]),
  }),
});

export const listTemplatesSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid().optional(),
  }),
});

export const listLogsSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
    status: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});
