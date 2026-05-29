// Basic PWA Service Worker
// IMPORTANT: The 20260519121714 placeholder below is replaced by deploy_master.ps1
// at build time. Do NOT hardcode a value here — it must remain as the placeholder
// so each deployment gets a unique cache name for proper cache invalidation.
const CACHE_NAME = 'opticonnect-gis-cache-20260519121714';

// Install event - precache only static assets, NEVER the HTML shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Intentionally empty — we do NOT cache '/' (index.html) because:
      // 1. It causes stale HTML to be served during deployments
      // 2. It creates reload loops when MaintenanceOverlay tries to recover
      // 3. The HTML shell is tiny and should always come from the network
      return cache.addAll([]);
    })
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

// Activate event - purge old caches from previous deployments
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Message event - allows the app to programmatically trigger SW updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event - network-first strategy, never serve cached HTML for navigation
self.addEventListener('fetch', (event) => {
  // CRITICAL: Never intercept navigation requests (HTML pages).
  // Let the browser always fetch index.html from the network.
  // This prevents stale maintenance.html or old index.html from being served.
  if (event.request.mode === 'navigate') {
    return; // Let the browser handle it natively — no SW interception
  }

  // For all other requests (JS, CSS, images), use network-first with cache fallback
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      return new Response('Network error occurred. Please check your connection.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain' })
      });
    })
  );
});
