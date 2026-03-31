import { Router } from 'express';
import { websiteController } from '../controllers/website.controller';

export const router = Router();

router.get('/', (req, res, next) => websiteController.list(req, res, next));
router.post('/', (req, res, next) => websiteController.create(req, res, next));
router.get('/:id', (req, res, next) => websiteController.get(req, res, next));
router.put('/:id', (req, res, next) => websiteController.update(req, res, next));
router.delete('/:id', (req, res, next) => websiteController.delete(req, res, next));
router.put('/:id/structure', (req, res, next) => websiteController.updateStructure(req, res, next));
router.post('/:id/publish', (req, res, next) => websiteController.publish(req, res, next));
router.post('/:id/unpublish', (req, res, next) => websiteController.unpublish(req, res, next));
router.get('/:id/pages', (req, res, next) => websiteController.listPages(req, res, next));
router.post('/:id/pages', (req, res, next) => websiteController.createPage(req, res, next));
router.put('/:id/pages/:pageId', (req, res, next) => websiteController.updatePage(req, res, next));
router.delete('/:id/pages/:pageId', (req, res, next) => websiteController.deletePage(req, res, next));
router.put('/:id/pages/:pageId/sections', (req, res, next) => websiteController.updateSections(req, res, next));
router.post('/:id/pages/:pageId/duplicate', (req, res, next) => websiteController.duplicatePage(req, res, next));
