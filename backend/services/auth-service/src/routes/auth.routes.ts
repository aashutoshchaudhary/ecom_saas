import { Router } from 'express';
import { validate } from '@siteforge/shared';
import { authController } from '../controllers/auth.controller';
import {
  registerSchema, loginSchema, refreshTokenSchema,
  forgotPasswordSchema, resetPasswordSchema, verifyMfaSchema,
} from '../validators/auth.validator';

export const router = Router();

router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/refresh', validate(refreshTokenSchema), (req, res, next) => authController.refreshToken(req, res, next));
router.post('/forgot-password', validate(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', validate(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));
router.post('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/mfa/setup', (req, res, next) => authController.setupMfa(req, res, next));
router.post('/mfa/verify', validate(verifyMfaSchema), (req, res, next) => authController.verifyMfa(req, res, next));
