import { Router } from 'express';
import { authController } from '../controllers/authController';
import { ssoController } from '../controllers/ssoController';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validators/authValidators';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

// University SSO (OIDC). Status is always available; the flow returns 503
// until SSO_PROVIDER / SSO_ISSUER / SSO_CLIENT_ID are configured.
router.get('/sso/status', ssoController.status);
router.get('/sso', ssoController.initiate);
router.get('/sso/callback', ssoController.callback);

export default router;
