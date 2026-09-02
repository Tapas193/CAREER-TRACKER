import { config } from '../config';

// The backend API and the deployed frontend run on different hosts.
// For split-origin production, the auth cookie must be sent on cross-site
// fetch requests, which requires SameSite=None plus Secure. Locally everything
// is same-origin (Vite proxy), where Lax is safer and works fine.
export function authCookieOptions(maxAge = 7 * 24 * 60 * 60 * 1000) {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: (config.nodeEnv === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    maxAge,
    path: '/',
  };
}