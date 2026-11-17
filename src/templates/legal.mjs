// Impressum und Datenschutz – Wortlaut UNVERÄNDERT aus der bisherigen Website übernommen,
// nur ins neue Design gebracht. Kontaktangaben kommen aus site.config.mjs.
import { CONTACT, OWNER } from "../site.config.mjs";
import { esc, head, header, footer, addressLink, V } from "./layout.mjs";
import { legalSchema } from "./schema.mjs";

const tel = () => `<a class="kontaktwert" href="${CONTACT.phoneHref}">${esc(CONTACT.phoneDisplay)}</a>`;
const mail = () => `<a class="kontaktwert" href="mailto:${CONTACT.email}">${esc(CONTACT.email)}</a>`;
const adresse = (land = true) =>
  `${esc(CONTACT.street)}<br><span class="nw">${esc(CONTACT.postalCode)} ${esc(CONTACT.city)}</span>${land ? `<br>${esc(CONTACT.countryName)}` : ""}`;

const block = (titel, inhalt) =>
  `<section class="recht__block">${titel ? `<h2>${titel}</h2>` : ""}${inhalt}</section>`;

function page({ title, description, path, h1, sub, body }) {
  return `${head({ title, description, path, extraHead: legalSchema(h1, path) })}
<body class="unterseite">
${header({ home: false })}
<main id="main" class="recht">
  <div class="wrap recht__wrap">
    <header class="recht__kopf">
      <h1>${h1}</h1>
      <p>${sub}</p>
    </header>
    ${body}
    <p class="recht__zurueck"><a class="btn btn--rahmen" href="/">Zurück zur Startseite</a></p>
  </div>
</main>
${footer({ home: false })}
<script type="module" src="/assets/js/unterseite.js?v=${V}"></script>
</body>
</html>
`;
}

export function renderImpressum() {
  const body = [
    block("Kontaktdaten", `<p><strong>${esc(OWNER.name)}</strong></p><p>${addressLink()}<br>${esc(CONTACT.countryName)}</p>
      <p><strong>Telefon:</strong> ${tel()}</p>
      <p><strong>E-Mail:</strong> ${mail()}</p>`),
    `<!--
      HINWEIS: Diesen Block nur einfügen, wenn eine USt-IdNr. vorhanden ist.
      Kleinunternehmer (§19 UStG) ohne USt-IdNr.: kompletten Block entfernen.
      Die Steuernummer NICHT angeben (kein gesetzliches Muss, Phishing-Risiko).
    -->`,
    block("Umsatzsteuer-ID", `<p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:</p><p><strong>folgt</strong></p>`),
    block("Berufsbezeichnung und Qualifikation", `<p><strong>Berufsbezeichnung:</strong> Sachverständiger für Schäden an Kraftfahrzeugen und Wertermittlung</p>
      <p><strong>Zertifizierung:</strong> DESAG – Deutsche Sachverständigen Gesellschaft mbH</p>
      <p class="recht__klein">Verliehen in der Bundesrepublik Deutschland.</p>`),
    block("Verantwortlich i.S.d. § 18 Abs. 2 MStV", `<p>${esc(OWNER.name)}<br>${adresse(false)}</p>`),
    block("Verbraucherstreitbeilegung", `<p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>`),
    block("Haftung für Inhalte", `<p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
      <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>`),
    block("Haftung für Links", `<p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.</p>
      <p>Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>`),
    block("Urheberrecht", `<p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
      <p>Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>`),
    `<p class="recht__stand">Stand: Juni 2026</p>`,
  ].join("\n    ");

  return page({
    title: "Impressum – Gutachter BAS | KFZ-Gutachter Ingolstadt",
    description: "Impressum und rechtliche Informationen von Gutachter BAS - Ihr KFZ-Sachverständiger in Ingolstadt",
    path: "/impressum",
    h1: "Impressum",
    sub: "Angaben gemäß § 5 DDG",
    body,
  });
}

