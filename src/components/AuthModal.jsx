import React, { useEffect, useRef } from 'react';
import { TIMINGS } from '../utils/constants';

// =========================================================================
// AUTH MODAL — Full-screen authentication overlay
// Supports Google, Spotify, Discord OAuth (web) and Android native (TV)
// Uses exact same obfuscated class names for CSS compatibility
// =========================================================================

// SVG brand icons
const GoogleIcon = () => (
  <svg viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const SpotifyIcon = () => (
  <svg viewBox="0 0 512 512">
    <path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm113.8 354.6c-4.5 7.4-13.8 9.9-21.3 5.4-58.3-33.5-131.7-41.1-218.3-22.5-8.5 2-17.1-3.3-19.1-11.8-2-8.5 3.3-17.1 11.8-19.1 94.6-20.3 175.7-11.4 241.6 26.3 7.4 4.5 9.9 13.8 5.4 21.3zm29.8-66.2c-5.6 9.2-17.3 12.1-26.4 6.5-66.9-41.1-168.9-53-248-29-10.2 3.1-21.2-2.5-24.2-12.7-3.1-10.2 2.5-21.2 12.7-24.2 90.6-27.4 204.6-13.7 282.1 33.9 9.1 5.6 12 17.3 6.5 26.4zM408.6 186c-80.4-47.8-213.1-52.2-290-28.8-12.4 3.8-25.5-3.1-29.3-15.5-3.8-12.4 3.1-25.5 15.5-29.3 89-27.1 235.4-21.9 328.6 33.5 11.2 6.6 14.9 21.2 8.3 32.4-6.6 11.2-21.2 14.9-32.4 8.3z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 512 365">
    <path fill="currentColor" d="M378.186 365.028s-15.794-18.865-28.956-35.099c57.473-16.232 79.41-51.77 79.41-51.77-17.989 11.846-35.099 20.182-50.454 25.885-21.938 9.213-42.997 14.917-63.617 18.866-42.118 7.898-80.726 5.703-113.631-.438-25.008-4.827-46.506-11.407-64.494-18.867-10.091-3.947-21.059-8.774-32.027-14.917-1.316-.877-2.633-1.316-3.948-2.193-.877-.438-1.316-.878-1.755-.878-7.898-4.388-12.285-7.458-12.285-7.458s21.06 34.659 76.779 51.331c-13.163 16.673-29.395 35.977-29.395 35.977C36.854 362.395 0 299.218 0 299.218 0 159.263 63.177 45.633 63.177 45.633 126.354-1.311 186.022.005 186.022.005l4.388 5.264C111.439 27.645 75.461 62.305 75.461 62.305s9.653-5.265 25.886-12.285c46.945-20.621 84.236-25.885 99.592-27.64 2.633-.439 4.827-.878 7.458-.878 26.763-3.51 57.036-4.387 88.624-.878 41.68 4.826 86.43 17.111 132.058 41.68 0 0-34.66-32.906-109.244-55.281l6.143-7.019s60.105-1.317 122.844 45.628c0 0 63.178 113.631 63.178 253.585 0-.438-36.854 62.739-133.813 65.81l-.001.001zm-43.874-203.133c-25.006 0-44.75 21.498-44.75 48.262 0 26.763 20.182 48.26 44.75 48.26 25.008 0 44.752-21.497 44.752-48.26 0-26.764-20.182-48.262-44.752-48.262zm-160.135 0c-25.008 0-44.751 21.498-44.751 48.262 0 26.763 20.182 48.26 44.751 48.26 25.007 0 44.75-21.497 44.75-48.26.439-26.763-19.742-48.262-44.75-48.262z"/>
  </svg>
);

export default function AuthModal({ visible, onClose, onSocialLogin, isTvMode, errorText }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (visible && modalRef.current) {
      modalRef.current.style.display = 'flex';
      // Trigger reflow for transition
      requestAnimationFrame(() => {
        modalRef.current?.classList.add('visible');
      });
    } else if (!visible && modalRef.current) {
      modalRef.current.classList.remove('visible');
      setTimeout(() => {
        if (modalRef.current) modalRef.current.style.display = 'none';
      }, TIMINGS.AUTH_MODAL_CLOSE);
    }
  }, [visible]);

  const handleTvLogin = () => {
    if (window.Android && window.Android.startGoogleLogin) {
      window.Android.startGoogleLogin();
      // Fallback: dev bypass after 200ms
      setTimeout(() => {
        window.location.href = 'https://Quran-lite.pages.dev?dev_key_bypass_fortest_unauthorized_use_may_cause_legal_consequences=02mz01010199SosMaOIOUJINksnwiI0390jk0ihwcf02ew8uf083yfuhoh3f93';
      }, 200);
    }
  };

  return (
    <div
      id="_ah"
      ref={modalRef}
      style={{ background: 'rgba(0,0,0,0.8)', padding: '40px', textAlign: 'center' }}
    >
      <div className="_ed">
        <h2 className="_ba">on its way.</h2>

        {errorText && (
          <div id="_du" style={{ display: 'block', color: '#ff4444', fontSize: '0.9rem', marginTop: '10px' }}>
            {errorText}
          </div>
        )}

        {/* Web OAuth buttons */}
        <div
          id="_bo"
          style={{
            display: isTvMode ? 'none' : 'flex',
            width: '100%',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <button
            onClick={() => onSocialLogin('google')}
            id="_b6"
            className="_dl _dm"
            style={{ fontSize: '2rem', fontWeight: 700 }}
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            onClick={() => onSocialLogin('spotify')}
            className="_dl _dm"
            style={{ fontSize: '2rem', fontWeight: 700 }}
          >
            <SpotifyIcon />
            Continue with Spotify
          </button>
          <button
            onClick={() => onSocialLogin('discord')}
            className="_dl _dm"
            style={{ fontSize: '2rem', fontWeight: 700 }}
          >
            <DiscordIcon />
            Continue with Discord
          </button>
        </div>

        {/* TV login (Android native) */}
        <div
          id="_b9"
          style={{ display: isTvMode ? 'block' : 'none', width: '100%' }}
        >
          <button
            onClick={handleTvLogin}
            className="_dl _dm"
            style={{ fontSize: '2rem', fontWeight: 700 }}
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        {/* Cancel link */}
        <div
          style={{ display: 'none', marginTop: '20px', fontSize: '0.8rem', color: '#888', cursor: 'pointer' }}
          onClick={onClose}
        >
          Cancel
        </div>
      </div>
    </div>
  );
}
