// Erzeugt optimierte Bildvarianten (AVIF, WebP, JPG) aus /src/images nach /assets/img.
// Zertifikate werden NIE hochskaliert (Quellen sind klein) – nur in Originalbreite
// neu kodiert, damit nichts „erfunden" oder unscharf hochgerechnet wird.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "src/images");
const OUT = join(root, "assets/img");

// Dateinamen SEO-sprechend: Keyword + Ort/Inhalt, Kleinbuchstaben, Bindestriche, keine Umlaute.
// Quelle und erzeugte Varianten tragen denselben Namen.
const PORTRAIT = "kfz-gutachter-ingolstadt-ismayil-bas";
const JOBS = [
  { name: PORTRAIT, widths: [480, 760, 1086] },
  { name: "kfz-sachverstaendiger-zertifikat-desag", widths: [null] },
  { name: "kfz-sachverstaendiger-urkunde-berufsfachverband", widths: [null] },
  { name: "kfz-gutachter-zertifikat-iso-9001", widths: [null] },
  { name: "kfz-sachverstaendiger-desag-logo", widths: [null] },
];

async function encode(input, base, width) {
  const pipeline = () => {
    const img = sharp(input).rotate();
    return width ? img.resize({ width, withoutEnlargement: true }) : img;
  };
  await Promise.all([
    pipeline().avif({ quality: 58, effort: 6 }).toFile(`${base}.avif`),
    pipeline().webp({ quality: 80, effort: 6 }).toFile(`${base}.webp`),
    pipeline().jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(`${base}.jpg`),
  ]);
}

async function run() {
  await mkdir(OUT, { recursive: true });
  for (const job of JOBS) {
    const input = join(SRC, `${job.name}.jpg`);
    const meta = await sharp(input).metadata();
    for (const w of job.widths) {
      const width = w ?? meta.width;
      const base = join(OUT, w ? `${job.name}-${width}` : job.name);
      await encode(input, base, w);
      console.log(`${job.name}.jpg → ${base.replace(root, "")} (${width}px)`);
    }
  }

  // Open-Graph-Bild: siehe scripts/logo.mjs (aus der Original-Wortmarke abgeleitet)
}

run().catch((err) => {
  console.error(`Bildverarbeitung fehlgeschlagen: ${err.message}`);
  process.exit(1);
});
