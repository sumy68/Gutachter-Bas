// Impressum / Datenschutz: nur Navigation (kein GSAP, kein three.js).
import { initNavigation } from "./ui/navigation.js";

try { initNavigation(); } catch (err) { console.error("[unterseite] Navigation konnte nicht starten", err); }
