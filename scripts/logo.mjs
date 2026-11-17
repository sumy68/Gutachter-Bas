// Leitet aus dem ORIGINAL-Logo von Gutachter BAS (assets/img/kfz-gutachter-ingolstadt-ismayil-bas-logo.png,
// gold auf schwarzem Grund – wird NICHT verändert) alle Logo-Varianten ab:
//  - Header-Logo: Rand weggetrimmt, ca. 4 % Luft, gegen Schwarz freigestellt (transparent, ohne Säume) → PNG + WebP
//  - Favicon (48 px) und Apple-Touch-Icon (180 px) aus dem Kreis-Emblem
//  - Open-Graph-Bild 1200×630 (Logo + Ort)
import opentype from "opentype.js";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMG = join(root, "assets/img");
const QUELLE = join(IMG, "kfz-gutachter-ingolstadt-ismayil-bas-logo.png");
const ZIEL = "kfz-gutachter-ingolstadt-ismayil-bas-logo-header";
const LUFT = 0.04;            // Luft rundherum (Anteil der Motivgröße)
const HEADER_HOEHE = 168;     // Pixelhöhe der Datei (≥ 3× der Anzeigehöhe von max. 56 px → scharf auf Retina)
const ALPHA_MIN = 0.02;       // Pixel darunter gelten als Hintergrund
const GRUND = "#0B0B0C";

// Freistellen gegen Schwarz: Deckkraft aus der Helligkeit relativ zum hellsten Gold,
// Farbe zurückgerechnet (C = a·Gold → Gold = C / a). Dadurch keine dunklen Ränder an den Kanten.
async function freistellen(datei) {
  const { data, info } = await sharp(datei).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const maxima = new Uint8Array(n);
  for (let i = 0; i < n; i++) maxima[i] = Math.max(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
  const hell = [...maxima].filter((m) => m > 40).sort((a, b) => a - b);
  const referenz = hell.length ? hell[Math.floor(hell.length * 0.95)] : 255; // robustes „volles Gold"
  const rgba = Buffer.alloc(n * 4);
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let i = 0; i < n; i++) {
    const a = Math.min(1, maxima[i] / referenz);
    if (a < ALPHA_MIN) continue;
    const o = i * 4;
    for (let k = 0; k < 3; k++) rgba[o + k] = Math.min(255, Math.round(data[i * 3 + k] / a));
    rgba[o + 3] = Math.round(a * 255);
    const x = i % info.width, y = (i - x) / info.width;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  if (x1 < 0) throw new Error("Kein Logo-Motiv gefunden");
  return { rgba, info, box: { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 } };
}

const z = (n) => (Math.round(n * 100) / 100).toString();
const pfadDaten = (befehle) => befehle.map((c) =>
  c.type === "M" ? `M${z(c.x)} ${z(c.y)}` : c.type === "L" ? `L${z(c.x)} ${z(c.y)}`
  : c.type === "Q" ? `Q${z(c.x1)} ${z(c.y1)} ${z(c.x)} ${z(c.y)}`
  : c.type === "C" ? `C${z(c.x1)} ${z(c.y1)} ${z(c.x2)} ${z(c.y2)} ${z(c.x)} ${z(c.y)}` : "Z").join("");

async function run() {
  const { rgba, info, box } = await freistellen(QUELLE);
  const motiv = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).extract(box).png().toBuffer();
  const px = Math.round(box.width * LUFT), py = Math.round(box.height * LUFT);
  const mitLuft = await sharp(motiv)
    .extend({ top: py, bottom: py, left: px, right: px, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

  // 1) Header-Logo (PNG + WebP, transparent)
  await sharp(mitLuft).resize({ height: HEADER_HOEHE, kernel: "lanczos3" }).png({ compressionLevel: 9 }).toFile(join(IMG, `${ZIEL}.png`));
  await sharp(mitLuft).resize({ height: HEADER_HOEHE, kernel: "lanczos3" }).webp({ quality: 92, alphaQuality: 100 }).toFile(join(IMG, `${ZIEL}.webp`));
  const m = await sharp(join(IMG, `${ZIEL}.png`)).metadata();
  console.log(`Header-Logo: ${m.width}×${m.height} px (Motiv ${box.width}×${box.height} im Original ${info.width}×${info.height})`);

  // 2) Favicon + Apple-Touch-Icon: Kreis-Emblem (linker, quadratischer Teil des Motivs) auf dunklem Grund
  const seite = Math.min(box.height, box.width);
  const emblem = await sharp(motiv).extract({ left: 0, top: 0, width: seite, height: box.height }).png().toBuffer();
  const icon = async (groesse, rand, datei) => {
    const innen = Math.round(groesse * (1 - 2 * rand));
    const e = await sharp(emblem).resize(innen, innen, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const r = Math.round(groesse * 0.18);
    const grund = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${groesse}" height="${groesse}"><rect width="${groesse}" height="${groesse}" rx="${r}" fill="${GRUND}"/></svg>`);
    await sharp(grund).composite([{ input: e, gravity: "center" }]).png({ compressionLevel: 9 }).toFile(join(root, datei));
  };
  await icon(48, 0.1, "favicon.png");
  await icon(180, 0.14, "apple-touch-icon.png");

  // 3) Open-Graph-Bild 1200×630: Original-Logo + Ort
  const ogLogo = await sharp(mitLuft).resize({ height: 300 }).png().toBuffer();
  const ogBreite = (await sharp(ogLogo).metadata()).width;
  const buf = await readFile(join(root, "node_modules/@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-500-normal.woff"));
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const zeile = "Kfz-Gutachter in Ingolstadt", zg = 40, zw = font.getAdvanceWidth(zeile, zg);
  const zeilePfade = font.getPaths(zeile, (1200 - zw) / 2, 520, zg).filter((p) => p.commands.length)
    .map((p) => `<path d="${pfadDaten(p.commands)}" fill="#A8A39A"/>`).join("");
  const og = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${GRUND}"/>${zeilePfade}<rect x="0" y="628" width="1200" height="2" fill="rgba(201,165,92,.55)"/></svg>`);
  await sharp(og).composite([{ input: ogLogo, top: 130, left: Math.round((1200 - ogBreite) / 2) }])
    .jpeg({ quality: 88, mozjpeg: true }).toFile(join(IMG, "gutachter-bas-kfz-gutachter-ingolstadt.jpg"));

  console.log("Favicon, Apple-Touch-Icon und OG-Bild aus dem Original-Logo erzeugt");
}

run().catch((err) => {
  console.error(`Logo-Ableitung fehlgeschlagen: ${err.message}`);
  process.exit(1);
});
