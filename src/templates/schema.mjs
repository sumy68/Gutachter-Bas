// JSON-LD aus der zentralen Konfiguration. Bewusst OHNE AggregateRating/Review-Sterne.
import { SITE, OWNER, CONTACT, HOURS, AREA, SERVICES, FAQ, AUDIENCES } from "../site.config.mjs";

const ID = `${SITE.url}/#unternehmen`;

function business() {
  return {
    "@type": ["ProfessionalService", "AutomotiveBusiness"],
    "@id": ID,
    name: SITE.name,
    alternateName: SITE.alternateName,
    slogan: SITE.slogan,
    description:
      "Zertifizierter Kfz-Gutachter in Ingolstadt: Schadengutachten (Unfallgutachten), Oldtimerbewertung, Leasingrücknahmebewertung, Fahrzeugverwertung, Kostenvoranschlag und Kaufberatung.",
    url: `${SITE.url}/`,
    image: `${SITE.url}/assets/img/kfz-gutachter-ingolstadt-ismayil-bas-1086.jpg`,
    logo: `${SITE.url}/assets/img/gutachter-bas-logo.png`,
    telephone: CONTACT.phoneSchema,
    email: CONTACT.email,
    founder: { "@type": "Person", name: OWNER.name, jobTitle: OWNER.jobTitle },
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.street,
      postalCode: CONTACT.postalCode,
      addressLocality: CONTACT.city,
      addressRegion: CONTACT.region,
      addressCountry: CONTACT.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: CONTACT.geo.lat, longitude: CONTACT.geo.lng },
    hasMap: CONTACT.mapsUrl,
    openingHours: `Mo-Fr ${HOURS.office.opens}-${HOURS.office.closes}`,
    areaServed: AREA.map((name) => ({ "@type": "City", name })),
    audience: AUDIENCES.map((a) => ({ "@type": "Audience", audienceType: a })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: HOURS.schemaDays,
        opens: HOURS.office.opens,
        closes: HOURS.office.closes,
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT.phoneSchema,
      email: CONTACT.email,
      contactType: "customer service",
      areaServed: "DE",
      availableLanguage: "de",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Kfz-Gutachten und Fahrzeugbewertungen",
      itemListElement: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@id": `${SITE.url}/#${s.slug}` },
      })),
    },
  };
}

function services() {
  return SERVICES.map((s) => ({
    "@type": "Service",
    "@id": `${SITE.url}/#${s.slug}`,
    name: s.alias ? `${s.title} (${s.alias})` : s.title,
    serviceType: s.title,
    description: s.text,
    provider: { "@id": ID },
    areaServed: AREA.map((name) => ({ "@type": "City", name })),
  }));
}

function faqPage() {
  return {
    "@type": "FAQPage",
    "@id": `${SITE.url}/#faq`,
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function website() {
  return {
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: `${SITE.url}/`,
    name: SITE.name,
    inLanguage: "de-DE",
    publisher: { "@id": ID },
  };
}

const wrap = (graph) =>
  `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;

export const homeSchema = () => wrap([website(), business(), ...services(), faqPage()]);

export const legalSchema = (name, path) =>
  wrap([
    {
      "@type": "WebPage",
      "@id": `${SITE.url}${path}`,
      url: `${SITE.url}${path}`,
      name,
      isPartOf: { "@id": `${SITE.url}/#website` },
      inLanguage: "de-DE",
    },
  ]);
