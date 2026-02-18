import React from 'react';
import { createRoot } from 'react-dom/client';
import Landing from './Landing';

// CSS imports — landing page uses 2 stylesheets
import '../styles/a1b2c3d4e5fxa.css';
import '../styles/f1a2b3c4d5exa.css';

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('SW registration failed:', err);
    });
  });
}

const root = createRoot(document.getElementById('root'));
root.render(<Landing />);
