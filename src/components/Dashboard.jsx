import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';
import { useConfig } from '../contexts/ConfigContext';
import { useI18n } from '../contexts/I18nContext';
import { getTunneledUrl } from '../utils/api';
import { encodeStream } from '../utils/streamCodec';
import { TIMINGS } from '../utils/constants';

// =========================================================================
// DASHBOARD — Main dashboard view
// Contains: Hero section with preview, play button, and all-chapters card row
// CSS :has(#_bg:empty) collapses hero to 0vh when title is empty
// =========================================================================

// Trending chapters (1-based chapter numbers)
const TRENDING = [81, 82, 85, 54, 104, 81, 86, 69, 56, 88, 53];

export default function Dashboard() {
  const { state, dispatch } = usePlayer();
  const { chapters, loaded } = useConfig();
  const { t } = useI18n();

  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const previewImgRef = useRef(null);
  const previewAudioRef = useRef(null);
  const previewTimerRef = useRef(null);
  const rowRef = useRef(null);

  // Build card indices: trending (1-based -> 0-based) + short surahs (77..113) + all 114 (0..113)
  const cardIndices = useMemo(() => {
    if (!chapters.length) return [];
    const trending = TRENDING.map(n => n - 1);
    const shortSurahs = [];
    for (let i = 77; i <= 113; i++) {
      shortSurahs.push(i);
    }
    const all = [];
    for (let i = 0; i <= 113; i++) {
      all.push(i);
    }
    return [...trending, ...shortSurahs, ...all];
  }, [chapters]);

  // Get chapter title, using i18n if available
  const getChapterTitle = useCallback((chapter) => {
    if (!chapter) return '';
    const key = `chapters.${chapter.chapterNumber}`;
    const translated = t(key);
    // If t() returns the key itself, fallback to english_name
    return translated !== key ? translated : (chapter.english_name || '');
  }, [t]);

  // Schedule preview on card focus (600ms debounce)
  const schedulePreview = useCallback((chapterNum) => {
    clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(async () => {
      const idx = chapterNum - 1;
      if (idx < 0 || idx >= chapters.length) return;
      const chapter = chapters[idx];

      // Update hero text
      setHeroTitle(getChapterTitle(chapter));
      setHeroSubtitle(chapter.title || '');

      // Load hero image
      try {
        const imgUrl = await getTunneledUrl('image', `${chapterNum}_1.png`);
        if (previewImgRef.current) {
          previewImgRef.current.src = imgUrl;
          previewImgRef.current.style.opacity = '1';
        }
      } catch (e) {
        // Image load failure is non-fatal
      }

      // Start preview audio at 0.6 volume
      try {
        const audioUrl = await getTunneledUrl('audio', `${String(chapterNum).padStart(3, '0')}001.mp3`);
        if (previewAudioRef.current) {
          previewAudioRef.current.src = audioUrl;
          previewAudioRef.current.volume = 0.6;
          previewAudioRef.current.play().catch(() => {});
        }
      } catch (e) {
        // Audio preview failure is non-fatal
      }
    }, TIMINGS.PREVIEW_DEBOUNCE);
  }, [chapters, getChapterTitle]);

  // Clean up preview timer on unmount
  useEffect(() => {
    return () => {
      clearTimeout(previewTimerRef.current);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  // Launch player: encode stream token and navigate
  const launchPlayer = useCallback((chapterNum, verseNum) => {
    // Stop preview audio
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    const token = encodeStream(chapterNum, verseNum, state.reciterId, state.translationId, state.audioTranslationId);
    window.location.assign(`?stream=${token}`);
  }, [state.reciterId, state.translationId, state.audioTranslationId]);

  // Play button handler
  const handlePlayClick = useCallback(() => {
    const chapterNum = state.chapterIndex + 1;
    launchPlayer(chapterNum, 1);
  }, [state.chapterIndex, launchPlayer]);

  // Horizontal wheel scroll: convert deltaY to horizontal scroll
  const handleWheel = useCallback((e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      if (rowRef.current) {
        rowRef.current.scrollLeft += e.deltaY;
      }
    }
  }, []);

  // Set initial hero from current chapter
  useEffect(() => {
    if (chapters.length > 0 && state.chapterIndex < chapters.length) {
      const chapter = chapters[state.chapterIndex];
      setHeroTitle(getChapterTitle(chapter));
      setHeroSubtitle(chapter.title || '');
    }
  }, [chapters, state.chapterIndex, getChapterTitle]);

  return (
    <>
      {/* Hidden preview audio element */}
      <audio ref={previewAudioRef} preload="none" hidden style={{ display: 'none' }} />

      {/* Hero Section */}
      <div className="_c3">
        <div className="_af" id="_af">
          <img
            id="_c7"
            className="_c7"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt=""
            ref={previewImgRef}
            style={{ opacity: 0 }}
          />
        </div>
        <div className="_1" />
        <div id="_o">
          {/* Play button */}
          <button id="door-play-btn" className="_c2" tabIndex={0} onClick={handlePlayClick}>
            <svg viewBox="0 0 24 24" fill="white" width="48" height="48">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
        <div className="_cm">
          <h1 className="_bf" id="_bg">{heroTitle}</h1>
          <div className="_b4" id="_aa">{heroSubtitle}</div>
        </div>
      </div>

      {/* All Chapters Row */}
      <div className="_c6 _b">
        <div className="_dp" />
        <div className="_cb" id="_ex" ref={rowRef} onWheel={handleWheel}>
          {cardIndices.map((idx, i) => (
            <div
              key={`${idx}-${i}`}
              className="_dw"
              tabIndex={0}
              onClick={() => launchPlayer(chapters[idx].chapterNumber, 1)}
              onFocus={() => schedulePreview(chapters[idx].chapterNumber)}
            >
              <div className="_c5">{chapters[idx].chapterNumber}</div>
              <div className="_ds">{getChapterTitle(chapters[idx])}</div>
              <div className="_er">{chapters[idx].title || ''}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
