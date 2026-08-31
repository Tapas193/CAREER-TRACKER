import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5179',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  storageLocalDir: process.env.STORAGE_LOCAL_DIR || 'uploads',
  storageBaseUrl: process.env.STORAGE_BASE_URL || `http://localhost:${process.env.PORT || 4000}`,

  // University SSO (OIDC) — optional. SSO is DISABLED until SSO_PROVIDER is set.
  // Sensitive values (client secret) are read only here from the environment and
  // are never exposed to the frontend.
  ssoEnabled: !!process.env.SSO_PROVIDER,
  ssoProvider: process.env.SSO_PROVIDER || '',
  ssoClientId: process.env.SSO_CLIENT_ID || '',
  ssoClientSecret: process.env.SSO_CLIENT_SECRET || '',
  ssoIssuer: process.env.SSO_ISSUER || '',
  // Optional: override the callback URI. When empty it is derived from the request.
  ssoRedirectUri: process.env.SSO_REDIRECT_URI || '',
  ssoScope: process.env.SSO_SCOPE || 'openid email profile',
  // Optional email domain restriction, e.g. "university.edu"
  ssoAllowedDomain: process.env.SSO_ALLOWED_DOMAIN || '',
  // Optional comma-separated emails allowed to become ADMIN via SSO.
  ssoAdminEmails: (process.env.SSO_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
};

export const uploadsDir = path.resolve(__dirname, '..', '..', config.storageLocalDir);

export const isProd = config.nodeEnv === 'production';
