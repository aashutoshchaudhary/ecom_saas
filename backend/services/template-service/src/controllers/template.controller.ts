import { Request, Response, NextFunction } from 'express';
import { templateService } from '../services/template.service';

export class TemplateController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await templateService.list(req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.get(req.params.id);
      res.json({ success: true, data: template });
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.create(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (error) { next(error); }
  }

  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await templateService.apply(
        req.headers['x-tenant-id'] as string, req.params.id, req.body.websiteId
      );
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async clone(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.clone(req.params.id, req.body.name);
      res.status(201).json({ success: true, data: template });
    } catch (error) { next(error); }
  }

  async getByIndustry(req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await templateService.getByIndustry(req.params.industryId);
      res.json({ success: true, data: templates });
    } catch (error) { next(error); }
  }
}

export const templateController = new TemplateController();
