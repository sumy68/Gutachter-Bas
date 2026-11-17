// Startseite (Onepage). Inhalte aus site.config.mjs.
import {
  OWNER, CONTACT, SERVICES, STEPS, CERTIFICATES, REVIEWS, FAQ, FAQ_TODO_COMMENT, FORM,
} from "../site.config.mjs";
import { esc, head, header, footer, phoneLink, mailLink, addressLink, hoursLines, V } from "./layout.mjs";
import { homeSchema } from "./schema.mjs";

const IMG = "/assets/img";
const PORTRAIT = "kfz-gutachter-ingolstadt-ismayil-bas";
const pad = (n) => String(n).padStart(2, "0");

function picture({ base, widths, sizes, alt, width, height, lazy = true, cls = "" }) {
  const set = (ext) =>
    widths ? widths.map((w) => `${IMG}/${base}-${w}.${ext} ${w}w`).join(", ") : `${IMG}/${base}.${ext}`;
  const fallback = widths ? `${IMG}/${base}-${widths[widths.length - 1]}.jpg` : `${IMG}/${base}.jpg`;
  const sz = widths ? ` sizes="${sizes}"` : "";
  return `<picture>
  <source type="image/avif" srcset="${set("avif")}"${sz}>
  <source type="image/webp" srcset="${set("webp")}"${sz}>
  <img class="${cls}" src="${fallback}"${widths ? ` srcset="${set("jpg")}"${sz}` : ""} alt="${esc(alt)}" width="${width}" height="${height}"${lazy ? ' loading="lazy" decoding="async"' : ""}>
</picture>`;
}

const STARS = `<span class="sterne" role="img" aria-label="5 von 5 Sternen">${'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7z"/></svg>'.repeat(5)}</span>`;

const hero = () => `
<section class="held" id="start" data-szene="0" data-pos="0,-2.4,0.74,1" data-pos-m="0,-2.15,0.46,1">
  <div class="wrap held__innen">
    <h1 class="held__titel">
      <span class="held__zeile">Wir</span>
      <span class="wechsel" data-breit="dokumentieren"><span class="wechsel__wort" id="wechsel" data-woerter="prüfen,bewerten,dokumentieren,schützen">prüfen</span></span>
      <span class="held__zeile">Ihr&nbsp;Fahrzeug.</span>
    </h1>
    <p class="held__lead">${esc(OWNER.name)} ist Ihr zertifizierter <span class="nw">Kfz-Gutachter</span> in Ingolstadt – für Unfallgutachten, Bewertungen und Kaufberatung, seit über ${OWNER.yearsExperience}&nbsp;Jahren.</p>
    <div class="held__aktion">
      <a class="btn" href="#kontakt">Jetzt Gutachter anfragen</a>
      <p class="held__tel">oder anrufen: ${phoneLink()}</p>
    </div>
  </div>
  <div class="wrap held__fuss">
    <div class="skala" aria-hidden="true"></div>
  </div>
</section>`;

const services = () => `
<section class="abschnitt leistungen" id="service" data-szene="1" data-pos="-3.5,-2.35,0.66,0.85" data-pos-m="0,-2.75,0.4,0.2" aria-labelledby="leistungen-titel">
  <div class="wrap raster">
    <div class="abschnitt__kopf klebt">
      <h2 id="leistungen-titel" data-split>Ihr Kfz-Gutachter in Ingolstadt</h2>
      <p class="einleitung" data-reveal>Sechs Leistungen rund um Ihr Fahrzeug – unabhängig, nachvollziehbar und schnell, für Privatpersonen, Werkstätten und Anwälte.</p>
    </div>
    <ol class="verzeichnis">
      ${SERVICES.map((s, i) => `<li class="verzeichnis__eintrag" id="${s.slug}" data-reveal>
        <span class="verzeichnis__nr" aria-hidden="true">${pad(i + 1)}</span>
        <h3>${s.titleHtml || esc(s.title)}${s.alias ? ` <span class="verzeichnis__alias">(${esc(s.alias)})</span>` : ""}</h3>
        <p>${esc(s.text)}</p>
      </li>`).join("\n      ")}
    </ol>
  </div>
</section>`;

