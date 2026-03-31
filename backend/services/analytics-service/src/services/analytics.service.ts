import { PrismaClient, Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import UAParser from 'ua-parser-js';

const prisma = new PrismaClient();

export class AppError extends Error {
  constructor(message: string, public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
  }
}

export class AnalyticsService {
  async trackEvent(data: {
    tenantId: string;
    websiteId?: string;
    sessionId?: string;
    visitorId?: string;
    eventType: string;
    eventData?: Record<string, unknown>;
    page?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    let country: string | undefined;
    try {
      const geoip = require('geoip-lite');
      if (data.ipAddress) {
        const geo = geoip.lookup(data.ipAddress);
        country = geo?.country;
      }
    } catch { /* geoip not available */ }

    return prisma.analyticsEvent.create({
      data: {
        tenantId: data.tenantId,
        websiteId: data.websiteId,
        sessionId: data.sessionId,
        visitorId: data.visitorId,
        eventType: data.eventType,
        eventData: data.eventData || {},
        page: data.page,
        referrer: data.referrer,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        country,
      },
    });
  }

  async getMetrics(tenantId: string, startDate: string, endDate: string) {
    return prisma.dailyMetrics.findMany({
      where: {
        tenantId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getDashboard(tenantId: string, period: string) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.dailyMetrics.findMany({
      where: {
        tenantId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const totals = metrics.reduce(
      (acc, m) => ({
        visitors: acc.visitors + m.visitors,
        pageViews: acc.pageViews + m.pageViews,
        orders: acc.orders + m.orders,
        revenue: acc.revenue + Number(m.revenue),
      }),
      { visitors: 0, pageViews: 0, orders: 0, revenue: 0 },
    );

    const avgConversion = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + Number(m.conversion), 0) / metrics.length
      : 0;

    const avgOrderValue = totals.orders > 0 ? totals.revenue / totals.orders : 0;

    return {
      period,
      totals: {
        ...totals,
        avgConversion: Math.round(avgConversion * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      },
      daily: metrics,
    };
  }

  async getTrafficSources(tenantId: string, startDate: string, endDate: string) {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        tenantId,
        eventType: 'page_view',
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        referrer: { not: null },
      },
      select: { referrer: true },
    });

    const sourceMap = new Map<string, number>();
    for (const event of events) {
      if (event.referrer) {
        try {
          const url = new URL(event.referrer);
          const source = url.hostname || 'direct';
          sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
        } catch {
          sourceMap.set('direct', (sourceMap.get('direct') || 0) + 1);
        }
      }
    }

    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getTopProducts(tenantId: string, startDate: string, endDate: string, limit = 10) {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        tenantId,
        eventType: { in: ['product_view', 'add_to_cart', 'purchase'] },
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: { eventType: true, eventData: true },
    });

    const productMap = new Map<string, { views: number; addToCart: number; purchases: number; name: string }>();
    for (const event of events) {
      const data = event.eventData as { productId?: string; productName?: string };
      if (data.productId) {
        const existing = productMap.get(data.productId) || {
          views: 0, addToCart: 0, purchases: 0, name: data.productName || 'Unknown',
        };
        if (event.eventType === 'product_view') existing.views++;
        if (event.eventType === 'add_to_cart') existing.addToCart++;
        if (event.eventType === 'purchase') existing.purchases++;
        productMap.set(data.productId, existing);
      }
    }

    return Array.from(productMap.entries())
      .map(([productId, stats]) => ({ productId, ...stats }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }
}

export const analyticsService = new AnalyticsService();
