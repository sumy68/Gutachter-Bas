// Kontaktformular mit Validierung und optionalem Foto-Upload.
// Mit data-endpoint: Versand per fetch (multipart). Ohne Endpoint (GitHub Pages ohne Backend):
// vorbereitete E-Mail an data-mail – Fotos werden dann im E-Mail-Programm angehängt.

const MELDUNG = {
  pflicht: "Bitte ausfüllen.",
  email: "Bitte eine gültige E-Mail-Adresse eingeben, z. B. name@beispiel.de.",
  telefon: "Bitte eine Telefonnummer mit mindestens 6 Ziffern eingeben.",
  zuViele: (n) => `Bitte höchstens ${n} Fotos auswählen.`,
  zuGross: (name, mb) => `„${name}" ist größer als ${mb} MB. Bitte ein kleineres Foto wählen.`,
  keinBild: (name) => `„${name}" ist kein Bild. Erlaubt sind Fotos (JPG, PNG, HEIC …).`,
};

const BILD_ENDUNG = /\.(jpe?g|png|webp|heic|heif|avif|gif)$/i;
const MAILTO_MAX_TEXT = 1500; // längere Texte kürzen manche Mailprogramme stillschweigend
const SENDE_TIMEOUT_MS = 30000;

function fehlerSetzen(feld, text) {
  const wrap = feld.closest(".feld");
  let el = wrap.querySelector(".feld__fehler");
  const id = `${feld.id}-fehler`;
  const tokens = (feld.getAttribute("aria-describedby") || "").split(/\s+/).filter((t) => t && t !== id);
  if (!text) {
    feld.removeAttribute("aria-invalid");
    el?.remove();
    if (tokens.length) feld.setAttribute("aria-describedby", tokens.join(" ")); else feld.removeAttribute("aria-describedby");
    return;
  }
  if (!el) {
    el = document.createElement("p");
    el.className = "feld__fehler";
    el.id = id;
    wrap.appendChild(el);
  }
  el.textContent = text;
  feld.setAttribute("aria-invalid", "true");
  feld.setAttribute("aria-describedby", [...tokens, id].join(" "));
}

function pruefeFeld(feld) {
  const wert = feld.value.trim();
  if (feld.required && !wert) return MELDUNG.pflicht;
  if (feld.type === "email" && wert && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert)) return MELDUNG.email;
  if (feld.type === "tel" && wert && (wert.match(/\d/g) || []).length < 6) return MELDUNG.telefon;
  return "";
}

function pruefeDateien(input, maxDateien, maxMb) {
  const dateien = [...input.files];
  if (dateien.length > maxDateien) return MELDUNG.zuViele(maxDateien);
  for (const d of dateien) {
    // Manche Browser liefern für HEIC keinen MIME-Typ -> zusätzlich über die Endung prüfen
    const istBild = d.type.startsWith("image/") || (!d.type && BILD_ENDUNG.test(d.name));
    if (!istBild) return MELDUNG.keinBild(d.name);
    if (d.size > maxMb * 1024 * 1024) return MELDUNG.zuGross(d.name, maxMb);
  }
  return "";
}

function mailtoLink(form, mail) {
  const f = new FormData(form);
  const zeilen = [
    `Name: ${f.get("name")}`,
    `Telefon: ${f.get("telefon")}`,
    f.get("email") ? `E-Mail: ${f.get("email")}` : null,
    "",
    String(f.get("anliegen") || "").slice(0, MAILTO_MAX_TEXT),
  ].filter((z) => z !== null);
  const betreff = `Anfrage Kfz-Gutachten – ${f.get("name")}`;
  return `mailto:${mail}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(zeilen.join("\r\n"))}`;
}

export function initFormular() {
  const form = document.getElementById("anfrage");
  if (!form) return;
  const status = form.querySelector(".formular__status");
  const fotos = form.querySelector("#f-fotos");
  const liste = form.querySelector(".datei__liste");
  const knopf = form.querySelector('button[type="submit"]');
  const endpoint = form.dataset.endpoint;
  const mail = form.dataset.mail;
  const maxDateien = Number(form.dataset.maxDateien) || 6;
  const maxMb = Number(form.dataset.maxMb) || 8;
  const felder = [...form.querySelectorAll("input[required], textarea[required], input[type=email]")];

  const meldung = (text, art = "") => { status.textContent = text; status.className = `formular__status ${art}`; };

  // Fehler beim Tippen entfernen, beim Verlassen nur hinzufügen: so verschiebt sich das Layout nicht,
  // während jemand auf „Anfrage senden" klickt (sonst ginge der Klick daneben).
  felder.forEach((feld) => {
    feld.addEventListener("input", () => { if (feld.hasAttribute("aria-invalid") && !pruefeFeld(feld)) fehlerSetzen(feld, ""); });
    feld.addEventListener("blur", () => { const fehler = feld.value ? pruefeFeld(feld) : ""; if (fehler) fehlerSetzen(feld, fehler); });
  });
  fotos.addEventListener("change", () => {
    liste.replaceChildren(...[...fotos.files].map((d) => {
      const li = document.createElement("li");
      li.textContent = `${d.name} (${(d.size / 1048576).toFixed(1)} MB)`;
      return li;
    }));
    fehlerSetzen(fotos, pruefeDateien(fotos, maxDateien, maxMb));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    meldung("");
    let erstesFehlerfeld = null;
    for (const feld of felder) {
      const fehler = pruefeFeld(feld);
      fehlerSetzen(feld, fehler);
      if (fehler && !erstesFehlerfeld) erstesFehlerfeld = feld;
    }
    const dateiFehler = pruefeDateien(fotos, maxDateien, maxMb);
    fehlerSetzen(fotos, dateiFehler);
    if (dateiFehler && !erstesFehlerfeld) erstesFehlerfeld = fotos;
    if (erstesFehlerfeld) { erstesFehlerfeld.focus(); meldung("Bitte die markierten Felder prüfen.", "fehler"); return; }

    // Spam-Falle: unsichtbares Feld ausgefüllt -> stillschweigend „erfolgreich"
    if (form.website.value) { form.reset(); meldung("Danke – Ihre Anfrage ist angekommen.", "ok"); return; }

    if (!endpoint) {
      window.location.href = mailtoLink(form, mail);
      meldung(fotos.files.length
        ? `Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Anfrage. Bitte hängen Sie die Fotos dort an. Falls sich nichts öffnet: ${mail}`
        : `Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Anfrage. Falls sich nichts öffnet: ${mail}`, "ok");
      return;
    }

    knopf.disabled = true;
    meldung("Anfrage wird gesendet …");
    try {
      const antwort = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" }, signal: AbortSignal.timeout(SENDE_TIMEOUT_MS) });
      if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
      form.reset();
      liste.replaceChildren();
      meldung("Danke – Ihre Anfrage ist angekommen. Ich melde mich zeitnah.", "ok");
    } catch (err) {
      console.error("[formular] Versand fehlgeschlagen", err);
      meldung(`Senden hat nicht geklappt. Bitte schreiben Sie direkt an ${mail} oder rufen Sie an.`, "fehler");
    } finally {
      knopf.disabled = false;
    }
  });
}
