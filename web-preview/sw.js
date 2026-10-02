/**
 * Keeps Nudge working with no connection, which is the point of it.
 *
 * Hashed build files (/_expo/static/...) never change behind their name, so
 * they are served from the cache first. Everything else — the page itself —
 * goes to the network first, so a new deploy is picked up immediately and
 * only falls back to the cache when there is no connection.
 */
const CACHE = 'nudge-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const isImmutable = (url) =>
  url.pathname.includes('/_expo/static/') || /\.(js|css|ttf|woff2?|png|jpg|svg|ico|wav)$/.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isImmutable(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() =>
        caches.match(request).then((hit) => hit || caches.match(new URL('./', self.location).pathname))
      )
  );
});
