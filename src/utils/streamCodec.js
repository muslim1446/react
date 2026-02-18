// =========================================================================
// STREAM TOKEN ENCODER / DECODER
// Encodes player state as Base64-URL token for deep linking
// Format: chapter|verse|reciter|translation|audioTranslation
// =========================================================================

export function encodeStream(chapter, verse, reciter, translation, audioTranslation) {
  const raw = [chapter, verse, reciter, translation, audioTranslation || ''].join('|');
  const base64 = btoa(raw);
  // Convert to URL-safe Base64
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeStream(token) {
  if (!token) return null;
  try {
    // Convert from URL-safe Base64
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const raw = atob(base64);
    const parts = raw.split('|');
    return {
      chapter: parseInt(parts[0], 10) || 1,
      verse: parseInt(parts[1], 10) || 1,
      reciter: parts[2] || '',
      translation: parts[3] || '',
      audioTranslation: parts[4] || '',
    };
  } catch (e) {
    console.error('[StreamCodec] Decode error:', e);
    return null;
  }
}

// =========================================================================
// URL STATE SYNC
// Updates URL with stream token without triggering navigation
// =========================================================================
export function syncStateToUrl(state) {
  const token = encodeStream(
    state.chapter,
    state.verse,
    state.reciter,
    state.translation,
    state.audioTranslation
  );
  const url = new URL(window.location.href);
  url.searchParams.set('stream', token);
  window.history.replaceState({}, '', url.toString());
}

export function getStateFromUrl() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('stream');
  if (token) return decodeStream(token);

  // Fallback: check for individual params
  const chapter = url.searchParams.get('streamprotectedtrack_c-ee2');
  if (chapter) {
    return {
      chapter: parseInt(chapter, 10) || 1,
      verse: 1,
      reciter: '',
      translation: '',
      audioTranslation: '',
    };
  }
  return null;
}
