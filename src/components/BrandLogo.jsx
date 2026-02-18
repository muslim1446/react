import React, { useEffect, useState } from 'react';

// =========================================================================
// BRAND LOGO — Fixed position "Tuwa" logo + text
// Hidden on mobile (< 768px), shared between app and landing pages
// Uses obfuscated class names to match existing CSS
// =========================================================================

export default function BrandLogo({ logoSrc = 'assets/ui/logo.png' }) {
  const [visible, setVisible] = useState(window.innerWidth >= 768);

  useEffect(() => {
    function handleResize() {
      setVisible(window.innerWidth >= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <a
      href="/"
      id="_d3"
      className="_el"
      aria-label="Tuwa Home"
      style={{ display: visible ? 'flex' : 'none' }}
    >
      <div className="_d0">
        <img src={logoSrc} alt="Tuwa Logo" />
      </div>
      <span className="_d6">Tuwa</span>
    </a>
  );
}
