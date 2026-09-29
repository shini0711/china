# Taiwan & China – Travel Guide, Oktober 2026

Live: https://shini0711.github.io/china/ (in Safari öffnen → Teilen → „Zum Home-Bildschirm“)

Statische Seite (`index.html`, alles eingebettet) plus `sw.js` (offline), `manifest.webmanifest` und Icons.

## Häkchen-Sync einrichten (Cloudflare Worker, einmalig)

1. **Worker anlegen:** Cloudflare Dashboard → Workers & Pages → Create → Worker, Name z. B. `trip-sync` → Deploy.
   Dann „Edit code“, den Inhalt von `cloudflare/worker.js` einfügen → Deploy.
2. **KV-Speicher:** Storage & Databases → KV → Create namespace, Name `TRIP`.
3. **Binding:** Worker `trip-sync` → Settings → Bindings → Add → KV namespace, Variable name `TRIP`, Namespace `TRIP` wählen.
4. **Geheimer Code:** In der App unter Hilfe → „Code erzeugen“ tippen und den Code kopieren.
   Worker → Settings → Variables and Secrets → Add → Type **Secret**, Name `SYNC_KEY`, Wert = Code → Deploy.
5. **App verbinden:** Hilfe → Worker-Adresse (`https://trip-sync.<account>.workers.dev`) und Code eintragen → „Speichern und testen“. Der Punkt wird grün.
6. **Zweites Handy:** „Link fürs zweite Handy“ tippen, per Nachricht schicken und dort einmal öffnen.

Hinweise: Der Code steht nur in den Handys und in Cloudflare, nie im Repo. Änderungen gleichen sich beim Öffnen,
beim Wechsel zwischen Tagen/Tabs und alle 45 Sekunden ab. Wer offline abhakt, wird beim nächsten Netz nachgezogen.
Bei gleichzeitigen Änderungen am selben Punkt gewinnt die spätere.
