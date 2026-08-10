// Service worker d'EcoTrips Women.
//
// Regle de conduite: ne JAMAIS servir une page en cache tant que le reseau
// repond. Le contenu du site vient du Studio et se met a jour en une minute;
// un cache trop zele ferait croire que les modifications ne partent pas.
//
//   - pages HTML  : reseau d'abord, cache seulement si le reseau echoue
//   - /_next/static : cache d'abord (ces fichiers ont un nom unique par version,
//                     ils ne changent jamais sans changer de nom)
//   - /api/       : jamais de cache
const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Menage des caches laisses par une version precedente.
      const noms = await caches.keys();
      await Promise.all(
        noms.filter((nom) => nom !== PAGES && nom !== ASSETS).map((nom) => caches.delete(nom))
      );
      await self.clients.claim();
    })()
  );
});

function estFichierFige(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/assets/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // On ne touche ni aux autres domaines, ni aux envois de formulaire.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/studio")) return;

  if (estFichierFige(url)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const enCache = await cache.match(request);
        if (enCache) return enCache;

        const reponse = await fetch(request);
        if (reponse.ok) cache.put(request, reponse.clone());
        return reponse;
      })
    );
    return;
  }

  // Pages: reseau d'abord. Le cache ne sert qu'en cas de coupure, pour que
  // l'application installee affiche quelque chose plutot qu'une erreur.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const reponse = await fetch(request);
          if (reponse.ok) {
            const cache = await caches.open(PAGES);
            cache.put(request, reponse.clone());
          }
          return reponse;
        } catch {
          const enCache = await caches.match(request);
          return enCache || caches.match("/");
        }
      })()
    );
  }
});
