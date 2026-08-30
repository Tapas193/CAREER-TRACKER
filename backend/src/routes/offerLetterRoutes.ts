import { Router } from 'express';
import { placementController } from '../controllers/placementController';
import { validate } from '../middleware/validate';
import { createOfferLetterSchema, updateOfferLetterSchema } from '../validators/placementValidators';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

// Standalone access for offer letters (spec surface: /api/offer-letters)
router.get('/:id', authenticate, placementController.getOfferById);
router.get('/placement/:placementId', authenticate, placementController.getOfferByPlacement);
router.post('/', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(createOfferLetterSchema), placementController.createOffer);
router.patch('/:offerId', authenticate, requireRole(Role.ADMIN, Role.PLACEMENT_HEAD), validate(updateOfferLetterSchema), placementController.updateOffer);

export default router;
