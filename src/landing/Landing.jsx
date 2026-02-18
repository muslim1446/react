import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import UniversalLoader from '../components/UniversalLoader';
import BrandLogo from '../components/BrandLogo';
import ContentProtection from '../components/ContentProtection';
import Slideshow from '../components/Slideshow';
import AuthModal from '../components/AuthModal';
import LegalModal from '../components/LegalModal';
import { SUPABASE_URL, SUPABASE_KEY, STORAGE_KEYS, TIMINGS, COOKIES } from '../utils/constants';
import { login } from '../utils/api';

// =========================================================================
// LANDING PAGE
// Entry point for unauthenticated users
// Features: 3-slide slideshow, Supabase OAuth, TV mode, loop protection
// =========================================================================

function LandingInner() {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [loadingText, setLoadingText] = useState('Confirming availability');
  const [errorText, setErrorText] = useState('');
  const [isTvMode, setIsTvMode] = useState(false);
  const [ctaText, setCtaText] = useState('Start watching now');
  const supabaseRef = useRef(null);

  // Initialize Supabase
  useEffect(() => {
    try {
      if (window.supabase) {
        const { createClient } = window.supabase;
        supabaseRef.current = createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabaseClient = supabaseRef.current;
      }
    } catch (e) {
      console.error('Supabase Init Error', e);
    }
  }, []);

  // TV mode detection
  useEffect(() => {
    const search = window.location.search;
    if (search.includes('tv')) {
      setIsTvMode(true);
      document.cookie = `${COOKIES.TV_ENV}=true; path=/; max-age=31536000`;
    }
  }, []);

  // Cookie-based auth fallback (Supabase redirect error recovery)
  useEffect(() => {
    const cookies = document.cookie;
    const hasAuthGoogle = cookies.includes(`${COOKIES.AUTH_GOOGLE}=true`);
    const hasPremium = cookies.includes(`${COOKIES.PREMIUM}=true`);

    if (hasAuthGoogle && !hasPremium) {
      document.cookie = `${COOKIES.PREMIUM}=true; path=/; max-age=31536000`;
      window.location.reload();
    }
  }, []);

  // Check session and initialize
  useEffect(() => {
    async function init() {
      if (!supabaseRef.current) {
        initializeGuest();
        return;
      }

      try {
        const { data } = await supabaseRef.current.auth.getSession();
        if (data && data.session) {
          initializePostLogin();
        } else {
          initializeGuest();
        }
      } catch (e) {
        initializeGuest();
      }
    }

    // Small delay to let Supabase SDK load
    const timer = setTimeout(init, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-open auth modal if ?mb in URL
  useEffect(() => {
    const search = window.location.search;
    const path = window.location.pathname;
    if (search.includes('mb') || path.includes('/mb')) {
      setAuthModalVisible(true);
    }
  }, []);

  function initializeGuest() {
    setCtaText('Start listening now');
  }

  function initializePostLogin() {
    const lastAttempt = sessionStorage.getItem(STORAGE_KEYS.LOOP_PROTECTION);
    const now = Date.now();

    if (lastAttempt && (now - parseInt(lastAttempt) < TIMINGS.LOOP_PROTECTION)) {
      console.warn('Loop detected. Stopping auto-sequence.');
      setLoadingVisible(false);
      setCtaText('Click to Enter');
      return;
    }

    performActivation();
  }

  async function performActivation() {
    setLoadingVisible(true);
    setLoadingText('Authenticating...');

    try {
      await login();
      setLoadingText('');
      sessionStorage.setItem(STORAGE_KEYS.LOOP_PROTECTION, String(Date.now()));
      setTimeout(() => {
        window.location.href = '/?t=' + new Date().getTime();
      }, TIMINGS.ACTIVATION_REDIRECT_DELAY);
    } catch (e) {
      console.error('Activation Error', e);
      setLoadingText('Connection failed. Please retry.');
      setTimeout(() => {
        setLoadingVisible(false);
      }, 2000);
    }
  }

  const handleCtaClick = useCallback(() => {
    const lastAttempt = sessionStorage.getItem(STORAGE_KEYS.LOOP_PROTECTION);
    const now = Date.now();
    if (lastAttempt && (now - parseInt(lastAttempt) < TIMINGS.LOOP_PROTECTION)) {
      performActivation();
      return;
    }
    setAuthModalVisible(true);
  }, []);

  const handleSocialLogin = useCallback(async (provider) => {
    if (!supabaseRef.current) return;
    try {
      // Set AUTH_GOOGLE cookie before redirect (for fallback recovery)
      if (provider === 'google') {
        document.cookie = `${COOKIES.AUTH_GOOGLE}=true; path=/; max-age=31536000`;
      }
      const { error } = await supabaseRef.current.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.href },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setErrorText('Login failed. Please try again.');
    }
  }, []);

  const closeAuth = useCallback(() => {
    setAuthModalVisible(false);
  }, []);

  // Android native login callback
  useEffect(() => {
    window.onNativeLoginSuccess = async function(idToken) {
      if (!supabaseRef.current) {
        alert('System error: Supabase not initialized.');
        return;
      }

      try {
        const { data, error } = await supabaseRef.current.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (error) throw error;

        const response = await fetch('/login', { method: 'POST' });
        if (response.ok) {
          window.location.reload();
        } else {
          throw new Error('Failed to set premium cookie.');
        }
      } catch (err) {
        console.error('Real Native Login Error:', err);
      }
    };
  }, []);

  // Focus start button on TV mode
  useEffect(() => {
    if (window.location.search === '?tv') {
      const btn = document.getElementById('_ao');
      if (btn) btn.focus();
    }
  }, []);

  return (
    <>
      <UniversalLoader />
      <ContentProtection />

      {/* HUD Overlay */}
      <div id="_ci">
        <div style={{ padding: '20px', display: 'flex' }}>
          <div className="_p" style={{ position: 'absolute', top: '20px', left: '20px' }}>
            <img
              src="https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/ui/logo.png"
              alt="Tuwa Logo"
            />
            <span>Tuwa</span>
          </div>
          <BrandLogo logoSrc="https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/ui/logo.png" />
        </div>
        <div className="_bm">
          <div className="_6">
            <button id="_ao" className="_c2" onClick={handleCtaClick}>
              <span>{ctaText}</span>
              <svg className="_ep" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10 16 4-4-4-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Slideshow */}
      <Slideshow />

      {/* Loading Overlay */}
      <div className={`_9${loadingVisible ? ' active' : ''}`}>
        <div className="_bi" />
        <div className="_7" id="_bk">{loadingText}</div>
      </div>

      {/* Legal Modal */}
      <LegalModal />

      {/* Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={closeAuth}
        onSocialLogin={handleSocialLogin}
        isTvMode={isTvMode}
        errorText={errorText}
      />
    </>
  );
}

export default function Landing() {
  return (
    <AuthProvider>
      <LandingInner />
    </AuthProvider>
  );
}
