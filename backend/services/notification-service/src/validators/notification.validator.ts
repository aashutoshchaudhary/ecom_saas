import { z } from 'zod';

export const sendNotificationSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    userId: z.string().uuid(),
    type: z.enum(['EMAIL', 'WHATSAPP', 'PUSH', 'IN_APP']),
    channel: z.string().min(1),
    title: z.string().min(1).max(200),
    body: z.string().min(1),
    data: z.record(z.unknown()).optional(),
  }),
});

export const getNotificationsSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
    userId: z.string().uuid(),
    status: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});

export const markReadSchema = z.object({
  params: z.object({
    notificationId: z.string().uuid(),
  }),
  body: z.object({
    userId: z.string().uuid(),
  }),
});

export const markAllReadSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    tenantId: z.string().uuid(),
    preferences: z.array(z.object({
      channel: z.string(),
      eventType: z.string(),
      enabled: z.boolean(),
    })),
  }),
});

export const subscribePushSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    tenantId: z.string().uuid(),
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});
