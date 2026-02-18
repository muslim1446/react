import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const I18nContext = createContext(null);

const SUPPORTED_LOCALES = ['en', 'ar', 'es', 'fr', 'he', 'zh'];
const RTL_LOCALES = ['ar', 'he'];
const DEFAULT_LOCALE = 'en';

function getLocaleFromPath() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0])) {
    return segments[0];
  }
  return DEFAULT_LOCALE;
}

// Dot-notation key lookup: "hero.title" -> translations.hero.title
function getNestedValue(obj, key) {
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(getLocaleFromPath);
  const [translations, setTranslations] = useState({});
  const [loaded, setLoaded] = useState(false);

  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  useEffect(() => {
    let cancelled = false;

    async function loadTranslations() {
      try {
        const res = await fetch(`/locales/${locale}.json`);
        if (!res.ok) {
          // Fallback to English
          if (locale !== DEFAULT_LOCALE) {
            const fallback = await fetch(`/locales/${DEFAULT_LOCALE}.json`);
            if (fallback.ok && !cancelled) {
              setTranslations(await fallback.json());
              setLoaded(true);
            }
          }
          return;
        }
        if (cancelled) return;
        const data = await res.json();
        setTranslations(data);
        setLoaded(true);
      } catch (e) {
        console.error('[I18n] Failed to load translations:', e);
      }
    }

    // Set document lang and dir
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;

    loadTranslations();
    return () => { cancelled = true; };
  }, [locale, dir]);

  // Translation function with dot-notation and {{param}} interpolation
  const t = useCallback((key, params = {}) => {
    let value = getNestedValue(translations, key);
    if (value === null || value === undefined) return key;
    if (typeof value !== 'string') return key;

    // Interpolation: replace {{param}} with params.param
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    });

    return value;
  }, [translations]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, loaded, translations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export default I18nContext;
