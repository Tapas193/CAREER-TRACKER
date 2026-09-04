import { Router } from 'express';
import { preparationController } from '../controllers/preparationController';
import { validate } from '../middleware/validate';
import {
  createPreparationResourceSchema,
  updatePreparationResourceSchema,
} from '../validators/preparationValidators';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

// Students (any authenticated user) can VIEW resources.
router.get('/', authenticate, preparationController.list);
router.get('/:id', authenticate, preparationController.getById);

// Only ADMIN can modify resources.
router.post('/', authenticate, requireRole(Role.ADMIN), validate(createPreparationResourceSchema), preparationController.create);
router.patch('/:id', authenticate, requireRole(Role.ADMIN), validate(updatePreparationResourceSchema), preparationController.update);
router.delete('/:id', authenticate, requireRole(Role.ADMIN), preparationController.remove);

export default router;
