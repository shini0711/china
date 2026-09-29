// Cloudflare Worker: Häkchen-Sync für den Reiseguide
// Bindings: KV-Namespace als "TRIP", Secret "SYNC_KEY"
const ALLOW = ["https://shini0711.github.io"];
export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOW.includes(origin) ? origin : ALLOW[0],
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(req.url);
    if (url.pathname !== "/state") return new Response("not found", { status: 404, headers: cors });
    if (!env.SYNC_KEY || url.searchParams.get("k") !== env.SYNC_KEY) return new Response("forbidden", { status: 403, headers: cors });
    const cur = (await env.TRIP.get("state", { type: "json" })) || { items: {} };
    if (req.method === "POST") {
      let body = null;
      try { body = JSON.parse(await req.text()); } catch (e) {}
      if (!body || typeof body.items !== "object") return new Response("bad request", { status: 400, headers: cors });
      let changed = false;
      for (const [id, it] of Object.entries(body.items)) {
        if (!/^[a-z0-9_-]{1,40}$/i.test(id) || !it || typeof it.t !== "number") continue;
        const old = cur.items[id];
        if (!old || it.t > old.t) { cur.items[id] = { v: it.v ? 1 : 0, t: Math.min(it.t, Date.now() + 60000) }; changed = true; }
      }
      if (changed) await env.TRIP.put("state", JSON.stringify(cur));
    }
    return new Response(JSON.stringify(cur), { headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  }
};
