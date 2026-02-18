import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { useConfig } from '../contexts/ConfigContext';
import { useI18n } from '../contexts/I18nContext';
import { STORAGE_KEYS } from '../utils/constants';

// =========================================================================
// HERO SECTION — 55vh hero with background image, title, subtitle
// Class: ._c3, contains gradient overlay ._1 and content ._cm
// CSS :has(#_bg:empty) collapses hero to 0vh when title is empty
// Syncs H1 text to H2 #_az (replaces MutationObserver with React state)
// =========================================================================

export default function HeroSection() {
  const { state } = usePlayer();
  const { chapters } = useConfig();
  const { t } = useI18n();
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImgSrc, setHeroImgSrc] = useState('');

  useEffect(() => {
    if (chapters.length > 0 && state.chapterIndex < chapters.length) {
      const chapter = chapters[state.chapterIndex];
      const name = chapter.english_name || '';
      setHeroTitle(name);
      setHeroSubtitle(chapter.description || '');

      // Persist for H1-H2 sync (replaces localStorage + MutationObserver)
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED_H1, name);
      } catch (e) { /* ignore */ }
    }
  }, [chapters, state.chapterIndex]);

  // Load saved title on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_H1);
    if (saved && !heroTitle) {
      setHeroTitle(saved);
    }
  }, []);

  return (
    <div className="_c3">
      {/* Background art area */}
      <div className="_af">
        {heroImgSrc && <img id="_c7" src={heroImgSrc} alt="" />}
      </div>

      {/* Gradient overlay */}
      <div className="_1" />

      {/* Content */}
      <div className="_cm">
        <h1 className="_bf" id="_bg" data-i18n="hero.title">
          {heroTitle}
        </h1>
        <div className="_b4" id="_aa" data-i18n="hero.subtitle">
          {heroSubtitle}
        </div>
      </div>
    </div>
  );
}
