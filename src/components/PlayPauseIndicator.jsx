import React from 'react';

// =========================================================================
// PLAY/PAUSE INDICATOR — Center-screen animated feedback
// ID: #_3, class ._3, each icon in ._b1 circles
// cinema-pop keyframe: scale 0.8->1.1->1.5, fade in->out over 0.6s
// =========================================================================

const ICONS = {
  play: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  ),
  forward: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30">
      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6-8.5-6z" />
    </svg>
  ),
  backward: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30">
      <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
    </svg>
  ),
};

export default function PlayPauseIndicator({ type }) {
  if (!type) return null;

  return (
    <div id="_3" className="_3">
      <div className={`_b1${type ? ' animate' : ''}`}>
        {ICONS[type] || null}
      </div>
    </div>
  );
}
