/* Partikel-Formen für den Hintergrund (reine Mathematik, kein three.js nötig).
   Jede Form liefert für Punkt i eine Position [x,y,z]. Einheiten: Auto ca. 6 lang.
   0 Auto (3/4-Ansicht entsteht durch Drehung in partikel.js)
   1 Scan: Auto + 4 Schadens-Cluster + Scan-Ebene (Strahl)
   2 Siegel / Prüfzeichen (Kreis mit Häkchen)
   3 Gutachten-Blatt */

export function zufall(start) {
  let seed = start;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = rnd();
    while (!v) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  return { rnd, gauss };
}

// ---------- Geometrie-Helfer ----------
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function chaikin(pts, runden, geschlossen) {
  let p = pts;
  for (let r = 0; r < runden; r++) {
    const n = [];
    const len = geschlossen ? p.length : p.length - 1;
    if (!geschlossen) n.push(p[0]);
    for (let i = 0; i < len; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      n.push([lerp(a[0], b[0], 0.25), lerp(a[1], b[1], 0.25)], [lerp(a[0], b[0], 0.75), lerp(a[1], b[1], 0.75)]);
    }
    if (!geschlossen) n.push(p[p.length - 1]);
    p = n;
  }
  return p;
}

// Polylinie mit gleichmäßiger Abtastung über die Bogenlänge
function linie(pts, geschlossen = false) {
  const seg = [];
  let total = 0;
  const len = geschlossen ? pts.length : pts.length - 1;
  for (let i = 0; i < len; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push([a, b, total, l]);
    total += l;
  }
  return (t) => {
    const d = ((t % 1) + 1) % 1 * total;
    let lo = 0, hi = seg.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (seg[m][2] <= d) lo = m; else hi = m - 1; }
    const [a, b, s, l] = seg[lo];
    const f = l ? (d - s) / l : 0;
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  };
}

function imPolygon(x, y, poly) {
  let drin = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) drin = !drin;
  }
  return drin;
}

function bogen(cx, cy, r, a0, a1, n) {
  const p = [];
  for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return p;
}

// ---------- Auto ----------
const RAD = { vorn: 1.86, hinten: -1.82, r: 0.46, bogen: 0.6, y: 0.46 };
const OBEN = [
  [-2.93, 0.4], [-3.02, 0.64], [-2.99, 0.88], [-2.86, 0.99], [-2.45, 1.05], [-2.02, 1.12],
  [-1.32, 1.5], [-0.52, 1.63], [0.36, 1.62], [0.96, 1.46], [1.46, 1.13], [2.3, 1.0],
  [2.82, 0.9], [3.03, 0.74], [3.07, 0.5], [2.99, 0.35],
];
const unten = () => {
  const aV = Math.asin((0.3 - RAD.y) / RAD.bogen);
  return [
    [2.5, 0.3],
    ...bogen(RAD.vorn, RAD.y, RAD.bogen, aV, Math.PI - aV, 14),
    [-1.2, 0.3],
    ...bogen(RAD.hinten, RAD.y, RAD.bogen, aV, Math.PI - aV, 14),
    [-2.45, 0.3],
  ];
};
const SILHOUETTE = chaikin([...OBEN, ...unten()], 2, true);
const SILH_LINIE = linie(SILHOUETTE, true);
const DACH = chaikin(OBEN, 2, false);
const FENSTER = chaikin([[-1.93, 1.16], [-1.3, 1.46], [-0.55, 1.575], [0.32, 1.565], [0.88, 1.42], [1.34, 1.16]], 2, false);
const FENSTER_LINIE = linie([...FENSTER, [-1.93, 1.16]], true);

