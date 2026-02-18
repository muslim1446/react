import React, { useCallback } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';
import { useI18n } from '../contexts/I18nContext';

export default function BottomNav() {
  const { state, dispatch } = usePlayer();
  const { t } = useI18n();

  const handleHome = useCallback((e) => {
    e.preventDefault();
    dispatch({ type: ActionTypes.SET_VIEW, payload: 'dashboard' });
  }, [dispatch]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (window.openSearch) window.openSearch();
  }, []);

  const isHome = state.view === 'dashboard';

  return (
    <nav id="_d8">
      <a
        href="#"
        className={`_eu${isHome ? ' active' : ''}`}
        id="_en"
        tabIndex={1}
        onClick={handleHome}
      >
        <svg className="_eo" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span className="_ea" data-i18n="nav.home">{t('nav.home') || 'Home'}</span>
      </a>
      <a
        href="#"
        className="_eu"
        id="_dn"
        tabIndex={2}
        onClick={handleSearch}
      >
        <svg className="_eo" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <span className="_ea" data-i18n="nav.search">{t('nav.search') || 'Search'}</span>
      </a>
      <a
        href="../"
        className="_eu"
        id="_dg"
        tabIndex={3}
      >
        <div className="_eo _cr">Q</div>
        <span className="_ea" data-i18n="nav.profile">{t('nav.profile') || 'Profile'}</span>
      </a>
    </nav>
  );
}
