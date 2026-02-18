import React, { useEffect, useState } from 'react';
import { ConfigProvider } from '../contexts/ConfigContext';
import { I18nProvider } from '../contexts/I18nContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { PlayerProvider } from '../contexts/PlayerContext';
import UniversalLoader from '../components/UniversalLoader';
import BrandLogo from '../components/BrandLogo';
import ContentProtection from '../components/ContentProtection';
import PageTransition from '../components/PageTransition';
import SearchBox from '../components/SearchBox';
import BottomNav from '../components/BottomNav';
import SearchOverlay from '../components/SearchOverlay';
import Dashboard from '../components/Dashboard';
import CinemaPlayer from '../components/CinemaPlayer';
import ArabicModal from '../components/ArabicModal';
import OfflineStatusHub from '../components/OfflineStatusHub';
import useSpatialNav from '../hooks/useSpatialNav';
import useHibernation from '../hooks/useHibernation';
import useCurrencySanitizer from '../hooks/useCurrencySanitizer';
import { STORAGE_KEYS } from '../utils/constants';
import { initAnalytics } from '../utils/analytics';

// =========================================================================
// APP — Main application root
// Wraps everything in context providers
// Manages view switching between dashboard and cinema
// =========================================================================

function AppInner() {
  const [searchBarHidden, setSearchBarHidden] = useState(false);
  const { isTvMode } = useAuth();

  // TV spatial navigation engine
  useSpatialNav({ enabled: isTvMode });

  // Session hibernation (offline save/restore)
  useHibernation();

  // Currency symbol stripping (translation artifacts)
  useCurrencySanitizer();

  useEffect(() => {
    initAnalytics();
  }, []);

  // Mobile first-load: hide search bar on first session visit (mobile only)
  useEffect(() => {
    const isMobile = window.matchMedia
      ? window.matchMedia('(max-width: 768px)').matches
      : window.innerWidth <= 768;
    const isFirstLoad = !sessionStorage.getItem(STORAGE_KEYS.HAS_LOADED);

    if (isMobile && isFirstLoad) {
      sessionStorage.setItem(STORAGE_KEYS.HAS_LOADED, 'true');
      setSearchBarHidden(true);
    }
  }, []);

  // TV environment: hide search bar
  useEffect(() => {
    if (isTvMode) {
      setSearchBarHidden(true);
    }
  }, [isTvMode]);

  // URL-based search bar hiding: hide when URL contains "stream"
  useEffect(() => {
    const url = window.location.href;
    if (url.includes('stream')) {
      setSearchBarHidden(true);
    }
  }, []);

  // ?regex param hides brand elements
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('regex')) {
      document.querySelectorAll('._el').forEach(el => {
        el.style.display = 'none';
      });
    }
  }, []);

  return (
    <>
      <UniversalLoader />
      <ContentProtection />
      <PageTransition />
      <BrandLogo />
      {!searchBarHidden && <SearchBox />}
      <BottomNav />
      <SearchOverlay />
      <Dashboard />
      <CinemaPlayer />
      <ArabicModal />
      <OfflineStatusHub />

      {/* Hidden decoy audio element (anti-scraping measure) */}
      <audio
        id="_ca"
        crossOrigin="anonymous"
        muted
        preload="none"
        hidden
        style={{ display: 'none' }}
        onPlay={(e) => e.target.pause()}
        onPlaying={(e) => e.target.pause()}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <ConfigProvider>
          <PlayerProvider>
            <AppInner />
          </PlayerProvider>
        </ConfigProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
