import { Request, Response, NextFunction } from 'express';
import { industryService } from '../services/industry.service';

export class IndustryController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const industries = await industryService.list();
      res.json({ success: true, data: industries });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const industry = await industryService.getById(req.params.id);
      res.json({ success: true, data: industry });
    } catch (error) { next(error); }
  }

  async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await industryService.getTemplates(req.params.id);
      res.json({ success: true, data: templates });
    } catch (error) { next(error); }
  }

  async getPlugins(req: Request, res: Response, next: NextFunction) {
    try {
      const plugins = await industryService.getPlugins(req.params.id);
      res.json({ success: true, data: plugins });
    } catch (error) { next(error); }
  }
}

export const industryController = new IndustryController();
