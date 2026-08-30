import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema } from '../validators/projectValidators';
import { authenticate } from '../middleware/auth';
import { requireWritableStudent } from '../middleware/graduationLock';

const router = Router();

router.get('/', authenticate, projectController.list);
router.get('/:id', authenticate, projectController.getById);
router.post('/', authenticate, requireWritableStudent, validate(createProjectSchema), projectController.create);
router.patch('/:id', authenticate, requireWritableStudent, validate(updateProjectSchema), projectController.update);
router.delete('/:id', authenticate, requireWritableStudent, projectController.remove);

export default router;
