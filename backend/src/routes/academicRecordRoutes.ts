import { Router } from 'express';
import { academicRecordController } from '../controllers/academicRecordController';
import { validate } from '../middleware/validate';
import { createAcademicRecordSchema, updateAcademicRecordSchema } from '../validators/academicRecordValidators';
import { authenticate } from '../middleware/auth';
import { requireWritableStudent } from '../middleware/graduationLock';

const router = Router();

router.get('/', authenticate, academicRecordController.list);
router.get('/:id', authenticate, academicRecordController.getById);
router.post('/', authenticate, requireWritableStudent, validate(createAcademicRecordSchema), academicRecordController.create);
router.patch('/:id', authenticate, requireWritableStudent, validate(updateAcademicRecordSchema), academicRecordController.update);
router.delete('/:id', authenticate, requireWritableStudent, academicRecordController.remove);

export default router;
