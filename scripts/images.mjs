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

const JOBS = [
  { src: "foto.jpg", name: "ismayil-bas-kfz-gutachter-ingolstadt", widths: [480, 760, 1086] },
  { src: "zertifikat-1.jpg", name: "zertifikat-desag-logo", widths: [null] },
  { src: "zertifikat-2.jpg", name: "zertifikat-desag-urkunde-kfz-sachverstaendiger", widths: [null] },
  { src: "zertifikat-3.jpg", name: "zertifikat-desag-zert-iso-9001", widths: [null] },
  { src: "zertifikat-4.jpg", name: "zertifikat-berufsfachverband-urkunde", widths: [null] },
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
    const input = join(SRC, job.src);
    const meta = await sharp(input).metadata();
    for (const w of job.widths) {
      const width = w ?? meta.width;
      const base = join(OUT, w ? `${job.name}-${width}` : job.name);
      await encode(input, base, w);
      console.log(`${job.src} → ${base.replace(root, "")} (${width}px)`);
    }
  }

  // Open-Graph-Bild 1200×630 (Ausschnitt aus dem Porträt, Fokus oben).
  await sharp(join(SRC, "foto.jpg"))
    .resize({ width: 1200, height: 630, fit: "cover", position: "top" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT, "og-gutachter-bas-ingolstadt.jpg"));
  console.log("Open-Graph-Bild erstellt");
}

run().catch((err) => {
  console.error(`Bildverarbeitung fehlgeschlagen: ${err.message}`);
  process.exit(1);
});
