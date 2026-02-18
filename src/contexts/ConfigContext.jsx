import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchConfig } from '../utils/api';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    chapters: [],       // 114 Surah metadata (english_name, description)
    translations: {},   // 47+ language configs with XML URLs
    reciters: {},       // 12 reciter configs with CDN paths
    loaded: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const data = await fetchConfig();
        if (cancelled) return;
        setConfig({
          chapters: data.streamprotectedtrack_cee2 || [],
          translations: data.translations || {},
          reciters: data.streamprotectedlicense_artists_cr1 || {},
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
