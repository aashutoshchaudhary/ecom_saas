import { Router } from 'express';
import multer from 'multer';
import { productController } from '../controllers/product.controller';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.get('/', productController.list.bind(productController));
router.post('/', productController.create.bind(productController));
router.get('/:id', productController.get.bind(productController));
router.put('/:id', productController.update.bind(productController));
router.delete('/:id', productController.delete.bind(productController));
router.post('/:id/variants', productController.addVariant.bind(productController));
router.put('/:id/variants/:vid', productController.updateVariant.bind(productController));
router.delete('/:id/variants/:vid', productController.deleteVariant.bind(productController));
router.post('/bulk-upload', upload.single('file'), productController.bulkUpload.bind(productController));

export { router };
