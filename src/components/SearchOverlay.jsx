import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';
import { useConfig } from '../contexts/ConfigContext';
import { useI18n } from '../contexts/I18nContext';
import { searchChapters } from '../utils/api';
import { encodeStream } from '../utils/streamCodec';
import { KEYBOARD_KEYS } from '../utils/constants';

// =========================================================================
// SEARCH OVERLAY — Full-screen search panel
// ID: #_bj, CSS grid (350px sidebar + results)
// Features: on-screen keyboard (TV), voice search, AI-powered results
// =========================================================================

export default function SearchOverlay() {
  const [searchString, setSearchString] = useState('');
  const [results, setResults] = useState([]);
  const { chapters, keyboardKeys } = useConfig();
  const { state, dispatch } = usePlayer();
  const { t } = useI18n();
  const searchTimerRef = useRef(null);

  // Use config keyboard keys or fallback to constants
  const keys = (keyboardKeys && keyboardKeys.length > 0) ? keyboardKeys : KEYBOARD_KEYS;

  // Expose open/close globally for BottomNav compatibility
  useEffect(() => {
    window.openSearch = (initialQuery) => {
      const el = document.getElementById('_bj');
      if (el) el.classList.add('active');
      if (initialQuery) setSearchString(initialQuery);
    };
    window.closeSearch = () => {
      const el = document.getElementById('_bj');
      if (el) el.classList.remove('active');
    };
    return () => {
      window.openSearch = undefined;
      window.closeSearch = undefined;
    };
  }, []);

  // Close search helper
  const closeSearch = useCallback(() => {
    const el = document.getElementById('_bj');
    if (el) el.classList.remove('active');
  }, []);

  // Launch player: encode stream token and navigate
  const launchPlayer = useCallback((chapterNum, verseNum) => {
    const token = encodeStream(chapterNum, verseNum, state.reciterId, state.translationId, state.audioTranslationId);
    window.location.assign(`?stream=${token}`);
  }, [state.reciterId, state.translationId, state.audioTranslationId]);

  // Auto-search when searchString length > 2
  useEffect(() => {
    if (searchString.length <= 2) {
      setResults([]);
      return;
    }

    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const data = await searchChapters(searchString);
        if (data && Array.isArray(data)) {
          // data is array of 1-based chapter numbers, convert to 0-based indices
          setResults(data.filter(n => n >= 1 && n <= 114).map(n => n - 1));
        } else if (data && data.streamprotectedtrack_cee2) {
          const arr = Array.isArray(data.streamprotectedtrack_cee2)
            ? data.streamprotectedtrack_cee2
            : [data.streamprotectedtrack_cee2];
          setResults(arr.filter(n => n >= 1 && n <= 114).map(n => n - 1));
        } else {
          setResults([]);
        }
      } catch (e) {
        console.error('[Search] Error:', e);
      }
    }, 500);

    return () => clearTimeout(searchTimerRef.current);
  }, [searchString]);

  // Keyboard key press handler
  const handleKeyPress = useCallback((key) => {
    if (key === 'SPACE') {
      setSearchString(prev => prev + ' ');
    } else if (key === 'DEL') {
      setSearchString(prev => prev.slice(0, -1));
    } else if (key === 'CLEAR') {
      setSearchString('');
    } else {
      setSearchString(prev => prev + key.toLowerCase());
    }
  }, []);

  // Voice search handler
  const handleVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSearchString(transcript);
    };
    recognition.start();
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') closeSearch();
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeSearch]);

  return (
    <div id="_bj">
      <div className="_a0">
        <div id="_a1" tabIndex={0} role="button" aria-label="Voice Search" onClick={handleVoiceSearch}>
          <svg viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
        <div id="_t">{searchString}</div>
        <div className="_cc" id="_cc">
          {keys.map((key, i) => (
            <div
              key={i}
              className={`key${['SPACE', 'DEL', 'CLEAR'].includes(key) ? ' wide' : ''}`}
              tabIndex={0}
              onClick={() => handleKeyPress(key)}
              onKeyDown={e => e.key === 'Enter' && handleKeyPress(key)}
            >
              {key}
            </div>
          ))}
        </div>
      </div>
      <div className="_a5">
        <div className="_dp _h">Top Results</div>
        <div className="_cx" id="_5">
          {results.length === 0 && <div className="_dq">Use the keyboard to describe a topic...</div>}
          {results.map(idx => (
            <div
              key={idx}
              className="_dw"
              data-streamprotectedtrack_c-ee2={chapters[idx]?.chapterNumber}
              onClick={() => { closeSearch(); launchPlayer(chapters[idx].chapterNumber, 1); }}
            >
              <div className="_c5">{chapters[idx]?.chapterNumber}</div>
              <div className="_ds">{chapters[idx]?.english_name}</div>
              <div className="_er">{chapters[idx]?.title || ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
