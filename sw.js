// sw.js
const CACHE_NAME = 'music-timer-v12';
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
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(ASSETS);
        await self.skipWaiting();
    })());
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

// Стратегия "Сначала сеть, потом кэш" с оффлайн-резервом
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const networkResponse = await fetch(event.request);
                return networkResponse;
            } catch (error) {
                const cache = await caches.open(CACHE_NAME);
                const cachedResponse = await cache.match(OFFLINE_URL);
                return cachedResponse;
            }
        })());
    } else {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) return cachedResponse;
            try {
                const networkResponse = await fetch(event.request);
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            } catch (error) {
                return new Response('', {status: 503});
            }
        })());
    }
});