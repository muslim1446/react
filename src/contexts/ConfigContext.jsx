import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchConfig } from '../utils/api';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    chapters: [],
    translations: {},
    reciters: {},
    translationAudio: {},
    storageKey: 'streambasesecured_ca6State_1',
    rtlCodes: new Set(),
    keyboardKeys: [],
    forbiddenToTranslateSet: new Set(),
    loaded: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const data = await fetchConfig();
        if (cancelled) return;

        // Load FTT XML
        const fttSet = new Set();
        if (data.FTT_URL) {
          try {
            const fttResp = await fetch(data.FTT_URL);
            if (fttResp.ok) {
              const fttText = await fttResp.text();
              const fttDoc = new DOMParser().parseFromString(fttText, 'application/xml');
              fttDoc.querySelectorAll('streamprotectedcase_c-ww2').forEach(v => {
                const c = v.getAttribute('streamprotectedtrack_c-ee2')?.trim();
                const n = v.getAttribute('number')?.trim();
                if (c && n) fttSet.add(`${c}-${n}`);
              });
            }
          } catch (e) {
            console.warn('FTT load failed', e);
          }
        }

        setConfig({
          chapters: data.streamprotectedtrack_cee2 || [],
          translations: data.translations || {},
          reciters: data.streamprotectedlicense_artists_cr1 || {},
          translationAudio: data.TRANSLATION_AUDIO_CONFIG || {},
          storageKey: data.STORAGE_KEY || 'streambasesecured_ca6State_1',
          rtlCodes: new Set(data.RTL_CODES || []),
          keyboardKeys: data.KEYBOARD_KEYS || [],
          forbiddenToTranslateSet: fttSet,
          loaded: true,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;
        console.error('[ConfigContext] Failed to load config:', e);
        setConfig(prev => ({ ...prev, error: e.message }));
      }
    }

    loadConfig();
    return () => { cancelled = true; };
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}

export default ConfigContext;
