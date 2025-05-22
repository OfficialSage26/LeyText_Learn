// Basic Service Worker

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // We are not caching anything on install for this basic setup
  // self.skipWaiting(); // Ensures the new service worker activates immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Cleans up old caches if any (not strictly necessary for this basic setup)
  // event.waitUntil(self.clients.claim()); // Ensures the SW takes control of open clients
});

self.addEventListener('fetch', (event) => {
  // This service worker doesn't intercept fetch requests in this basic version.
  // It's primarily here to enable PWA installability.
  // console.log('Service Worker: Fetching ', event.request.url);
  // For a basic "network falling back to cache" or "cache first" strategy,
  // you would add logic here. For now, we let the browser handle fetches normally.
  return;
});