export function renderDatenschutz() {
  const body = [
    block("", `<p>Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TDDDG, DDG). In diesen Datenschutzinformationen informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website.</p>`),
    block("Verantwortliche Stelle", `<p><strong>${esc(OWNER.name)}</strong></p><p>${addressLink()}<br>${esc(CONTACT.countryName)}</p>
      <p><strong>E-Mail:</strong> ${mail()}</p>
      <p><strong>Telefon:</strong> ${tel()}</p>`),

    block("Kontakt mit uns", `<p>Wenn Sie per Formular auf der Website oder per E-Mail Kontakt mit uns aufnehmen, werden Ihre angegebenen Daten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen sechs Monate bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>`),
    `<!-- Hinweis: Sobald ein Formular-Dienst (Auftragsverarbeiter) für den Versand oder Foto-Upload genutzt wird,
         muss dieser Abschnitt angepasst und der Dienst hier genannt werden. -->`,
    block("Kontaktformular", `<p>Das Kontaktformular auf dieser Website überträgt keine Daten an unseren Server oder an Dritte und nutzt keinen Formular-Dienst. Beim Absenden öffnet sich lediglich eine vorbereitete E-Mail in Ihrem eigenen E-Mail-Programm. Erst wenn Sie diese E-Mail selbst absenden, erhalten wir Ihre Angaben.</p>
      <p>Fotos, die Sie im Formular auswählen, werden nicht hochgeladen. Sie können diese bei Bedarf selbst als Anhang zu Ihrer E-Mail hinzufügen. Für die Verarbeitung Ihrer E-Mail gelten die Angaben unter „Kontakt mit uns".</p>`),
    block("Cookies", `<p>Unsere Website setzt keine eigenen Cookies und verwendet keine einwilligungspflichtigen Cookies für Analyse, Tracking oder Marketing.</p>
      <p>Sie können Ihren Browser generell so einstellen, dass er Sie über das Setzen von Cookies informiert und Cookies nur im Einzelfall erlaubt oder grundsätzlich ablehnt. Die Funktionsfähigkeit dieser Website bleibt davon unberührt.</p>`),
    block("Google Maps, Schriftarten und eingebundene Inhalte", `<p>Für die Anfahrt verlinken wir auf Google Maps. Es handelt sich um einen einfachen Link; Google Maps ist nicht in diese Website eingebunden. Erst wenn Sie den Link anklicken, verlassen Sie unsere Website und gelangen zu Google. Dort gelten die Datenschutzbestimmungen von Google.</p>
      <p>Diese Website bindet keine Inhalte von Drittanbietern ein, etwa Videos, Karten oder Schriftarten externer Dienste. Schriftarten und Skripte werden selbst gehostet und zusammen mit der Website vom Hosting-Anbieter ausgeliefert; dabei werden keine Daten an weitere Anbieter übermittelt.</p>`),
    block("Hosting und Server-Logfiles", `<p>Diese Website wird bei GitHub Pages (GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA) gehostet. Beim Aufruf der Seite werden durch den Hosting-Anbieter automatisch Informationen in sogenannten Server-Logfiles erfasst, die Ihr Browser übermittelt (z. B. IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite).</p>
      <p>Diese Daten dienen ausschließlich der technischen Bereitstellung und Sicherheit der Website und werden nicht mit anderen Datenquellen zusammengeführt. Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und stabilen Darstellung der Website (Art. 6 Abs. 1 lit. f DSGVO).</p>
      <p>Diese Website nutzt keine Analyse- oder Tracking-Dienste (z. B. Google Analytics) und setzt keine Marketing- oder Statistik-Cookies.</p>`),
    block("Ihre Rechte", `<p>Ihnen stehen grundsätzlich die folgenden Rechte zu:</p>
      <ul>
        <li>Recht auf Auskunft über Ihre gespeicherten Daten</li>
        <li>Recht auf Berichtigung unrichtiger Daten</li>
        <li>Recht auf Löschung Ihrer Daten</li>
        <li>Recht auf Einschränkung der Verarbeitung</li>
        <li>Recht auf Datenübertragbarkeit</li>
        <li>Widerrufsrecht bei erteilten Einwilligungen</li>
        <li>Widerspruchsrecht gegen die Datenverarbeitung</li>
      </ul>
      <p>Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt oder Ihre datenschutzrechtlichen Ansprüche sonst in einer Weise verletzt worden sind, können Sie sich bei der Aufsichtsbehörde beschweren.</p>`),
    block("SSL-Verschlüsselung", `<p>Diese Seite nutzt aus Gründen der Sicherheit und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel der Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL-Verschlüsselung.</p>
      <p>Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.</p>`),
    block("Auskunft, Löschung, Sperrung", `<p>Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten.</p>
      <p>Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.</p>`),
    `<p class="recht__stand">Stand: November 2026</p>`,
  ].join("\n    ");

  return page({
    title: "Datenschutz – Gutachter BAS | KFZ-Gutachter Ingolstadt",
    description: "Datenschutzerklärung von Gutachter BAS - Informationen zum Schutz Ihrer persönlichen Daten",
    path: "/datenschutz",
    h1: "Datenschutzerklärung",
    sub: "Informationen zum Schutz Ihrer persönlichen Daten",
    body,
  });
}
