// sw.js
const CACHE_NAME = 'muTimer-ver-1.3.15';
const OFFLINE_URL = '/timer/index.html';
const ASSETS = [
    '/timer/',
    '/timer/index.html',
    '/timer/icons/apple-touch-icon-120x120.png',
    '/timer/icons/apple-touch-icon-152x152.png',
    '/timer/icons/apple-touch-icon-167x167.png',
    '/timer/icons/apple-touch-icon-180x180.png',
    '/timer/icons/icon-192x192.png',
    '/timer/icons/icon-512x512.png',
    '/timer/icons/favicon.svg'
];

// Установка и кэширование ресурсов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Активация и очистка старого кэша
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => {
            if (key !== CACHE_NAME) return caches.delete(key);
        }));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
  // Для навигационных запросов используем стратегию "Cache First"
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request)
            .catch(() => caches.match('/timer/index.html'));
        })
    );
  } else {
    // Для остальных ресурсов: "Cache, falling back to network"
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => cachedResponse || fetch(event.request))
    );
  }
});