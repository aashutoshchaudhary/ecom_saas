import { Router } from 'express';
import { walletServiceController } from '../controllers/wallet.controller';
import { walletService } from '../services/wallet.service';

const router = Router();

router.get('/', walletServiceController.get.bind(walletServiceController));
router.post('/', walletServiceController.create.bind(walletServiceController));

router.get('/balance', async (req, res, next) => {
  try {
    const balance = await walletService.getBalance(req.headers['x-tenant-id'] as string);
    res.json({ success: true, data: { balance } });
  } catch (error) { next(error); }
});

router.get('/transactions', walletServiceController.list.bind(walletServiceController));

router.post('/topup', async (req, res, next) => {
  try {
    const result = await walletService.topUp(req.headers['x-tenant-id'] as string, req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/deduct', async (req, res, next) => {
  try {
    const result = await walletService.deductCredits(
      req.headers['x-tenant-id'] as string, req.body.amount, req.body.description, req.body.referenceId,
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/packages', async (_req, res, next) => {
  try {
    const packages = await walletService.listPackages();
    res.json({ success: true, data: packages });
  } catch (error) { next(error); }
});

router.put('/:id', walletServiceController.update.bind(walletServiceController));

export { router };
