import { Router } from 'express';
import { internshipController } from '../controllers/internshipController';
import { validate } from '../middleware/validate';
import { createInternshipSchema, updateInternshipSchema } from '../validators/internshipValidators';
import { authenticate } from '../middleware/auth';
import { requireWritableStudent } from '../middleware/graduationLock';

const router = Router();

router.get('/', authenticate, internshipController.list);
router.get('/:id', authenticate, internshipController.getById);
router.post('/', authenticate, requireWritableStudent, validate(createInternshipSchema), internshipController.create);
router.patch('/:id', authenticate, requireWritableStudent, validate(updateInternshipSchema), internshipController.update);
router.delete('/:id', authenticate, requireWritableStudent, internshipController.remove);

export default router;
