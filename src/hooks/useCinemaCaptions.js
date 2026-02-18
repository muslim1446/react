import { useRef, useCallback } from 'react';

// =========================================================================
// USE CINEMA CAPTIONS
// getSmartChunks: splits text into ~25-word segments at punctuation
// playCinemaCaptions: schedules timed display synchronized to audio duration
// =========================================================================

const TARGET_WORDS = 25;

export default function useCinemaCaptions() {
  const timersRef = useRef([]);

  // -----------------------------------------------------------------------
  // GET SMART CHUNKS — Split text at punctuation boundaries (~25 words each)
  // -----------------------------------------------------------------------
  const getSmartChunks = useCallback((text) => {
    if (!text) return [''];

    const words = text.split(/\s+/);
    if (words.length <= TARGET_WORDS) return [text];

    const chunks = [];
    let current = [];

    for (let i = 0; i < words.length; i++) {
      current.push(words[i]);

      // Check if we've hit a punctuation boundary near target length
      const word = words[i];
      const atPunctuation = /[.!?,;:\u060C\u061B\u061F]$/.test(word); // includes Arabic punctuation
      const nearTarget = current.length >= TARGET_WORDS - 5;
      const pastTarget = current.length >= TARGET_WORDS + 5;

      if ((nearTarget && atPunctuation) || pastTarget) {
        chunks.push(current.join(' '));
        current = [];
      }
    }

    // Remainder
    if (current.length > 0) {
      // If remainder is very short, append to last chunk
      if (current.length < 5 && chunks.length > 0) {
        chunks[chunks.length - 1] += ' ' + current.join(' ');
      } else {
        chunks.push(current.join(' '));
      }
    }

    return chunks.length > 0 ? chunks : [text];
  }, []);

  // -----------------------------------------------------------------------
  // CLEAR — Cancel all pending caption timers
  // -----------------------------------------------------------------------
  const clearCaptions = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // -----------------------------------------------------------------------
  // PLAY CINEMA CAPTIONS — Schedule timed chunk display
  // Each chunk gets time proportional to its word count
  // -----------------------------------------------------------------------
  const playCinemaCaptions = useCallback((text, totalDuration, onChunkChange) => {
    // Clear existing timers
    clearCaptions();

    const chunks = getSmartChunks(text);
    if (chunks.length <= 1 || !totalDuration || totalDuration <= 0) {
      onChunkChange?.(text, 0);
      return chunks;
    }

    // Calculate word counts for proportional timing
    const wordCounts = chunks.map(c => c.split(/\s+/).length);
    const totalWords = wordCounts.reduce((a, b) => a + b, 0);

    let elapsed = 0;
    chunks.forEach((chunk, i) => {
      const chunkDuration = (wordCounts[i] / totalWords) * totalDuration * 1000;
      const timer = setTimeout(() => {
        onChunkChange?.(chunk, i);
      }, elapsed);
      timersRef.current.push(timer);
      elapsed += chunkDuration;
    });

    return chunks;
  }, [getSmartChunks, clearCaptions]);

  return {
    getSmartChunks,
    playCinemaCaptions,
    clearCaptions,
  };
}
