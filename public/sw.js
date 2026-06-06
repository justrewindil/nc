// Minimal service worker — enables "install to home screen" (PWA).
// Network-first for navigations so users always get fresh content; the SW
// mainly exists to satisfy installability, not to cache the dynamic app.
const CACHE = 'jfz-v1';

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  // pass-through; let the network handle everything (no stale streaming embeds)
});
