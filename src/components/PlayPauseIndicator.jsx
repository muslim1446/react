import React, { useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

const PlayPauseIndicator = forwardRef(function PlayPauseIndicator(props, ref) {
  const playRef = useRef(null);
  const pauseRef = useRef(null);
  const forwardRef_ = useRef(null);
  const backwardRef = useRef(null);

  const showFeedback = useCallback((type) => {
    const map = {
      play: playRef,
      pause: pauseRef,
      forward: forwardRef_,
      backward: backwardRef,
    };
    const el = map[type]?.current;
    if (!el) return;
    el.classList.add('animate');
    setTimeout(() => {
      el.classList.remove('animate');
    }, 600);
  }, []);

  useImperativeHandle(ref, () => ({ showFeedback }), [showFeedback]);

  // Also expose globally for vanilla JS interop
  React.useEffect(() => {
    window.showPlayPauseFeedback = showFeedback;
    return () => { delete window.showPlayPauseFeedback; };
  }, [showFeedback]);

  return (
    <div id="_3" className="_3">
      <div className="_b1" id="icon-play" ref={playRef}>
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      </div>
      <div className="_b1" id="icon-pause" ref={pauseRef}>
        <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
      </div>
      <div className="_b1" id="_co" ref={forwardRef_}>
        <svg viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" /></svg>
      </div>
      <div className="_b1" id="icon-backward" ref={backwardRef}>
        <svg viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" /></svg>
      </div>
    </div>
  );
});

export default PlayPauseIndicator;
