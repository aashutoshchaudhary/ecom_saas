import { Router } from 'express';
import { orderServiceController } from '../controllers/order.controller';

const router = Router();

router.get('/', orderServiceController.list.bind(orderServiceController));
router.post('/', orderServiceController.create.bind(orderServiceController));
router.get('/stats', async (req, res, next) => {
  try {
    const { orderService } = await import('../services/order.service');
    const stats = await orderService.getStats(req.headers['x-tenant-id'] as string);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
});
router.get('/:id', orderServiceController.get.bind(orderServiceController));
router.put('/:id', orderServiceController.update.bind(orderServiceController));
router.delete('/:id', orderServiceController.delete.bind(orderServiceController));

export { router };
