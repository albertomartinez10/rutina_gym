// ponytail: service worker a mano; vite-plugin-pwa es más de lo que necesita esta app.
const CACHE = "gymbro-v1";

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c)))),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  // La página siempre de red si la hay (para no servir un index viejo),
  // y de cache cuando no hay cobertura.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => (caches.open(CACHE).then((c) => c.put(req, res.clone())), res))
        .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Los assets llevan hash en el nombre: si están en cache, valen.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        }),
    ),
  );
});
