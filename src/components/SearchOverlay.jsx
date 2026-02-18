import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';
import { useConfig } from '../contexts/ConfigContext';
import { useI18n } from '../contexts/I18nContext';
import { searchChapters } from '../utils/api';
import { KEYBOARD_KEYS } from '../utils/constants';

// =========================================================================
// SEARCH OVERLAY — Full-screen search panel
// ID: #_bj, CSS grid (350px sidebar + results)
// Features: on-screen keyboard (TV), voice search, AI-powered results
// =========================================================================

export default function SearchOverlay() {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { chapters } = useConfig();
  const { dispatch } = usePlayer();
  const { t } = useI18n();
  const searchTimerRef = useRef(null);

  // Expose open/close globally
  useEffect(() => {
    window.openSearch = (initialQuery) => {
      setActive(true);
      if (initialQuery) setQuery(initialQuery);
    };
    window.closeSearch = () => setActive(false);
  }, []);

  // Auto-search when query length > 2
  useEffect(() => {
    if (query.length <= 2) {
      setResults([]);
      return;
    }

    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchChapters(query);
        if (data && Array.isArray(data)) {
          setResults(data.filter(n => n >= 1 && n <= 114));
        } else if (data && data.streamprotectedtrack_cee2) {
          const arr = Array.isArray(data.streamprotectedtrack_cee2)
            ? data.streamprotectedtrack_cee2
            : [data.streamprotectedtrack_cee2];
          setResults(arr.filter(n => n >= 1 && n <= 114));
        }
      } catch (e) {
        console.error('[Search] Error:', e);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimerRef.current);
  }, [query]);

  // Keyboard key press handler (for on-screen keyboard)
  const handleKeyPress = useCallback((key) => {
    if (key === 'SPACE') {
      setQuery(prev => prev + ' ');
    } else if (key === 'DEL') {
      setQuery(prev => prev.slice(0, -1));
    } else if (key === 'CLEAR') {
      setQuery('');
    } else {
      setQuery(prev => prev + key.toLowerCase());
    }
  }, []);

  // Result card click
  const handleResultClick = useCallback((chapterNum) => {
    setActive(false);
    dispatch({ type: ActionTypes.SET_CHAPTER, payload: chapterNum - 1 });
    dispatch({ type: ActionTypes.SET_VIEW, payload: 'cinema' });
  }, [dispatch]);

  // Voice search (Web Speech API)
  const handleVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
    };
    recognition.start();
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!active) return;
    function handleEsc(e) {
      if (e.key === 'Escape') setActive(false);
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [active]);

  return (
    <div id="_bj" className={active ? 'active' : ''}>
      {/* Left panel: keyboard + voice */}
      <div className="_a0">
        <button
          id="_a1"
          role="button"
          tabIndex={0}
          data-i18n-aria-label="search.voiceSearch"
          onClick={handleVoiceSearch}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        {/* Search text display */}
        <div id="_t">{query || 'Type to search...'}</div>

        {/* On-screen keyboard grid */}
        <div id="_cc" className="_cc">
          {KEYBOARD_KEYS.map((key) => (
            <button
              key={key}
              className="_key"
              onClick={() => handleKeyPress(key)}
              tabIndex={0}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Right panel: results */}
      <div className="_a5">
        <h3>{t('search.topResults') || 'Top Results'}</h3>
        <div id="_5">
          {searching && <div className="_bl" />}
          {!searching && results.length === 0 && query.length > 2 && (
            <p>Use the keyboard to describe a topic...</p>
          )}
          {results.map((chapterNum) => {
            const chapter = chapters[chapterNum - 1];
            if (!chapter) return null;
            return (
              <div
                key={chapterNum}
                className="_dw"
                tabIndex={0}
                role="button"
                onClick={() => handleResultClick(chapterNum)}
              >
                <div className="_c5">{chapterNum}</div>
                <div className="_dz">
                  <span className="_d1">{chapter.english_name || `Chapter ${chapterNum}`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
