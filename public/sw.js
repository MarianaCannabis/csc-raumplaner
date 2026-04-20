// CSC Raumplaner — Service Worker
// Strategy: network-first für HTML (immer frisch); cache-first für Assets
// (statische JS/CSS/Images, ändern selten). Offline-Fallback via Cache.

const CACHE_VERSION = 'csc-v1';
const PRECACHE_ASSETS = [
  '/csc-raumplaner/',
  '/csc-raumplaner/index.html',
  '/csc-raumplaner/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Cross-origin (Supabase / Anthropic / Cloudflare): immer Network — kein
  // Cachen von API-Responses oder Auth-Tokens.
  if (url.origin !== self.location.origin) return;
  // Navigation-Requests (HTML): network-first, fallback cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((r) => {
          const copy = r.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          return r;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/csc-raumplaner/')))
    );
    return;
  }
  // Assets (JS/CSS/Images/HDRI): cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((r) => {
      if (r.ok && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') ||
                   url.pathname.match(/\.(jpg|png|webp|hdr|glb|gltf)$/i))) {
        const copy = r.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
      }
      return r;
    }))
  );
});
