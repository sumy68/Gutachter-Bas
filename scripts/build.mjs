// Erzeugt die statischen Seiten für GitHub Pages aus /src.
// Ausgabe im Projektstamm (dort liefert GitHub Pages aus): index.html, impressum.html,
// datenschutz.html, sitemap.xml, robots.txt, llms.txt.
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderHome } from "../src/templates/home.mjs";
import { renderImpressum, renderDatenschutz } from "../src/templates/legal.mjs";
import { SITE, OWNER, CONTACT, HOURS, SERVICES, FAQ, AREA, AUDIENCES, CERTIFICATES } from "../src/site.config.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Bild-Sitemap: Porträt und Zertifikate auf der Startseite
const SITEMAP_BILDER = [
  "kfz-gutachter-ingolstadt-ismayil-bas-1086.jpg",
  ...CERTIFICATES.map((c) => `${c.file}.jpg`),
];

const sitemap = () => {
  const urls = [
    ["/", "monthly", "1.0", SITEMAP_BILDER],
    ["/impressum", "yearly", "0.3", []],
    ["/datenschutz", "yearly", "0.3", []],
  ];
  const bilder = (liste) => liste.map((b) => `
    <image:image>
      <image:loc>${SITE.url}/assets/img/${b}</image:loc>
    </image:image>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(([p, f, pr, b]) => `  <url>
    <loc>${SITE.url}${p}</loc>
    <lastmod>${SITE.lastmod}</lastmod>
    <changefreq>${f}</changefreq>
    <priority>${pr}</priority>${bilder(b)}
  </url>`).join("\n")}
</urlset>
`;
};

const robots = () => `User-agent: *
Allow: /
Disallow: /src/
Disallow: /scripts/

Sitemap: ${SITE.url}/sitemap.xml
`;

const llms = () => `# ${SITE.name} – Kfz-Gutachter Ingolstadt

> ${OWNER.name} ist zertifizierter Kfz-Sachverständiger in ${CONTACT.city} und seit über ${OWNER.yearsExperience} Jahren tätig. ${SITE.slogan}.

## Kontakt
- Adresse: ${CONTACT.street}, ${CONTACT.postalCode} ${CONTACT.city}
- Telefon: ${CONTACT.phoneDisplay}
- E-Mail: ${CONTACT.email}
- Öffnungszeiten: ${HOURS.office.days} ${HOURS.office.opens}–${HOURS.office.closes} Uhr, telefonisch bis ${HOURS.phoneUntil} Uhr
- Einsatzgebiet: ${AREA.join(", ")}
- Für: ${AUDIENCES.join(", ")}

## Leistungen
${SERVICES.map((s) => `- [${s.title}${s.alias ? ` (${s.alias})` : ""}](${SITE.url}/#${s.slug}): ${s.text}`).join("\n")}

## Häufige Fragen
${FAQ.map((f) => `- ${f.q} ${f.a}`).join("\n")}

## Seiten
- [Startseite](${SITE.url}/)
- [Impressum](${SITE.url}/impressum)
- [Datenschutz](${SITE.url}/datenschutz)
`;

const FILES = {
  "index.html": renderHome,
  "impressum.html": renderImpressum,
  "datenschutz.html": renderDatenschutz,
  "sitemap.xml": sitemap,
  "robots.txt": robots,
  "llms.txt": llms,
};

try {
  for (const [name, render] of Object.entries(FILES)) {
    await writeFile(join(root, name), render(), "utf8");
    console.log(`gebaut: ${name}`);
  }
} catch (err) {
  console.error(`Build fehlgeschlagen: ${err.stack || err.message}`);
  process.exit(1);
}
