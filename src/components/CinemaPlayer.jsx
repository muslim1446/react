import React, { useEffect, useCallback, useRef, useState } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';
import { useConfig } from '../contexts/ConfigContext';
import { useI18n } from '../contexts/I18nContext';
import useAudioPlayer from '../hooks/useAudioPlayer';
import useCinemaCaptions from '../hooks/useCinemaCaptions';
import useMediaSession from '../hooks/useMediaSession';
import { getTunneledUrl } from '../utils/api';
import { syncStateToUrl } from '../utils/streamCodec';
import { loadTranslation, getVerseText } from '../utils/translationParser';
import PlayerControls from './PlayerControls';
import CinemaNav from './CinemaNav';

export default function CinemaPlayer({ feedbackRef }) {
  const { state, dispatch } = usePlayer();
  const { chapters, reciters, translations, forbiddenToTranslateSet, loaded: configLoaded } = useConfig();
  const { t } = useI18n();

  const isActive = state.view === 'cinema';

  // Double-buffered image refs
  const currentImgRef = useRef(null);
  const nextImgRef = useRef(null);
  const [isImgSwapped, setIsImgSwapped] = useState(false);

  // Translation text state
  const [translationText, setTranslationText] = useState('');
  const [showStartBtn, setShowStartBtn] = useState(true);

  // Seek indicators
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
  } = useAudioPlayer({
    onEnded: handleEnded,
    onPlay: handlePlay,
    onPause: handlePause,
  });

  // Media Session
  useMediaSession({
    title: chapters[state.chapterIndex]?.english_name || 'Tuwa',
    artist: 'The Sight | Original Series',
    artwork: null,
    onPlay: () => play(),
    onPause: () => pause(),
    onNext: () => dispatch({ type: ActionTypes.NEXT_VERSE }),
    onPrev: () => dispatch({ type: ActionTypes.SET_VERSE, payload: Math.max(0, state.verseIndex - 1) }),
    onSeekForward: () => smartSeek(10),
    onSeekBackward: () => smartSeek(-10),
  });

  // Show feedback via parent ref
  const showFeedback = useCallback((type) => {
    if (feedbackRef?.current?.showFeedback) {
      feedbackRef.current.showFeedback(type);
    }
  }, [feedbackRef]);

  // -----------------------------------------------------------------------
  // LOAD VERSE — Core playback function
  // -----------------------------------------------------------------------
  const loadVerse = useCallback(async (autoplay = false) => {
    if (!configLoaded || !chapters.length) return;

    const chapter = chapters[state.chapterIndex];
    if (!chapter) return;

    const chapterNum = chapter.chapterNumber || (state.chapterIndex + 1);
    const verses = chapter.streamprotectedcase_cww2 || chapter.verses || [];
    const verseData = verses[state.verseIndex];
    const verseNum = verseData?.verseNumber || (state.verseIndex + 1);
    const chapterStr = String(chapterNum).padStart(3, '0');
    const verseStr = String(verseNum).padStart(3, '0');
    const verseKey = `${chapterNum}-${verseNum}`;
    const isForbidden = forbiddenToTranslateSet?.has(verseKey);

    dispatch({ type: ActionTypes.SET_BUFFERING, payload: true });

    try {
      // 1. Load verse image (double-buffered crossfade)
      try {
        const imgFilename = `${chapterNum}_${verseNum}.png`;
        const imgUrl = await getTunneledUrl('image', imgFilename);
        const targetImg = isImgSwapped ? currentImgRef.current : nextImgRef.current;
        const activeImg = isImgSwapped ? nextImgRef.current : currentImgRef.current;
        if (targetImg && imgUrl) {
          targetImg.src = imgUrl;
          targetImg.onload = () => {
            if (activeImg) activeImg.classList.remove('_at');
            targetImg.classList.add('_at');
            dispatch({ type: ActionTypes.SET_BUFFERING, payload: false });
          };
          if (targetImg.complete && targetImg.naturalHeight !== 0) {
            if (activeImg) activeImg.classList.remove('_at');
            targetImg.classList.add('_at');
          }
          setIsImgSwapped(prev => !prev);
        }
      } catch (e) {
        // Image load failure is non-fatal
      }

      // 2. Load audio
      const audioFilename = `${chapterStr}${verseStr}.mp3`;
      const audioUrl = await getTunneledUrl('audio', audioFilename);
      await setSource(audioUrl, autoplay);

      // 3. Load translation text (after audio so pause events don't clear timers)
      if (!isForbidden && state.translationId && translations[state.translationId]) {
        const doc = await loadTranslation(state.translationId, translations);
        if (doc) {
          const text = getVerseText(doc, chapterNum, verseNum);
          setTranslationText(text);
          setCaptionText(text);
        }
      } else {
        setTranslationText('');
        setCaptionText('');
      }

      // 4. Save state
      syncStateToUrl({
        chapter: chapterNum,
        verse: verseNum,
        reciter: state.reciterId,
        translation: state.translationId,
        audioTranslation: state.audioTranslationId,
      });

      // Update document title
      const chapterName = chapter.english_name || '';
      document.title = `${chapterName} | Tuwa`;

      // Update chapter metadata
      dispatch({
        type: ActionTypes.SET_CHAPTER_META,
        payload: {
          name: chapterName,
          verseCount: verses.length || 7,
        },
      });

    } catch (e) {
      console.error('[CinemaPlayer] Load verse error:', e);
    } finally {
      dispatch({ type: ActionTypes.SET_BUFFERING, payload: false });
    }
  }, [
    configLoaded, chapters, translations, forbiddenToTranslateSet,
    state.chapterIndex, state.verseIndex,
    state.reciterId, state.translationId, state.audioTranslationId,
    dispatch, isImgSwapped, setSource,
  ]);

  // Load verse when chapter/verse/reciter/translation changes
  useEffect(() => {
    if (isActive && configLoaded) {
      loadVerse(state.isPlaying);
    }
  }, [state.chapterIndex, state.verseIndex, state.reciterId, state.translationId, isActive, configLoaded]);

  // Handle Start button
  const handleStart = useCallback(() => {
    setShowStartBtn(false);
    loadVerse(true);
  }, [loadVerse]);

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

  // Chapter title
  const chapterTitle = chapters[state.chapterIndex]?.english_name || '';
  const chapter = chapters[state.chapterIndex];
  const chapterNum = chapter?.chapterNumber || (state.chapterIndex + 1);
  const verses = chapter?.streamprotectedcase_cww2 || chapter?.verses || [];
  const verseData = verses[state.verseIndex];
  const verseNum = verseData?.verseNumber || (state.verseIndex + 1);

  return (
    <>
      {/* Touch area */}
      <div id="_a6" onTouchStart={handleTouchStart}>
        {/* Sub-navigation with chapter title */}
        <nav id="_b7">
          <h2 className="_av" id="_az">{chapterTitle}</h2>
        </nav>

        {/* Content area */}
        <div className="_by">
          <div className="_1" />

          {/* Buffering spinner */}
          {state.isBuffering && <div className="_bl" />}

          {/* Verse display container */}
          <div className="_dk" id="_dk" />

          {/* Start button */}
          {showStartBtn && (
            <button id="_ek" className="_ek" onClick={handleStart}>
              {t('player.start') || 'Start'}
            </button>
          )}
        </div>

        {/* Seek indicators */}
        <div id="_4" className={`_s left${leftSeekActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
          </svg>
          <span>-10s</span>
        </div>
        <div id="_v" className={`_s right${rightSeekActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6-8.5-6z" />
          </svg>
          <span>+10s</span>
        </div>
      </div>

      {/* Cinema nav (back/forward) */}
      <CinemaNav />

      {/* Media container */}
      <div className="container">
        <audio id="_cq" crossOrigin="anonymous" ref={audioRef} />
        <audio id="_e" crossOrigin="anonymous" ref={translationAudioRef} />

        <h1 id="_ch">
          {chapter?.title || ''}{' '}
          <span className="_ar">({chapterNum}:{verseNum})</span>
        </h1>

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

      {/* Player controls bar */}
      <PlayerControls />
    </>
  );
}
