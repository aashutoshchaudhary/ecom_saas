import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.create(req.headers['x-tenant-id'] as string, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.list(req.headers['x-tenant-id'] as string, req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.get(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.update(req.headers['x-tenant-id'] as string, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: { message: 'Product deleted' } });
    } catch (error) { next(error); }
  }

  async addVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.addVariant(req.headers['x-tenant-id'] as string, req.params.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async updateVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.updateVariant(req.headers['x-tenant-id'] as string, req.params.id, req.params.vid, req.body);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async deleteVariant(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteVariant(req.headers['x-tenant-id'] as string, req.params.id, req.params.vid);
      res.json({ success: true, data: { message: 'Variant deleted' } });
    } catch (error) { next(error); }
  }

  async bulkUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.bulkUpload(req.headers['x-tenant-id'] as string, (req as any).file);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
}

export const productController = new ProductController();
