// sw.js
const CACHE_NAME = 'muTimer-ver-1.4.02';
const NETWORK_TIMEOUT = 800;
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
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedPromise = cache.match(event.request);
        const networkPromise = fetch(event.request);

        // Создаем таймаут для сети
        const networkTimeout = new Promise((resolve) => {
            setTimeout(resolve, NETWORK_TIMEOUT);
        });

        try {
            // Параллельно проверяем кэш и сеть
            const response = await Promise.race([
                networkPromise,
                networkTimeout.then(() => 'timeout')
            ]);

            if (response !== 'timeout') {
                // Обновляем кэш если получили ответ
                cache.put(event.request, response.clone());
                return response;
            }
        } catch (error) {
            // Игнорируем ошибки сети
        }

        // Если сеть не ответила за timeout или ошибка - возвращаем кэш
        return (await cachedPromise) || cache.match('/timer/index.html');
    })());
});

// Отправляем сообщение в основной поток с версией кеша
self.addEventListener('message', event => {
    if (event.data === 'CACHE_NAME') {
        event.ports[0].postMessage(CACHE_NAME);
    }
});