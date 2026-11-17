// Gemeinsame Bausteine: <head>, Header, Footer und Kontakt-Snippets.
// Kontaktangaben kommen ausschließlich aus site.config.mjs.
import { readFileSync } from "node:fs";
import { SITE, CONTACT, HOURS, SERVICES, OWNER } from "../site.config.mjs";

// CSS wird beim Build inline eingebunden (spart einen Roundtrip -> schnelleres LCP).
// Quelle bleibt /assets/css/site.css.
const CSS = readFileSync(new URL("../../assets/css/site.css", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\n\s*/g, "")
  .replace(/\s*([{};,])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();

export const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Asset-Version für Cache-Busting (Datum des Builds)
export const V = SITE.lastmod.replace(/-/g, "");

// ---------- Kontakt-Snippets (einheitlich gestaltet, nie umbrechend) ----------
export const phoneLink = (cls = "") =>
  `<a class="kontaktwert ${cls}" href="${CONTACT.phoneHref}">${esc(CONTACT.phoneDisplay)}</a>`;
export const mailLink = (cls = "") =>
  `<a class="kontaktwert ${cls}" href="mailto:${CONTACT.email}">${esc(CONTACT.email)}</a>`;
export const addressBlock = (cls = "") =>
  `<address class="kontaktwert ${cls}">${esc(CONTACT.street)}<br><span class="nw">${esc(CONTACT.postalCode)} ${esc(CONTACT.city)}</span></address>`;
export const hoursText = () =>
  `<span><span class="nw">${HOURS.office.days} ${HOURS.office.opens}–${HOURS.office.closes}&nbsp;Uhr,</span> telefonisch bis <span class="nw">${HOURS.phoneUntil}&nbsp;Uhr</span></span>`;

// Wortmarke: selbst gezeichnetes Monogramm „B" (Linienzeichnung) in feiner Gold-Umrandung
// + „Gutachter" (Off-White) + „BAS" (Gold). Gleiches Logo in Navbar und Footer.
const MONOGRAMM = `<svg class="logo__zeichen" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" focusable="false"><rect x=".75" y=".75" width="26.5" height="26.5" rx="4" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M10 7.5V20.5M10 7.5h4.6a3.1 3.1 0 0 1 0 6.2H10M10 13.7h5.3a3.4 3.4 0 0 1 0 6.8H10" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>`;
export const logo = (label = "Gutachter BAS – zur Startseite") =>
  `<a class="logo" href="/" aria-label="${esc(label)}">${MONOGRAMM}<span class="logo__wort">Gutachter <b>BAS</b></span></a>`;

const FONT = "/assets/fonts/schibsted-grotesk-latin.woff2";

export function head({ title, description, path, ogImage, extraHead = "", preloadImage = "" }) {
  const canonical = `${SITE.url}${path}`;
  const og = ogImage || `${SITE.url}/assets/img/gutachter-bas-kfz-gutachter-ingolstadt.jpg`;
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#0B0B0C">
<meta name="color-scheme" content="dark">
<meta name="geo.region" content="DE-BY">
<meta name="geo.placename" content="${esc(CONTACT.city)}">
<meta name="geo.position" content="${CONTACT.geo.lat};${CONTACT.geo.lng}">
<meta name="ICBM" content="${CONTACT.geo.lat}, ${CONTACT.geo.lng}">
<meta property="og:locale" content="de_DE">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Kfz-Gutachter Ismayil Bas in Ingolstadt">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${FONT}" as="font" type="font/woff2" crossorigin>
${preloadImage}
<style>${CSS}</style>
<script>document.documentElement.classList.add('js');if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('ruhig');</script>
${extraHead}
</head>`;
}

const NAV = [
  ["#service", "Leistungen"],
  ["#ablauf", "Ablauf"],
  ["#about", "Über mich"],
  ["#bewertungen", "Bewertungen"],
  ["#faq", "FAQ"],
];

export function header({ home = true } = {}) {
  const href = (h) => (home ? h : `/${h}`);
  const links = NAV.map(([h, l]) => `<a href="${href(h)}">${l}</a>`).join("");
  return `<a class="skip" href="#main">Zum Inhalt springen</a>
<header class="kopf" id="kopf">
  <div class="kopf__innen">
    ${logo()}
    <nav class="nav" aria-label="Hauptnavigation">${links}</nav>
    <a class="btn btn--klein kopf__cta" href="${href("#kontakt")}">Anfragen</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menue" aria-label="Menü öffnen"><span></span><span></span></button>
  </div>
  <div class="menue" id="menue" hidden>
    <nav aria-label="Mobile Navigation">${links}<a href="${href("#kontakt")}">Kontakt</a></nav>
    <p class="menue__tel">${phoneLink()}</p>
  </div>
</header>`;
}

export function footer({ home = true } = {}) {
  const href = (h) => (home ? h : `/${h}`);
  const jahr = new Date().getFullYear(); // beim Build automatisch aktuell
  const leistungen = SERVICES.map((s) => `<li><a href="${href(`#${s.slug}`)}">${esc(s.title)}</a></li>`).join("");
  return `<footer class="fuss">
  <div class="wrap">
    <div class="fuss__cta">
      <h2 class="fuss__titel">Unfall gehabt?<br> Wir sind für Sie da.</h2>
      <div class="fuss__aktion">
        <a class="btn" href="${href("#kontakt")}">Jetzt Gutachter anfragen</a>
        <a class="fuss__telefon" href="${CONTACT.phoneHref}">${esc(CONTACT.phoneDisplay)}</a>
      </div>
    </div>
    <div class="fuss__raster">
      <div class="fuss__spalte">
        <h3 class="fuss__label">Gutachter BAS</h3>
        ${logo("Gutachter BAS – Startseite")}
        <p class="fuss__text">Unabhängige Kfz-Gutachten in ${esc(CONTACT.city)} seit über ${OWNER.yearsExperience}&nbsp;Jahren.</p>
      </div>
      <nav class="fuss__spalte" aria-labelledby="fuss-leistungen">
        <h3 class="fuss__label" id="fuss-leistungen">Leistungen</h3>
        <ul class="fuss__liste">${leistungen}</ul>
      </nav>
      <div class="fuss__spalte">
        <h3 class="fuss__label">Kontakt</h3>
        <ul class="fuss__liste">
          <li><a class="kontaktwert" href="${CONTACT.mapsUrl}" target="_blank" rel="noopener">${esc(CONTACT.street)}<br><span class="nw">${esc(CONTACT.postalCode)} ${esc(CONTACT.city)}</span><span class="nur-sr"> (öffnet Google Maps)</span></a></li>
          <li>${phoneLink()}</li>
          <li>${mailLink()}</li>
        </ul>
      </div>
      <div class="fuss__spalte">
        <h3 class="fuss__label">Erreichbarkeit</h3>
        <ul class="fuss__liste fuss__liste--text">
          <li><span class="nw">${HOURS.office.days} ${HOURS.office.opens}–${HOURS.office.closes}&nbsp;Uhr</span></li>
          <li>telefonisch bis <span class="nw">${HOURS.phoneUntil}&nbsp;Uhr</span></li>
        </ul>
      </div>
    </div>
    <div class="fuss__unten">
      <p>© ${jahr} ${esc(SITE.name)}</p>
      <nav class="fuss__recht" aria-label="Rechtliches">
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
      </nav>
    </div>
  </div>
</footer>`;
}
