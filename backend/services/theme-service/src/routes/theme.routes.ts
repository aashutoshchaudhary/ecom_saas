import { Router } from 'express';
import { themeController } from '../controllers/theme.controller';

export const router = Router();

router.get('/system', (req, res, next) => themeController.listSystem(req, res, next));
router.get('/', (req, res, next) => themeController.list(req, res, next));
router.post('/', (req, res, next) => themeController.create(req, res, next));
router.put('/:id', (req, res, next) => themeController.update(req, res, next));
router.post('/:id/apply', (req, res, next) => themeController.apply(req, res, next));
