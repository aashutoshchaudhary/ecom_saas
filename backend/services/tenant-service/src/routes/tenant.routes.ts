import { Router } from 'express';
import { tenantController } from '../controllers/tenant.controller';

export const router = Router();

router.get('/', (req, res, next) => tenantController.list(req, res, next));
router.post('/', (req, res, next) => tenantController.create(req, res, next));
router.get('/:id', (req, res, next) => tenantController.get(req, res, next));
router.put('/:id', (req, res, next) => tenantController.update(req, res, next));
router.delete('/:id', (req, res, next) => tenantController.delete(req, res, next));
router.post('/:id/industries', (req, res, next) => tenantController.addIndustry(req, res, next));
router.delete('/:id/industries/:iid', (req, res, next) => tenantController.removeIndustry(req, res, next));
router.put('/:id/settings', (req, res, next) => tenantController.updateSettings(req, res, next));
router.put('/:id/subscription', (req, res, next) => tenantController.updateSubscription(req, res, next));
