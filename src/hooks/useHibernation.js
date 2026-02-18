import { useEffect } from 'react';

// =========================================================================
// USE HIBERNATION — Session save/restore on offline
// Port of tuwa-hibernate.js
// On offline: serialize state (URL, scroll, inputs, media) → localStorage
// On online: restore from localStorage if same URL, within 24h
// =========================================================================

const STORAGE_KEY = 'tuwa_session_hibernate';
const EXPIRATION_MS = 86400000; // 24 hours

function hibernateSession() {
  console.log('Connection lost. Hibernating session...');

  const state = {
    url: window.location.href,
    timestamp: Date.now(),
    scroll: { x: window.scrollX, y: window.scrollY },
    inputs: {},
    media: {},
  };

  // Snapshot Form Inputs
  document.querySelectorAll('input, textarea, select').forEach((el, index) => {
    if (el.id || el.name) {
      const key = el.id || el.name || `idx_${index}`;
      if (el.type === 'checkbox' || el.type === 'radio') {
        state.inputs[key] = { type: 'check', checked: el.checked };
      } else {
        state.inputs[key] = { type: 'value', value: el.value };
      }
    }
  });

  // Snapshot Media (Video/Audio) Playback Time
  document.querySelectorAll('video, audio').forEach((el, index) => {
    const key = el.id || `media_${index}`;
    state.media[key] = el.currentTime;
  });

  // Secure Save
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  // Force Reload to trigger Service Worker Offline Page
  window.location.reload();
}

function showRestorationToast() {
  const toast = document.createElement('div');
  toast.style.cssText =
    'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:white; padding:8px 16px; border-radius:20px; font-size:12px; font-family:sans-serif; pointer-events:none; z-index:9999; animation: fadeOut 3s forwards;';
  toast.innerText = 'Session Restored';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);

  const style = document.createElement('style');
  style.innerHTML = '@keyframes fadeOut { 0% {opacity:1} 80% {opacity:1} 100% {opacity:0} }';
  document.head.appendChild(style);
}

function wakeSession() {
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) return;

  try {
    const state = JSON.parse(rawData);

    // SECURITY: Only restore if we are on the exact same URL
    if (state.url !== window.location.href) return;

    // Expiration check (discard if older than 24 hours)
    if (Date.now() - state.timestamp > EXPIRATION_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    console.log('Restoring Tuwa Session...');

    // Restore Inputs
    Object.keys(state.inputs).forEach((key) => {
      const data = state.inputs[key];
      const el = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
      if (el) {
        if (data.type === 'check') el.checked = data.checked;
        else el.value = data.value;
      }
    });

    // Restore Media
    Object.keys(state.media).forEach((key) => {
      let el = document.getElementById(key);
      if (!el && key.startsWith('media_')) {
        const idx = parseInt(key.split('_')[1]);
        const allMedia = document.querySelectorAll('video, audio');
        if (allMedia[idx]) el = allMedia[idx];
      }

      if (el) {
        el.currentTime = state.media[key];
      }
    });

    // Restore Scroll (last step to ensure layout is ready)
    setTimeout(() => {
      window.scrollTo({
        top: state.scroll.y,
        left: state.scroll.x,
        behavior: 'auto',
      });

      // Wipe data: security measure so we don't restore old state next time
      localStorage.removeItem(STORAGE_KEY);

      showRestorationToast();
    }, 100);
  } catch (e) {
    console.error('Tuwa Restoration Error', e);
    localStorage.removeItem(STORAGE_KEY);
  }
}

export default function useHibernation() {
  useEffect(() => {
    function handleOffline() {
      if (!navigator.onLine) {
        hibernateSession();
      }
    }

    window.addEventListener('offline', handleOffline);

    // Attempt to wake/restore on mount if online
    if (navigator.onLine) {
      wakeSession();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}
