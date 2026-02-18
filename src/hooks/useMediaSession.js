import { useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

// =========================================================================
// USE MEDIA SESSION — navigator.mediaSession API integration
// Sets metadata (title, artist, artwork) and action handlers
// Duration: Infinity trick for streaming feel
// Respects disableMediaControls localStorage flag
// =========================================================================

export default function useMediaSession({ title, artist, artwork, onPlay, onPause, onPrev, onNext, onSeekBackward, onSeekForward }) {
  const isDisabled = useCallback(() => {
    return localStorage.getItem(STORAGE_KEYS.DISABLE_MEDIA_CONTROLS) === 'true' ||
           window.__DISABLE_MEDIA_SESSION__;
  }, []);

  // Update metadata
  useEffect(() => {
    if (!('mediaSession' in navigator) || isDisabled()) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || 'Tuwa',
        artist: artist || 'OpenTuwa',
        album: 'Quran',
        artwork: artwork ? [
          { src: artwork, sizes: '600x300', type: 'image/png' },
        ] : [],
      });
    } catch (e) {
      // MediaMetadata may not be available
    }
  }, [title, artist, artwork, isDisabled]);

  // Set action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator) || isDisabled()) return;

    const handlers = {
      play: onPlay,
      pause: onPause,
      previoustrack: onPrev,
      nexttrack: onNext,
      seekbackward: onSeekBackward,
      seekforward: onSeekForward,
    };

    Object.entries(handlers).forEach(([action, handler]) => {
      if (handler) {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (e) {
          // Action not supported
        }
      }
    });

    return () => {
      Object.keys(handlers).forEach(action => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (e) { /* ignore */ }
      });
    };
  }, [onPlay, onPause, onPrev, onNext, onSeekBackward, onSeekForward, isDisabled]);
}
