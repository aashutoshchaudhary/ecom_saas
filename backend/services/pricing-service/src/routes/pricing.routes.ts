import { Router } from 'express';
import { pricingServiceController } from '../controllers/pricing.controller';
import { pricingService } from '../services/pricing.service';

const router = Router();

// Price CRUD
router.get('/', pricingServiceController.list.bind(pricingServiceController));
router.post('/', pricingServiceController.create.bind(pricingServiceController));
router.get('/calculate', async (req, res, next) => {
  try {
    const q = req.query as any;
    const result = await pricingService.calculatePrice(
      req.headers['x-tenant-id'] as string, q.productId, q.variantId, q.currency || 'USD', parseInt(q.quantity || '1', 10),
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});
router.get('/:id', pricingServiceController.get.bind(pricingServiceController));
router.put('/:id', pricingServiceController.update.bind(pricingServiceController));
router.delete('/:id', pricingServiceController.delete.bind(pricingServiceController));

// Discount endpoints
router.get('/discounts', async (req, res, next) => {
  try {
    const result = await pricingService.listDiscounts(req.headers['x-tenant-id'] as string, req.query as any);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
});
router.post('/discounts', async (req, res, next) => {
  try {
    const result = await pricingService.createDiscount(req.headers['x-tenant-id'] as string, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
});
router.post('/discounts/validate', async (req, res, next) => {
  try {
    const result = await pricingService.validateDiscount(
      req.headers['x-tenant-id'] as string, req.body.code, req.body.orderAmount,
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});
router.get('/discounts/:id', async (req, res, next) => {
  try {
    const result = await pricingService.getDiscount(req.headers['x-tenant-id'] as string, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});
router.put('/discounts/:id', async (req, res, next) => {
  try {
    const result = await pricingService.updateDiscount(req.headers['x-tenant-id'] as string, req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});
router.delete('/discounts/:id', async (req, res, next) => {
  try {
    await pricingService.deleteDiscount(req.headers['x-tenant-id'] as string, req.params.id);
    res.json({ success: true, data: { message: 'Discount deactivated' } });
  } catch (error) { next(error); }
});

// Currency rates
router.get('/currencies/:base', async (req, res, next) => {
  try {
    const rates = await pricingService.getCurrencyRates(req.params.base);
    res.json({ success: true, data: rates });
  } catch (error) { next(error); }
});
router.put('/currencies/:base/:target', async (req, res, next) => {
  try {
    const result = await pricingService.updateCurrencyRate(req.params.base, req.params.target, req.body.rate);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});
router.post('/convert', async (req, res, next) => {
  try {
    const amount = await pricingService.convertPrice(req.body.amount, req.body.from, req.body.to);
    res.json({ success: true, data: { amount, from: req.body.from, to: req.body.to } });
  } catch (error) { next(error); }
});

export { router };
