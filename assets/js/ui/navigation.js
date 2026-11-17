// Header-Zustand beim Scrollen, Burger-Menü (mobil) und Ankernavigation (mit Lenis, falls aktiv).

export function initNavigation(getLenis = () => null) {
  const kopf = document.getElementById("kopf");
  const burger = kopf?.querySelector(".burger");
  const menue = document.getElementById("menue");
  if (!kopf) return;

  // Header-Hintergrund ab etwas Scrollweg – pro Frame gebündelt, liest nur scrollY
  let geplant = false;
  const pruefen = () => { geplant = false; kopf.classList.toggle("ist-gescrollt", scrollY > 24); };
  addEventListener("scroll", () => { if (!geplant) { geplant = true; requestAnimationFrame(pruefen); } }, { passive: true });
  pruefen();

  const hintergrund = () => document.querySelectorAll("main, footer");
  const schliessen = (fokusZurueck = false) => {
    if (!burger || burger.getAttribute("aria-expanded") !== "true") return;
    hintergrund().forEach((el) => el.removeAttribute("inert"));
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    menue.hidden = true;
    document.body.classList.remove("menue-offen");
    getLenis()?.start();
    if (fokusZurueck) burger.focus();
  };
  const oeffnen = () => {
    hintergrund().forEach((el) => el.setAttribute("inert", ""));
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Menü schließen");
    menue.hidden = false;
    document.body.classList.add("menue-offen");
    getLenis()?.stop();
    menue.querySelector("a")?.focus();
  };
  burger?.addEventListener("click", () => (burger.getAttribute("aria-expanded") === "true" ? schliessen(true) : oeffnen()));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") schliessen(true); });
  matchMedia("(min-width: 981px)").addEventListener("change", (e) => { if (e.matches) schliessen(); });

  // Anker innerhalb der Seite
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="#"], a[href^="/#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    const hash = href.startsWith("/#") ? href.slice(1) : href;
    if (hash === "#" || (href.startsWith("/#") && location.pathname !== "/")) return;
    const ziel = document.querySelector(hash);
    if (!ziel) return;
    e.preventDefault();
    schliessen();
    // Abstand zum fixen Header kommt aus CSS scroll-padding-top (Lenis und Browser beachten es)
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(ziel, { duration: 1.2 });
    else ziel.scrollIntoView({ block: "start" });
    history.replaceState(null, "", hash);
    // Fokus für Tastatur- und Screenreader-Nutzer an das Ziel übergeben
    if (!ziel.hasAttribute("tabindex")) ziel.setAttribute("tabindex", "-1");
    ziel.focus({ preventScroll: true });
  });
}
