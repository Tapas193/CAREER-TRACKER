import { Router } from 'express';
import { placementController } from '../controllers/placementController';
import { validate } from '../middleware/validate';
import { createRoundFeedbackSchema, updateRoundFeedbackSchema } from '../validators/placementValidators';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

// Standalone access for round feedback (spec surface: /api/round-feedback)
// Creation is Placement Head / Admin only (Decision 3.3).
router.post('/', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(createRoundFeedbackSchema), placementController.createFeedback);
router.patch('/:feedbackId', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(updateRoundFeedbackSchema), placementController.updateFeedback);

export default router;
