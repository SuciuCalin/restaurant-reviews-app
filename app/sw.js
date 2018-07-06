const staticCacheName = 'restaurants-cache-2';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(staticCacheName).then( (cache) => {
    return cache.addAll([
      '/',
      '/index.html',
      '/restaurant.html',
      '/manifest.json',
      '/build/main.min.css',
      '/data/restaurants.json',
      '/img/1.jpg',
      '/img/2.jpg',
      '/img/3.jpg',
      '/img/4.jpg',
      '/img/5.jpg',
      '/img/6.jpg',
      '/img/7.jpg',
      '/img/8.jpg',
      '/img/9.jpg',
      '/img/10.jpg',
      'img/no-image.jpg',
      '/js/dbhelper.js',
      '/js/main.js',
      '/js/restaurant_info.js',
      'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css'
    ]).catch((error) => console.log("open caches: " ,error));
  }));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
  caches.open(staticCacheName).then(function(cache) {
    return cache.match(event.request).then(function (response) {
      return response || fetch(event.request).then(function(response) {
        cache.put(event.request, response.clone());
        return response;
      });
    });
  })
);
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith('restaurants-') &&
          cacheName !== staticCacheName;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }));
});
