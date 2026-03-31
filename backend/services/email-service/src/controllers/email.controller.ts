import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { emailService } from '../services/email.service';

export class EmailController {
  async sendEmail(req: Request, res: Response) {
    const result = await emailService.sendEmail(req.body);
    res.status(StatusCodes.OK).json({ success: true, data: result });
  }

  async sendBulkEmail(req: Request, res: Response) {
    const results = await emailService.sendBulkEmail(req.body);
    res.json({ success: true, data: results });
  }

  async createTemplate(req: Request, res: Response) {
    const template = await emailService.createTemplate(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: template });
  }

  async listTemplates(req: Request, res: Response) {
    const templates = await emailService.listTemplates(req.query.tenantId as string);
    res.json({ success: true, data: templates });
  }

  async listLogs(req: Request, res: Response) {
    const result = await emailService.listLogs(req.query.tenantId as string, {
      status: req.query.status as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
    });
    res.json({ success: true, data: result });
  }
}

export const emailController = new EmailController();
