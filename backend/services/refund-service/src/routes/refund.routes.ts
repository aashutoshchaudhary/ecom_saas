import { Router } from 'express';
import { refundServiceController } from '../controllers/refund.controller';

const router = Router();

router.get('/', refundServiceController.list.bind(refundServiceController));
router.post('/', refundServiceController.create.bind(refundServiceController));
router.get('/:id', refundServiceController.get.bind(refundServiceController));
router.put('/:id', refundServiceController.update.bind(refundServiceController));
router.delete('/:id', refundServiceController.delete.bind(refundServiceController));

export { router };
