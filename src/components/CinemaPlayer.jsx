import React, { useEffect, useCallback, useRef, useState } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';
import { useConfig } from '../contexts/ConfigContext';
import { useI18n } from '../contexts/I18nContext';
import useAudioPlayer from '../hooks/useAudioPlayer';
import useCinemaCaptions from '../hooks/useCinemaCaptions';
import useIdleDetection from '../hooks/useIdleDetection';
import useMediaSession from '../hooks/useMediaSession';
import { getTunneledUrl } from '../utils/api';
import { syncStateToUrl } from '../utils/streamCodec';
import { loadTranslation, getVerseText } from '../utils/translationParser';
import PlayerControls from './PlayerControls';
import CinemaNav from './CinemaNav';
import PlayPauseIndicator from './PlayPauseIndicator';
import SeekIndicator from './SeekIndicator';
import { STORAGE_KEYS } from '../utils/constants';

// =========================================================================
// CINEMA PLAYER — Full-screen immersive Quran player
// ID: #_dd, activated with .active class
// Features: double-buffered images, timed captions, audio engine,
// idle detection, seek indicators, play/pause indicators
// =========================================================================

export default function CinemaPlayer() {
  const { state, dispatch } = usePlayer();
  const { chapters, reciters, translations, loaded: configLoaded } = useConfig();
  const { t } = useI18n();

  const isActive = state.view === 'cinema';

  // Double-buffered image refs
  const currentImgRef = useRef(null);
  const nextImgRef = useRef(null);
  const [isImgSwapped, setIsImgSwapped] = useState(false);

  // Translation text state
  const [translationText, setTranslationText] = useState('');
  const [showStartBtn, setShowStartBtn] = useState(true);

  // Feedback indicators
  const [feedbackType, setFeedbackType] = useState(null); // 'play'|'pause'|'forward'|'backward'
  const [leftSeekActive, setLeftSeekActive] = useState(false);
  const [rightSeekActive, setRightSeekActive] = useState(false);

  // Cinema captions
  const { playCinemaCaptions, clearCaptions } = useCinemaCaptions();
  const [captionText, setCaptionText] = useState('');

  // Auto-advance handler
  const handleEnded = useCallback(() => {
    clearCaptions();
    dispatch({ type: ActionTypes.NEXT_VERSE });
  }, [dispatch, clearCaptions]);

  const handlePlay = useCallback(() => {
    dispatch({ type: ActionTypes.SET_PLAYING, payload: true });
  }, [dispatch]);

  const handlePause = useCallback(() => {
    dispatch({ type: ActionTypes.SET_PLAYING, payload: false });
  }, [dispatch]);

  // Audio player
  const {
    audioRef,
    translationAudioRef,
    play,
    pause,
    toggle,
    setSource,
    smartSeek,
    softFadeAudio,
  } = useAudioPlayer({
    onEnded: handleEnded,
    onPlay: handlePlay,
    onPause: handlePause,
  });

  // Idle detection
  useIdleDetection(state.view, (idle) => {
    dispatch({ type: ActionTypes.SET_IDLE, payload: idle });
  });

  // Media Session
  useMediaSession({
    title: chapters[state.chapterIndex]?.english_name || 'Tuwa',
    artist: reciters[state.reciterId]?.name || 'OpenTuwa',
    artwork: null,
    onPlay: () => play(),
    onPause: () => pause(),
    onNext: () => dispatch({ type: ActionTypes.NEXT_VERSE }),
    onPrev: () => dispatch({ type: ActionTypes.SET_VERSE, payload: Math.max(0, state.verseIndex - 1) }),
    onSeekForward: () => smartSeek(10),
    onSeekBackward: () => smartSeek(-10),
  });

  // -----------------------------------------------------------------------
  // LOAD VERSE — Core playback function
  // -----------------------------------------------------------------------
  const loadVerse = useCallback(async (autoplay = false) => {
    if (!configLoaded || !chapters.length) return;

    const chapterNum = state.chapterIndex + 1;
    const verseNum = state.verseIndex + 1;
    const chapterStr = String(chapterNum).padStart(3, '0');
    const verseStr = String(verseNum).padStart(3, '0');

    dispatch({ type: ActionTypes.SET_BUFFERING, payload: true });

    try {
      // 1. Load verse image (double-buffered crossfade)
      const imgFilename = `${chapterNum}_${verseNum}.png`;
      // Images go through tunneled URL
      try {
        const imgUrl = await getTunneledUrl('image', imgFilename);
        const targetImg = isImgSwapped ? currentImgRef.current : nextImgRef.current;
        if (targetImg) {
          targetImg.src = imgUrl;
          setIsImgSwapped(prev => !prev);
        }
      } catch (e) {
        // Image load failure is non-fatal
      }

      // 2. Load translation text
      if (state.translationId && translations[state.translationId]) {
        const doc = await loadTranslation(state.translationId, translations);
        if (doc) {
          const text = getVerseText(doc, chapterNum, verseNum);
          setTranslationText(text);

          // Cinema captions: sync chunks to audio duration
          if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
            playCinemaCaptions(text, audioRef.current.duration, (chunk) => {
              setCaptionText(chunk);
            });
          } else {
            setCaptionText(text);
          }
        }
      }

      // 3. Load audio
      const audioFilename = `${chapterStr}${verseStr}.mp3`;
      const audioUrl = await getTunneledUrl('audio', audioFilename);
      await setSource(audioUrl, autoplay);

      // 4. Save state
      syncStateToUrl({
        chapter: chapterNum,
        verse: verseNum,
        reciter: state.reciterId,
        translation: state.translationId,
        audioTranslation: state.audioTranslationId,
      });

      // Update document title
      const chapterName = chapters[state.chapterIndex]?.english_name || '';
      document.title = `${chapterName} - Verse ${verseNum} | Tuwa`;

      // Update chapter metadata
      dispatch({
        type: ActionTypes.SET_CHAPTER_META,
        payload: {
          name: chapterName,
          verseCount: chapters[state.chapterIndex]?.verse_count || 7,
        },
      });

    } catch (e) {
      console.error('[CinemaPlayer] Load verse error:', e);
    } finally {
      dispatch({ type: ActionTypes.SET_BUFFERING, payload: false });
    }
  }, [
    configLoaded, chapters, translations, reciters, state.chapterIndex, state.verseIndex,
    state.reciterId, state.translationId, state.audioTranslationId,
    dispatch, isImgSwapped, setSource, audioRef, playCinemaCaptions,
  ]);

  // Load verse when chapter/verse/reciter/translation changes
  useEffect(() => {
    if (isActive && configLoaded) {
      loadVerse(state.isPlaying);
    }
  }, [state.chapterIndex, state.verseIndex, state.reciterId, state.translationId, isActive, configLoaded, loadVerse]);

  // Handle Start button
  const handleStart = useCallback(() => {
    setShowStartBtn(false);
    loadVerse(true);
  }, [loadVerse]);

  // Show interaction feedback
  const showFeedback = useCallback((type) => {
    setFeedbackType(type);
    setTimeout(() => setFeedbackType(null), 600);
  }, []);

  // Mobile double-tap zones
  const handleTouchStart = useCallback((e) => {
    const x = e.touches[0].clientX;
    const width = window.innerWidth;

    if (x < width / 3) {
      smartSeek(-10);
      setLeftSeekActive(true);
      showFeedback('backward');
      setTimeout(() => setLeftSeekActive(false), 600);
    } else if (x > (width * 2) / 3) {
      smartSeek(10);
      setRightSeekActive(true);
      showFeedback('forward');
      setTimeout(() => setRightSeekActive(false), 600);
    } else {
      toggle();
      showFeedback(state.isPlaying ? 'pause' : 'play');
    }
  }, [smartSeek, toggle, state.isPlaying, showFeedback]);

  // Keyboard controls in cinema mode
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
        showFeedback(state.isPlaying ? 'pause' : 'play');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, toggle, state.isPlaying, showFeedback]);

  // H2 title sync (replaces MutationObserver)
  const chapterTitle = chapters[state.chapterIndex]?.english_name || '';

  return (
    <div id="_dd" className={isActive ? 'active' : ''}>
      {/* Audio elements */}
      <audio id="_cq" crossOrigin="anonymous" ref={audioRef} />
      <audio id="_e" crossOrigin="anonymous" ref={translationAudioRef} />

      {/* Cinema nav (back/forward) */}
      <CinemaNav />

      {/* Header area */}
      <div id="_a6" onTouchStart={handleTouchStart}>
        {/* Sub-navigation with chapter title */}
        <div id="_b7">
          <h2 id="_az">{chapterTitle}</h2>
        </div>

        {/* Content area */}
        <div className="_by">
          <div className="_1" />

          {/* Buffering spinner */}
          {state.isBuffering && <div className="_bl" />}

          {/* Verse display container */}
          <div id="_dk">
            <div className="container">
              <h1 id="_ch">{chapterTitle}</h1>

              {/* Gradient overlays */}
              <div className="hero-shadowz-overlay" />
              <div className="_l" />

              {/* Double-buffered verse images */}
              <div id="_bd">
                <div id="_be">
                  <div id="_0" />
                  <img
                    id="_do"
                    ref={currentImgRef}
                    className={isImgSwapped ? '' : '_at'}
                    width="600"
                    height="300"
                    loading="eager"
                    alt=""
                  />
                  <img
                    id="_bh"
                    ref={nextImgRef}
                    className={isImgSwapped ? '_at' : ''}
                    loading="lazy"
                    alt=""
                  />
                </div>
              </div>

              {/* Translation text */}
              <div id="_au" dir="auto">
                {captionText || translationText}
              </div>
            </div>
          </div>

          {/* Start button */}
          {showStartBtn && (
            <button id="_ek" onClick={handleStart}>
              Start
            </button>
          )}
        </div>

        {/* Seek indicators */}
        <SeekIndicator side="left" active={leftSeekActive} />
        <SeekIndicator side="right" active={rightSeekActive} />
      </div>

      {/* Play/Pause/Forward/Backward indicators */}
      <PlayPauseIndicator type={feedbackType} />

      {/* Player controls bar */}
      <PlayerControls />
    </div>
  );
}
