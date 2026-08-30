import { Router } from 'express';
import { skillController } from '../controllers/skillController';
import { validate } from '../middleware/validate';
import { createSkillSchema, updateSkillSchema } from '../validators/skillValidators';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, skillController.list);
router.get('/:id', authenticate, skillController.getById);

router.post('/', authenticate, requireRole(Role.ADMIN), validate(createSkillSchema), skillController.create);
router.patch('/:id', authenticate, requireRole(Role.ADMIN), validate(updateSkillSchema), skillController.update);
router.delete('/:id', authenticate, requireRole(Role.ADMIN), skillController.remove);

export default router;
