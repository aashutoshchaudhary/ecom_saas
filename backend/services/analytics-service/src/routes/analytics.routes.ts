import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { validate } from '../middleware/validate';
import {
  trackEventSchema,
  getMetricsSchema,
  getDashboardSchema,
  getTrafficSourcesSchema,
  getTopProductsSchema,
} from '../validators/analytics.validator';

const router = Router();

router.post('/track', validate(trackEventSchema), analyticsController.trackEvent.bind(analyticsController));
router.get('/metrics', validate(getMetricsSchema), analyticsController.getMetrics.bind(analyticsController));
router.get('/dashboard', validate(getDashboardSchema), analyticsController.getDashboard.bind(analyticsController));
router.get('/traffic-sources', validate(getTrafficSourcesSchema), analyticsController.getTrafficSources.bind(analyticsController));
router.get('/top-products', validate(getTopProductsSchema), analyticsController.getTopProducts.bind(analyticsController));

export default router;
