import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { reportingService } from '../services/reporting.service';

export class ReportingController {
  async generateReport(req: Request, res: Response) {
    const report = await reportingService.generateReport(req.body);
    res.status(StatusCodes.ACCEPTED).json({ success: true, data: report });
  }

  async getReport(req: Request, res: Response) {
    const report = await reportingService.getReport(req.params.reportId);
    res.json({ success: true, data: report });
  }

  async listReports(req: Request, res: Response) {
    const result = await reportingService.listReports(req.query.tenantId as string, {
      type: req.query.type as string,
      status: req.query.status as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
    });
    res.json({ success: true, data: result });
  }

  async scheduleReport(req: Request, res: Response) {
    const schedule = await reportingService.scheduleReport(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: schedule });
  }

  async updateSchedule(req: Request, res: Response) {
    const { tenantId, ...updates } = req.body;
    const schedule = await reportingService.updateSchedule(req.params.scheduleId, tenantId, updates);
    res.json({ success: true, data: schedule });
  }

  async listSchedules(req: Request, res: Response) {
    const schedules = await reportingService.listSchedules(req.query.tenantId as string);
    res.json({ success: true, data: schedules });
  }
}

export const reportingController = new ReportingController();
