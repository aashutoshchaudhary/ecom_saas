import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import webpush from 'web-push';
import { config } from '../config';

const prisma = new PrismaClient();

if (config.vapid.publicKey && config.vapid.privateKey) {
  webpush.setVapidDetails(
    config.vapid.subject,
    config.vapid.publicKey,
    config.vapid.privateKey,
  );
}

export class AppError extends Error {
  constructor(message: string, public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotificationService {
  async send(data: {
    tenantId: string;
    userId: string;
    type: string;
    channel: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    // Check preferences
    const pref = await prisma.notificationPreference.findUnique({
      where: {
        userId_tenantId_channel_eventType: {
          userId: data.userId,
          tenantId: data.tenantId,
          channel: data.channel,
          eventType: data.type,
        },
      },
    });

    if (pref && !pref.enabled) {
      return { skipped: true, reason: 'User preference disabled' };
    }

    const notification = await prisma.notification.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        type: data.type,
        channel: data.channel,
        title: data.title,
        body: data.body,
        data: (data.data || {}) as any,
        status: 'PENDING',
      },
    });

    try {
      switch (data.type) {
        case 'PUSH':
          await this.sendPush(data.userId, data.title, data.body, data.data);
          break;
        case 'IN_APP':
          // Already stored, will be fetched by client
          break;
        case 'WHATSAPP':
          await this.sendWhatsApp(data);
          break;
        case 'EMAIL':
          // Delegate to email service via event
          break;
      }

      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT', sentAt: new Date() },
      });

      return notification;
    } catch (error) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  private async sendPush(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    const payload = JSON.stringify({ title, body, data });
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
          payload,
        ),
      ),
    );

    // Clean up expired subscriptions
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'rejected') {
        await prisma.pushSubscription.delete({ where: { id: subscriptions[i].id } }).catch(() => {});
      }
    }
  }

  private async sendWhatsApp(data: { title: string; body: string }) {
    if (!config.whatsapp.apiUrl || !config.whatsapp.token) {
      console.warn('WhatsApp not configured');
      return;
    }
    // WhatsApp Business API integration would go here
    console.log('Sending WhatsApp notification:', data.title);
  }

  async getNotifications(userId: string, tenantId: string, filters: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { userId, tenantId };
    if (filters.status) where.status = filters.status;

    const [notifications, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, readAt: null } }),
    ]);

    return { notifications, total, unread };
  }

  async markRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      throw new AppError('Notification not found', StatusCodes.NOT_FOUND);
    }
    return prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string, tenantId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, tenantId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  async updatePreferences(userId: string, tenantId: string, preferences: Array<{
    channel: string;
    eventType: string;
    enabled: boolean;
  }>) {
    const results = [];
    for (const pref of preferences) {
      const result = await prisma.notificationPreference.upsert({
        where: {
          userId_tenantId_channel_eventType: {
            userId, tenantId, channel: pref.channel, eventType: pref.eventType,
          },
        },
        update: { enabled: pref.enabled },
        create: {
          userId, tenantId, channel: pref.channel, eventType: pref.eventType, enabled: pref.enabled,
        },
      });
      results.push(result);
    }
    return results;
  }

  async getPreferences(userId: string, tenantId: string) {
    return prisma.notificationPreference.findMany({ where: { userId, tenantId } });
  }

  async subscribePush(data: {
    userId: string;
    tenantId: string;
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }) {
    return prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId: data.userId, endpoint: data.endpoint } },
      update: { keys: data.keys },
      create: data,
    });
  }
}

export const notificationService = new NotificationService();
