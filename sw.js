// Service Worker: macht die App offline nutzbar.
// Strategie "Netzwerk zuerst": Online gibt es immer die neueste Version (z. B. neue Fragen),
// offline wird die zuletzt geladene Version aus dem Zwischenspeicher genommen.
// Neue Dateien in js/ oder css/ hier eintragen – die GitHub-Prüfung meldet vergessene Dateien.
const CACHE = "test-trainer-v3";
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "css/app.css",
  "js/auswahl.js",
  "js/config.js",
  "js/fragen.js",
  "js/fragenansicht.js",
  "js/gen/figur.js",
  "js/gen/figuren.js",
  "js/gen/gemeinsam.js",
  "js/gen/index.js",
  "js/gen/konzentration.js",
  "js/gen/rechnen.js",
  "js/gen/reihen.js",
  "js/lernen.js",
  "js/lernkarten.js",
  "js/main.js",
  "js/persoenlichkeit.js",
  "js/pruefung.js",
  "js/pruefung-extras.js",
  "js/speicher.js",
  "js/start.js",
  "js/statistik.js",
  "js/uebung.js",
  "js/ui.js",
  "js/util.js",
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    // "no-cache": immer beim Server nachfragen, ob es eine neue Version gibt. Sonst kann der
    // Browser nach einem Update alte und neue Dateien mischen, und die App startet nicht.
    fetch(event.request.url, { cache: "no-cache", credentials: "same-origin" })
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
