/* Gutachter BAS – Partikel-Hintergrund (three.js r149, lokal unter /assets/vendor/three.min.js).
   Abschnitte mit data-szene bestimmen die Form: 0 Auto, 1 Scan, 2 Siegel, 3 Gutachten-Blatt.
   data-pos / data-pos-m = "x,y,Größe,Deckkraft" (Desktop / Mobil).

   Performance (gleiches Vorgehen wie smyagency):
   - Mit echter GPU: Start direkt nach dem ersten Paint + kurzem Leerlauf-Slot; three.js wird schon im <head>
     (Inline-GPU-Prüfung) mit niedriger Priorität vorgeladen, das Szenen-Modul per modulepreload.
   - Ohne echte GPU (Software-Rendering): vorgerendertes Standbild, three.js wird nicht geladen.
   - Init in kleinen Häppchen (scheduler.yield, Fallback setTimeout) statt eines langen Tasks.
   - Pixeldichte bis 2 nur mit echter GPU; Partikelanzahl an die Bildschirmfläche gekoppelt.
   - Ohne GPU (Software-Rendering), bei „Bewegung reduzieren" oder sehr schwachen Geräten: Standbild.
     Ohne WebGL oder nur mit Software-Rendering: vorgerendertes Bild (.buehne-standbild).
   - Adaptive Reduktion erst, wenn die Bildrate mehrere Sekunden am Stück unter 40 fps liegt.
   - Pause bei verstecktem Tab. Keine Layout-Abfragen im Loop (ScrollTrigger cached die Positionen). */
import { zufall, bauAuto, bauScan, bauSiegel, bauBlatt, schadenIndex, istStrahl } from "./partikel-formen.js";

const THREE_URL = "/assets/vendor/three.min.js";
const MAX_DPR = 2;
const N_MAX = 22000, N_MIN = 7000, REF_FLAECHE = 1920 * 1080;
const SW_N_FAKTOR = 0.5, SW_N_MIN = 4000;
const ADAPT_FENSTER_MS = 2000, ADAPT_SCHLECHTE_FENSTER = 2, ADAPT_ZIEL_FPS = 40, ADAPT_STATISCH_FPS = 17;
const ADAPT_AUFWAERMEN_MS = 2500, ADAPT_SCHRITT = 0.75, ADAPT_MIN_ANTEIL = 0.35;
const RESIZE_DEBOUNCE_MS = 150;
const SCAN_ZYKLUS_S = 5.5;

const html = document.documentElement;
let canvas = document.getElementById("buehne");
const params = new URLSearchParams(location.search);
const standbildModus = params.has("standbild");

const ohneWebGL = (grund, fehler) => {
  html.classList.add("ohne-webgl");
  if (fehler) console.warn(`[partikel] ${grund}`, fehler);
};

const pause = () =>
  window.scheduler && typeof window.scheduler.yield === "function"
    ? window.scheduler.yield()
    : new Promise((r) => setTimeout(r, 0));
const imLeerlauf = (fn, timeout = 1500) =>
  "requestIdleCallback" in window ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200);

// Früher Start: direkt nach dem ersten Paint (zwei rAF) plus kurzer Leerlauf-Slot – nicht erst nach
// window.load. H1, Text und Buttons sind dann schon gezeichnet; three.js ist per <link rel="preload"> vorgeladen.
const START_LEERLAUF_MS = 150;
// Safari kennt kein requestIdleCallback: für den Start dort nur einen Frame warten statt 200 ms
function nachErstemPaint(fn) {
  const slot = () => ("requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: START_LEERLAUF_MS }) : setTimeout(fn, 16));
  requestAnimationFrame(() => requestAnimationFrame(slot));
}

function threeLaden() {
  return new Promise((ok, fehler) => {
    if (window.THREE) return ok();
    const s = document.createElement("script");
    s.src = THREE_URL;
    s.async = true;
    s.onload = ok;
    s.onerror = () => fehler(new Error("three.js konnte nicht geladen werden"));
    document.head.appendChild(s);
  });
}

function istSoftwareRenderer(r) {
  try {
    const gl = r.getContext();
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}
const schwachesGeraet = () =>
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 2);

const leseLage = (el, mobil) => {
  const roh = (mobil ? el.dataset.posM : el.dataset.pos) || "0,0,1,1";
  const [x, y, s, op] = roh.split(",").map(Number);
  return { x, y, s, op };
};

// WebGL vorab mit einem Wegwerf-Canvas prüfen: ohne Kontext wird three.js (600 KB) gar nicht geladen.
// Liefert zusätzlich, ob nur Software-Rendering (keine echte GPU) zur Verfügung steht.
function webglPruefen() {
  if (!("WebGLRenderingContext" in window)) return { ok: false };
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl", { failIfMajorPerformanceCaveat: false }) || c.getContext("experimental-webgl");
    if (!gl) return { ok: false };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, software: /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name) };
  } catch {
    return { ok: false };
  }
}

