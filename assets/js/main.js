// Startseite: Einstieg. GSAP, ScrollTrigger, SplitText und Lenis sind lokal per defer geladen.
import { initMotion } from "./ui/motion.js";
import { initNavigation } from "./ui/navigation.js";
import { initWechselwort } from "./ui/wechselwort.js";
import { initSlider } from "./ui/slider.js";
import { initLightbox } from "./ui/lightbox.js";

let lenis = null;
const getLenis = () => lenis;

const schritte = [
  ["Navigation", () => initNavigation(getLenis)],
  ["Wechselwort", initWechselwort],
  ["Slider", initSlider],
  ["Lightbox", () => initLightbox(getLenis)],
  ["Motion", () => { lenis = initMotion(); }],
];

for (const [name, fn] of schritte) {
  try { fn(); } catch (err) { console.error(`[main] ${name} konnte nicht starten`, err); }
}
