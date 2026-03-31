import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';

export const router = Router();

router.get('/jobs', (req, res, next) => aiController.listJobs(req, res, next));
router.get('/jobs/:id', (req, res, next) => aiController.getJob(req, res, next));
router.post('/generate/website', (req, res, next) => aiController.generateWebsite(req, res, next));
router.post('/generate/page', (req, res, next) => aiController.generatePage(req, res, next));
router.post('/generate/section', (req, res, next) => aiController.generateSection(req, res, next));
router.post('/generate/content', (req, res, next) => aiController.generateContent(req, res, next));
router.post('/generate/image', (req, res, next) => aiController.generateImage(req, res, next));
router.post('/regenerate/:id', (req, res, next) => aiController.regenerate(req, res, next));
