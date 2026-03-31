import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { validate } from '../middleware/validate';
import {
  createLogSchema,
  getLogsSchema,
  searchLogsSchema,
  exportLogsSchema,
} from '../validators/audit.validator';

const router = Router();

router.post('/', validate(createLogSchema), auditController.createLog.bind(auditController));
router.get('/', validate(getLogsSchema), auditController.getLogs.bind(auditController));
router.post('/search', validate(searchLogsSchema), auditController.searchLogs.bind(auditController));
router.post('/export', validate(exportLogsSchema), auditController.exportLogs.bind(auditController));

export default router;
