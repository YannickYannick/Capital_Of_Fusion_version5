/**
 * Service worker minimal PWA — cache shell + assets, network-first pour l'API.
 * Généré / maintenu manuellement (alternative Workbox si besoin).
 */
const CACHE_NAME = 'pbvf-pwa-v1';
const PRECACHE = ['/', '/manifest.json', '/pwa-icon-192.png', '/pwa-icon-512.png', '/favicon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API Django / médias distants : réseau d'abord
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('railway.app') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('capitaloffusion.com')
  ) {
    event.respondWith(
      fetch(request)
        .then((res) => res)
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Assets app : cache puis réseau
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((res) => {
          if (res && res.ok && url.origin === self.location.origin) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    }),
  );
});
