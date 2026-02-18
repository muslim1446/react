import { useEffect, useRef } from 'react';

// =========================================================================
// USE TEXT FADE — Eye-soothe animation on content change
// Replaces MutationObserver pattern from vanilla JS
// Triggers a CSS class toggle for smooth fade transitions
// =========================================================================

export default function useTextFade(elementRef, dependency) {
  const prevValueRef = useRef(null);

  useEffect(() => {
    if (!elementRef?.current) return;

    // Only animate if the content actually changed
    if (prevValueRef.current !== null && prevValueRef.current !== dependency) {
      const el = elementRef.current;

      // Remove class, force reflow, add class to re-trigger animation
      el.classList.remove('_at');
      void el.offsetWidth; // force reflow
      el.classList.add('_at');
    }

    prevValueRef.current = dependency;
  }, [dependency, elementRef]);
}
