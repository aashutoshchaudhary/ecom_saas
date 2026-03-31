import { Request, Response, NextFunction } from 'express';
import { versionService } from '../services/version.service';

export class VersionController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await versionService.list(req.headers['x-tenant-id'] as string, { websiteId: req.params.websiteId, ...req.query as any });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await versionService.get(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await versionService.restore(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async compare(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await versionService.compare(req.headers['x-tenant-id'] as string, req.body.versionAId, req.body.versionBId);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
}

export const versionController = new VersionController();
