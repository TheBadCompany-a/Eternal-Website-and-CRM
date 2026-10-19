// Loads GA4 and Microsoft Clarity on demand — only ever called after the
// visitor accepts cookies via CookieConsent, never at app startup.
const GA_MEASUREMENT_ID = 'G-EGVH64YZQB';
const CLARITY_PROJECT_ID = 'yi0tx7geyl';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    clarity: { (...args: unknown[]): void; q?: unknown[] };
  }
}

let loaded = false;

export function loadAnalytics(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;

  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(gtagScript);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);

  (function (c: Window, l: Document, a: 'clarity', r: 'script', i: string) {
    c[a] = c[a] || function (...args: unknown[]) { (c[a].q = c[a].q || []).push(args); };
    const t = l.createElement(r);
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);
}

/** Fires a GA4 pageview for a client-side route change (initial load is
 * already covered by the `gtag('config', ...)` call in loadAnalytics). */
export function trackPageview(path: string): void {
  if (!loaded || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', { page_path: path });
}
