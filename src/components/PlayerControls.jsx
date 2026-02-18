import React, { useMemo, useCallback } from 'react';
import { usePlayer, ActionTypes } from '../contexts/PlayerContext';
import { useConfig } from '../contexts/ConfigContext';
import { useI18n } from '../contexts/I18nContext';
import CustomSelect from './CustomSelect';

// =========================================================================
// PLAYER CONTROLS — Fixed bottom bar with 5 custom select dropdowns
// ID: #_b2, gradient background (linear-gradient to top from #121212)
// Dropdowns: Chapter, Verse, Reciter, Translation, Audio Translation
// =========================================================================

export default function PlayerControls() {
  const { state, dispatch } = usePlayer();
  const { chapters, reciters, translations, translationAudio } = useConfig();
  const { t } = useI18n();

  // Build chapter items
  const chapterItems = useMemo(() => {
    return chapters.map((c, i) => ({
      value: i,
      text: `${c.chapterNumber}. ${c.english_name} - ${c.title}`,
    }));
  }, [chapters]);

  // Build verse items for current chapter
  const verseItems = useMemo(() => {
    const chapter = chapters[state.chapterIndex];
    if (!chapter) return [];
    const count = chapter.verse_count || state.currentVerseCount || 7;
    return Array.from({ length: count }, (_, i) => ({
      value: i,
      text: `${i + 1}`,
    }));
  }, [chapters, state.chapterIndex, state.currentVerseCount]);

  // Build reciter items
  const reciterItems = useMemo(() => {
    return Object.entries(reciters).map(([k, v]) => ({
      value: k,
      text: v.name,
    }));
  }, [reciters]);

  // Build translation items
  const translationItems = useMemo(() => {
    return Object.entries(translations).map(([k, v]) => ({
      value: k,
      text: v.name,
    }));
  }, [translations]);

  // Build audio translation items
  const transAudioItems = useMemo(() => {
    if (!translationAudio || typeof translationAudio !== 'object') return [];
    return Object.entries(translationAudio).map(([k, v]) => ({
      value: k,
      text: v.name,
    }));
  }, [translationAudio]);

  const handleChapterChange = useCallback((val) => {
    dispatch({ type: ActionTypes.SET_CHAPTER, payload: typeof val === 'string' ? parseInt(val, 10) : val });
  }, [dispatch]);

  const handleVerseChange = useCallback((val) => {
    dispatch({ type: ActionTypes.SET_VERSE, payload: typeof val === 'string' ? parseInt(val, 10) : val });
  }, [dispatch]);

  const handleReciterChange = useCallback((val) => {
    dispatch({ type: ActionTypes.SET_RECITER, payload: val });
  }, [dispatch]);

  const handleTranslationChange = useCallback((val) => {
    dispatch({ type: ActionTypes.SET_TRANSLATION, payload: val });
  }, [dispatch]);

  const handleAudioTransChange = useCallback((val) => {
    dispatch({ type: ActionTypes.SET_AUDIO_TRANSLATION, payload: val });
  }, [dispatch]);

  return (
    <div id="_b2">
      <CustomSelect
        wrapperId="chapterSelectWrapper"
        label={t('player.selectstreamprotected_cb2Button') || 'Select chapter'}
        items={chapterItems}
        value={state.chapterIndex}
        onChange={handleChapterChange}
      />
      <CustomSelect
        wrapperId="verseSelectWrapper"
        label={t('player.streamprotectedcase_cw2') || 'Verse'}
        items={verseItems}
        value={state.verseIndex}
        onChange={handleVerseChange}
      />
      <CustomSelect
        wrapperId="reciterSelectWrapper"
        label={t('player.streamprotectedlicense_artist_cr1') || 'Reciter'}
        items={reciterItems}
        value={state.reciterId}
        onChange={handleReciterChange}
      />
      <CustomSelect
        wrapperId="translationSelectWrapper"
        label=""
        extraClass="_c1"
        items={translationItems}
        value={state.translationId}
        onChange={handleTranslationChange}
      >
        {/* SVG subtitle icon as custom trigger content */}
        <svg fill="#f9f9f9" height="24px" width="24px" viewBox="0 0 24 24">
          <g id="subtitles">
            <path d="M12,24l-4.4-5H0V0h24v19h-7.6L12,24z M2,17h6.4l3.6,4l3.6-4H22V2H2V17z" />
            <path d="M4,13h7v2H4V13z M12,13h7v2h-7V13z M4,10h5v2H4V10z M14,10h6v2h-6V10z M10,10h3v2h-3V10z" />
          </g>
        </svg>
      </CustomSelect>
      <CustomSelect
        wrapperId="translationAudioSelectWrapper"
        label={t('player.audioTrans') || 'Audio Translation'}
        items={transAudioItems}
        value={state.audioTranslationId}
        onChange={handleAudioTransChange}
      />
    </div>
  );
}
