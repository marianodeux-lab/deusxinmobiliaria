// Service Worker para DeusX Inmobiliarias ERP (PWA)
const CACHE_NAME = "deusx-pwa-v2";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/Recursos/icons/icon-192x192.png",
  "/Recursos/icons/icon-512x512.png",
  "/Recursos/icons/icon-maskable-192x192.png",
  "/Recursos/icons/icon-maskable-512x512.png",
  "/Recursos/icons/apple-touch-icon.png",
  "/Recursos/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch((err) => {
        console.warn("PWA: Error precacheando recursos:", err);
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Ignorar peticiones que no sean GET
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Ignorar llamadas de backend (Supabase, API interna, etc.)
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase.co")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cachear dinámicamente imágenes e íconos estáticos para modo offline
        if (
          networkResponse.status === 200 &&
          (url.pathname.startsWith("/Recursos") || url.pathname.endsWith(".png") || url.pathname.endsWith(".svg"))
        ) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          return (await caches.match("/")) || new Response("DeusX offline", { status: 503 });
        }
        return new Response(null, { status: 404 });
      })
  );
});