function dachHoehe(x) {
  // Oberkante der Silhouette bei x (aus der geglätteten Dachlinie)
  let best = 0.3;
  for (let i = 0; i < DACH.length - 1; i++) {
    const a = DACH[i], b = DACH[i + 1];
    if ((x >= a[0] && x <= b[0]) || (x >= b[0] && x <= a[0])) {
      const f = b[0] === a[0] ? 0 : (x - a[0]) / (b[0] - a[0]);
      best = Math.max(best, lerp(a[1], b[1], f));
    }
  }
  return best;
}
// Halbe Breite: Gürtellinie 1.0, Dach eingezogen, Bug und Heck abgerundet
function halbBreite(x, y) {
  let hw = y < 1.1 ? 1.0 - 0.04 * smooth(0.3, 0.55, 0.55 - y) : lerp(0.97, 0.7, smooth(1.1, 1.63, y));
  hw *= 1 - 0.16 * smooth(2.35, 3.08, x) - 0.12 * smooth(2.4, 3.03, -x);
  return hw;
}

// Anteile der Auto-Bestandteile (Füllung zuerst: Scan überschreibt diesen Bereich)
const AUTO_TEILE = [
  ["fuellung", 0.07], ["kontur", 0.23], ["fenster", 0.11], ["linien", 0.09],
  ["dach", 0.14], ["raeder", 0.25], ["licht", 0.06], ["front", 0.02], ["boden", 0.03],
];
const GRENZEN = (() => { let s = 0; return AUTO_TEILE.map(([n, a]) => { s += a; return [n, s]; }); })();
const teilVon = (f) => GRENZEN.find(([, g]) => f < g)?.[0] ?? "boden";

const Y_MITTE = 0.82;

function autoPunkt(i, N, rnd, gauss) {
  const f = i / N;
  const teil = teilVon(f);
  const seite = rnd() < 0.5 ? -1 : 1;
  const j = () => gauss() * 0.007;
  let x, y, z;
  switch (teil) {
    case "fuellung": {
      // dünne Flächenfüllung der Seitenwand unterhalb der Gürtellinie
      for (let k = 0; k < 30; k++) {
        x = lerp(-3, 3.05, rnd()); y = lerp(0.3, 1.12, rnd());
        const inBogen = Math.hypot(x - RAD.vorn, y - RAD.y) < RAD.bogen || Math.hypot(x - RAD.hinten, y - RAD.y) < RAD.bogen;
        if (!inBogen && imPolygon(x, y, SILHOUETTE)) break;
      }
      z = seite * halbBreite(x, y);
      break;
    }
    case "kontur": { [x, y] = SILH_LINIE(rnd()); z = seite * halbBreite(x, y); x += j(); y += j(); break; }
    case "fenster": {
      if (rnd() < 0.85) [x, y] = FENSTER_LINIE(rnd());
      else { x = -0.18 + j(); y = lerp(1.16, 1.6, rnd()); } // B-Säule
      z = seite * halbBreite(x, y) * 0.99;
      break;
    }
    case "linien": {
      const r = rnd();
      if (r < 0.45) { x = lerp(-2.9, 2.95, rnd()); y = 0.98 + 0.05 * smooth(-3, 3, -x) + j(); } // Schulterlinie
      else if (r < 0.7) { x = lerp(-1.2, 1.25, rnd()); y = 0.56 + j(); } // Schwellerkante
      else { x = [0.98, -0.18, -1.42][Math.floor(rnd() * 3)] + j(); y = lerp(0.33, 1.12, rnd()); } // Türfugen
      z = seite * halbBreite(x, y);
      break;
    }
    case "dach": {
      // Querrippen und zwei Längslinien über Haube, Dach und Heck
      const rippe = rnd() < 0.5;
      x = rippe ? Math.round(lerp(-2.9, 3.0, rnd()) * 3.2) / 3.2 + j() : lerp(-2.95, 3.03, rnd());
      y = dachHoehe(x);
      const hw = halbBreite(x, y);
      z = rippe ? lerp(-hw, hw, rnd()) : seite * hw * (rnd() < 0.5 ? 0.42 : 0.8);
      y += j();
      break;
    }
    case "raeder": {
      const cx = rnd() < 0.5 ? RAD.vorn : RAD.hinten;
      const r = rnd();
      const zr = seite * (0.9 - (r < 0.35 ? 0 : rnd() * 0.24));
      let rad, a = rnd() * Math.PI * 2;
      if (r < 0.55) rad = RAD.r + gauss() * 0.005;                    // Reifen (außen + Lauffläche)
      else if (r < 0.78) rad = 0.32 + gauss() * 0.004;                // Felgenhorn
      else if (r < 0.95) { a = Math.floor(rnd() * 5) * 1.2566 + gauss() * 0.02; rad = lerp(0.09, 0.32, rnd()); } // Speichen
      else rad = 0.08 + gauss() * 0.006;                              // Nabe
      x = cx + Math.cos(a) * rad; y = RAD.y + Math.sin(a) * rad; z = r < 0.5 ? zr : seite * 0.9;
      break;
    }
    case "licht": {
      if (rnd() < 0.55) { // Scheinwerfer: schmales Band an der Front, um die Ecke gezogen
        const t = rnd(); x = lerp(2.62, 3.0, t); y = 0.8 - 0.07 * t + gauss() * 0.015;
        z = seite * lerp(halbBreite(x, y), 0.55, t * t);
      } else { // durchgehendes Rücklichtband
        x = -2.97 + j(); y = 0.9 + gauss() * 0.012; z = lerp(-0.95, 0.95, rnd());
      }
      break;
    }
    case "front": { // Kühlergrill-Kontur
      const t = rnd() * 4, k = Math.floor(t), u = t - k;
      const pts = [[-0.6, 0.38], [0.6, 0.38], [0.6, 0.6], [-0.6, 0.6]];
      const a = pts[k], b = pts[(k + 1) % 4];
      x = 3.05; z = lerp(a[0], b[0], u); y = lerp(a[1], b[1], u);
      break;
    }
    default: { // Prüfstand: Drehteller-Ring am Boden
      const a = rnd() * Math.PI * 2, r = 3.35 + gauss() * 0.012;
      x = Math.cos(a) * r; y = 0; z = Math.sin(a) * r * 0.6;
    }
  }
  return [x, y - Y_MITTE, z];
}

