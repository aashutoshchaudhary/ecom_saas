import { Request, Response, NextFunction } from 'express';
import { versionService } from '../services/version.service';

export class VersionController {
  async listVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await versionService.listVersions(req.headers['x-tenant-id'] as string, req.params.websiteId);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async getVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await versionService.getVersion(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async restoreVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await versionService.restoreVersion(req.headers['x-tenant-id'] as string, req.params.id, req.headers['x-user-id'] as string);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async compareVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await versionService.compareVersions(req.headers['x-tenant-id'] as string, req.body.versionAId, req.body.versionBId);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
}

export const versionController = new VersionController();
