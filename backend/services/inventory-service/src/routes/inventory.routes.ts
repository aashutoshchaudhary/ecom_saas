import { Router } from 'express';
import { inventoryServiceController } from '../controllers/inventory.controller';

const router = Router();

router.get('/', inventoryServiceController.list.bind(inventoryServiceController));
router.post('/', inventoryServiceController.create.bind(inventoryServiceController));
router.get('/:id', inventoryServiceController.get.bind(inventoryServiceController));
router.put('/:id', inventoryServiceController.update.bind(inventoryServiceController));
router.delete('/:id', inventoryServiceController.delete.bind(inventoryServiceController));

// Reserve/release stock endpoints
router.post('/reserve', async (req, res, next) => {
  try {
    const { inventoryService } = await import('../services/inventory.service');
    const result = await inventoryService.reserveStock(req.headers['x-tenant-id'] as string, req.body.sku, req.body.quantity);
    res.json({ success: true, data: { reserved: result } });
  } catch (error) { next(error); }
});

router.post('/release', async (req, res, next) => {
  try {
    const { inventoryService } = await import('../services/inventory.service');
    await inventoryService.releaseStock(req.headers['x-tenant-id'] as string, req.body.sku, req.body.quantity);
    res.json({ success: true, data: { released: true } });
  } catch (error) { next(error); }
});

router.post('/deduct', async (req, res, next) => {
  try {
    const { inventoryService } = await import('../services/inventory.service');
    await inventoryService.deductStock(req.headers['x-tenant-id'] as string, req.body.sku, req.body.quantity);
    res.json({ success: true, data: { deducted: true } });
  } catch (error) { next(error); }
});

export { router };