export function bauAuto(N) {
  const { rnd, gauss } = zufall(23);
  return (i) => autoPunkt(i, N, rnd, gauss);
}

// Schadenspunkte (Modellkoordinaten): Stoßstange, Scheinwerfer, Kotflügel, Fahrertür
export const SCHADEN = [
  [3.04, 0.5 - Y_MITTE, 0.32],
  [2.85, 0.78 - Y_MITTE, 0.78],
  [2.25, 0.82 - Y_MITTE, 0.99],
  [0.35, 0.78 - Y_MITTE, 1.0],
];
export const SCHADEN_ANTEIL = 0.05;
export const STRAHL_ANTEIL = 0.04;

export function bauScan(N) {
  const auto = bauAuto(N);
  const { rnd, gauss } = zufall(29);
  const nS = Math.floor(N * SCHADEN_ANTEIL), nB = Math.floor(N * STRAHL_ANTEIL);
  return (i) => {
    const basis = auto(i); // gleiche Zufallsfolge wie die Auto-Form -> identische Grundpositionen
    if (i < nS) {
      const c = SCHADEN[i % SCHADEN.length];
      const r = Math.pow(rnd(), 1.6) * 0.26;
      const a = rnd() * Math.PI * 2;
      return [c[0] + Math.cos(a) * r * 0.6 + gauss() * 0.01, c[1] + Math.sin(a) * r, c[2] + gauss() * 0.03];
    }
    if (i < nS + nB) { // Scan-Ebene bei x=0; die Verschiebung zur Strahlposition macht der Shader
      return [gauss() * 0.012, lerp(-0.95, 1.05, rnd()), lerp(-1.35, 1.35, rnd())];
    }
    return basis;
  };
}

export function schadenIndex(i, N) {
  return i < Math.floor(N * SCHADEN_ANTEIL) ? (i % SCHADEN.length) + 1 : 0;
}
export function istStrahl(i, N) {
  const nS = Math.floor(N * SCHADEN_ANTEIL);
  return i >= nS && i < nS + Math.floor(N * STRAHL_ANTEIL) ? 1 : 0;
}

// ---------- Siegel / Prüfzeichen ----------
const HAKEN = linie([[-0.95, 0.02], [-0.28, -0.66], [1.05, 0.78]]);

