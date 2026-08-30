import { Router } from 'express';
import { studentController } from '../controllers/studentController';
import { validate } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema } from '../validators/studentValidators';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

// Students can fetch "me"; admin/placement list all
router.get('/me', authenticate, studentController.me);
router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.PLACEMENT_HEAD),
  studentController.list
);

router.get(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN),
  studentController.getById
);

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN),
  validate(createStudentSchema),
  studentController.create
);

router.patch(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN),
  validate(updateStudentSchema),
  studentController.update
);

router.patch('/:id/activate', authenticate, requireRole(Role.ADMIN), studentController.activate);
router.patch('/:id/deactivate', authenticate, requireRole(Role.ADMIN), studentController.deactivate);
router.post('/:id/graduate', authenticate, requireRole(Role.ADMIN), studentController.graduate);
router.post('/:id/mark-alumni', authenticate, requireRole(Role.ADMIN), studentController.markAlumni);

export default router;
