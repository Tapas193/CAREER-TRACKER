import { Router } from 'express';
import { placementController } from '../controllers/placementController';
import { validate } from '../middleware/validate';
import {
  createPlacementSchema,
  updatePlacementSchema,
  createDrivePlacementsSchema,
  createPlacementRoundSchema,
  updatePlacementRoundSchema,
  createRoundFeedbackSchema,
  updateRoundFeedbackSchema,
  createOfferLetterSchema,
  updateOfferLetterSchema,
} from '../validators/placementValidators';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { requireWritableStudent } from '../middleware/graduationLock';
import { Role } from '@prisma/client';

const router = Router();

// ===== Placements =====
router.get('/', authenticate, placementController.list);
router.get('/drives', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), placementController.listDrives);
router.get('/eligible-students', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), placementController.eligibleStudents);
router.get('/:id', authenticate, placementController.getById);

// applying / creating a placement: students apply (writable while active), head creates
router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.PLACEMENT_HEAD, Role.STUDENT),
  requireWritableStudent,
  validate(createPlacementSchema),
  placementController.create
);

// Head creates a drive for many students (Decision 2)
router.post(
  '/drive/create',
  authenticate,
  requireRole(Role.ADMIN, Role.PLACEMENT_HEAD),
  validate(createDrivePlacementsSchema),
  placementController.createDrive
);

router.patch('/:id', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD, Role.STUDENT), requireWritableStudent, validate(updatePlacementSchema), placementController.update);
router.delete('/:id', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), placementController.remove);

// ===== Rounds =====
router.get('/:placementId/rounds', authenticate, placementController.getRounds);
router.post('/:placementId/rounds', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(createPlacementRoundSchema), placementController.createRound);
router.get('/:placementId/rounds/:roundId', authenticate, placementController.getRoundById);
router.patch('/:placementId/rounds/:roundId', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(updatePlacementRoundSchema), placementController.updateRound);
router.delete('/:placementId/rounds/:roundId', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), placementController.removeRound);

// ===== Round Feedback (Placement Head only) =====
router.get('/:placementId/rounds/:roundId/feedback', authenticate, placementController.getRoundById); // feedback embedded
router.post('/:placementId/rounds/:roundId/feedback', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(createRoundFeedbackSchema), placementController.createFeedback);
router.patch('/:placementId/rounds/:roundId/feedback/:feedbackId', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(updateRoundFeedbackSchema), placementController.updateFeedback);

// ===== Offer Letters =====
router.get('/:placementId/offer', authenticate, placementController.getOfferByPlacement);
router.post('/:placementId/offer', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(createOfferLetterSchema), placementController.createOffer);
router.patch('/:placementId/offer/:offerId', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(updateOfferLetterSchema), placementController.updateOffer);

export default router;
