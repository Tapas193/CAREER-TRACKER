import { Router } from 'express';
import { careerHistoryController } from '../controllers/careerHistoryController';
import { validate } from '../middleware/validate';
import { createCareerHistorySchema, updateCareerHistorySchema } from '../validators/careerHistoryValidators';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, careerHistoryController.list);
router.get('/:id', authenticate, careerHistoryController.getById);
router.post('/', authenticate, validate(createCareerHistorySchema), careerHistoryController.create);
router.patch('/:id', authenticate, validate(updateCareerHistorySchema), careerHistoryController.update);
router.delete('/:id', authenticate, careerHistoryController.remove);

export default router;
