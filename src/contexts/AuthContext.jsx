import React, { createContext, useContext, useState, useEffect } from 'react';
import { COOKIES } from '../utils/constants';

const AuthContext = createContext(null);

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name, value, maxAge = 31536000) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}

export function AuthProvider({ children }) {
  const [isPremium, setIsPremium] = useState(() => {
    return getCookie(COOKIES.PREMIUM) === 'true';
  });
  const [isTvMode, setIsTvMode] = useState(() => {
    return getCookie(COOKIES.TV_ENV) === 'true' ||
           window.location.search.includes('tv');
  });

  // Set TV_ENV cookie if ?tv is in URL
  useEffect(() => {
    if (window.location.href.includes('?tv')) {
      setCookie(COOKIES.TV_ENV, 'true');
      setIsTvMode(true);
    }
  }, []);

  // Check for AUTH_GOOGLE fallback (Supabase redirect error recovery)
  useEffect(() => {
    const hasAuthGoogle = getCookie(COOKIES.AUTH_GOOGLE) === 'true';
    const hasPremium = getCookie(COOKIES.PREMIUM) === 'true';

    if (hasAuthGoogle && !hasPremium) {
      // Loop protection: only attempt once per session
      const loopKey = 'tuwa_auth_recovery_attempt';
      if (sessionStorage.getItem(loopKey)) return;
      sessionStorage.setItem(loopKey, Date.now().toString());

      setCookie(COOKIES.PREMIUM, 'true');
      setIsPremium(true);
      window.location.reload();
    }
  }, []);

  const setAuthGoogleCookie = () => {
    setCookie(COOKIES.AUTH_GOOGLE, 'true');
  };

  return (
    <AuthContext.Provider value={{
      isPremium,
      setIsPremium,
      isTvMode,
      setIsTvMode,
      setAuthGoogleCookie,
      getCookie,
      setCookie,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
