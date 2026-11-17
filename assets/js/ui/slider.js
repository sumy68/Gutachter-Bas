// Kundenstimmen: eine Bewertung zur Zeit, Pfeile, Pfeiltasten und Wischen. Kein Autoplay.

export function initSlider() {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;
  const folien = [...slider.querySelectorAll(".stimme")];
  const anzeige = slider.querySelector("[data-aktuell]");
  let aktiv = 0;

  const zeige = (n) => {
    aktiv = (n + folien.length) % folien.length;
    folien.forEach((f, i) => {
      const an = i === aktiv;
      f.classList.toggle("ist-aktiv", an);
      f.toggleAttribute("inert", !an);
      if (an) f.removeAttribute("aria-hidden"); else f.setAttribute("aria-hidden", "true");
    });
    if (anzeige) anzeige.textContent = String(aktiv + 1);
  };

  slider.querySelector("[data-vor]")?.addEventListener("click", () => zeige(aktiv + 1));
  slider.querySelector("[data-zurueck]")?.addEventListener("click", () => zeige(aktiv - 1));
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); zeige(aktiv + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); zeige(aktiv - 1); }
  });

  let startX = null;
  const spur = slider.querySelector(".slider__spur");
  spur.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") startX = e.clientX; }, { passive: true });
  spur.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 45) zeige(aktiv + (dx < 0 ? 1 : -1));
  }, { passive: true });
  spur.addEventListener("pointercancel", () => { startX = null; });
}
