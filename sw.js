// sw.js
const CACHE_NAME = 'muTimer-ver-1.3.16';
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

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

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
    // Для всех запросов сначала пробуем сеть, потом кэш
    event.respondWith((async () => {
        try {
            // Пытаемся получить свежую версию из сети
            const networkResponse = await fetch(event.request);
            
            // Обновляем кэш для будущих офлайн-запросов
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            
            return networkResponse;
        } catch (error) {
            // Если сеть недоступна - используем кэш
            const cachedResponse = await caches.match(event.request);
            return cachedResponse || caches.match('/timer/index.html');
        }
    })());
});