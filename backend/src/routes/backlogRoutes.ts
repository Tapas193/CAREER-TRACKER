import { Router } from 'express';
import { backlogController } from '../controllers/backlogController';
import { validate } from '../middleware/validate';
import { createBacklogSchema, updateBacklogSchema } from '../validators/backlogValidators';
import { authenticate } from '../middleware/auth';
import { requireWritableStudent } from '../middleware/graduationLock';

const router = Router();

router.get('/', authenticate, backlogController.list);
router.get('/:id', authenticate, backlogController.getById);
router.post('/', authenticate, requireWritableStudent, validate(createBacklogSchema), backlogController.create);
router.patch('/:id', authenticate, requireWritableStudent, validate(updateBacklogSchema), backlogController.update);
router.delete('/:id', authenticate, requireWritableStudent, backlogController.remove);

export default router;
