// ============================================================================
// ZENTRALE DATENQUELLE – Gutachter BAS
// Kontaktdaten, Öffnungszeiten, Leistungen, Bewertungen und FAQ stehen NUR hier.
// Alle Seiten, JSON-LD, llms.txt und sitemap.xml werden per `npm run build`
// daraus erzeugt. Nach jeder Änderung: `npm run build`.
// Regel: Keine Fakten erfinden – fehlende Angaben als TODO markieren.
// ============================================================================

export const SITE = {
  url: "https://www.gutachter-bas.de",
  name: "Gutachter BAS",
  alternateName: "KFZ-Sachverständiger Bas",
  slogan: "Zertifiziert · Unabhängig · Zuverlässig",
  lastmod: "2026-11-17",
};

export const OWNER = {
  name: "Ismayil Bas",
  jobTitle: "Zertifizierter Kfz-Sachverständiger",
  yearsExperience: 10, // „seit über 10 Jahren"
};

export const CONTACT = {
  phoneDisplay: "+49 172 9497335",
  phoneHref: "tel:+491729497335",
  phoneSchema: "+49 172 9497335",
  email: "info@gutachter-bas.de",
  street: "Alpenrosenstraße 2",
  postalCode: "85055",
  city: "Ingolstadt",
  region: "Bayern",
  country: "DE",
  countryName: "Deutschland",
  geo: { lat: 48.715, lng: 11.409 }, // aus bisheriger Website übernommen
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Alpenrosenstra%C3%9Fe+2%2C+85055+Ingolstadt",
};

export const HOURS = {
  office: { days: "Mo–Fr", opens: "08:00", closes: "17:00" },
  phoneUntil: "21:00",
  schemaDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
};

export const AREA = ["Ingolstadt"];
export const AUDIENCES = ["Privatpersonen", "Werkstätten", "Anwälte"];

// Formular: GitHub Pages hat kein Backend. Solange kein Endpoint gesetzt ist,
// öffnet das Formular eine vorbereitete E-Mail an CONTACT.email (Fotos werden
// dann im E-Mail-Programm angehängt).
// TODO: Formular-Dienst (z. B. Formspree/Web3Forms, möglichst EU-Hosting) einrichten,
//       Endpoint hier eintragen und in der Datenschutzerklärung ergänzen.
export const FORM = {
  endpoint: "",
  maxFiles: 6,
  maxFileMb: 8,
};

export const SERVICES = [
  {
    slug: "schadengutachten",
    title: "Schadengutachten",
    alias: "Unfallgutachten",
    text: "Fundierte Unfallgutachten zur Regulierung mit Versicherungen oder zur rechtlichen Absicherung.",
  },
  {
    slug: "oldtimerbewertung",
    title: "Oldtimerbewertung",
    text: "Professionelle Bewertung historischer Fahrzeuge – für Versicherung, Kauf oder Verkauf.",
  },
  {
    slug: "leasingruecknahme",
    title: "Leasingrücknahmebewertung",
    titleHtml: "Leasingrücknahme&shy;bewertung", // Trennstelle für schmale Bildschirme
    text: "Bewertung von Leasingfahrzeugen vor der Rückgabe, um unerwartete Kosten zu vermeiden.",
  },
  {
    slug: "fahrzeugverwertung",
    title: "Fahrzeugverwertung",
    text: "Wirtschaftliche Beurteilung und Dokumentation für die Verwertung oder Entsorgung von Fahrzeugen.",
  },
  {
    slug: "kostenvoranschlag",
    title: "Kostenvoranschlag",
    text: "Detaillierte Aufstellung der Reparaturkosten als Grundlage für Versicherungen und Werkstätten.",
  },
  {
    slug: "kaufberatung",
    title: "Kaufberatung",
    text: "Begleitung beim Fahrzeugkauf inklusive technischer Prüfung und Wertermittlung vor Ort.",
  },
];

export const STEPS = [
  { title: "Anrufen", text: `Sie schildern kurz, was passiert ist – telefonisch bis ${HOURS.phoneUntil} Uhr.` },
  { title: "Besichtigung", text: "Wir vereinbaren einen Termin und ich begutachte Ihr Fahrzeug." },
  { title: "Gutachten", text: "Schäden werden geprüft, fotografiert und nachvollziehbar dokumentiert." },
  { title: "Regulierung", text: "Mit dem Gutachten regulieren Sie den Schaden mit der Versicherung." },
];

