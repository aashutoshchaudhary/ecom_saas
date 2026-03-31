import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body, {
        ip: req.ip, userAgent: req.headers['user-agent'],
      });
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.substring(7);
      if (token) await authService.logout(token);
      res.json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (error) { next(error); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({ success: true, data: { message: 'If the email exists, a reset link has been sent' } });
    } catch (error) { next(error); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.json({ success: true, data: { message: 'Password reset successfully' } });
    } catch (error) { next(error); }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.verifyEmail(req.body.token);
      res.json({ success: true, data: { message: 'Email verified successfully' } });
    } catch (error) { next(error); }
  }

  async setupMfa(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.setupMfa(req.headers['x-user-id'] as string);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async verifyMfa(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyMfaSetup(
        req.headers['x-user-id'] as string, req.body.code
      );
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
}

export const authController = new AuthController();
