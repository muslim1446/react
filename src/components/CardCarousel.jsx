import React, { useRef, useCallback, useEffect, useState } from 'react';
import { TIMINGS } from '../utils/constants';

// =========================================================================
// CARD CAROUSEL — Horizontal scroll row of chapter cards
// Class: ._cb, cards are ._dw with 280px width, 16:9 aspect ratio
// Features: horizontal scroll, arrow-key infinite navigation
// Card focus triggers 600ms debounced preview
// =========================================================================

export default function CardCarousel({ id, cardIndices, chapters, onCardClick, t }) {
  const containerRef = useRef(null);
  const previewTimerRef = useRef(null);

  // Vertical-to-horizontal scroll conversion
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleWheel(e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Arrow-key horizontal navigation with wrap-around
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleKeyDown(e) {
      const focused = document.activeElement;
      if (!container.contains(focused)) return;

      const cards = Array.from(container.querySelectorAll('._dw'));
      const currentIdx = cards.indexOf(focused);
      if (currentIdx === -1) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (currentIdx + 1) % cards.length;
        cards[next].focus({ preventScroll: true });
        cards[next].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (currentIdx - 1 + cards.length) % cards.length;
        cards[prev].focus({ preventScroll: true });
        cards[prev].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCardFocus = useCallback((chapterIndex) => {
    // Debounced preview (600ms)
    clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      // Preview logic would go here (audio preview, hero update)
      // For now, this is a placeholder for the preview system
    }, TIMINGS.PREVIEW_DEBOUNCE);
  }, []);

  const handleCardBlur = useCallback(() => {
    clearTimeout(previewTimerRef.current);
  }, []);

  if (!chapters.length || !cardIndices.length) return null;

  return (
    <div className="_cb" id={id} ref={containerRef}>
      {cardIndices.map((chapterIdx) => {
        const chapter = chapters[chapterIdx];
        if (!chapter) return null;
        const chapterNum = chapterIdx + 1;

        return (
          <div
            key={chapterIdx}
            className="_dw"
            tabIndex={0}
            role="button"
            onClick={() => onCardClick(chapterIdx)}
            onFocus={() => handleCardFocus(chapterIdx)}
            onBlur={handleCardBlur}
          >
            <div className="_c5">{chapterNum}</div>
            <div className="_dz">
              <span className="_d1">{chapter.english_name || `Chapter ${chapterNum}`}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