const steps = () => `
<section class="abschnitt ablauf" id="ablauf" data-szene="1" data-pos="3.9,1.75,0.58,0.6" data-pos-m="0,-2.8,0.38,0.2" aria-labelledby="ablauf-titel">
  <div class="wrap">
    <h2 id="ablauf-titel" data-split>So läuft’s ab</h2>
    <ol class="schritte">
      ${STEPS.map((s, i) => `<li class="schritt" data-reveal>
        <span class="schritt__nr" aria-hidden="true">${i + 1}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </li>`).join("\n      ")}
    </ol>
  </div>
</section>`;

const about = () => `
<section class="abschnitt ueber" id="about" data-szene="2" data-pos="4.1,0.9,0.78,0.55" data-pos-m="0.6,2.2,0.5,0.3" aria-labelledby="ueber-titel">
  <div class="wrap ueber__raster">
    <figure class="ueber__bild" data-reveal>
      ${picture({
        base: PORTRAIT, widths: [480, 760, 1086], sizes: "(min-width: 1000px) 40vw, 92vw",
        alt: "Kfz-Gutachter Ismayil Bas in Ingolstadt mit Klemmbrett vor einem Unfallfahrzeug",
        width: 1086, height: 1448,
      })}
    </figure>
    <div class="ueber__text">
      <h2 id="ueber-titel" data-split>Ismayil Bas – zertifiziert und unabhängig</h2>
      <p data-reveal>Seit über ${OWNER.yearsExperience} Jahren bin ich als zertifizierter Kfz-Gutachter tätig und stehe Privatpersonen, Werkstätten und Anwälten als unabhängiger Ansprechpartner zur Seite.</p>
      <p data-reveal>Ich kenne die Technik verschiedenster Fahrzeugtypen ebenso wie die Abläufe bei Versicherungen und rechtlichen Verfahren – und arbeite mit Präzision, Transparenz und Fairness.</p>
      <dl class="fakten" data-reveal>
        <div><dt><span class="zaehler" data-ziel="${OWNER.yearsExperience}">${OWNER.yearsExperience}</span>+</dt><dd>Jahre Erfahrung</dd></div>
        <div><dt>Zertifiziert</dt><dd>Schäden an Kfz und Wertermittlung</dd></div>
        <div><dt>Unabhängig</dt><dd>Für Privat, Werkstatt und Kanzlei</dd></div>
      </dl>
    </div>
  </div>
</section>`;

const certificates = () => `
<section class="abschnitt zertifikate" id="zertifikate" data-szene="2" data-pos="0,0.2,1.15,0.35" data-pos-m="0,0,0.62,0.3" aria-labelledby="zert-titel">
  <div class="wrap">
    <div class="zertifikate__kopf">
      <h2 id="zert-titel" data-split>Zertifiziert</h2>
      <p class="einleitung" data-reveal>Urkunden und Siegel – zum Vergrößern antippen.</p>
    </div>
    <ul class="zert-reihe">
      ${CERTIFICATES.map((c, i) => `<li class="zert" style="--i:${i}">
        <figure>
          <button class="zert__knopf" type="button" data-zert="${i}" aria-haspopup="dialog" aria-label="${esc(`${c.title} vergrößern`)}">
            ${picture({ base: c.file, alt: c.alt, width: c.width, height: c.height, cls: "zert__bild" })}
          </button>
          <figcaption><span class="zert__titel">${esc(c.title)}</span><span class="zert__detail">${esc(c.detail)}</span></figcaption>
        </figure>
      </li>`).join("\n      ")}
    </ul>
  </div>
  <dialog class="lightbox" id="lightbox" aria-labelledby="lightbox-titel">
    <div class="lightbox__innen">
      <button class="lightbox__zu" type="button" aria-label="Schließen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
      <figure class="lightbox__figur">
        <img class="lightbox__bild" src="" alt="" width="400" height="400">
        <figcaption><span class="lightbox__titel" id="lightbox-titel"></span><span class="lightbox__detail"></span><span class="lightbox__zahl" aria-live="polite"></span></figcaption>
      </figure>
      <button class="lightbox__pfeil lightbox__pfeil--zurueck" type="button" aria-label="Vorheriges Zertifikat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button class="lightbox__pfeil lightbox__pfeil--vor" type="button" aria-label="Nächstes Zertifikat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>
  </dialog>
  <script type="application/json" id="zert-daten">${JSON.stringify(
    CERTIFICATES.map((c) => ({ src: `${IMG}/${c.file}.webp`, w: c.width, h: c.height, title: c.title, detail: c.detail, alt: c.alt })),
  ).replace(/</g, "\\u003c")}</script>
</section>`;

