import { Router } from 'express';
import { uploadController } from '../controllers/uploadController';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, upload.single('file'), uploadController.upload);

export default router;
