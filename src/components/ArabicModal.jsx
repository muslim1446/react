import React, { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

// =========================================================================
// ARABIC MODAL — "Can you read Arabic?" dialog
// ID: #_cy, overlay with ._aj card
// Switches between CSS stylesheets based on answer
// Currently in DEVELOPER_MODE=0 (bypass mode — forces non-Arabic CSS)
// Preference stored in localStorage
// =========================================================================

const DEVELOPER_MODE = 0; // 0 = bypass (skip modal, force non-Arabic)

export default function ArabicModal() {
  const [visible, setVisible] = useState(false);
  const [hasDecided, setHasDecided] = useState(false);

  // Check for saved preference on mount
  useEffect(() => {
    const pref = localStorage.getItem(STORAGE_KEYS.ARABIC_PREF);
    if (pref) {
      setHasDecided(true);
      applyCssPreference(pref);
    } else if (DEVELOPER_MODE === 0) {
      // Bypass mode: force non-Arabic CSS, don't show modal
      setHasDecided(true);
      applyCssPreference('no');
    }
  }, []);

  function applyCssPreference(pref) {
    // In the React version, the CSS import is handled by the entry point
    // The Arabic pref switches between a1b2... (non-Arabic) and b1c2... (Arabic)
    const cssLink = document.getElementById('_es');
    if (cssLink) {
      if (pref === 'yes') {
        cssLink.href = cssLink.href.replace('a1b2c3d4e5fxa', 'b1c2d3e4f5axa');
      } else {
        cssLink.href = cssLink.href.replace('b1c2d3e4f5axa', 'a1b2c3d4e5fxa');
      }
    }
  }

  // Intercept player launch to show modal (if not decided yet)
  useEffect(() => {
    if (DEVELOPER_MODE === 0 || hasDecided) return;

    const originalLaunch = window.launchPlayer;
    window.launchPlayer = (...args) => {
      if (!hasDecided) {
        setVisible(true);
        // Store args to call after decision
        window._pendingLaunchArgs = args;
      } else {
        originalLaunch?.(...args);
      }
    };

    return () => {
      if (originalLaunch) window.launchPlayer = originalLaunch;
    };
  }, [hasDecided]);

  const handleChoice = useCallback((canRead) => {
    const pref = canRead ? 'yes' : 'no';
    localStorage.setItem(STORAGE_KEYS.ARABIC_PREF, pref);
    applyCssPreference(pref);
    setHasDecided(true);
    setVisible(false);

    // Resume pending launch
    if (window._pendingLaunchArgs && window.launchPlayer) {
      window.launchPlayer(...window._pendingLaunchArgs);
      delete window._pendingLaunchArgs;
    }
  }, []);

  if (DEVELOPER_MODE === 0 || !visible) return null;

  return (
    <div id="_cy" style={{ display: 'block' }}>
      <div className="_aj">
        <h2>Do you know how to read Arabic?</h2>
        <h3>This helps us personalize your experience</h3>
        <div className="_ay">
          <button id="_bw" className="_d9" onClick={() => handleChoice(false)}>
            No
          </button>
          <button id="_b3" className="_d9" onClick={() => handleChoice(true)}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
