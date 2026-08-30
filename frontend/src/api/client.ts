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
    default: return 'Something went wrong. Please try again.';
  }
}

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

const BASE = import.meta.env.VITE_API_URL ?? '';

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

export const authApi = {
  login: (email: string, password: string) => request<any>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<any>('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) }),
  me: () => request<any>('/api/auth/me'),
};
