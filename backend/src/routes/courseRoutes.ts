import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { validate } from '../middleware/validate';
import { createCourseSchema, updateCourseSchema } from '../validators/courseValidators';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, courseController.list);
router.get('/:id', authenticate, courseController.getById);

router.post('/', authenticate, requireRole(Role.ADMIN), validate(createCourseSchema), courseController.create);
router.patch('/:id', authenticate, requireRole(Role.ADMIN), validate(updateCourseSchema), courseController.update);
router.delete('/:id', authenticate, requireRole(Role.ADMIN), courseController.remove);

export default router;
