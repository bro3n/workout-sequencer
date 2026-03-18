const CACHE_VERSION = "__BUILD_ID__";
const CACHE_NAME = `workout-sequencer-${CACHE_VERSION}`;

// Installation : met en cache le shell de l'app
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/", "/manifest.webmanifest"]),
    ),
  );
  // Ne pas appeler skipWaiting() ici — on laisse le client décider de la mise à jour
});

// Activation : supprime les anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  return self.clients.claim();
});

// Fetch : NetworkFirst pour la navigation, StaleWhileRevalidate pour les assets
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (event.request.mode === "navigate") {
    // Navigation (HTML) : toujours réseau en premier, cache en fallback
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match("/"))),
    );
  } else {
    // Assets JS/CSS/images : cache immédiat + mise à jour en arrière-plan
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          const networkFetch = fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
          return cached || networkFetch;
        }),
      ),
    );
  }
});

// Message SKIP_WAITING : déclenche l'activation immédiate du nouveau SW
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
