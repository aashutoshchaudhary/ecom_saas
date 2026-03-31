import { Router } from 'express';
import { posController } from '../controllers/pos.controller';
import { validate } from '../middleware/validate';
import {
  connectPosSchema,
  disconnectPosSchema,
  syncSchema,
  webhookSchema,
  listConnectionsSchema,
  getSyncLogsSchema,
} from '../validators/pos.validator';

const router = Router();

router.get('/connections', validate(listConnectionsSchema), posController.listConnections.bind(posController));
router.post('/connect', validate(connectPosSchema), posController.connect.bind(posController));
router.delete('/:connectionId', validate(disconnectPosSchema), posController.disconnect.bind(posController));
router.post('/:connectionId/sync/orders', validate(syncSchema), posController.syncOrders.bind(posController));
router.post('/:connectionId/sync/products', validate(syncSchema), posController.syncProducts.bind(posController));
router.post('/:connectionId/sync/inventory', validate(syncSchema), posController.syncInventory.bind(posController));
router.get('/:connectionId/sync-logs', validate(getSyncLogsSchema), posController.getSyncLogs.bind(posController));
router.post('/webhook/:provider', validate(webhookSchema), posController.handleWebhook.bind(posController));

export default router;
