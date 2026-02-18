import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getStateFromUrl } from '../utils/streamCodec';

const PlayerContext = createContext(null);

// Default storage key — will be overridden by config once loaded
const DEFAULT_STORAGE_KEY = 'streambasesecured_ca6State_1';

// =========================================================================
// PLAYER STATE
// =========================================================================
const initialState = {
  // Current playback
  chapterIndex: 0,      // 0-based index into chapters array
  verseIndex: 0,        // 0-based verse index
  reciterId: '',        // Current reciter ID
  translationId: '',    // Current translation language ID
  audioTranslationId: '',// Current audio translation ID

  // View state
  view: 'dashboard',    // 'dashboard' | 'cinema'
  isPlaying: false,
  isBuffering: false,
  isIdle: false,

  // Cinema captions
  captionText: '',
  captionChunks: [],
  currentChunkIndex: 0,

  // Translation data
  translationText: '',

  // Chapter metadata (set from config)
  currentChapterName: '',
  currentVerseCount: 0,

  // Mode flags
  mode0: false,         // body._de — hides certain dropdowns
};

// =========================================================================
// ACTIONS
// =========================================================================
const ActionTypes = {
  SET_CHAPTER: 'SET_CHAPTER',
  SET_VERSE: 'SET_VERSE',
  SET_RECITER: 'SET_RECITER',
  SET_TRANSLATION: 'SET_TRANSLATION',
  SET_AUDIO_TRANSLATION: 'SET_AUDIO_TRANSLATION',
  SET_VIEW: 'SET_VIEW',
  SET_PLAYING: 'SET_PLAYING',
  SET_BUFFERING: 'SET_BUFFERING',
  SET_IDLE: 'SET_IDLE',
  SET_CAPTION_TEXT: 'SET_CAPTION_TEXT',
  SET_CAPTION_CHUNKS: 'SET_CAPTION_CHUNKS',
  SET_CURRENT_CHUNK: 'SET_CURRENT_CHUNK',
  SET_TRANSLATION_TEXT: 'SET_TRANSLATION_TEXT',
  SET_CHAPTER_META: 'SET_CHAPTER_META',
  SET_MODE0: 'SET_MODE0',
  RESTORE_STATE: 'RESTORE_STATE',
  NEXT_VERSE: 'NEXT_VERSE',
};

function playerReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_CHAPTER:
      return { ...state, chapterIndex: action.payload, verseIndex: 0 };
    case ActionTypes.SET_VERSE:
      return { ...state, verseIndex: action.payload };
    case ActionTypes.SET_RECITER:
      return { ...state, reciterId: action.payload };
    case ActionTypes.SET_TRANSLATION:
      return { ...state, translationId: action.payload };
    case ActionTypes.SET_AUDIO_TRANSLATION:
      return { ...state, audioTranslationId: action.payload };
    case ActionTypes.SET_VIEW:
      return { ...state, view: action.payload };
    case ActionTypes.SET_PLAYING:
      return { ...state, isPlaying: action.payload };
    case ActionTypes.SET_BUFFERING:
      return { ...state, isBuffering: action.payload };
    case ActionTypes.SET_IDLE:
      return { ...state, isIdle: action.payload };
    case ActionTypes.SET_CAPTION_TEXT:
      return { ...state, captionText: action.payload };
    case ActionTypes.SET_CAPTION_CHUNKS:
      return { ...state, captionChunks: action.payload, currentChunkIndex: 0 };
    case ActionTypes.SET_CURRENT_CHUNK:
      return { ...state, currentChunkIndex: action.payload };
    case ActionTypes.SET_TRANSLATION_TEXT:
      return { ...state, translationText: action.payload };
    case ActionTypes.SET_CHAPTER_META:
      return {
        ...state,
        currentChapterName: action.payload.name || '',
        currentVerseCount: action.payload.verseCount || 0,
      };
    case ActionTypes.SET_MODE0:
      return { ...state, mode0: action.payload };
    case ActionTypes.RESTORE_STATE:
      return { ...state, ...action.payload };
    case ActionTypes.NEXT_VERSE: {
      // payload.verseCount is the authoritative verse count passed by the caller
      const verseCount = (action.payload && action.payload.verseCount) || state.currentVerseCount;
      if (state.verseIndex + 1 < verseCount) {
        return { ...state, verseIndex: state.verseIndex + 1 };
      }
      // Next chapter (wraps to 0 if past 113)
      const nextChapter = (state.chapterIndex + 1) % 114;
      return { ...state, chapterIndex: nextChapter, verseIndex: 0 };
    }
    default:
      return state;
  }
}

