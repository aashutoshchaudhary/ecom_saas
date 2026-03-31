import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';

export class AiController {
  async generateWebsite(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await aiService.generateWebsite(req.headers['x-tenant-id'] as string, req.body);
      res.status(201).json({ success: true, data: job });
    } catch (error) { next(error); }
  }

  async generatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await aiService.generatePage(req.headers['x-tenant-id'] as string, req.body);
      res.status(201).json({ success: true, data: job });
    } catch (error) { next(error); }
  }

  async generateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await aiService.generateSection(req.headers['x-tenant-id'] as string, req.body);
      res.status(201).json({ success: true, data: job });
    } catch (error) { next(error); }
  }

  async generateContent(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await aiService.generateContent(req.headers['x-tenant-id'] as string, req.body);
      res.status(201).json({ success: true, data: job });
    } catch (error) { next(error); }
  }

  async generateImage(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await aiService.generateImage(req.headers['x-tenant-id'] as string, req.body);
      res.status(201).json({ success: true, data: job });
    } catch (error) { next(error); }
  }

  async regenerate(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await aiService.regenerate(req.headers['x-tenant-id'] as string, req.params.id);
      res.status(201).json({ success: true, data: job });
    } catch (error) { next(error); }
  }

  async listJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiService.listJobs(req.headers['x-tenant-id'] as string, req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await aiService.getJob(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: job });
    } catch (error) { next(error); }
  }
}

export const aiController = new AiController();
