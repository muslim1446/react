import { API } from './constants';

// =========================================================================
// SAFE FETCHER — Aborts previous request for same resource key
// Prevents race conditions when rapidly switching verses/chapters
// =========================================================================
const activeControllers = new Map();

export function createSafeFetcher(resourceKey) {
  // Abort any existing request for this resource key
  if (activeControllers.has(resourceKey)) {
    activeControllers.get(resourceKey).abort();
  }
  const controller = new AbortController();
  activeControllers.set(resourceKey, controller);

  return {
    signal: controller.signal,
    cleanup: () => {
      if (activeControllers.get(resourceKey) === controller) {
        activeControllers.delete(resourceKey);
      }
    },
  };
}

// =========================================================================
// FETCH CONFIG — /api/config (chapters, reciters, translations)
// =========================================================================
export async function fetchConfig() {
  const res = await fetch(API.CONFIG);
  if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
  return res.json();
}

// =========================================================================
// FETCH MEDIA TOKEN — POST /api/media-token
// Returns a signed, single-use, 60s-expiry, IP+UA-bound token
// =========================================================================
export async function fetchMediaToken(type, filename) {
  const res = await fetch(API.MEDIA_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, filename }),
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data = await res.json();
  return data.token;
}

// =========================================================================
// GET TUNNELED URL — Constructs /media/{type}/{token}/{filename}
// =========================================================================
export async function getTunneledUrl(type, filename) {
  const token = await fetchMediaToken(type, filename);
  return `/media/${type}/${token}/${filename}`;
}

// =========================================================================
// LOGIN — POST /login (sets TUWA_PREMIUM cookie)
// =========================================================================
export async function login() {
  const res = await fetch(API.LOGIN, { method: 'POST' });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json();
}

// =========================================================================
// LOGIN GOOGLE — POST /login-google
// =========================================================================
export async function loginGoogle(idToken) {
  const res = await fetch(API.LOGIN_GOOGLE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: idToken }),
  });
  if (!res.ok) throw new Error(`Google login failed: ${res.status}`);
  return res.json();
}

// =========================================================================
// AI SEARCH — POST /search
// =========================================================================
export async function searchChapters(query) {
  const { signal, cleanup } = createSafeFetcher('search');
  try {
    const res = await fetch(API.SEARCH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal,
    });
    cleanup();
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    return res.json();
  } catch (e) {
    cleanup();
    if (e.name === 'AbortError') return null;
    throw e;
  }
}
