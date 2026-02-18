import React from 'react';

// =========================================================================
// BUFFERING INDICATOR — Spinner shown during audio loading
// Class: ._bl (CSS-defined spinner animation)
// Visible when buffering state is true
// =========================================================================

export default function BufferingIndicator({ visible }) {
  if (!visible) return null;

  return <div className="_bl" />;
}
