import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { config } from '../config';
import {
  isSsoConfigured,
  ssoStatus,
  createSsoSession,
  buildAuthorizationUrl,
  completeSsoLogin,
  ssoRoleForEmail,
} from '../services/ssoService';
import { userRepo } from '../repositories/userRepo';
import { signToken } from '../utils/jwt';
import { hashPassword } from '../utils/password';
import { asyncHandler } from '../utils/http';
import { authCookieOptions } from '../utils/cookies';

const STATE_COOKIE = 'sso_state';
const STATE_TTL = 10 * 60 * 1000; // 10 minutes

function redirectUri(req: Request): string {
  if (config.ssoRedirectUri) return config.ssoRedirectUri;
  return `${req.protocol}://${req.get('host')}/api/auth/sso/callback`;
}

function setAuthCookie(res: Response, token: string) {
  res.cookie('token', token, authCookieOptions());
}

function stateCookieOptions() {
  return { ...authCookieOptions(STATE_TTL), path: '/api/auth/sso/callback' };
}

export const ssoController = {
  // Report SSO configuration status (no secrets).
  status: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: ssoStatus() });
  }),

  // Initiate the authorization-code flow.
  initiate: asyncHandler(async (req: Request, res: Response) => {
    if (!isSsoConfigured()) {
      return res.status(503).json({ success: false, message: 'University SSO is not configured.' });
    }

    const { state, codeVerifier, codeChallenge } = createSsoSession();
    // State + PKCE verifier stored in an httpOnly cookie; validated on callback.
    res.cookie(STATE_COOKIE, JSON.stringify({ state, codeVerifier, exp: Date.now() + STATE_TTL }), stateCookieOptions());

    const url = await buildAuthorizationUrl({ state, codeChallenge, redirectUri: redirectUri(req) });
    res.redirect(url);
  }),

  // Handle the IdP callback.
  callback: asyncHandler(async (req: Request, res: Response) => {
    const { code, state, error } = req.query as { code?: string; state?: string; error?: string };
    const redirectHome = () => res.redirect(`${config.frontendUrl}/login?sso=error`);

    if (error) return redirectHome();

    const stored = req.cookies?.[STATE_COOKIE];
    if (!code || !stored) return redirectHome();

    let session: { state: string; codeVerifier: string; exp: number };
    try {
      session = JSON.parse(stored);
    } catch {
      return redirectHome();
    }

    if (!session.exp || Date.now() > session.exp || session.state !== state) {
      res.clearCookie(STATE_COOKIE, stateCookieOptions());
      return redirectHome();
    }

    try {
      res.clearCookie(STATE_COOKIE, stateCookieOptions());
      const ssoUser = await completeSsoLogin({
        code,
        codeVerifier: session.codeVerifier,
        redirectUri: redirectUri(req),
      });

      let user = await userRepo.findByEmail(ssoUser.email);

      if (user) {
        if (user.accountStatus !== 'ACTIVE') {
          return redirectHome();
        }
        // Never trust IdP roles; keep the provisioned role.
      } else {
        // Auto-provision a STUDENT account (or ADMIN only if allow-listed).
        const randomPassword = await hashPassword(randomBytes(32).toString('hex'));
        user = await userRepo.create({
          firstName: ssoUser.firstName,
          lastName: ssoUser.lastName,
          email: ssoUser.email,
          passwordHash: randomPassword,
          role: ssoRoleForEmail(ssoUser.email),
        });
      }

      const authUser = {
        userId: user.id,
        email: user.email,
        role: user.role,
        studentId: user.studentId ?? null,
      };
      setAuthCookie(res, signToken(authUser));
      return res.redirect(`${config.frontendUrl}`);
    } catch {
      return redirectHome();
    }
  }),
};
