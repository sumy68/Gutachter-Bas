# Gutachter BAS – Website

Statische Onepage für GitHub Pages (Domain siehe `CNAME`). Ausgeliefert werden die
erzeugten Dateien im Stammverzeichnis (`index.html`, `impressum.html`, `datenschutz.html`,
`sitemap.xml`, `robots.txt`, `llms.txt`) sowie `/assets`.

## Inhalte ändern
Alle Kontaktdaten, Öffnungszeiten, Leistungen, Bewertungen und FAQ stehen **nur** in
`src/site.config.mjs`. Danach neu bauen:

```bash
npm install
npm run build      # HTML, Sitemap, robots.txt, llms.txt neu erzeugen
npm run serve      # Vorschau auf http://localhost:4173 (wie GitHub Pages, mit gzip)
```

Weitere Skripte: `npm run images` (AVIF/WebP/JPG aus `src/images`), `npm run vendor`
(GSAP, Lenis, three.js r149 und Schrift aus `node_modules` nach `/assets`).

## Aufbau
- `src/templates/` – Seiten-Templates (Layout, Startseite, Rechtliches, JSON-LD)
- `assets/css/site.css` – Stylesheet (wird beim Build inline eingebunden, nicht veröffentlicht)
- `_config.yml` – schließt Quellen, Skripte und Rohbilder von GitHub Pages aus
- `assets/js/main.js` + `assets/js/ui/` – Navigation, Motion, Slider, Lightbox
- `assets/js/partikel*.js` – Partikel-Hintergrund (three.js, nach dem Laden nachgeladen)
