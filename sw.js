const CACHE_NAME = 'quran-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/sw.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(response => {
        // অডিও/API রেসপন্স ক্যাশে রাখা
        if (event.request.url.includes('api.alquran.cloud') || event.request.url.includes('audio')) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        }
        return response;
      });
    })
  );
});

// মেসেজ লিসেনার: পুরো সূরা ডাউনলোড
self.addEventListener('message', event => {
  if (event.data.type === 'cacheAudio') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return Promise.all(
          event.data.urls.map(url => fetch(url).then(res => cache.put(url, res)))
        );
      })
    );
  }
});