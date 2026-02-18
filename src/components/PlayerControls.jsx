import React, { useMemo, useCallback } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';
import { useConfig } from '../contexts/ConfigContext';
import CustomSelect from './CustomSelect';

// =========================================================================
// PLAYER CONTROLS — Fixed bottom bar with 5 custom select dropdowns
// ID: #_b2, gradient background (linear-gradient to top from #121212)
// Dropdowns: Chapter, Verse, Reciter, Translation, Audio Translation
// =========================================================================

// Subtitle/translation icon SVG
const SubtitleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M7 15h4M15 15h2M7 11h2M13 11h4" />
  </svg>
);

export default function PlayerControls() {
  const { state, dispatch } = usePlayer();
  const { chapters, reciters, translations } = useConfig();

  // Build chapter items
  const chapterItems = useMemo(() => {
    return chapters.map((ch, i) => ({
      value: String(i),
      label: `${i + 1}. ${ch.english_name || ''}`,
    }));
  }, [chapters]);

  // Build verse items for current chapter
  const verseItems = useMemo(() => {
    const count = state.currentVerseCount || 7;
    return Array.from({ length: count }, (_, i) => ({
      value: String(i),
      label: `Verse ${i + 1}`,
    }));
  }, [state.currentVerseCount]);

  // Build reciter items
  const reciterItems = useMemo(() => {
    return Object.entries(reciters).map(([id, config]) => ({
      value: id,
      label: config.name || id,
    }));
  }, [reciters]);

  // Build translation items
  const translationItems = useMemo(() => {
    return Object.entries(translations).map(([id, config]) => ({
      value: id,
      label: config.name || id,
    }));
  }, [translations]);

  // Build audio translation items (currently limited)
  const audioTranslationItems = useMemo(() => {
    return [
      { value: '', label: 'None' },
      { value: 'en', label: 'English' },
      { value: 'id', label: 'Indonesian' },
      { value: 'es', label: 'Spanish' },
    ];
  }, []);

  const handleChapterChange = useCallback((val) => {
    dispatch({ type: ActionTypes.SET_CHAPTER, payload: parseInt(val, 10) });
  }, [dispatch]);

  const handleVerseChange = useCallback((val) => {
    dispatch({ type: ActionTypes.SET_VERSE, payload: parseInt(val, 10) });
  }, [dispatch]);

  const handleReciterChange = useCallback((val) => {
    dispatch({ type: ActionTypes.SET_RECITER, payload: val });
  }, [dispatch]);

  const handleTranslationChange = useCallback((val) => {
    dispatch({ type: ActionTypes.SET_TRANSLATION, payload: val });
  }, [dispatch]);

  const handleAudioTranslationChange = useCallback((val) => {
    dispatch({ type: ActionTypes.SET_AUDIO_TRANSLATION, payload: val });
  }, [dispatch]);

  return (
    <div id="_b2">
      <CustomSelect
        wrapperId="chapterSelectWrapper"
        items={chapterItems}
        value={String(state.chapterIndex)}
        onChange={handleChapterChange}
        placeholder="Chapter"
      />
      <CustomSelect
        wrapperId="verseSelectWrapper"
        items={verseItems}
        value={String(state.verseIndex)}
        onChange={handleVerseChange}
        placeholder="Verse"
      />
      <CustomSelect
        wrapperId="reciterSelectWrapper"
        items={reciterItems}
        value={state.reciterId}
        onChange={handleReciterChange}
        placeholder="Reciter"
      />
      <CustomSelect
        wrapperId="translationSelectWrapper"
        items={translationItems}
        value={state.translationId}
        onChange={handleTranslationChange}
        placeholder="Translation"
        icon={<SubtitleIcon />}
      />
      <CustomSelect
        wrapperId="translationAudioSelectWrapper"
        items={audioTranslationItems}
        value={state.audioTranslationId}
        onChange={handleAudioTranslationChange}
        placeholder="Audio Translation"
      />
    </div>
  );
}
