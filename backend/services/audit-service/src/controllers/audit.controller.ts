import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { auditService } from '../services/audit.service';

export class AuditController {
  async createLog(req: Request, res: Response) {
    const log = await auditService.createLog({
      ...req.body,
      ipAddress: req.body.ipAddress || req.ip || req.socket.remoteAddress,
      userAgent: req.body.userAgent || req.headers['user-agent'],
    });
    res.status(StatusCodes.CREATED).json({ success: true, data: log });
  }

  async getLogs(req: Request, res: Response) {
    const result = await auditService.getLogs(req.query.tenantId as string, {
      userId: req.query.userId as string,
      action: req.query.action as string,
      resource: req.query.resource as string,
      resourceId: req.query.resourceId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
    });
    res.json({ success: true, data: result });
  }

  async searchLogs(req: Request, res: Response) {
    const { tenantId, query, filters, limit, offset } = req.body;
    const result = await auditService.searchLogs(tenantId, query, filters, limit, offset);
    res.json({ success: true, data: result });
  }

  async exportLogs(req: Request, res: Response) {
    const { tenantId, format, filters } = req.body;
    const result = await auditService.exportLogs(tenantId, format, filters);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs.${result.extension}"`);
    res.send(result.data);
  }
}

export const auditController = new AuditController();
