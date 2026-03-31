import { Router } from 'express';
import { templateController } from '../controllers/template.controller';

export const router = Router();

router.get('/', (req, res, next) => templateController.list(req, res, next));
router.get('/industry/:industryId', (req, res, next) => templateController.getByIndustry(req, res, next));
router.get('/:id', (req, res, next) => templateController.get(req, res, next));
router.post('/', (req, res, next) => templateController.create(req, res, next));
router.post('/:id/apply', (req, res, next) => templateController.apply(req, res, next));
router.post('/:id/clone', (req, res, next) => templateController.clone(req, res, next));
