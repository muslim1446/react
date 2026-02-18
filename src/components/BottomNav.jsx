import React, { useCallback } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';
import { useI18n } from '../contexts/I18nContext';

// =========================================================================
// BOTTOM NAV — Home / Search / Profile tabs
// Uses obfuscated class names: #_d8, ._eu, #_en, #_dn, #_dg
// SVG icons for Home (house) and Search (magnifying glass)
// =========================================================================

export default function BottomNav() {
  const { state, dispatch } = usePlayer();
  const { t } = useI18n();

  const handleHome = useCallback(() => {
    dispatch({ type: ActionTypes.SET_VIEW, payload: 'dashboard' });
  }, [dispatch]);

  const handleSearch = useCallback(() => {
    // Toggle search overlay
    if (window.openSearch) window.openSearch();
  }, []);

  const isHome = state.view === 'dashboard';

  return (
    <nav id="_d8">
      <a
        id="_en"
        className={`_eu${isHome ? ' active' : ''}`}
        tabIndex={1}
        onClick={handleHome}
        data-i18n="nav.home"
        role="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>{t('nav.home') || 'Home'}</span>
      </a>
      <a
        id="_dn"
        className="_eu"
        tabIndex={2}
        onClick={handleSearch}
        data-i18n="nav.search"
        role="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>{t('nav.search') || 'Search'}</span>
      </a>
      <a
        id="_dg"
        className="_eu"
        tabIndex={3}
        href="../"
        data-i18n="nav.profile"
      >
        <div>Q</div>
        <span>{t('nav.profile') || 'Profile'}</span>
      </a>
    </nav>
  );
}
