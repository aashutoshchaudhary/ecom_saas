import { Router } from 'express';
import { reportingController } from '../controllers/reporting.controller';
import { validate } from '../middleware/validate';
import {
  generateReportSchema,
  getReportSchema,
  listReportsSchema,
  scheduleReportSchema,
  updateScheduleSchema,
} from '../validators/reporting.validator';

const router = Router();

router.post('/generate', validate(generateReportSchema), reportingController.generateReport.bind(reportingController));
router.get('/', validate(listReportsSchema), reportingController.listReports.bind(reportingController));
router.get('/:reportId', validate(getReportSchema), reportingController.getReport.bind(reportingController));
router.post('/schedules', validate(scheduleReportSchema), reportingController.scheduleReport.bind(reportingController));
router.patch('/schedules/:scheduleId', validate(updateScheduleSchema), reportingController.updateSchedule.bind(reportingController));
router.get('/schedules/list', reportingController.listSchedules.bind(reportingController));

export default router;
