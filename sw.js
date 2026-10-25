// Service worker: guarda o site e o que você já viu (mapas, fotos) para funcionar sem internet.
const CACHE = "roteiro2027-v1";
const SHELL = ["./", "index.html", "css/style.css", "js/data.js", "js/review.js", "js/app.js", "icon.svg", "manifest.webmanifest",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // APIs ao vivo (câmbio, Google, Overpass, Wikipédia, geocodificação): sempre rede
  if (/frankfurter|er-api|googleapis|overpass|wikipedia\.org\/w\/api|nominatim|gstatic\.com\/maps/.test(url.href)) return;
  const isTile = /tile|arcgisonline|memomaps|wikimedia|fonts\.(googleapis|gstatic)/.test(url.hostname + url.pathname);
  if (url.origin === location.origin) {
    // site: rede primeiro (pega atualizações), cache se offline
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
  } else if (isTile || url.hostname === "unpkg.com") {
    // mapas, fotos e bibliotecas: cache primeiro
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok || r.type === "opaque") { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return r; })));
  }
});
