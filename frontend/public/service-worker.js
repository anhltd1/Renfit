/**
 * Renfit PWA service worker — minimal, hand-written (no build-time SW
 * generator dependency, so it stays easy to reason about and doesn't need a
 * new toolchain step). Two responsibilities only:
 *
 * 1. Cache the app shell (the SPA's static assets) so the app still opens
 *    (to a "you're offline" state, at minimum) without a network connection
 *    — the baseline PWA installability requirement.
 * 2. Never cache API responses (`/api/*`, `/chat`) — booking availability,
 *    notifications, and chat must always be fresh. This is a
 *    booking/scheduling app; showing stale slot availability offline would
 *    be actively misleading.
 *
 * Cache-busted by bumping CACHE_VERSION on any app-shell-affecting release.
 */

const CACHE_VERSION = 'renfit-shell-v1';
const APP_SHELL = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/chat');
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests — never intercept API calls,
  // cross-origin requests, or non-GET (POST/PATCH) mutations.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }
  if (isApiRequest(url)) {
    return;
  }

  // Network-first for navigations/app-shell assets, falling back to cache
  // when offline — keeps the app up to date whenever a network is
  // available, while still allowing an offline reopen.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/'))),
  );
});
