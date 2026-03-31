import { Router } from 'express';
import { roleController } from '../controllers/role.controller';

export const router = Router();

router.get('/permissions', (req, res, next) => roleController.listAllPermissions(req, res, next));
router.get('/', (req, res, next) => roleController.list(req, res, next));
router.post('/', (req, res, next) => roleController.create(req, res, next));
router.put('/:id', (req, res, next) => roleController.update(req, res, next));
router.delete('/:id', (req, res, next) => roleController.delete(req, res, next));
router.get('/:id/permissions', (req, res, next) => roleController.getPermissions(req, res, next));
router.post('/:id/permissions', (req, res, next) => roleController.assignPermissions(req, res, next));
router.delete('/:id/permissions/:pid', (req, res, next) => roleController.removePermission(req, res, next));
router.get('/users/:id/permissions', (req, res, next) => roleController.getUserPermissions(req, res, next));
