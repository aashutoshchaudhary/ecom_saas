import { Router } from 'express';
import { pluginController } from '../controllers/plugin.controller';
import { validate } from '../middleware/validate';
import {
  installPluginSchema,
  uninstallPluginSchema,
  togglePluginSchema,
  listInstalledSchema,
  listAvailableSchema,
  getPluginConfigSchema,
  updatePluginConfigSchema,
} from '../validators/plugin.validator';

const router = Router();

router.get('/available', validate(listAvailableSchema), pluginController.listAvailable.bind(pluginController));
router.get('/installed', validate(listInstalledSchema), pluginController.listInstalled.bind(pluginController));
router.post('/install', validate(installPluginSchema), pluginController.install.bind(pluginController));
router.delete('/:installationId', validate(uninstallPluginSchema), pluginController.uninstall.bind(pluginController));
router.patch('/:installationId/enable', validate(togglePluginSchema), pluginController.enable.bind(pluginController));
router.patch('/:installationId/disable', validate(togglePluginSchema), pluginController.disable.bind(pluginController));
router.get('/:installationId/config', validate(getPluginConfigSchema), pluginController.getConfig.bind(pluginController));
router.put('/:installationId/config', validate(updatePluginConfigSchema), pluginController.updateConfig.bind(pluginController));

export default router;
