import { Request, Response, NextFunction } from 'express';
import { pricingService } from '../services/pricing.service';

export class PricingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await pricingService.create(req.headers['x-tenant-id'] as string, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await pricingService.list(req.headers['x-tenant-id'] as string, req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await pricingService.get(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await pricingService.update(req.headers['x-tenant-id'] as string, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await pricingService.delete(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: { message: 'Deleted' } });
    } catch (error) { next(error); }
  }
}

export const pricingServiceController = new PricingController();
