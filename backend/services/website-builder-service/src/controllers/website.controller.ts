import { Request, Response, NextFunction } from 'express';
import { websiteService } from '../services/website.service';

export class WebsiteController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const website = await websiteService.create(req.headers['x-tenant-id'] as string, req.body);
      res.status(201).json({ success: true, data: website });
    } catch (error) { next(error); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await websiteService.list(req.headers['x-tenant-id'] as string, req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const website = await websiteService.get(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: website });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const website = await websiteService.update(req.headers['x-tenant-id'] as string, req.params.id, req.body);
      res.json({ success: true, data: website });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await websiteService.delete(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async updateStructure(req: Request, res: Response, next: NextFunction) {
    try {
      const website = await websiteService.updateStructure(
        req.headers['x-tenant-id'] as string, req.params.id, req.body
      );
      res.json({ success: true, data: website });
    } catch (error) { next(error); }
  }

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const website = await websiteService.publish(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: website });
    } catch (error) { next(error); }
  }

  async unpublish(req: Request, res: Response, next: NextFunction) {
    try {
      const website = await websiteService.unpublish(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: website });
    } catch (error) { next(error); }
  }

  async createPage(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await websiteService.createPage(
        req.headers['x-tenant-id'] as string, req.params.id, req.body
      );
      res.status(201).json({ success: true, data: page });
    } catch (error) { next(error); }
  }

  async listPages(req: Request, res: Response, next: NextFunction) {
    try {
      const pages = await websiteService.listPages(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: pages });
    } catch (error) { next(error); }
  }

  async updatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await websiteService.updatePage(
        req.headers['x-tenant-id'] as string, req.params.id, req.params.pageId, req.body
      );
      res.json({ success: true, data: page });
    } catch (error) { next(error); }
  }

  async deletePage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await websiteService.deletePage(
        req.headers['x-tenant-id'] as string, req.params.id, req.params.pageId
      );
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async updateSections(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await websiteService.updateSections(
        req.headers['x-tenant-id'] as string, req.params.id, req.params.pageId, req.body.sections
      );
      res.json({ success: true, data: page });
    } catch (error) { next(error); }
  }

  async duplicatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await websiteService.duplicatePage(
        req.headers['x-tenant-id'] as string, req.params.id, req.params.pageId
      );
      res.status(201).json({ success: true, data: page });
    } catch (error) { next(error); }
  }
}

export const websiteController = new WebsiteController();
