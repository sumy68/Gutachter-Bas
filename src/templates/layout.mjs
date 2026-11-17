// Gemeinsame Bausteine: <head>, Header, Footer und Kontakt-Snippets.
// Kontaktangaben kommen ausschließlich aus site.config.mjs.
import { readFileSync } from "node:fs";
import { SITE, CONTACT, HOURS } from "../site.config.mjs";

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

// Crash-Test-Marker (geviertelter Kreis) – Motiv aus dem BAS-Logo
export const marker = (size = 22) =>
  `<svg class="marker" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 1.5A10.5 10.5 0 0 1 22.5 12H12zM12 12h-10.5A10.5 10.5 0 0 0 12 22.5z" fill="currentColor"/></svg>`;

const FONT = "/assets/fonts/schibsted-grotesk-latin.woff2";

export function head({ title, description, path, ogImage, extraHead = "", preloadImage = "" }) {
  const canonical = `${SITE.url}${path}`;
  const og = ogImage || `${SITE.url}/assets/img/og-gutachter-bas-ingolstadt.jpg`;
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
<meta property="og:image:alt" content="Ismayil Bas – Kfz-Gutachter in Ingolstadt">
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
    <a class="logo" href="/" aria-label="Gutachter BAS – zur Startseite">${marker(24)}<span>Gutachter <b>BAS</b></span></a>
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

export function footer() {
  return `<footer class="fuss">
  <div class="wrap fuss__innen">
    <div class="fuss__marke">
      <a class="logo" href="/">${marker(24)}<span>Gutachter <b>BAS</b></span></a>
      <p class="fuss__slogan">${esc(SITE.slogan)}</p>
    </div>
    <div class="fuss__kontakt">
      ${addressBlock()}
      <p>${phoneLink()}</p>
      <p>${mailLink()}</p>
    </div>
    <nav class="fuss__nav" aria-label="Rechtliches">
      <a href="/impressum">Impressum</a>
      <a href="/datenschutz">Datenschutz</a>
    </nav>
  </div>
  <div class="wrap fuss__copy"><p>© ${SITE.founderYear} ${esc(SITE.name)}. Alle Rechte vorbehalten.</p></div>
</footer>`;
}
