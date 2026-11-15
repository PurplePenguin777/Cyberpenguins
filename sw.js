/* =========================================================
   Cyberpenguins Service Worker (PWA Offline Support)
   Permite instalar la aplicación y jugar sin conexión a internet.
   ========================================================= */

const CACHE_NAME = 'cyberpenguins-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './css/styles.css',
  './js/data.js',
  './js/elementos/pinguino.js',
  './js/elementos/nave-pinguino.js',
  './js/elementos/surveyor-3.js',
  './js/elementos/apollo-11-eagle.js',
  './js/elementos/viking-1.js',
  './js/elementos/sojourner.js',
  './js/elementos/pioneer-10.js',
  './js/elementos/near-shoemaker.js',
  './js/elementos/tierra.js',
  './js/elementos/luna.js',
  './js/elementos/marte.js',
  './js/elementos/asteroide-eros.js',
  './js/elementos/espacio-profundo.js',
  './js/elementos/superficies.js',
  './js/elementos/cuerpos.js',
  './js/models.js',
  './js/tts.js',
  './js/fx.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('SW cache pre-fetch warning:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Solo interceptar peticiones locales o http/https
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
