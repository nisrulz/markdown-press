// Serves the app shell from the cache. The cache holds same-origin assets only,
// so the draft still never leaves the tab and no third-party request exists.
const CACHE = 'markdown-press-v2'
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/logo-192.png', './icons/logo-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Stale-while-revalidate: the cache answers at once, a fresh copy updates the
  // cache for the next launch. Offline, the cache is the only source.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request)
      const network = fetch(request)
        .then((response) => {
          cache.put(request, response.clone())
          return response
        })
        .catch(() => cached)
      return cached ?? network
    }),
  )
})
