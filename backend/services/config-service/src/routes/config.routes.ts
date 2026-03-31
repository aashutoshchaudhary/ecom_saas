import { Router } from 'express';
import { configController } from '../controllers/config.controller';
import { validate } from '../middleware/validate';
import {
  getConfigSchema,
  updateConfigSchema,
  deleteConfigSchema,
  getFeatureFlagsSchema,
  createFeatureFlagSchema,
  toggleFeatureFlagSchema,
  updateFeatureFlagSchema,
} from '../validators/config.validator';

const router = Router();

// Service config routes
router.get('/', validate(getConfigSchema), configController.getConfig.bind(configController));
router.put('/', validate(updateConfigSchema), configController.updateConfig.bind(configController));
router.delete('/:configId', validate(deleteConfigSchema), configController.deleteConfig.bind(configController));

// Feature flag routes
router.get('/flags', validate(getFeatureFlagsSchema), configController.getFeatureFlags.bind(configController));
router.post('/flags', validate(createFeatureFlagSchema), configController.createFeatureFlag.bind(configController));
router.patch('/flags/:flagId/toggle', validate(toggleFeatureFlagSchema), configController.toggleFeatureFlag.bind(configController));
router.put('/flags/:flagId', validate(updateFeatureFlagSchema), configController.updateFeatureFlag.bind(configController));

export default router;
