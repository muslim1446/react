import React, { useState, useEffect, useCallback } from 'react';

// =========================================================================
// PAGE TRANSITION — Full-screen black overlay
// ID: #_m, 1.2s cubic-bezier fade, z-index 2147483647
// Activates with .active class for view switching transitions
// =========================================================================

export default function PageTransition() {
  const [active, setActive] = useState(false);

  // Expose globally for compatibility with cinema system
  useEffect(() => {
    window.showPageTransition = () => setActive(true);
    window.hidePageTransition = () => setActive(false);

    // Remove fade on popstate/pageshow
    function removeFade() { setActive(false); }
    window.addEventListener('popstate', removeFade);
    window.addEventListener('pageshow', removeFade);

    return () => {
      window.removeEventListener('popstate', removeFade);
      window.removeEventListener('pageshow', removeFade);
    };
  }, []);

  return <div id="_m" className={active ? 'active' : ''} />;
}
