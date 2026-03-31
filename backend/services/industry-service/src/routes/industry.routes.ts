import { Router } from 'express';
import { industryController } from '../controllers/industry.controller';

export const router = Router();

router.get('/', (req, res, next) => industryController.list(req, res, next));
router.get('/:id', (req, res, next) => industryController.getById(req, res, next));
router.get('/:id/templates', (req, res, next) => industryController.getTemplates(req, res, next));
router.get('/:id/plugins', (req, res, next) => industryController.getPlugins(req, res, next));
