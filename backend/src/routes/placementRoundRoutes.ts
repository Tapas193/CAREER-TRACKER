import { Router } from 'express';
import { placementController } from '../controllers/placementController';
import { validate } from '../middleware/validate';
import { createPlacementRoundSchema, updatePlacementRoundSchema } from '../validators/placementValidators';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

// Standalone access to placement rounds (spec surface: /api/placement-rounds)
// Rounds are embedded under placements; these expose list-by-placement and CRUD.
router.get('/:placementId', authenticate, placementController.getRounds);
router.get('/:placementId/:roundId', authenticate, placementController.getRoundById);
router.post('/', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(createPlacementRoundSchema), placementController.createRound);
router.patch('/:roundId', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(updatePlacementRoundSchema), placementController.updateRound);
router.delete('/:roundId', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), placementController.removeRound);

export default router;
