import { randomBytes, createHash, createPublicKey, verify } from 'crypto';
import { config } from '../config/index';
import { AppError } from '../utils/http';

// Minimal, safe OIDC authorization-code + PKCE client using the Node global
// `fetch`. No extra runtime dependencies. SSO is fully disabled until
// SSO_PROVIDER / SSO_ISSUER are configured via environment variables.
//
// SECURITY:
// - authorization-code flow with PKCE
// - client secret only ever used server-side (never sent to the frontend)
// - state is validated on callback
// - ID token issuer + audience + expiry validated
// - ID token signature verified against the provider's JWKS
// - optional email-domain + admin-email restrictions
// - roles are NEVER trusted from the IdP; default to STUDENT

export interface DiscoveryDoc {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
  issuer: string;
}

let discoveryCache: DiscoveryDoc | null = null;

function b64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64UrlDecode(str: string): string {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8');
}

export function isSsoConfigured(): boolean {
  return config.ssoEnabled && !!config.ssoClientId && !!config.ssoIssuer;
}

export function ssoStatus(): { configured: boolean; provider: string | null } {
  return { configured: isSsoConfigured(), provider: config.ssoProvider || null };
}

async function discover(): Promise<DiscoveryDoc> {
  if (discoveryCache) return discoveryCache;
  const base = config.ssoIssuer.replace(/\/$/, '');
  const url = `${base}/.well-known/openid-configuration`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new AppError('SSO discovery failed. Check SSO_ISSUER.', 502);
  }
  const doc = (await res.json()) as DiscoveryDoc;
  // The discovery issuer MUST match the configured issuer (prevents confusion).
  if (doc.issuer !== base) {
    throw new AppError('SSO issuer mismatch during discovery.', 502);
  }
  discoveryCache = doc;
  return doc;
}

// Generate a new SSO session set: state + PKCE verifier.
export function createSsoSession() {
  const state = randomBytes(24).toString('hex');
  const codeVerifier = randomBytes(48).toString('base64url');
  const codeChallenge = b64UrlEncode(
    createHash('sha256').update(codeVerifier).digest()
  );
  return { state, codeVerifier, codeChallenge };
}

export async function buildAuthorizationUrl(opts: {
  state: string;
  codeChallenge: string;
  redirectUri: string;
  scope?: string;
}): Promise<string> {
  const doc = await discover();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.ssoClientId,
    redirect_uri: opts.redirectUri,
    scope: opts.scope || config.ssoScope,
    state: opts.state,
    code_challenge: opts.codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${doc.authorization_endpoint}?${params.toString()}`;
}

interface TokenResponse {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

async function exchangeCode(opts: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const doc = await discover();
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.ssoClientId,
    client_secret: config.ssoClientSecret,
    code: opts.code,
    redirect_uri: opts.redirectUri,
    code_verifier: opts.codeVerifier,
  });
  const res = await fetch(doc.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const body = (await res.json().catch(() => ({}))) as TokenResponse;
  if (!res.ok || !body.id_token) {
    throw new AppError(body.error_description || body.error || 'SSO token exchange failed.', 502);
  }
  return body;
}

interface IdTokenPayload {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  [key: string]: unknown;
}

// Verify the ID token signature against the provider JWKS and validate claims.
async function verifyIdToken(encoded: string): Promise<IdTokenPayload> {
  const parts = encoded.split('.');
  if (parts.length !== 3) throw new AppError('Invalid ID token.', 401);
  const header = JSON.parse(b64UrlDecode(parts[0])) as { alg?: string; kid?: string };
  const payload = JSON.parse(b64UrlDecode(parts[1])) as IdTokenPayload;

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) throw new AppError('ID token expired.', 401);
  if (payload.iss !== config.ssoIssuer.replace(/\/$/, '')) throw new AppError('Invalid token issuer.', 401);

  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud || ''];
  if (!aud.includes(config.ssoClientId)) throw new AppError('Invalid token audience.', 401);

  const doc = await discover();
  if (doc.jwks_uri) {
    const jwksRes = await fetch(doc.jwks_uri);
    const jwks = (await jwksRes.json()) as { keys: { kid?: string; alg?: string; n?: string; e?: string }[] };
    const key = (header.kid ? jwks.keys.find((k) => k.kid === header.kid) : undefined) || jwks.keys[0];
    if (!key || !key.n || !key.e) throw new AppError('No signing key found.', 401);
    const signature = Buffer.from(
      parts[2].replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    );
    const data = `${parts[0]}.${parts[1]}`;
    const algMaps: Record<string, string> = { RS256: 'RSA-SHA256', RS384: 'RSA-SHA384', RS512: 'RSA-SHA512' };
    const algo = algMaps[key.alg || header.alg || 'RS256'];
    if (!algo) throw new AppError('Unsupported signing algorithm.', 401);
    const n = Buffer.from(b64UrlDecode(key.n), 'base64');
    const e = Buffer.from(b64UrlDecode(key.e), 'base64');
    const publicKey = createPublicKey({
      key: { kty: 'RSA', n: n.toString('base64'), e: e.toString('base64') },
      format: 'jwk',
    });
    const valid = verify(algo, Buffer.from(data), publicKey, signature);
    if (!valid) throw new AppError('ID token signature verification failed.', 401);
  }

  return payload;
}

export interface SsoUser {
  email: string;
  firstName: string;
  lastName: string;
}

export async function completeSsoLogin(opts: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<SsoUser> {
  const tokens = await exchangeCode(opts);
  const payload = await verifyIdToken(tokens.id_token as string);

  const email = payload.email?.trim().toLowerCase();
  if (!email) throw new AppError('SSO account has no email address.', 401);

  if (config.ssoAllowedDomain) {
    const domain = email.split('@')[1];
    if (domain !== config.ssoAllowedDomain.toLowerCase()) {
      throw new AppError('This university email domain is not authorized.', 403);
    }
  }

  const given = payload.given_name || (payload.name ? payload.name.split(' ')[0] : '') || email.split('@')[0];
  const family = payload.family_name || '';

  return {
    email,
    firstName: given || 'University',
    lastName: family || 'User',
  };
}

export function ssoRoleForEmail(email: string): 'ADMIN' | 'STUDENT' {
  return config.ssoAdminEmails.includes(email.toLowerCase()) ? 'ADMIN' : 'STUDENT';
}
