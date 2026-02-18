import { getTunneledUrl, createSafeFetcher } from './api';

// =========================================================================
// TRANSLATION XML PARSER & CACHE
// Fetches, parses, and caches Quran translation XML files
// XML format: <Quran><sura index="N"><aya index="N" text="..." />...</sura></Quran>
// =========================================================================

const translationCache = new Map();

export async function loadTranslation(translationId, translationsConfig) {
  // Return cached if available
  if (translationCache.has(translationId)) {
    return translationCache.get(translationId);
  }

  const config = translationsConfig[translationId];
  if (!config || !config.url) {
    console.error('[TranslationParser] No config for translation:', translationId);
    return null;
  }

  let url = config.url;

  // If the URL goes through the media tunnel, get a signed token
  if (url.startsWith('/media/data/')) {
    const filename = url.split('/media/data/')[1];
    url = await getTunneledUrl('data', filename);
  }

  const { signal, cleanup } = createSafeFetcher(`translation-${translationId}`);

  try {
    const res = await fetch(url, { signal });
    cleanup();
    if (!res.ok) throw new Error(`Translation fetch failed: ${res.status}`);

    const xmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');

    translationCache.set(translationId, doc);
    return doc;
  } catch (e) {
    cleanup();
    if (e.name === 'AbortError') return null;
    console.error('[TranslationParser] Load error:', e);
    return null;
  }
}

// =========================================================================
// GET VERSE TEXT from parsed XML document
// =========================================================================
export function getVerseText(doc, chapterNum, verseNum) {
  if (!doc) return '';
  const aya = doc.querySelector(`sura[index="${chapterNum}"] aya[index="${verseNum}"]`);
  return aya ? aya.getAttribute('text') || '' : '';
}

// =========================================================================
// CLEAR CACHE (for memory management)
// =========================================================================
export function clearTranslationCache() {
  translationCache.clear();
}
