import React, { useEffect, useRef } from 'react';
import { TIMINGS } from '../utils/constants';

// =========================================================================
// UNIVERSAL LOADER
// Full-screen SVG wave animation loading screen
// Matches original: 8s timeout, 2.2s exit animation, extra delay if URL has ?
// =========================================================================

const LOADER_CSS = `
#_universal_loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000000;
  z-index: 2147483647;
  opacity: 1;
  transition: opacity 0.8s ease-out 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
._wave_container {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 9000000000000000000000000000000px;
  transform-origin: center center;
  transition: transform 1.0s cubic-bezier(0.7, 0, 0.3, 1),
              filter 1.0s ease-in,
              opacity 1.0s ease-in;
  will-change: transform, filter, opacity;
}
#_universal_loader.loaded ._wave_container {
  transform: scale(15);
  filter: blur(8px) brightness(90000%) drop-shadow(0 4px 30px rgba(0,0,0,1));
  opacity: 0.8;
  color: #000000;
}
#_universal_loader.loaded ._wave_path {
  animation: wave_loop 0.2s linear infinite !important;
}
._wave_svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  overflow: visible;
}
._wave_path {
  stroke: #fff;
  opacity: 0.7;
  animation: wave_loop 4s linear infinite;
  filter: blur(2px) drop-shadow(0 4px 30px rgba(0,0,0,1));
}
@keyframes wave_loop {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
#_universal_loader.loaded {
  opacity: 0;
  pointer-events: none;
}
`;

const WAVE_PATH = "M0,100 C150,180 350,20 500,100 C650,180 850,20 1000,100 C1150,180 1350,20 1500,100 C1650,180 1850,20 2000,100";

export default function UniversalLoader() {
  const overlayRef = useRef(null);
  const removedRef = useRef(false);

  useEffect(() => {
    function revealPage() {
      const overlay = overlayRef.current;
      if (!overlay || removedRef.current) return;
      overlay.classList.add('loaded');
      setTimeout(() => {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
          removedRef.current = true;
        }
      }, TIMINGS.LOADER_TRANSITION);
    }

    function checkAndReveal() {
      if (window.location.href.indexOf('?') > -1) {
        setTimeout(revealPage, TIMINGS.LOADER_QUERY_DELAY);
      } else {
        revealPage();
      }
    }

    if (document.readyState === 'complete') {
      checkAndReveal();
    } else {
      window.addEventListener('load', checkAndReveal);
      // Fallback timeout
      const fallback = setTimeout(checkAndReveal, TIMINGS.LOADER_TIMEOUT);
      return () => {
        window.removeEventListener('load', checkAndReveal);
        clearTimeout(fallback);
      };
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LOADER_CSS }} />
      <div id="_universal_loader" ref={overlayRef}>
        <div className="_wave_container">
          <svg
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
            className="_wave_svg"
          >
            <path d={WAVE_PATH} className="_wave_path" />
          </svg>
        </div>
      </div>
    </>
  );
}
