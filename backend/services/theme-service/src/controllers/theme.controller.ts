import { Request, Response, NextFunction } from 'express';
import { themeService } from '../services/theme.service';

export class ThemeController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const themes = await themeService.list(req.headers['x-tenant-id'] as string);
      res.json({ success: true, data: themes });
    } catch (error) { next(error); }
  }

  async listSystem(req: Request, res: Response, next: NextFunction) {
    try {
      const themes = await themeService.listSystem();
      res.json({ success: true, data: themes });
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const theme = await themeService.create(req.headers['x-tenant-id'] as string, req.body);
      res.status(201).json({ success: true, data: theme });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const theme = await themeService.update(req.headers['x-tenant-id'] as string, req.params.id, req.body);
      res.json({ success: true, data: theme });
    } catch (error) { next(error); }
  }

  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await themeService.apply(
        req.headers['x-tenant-id'] as string, req.params.id, req.body.websiteId
      );
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
}

export const themeController = new ThemeController();
