import React from 'react';

// =========================================================================
// SEEK INDICATOR — Left (-10s) / Right (+10s) glassmorphic circles
// Class: ._s, positioned fixed at 10% from edges
// Active state: opacity 1, scale 1.1
// =========================================================================

export default function SeekIndicator({ side, active }) {
  const isLeft = side === 'left';

  return (
    <div
      id={isLeft ? '_4' : '_v'}
      className={`_s ${side}${active ? ' active' : ''}`}
    >
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