// =========================================================================
// HELPERS: localStorage with vanilla JS format
// =========================================================================

/**
 * Read state from localStorage using the vanilla JS key format:
 *   { 'streamprotectedtrack_c-ee2': chapterIndex,
 *     'streamprotectedcase_c-ww2': verseIndex,
 *     streamprotectedlicense_artist_cr1: reciterId,
 *     trans: translationId,
 *     audio_trans: audioTranslationId }
 */
function readFromStorage(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      chapterIndex: parsed['streamprotectedtrack_c-ee2'] ?? 0,
      verseIndex: parsed['streamprotectedcase_c-ww2'] ?? 0,
      reciterId: parsed['streamprotectedlicense_artist_cr1'] ?? '',
      translationId: parsed['trans'] ?? '',
      audioTranslationId: parsed['audio_trans'] ?? '',
    };
  } catch (e) {
    return null;
  }
}

/**
 * Write state to localStorage in vanilla JS format.
 */
function writeToStorage(storageKey, state) {
  try {
    const toSave = {
      'streamprotectedtrack_c-ee2': state.chapterIndex,
      'streamprotectedcase_c-ww2': state.verseIndex,
      'streamprotectedlicense_artist_cr1': state.reciterId,
      'trans': state.translationId,
      'audio_trans': state.audioTranslationId,
    };
    localStorage.setItem(storageKey, JSON.stringify(toSave));
  } catch (e) {
    // Storage full or blocked
  }
}

// =========================================================================
// PROVIDER
// =========================================================================
export function PlayerProvider({ children, storageKey }) {
  const effectiveStorageKey = storageKey || DEFAULT_STORAGE_KEY;

  const [state, dispatch] = useReducer(playerReducer, initialState, (init) => {
    // Restore from URL first, then localStorage
    const urlState = getStateFromUrl();
    if (urlState) {
      return {
        ...init,
        chapterIndex: (urlState.chapter || 1) - 1, // Convert 1-based to 0-based
        verseIndex: (urlState.verse || 1) - 1,
        reciterId: urlState.reciter || '',
        translationId: urlState.translation || '',
        audioTranslationId: urlState.audioTranslation || '',
      };
    }

    // Try localStorage with the default key (at init time we don't have config yet)
    const saved = readFromStorage(DEFAULT_STORAGE_KEY);
    if (saved) {
      return {
        ...init,
        chapterIndex: saved.chapterIndex,
        verseIndex: saved.verseIndex,
        reciterId: saved.reciterId,
        translationId: saved.translationId,
        audioTranslationId: saved.audioTranslationId,
      };
    }

    return init;
  });

  // Re-read localStorage when storageKey changes (config loaded with a different key)
  useEffect(() => {
    if (effectiveStorageKey !== DEFAULT_STORAGE_KEY) {
      const saved = readFromStorage(effectiveStorageKey);
      if (saved) {
        dispatch({
          type: ActionTypes.RESTORE_STATE,
          payload: {
            chapterIndex: saved.chapterIndex,
            verseIndex: saved.verseIndex,
            reciterId: saved.reciterId,
            translationId: saved.translationId,
            audioTranslationId: saved.audioTranslationId,
          },
        });
      }
    }
  }, [effectiveStorageKey]);

  // Persist state to localStorage on changes using vanilla JS format
  useEffect(() => {
    writeToStorage(effectiveStorageKey, state);
  }, [effectiveStorageKey, state.chapterIndex, state.verseIndex, state.reciterId, state.translationId, state.audioTranslationId]);

  // Manage body class for mode0
  useEffect(() => {
    document.body.classList.toggle('_de', state.mode0);
  }, [state.mode0]);

  // Manage body.idle class
  useEffect(() => {
    document.body.classList.toggle('idle', state.isIdle);
  }, [state.isIdle]);

  return (
    <PlayerContext.Provider value={{ state, dispatch, ActionTypes }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

export { ActionTypes };
export default PlayerContext;
