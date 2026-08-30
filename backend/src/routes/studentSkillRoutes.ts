import { Router } from 'express';
import { studentSkillController } from '../controllers/studentSkillController';
import { validate } from '../middleware/validate';
import { assignSkillSchema } from '../validators/studentSkillValidators';
import { authenticate } from '../middleware/auth';
import { requireWritableStudent } from '../middleware/graduationLock';

const router = Router();

router.get('/', authenticate, studentSkillController.list);
router.post('/', authenticate, requireWritableStudent, validate(assignSkillSchema), studentSkillController.assign);
router.delete('/:studentId/:skillId', authenticate, requireWritableStudent, studentSkillController.unassign);

export default router;
