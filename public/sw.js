// Service Worker — Pila de Ra'
// Estrategia:
//  - navegaciones (HTML): network-first  → el shell nunca queda viejo tras un deploy
//  - /api/*: network-first con fallback a caché
//  - estáticos: cache-first
const CACHE = "piladerap-v2";
const STATIC = ["/logo.png", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo GET del mismo origen; ignorar extensiones
  if (request.method !== "GET" || url.protocol === "chrome-extension:") return;
  if (url.origin !== self.location.origin) return;

  // Navegaciones (HTML): network-first con fallback a caché/inicio
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match("/")))
    );
    return;
  }

  // API: network-first con fallback a caché
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Estáticos: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()));
        return res;
      });
    })
  );
});