const reviews = () => `
<section class="abschnitt stimmen" id="bewertungen" data-szene="2" data-pos="-4.2,-0.6,0.7,0.35" data-pos-m="0,-1.6,0.45,0.25" aria-labelledby="stimmen-titel">
  <div class="wrap stimmen__raster">
    <div class="stimmen__kopf">
      <h2 id="stimmen-titel" data-split>Kundenstimmen</h2>
      ${STARS}
    </div>
    <div class="slider" data-slider aria-roledescription="Karussell" aria-label="Kundenbewertungen">
      <div class="slider__spur">
        ${REVIEWS.map((r, i) => `<div class="stimme${i === 0 ? " ist-aktiv" : ""}" role="group" aria-roledescription="Bewertung" aria-label="${i + 1} von ${REVIEWS.length}"${i === 0 ? "" : ' aria-hidden="true" inert'}>
          <blockquote><p>„${esc(r.text)}“</p></blockquote>
          <p class="stimme__autor">${esc(r.author)}</p>
        </div>`).join("\n        ")}
      </div>
      <div class="slider__steuer">
        <button class="rund" type="button" data-zurueck aria-label="Vorherige Bewertung"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
        <p class="slider__zahl" aria-live="polite"><span data-aktuell>1</span> / ${REVIEWS.length}</p>
        <button class="rund" type="button" data-vor aria-label="Nächste Bewertung"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
      </div>
    </div>
  </div>
</section>`;

const faq = () => `
<section class="abschnitt faq" id="faq" data-szene="3" data-pos="-3.7,-1.5,0.62,0.5" data-pos-m="0,1.4,0.5,0.22" aria-labelledby="faq-titel">
  <div class="wrap raster">
    <div class="abschnitt__kopf klebt">
      <h2 id="faq-titel" data-split>Häufige Fragen zum Kfz-Gutachten</h2>
    </div>
    <div class="faq__liste">
      ${FAQ.map((f) => `<details class="frage" data-reveal>
        <summary><h3>${esc(f.q)}</h3><span class="frage__plus" aria-hidden="true"></span></summary>
        <div class="frage__antwort"><p>${esc(f.a)}</p></div>
      </details>`).join("\n      ")}
      <!-- ${esc(FAQ_TODO_COMMENT)} -->
    </div>
  </div>
</section>`;

