import React, { useEffect, useState } from 'react';

export default function BrandLogo({ logoSrc = 'assets/ui/logo.png' }) {
  const [visible, setVisible] = useState(() => {
    // Check for ?regex param — if present, hide
    const params = new URLSearchParams(window.location.search);
    if (params.has('regex')) return false;
    return window.innerWidth >= 768;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('regex')) {
      setVisible(false);
      return;
    }

    function handleResize() {
      setVisible(window.innerWidth >= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <a
      href="/"
      className="_el"
      id="_d3"
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
