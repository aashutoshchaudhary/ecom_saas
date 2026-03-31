import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  async trackEvent(req: Request, res: Response) {
    const event = await analyticsService.trackEvent({
      ...req.body,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
    });
    res.status(StatusCodes.CREATED).json({ success: true, data: event });
  }

  async getMetrics(req: Request, res: Response) {
    const metrics = await analyticsService.getMetrics(
      req.query.tenantId as string,
      req.query.startDate as string,
      req.query.endDate as string,
    );
    res.json({ success: true, data: metrics });
  }

  async getDashboard(req: Request, res: Response) {
    const dashboard = await analyticsService.getDashboard(
      req.query.tenantId as string,
      req.query.period as string || '30d',
    );
    res.json({ success: true, data: dashboard });
  }

  async getTrafficSources(req: Request, res: Response) {
    const sources = await analyticsService.getTrafficSources(
      req.query.tenantId as string,
      req.query.startDate as string,
      req.query.endDate as string,
    );
    res.json({ success: true, data: sources });
  }

  async getTopProducts(req: Request, res: Response) {
    const products = await analyticsService.getTopProducts(
      req.query.tenantId as string,
      req.query.startDate as string,
      req.query.endDate as string,
      req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    );
    res.json({ success: true, data: products });
  }
}

export const analyticsController = new AnalyticsController();
