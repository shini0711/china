// Offline-Cache: Seite sofort aus dem Cache, im Hintergrund aktualisieren
const CACHE = "trip-guide-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isPage = req.mode === "navigate" || (url.origin === location.origin && url.pathname.endsWith("/index.html"));
  if (isPage) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const cached = await c.match("./index.html");
      const net = fetch(req, {cache: "no-store"}).then(async res => {
        if (res.ok) {
          const fresh = res.clone(), txt = await fresh.clone().text();
          const old = cached ? await cached.clone().text() : null;
          await c.put("./index.html", fresh);
          if (old && old !== txt) (await self.clients.matchAll()).forEach(cl => cl.postMessage("updated"));
        }
        return res;
      }).catch(() => null);
      if (cached) { e.waitUntil(net); return cached; }
      return (await net) || new Response("Offline", {status: 503});
    }));
    return;
  }
  // Schriften und eigene Dateien: Cache zuerst, sonst Netz und merken
  if (url.origin === location.origin || url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com")) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      try { const res = await fetch(req); if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }
      catch (x) { return hit || Response.error(); }
    }));
  }
});
