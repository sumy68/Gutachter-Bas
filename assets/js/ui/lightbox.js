// Barrierefreie Lightbox für die Zertifikate (natives <dialog>):
// Schließen per X, Escape oder Klick außerhalb; Pfeiltasten und Pfeil-Buttons zum Blättern.
const MAX_SKALIERUNG = 1.6; // Quellbilder sind klein – nicht stärker vergrößern als nötig

export function initLightbox(getLenis = () => null) {
  const dialog = document.getElementById("lightbox");
  const daten = document.getElementById("zert-daten");
  if (!dialog || !daten || typeof dialog.showModal !== "function") return;

  let liste;
  try { liste = JSON.parse(daten.textContent); } catch (e) { console.warn("[lightbox] Daten fehlerhaft", e); return; }
  const bild = dialog.querySelector(".lightbox__bild");
  const titel = dialog.querySelector(".lightbox__titel");
  const detail = dialog.querySelector(".lightbox__detail");
  const zahl = dialog.querySelector(".lightbox__zahl");
  let aktiv = 0, ausloeser = null;

  const zeige = (n) => {
    aktiv = (n + liste.length) % liste.length;
    const z = liste[aktiv];
    bild.src = z.src;
    bild.width = z.w; bild.height = z.h;
    bild.alt = z.alt;
    bild.style.setProperty("--bw", `${Math.round(z.w * MAX_SKALIERUNG)}px`);
    titel.textContent = z.title;
    detail.textContent = z.detail;
    zahl.textContent = `${aktiv + 1} / ${liste.length}`;
  };

  document.querySelectorAll("[data-zert]").forEach((knopf) => {
    knopf.addEventListener("click", () => {
      ausloeser = knopf;
      zeige(Number(knopf.dataset.zert));
      dialog.showModal();
      getLenis()?.stop();
      dialog.querySelector(".lightbox__zu").focus();
    });
  });

  dialog.querySelector(".lightbox__zu").addEventListener("click", () => dialog.close());
  dialog.querySelector(".lightbox__pfeil--vor").addEventListener("click", () => zeige(aktiv + 1));
  dialog.querySelector(".lightbox__pfeil--zurueck").addEventListener("click", () => zeige(aktiv - 1));
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); zeige(aktiv + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); zeige(aktiv - 1); }
  });
  // Klick außerhalb von Bild und Bedienelementen schließt
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.classList.contains("lightbox__innen")) dialog.close();
  });
  dialog.addEventListener("close", () => {
    getLenis()?.start();
    ausloeser?.focus();
  });
}
