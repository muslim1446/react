import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ConfigProvider } from '../contexts/ConfigContext';
import { I18nProvider } from '../contexts/I18nContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { PlayerProvider, usePlayer, ActionTypes } from '../contexts/PlayerContext';
import UniversalLoader from '../components/UniversalLoader';
import PlayPauseIndicator from '../components/PlayPauseIndicator';
import BrandLogo from '../components/BrandLogo';
import ContentProtection from '../components/ContentProtection';
import SearchBox from '../components/SearchBox';
import BottomNav from '../components/BottomNav';
import SearchOverlay from '../components/SearchOverlay';
import Dashboard from '../components/Dashboard';
import CinemaPlayer from '../components/CinemaPlayer';
import OfflineStatusHub from '../components/OfflineStatusHub';
import useSpatialNav from '../hooks/useSpatialNav';
import useIdleDetection from '../hooks/useIdleDetection';
import useTextFade from '../hooks/useTextFade';
import useHibernation from '../hooks/useHibernation';
import useCurrencySanitizer from '../hooks/useCurrencySanitizer';
import { STORAGE_KEYS } from '../utils/constants';
import { initAnalytics } from '../utils/analytics';
import { getStateFromUrl } from '../utils/streamCodec';

// =========================================================================
// APP — Main application root
// Wraps everything in context providers
// Manages view switching between dashboard and cinema
// =========================================================================

function AppInner() {
  const { state, dispatch } = usePlayer();
  const { isTvMode } = useAuth();
  const feedbackRef = useRef(null);

  // TV spatial navigation engine
  useSpatialNav({ enabled: isTvMode });

  // Idle detection — updates body.idle class
  useIdleDetection(state.view, useCallback((idle) => {
    dispatch({ type: ActionTypes.SET_IDLE, payload: idle });
  }, [dispatch]));

  // Session hibernation (offline save/restore)
  useHibernation();

  // Currency symbol stripping (translation artifacts)
  useCurrencySanitizer();

  // Text fade hook — placeholder ref (used by cinema captions elsewhere)
  const textFadeRef = useRef(null);
  useTextFade(textFadeRef, state.captionText);

  useEffect(() => {
    initAnalytics();
  }, []);

  // URL-based view: if URL has ?stream= or ?streamprotectedtrack_c-ee2=, switch to cinema
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasStream = url.searchParams.has('stream');
    const hasProtectedTrack = url.searchParams.has('streamprotectedtrack_c-ee2');
    if (hasStream || hasProtectedTrack) {
      dispatch({ type: ActionTypes.SET_VIEW, payload: 'cinema' });
    }
  }, [dispatch]);

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
      <PlayPauseIndicator ref={feedbackRef} />
      <div id="_m" />
      <BrandLogo />
      <SearchBox />
      <BottomNav />
      <SearchOverlay />
      <div id="_bq" className={state.view === 'dashboard' ? 'active' : ''}>
        <Dashboard />
      </div>
      <audio id="_ca" crossOrigin="anonymous" muted preload="none" hidden style={{ display: 'none' }} />
      <div id="_dd" className={state.view === 'cinema' ? 'active' : ''}>
        <CinemaPlayer feedbackRef={feedbackRef} />
      </div>
      <OfflineStatusHub />
      <ContentProtection />
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
