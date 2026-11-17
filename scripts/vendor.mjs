// Kopiert Drittanbieter-Dateien (GSAP, Lenis, Schrift) aus node_modules nach /assets.
// Alles wird lokal ausgeliefert – keine externen CDNs, keine Google-Fonts-Anfragen.
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nm = (p) => join(root, "node_modules", p);

const FILES = [
  [nm("gsap/dist/gsap.min.js"), "assets/vendor/gsap.min.js"],
  [nm("gsap/dist/ScrollTrigger.min.js"), "assets/vendor/ScrollTrigger.min.js"],
  [nm("gsap/dist/SplitText.min.js"), "assets/vendor/SplitText.min.js"],
  [nm("lenis/dist/lenis.min.js"), "assets/vendor/lenis.min.js"],
  // three.js r149: letzte UMD-Version ohne Deprecation-Warnung (wie bei smyagency nachgeladen)
  [nm("three/build/three.min.js"), "assets/vendor/three.min.js"],
  [
    nm("@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2"),
    "assets/fonts/schibsted-grotesk-latin.woff2",
  ],
  [
    nm("@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-ext-wght-normal.woff2"),
    "assets/fonts/schibsted-grotesk-latin-ext.woff2",
  ],
];

try {
  for (const [from, to] of FILES) {
    const target = join(root, to);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(from, target);
    console.log(`kopiert: ${to}`);
  }
} catch (err) {
  console.error(`Vendor-Kopie fehlgeschlagen: ${err.message}\nZuerst "npm install" ausführen.`);
  process.exit(1);
}
