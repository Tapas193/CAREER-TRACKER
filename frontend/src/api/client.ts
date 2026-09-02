interface ApiErrorBody {
  message?: string;
  errors?: unknown[];
}

function friendlyMessage(status: number): string {
  switch (status) {
    case 401: return 'Your session has expired. Please sign in again.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'The requested resource was not found.';
    case 409: return 'This record conflicts with existing data.';
    case 413: return 'The file you uploaded is too large.';
    case 422: return 'The provided data is not valid.';
    case 500: return 'An unexpected server error occurred. Please try again.';
    case 502: return 'The server received an invalid response from an upstream service. Please try again later.';
    case 503: return 'The service is temporarily unavailable. Please try again later.';
    default: return 'Something went wrong. Please try again.';
  }
}

// Base URL for API requests.
// - Development: empty string => Vite dev proxy (/api -> http://localhost:4000).
// - Production:  VITE_API_URL (set in the Vercel frontend environment). If it is
//   missing from the build, fall back to the known production backend origin so
//   the deployed frontend never calls its own origin or localhost.
const BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://career-tracker-fsov.vercel.app' : '')).replace(/\/+$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch {
    const error: any = new Error('Unable to reach the server. Please check your connection and try again.');
    error.status = 0;
    error.network = true;
    throw error;
  }

  const body: any = await res.json().catch(() => ({}));

  if (!res.ok || body.success === false) {
    const message = body.message || friendlyMessage(res.status);
    const error: any = new Error(message);
    error.status = res.status;
    error.errors = body.errors;
    if (res.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw error;
  }
  return body.data as T;
}

export const api = {
  get<T>(path: string) {
    return request<T>(path);
  },
  post<T>(path: string, data?: unknown) {
    return request<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}) });
  },
  patch<T>(path: string, data?: unknown) {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) });
  },
  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' });
  },
};
export type { ApiErrorBody };

// Absolute backend origin (used e.g. to redirect the browser to the SSO flow).
export const API_BASE_URL = BASE;

export const authApi = {
  login: (email: string, password: string) => request<any>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<any>('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) }),
  me: () => request<any>('/api/auth/me'),
};

export interface SsoStatus {
  configured: boolean;
  provider: string | null;
}

export const ssoApi = {
  status: () => request<SsoStatus>('/api/auth/sso/status'),
};