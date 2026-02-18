// =========================================================================
// TIMING CONSTANTS (must match original exactly)
// =========================================================================
export const TIMINGS = {
  SOFT_FADE_DURATION: 800,       // Audio fade-out (ms) - "Spotify Philosophy"
  SMOOTH_ENTRY_DURATION: 250,    // Audio fade-in (ms) - prevent digital pops
  LOADER_TIMEOUT: 8000,          // Universal loader max wait (ms)
  LOADER_TRANSITION: 2200,       // Loader exit animation (ms)
  LOADER_QUERY_DELAY: 2000,      // Extra delay when URL has query params (ms)
  PAGE_TRANSITION: 1200,         // Black overlay fade (ms)
  PREVIEW_DEBOUNCE: 600,         // Card focus preview delay (ms)
  SEEK_COOLDOWN: 250,            // Smart seek debounce (ms)
  CINEMA_IDLE: 5000,             // Cinema mode idle timeout (ms)
  DASHBOARD_IDLE: 4000,          // Dashboard idle timeout (ms)
  CINEMA_FAILSAFE: 5000,         // Auto-blur after inactivity in cinema (ms)
  SLIDE_TRANSITION_LOCK: 1200,   // Slideshow transition lock (ms)
  LOOP_PROTECTION: 15000,        // Auth loop protection cooldown (ms)
  ACTIVATION_REDIRECT_DELAY: 300,// Delay before redirect after activation (ms)
  AUTH_MODAL_CLOSE: 300,         // Auth modal fade out (ms)
  AUDIO_RETRY_TIMEOUT: 700,      // Audio play retry fallback (ms)
  OFFLINE_STATUS_DEBOUNCE: 300,  // Offline status update debounce (ms)
};

// =========================================================================
// STORAGE KEYS
// =========================================================================
export const STORAGE_KEYS = {
  PLAYER_STATE: 'streambasesecured_ca6State_1',
  ARABIC_PREF: 'streambasesecured_ca6_arabic_pref',
  USER_ANALYTICS: 'streambasesecured_ca6_user_analytics',
  HIBERNATE: 'tuwa_session_hibernate',
  HAS_LOADED: 'has_loaded_before',
  LOOP_PROTECTION: 'tuwa_activation_attempt',
  SAVED_H1: 'saved_h1_data',
  DISABLE_MEDIA_CONTROLS: 'disableMediaControls',
};

// =========================================================================
// COOKIE NAMES
// =========================================================================
export const COOKIES = {
  PREMIUM: 'TUWA_PREMIUM',
  TV_ENV: 'TV_ENV',
  AUTH_GOOGLE: 'AUTH_GOOGLE',
};

// =========================================================================
// API ENDPOINTS
// =========================================================================
export const API = {
  CONFIG: '/api/config',
  MEDIA_TOKEN: '/api/media-token',
  LOGIN: '/login',
  LOGIN_GOOGLE: '/login-google',
  SEARCH: '/search',
};

// =========================================================================
// SUPABASE CONFIG
// =========================================================================
export const SUPABASE_URL = 'https://csuyapzneytubzdrdegl.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXlhcHpuZXl0dWJ6ZHJkZWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzM1MzMsImV4cCI6MjA4NTMwOTUzM30.m5lhtxB-9Wutmt1E-3mlO8R0KlgE8YNXaPP1_UJF2k0';

// =========================================================================
// ANALYTICS
// =========================================================================
export const GA_TRACKING_ID = 'G-PDWXFDCQRH';

// =========================================================================
// KEYBOARD LAYOUT (for on-screen search keyboard)
// =========================================================================
export const KEYBOARD_KEYS = [
  'Q','W','E','R','T','Y','U','I','O','P',
  'A','S','D','F','G','H','J','K','L',
  'Z','X','C','V','B','N','M',
  'SPACE','DEL','CLEAR'
];

// =========================================================================
// TRANSLATION AUDIO CONFIG
// =========================================================================
export const TRANSLATION_AUDIO = {
  en: {
    name: 'English (Sahih International)',
    reciter: 'Ibrahim Walk',
    basePath: '/media/audio/',
  },
  id: {
    name: 'Indonesian',
    basePath: '/media/audio/',
  },
  es: {
    name: 'Spanish',
    basePath: '/media/audio/',
  },
};

