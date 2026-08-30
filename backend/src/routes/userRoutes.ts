import { Router } from 'express';
import { userController } from '../controllers/userController';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../validators/userValidators';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, requireRole(Role.ADMIN));

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.post('/', validate(createUserSchema), userController.create);
router.patch('/:id', validate(updateUserSchema), userController.update);

export default router;
