import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { validate } from '../middleware/validate';
import { listNotificationsQuerySchema } from '../validators/notificationValidators';
import { authenticate } from '../middleware/auth';

const router = Router();

// Every authenticated user (ADMIN / STUDENT / PLACEMENT_HEAD) sees only their
// own notifications. Ownership is derived from the authenticated user (req.user),
// never from request body/query. Notifications cannot be created through the API.
router.get('/', authenticate, validate(listNotificationsQuerySchema, 'query'), notificationController.list);
router.get('/unread-count', authenticate, notificationController.unreadCount);
router.patch('/read-all', authenticate, notificationController.markAllRead);
router.patch('/:id/read', authenticate, notificationController.markRead);
router.delete('/:id', authenticate, notificationController.remove);

export default router;