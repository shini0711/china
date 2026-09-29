# Taiwan & China – Travel Guide, Oktober 2026

Statische Einzelseite (`index.html`), alles eingebettet (Fotos, Karten). Kein Build nötig.

## Einmalig einrichten
1. Diese Dateien in das Repo legen (Wurzelverzeichnis): `index.html`, `.nojekyll`, `README.md`.
2. GitHub → Repo → **Settings → Pages**.
3. Source: **Deploy from a branch**, Branch `main`, Ordner `/ (root)` → Save.
4. Nach ca. 1 Minute erscheint oben die Adresse: `https://<benutzername>.github.io/<repo-name>/`

Hinweis: Bei kostenlosen Konten braucht GitHub Pages ein **öffentliches** Repo. Die Seite ist per `noindex` von Suchmaschinen ausgenommen, aber für jeden mit Link abrufbar.

## Update
Neue `index.html` ins Repo legen, dann:

    git add index.html
    git commit -m "Guide aktualisiert"
    git push

Oder im Browser: Repo → Add file → Upload files → `index.html` überschreiben → Commit. Die Seite ist danach nach ca. 1 Minute aktuell.
