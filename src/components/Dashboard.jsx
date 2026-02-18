import React, { useEffect, useCallback } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';
import { useConfig } from '../contexts/ConfigContext';
import { useI18n } from '../contexts/I18nContext';
import HeroSection from './HeroSection';
import CardCarousel from './CardCarousel';

// =========================================================================
// DASHBOARD — Main dashboard view
// ID: #_bq, shows with .active class when view === 'dashboard'
// Contains: Hero section, "Continue Listening" carousel, additional carousel
// CSS :has(#_bg:empty) collapses hero to 0vh when title is empty
// =========================================================================

export default function Dashboard() {
  const { state, dispatch } = usePlayer();
  const { chapters, loaded } = useConfig();
  const { t } = useI18n();

  const isActive = state.view === 'dashboard';

  // Build card arrays from state + recommendations
  const getContinueListeningCards = useCallback(() => {
    if (!chapters.length) return [];
    // Show recently played chapter and its neighbors
    const idx = state.chapterIndex;
    const indices = [];
    for (let i = Math.max(0, idx - 2); i <= Math.min(113, idx + 4); i++) {
      indices.push(i);
    }
    return indices;
  }, [chapters, state.chapterIndex]);

  const getRecommendationCards = useCallback(() => {
    if (!chapters.length) return [];
    // Show a curated selection: Al-Fatiha, Al-Mulk, Ar-Rahman, Ya-Sin, Al-Kahf, last 10
    const featured = [0, 66, 54, 35, 17, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113];
    return featured.filter(i => i < chapters.length);
  }, [chapters]);

  const handleCardClick = useCallback((chapterIndex) => {
    dispatch({ type: ActionTypes.SET_CHAPTER, payload: chapterIndex });
    dispatch({ type: ActionTypes.SET_VIEW, payload: 'cinema' });
  }, [dispatch]);

  return (
    <div id="_bq" className={isActive ? 'active' : ''}>
      <HeroSection />

      {/* Continue Listening */}
      <div className="_c6 _ab" id="_a3">
        <CardCarousel
          id="_cu"
          cardIndices={getContinueListeningCards()}
          chapters={chapters}
          onCardClick={handleCardClick}
          t={t}
        />
      </div>

      {/* Recommendations / Additional */}
      <div className="_c6 _b" id="_ex_wrapper">
        <CardCarousel
          id="_ex"
          cardIndices={getRecommendationCards()}
          chapters={chapters}
          onCardClick={handleCardClick}
          t={t}
        />
      </div>
    </div>
  );
}
