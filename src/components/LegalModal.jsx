import React, { useState, useCallback } from 'react';

// =========================================================================
// LEGAL MODAL — Scrollable terms/legal overlay
// Uses obfuscated class names to match existing CSS
// =========================================================================

export default function LegalModal() {
  const [active, setActive] = useState(false);
  const [content, setContent] = useState('');

  // Expose open/close globally for compatibility
  React.useEffect(() => {
    window.openLegal = (type) => {
      // Content would be loaded based on type
      setActive(true);
    };
    window.closeLegal = () => setActive(false);
  }, []);

  const handleClose = useCallback(() => {
    setActive(false);
  }, []);

  return (
    <div id="_b8" className={`_bp${active ? ' active' : ''}`}>
      <div className="_ag">
        <button className="_c8" onClick={handleClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div id="_ae" className="_x" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
