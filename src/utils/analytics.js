import { GA_TRACKING_ID } from './constants';

// =========================================================================
// GOOGLE ANALYTICS 4 INITIALIZATION
// Tracking ID: G-PDWXFDCQRH
// send_page_view: false (manual tracking only)
// =========================================================================
export function initAnalytics() {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_TRACKING_ID, { send_page_view: false });
  }
}

export function trackPageView(pagePath) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', { page_path: pagePath });
  }
}

export function trackEvent(eventName, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}
