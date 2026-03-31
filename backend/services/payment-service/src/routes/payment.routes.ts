import { Router } from 'express';
import { paymentServiceController } from '../controllers/payment.controller';

const router = Router();

router.get('/', paymentServiceController.list.bind(paymentServiceController));
router.post('/', paymentServiceController.create.bind(paymentServiceController));
router.get('/:id', paymentServiceController.get.bind(paymentServiceController));
router.put('/:id', paymentServiceController.update.bind(paymentServiceController));
router.delete('/:id', paymentServiceController.delete.bind(paymentServiceController));

// Stripe webhook
router.post('/webhooks/stripe', async (req, res, next) => {
  try {
    const { paymentService } = await import('../services/payment.service');
    await paymentService.handleWebhook('STRIPE', req.body.type, req.body);
    res.json({ received: true });
  } catch (error) { next(error); }
});

export { router };
