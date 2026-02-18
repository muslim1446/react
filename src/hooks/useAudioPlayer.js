import { useRef, useCallback, useEffect } from 'react';
import { TIMINGS } from '../utils/constants';

// =========================================================================
// USE AUDIO PLAYER — Core audio playback hook
// Implements: softFadeAudio (800ms), smoothAudioEntry (250ms),
// auto-advance on ended, smartSeek across verse/chapter boundaries
// "Spotify Philosophy" — smooth transitions between verses
// =========================================================================

export default function useAudioPlayer({ onEnded, onPlay, onPause }) {
  const audioRef = useRef(null);
  const translationAudioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const entryIntervalRef = useRef(null);
  const seekCooldownRef = useRef(false);
  const pendingSeekOffsetRef = useRef(0);

  // -----------------------------------------------------------------------
  // SOFT FADE AUDIO — 800ms exponential fade-out, then pause
  // -----------------------------------------------------------------------
  const softFadeAudio = useCallback((audioEl, duration = TIMINGS.SOFT_FADE_DURATION) => {
    return new Promise((resolve) => {
      if (!audioEl || audioEl.paused) {
        resolve();
        return;
      }

      clearInterval(fadeIntervalRef.current);
      const startVolume = audioEl.volume;
      const steps = 20;
      const stepTime = duration / steps;
      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        // Exponential curve for natural fade
        audioEl.volume = Math.max(0, startVolume * (1 - progress * progress));

        if (currentStep >= steps) {
          clearInterval(fadeIntervalRef.current);
          audioEl.pause();
          audioEl.volume = startVolume;
          resolve();
        }
      }, stepTime);
    });
  }, []);

  // -----------------------------------------------------------------------
  // SMOOTH AUDIO ENTRY — 250ms micro-fade-in to prevent digital pops
  // -----------------------------------------------------------------------
  const smoothAudioEntry = useCallback((audioEl, targetVol = 1, duration = TIMINGS.SMOOTH_ENTRY_DURATION) => {
    if (!audioEl) return;

    clearInterval(entryIntervalRef.current);
    audioEl.volume = 0;

    const steps = 10;
    const stepTime = duration / steps;
    let currentStep = 0;

    entryIntervalRef.current = setInterval(() => {
      currentStep++;
      audioEl.volume = Math.min(targetVol, (currentStep / steps) * targetVol);

      if (currentStep >= steps) {
        clearInterval(entryIntervalRef.current);
        audioEl.volume = targetVol;
      }
    }, stepTime);
  }, []);

  // -----------------------------------------------------------------------
  // PLAY with smooth entry
  // -----------------------------------------------------------------------
  const play = useCallback(async (audioEl) => {
    const el = audioEl || audioRef.current;
    if (!el) return;

    try {
      smoothAudioEntry(el);
      await el.play();
      onPlay?.();
    } catch (err) {
      if (err.name === 'AbortError') return;
      // Retry on canplay/canplaythrough
      const retryPlay = async () => {
        try {
          smoothAudioEntry(el);
          await el.play();
          onPlay?.();
        } catch (e) { /* ignore */ }
      };
      el.addEventListener('canplay', retryPlay, { once: true });
      el.addEventListener('canplaythrough', retryPlay, { once: true });
      setTimeout(() => {
        el.removeEventListener('canplay', retryPlay);
        el.removeEventListener('canplaythrough', retryPlay);
      }, TIMINGS.AUDIO_RETRY_TIMEOUT);
    }
  }, [smoothAudioEntry, onPlay]);

  // -----------------------------------------------------------------------
  // PAUSE with soft fade
  // -----------------------------------------------------------------------
  const pause = useCallback(async (audioEl) => {
    const el = audioEl || audioRef.current;
    if (!el) return;
    await softFadeAudio(el);
    onPause?.();
  }, [softFadeAudio, onPause]);

  // -----------------------------------------------------------------------
  // TOGGLE play/pause
  // -----------------------------------------------------------------------
  const toggle = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      await play(el);
    } else {
      await pause(el);
    }
  }, [play, pause]);

  // -----------------------------------------------------------------------
  // SET SOURCE — Change audio source with fade out of current
  // -----------------------------------------------------------------------
  const setSource = useCallback(async (src, autoplay = false) => {
    const el = audioRef.current;
    if (!el) return;

    // Fade out current if playing
    if (!el.paused) {
      await softFadeAudio(el);
    }

    el.src = src;
    el.load();

    if (autoplay) {
      // Wait for enough data, then play + apply pending seek
      const startPlay = async () => {
        await play(el);
        // Handle pending seek offset from smartSeek (cross-verse boundary)
        if (pendingSeekOffsetRef.current !== 0) {
          const remaining = pendingSeekOffsetRef.current;
          pendingSeekOffsetRef.current = 0;
          // At canplay, duration is already available
          if (remaining > 0 && remaining < el.duration) {
            el.currentTime = remaining;
          }
        }
      };

      el.addEventListener('canplay', startPlay, { once: true });
    }
  }, [softFadeAudio, play]);

  // -----------------------------------------------------------------------
  // SMART SEEK — ±N seconds, handles cross-verse/chapter boundaries
  // 250ms cooldown to prevent spam
  // -----------------------------------------------------------------------
  const smartSeek = useCallback((seconds) => {
    if (seekCooldownRef.current) return;
    seekCooldownRef.current = true;
    setTimeout(() => { seekCooldownRef.current = false; }, TIMINGS.SEEK_COOLDOWN);

    const el = audioRef.current;
    if (!el || !el.duration || isNaN(el.duration)) return;

    const newTime = el.currentTime + seconds;

    if (newTime >= 0 && newTime < el.duration) {
      // Simple seek within current verse
      el.currentTime = newTime;
    } else if (newTime >= el.duration) {
      // Forward past verse end -> advance and seek remainder
      pendingSeekOffsetRef.current = newTime - el.duration;
      onEnded?.();
    } else if (newTime < 0) {
      // Backward past verse start -> go to beginning
      el.currentTime = 0;
    }
  }, [onEnded]);

  // Expose smartSeek globally for spatial nav
  useEffect(() => {
    window.smartSeek = smartSeek;
    return () => { delete window.smartSeek; };
  }, [smartSeek]);

  // -----------------------------------------------------------------------
  // HANDLE ENDED — Auto-advance to next verse
  // -----------------------------------------------------------------------
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    function handleEnded() {
      onEnded?.();
    }

    el.addEventListener('ended', handleEnded);
    return () => el.removeEventListener('ended', handleEnded);
  }, [onEnded]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      clearInterval(fadeIntervalRef.current);
      clearInterval(entryIntervalRef.current);
    };
  }, []);

  return {
    audioRef,
    translationAudioRef,
    play,
    pause,
    toggle,
    setSource,
    smartSeek,
    softFadeAudio,
    smoothAudioEntry,
  };
}
