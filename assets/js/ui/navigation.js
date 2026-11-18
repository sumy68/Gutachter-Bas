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
  const ruhig = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const offen = () => burger?.getAttribute("aria-expanded") === "true";
  let schliessUhr = 0;

  const schliessen = (fokusZurueck = false) => {
    if (!burger || !offen()) return;
    hintergrund().forEach((el) => el.removeAttribute("inert"));
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    menue.classList.remove("ist-offen");
    kopf.classList.remove("menue-aktiv");
    document.documentElement.classList.remove("menue-offen");
    document.body.classList.remove("menue-offen");
    clearTimeout(schliessUhr);
    schliessUhr = setTimeout(() => { if (!offen()) menue.hidden = true; }, ruhig() ? 0 : 320);
    getLenis()?.start();
    if (fokusZurueck) burger.focus();
  };
  const oeffnen = () => {
    clearTimeout(schliessUhr);
    hintergrund().forEach((el) => el.setAttribute("inert", ""));
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Menü schließen");
    menue.hidden = false;
    kopf.classList.add("menue-aktiv");
    document.documentElement.classList.add("menue-offen");
    document.body.classList.add("menue-offen");
    getLenis()?.stop();
    // Erst nach dem Einblenden der Ebene die Klasse setzen, damit die Übergänge starten
    requestAnimationFrame(() => requestAnimationFrame(() => menue.classList.add("ist-offen")));
    menue.querySelector("a")?.focus({ preventScroll: true });
  };
  burger?.addEventListener("click", () => (offen() ? schliessen(true) : oeffnen()));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && offen()) { schliessen(true); return; }
    // Fokus-Falle: Tab bleibt zwischen Burger (X) und den Menü-Elementen
    if (e.key === "Tab" && offen()) {
      const ziele = [burger, ...menue.querySelectorAll("a[href], button")];
      const i = ziele.indexOf(document.activeElement);
      const naechstes = e.shiftKey ? (i <= 0 ? ziele.length - 1 : i - 1) : (i === -1 || i === ziele.length - 1 ? 0 : i + 1);
      e.preventDefault();
      ziele[naechstes].focus();
    }
  });
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
