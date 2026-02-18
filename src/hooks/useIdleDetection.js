import { useEffect, useRef, useCallback } from 'react';
import { TIMINGS } from '../utils/constants';

// =========================================================================
// USE IDLE DETECTION
// Dashboard: 4s idle timeout
// Cinema: 5s idle timeout + 5s failsafe auto-blur
// Adds/removes body.idle class
// Resets on: mousemove, keydown, touchstart, click
// =========================================================================

export default function useIdleDetection(view, onIdleChange) {
  const timerRef = useRef(null);
  const failsafeRef = useRef(null);

  const timeout = view === 'cinema' ? TIMINGS.CINEMA_IDLE : TIMINGS.DASHBOARD_IDLE;

  const setIdle = useCallback((idle) => {
    document.body.classList.toggle('idle', idle);
    onIdleChange?.(idle);
  }, [onIdleChange]);

  const resetIdle = useCallback(() => {
    setIdle(false);
    clearTimeout(timerRef.current);
    clearTimeout(failsafeRef.current);

    timerRef.current = setTimeout(() => {
      // Don't go idle if a custom select dropdown is open
      if (document.querySelector('._k.open')) return;

      setIdle(true);

      // Cinema failsafe: auto-blur after additional 5s
      if (view === 'cinema') {
        failsafeRef.current = setTimeout(() => {
          if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur();
          }
        }, TIMINGS.CINEMA_FAILSAFE);
      }
    }, timeout);
  }, [view, timeout, setIdle]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));

    // Start initial timer
    resetIdle();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle));
      clearTimeout(timerRef.current);
      clearTimeout(failsafeRef.current);
      setIdle(false);
    };
  }, [resetIdle, setIdle]);

  return { resetIdle };
}
