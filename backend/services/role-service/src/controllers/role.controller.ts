import { Request, Response, NextFunction } from 'express';
import { roleService } from '../services/role.service';

export class RoleController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await roleService.list(req.headers['x-tenant-id'] as string, req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.create(req.headers['x-tenant-id'] as string, req.body);
      res.status(201).json({ success: true, data: role });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.update(req.headers['x-tenant-id'] as string, req.params.id, req.body);
      res.json({ success: true, data: role });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await roleService.delete(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async getPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await roleService.getPermissions(req.headers['x-tenant-id'] as string, req.params.id);
      res.json({ success: true, data: permissions });
    } catch (error) { next(error); }
  }

  async assignPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.assignPermissions(
        req.headers['x-tenant-id'] as string, req.params.id, req.body.permissions
      );
      res.json({ success: true, data: role });
    } catch (error) { next(error); }
  }

  async removePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.removePermission(
        req.headers['x-tenant-id'] as string, req.params.id, req.params.pid
      );
      res.json({ success: true, data: role });
    } catch (error) { next(error); }
  }

  async listAllPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await roleService.listAllPermissions();
      res.json({ success: true, data: permissions });
    } catch (error) { next(error); }
  }

  async getUserPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await roleService.getUserPermissions(
        req.params.id, req.headers['x-tenant-id'] as string
      );
      res.json({ success: true, data: permissions });
    } catch (error) { next(error); }
  }
}

export const roleController = new RoleController();
