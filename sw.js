/* =========================================================
   Cyberpenguins Service Worker (PWA Offline Support)
   Permite instalar la aplicación y jugar sin conexión a internet.
   ========================================================= */

const CACHE_NAME = 'cyberpenguins-v97';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './css/styles.css',
  './assets/textures/via-lactea.jpg',
  './assets/textures/tierra-4k.jpg',
  './assets/textures/luna-4k.jpg',
  './assets/textures/marte-2k.jpg',
  './assets/textures/eros.jpg',
  './assets/textures/jupiter-4k.jpg',
  './assets/models/ares-vallis-terrain.glb',
  './assets/models/cyberpenguin.glb',
  './assets/models/sojourner.glb',
  './assets/models/nave-pinguino.glb',
  './assets/models/phobos.glb',
  './assets/models/deimos.glb',
  './assets/models/mars-samples.glb',
  './js/vendor/three/three.module.min.js',
  './js/vendor/three/loaders/GLTFLoader.js',
  './js/vendor/three/loaders/KTX2Loader.js',
  './js/vendor/three/utils/WorkerPool.js',
  './js/vendor/three/libs/meshopt_decoder.module.js',
  './js/vendor/three/libs/ktx-parse.module.js',
  './js/vendor/three/libs/zstddec.module.js',
  './js/vendor/three/libs/basis/basis_transcoder.js',
  './js/vendor/three/libs/basis/basis_transcoder.wasm',
  './js/vendor/three/utils/BufferGeometryUtils.js',
  './js/vendor/three/controls/OrbitControls.js',
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
  './js/elementos/realismo.js',
  './js/elementos/terreno-3d.js',
  './js/tts.js',
  './js/fx.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
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
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network First para HTML, JS y CSS para asegurar que los despliegues en Vercel se reflejen al instante
  const isCodeAsset = event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname === '/';

  if (isCodeAsset) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true }).then((res) => res || caches.match('./index.html', { ignoreSearch: true })))
    );
    return;
  }

  // Cache First para recursos estáticos pesados
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
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
        .catch(() => caches.match('./index.html', { ignoreSearch: true }));
    })
  );
});
