import { z } from 'zod';

export const generateReportSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    name: z.string().min(1).max(200),
    type: z.enum(['sales', 'inventory', 'customers', 'traffic', 'financial']),
    parameters: z.object({
      startDate: z.string(),
      endDate: z.string(),
      filters: z.record(z.unknown()).optional(),
    }),
    format: z.enum(['PDF', 'CSV', 'XLSX']).default('PDF'),
  }),
});

export const getReportSchema = z.object({
  params: z.object({
    reportId: z.string().uuid(),
  }),
});

export const listReportsSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
    type: z.string().optional(),
    status: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});

export const scheduleReportSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    reportType: z.enum(['sales', 'inventory', 'customers', 'traffic', 'financial']),
    schedule: z.string().min(9).max(100), // cron expression
    recipients: z.array(z.string().email()).min(1),
  }),
});

export const updateScheduleSchema = z.object({
  params: z.object({
    scheduleId: z.string().uuid(),
  }),
  body: z.object({
    tenantId: z.string().uuid(),
    schedule: z.string().optional(),
    recipients: z.array(z.string().email()).optional(),
    isActive: z.boolean().optional(),
  }),
});
