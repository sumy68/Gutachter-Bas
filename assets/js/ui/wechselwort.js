// Wechselwort in der H1 (prüfen → bewerten → dokumentieren → schützen).
// Das erste Wort steht im HTML; der Container hat die Breite des längsten Worts (kein Layout Shift).
const ANZEIGE_MS = 2600;
const AUSBLENDEN_MS = 450;

export function initWechselwort() {
  const wort = document.getElementById("wechsel");
  if (!wort || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const woerter = (wort.dataset.woerter || "").split(",").map((w) => w.trim()).filter(Boolean);
  if (woerter.length < 2) return;
  let index = 0;

  const naechstes = () => {
    if (document.hidden) { setTimeout(naechstes, ANZEIGE_MS); return; }
    wort.classList.add("raus");
    setTimeout(() => {
      index = (index + 1) % woerter.length;
      wort.textContent = woerter[index];
      wort.classList.remove("raus");
      wort.classList.add("rein");
      requestAnimationFrame(() => requestAnimationFrame(() => wort.classList.remove("rein")));
      setTimeout(naechstes, ANZEIGE_MS);
    }, AUSBLENDEN_MS);
  };
  setTimeout(naechstes, ANZEIGE_MS + 600);
}
