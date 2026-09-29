// Netz zuerst: immer die aktuelle Version laden, gespeicherte Kopie nur ohne Netz
const CACHE = "trip-guide-v2";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache: "reload"})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
    .then(() => self.clients.matchAll({type: "window"})).then(cs => cs.forEach(c => c.postMessage("updated"))));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isPage = req.mode === "navigate" || (url.origin === location.origin && (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")));
  if (isPage) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      // "no-cache": beim Server nachfragen (ETag), unverändert = kleine 304-Antwort
      const net = fetch(req.url.split("#")[0], {cache: "no-cache"}).then(res => { if (res.ok) c.put("./index.html", res.clone()); return res; });
      try {
        const res = await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej("slow"), 6000))]);
        if (res && res.ok) return res;
      } catch (x) {}
      const cached = await c.match("./index.html");
      if (cached) {
        // langsames Netz: gespeicherte Kopie zeigen, Aktualisierung läuft weiter und meldet sich
        e.waitUntil(net.then(async r => { if (r && r.ok) (await self.clients.matchAll({type: "window"})).forEach(cl => cl.postMessage("updated")); }).catch(() => {}));
        return cached;
      }
      return net.catch(() => new Response("Offline und noch nicht gespeichert.", {status: 503, headers: {"Content-Type": "text/plain; charset=utf-8"}}));
    })());
    return;
  }
  // Schriften: gespeicherte Kopie ist ok; eigene Nebendateien: Netz zuerst
  if (url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com")) {
    e.respondWith(caches.open(CACHE).then(async c => { const hit = await c.match(req); if (hit) return hit; const res = await fetch(req); if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }));
  } else if (url.origin === location.origin) {
    e.respondWith(fetch(req, {cache: "no-cache"}).then(async res => { if (res.ok) (await caches.open(CACHE)).put(req, res.clone()); return res; }).catch(async () => (await caches.match(req)) || Response.error()));
  }
});
