import { Router } from 'express';
import { alumniFeedbackController } from '../controllers/alumniFeedbackController';
import { validate } from '../middleware/validate';
import { createAlumniFeedbackSchema, updateAlumniFeedbackSchema } from '../validators/alumniFeedbackValidators';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, alumniFeedbackController.list);
router.get('/:id', authenticate, alumniFeedbackController.getById);
router.post('/', authenticate, validate(createAlumniFeedbackSchema), alumniFeedbackController.create);
router.patch('/:id', authenticate, validate(updateAlumniFeedbackSchema), alumniFeedbackController.update);
router.delete('/:id', authenticate, alumniFeedbackController.remove);

export default router;
