import { Router } from 'express';
import multer from 'multer';
import { mediaController } from '../controllers/media.controller';
import { validate } from '../middleware/validate';
import {
  getFileSchema,
  deleteFileSchema,
  listFilesSchema,
  getSignedUrlSchema,
} from '../validators/media.validator';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const router = Router();

router.post('/upload', upload.single('file'), mediaController.uploadFile.bind(mediaController));
router.get('/', validate(listFilesSchema), mediaController.listFiles.bind(mediaController));
router.get('/:fileId', validate(getFileSchema), mediaController.getFile.bind(mediaController));
router.delete('/:fileId', validate(deleteFileSchema), mediaController.deleteFile.bind(mediaController));
router.post('/signed-url', validate(getSignedUrlSchema), mediaController.getSignedUrl.bind(mediaController));

export default router;
