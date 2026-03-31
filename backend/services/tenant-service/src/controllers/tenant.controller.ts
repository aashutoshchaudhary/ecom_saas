import { Request, Response, NextFunction } from 'express';
import { tenantService } from '../services/tenant.service';

export class TenantController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.create({
        ...req.body,
        ownerId: req.headers['x-user-id'] as string,
      });
      res.status(201).json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.get(req.params.id);
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.update(req.params.id, req.body);
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tenantService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tenantService.list(req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async addIndustry(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.addIndustry(req.params.id, req.body.industry);
      res.status(201).json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }

  async removeIndustry(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.removeIndustry(req.params.id, req.params.iid);
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.updateSettings(req.params.id, req.body);
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }

  async updateSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.updateSubscription(req.params.id, req.body);
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }
}

export const tenantController = new TenantController();
