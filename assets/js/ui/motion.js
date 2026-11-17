// Smooth Scroll (Lenis), Masken-Reveal der Überschriften (SplitText), Einblenden, Zähler, Zertifikate.
// Nur transform/opacity; bei „Bewegung reduzieren" bleibt alles statisch sichtbar.

export function initMotion() {
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || !ScrollTrigger) return null;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  let lenis = null;
  if (!ruhig && Lenis) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  if (ruhig) return lenis;

  // Abschnitte und Textblöcke sanft einblenden
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 90%",
    once: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08, overwrite: true }),
  });
  gsap.set(gsap.utils.toArray("[data-reveal]").filter((el) => el.getBoundingClientRect().top > innerHeight), { opacity: 0 });
  // Tastatur: fokussierte, noch ausgeblendete Elemente sofort zeigen
  document.addEventListener("focusin", (e) => { const el = e.target.closest?.("[data-reveal]"); if (el && getComputedStyle(el).opacity !== "1") gsap.to(el, { opacity: 1, y: 0, duration: 0.3 }); });

  // Überschriften: Zeile für Zeile aus einer Maske
  const splitten = () => {
    if (!SplitText) return;
    document.querySelectorAll("[data-split]").forEach((h) => {
      SplitText.create(h, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 105, duration: 1.05, ease: "power4.out", stagger: 0.1,
            scrollTrigger: { trigger: h, start: "top 88%", once: true },
          }),
      });
    });
  };
  (document.fonts?.ready ?? Promise.resolve()).then(splitten);

  // Zertifikate gleiten nacheinander ein
  const reihe = document.querySelector(".zert-reihe");
  if (reihe) {
    gsap.from(reihe.children, {
      y: 70, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.14,
      scrollTrigger: { trigger: reihe, start: "top 82%", once: true },
    });
  }

  // Zahlen zählen hoch
  document.querySelectorAll(".zaehler").forEach((el) => {
    const ziel = Number(el.dataset.ziel) || 0;
    const zustand = { v: 0 };
    gsap.to(zustand, {
      v: ziel, duration: 1.6, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onStart: () => { el.textContent = "0"; },
      onUpdate: () => { el.textContent = String(Math.round(zustand.v)); },
    });
  });

  // Neu vermessen, wenn sich Höhen ändern (Schriften, FAQ)
  document.querySelectorAll("details").forEach((d) => d.addEventListener("toggle", () => ScrollTrigger.refresh()));
  addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  return lenis;
}
