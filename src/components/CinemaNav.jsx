import React, { useCallback } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';

// =========================================================================
// CINEMA NAV — Back/Forward glassmorphic buttons
// ID: #cinema-nav-container, appears when cinema is active
// Fades out on body.idle via CSS
// RTL: arrow SVGs mirror via CSS transform
// =========================================================================

export default function CinemaNav() {
  const { state, dispatch } = usePlayer();

  const handleBack = useCallback(() => {
    if (state.verseIndex > 0) {
      dispatch({ type: ActionTypes.SET_VERSE, payload: state.verseIndex - 1 });
    } else if (state.chapterIndex > 0) {
      dispatch({ type: ActionTypes.SET_CHAPTER, payload: state.chapterIndex - 1 });
    }
  }, [state.verseIndex, state.chapterIndex, dispatch]);

  const handleForward = useCallback(() => {
    dispatch({ type: ActionTypes.NEXT_VERSE });
  }, [dispatch]);

  const isBackDisabled = state.chapterIndex === 0 && state.verseIndex === 0;

  return (
    <div id="cinema-nav-container">
      <button
        className="cinema-nav-btn"
        id="cinema-back-btn"
        onClick={handleBack}
        disabled={isBackDisabled}
        aria-label="Previous verse"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        className="cinema-nav-btn"
        id="cinema-forward-btn"
        onClick={handleForward}
        aria-label="Next verse"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
