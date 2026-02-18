import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TIMINGS } from '../utils/constants';

// =========================================================================
// SLIDESHOW — 3-slide vertical presentation
// Wheel + touch swipe navigation with 1200ms transition lock
// Slide 1: "Fulfillment not the feed" hero
// Slide 2: "The Cleaving" (Surah 82) preview
// Slide 3: "The Moon" (Surah 54) preview
// =========================================================================

const INLINE_STYLES = `
._cd {
  font-family: var(--font-heading);
  font-size: clamp(4.5rem, 8vw, 7.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 auto;
  text-align: center;
  width: 100%;
  max-width: 1000px;
}
._cd .line-1 {
  display: block;
  background: linear-gradient(180deg, #FFFFFF 10%, #888888 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
._cd .line-2 {
  display: block;
  letter-spacing: 0;
  margin-top: 10px;
  background: none;
  -webkit-text-fill-color: #999999;
  color: #999999;
}
@media (max-width: 768px) {
  ._cd { font-size: clamp(2rem, 10vw, 3.5rem); }
  ._cd .line-2 { font-size: 0.6em; }
}
`;

export default function Slideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isTransitioning = useRef(false);
  const touchStartY = useRef(0);
  const totalSlides = 3;

  const goToSlide = useCallback((index) => {
    if (index < 0 || index >= totalSlides || isTransitioning.current) return;
    isTransitioning.current = true;
    setCurrentSlide(index);
    setTimeout(() => {
      isTransitioning.current = false;
    }, TIMINGS.SLIDE_TRANSITION_LOCK);
  }, []);

  // Wheel handler
  useEffect(() => {
    function handleWheel(e) {
      if (Math.abs(e.deltaY) < 20) return;
      if (e.deltaY > 0) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(currentSlide - 1);
      }
    }
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSlide, goToSlide]);

  // Touch handler
  useEffect(() => {
    function handleTouchStart(e) {
      touchStartY.current = e.touches[0].clientY;
    }
    function handleTouchEnd(e) {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToSlide(currentSlide + 1);
        else goToSlide(currentSlide - 1);
      }
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSlide, goToSlide]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: INLINE_STYLES }} />
      <div id="_aq">
        {/* Slide 1: Hero */}
        <div className={`slide${currentSlide === 0 ? ' active' : ''}`} id="slide-1">
          <div className="_a9 visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h1 className="_cd">
              <span className="line-1">Fulfillment</span>
              <span className="line-2">not the feed</span>
            </h1>
            <p className="_as"><b>Listen Anywhere. Feel Everything.</b></p>
            <h2></h2>
          </div>
        </div>

        {/* Slide 2: The Cleaving */}
        <div className={`slide${currentSlide === 1 ? ' active' : ''}`} id="slide-2">
          <div className="_by" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="_1" />
            <h2 className="_av" id="_az">The Cleaving</h2>
            <div className="_bl" style={{ display: 'none' }} />
            <div className="_dk" id="_dk" style={{ display: 'none' }} />
            <SeekIndicator side="left" />
            <SeekIndicator side="right" />
          </div>
        </div>

        {/* Slide 3: The Moon */}
        <div className={`slide${currentSlide === 2 ? ' active' : ''}`} id="slide-3">
          <div className="_by" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="_1" />
            <h2 className="_av" id="_n">The Moon</h2>
            <div className="_bl" style={{ display: 'none' }} />
            <div className="_dk" id="_ap" style={{ display: 'none' }} />
            <SeekIndicator side="left" />
            <SeekIndicator side="right" />
          </div>
        </div>
      </div>
    </>
  );
}

// =========================================================================
// SEEK INDICATOR — Reusable ±10s indicator for slides
// =========================================================================
function SeekIndicator({ side }) {
  const isLeft = side === 'left';
  return (
    <div className={`_s ${side}`}>
      <svg viewBox="0 0 24 24" fill="currentColor">
        {isLeft ? (
          <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
        ) : (
          <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6-8.5-6z" />
        )}
      </svg>
      <span>{isLeft ? '-10s' : '+10s'}</span>
    </div>
  );
}