const contact = () => `
<section class="abschnitt kontakt" id="kontakt" data-szene="3" data-pos="3.3,0,0.95,0" data-pos-m="0,-1.8,0.5,0" aria-labelledby="kontakt-titel">
  <div class="wrap kontakt__raster">
    <div class="kontakt__info">
      <h2 id="kontakt-titel" data-split>Gutachter in Ingolstadt anfragen</h2>
      <p class="einleitung" data-reveal>Schildern Sie kurz Ihr Anliegen – ich melde mich zeitnah bei Ihnen.</p>
      <dl class="kontaktliste" data-reveal>
        <div><dt>Telefon</dt><dd>${phoneLink()}</dd></div>
        <div><dt>E-Mail</dt><dd>${mailLink()}</dd></div>
        <div id="standort"><dt>Adresse</dt><dd>${addressLink()}</dd></div>
        <div><dt>Erreichbar</dt><dd>${hoursLines()}</dd></div>
      </dl>
    </div>
    <form class="formular" id="anfrage" data-endpoint="${esc(FORM.endpoint)}" data-mail="${esc(CONTACT.email)}" data-max-dateien="${FORM.maxFiles}" data-max-mb="${FORM.maxFileMb}" novalidate data-reveal>
      <div class="feld">
        <label for="f-name">Name</label>
        <input id="f-name" name="name" type="text" autocomplete="name" required>
      </div>
      <div class="feld-paar">
        <div class="feld">
          <label for="f-tel">Telefon</label>
          <input id="f-tel" name="telefon" type="tel" autocomplete="tel" inputmode="tel" required>
        </div>
        <div class="feld">
          <label for="f-mail">E-Mail <span class="optional">(optional)</span></label>
          <input id="f-mail" name="email" type="email" autocomplete="email">
        </div>
      </div>
      <div class="feld">
        <label for="f-anliegen">Ihr Anliegen</label>
        <textarea id="f-anliegen" name="anliegen" rows="4" required></textarea>
      </div>
      <div class="feld feld--datei">
        <label class="datei" for="f-fotos">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3l2-2.5h6L17 7h3v12H4z"/><circle cx="12" cy="13" r="3.5"/></svg>
          <span>Fotos vom Schaden hinzufügen <span class="optional">(optional, bis ${FORM.maxFiles} Bilder)</span></span>
        </label>
        <input id="f-fotos" name="fotos" type="file" accept="image/*" multiple class="nur-sr">
        <ul class="datei__liste" aria-live="polite"></ul>
      </div>
      <div class="honig" aria-hidden="true"><label for="f-web">Website</label><input id="f-web" name="website" type="text" tabindex="-1" autocomplete="off"></div>
      <p class="formular__hinweis">Ihre Angaben werden nur zur Bearbeitung der Anfrage verwendet. Mehr in der <a class="textlink" href="/datenschutz">Datenschutzerklärung</a>.</p>
      <button class="btn" type="submit">Anfrage senden</button>
      <p class="formular__status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>`;

export function renderHome() {
  return `${head({
    title: "Kfz-Gutachter Ingolstadt – Unfallgutachten & Bewertung | Gutachter BAS",
    description: `Zertifizierter Kfz-Gutachter in Ingolstadt: Unfallgutachten, Oldtimerbewertung, Leasingrückgabe-Gutachten, Kostenvoranschlag und Kaufberatung. Jetzt anfragen: ${CONTACT.phoneDisplay}`,
    path: "/",
    extraHead: `${homeSchema()}
<link rel="modulepreload" href="/assets/js/partikel.js?v=${V}">
<link rel="modulepreload" href="/assets/js/partikel-formen.js">
<link rel="preload" href="/assets/vendor/three.min.js" as="script" fetchpriority="low">`,
  })}
<body class="startseite">
${header({ home: true })}
<canvas id="buehne" class="buehne" aria-hidden="true"></canvas>
<div class="buehne-standbild" aria-hidden="true"></div>
<main id="main">
${hero()}
${services()}
${steps()}
${about()}
${certificates()}
${reviews()}
${faq()}
${contact()}
</main>
${footer({ home: true })}
<script src="/assets/vendor/gsap.min.js?v=${V}" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js?v=${V}" defer></script>
<script src="/assets/vendor/SplitText.min.js?v=${V}" defer></script>
<script src="/assets/vendor/lenis.min.js?v=${V}" defer></script>
<script type="module" src="/assets/js/main.js?v=${V}"></script>
<script type="module" src="/assets/js/partikel.js?v=${V}"></script>
</body>
</html>
`;
}

