// Leitet Favicon, Apple-Touch-Icon, Logo-PNG (JSON-LD) und Open-Graph-Bild aus dem
// ORIGINAL-Logo von Gutachter BAS ab: Wortmarke „Gutachter BAS" in Orbitron,
// „Gutachter" hell, „BAS" in Gold (Markup der Website vor dem Redesign).
// Die Schrift wird in Pfade umgewandelt – das Ergebnis hängt nicht von installierten Fonts ab.
import opentype from "opentype.js";
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nm = (p) => join(root, "node_modules", p);
const FARBE = { grund: "#0B0B0C", text: "#F3EFE6", gold: "#C9A55C", grau: "#A8A39A", linie: "rgba(201,165,92,.55)" };

const ladeFont = async (p) => {
  const buf = await readFile(nm(p));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};

// Pfaddaten selbst serialisieren: Null-Segmente (z. B. im „r" von Orbitron) weglassen –
// die eingebaute Serialisierung erzeugt daraus je nach Position fehlerhafte Formen.
const zahl = (n) => (Math.round(n * 100) / 100).toString();
function pfadDaten(befehle) {
  let teile = [], px = null, py = null;
  for (const c of befehle) {
    if (c.type === "L" && c.x === px && c.y === py) continue;
    if (c.type === "M") teile.push(`M${zahl(c.x)} ${zahl(c.y)}`);
    else if (c.type === "L") teile.push(`L${zahl(c.x)} ${zahl(c.y)}`);
    else if (c.type === "Q") teile.push(`Q${zahl(c.x1)} ${zahl(c.y1)} ${zahl(c.x)} ${zahl(c.y)}`);
    else if (c.type === "C") teile.push(`C${zahl(c.x1)} ${zahl(c.y1)} ${zahl(c.x2)} ${zahl(c.y2)} ${zahl(c.x)} ${zahl(c.y)}`);
    else if (c.type === "Z") teile.push("Z");
    if (c.type !== "Z") { px = c.x; py = c.y; }
  }
  return teile.join("");
}
// Ein <path> pro Buchstabe
const pfade = (font, text, x, y, groesse, farbe) =>
  font.getPaths(text, x, y, groesse).filter((p) => p.commands.length)
    .map((p) => `<path d="${pfadDaten(p.commands)}" fill="${farbe}"/>`).join("");

// Wortmarke als SVG-Pfade: liefert { svg, breite } für eine Grundlinie bei y
function wortmarke(font, groesse, x, y) {
  const teil1 = "Gutachter ", teil2 = "BAS";
  const b1 = font.getAdvanceWidth(teil1, groesse);
  return {
    svg: pfade(font, teil1, x, y, groesse, FARBE.text) + pfade(font, teil2, x + b1, y, groesse, FARBE.gold),
    breite: b1 + font.getAdvanceWidth(teil2, groesse),
  };
}

async function run() {
  const orbitron = await ladeFont("@fontsource/orbitron/files/orbitron-latin-400-normal.woff");
  const orbitronFett = await ladeFont("@fontsource/orbitron/files/orbitron-latin-700-normal.woff");
  const grotesk = await ladeFont("@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-500-normal.woff");

  // 1) Favicon: „BAS" in Gold auf Schwarz (fette Orbitron-Variante für Lesbarkeit bei 16–32 px)
  const fg = 11.2, fb = orbitronFett.getAdvanceWidth("BAS", fg);
  const favPfade = pfade(orbitronFett, "BAS", (32 - fb) / 2, 20.1, fg, FARBE.gold);
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${FARBE.grund}"/>${favPfade}</svg>\n`;
  await writeFile(join(root, "favicon.svg"), favicon);
  await sharp(Buffer.from(favicon), { density: 600 }).resize(180, 180).png().toFile(join(root, "apple-touch-icon.png"));

  // 2) Logo-PNG für JSON-LD / Verzeichnisse (2x-Auflösung, dunkler Grund)
  const lg = 72, lw = wortmarke(orbitron, lg, 0, 0).breite, LW = Math.ceil(lw + 96), LH = 180;
  const logo = wortmarke(orbitron, lg, (LW - lw) / 2, 112);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${LW}" height="${LH}"><rect width="100%" height="100%" fill="${FARBE.grund}"/>${logo.svg}</svg>`))
    .png({ compressionLevel: 9 }).toFile(join(root, "assets/img/gutachter-bas-logo.png"));

  // 3) Open-Graph-Bild 1200×630: Wortmarke + Ort, feine Gold-Haarlinie
  const og = 92, ow = wortmarke(orbitron, og, 0, 0).breite;
  const marke = wortmarke(orbitron, og, (1200 - ow) / 2, 318);
  const zeile = "Kfz-Gutachter in Ingolstadt", zg = 40, zw = grotesk.getAdvanceWidth(zeile, zg);
  const zeilePfade = pfade(grotesk, zeile, (1200 - zw) / 2, 410, zg, FARBE.grau);
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${FARBE.grund}"/>${marke.svg}<rect x="560" y="352" width="80" height="2" fill="${FARBE.gold}"/>${zeilePfade}<rect x="0" y="628" width="1200" height="2" fill="${FARBE.linie}"/></svg>`;
  await sharp(Buffer.from(ogSvg)).jpeg({ quality: 88, mozjpeg: true }).toFile(join(root, "assets/img/gutachter-bas-kfz-gutachter-ingolstadt.jpg"));

  console.log("Favicon, Apple-Touch-Icon, Logo-PNG und OG-Bild aus der Original-Wortmarke erzeugt");
}

run().catch((err) => {
  console.error(`Logo-Ableitung fehlgeschlagen: ${err.message}`);
  process.exit(1);
});