export function bauSiegel(N) {
  const { rnd, gauss } = zufall(31);
  return (i) => {
    const f = i / N;
    const a = rnd() * Math.PI * 2;
    if (f < 0.24) { const r = 2.3 + gauss() * 0.03; return [Math.cos(a) * r, Math.sin(a) * r, gauss() * 0.03]; }
    if (f < 0.36) { const r = 1.98 + gauss() * 0.012; return [Math.cos(a) * r, Math.sin(a) * r, gauss() * 0.02]; }
    if (f < 0.48) { // Zackenkranz
      const k = Math.floor(rnd() * 72), w = (k / 72) * Math.PI * 2 + gauss() * 0.006, r = lerp(2.42, 2.62, rnd());
      return [Math.cos(w) * r, Math.sin(w) * r, gauss() * 0.02];
    }
    if (f < 0.78) { const [x, y] = HAKEN(rnd()); return [x + gauss() * 0.055, y + gauss() * 0.055, gauss() * 0.05]; }
    if (f < 0.92) { const r = Math.sqrt(rnd()) * 1.9; return [Math.cos(a) * r, Math.sin(a) * r, gauss() * 0.05]; }
    const r = 2.9 + Math.abs(gauss()) * 0.5; // Schimmer außen
    return [Math.cos(a) * r, Math.sin(a) * r, gauss() * 0.25];
  };
}

// ---------- Gutachten-Blatt ----------
const BLATT_W = 1.5, BLATT_H = 2.0, ECKE = 0.5;
const BLATT_RAND = linie([
  [-BLATT_W, BLATT_H], [BLATT_W - ECKE, BLATT_H], [BLATT_W, BLATT_H - ECKE], [BLATT_W, -BLATT_H], [-BLATT_W, -BLATT_H],
], true);
const ECK_FALZ = linie([[BLATT_W - ECKE, BLATT_H], [BLATT_W - ECKE, BLATT_H - ECKE], [BLATT_W, BLATT_H - ECKE]]);
const UNTERSCHRIFT = linie(chaikin([[-1.1, -1.55], [-0.85, -1.25], [-0.7, -1.6], [-0.45, -1.3], [-0.3, -1.55], [0.0, -1.42]], 2, false));
const ZEILEN = (() => {
  const { rnd } = zufall(37);
  const z = [];
  for (let k = 0; k < 9; k++) z.push([1.1 - k * 0.27, lerp(1.4, 2.5, rnd())]);
  return z;
})();
const wellung = (x, y) => 0.12 * Math.sin(x * 0.9 + 0.4) + 0.05 * Math.cos(y * 0.7);

export function bauBlatt(N) {
  const { rnd, gauss } = zufall(41);
  return (i) => {
    const f = i / N;
    let x, y;
    if (f < 0.18) [x, y] = BLATT_RAND(rnd());
    else if (f < 0.22) [x, y] = ECK_FALZ(rnd());
    else if (f < 0.32) { x = lerp(-1.15, rnd() < 0.5 ? 0.55 : -0.1, rnd()); y = (rnd() < 0.6 ? 1.62 : 1.42) + gauss() * 0.02; }
    else if (f < 0.66) { const [zy, l] = ZEILEN[Math.floor(rnd() * ZEILEN.length)]; x = -1.15 + rnd() * l; y = zy + gauss() * 0.01; }
    else if (f < 0.72) [x, y] = UNTERSCHRIFT(rnd());
    else if (f < 0.84) { // Prüfsiegel unten rechts
      const a = rnd() * Math.PI * 2;
      if (rnd() < 0.62) { x = 0.82 + Math.cos(a) * 0.4; y = -1.42 + Math.sin(a) * 0.4; }
      else { const [hx, hy] = HAKEN(rnd()); x = 0.82 + hx * 0.2; y = -1.42 + hy * 0.2; }
    } else { x = lerp(-BLATT_W, BLATT_W, rnd()); y = lerp(-BLATT_H, BLATT_H, rnd()); if (x > BLATT_W - ECKE && y > BLATT_H - ECKE && x - (BLATT_W - ECKE) + y - (BLATT_H - ECKE) > ECKE) { x -= ECKE; } }
    return [x + gauss() * 0.008, y + gauss() * 0.008, wellung(x, y) + gauss() * 0.02];
  };
}
