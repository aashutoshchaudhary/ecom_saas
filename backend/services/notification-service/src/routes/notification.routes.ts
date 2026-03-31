import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { validate } from '../middleware/validate';
import {
  sendNotificationSchema,
  getNotificationsSchema,
  markReadSchema,
  markAllReadSchema,
  updatePreferencesSchema,
  subscribePushSchema,
} from '../validators/notification.validator';

const router = Router();

router.post('/send', validate(sendNotificationSchema), notificationController.send.bind(notificationController));
router.get('/', validate(getNotificationsSchema), notificationController.getNotifications.bind(notificationController));
router.patch('/:notificationId/read', validate(markReadSchema), notificationController.markRead.bind(notificationController));
router.post('/read-all', validate(markAllReadSchema), notificationController.markAllRead.bind(notificationController));
router.put('/preferences', validate(updatePreferencesSchema), notificationController.updatePreferences.bind(notificationController));
router.get('/preferences', notificationController.getPreferences.bind(notificationController));
router.post('/push/subscribe', validate(subscribePushSchema), notificationController.subscribePush.bind(notificationController));

export { router };
