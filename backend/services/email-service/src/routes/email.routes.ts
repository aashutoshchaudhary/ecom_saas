import { Router } from 'express';
import { emailController } from '../controllers/email.controller';
import { validate } from '../middleware/validate';
import {
  sendEmailSchema,
  sendBulkEmailSchema,
  createTemplateSchema,
  listTemplatesSchema,
  listLogsSchema,
} from '../validators/email.validator';

const router = Router();

router.post('/send', validate(sendEmailSchema), emailController.sendEmail.bind(emailController));
router.post('/send-bulk', validate(sendBulkEmailSchema), emailController.sendBulkEmail.bind(emailController));
router.get('/templates', validate(listTemplatesSchema), emailController.listTemplates.bind(emailController));
router.post('/templates', validate(createTemplateSchema), emailController.createTemplate.bind(emailController));
router.get('/logs', validate(listLogsSchema), emailController.listLogs.bind(emailController));

export { router };
