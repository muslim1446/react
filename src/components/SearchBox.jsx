import React, { useState, useRef, useCallback } from 'react';

// =========================================================================
// SEARCH BOX — Floating glassmorphism pill
// ID: #_j, contains input #_cz and trigger button #_bx
// AI thinking state: ._df class adds conic-gradient rotating border
// pointer-events: none on container, auto on children
// =========================================================================

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = useCallback(() => {
    if (query.trim().length > 0 && window.openSearch) {
      window.openSearch(query.trim());
    }
  }, [query]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div id="_j">
      <div className={`_ak${aiThinking ? ' _df' : ''}`}>
        <div className="_2" />
        <input
          type="text"
          id="_cz"
          placeholder="Search anything"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
        />
      </div>
      <button id="_bx" className="_b0" onClick={handleSubmit}>
        <span className="_et" data-key="Enter">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
        </span>
      </button>
    </div>
  );
}
