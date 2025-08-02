// Service Worker Code for Quran App by Faraz
const CACHE_NAME = 'quran-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.json',
  '/android-launchericon-192-192.png',
  '/android-launchericon-512-512.png'
];

// Install event: open the cache and add essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching essential app shell files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serve cached content when offline, otherwise fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response from cache
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      }
    )
  );
});```
**नोट:** मैंने तुम्हारे `android-launchericon` वाली PNG फाइलों को भी कैश में जोड़ दिया है, जैसा तुमने बताया था।

---

### **स्टेप 3: `index.html` का अंतिम कोड**

अब, अपनी `index.html` फाइल खोलो, उसका **सारा पुराना कोड हटा दो**, और यह **नीचे दिया गया पूरा और अंतिम कोड** उसमें पेस्ट कर दो। मैंने इसमें सर्विस वर्कर को रजिस्टर करने वाला कोड **बिल्कुल सही जगह** पर जोड़ दिया है।

```html
<!DOCTYPE html>
<html lang="ur">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>القرآن الكريم - Faraz AI</title>
    <link rel="manifest" href="manifest.json">
    <link rel="icon" href="favicon.png" type="image/png">
    
    <!-- Fonts and Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Noto+Nastaliq+Urdu:wght@700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />

    <style>
        /* ... (तुम्हारा सारा CSS यहाँ है, कोई बदलाव नहीं) ... */
    </style>
</head>
<body>

    <!-- ... (तुम्हारा सारा HTML यहाँ है, कोई बदलाव नहीं) ... -->

    <script>
        // ... (तुम्हारा सारा पुराना जावास्क्रिप्ट यहाँ है, कोई बदलाव नहीं) ...

        // ============== नया: Service Worker को रजिस्टर करें ==============
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(err => {
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }
    </script>
</body>
</html>