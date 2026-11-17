// Lokaler Vorschau-Server, verhält sich wie GitHub Pages (/impressum -> impressum.html).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, dirname, sep } from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 4173;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2", ".avif": "image/avif", ".webp": "image/webp",
  ".jpg": "image/jpeg", ".png": "image/png",
};

async function finde(pfad) {
  const kandidaten = [pfad, `${pfad}.html`, join(pfad, "index.html")];
  for (const k of kandidaten) {
    try { if ((await stat(k)).isFile()) return k; } catch { /* nächster Kandidat */ }
  }
  return null;
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const pfad = normalize(join(root, decodeURIComponent(url.pathname)));
    const imProjekt = pfad === root || pfad.startsWith(root + sep);
    const versteckt = pfad.slice(root.length).split(sep).some((teil) => teil.startsWith("."));
    if (!imProjekt || versteckt) { res.writeHead(403).end(); return; }
    const datei = await finde(pfad);
    if (!datei) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404"); return; }
    // Wie GitHub Pages: Text-Assets gzip-komprimiert ausliefern
    const typ = TYPES[extname(datei)] || "application/octet-stream";
    let body = await readFile(datei);
    const kopf = { "Content-Type": typ, "Cache-Control": "no-cache" };
    if (/text|javascript|json|svg|xml/.test(typ) && /gzip/.test(req.headers["accept-encoding"] || "")) {
      body = gzipSync(body);
      kopf["Content-Encoding"] = "gzip";
    }
    res.writeHead(200, kopf);
    res.end(body);
  } catch (err) {
    console.error(err);
    res.writeHead(500).end("Serverfehler");
  }
}).listen(PORT, () => console.log(`Vorschau: http://localhost:${PORT}`));
