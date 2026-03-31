import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async send(req: Request, res: Response) {
    const result = await notificationService.send(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: result });
  }

  async getNotifications(req: Request, res: Response) {
    const result = await notificationService.getNotifications(
      req.query.userId as string,
      req.query.tenantId as string,
      {
        status: req.query.status as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      },
    );
    res.json({ success: true, data: result });
  }

  async markRead(req: Request, res: Response) {
    const notification = await notificationService.markRead(req.params.notificationId, req.body.userId);
    res.json({ success: true, data: notification });
  }

  async markAllRead(req: Request, res: Response) {
    const result = await notificationService.markAllRead(req.body.userId, req.body.tenantId);
    res.json({ success: true, data: result });
  }

  async updatePreferences(req: Request, res: Response) {
    const { userId, tenantId, preferences } = req.body;
    const result = await notificationService.updatePreferences(userId, tenantId, preferences);
    res.json({ success: true, data: result });
  }

  async getPreferences(req: Request, res: Response) {
    const prefs = await notificationService.getPreferences(
      req.query.userId as string,
      req.query.tenantId as string,
    );
    res.json({ success: true, data: prefs });
  }

  async subscribePush(req: Request, res: Response) {
    const subscription = await notificationService.subscribePush(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: subscription });
  }
}

export const notificationController = new NotificationController();
