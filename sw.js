// Service Worker Code
const CACHE_NAME = 'quran-app-cache-v4'; // Version updated for new structure
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/favicon.png',
  '/manifest.json'
  // We don't cache API requests, so content like surahs and duas will require internet
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching essential app shell files');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // We only handle navigation requests for offline support
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
  } else {
    // For other requests (API calls, etc.), just fetch from the network
    event.respondWith(
      caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
