import { Router } from 'express';
import { versionController } from '../controllers/version.controller';

export const router = Router();

router.get('/', (req, res, next) => versionController.list(req, res, next));
router.get('/compare', (req, res, next) => versionController.compare(req, res, next));
router.get('/:id', (req, res, next) => versionController.get(req, res, next));
router.post('/:id/restore', (req, res, next) => versionController.restore(req, res, next));
