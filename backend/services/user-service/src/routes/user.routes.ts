import { Router } from 'express';
import { userController } from '../controllers/user.controller';

export const router = Router();

router.get('/me', (req, res, next) => userController.getProfile(req, res, next));
router.put('/me', (req, res, next) => userController.updateProfile(req, res, next));
router.delete('/me', (req, res, next) => userController.deleteAccount(req, res, next));
router.put('/me/onboarding', (req, res, next) => userController.completeOnboarding(req, res, next));
router.get('/me/tenants', (req, res, next) => userController.getUserTenants(req, res, next));
router.get('/', (req, res, next) => userController.listUsers(req, res, next));
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));
