import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.headers['x-user-id'] as string);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.headers['x-user-id'] as string, req.body);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteAccount(req.headers['x-user-id'] as string);
      res.json({ success: true, data: { message: 'Account deleted' } });
    } catch (error) { next(error); }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.listUsers(
        req.headers['x-tenant-id'] as string,
        req.query as any
      );
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  }

  async completeOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.completeOnboarding(req.headers['x-user-id'] as string);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  }

  async getUserTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await userService.getUserTenants(req.headers['x-user-id'] as string);
      res.json({ success: true, data: tenants });
    } catch (error) { next(error); }
  }
}

export const userController = new UserController();