// Zertifikate – Titel nach dem tatsächlich sichtbaren Inhalt der Bilder.
// (Die alten Alt-Texte „KFZ-Gutachter / Fahrzeugbewertung / Oldtimerbewertung /
// Unfallschadenanalyse" passten nicht zu den Bildinhalten.)
export const CERTIFICATES = [
  {
    file: "kfz-sachverstaendiger-zertifikat-desag",
    width: 346, height: 494,
    title: "Urkunde der DESAG",
    alt: "Urkunde der DESAG: Ismayil Bas als Sachverständiger für Schäden an Kraftfahrzeugen und Wertermittlung",
    detail: "Sachverständiger für Schäden an Kraftfahrzeugen und Wertermittlung",
  },
  {
    file: "kfz-sachverstaendiger-urkunde-berufsfachverband",
    width: 400, height: 282,
    alt: "Urkunde des Berufsfachverbands: Ismayil Bas als Sachverständiger für Schäden an Kraftfahrzeugen und Wertermittlung",
    // TODO: Genauen Verbandsnamen am Original prüfen (Bildquelle sehr klein).
    title: "Urkunde des Berufsfachverbands",
    detail: "Sachverständiger für Schäden an Kraftfahrzeugen und Wertermittlung",
  },
  {
    file: "kfz-gutachter-zertifikat-iso-9001",
    width: 257, height: 252,
    alt: "Siegel DESAG Zert: zertifiziert nach DIN EN ISO 9001:2008",
    title: "Siegel DESAG Zert",
    detail: "Zertifiziert nach DIN EN ISO 9001:2008",
  },
  {
    file: "kfz-sachverstaendiger-desag-logo",
    width: 664, height: 318,
    alt: "Logo der DESAG – Deutsche Sachverständigen Gesellschaft",
    title: "DESAG",
    detail: "Deutsche Sachverständigen Gesellschaft",
  },
];

// Die 6 Bewertungen der bisherigen Website – Wortlaut unverändert.
export const REVIEWS = [
  {
    author: "Mustafa Tingir",
    text: "Ich habe die Dienste von KFZ Sachverständiger Bas in Anspruch genommen und bin äußerst zufrieden. Herr Bas ist sehr kompetent und bietet eine hervorragende Beratung. Der Service war schnell, und ich fühlte mich jederzeit wohl und in sicheren Händen. Seine Fachkenntnisse sind beeindruckend – uneingeschränkt empfehlenswert!",
  },
  {
    author: "Engin K.",
    text: "Wenn's mehr Sterne geben würde, hätte Herr Bas die auch alle verdient. Fachlich top, erfahren, zuvorkommend und sympathisch. Ein All-In Top-Paket!",
  },
  {
    author: "Krisis Blum",
    text: "Sehr freundlicher und zuverlässiger Gutachter. Schnelle Bearbeitung und nimmt sich Zeit. Wir sind sehr zufrieden – danke!",
  },
  {
    author: "Johannes Erlewein",
    text: "Herr Bas machte mir einen freundlichen und sachkundigen Eindruck. Alles super erklärt und das Gutachten kam schnell. Vielen Dank!",
  },
  { author: "Kislacikli Uemit", text: "Sehr freundlich und fleißig, macht seine Arbeit sehr erfolgreich." },
  { author: "Andreas P.", text: "Immer gerne wieder!" },
];

// FAQ – Antworten ausschließlich aus vorhandenen Fakten.
export const FAQ = [
  {
    q: "Wann erreiche ich Sie?",
    a: `Montag bis Freitag von ${HOURS.office.opens} bis ${HOURS.office.closes} Uhr, telefonisch zusätzlich bis ${HOURS.phoneUntil} Uhr unter ${CONTACT.phoneDisplay}.`,
  },
  {
    q: "Für wen erstellen Sie Gutachten?",
    a: "Für Privatpersonen, Werkstätten und Anwälte – als unabhängiger Kfz-Sachverständiger in Ingolstadt.",
  },
  {
    q: "Welche Leistungen bieten Sie an?",
    a: "Schadengutachten (Unfallgutachten), Oldtimerbewertung, Leasingrücknahmebewertung, Fahrzeugverwertung, Kostenvoranschlag und Kaufberatung mit technischer Prüfung vor Ort.",
  },
  {
    q: "Sind Sie zertifiziert?",
    a: "Ja. Ismayil Bas ist seit über 10 Jahren als zertifizierter Kfz-Sachverständiger tätig – zertifiziert als Sachverständiger für Schäden an Kraftfahrzeugen und Wertermittlung (DESAG).",
  },
  {
    q: "Wo finde ich Sie?",
    a: `In der ${CONTACT.street}, ${CONTACT.postalCode} ${CONTACT.city}.`,
  },
  {
    q: "Was brauche ich für eine Anfrage?",
    a: "Ihren Namen, eine Telefonnummer und eine kurze Beschreibung. Fotos vom Schaden können Sie gleich mitschicken.",
  },
];

// TODO (nicht veröffentlicht, erst nach Bestätigung durch Herrn Bas aktivieren):
// { q: "Ist das Gutachten für Geschädigte kostenlos?", a: "TODO" }
export const FAQ_TODO_COMMENT =
  'TODO: Frage „Ist das Gutachten für Geschädigte kostenlos?" erst nach Bestätigung durch Herrn Bas aufnehmen (in src/site.config.mjs → FAQ).';