// Ergebnis der frühen GPU-Prüfung aus dem <head> übernehmen (sonst hier prüfen)
const webgl = canvas ? (window.__basWebgl || webglPruefen()) : { ok: false };
if (canvas) {
  if (!webgl.ok) ohneWebGL("WebGL nicht verfügbar");
  else if (webgl.software) {
    // Ohne echte GPU: hochwertiges vorgerendertes Standbild, three.js wird gar nicht geladen
    ohneWebGL("Software-Rendering");
    performance.mark("partikel-standbild");
  } else {
    nachErstemPaint(() => threeLaden().then(start).catch((e) => { canvas.style.display = "none"; ohneWebGL("Start fehlgeschlagen", e); }));
  }
}

async function start() {
  const THREE = window.THREE;
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const neuerRenderer = (aa) =>
    new THREE.WebGLRenderer({ canvas, antialias: aa, alpha: true, powerPreference: "high-performance" });

  let renderer;
  try { renderer = neuerRenderer(false); } catch (e) { canvas.style.display = "none"; ohneWebGL("WebGL nicht verfügbar", e); return; }
  const softwareGL = istSoftwareRenderer(renderer);
  let statisch = ruhig || softwareGL || standbildModus || schwachesGeraet();
  if (!softwareGL) {
    // Echte GPU: frischer Kontext mit Antialiasing (Kontext-Attribute sind nachträglich fix)
    await pause();
    renderer.forceContextLoss(); // ersten Kontext wirklich freigeben
    renderer.dispose();
    const frisch = canvas.cloneNode(false);
    canvas.replaceWith(frisch);
    canvas = frisch;
    try { renderer = neuerRenderer(true); } catch (e) { canvas.style.display = "none"; ohneWebGL("WebGL nicht verfügbar", e); return; }
  }
  const pixeldichte = () => (softwareGL ? 1 : Math.min(devicePixelRatio || 1, MAX_DPR));
  renderer.setPixelRatio(pixeldichte());
  await pause();

  let vw = innerWidth, vh = innerHeight;
  // Hochformat (Handy, Tablet hochkant) nutzt die mobilen Lagen
  const istHochformat = () => innerWidth < 760 || innerHeight > innerWidth;
  const nVoll = Math.round(Math.min(N_MAX, Math.max(N_MIN, ((vw * vh) / REF_FLAECHE) * N_MAX)));
  const N = softwareGL ? Math.max(SW_N_MIN, Math.round(nVoll * SW_N_FAKTOR)) : nVoll;
  const dichteAusgleich = (n) => (softwareGL ? Math.sqrt(Math.max(1, nVoll / n)) : 1);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  cam.position.set(0, 0, 11);

  // Zufällige Slot-Reihenfolge: jeder Anfangsbereich (drawRange) ist eine gleichmäßige Stichprobe
  const { rnd, gauss } = zufall(7);
  const slot = new Uint32Array(N);
  for (let i = 0; i < N; i++) slot[i] = i;
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = slot[i]; slot[i] = slot[j]; slot[j] = t; }
  const form = (fn) => {
    const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const p = fn(i), k = slot[i] * 3; a[k] = p[0]; a[k + 1] = p[1]; a[k + 2] = p[2]; }
    return a;
  };

  const bauer = [() => form(bauAuto(N)), () => form(bauScan(N)), () => form(bauSiegel(N)), () => form(bauBlatt(N))];
  const formen = new Array(bauer.length);
  const holeForm = (k) => formen[k] || (formen[k] = bauer[k]());
  const auto = holeForm(0);
  await pause();
  (function weiter(k) { if (k >= bauer.length) return; imLeerlauf(() => { holeForm(k); weiter(k + 1); }, 3000); })(1);

  // Attribute
  const pos = new Float32Array(N * 3); pos.set(auto);
  const farbe = new Float32Array(N * 3), groesse = new Float32Array(N), phase = new Float32Array(N);
  const schaden = new Float32Array(N), strahl = new Float32Array(N);
  const gold = new THREE.Color(0xc9a55c), hell = new THREE.Color(0xe3c98b), tief = new THREE.Color(0xb08a3e), glanz = new THREE.Color(0xfff1cf);
  for (let i = 0; i < N; i++) {
    const r = rnd(), c = r < 0.06 ? glanz : r < 0.4 ? hell : r < 0.8 ? gold : tief;
    farbe[i * 3] = c.r; farbe[i * 3 + 1] = c.g; farbe[i * 3 + 2] = c.b;
    groesse[i] = (rnd() < 0.02 ? 2.0 : 1) * (0.55 + rnd() * 0.55);
    phase[i] = rnd() * 6.283;
  }
  for (let i = 0; i < N; i++) { schaden[slot[i]] = schadenIndex(i, N); strahl[slot[i]] = istStrahl(i, N); }
  await pause();

  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", posAttr);
  geo.setAttribute("farbe", new THREE.BufferAttribute(farbe, 3));
  geo.setAttribute("groesse", new THREE.BufferAttribute(groesse, 1));
  geo.setAttribute("phase", new THREE.BufferAttribute(phase, 1));
  geo.setAttribute("schaden", new THREE.BufferAttribute(schaden, 1));
  geo.setAttribute("strahl", new THREE.BufferAttribute(strahl, 1));
  let aktivN = N;
  geo.setDrawRange(0, aktivN);

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uZeit: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uDichte: { value: dichteAusgleich(aktivN) },
      uAlpha: { value: 1 }, uScan: { value: 9 }, uScanMix: { value: 0 },
    },
    vertexShader: `
      attribute vec3 farbe; attribute float groesse, phase, schaden, strahl;
      uniform float uZeit, uPx, uDichte, uScan, uScanMix;
      varying vec3 vF; varying float vA;
      void main(){
        vec3 p = position;
        float s = strahl * uScanMix;
        p.x += s * uScan;
        p += 0.014 * vec3(sin(uZeit*0.9+phase), cos(uZeit*0.7+phase*1.3), sin(uZeit*0.8+phase*0.7)) * (1.0 - s);
        float band = uScanMix * (1.0 - smoothstep(0.0, 0.32, abs(position.x - uScan))) * (1.0 - s);
        float lit = uScanMix * step(0.5, schaden) * step(position.x, uScan - 0.05);
        float puls = 0.75 + 0.25 * sin(uZeit * 5.0 + phase);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float gr = groesse * (1.0 + 1.5 * lit * puls + 0.9 * band + 0.25 * s);
        gl_PointSize = gr * uDichte * uPx * (30.0 / -mv.z);
        vF = mix(farbe, vec3(1.0, 0.94, 0.78), clamp(band * 0.9 + lit * 0.85 + s * 0.6, 0.0, 1.0));
        float sicht = 1.0 - smoothstep(3.1, 3.5, abs(uScan));
        vA = mix(0.68 + 0.32 * sin(uZeit * 1.6 + phase), 1.0, max(lit, band));
        vA *= mix(1.0, sicht * 1.4, s);
      }`,
    fragmentShader: `
      uniform float uAlpha; varying vec3 vF; varying float vA;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        float a = smoothstep(0.5, 0.0, d); a = a * a * 1.15;
        gl_FragColor = vec4(vF, a * vA * uAlpha);
      }`,
  });
  const punkte = new THREE.Points(geo, mat);
  const gruppe = new THREE.Group();
  gruppe.add(punkte);
  scene.add(gruppe);
  await pause();
  renderer.compile(scene, cam);
  await pause();

  // ---------- Szenen und ScrollTrigger ----------
  const abschnitte = [...document.querySelectorAll("[data-szene]")];
  const szene = abschnitte.map((el) => +el.dataset.szene);
  let lagen = abschnitte.map((el) => leseLage(el, istHochformat()));
  const fortschritt = new Float32Array(Math.max(0, abschnitte.length - 1));
  let vonI = 0, nachI = 0, mischZiel = 0, misch = 0;

  function zustand() {
    let k = -1;
    for (let i = 0; i < fortschritt.length; i++) if (fortschritt[i] > 0) k = i;
    if (k < 0) { vonI = nachI = 0; mischZiel = 0; return; }
    const f = fortschritt[k];
    vonI = k; nachI = k + 1; mischZiel = f * f * (3 - 2 * f);
  }

  // ---------- Maus: dezente Neigung ----------
  let mzx = 0, mzy = 0, mx = 0, my = 0;
  if (matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", (e) => { mzx = (e.clientX / vw) * 2 - 1; mzy = -((e.clientY / vh) * 2 - 1); }, { passive: true });
  }

  function groesseSetzen() {
    vw = innerWidth; vh = innerHeight;
    renderer.setPixelRatio(pixeldichte());
    mat.uniforms.uPx.value = renderer.getPixelRatio();
    renderer.setSize(vw, vh, false);
    cam.aspect = vw / vh;
    cam.updateProjectionMatrix();
    lagen = abschnitte.map((el) => leseLage(el, istHochformat()));
  }
  let resizeUhr = 0;
  addEventListener("resize", () => { clearTimeout(resizeUhr); resizeUhr = setTimeout(() => { groesseSetzen(); anstossen(); }, RESIZE_DEBOUNCE_MS); }, { passive: true });
  groesseSetzen();
  await pause();

  const akt = { ...lagen[0] };
  let zeit = 0, t0 = performance.now(), letzteVon = -1, letzteNach = -1, letzteMisch = -1;
  let intro = statisch ? 1 : 0;
  const startWolke = statisch ? null : form(() => [gauss() * 9, gauss() * 6, gauss() * 6]);

  // ---------- Adaptive Qualität ----------
  let fensterStart = 0, fensterFrames = 0, schlechteFenster = 0, adaptAb = performance.now() + ADAPT_AUFWAERMEN_MS;
  function qualitaetPruefen(now) {
    if (now < adaptAb) return;
    if (!fensterStart) { fensterStart = now; fensterFrames = 0; return; }
    fensterFrames++;
    const dauer = now - fensterStart;
    if (dauer < ADAPT_FENSTER_MS) return;
    const fps = (fensterFrames * 1000) / dauer;
    fensterStart = now; fensterFrames = 0;
    if (fps >= ADAPT_ZIEL_FPS) { schlechteFenster = 0; return; }
    if (++schlechteFenster < ADAPT_SCHLECHTE_FENSTER) return;
    schlechteFenster = 0;
    const minimum = Math.ceil(N * ADAPT_MIN_ANTEIL);
    if (aktivN <= minimum) { if (fps < ADAPT_STATISCH_FPS) { statisch = true; intro = 1; } return; }
    aktivN = Math.max(minimum, Math.round(aktivN * ADAPT_SCHRITT));
    geo.setDrawRange(0, aktivN);
    mat.uniforms.uDichte.value = dichteAusgleich(aktivN);
    letzteMisch = -1;
    adaptAb = now + ADAPT_FENSTER_MS;
  }
  const messungZuruecksetzen = () => { fensterStart = 0; fensterFrames = 0; schlechteFenster = 0; };

  // ---------- Zeichnen ----------
  function zeichnen(now) {
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    if (!statisch) zeit += dt;
    const k = statisch ? 1 : 1 - Math.pow(0.03, dt);
    misch += (mischZiel - misch) * k;
    if (intro < 1) intro = Math.min(1, intro + dt * 0.42);
    const ie = 1 - Math.pow(1 - intro, 3);
    const von = szene[vonI], nach = szene[nachI];

    if (intro < 1 || von !== letzteVon || nach !== letzteNach || Math.abs(misch - letzteMisch) > 0.0005) {
      const A = holeForm(von), B = holeForm(nach), ende = aktivN * 3;
      for (let i = 0; i < ende; i++) {
        const v = A[i] + (B[i] - A[i]) * misch;
        pos[i] = intro < 1 ? startWolke[i] + (v - startWolke[i]) * ie : v;
      }
      posAttr.updateRange.offset = 0;
      posAttr.updateRange.count = ende;
      posAttr.needsUpdate = true;
      letzteVon = von; letzteNach = nach; letzteMisch = misch;
    }

    const L1 = lagen[vonI], L2 = lagen[nachI];
    for (const key of ["x", "y", "s", "op"]) { const z = L1[key] + (L2[key] - L1[key]) * misch; akt[key] += (z - akt[key]) * k; }
    gruppe.position.set(akt.x, akt.y, 0);
    gruppe.scale.setScalar(akt.s);

    const gew = (n) => (von === n ? 1 - misch : 0) + (nach === n ? misch : 0);
    const wAuto = gew(0) + gew(1), wFlach = 1 - wAuto, wScan = gew(1);
    mx += (mzx - mx) * 0.06; my += (mzy - my) * 0.06;
    const autoDreh = -0.62 + Math.sin(zeit * 0.16) * 0.42;
    const flachDreh = Math.sin(zeit * 0.3) * 0.16;
    gruppe.rotation.y = autoDreh * wAuto + flachDreh * wFlach + mx * 0.22;
    gruppe.rotation.x = 0.16 * wAuto + 0.04 * wFlach - my * 0.1;

    // Scan-Strahl: läuft in Zyklen von hinten nach vorn; Standbild = Endzustand (alle Schäden erfasst)
    let scan = 3.45;
    if (!statisch) { const t = (zeit % SCAN_ZYKLUS_S) / SCAN_ZYKLUS_S; scan = t < 0.72 ? -3.6 + (t / 0.72) * 7.1 : 9; }
    mat.uniforms.uScan.value = scan;
    mat.uniforms.uScanMix.value = wScan;
    mat.uniforms.uZeit.value = zeit;
    mat.uniforms.uAlpha.value = akt.op;
    renderer.render(scene, cam);
  }

  let rafId = 0;
  function frame(now) {
    rafId = 0;
    zeichnen(now);
    if (!statisch) qualitaetPruefen(now);
    if (!statisch && !document.hidden) rafId = requestAnimationFrame(frame);
    else if (statisch && Math.abs(mischZiel - misch) > 0.001) rafId = requestAnimationFrame(frame);
  }
  function anstossen() {
    if (rafId || document.hidden) return;
    t0 = performance.now();
    messungZuruecksetzen();
    rafId = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }
    else anstossen();
  });

  // ScrollTrigger erst jetzt anlegen: Callbacks können synchron feuern und brauchen den Loop.
  const ST = window.ScrollTrigger;
  if (ST && abschnitte.length > 1) {
    fortschritt.forEach((_, i) => {
      ST.create({
        trigger: abschnitte[i + 1], start: "top 88%", end: "top 30%",
        onUpdate: (self) => { fortschritt[i] = self.progress; zustand(); anstossen(); },
        onRefresh: (self) => { fortschritt[i] = self.progress; zustand(); anstossen(); },
      });
    });
    ST.refresh();
  }
  zustand();
  misch = mischZiel;
  for (const key of ["x", "y", "s", "op"]) akt[key] = lagen[vonI][key] + (lagen[nachI][key] - lagen[vonI][key]) * misch;

  // Standbild: ohne Einblend-Übergang (bei Software-Rendering kostet jeder Compositing-Frame einen Readback)
  if (statisch) html.classList.add("partikel-statisch");
  // Kontextverlust (z. B. iOS im Hintergrund, Speicherdruck): auf das vorgerenderte Standbild wechseln
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    statisch = true;
    canvas.style.display = "none";
    html.classList.add("ohne-webgl");
  });

  html.classList.add("partikel-bereit");
  performance.mark(statisch ? "partikel-standbild" : "partikel-einflug"); // Messpunkt: Start der Einflug-Animation
  anstossen();
}
