const CACHE_NAME = 'park-platform-v-2026-07-15-01';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 安装：缓存核心资源
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 激活：删除旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 拦截 fetch：HTML/导航请求走网络优先，其它资源优先缓存
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).then(networkRes => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(req, networkRes.clone());
          return networkRes;
        });
      }).catch(() => caches.match(req))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
