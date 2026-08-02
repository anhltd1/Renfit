/**
 * Registers the PWA service worker (see public/service-worker.js).
 * No-ops in dev by default to avoid caching interfering with HMR/local
 * iteration — set VITE_ENABLE_SW=true to test PWA behavior locally.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  const isDev = import.meta.env.DEV;
  const forceEnable = import.meta.env.VITE_ENABLE_SW === 'true';
  if (isDev && !forceEnable) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Best-effort — a failed SW registration should never break the app.
    });
  });
}