// =========================================================================
// COUNTRY TO CURRENCY MAP (for landing page)
// =========================================================================
export const COUNTRY_TO_CURRENCY = {"AF":"AFN","AL":"ALL","DZ":"DZD","AS":"USD","AD":"EUR","AO":"AOA","AI":"XCD","AQ":"USD","AG":"XCD","AR":"ARS","AM":"AMD","AW":"AWG","AU":"AUD","AT":"EUR","AZ":"AZN","BS":"BSD","BH":"BHD","BD":"BDT","BB":"BBD","BY":"BYN","BE":"EUR","BZ":"BZD","BJ":"XOF","BM":"BMD","BT":"BTN","BO":"BOB","BQ":"USD","BA":"BAM","BW":"BWP","BV":"NOK","BR":"BRL","IO":"USD","BN":"BND","BG":"BGN","BF":"XOF","BI":"BIF","CV":"CVE","KH":"KHR","CM":"XAF","CA":"CAD","KY":"KYD","CF":"XAF","TD":"XAF","CL":"CLP","CN":"CNY","CX":"AUD","CC":"AUD","CO":"COP","KM":"KMF","CD":"CDF","CG":"XAF","CK":"NZD","CR":"CRC","HR":"EUR","CU":"CUP","CW":"ANG","CY":"EUR","CZ":"CZK","CI":"XOF","DK":"DKK","DJ":"DJF","DM":"XCD","DO":"DOP","EC":"USD","EG":"EGP","SV":"USD","GQ":"XAF","ER":"ERN","EE":"EUR","SZ":"SZL","ET":"ETB","FK":"FKP","FO":"DKK","FJ":"FJD","FI":"EUR","FR":"EUR","GF":"EUR","PF":"XPF","TF":"EUR","GA":"XAF","GM":"GMD","GE":"GEL","DE":"EUR","GH":"GHS","GI":"GIP","GR":"EUR","GL":"DKK","GD":"XCD","GP":"EUR","GU":"USD","GT":"GTQ","GG":"GBP","GN":"GNF","GW":"XOF","GY":"GYD","HT":"HTG","HM":"AUD","VA":"EUR","HN":"HNL","HK":"HKD","HU":"HUF","IS":"ISK","IN":"INR","ID":"IDR","IR":"IRR","IQ":"IQD","IE":"EUR","IM":"GBP","IL":"ILS","IT":"EUR","JM":"JMD","JP":"JPY","JE":"GBP","JO":"JOD","KZ":"KZT","KE":"KES","KI":"AUD","KP":"KPW","KR":"KRW","KW":"KWD","KG":"KGS","LA":"LAK","LV":"EUR","LB":"LBP","LS":"LSL","LR":"LRD","LY":"LYD","LI":"CHF","LT":"EUR","LU":"EUR","MO":"MOP","MG":"MGA","MW":"MWK","MY":"MYR","MV":"MVR","ML":"XOF","MT":"EUR","MH":"USD","MQ":"EUR","MR":"MRU","MU":"MUR","YT":"EUR","MX":"MXN","FM":"USD","MD":"MDL","MC":"EUR","MN":"MNT","ME":"EUR","MS":"XCD","MA":"MAD","MZ":"MZN","MM":"MMK","NA":"NAD","NR":"AUD","NP":"NPR","NL":"EUR","NC":"XPF","NZ":"NZD","NI":"NIO","NE":"XOF","NG":"NGN","NU":"NZD","NF":"AUD","MK":"MKD","MP":"USD","NO":"NOK","OM":"OMR","PK":"PKR","PW":"USD","PS":"ILS","PA":"PAB","PG":"PGK","PY":"PYG","PE":"PEN","PH":"PHP","PN":"NZD","PL":"PLN","PT":"EUR","PR":"USD","QA":"QAR","RE":"EUR","RO":"RON","RU":"RUB","RW":"RWF","BL":"EUR","SH":"SHP","KN":"XCD","LC":"XCD","MF":"EUR","PM":"EUR","VC":"XCD","WS":"WST","SM":"EUR","ST":"STN","SA":"SAR","SN":"XOF","RS":"RSD","SC":"SCR","SL":"SLE","SG":"SGD","SX":"ANG","SK":"EUR","SI":"EUR","SB":"SBD","SO":"SOS","ZA":"ZAR","GS":"GBP","SS":"SSP","ES":"EUR","LK":"LKR","SD":"SDG","SR":"SRD","SJ":"NOK","SE":"SEK","CH":"CHF","SY":"SYP","TW":"TWD","TJ":"TJS","TZ":"TZS","TH":"THB","TL":"USD","TG":"XOF","TK":"NZD","TO":"TOP","TT":"TTD","TN":"TND","TR":"TRY","TM":"TMT","TC":"USD","TV":"AUD","UG":"UGX","UA":"UAH","AE":"AED","GB":"GBP","US":"USD","UM":"USD","UY":"UYU","UZ":"UZS","VU":"VUV","VE":"VES","VN":"VND","VG":"USD","VI":"USD","WF":"XPF","EH":"MAD","YE":"YER","ZM":"ZMW","ZW":"ZWG"};
