import { Router } from 'express';
import { certificationController } from '../controllers/certificationController';
import { validate } from '../middleware/validate';
import { createCertificationSchema, updateCertificationSchema } from '../validators/certificationValidators';
import { authenticate } from '../middleware/auth';
import { requireWritableStudent } from '../middleware/graduationLock';

const router = Router();

router.get('/', authenticate, certificationController.list);
router.get('/:id', authenticate, certificationController.getById);
router.post('/', authenticate, requireWritableStudent, validate(createCertificationSchema), certificationController.create);
router.patch('/:id', authenticate, requireWritableStudent, validate(updateCertificationSchema), certificationController.update);
router.delete('/:id', authenticate, requireWritableStudent, certificationController.remove);

export default router;
