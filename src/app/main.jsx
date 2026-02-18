import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// CSS imports — all 7 stylesheets (same obfuscated class names)
import '../styles/a1b2c3d4e5fxa.css';
import '../styles/b1c2d3e4f5axa.css';
import '../styles/cinema-nav.css';
import '../styles/c1d2e3f4a5bxa.css';
import '../styles/d1e2f3a4b5cxa.css';
import '../styles/e1f2a3b4c5dxa.css';
import '../styles/f1a2b3c4d5exa.css';

// GitHub redirect check
import { checkGithubRedirect } from '../utils/githubRedirect';
checkGithubRedirect();

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('SW registration failed:', err);
    });
  });
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
