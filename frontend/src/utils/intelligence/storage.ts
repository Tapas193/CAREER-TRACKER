// Lightweight typed localStorage helpers for deterministic, client-side
// persistence of user-generated tracking state (mock interviews, roadmap
// progress, learning tracking, mentorship requests, etc.).
//
// NOTE: This is browser-only persistence. These values are not synced to the
// backend. Each reads/writes a JSON value under a namespaced key.

const PREFIX = 'careertrack:';

export function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage may be unavailable (private mode / quota); ignore.
  }
}
