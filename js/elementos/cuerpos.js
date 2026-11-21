/* =========================================================
   Elemento: Cuerpos celestes canónicos ("facetado fiel")
   Una sola fuente de verdad para cómo se dibujan:
   - malla facetada translúcida sobre planetas (Tierra, Luna, Marte)   -> M.facetShade
   - 433 Eros (alargado, con curvatura y depresión Himeros)             -> M.asteroidErosBody
   - Fobos (patata con el cráter Stickney)                              -> M.phobosBody
   - asteroides genéricos, cada uno con forma distinta                  -> M.asteroidBody
   - cráteres y rocas de superficie compartidos por los escenarios      -> M.surfaceCrater / M.surfaceRock
   Cargar DESPUÉS de superficies.js y ANTES de models.js.
   ========================================================= */
(function (global) {
  'use strict';

  const M = (global.CYBERPENGUINS_MODELS = global.CYBERPENGUINS_MODELS || {});
  if (!M.uid) {
    let uidCounter = 0;
    M.uid = function uid(prefix) {
      uidCounter += 1;
      return `${prefix}-${uidCounter}`;
    };
  }

  // Una sola dirección de luz para todo el juego (arriba-izquierda)
  M.LIGHT = [-0.52, -0.62, 0.58];
  const LX = M.LIGHT[0];
  const LY = M.LIGHT[1];
  const LZ = M.LIGHT[2];
  const LL = Math.hypot(LX, LY, LZ);

  /* ---------- Utilidades ---------- */

  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return function next() {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  const n = (v) => Math.round(v * 10) / 10;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function mix(a, b, t) {
    const k = clamp(t, 0, 1);
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    return `#${ca.map((v, i) => Math.round(v + (cb[i] - v) * k).toString(16).padStart(2, '0')).join('')}`;
  }

  function tri(p, q, r, fill, extra = '') {
    return `<polygon points="${n(p[0])},${n(p[1])} ${n(q[0])},${n(q[1])} ${n(r[0])},${n(r[1])}" fill="${fill}" stroke="${fill}" stroke-width="0.5" stroke-linejoin="round"${extra} />`;
  }

  const polyStr = (arr) => arr.map((p) => `${n(p[0])},${n(p[1])}`).join(' ');

  function ellPts(cx, cy, rx, ry, N = 14) {
    const out = [];
    for (let i = 0; i < N; i += 1) {
      const a = (i / N) * Math.PI * 2;
      out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    return out;
  }

  /* ---------- Malla facetada translúcida para esferas (Tierra, Luna, Marte) ---------- */

  function facetShade(r, opts = {}) {
    const rings = opts.rings || clamp(Math.round(r / 14), 4, 12);
    const seg = opts.seg || clamp(Math.round(r / 9), 12, 28);
    const strength = opts.strength !== undefined ? opts.strength : 0.16;
    const rand = rng(opts.seed || 1);

    const pts = [[0, 0]];
    const ringIdx = [];
    for (let k = 1; k <= rings; k += 1) {
      const rad = (r * 1.04 * k) / rings;
      const idx = [];
      for (let i = 0; i < seg; i += 1) {
        const ang = ((i + (rand() - 0.5) * 0.4) / seg) * Math.PI * 2;
        const rr = rad * (1 + (rand() - 0.5) * 0.08);
        pts.push([Math.cos(ang) * rr, Math.sin(ang) * rr]);
        idx.push(pts.length - 1);
      }
      ringIdx.push(idx);
    }

    const faces = [];
    for (let i = 0; i < seg; i += 1) faces.push([0, ringIdx[0][i], ringIdx[0][(i + 1) % seg]]);
    for (let k = 0; k < rings - 1; k += 1) {
      const a = ringIdx[k];
      const b = ringIdx[k + 1];
      for (let i = 0; i < seg; i += 1) {
        const i2 = (i + 1) % seg;
        faces.push([a[i], b[i], a[i2]], [a[i2], b[i], b[i2]]);
      }
    }

    let out = '';
    faces.forEach((fc) => {
      const cx = (pts[fc[0]][0] + pts[fc[1]][0] + pts[fc[2]][0]) / 3;
      const cy = (pts[fc[0]][1] + pts[fc[1]][1] + pts[fc[2]][1]) / 3;
      const nx = cx / r;
      const ny = cy / r;
      const z = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const lit = (nx * LX + ny * LY + z * LZ) / LL + (rand() - 0.5) * 0.1;
      const op = Math.min(strength, Math.abs(lit - 0.45) * strength * 2.2);
      out += tri(pts[fc[0]], pts[fc[1]], pts[fc[2]], lit > 0.45 ? '#ffffff' : '#000000', ` opacity="${n(op)}"`);
    });
    return `<g>${out}</g>`;
  }

  /* ---------- Cuerpo pequeño: malla facetada con silueta paramétrica ---------- */

  const EROS_PAL = { dark: '#3a4352', mid: '#8f99a8', light: '#dfe5ee' };
  const PHOBOS_PAL = { dark: '#2a2220', mid: '#7d6b62', light: '#c2aa9c' };
  const AST_PALS = [
    { dark: '#3a4352', mid: '#8f99a8', light: '#dfe5ee' },
    { dark: '#3b3028', mid: '#8a7566', light: '#d3bfae' },
    { dark: '#1f242d', mid: '#5b6573', light: '#a9b3c2' }
  ];

  const EROS_CRATERS = [
    { u: 0.58, v: -0.1, s: 0.2 },
    { u: -0.5, v: 0.05, s: 0.14 },
    { u: -0.18, v: -0.35, s: 0.08 },
    { u: 0.2, v: 0.4, s: 0.1 },
    { u: 0.82, v: 0.2, s: 0.07 },
    { u: -0.8, v: -0.1, s: 0.07 }
  ];

  function smallBody(spec) {
    const {
      a,
      b,
      seed = 1,
      bend = 0,
      taper = 0,
      lumps = 0.06,
      rings = 4,
      seg = 16,
      pal,
      craters = [],
      saddle = false,
      boulders = false,
      texture = null
    } = spec;
    const uid = spec.uid || M.uid('ast');
    const rand = rng(seed);

    const harm = [2, 3, 4, 5].map((k) => ({
      k,
      amp: (lumps * (0.4 + rand() * 0.6)) / (k * 0.5),
      ph: rand() * Math.PI * 2
    }));

    // Silueta: elipse alargada + armónicos irregulares + asimetría + curvatura de plátano
    function outline(t) {
      let m = 1;
      harm.forEach((h) => {
        m += h.amp * Math.cos(h.k * t + h.ph);
      });
      const x = a * Math.cos(t) * m;
      let y = b * Math.sin(t) * m;
      y *= 1 + taper * (x / a);
      y -= bend * b * (1 - Math.min(1, (x / a) * (x / a)));
      return [x, y];
    }

    const ti = [];
    for (let i = 0; i < seg; i += 1) ti.push(((i + (rand() - 0.5) * 0.35) / seg) * Math.PI * 2);

    const pts = [[0, 0]];
    const ringIdx = [];
    for (let k = 1; k <= rings; k += 1) {
      const idx = [];
      for (let i = 0; i < seg; i += 1) {
        const inner = k < rings;
        const t = ti[i] + (inner ? (rand() - 0.5) * 0.15 : 0);
        const o = outline(t);
        const kk = (k / rings) * (inner ? 1 + (rand() - 0.5) * 0.2 : 1);
        pts.push([o[0] * kk, o[1] * kk]);
        idx.push(pts.length - 1);
      }
      ringIdx.push(idx);
    }
    const boundary = ringIdx[rings - 1].map((id) => pts[id]);

    const faceList = [];
    for (let i = 0; i < seg; i += 1) faceList.push([0, ringIdx[0][i], ringIdx[0][(i + 1) % seg]]);
    for (let k = 0; k < rings - 1; k += 1) {
      const ra = ringIdx[k];
      const rb = ringIdx[k + 1];
      for (let i = 0; i < seg; i += 1) {
        const i2 = (i + 1) % seg;
        faceList.push([ra[i], rb[i], ra[i2]], [ra[i2], rb[i], rb[i2]]);
      }
    }

    let faces = '';
    faceList.forEach((fc) => {
      const cx = (pts[fc[0]][0] + pts[fc[1]][0] + pts[fc[2]][0]) / 3;
      const cy = (pts[fc[0]][1] + pts[fc[1]][1] + pts[fc[2]][1]) / 3;
      let ux = cx / a;
      let uy = (cy + bend * b * (1 - Math.min(1, ux * ux))) / b;
      let r2 = ux * ux + uy * uy;
      if (r2 > 0.98) {
        const s = Math.sqrt(0.98 / r2);
        ux *= s;
        uy *= s;
        r2 = 0.98;
      }
      const z = Math.sqrt(1 - r2);
      // Inclinación aleatoria de cada faceta: da el aspecto de roca irregular
      const nx = ux + (rand() - 0.5) * 0.55;
      const ny = uy + (rand() - 0.5) * 0.55;
      const len = Math.hypot(nx, ny, z) || 1;
      const lit = (nx * LX + ny * LY + z * LZ) / (len * LL);
      const t = clamp(lit * 0.9 + 0.18, 0, 1);
      const color = t < 0.5 ? mix(pal.dark, pal.mid, t / 0.5) : mix(pal.mid, pal.light, (t - 0.5) / 0.5);
      faces += tri(pts[fc[0]], pts[fc[1]], pts[fc[2]], color);
    });

    let extras = '';
    if (saddle) {
      extras += `<polygon points="${polyStr(ellPts(0, b * 0.45 - bend * b * 0.2, a * 0.2, b * 0.3))}" fill="${pal.dark}" opacity="0.3" />`;
    }
    craters.forEach((c) => {
      const ux = c.u * 0.92;
      const cx = ux * a;
      const cy = c.v * b * 0.8 - bend * b * (1 - ux * ux);
      const rx = c.s * b * 1.7;
      const ry = c.s * b * 1.1;
      extras += `<polygon points="${polyStr(ellPts(cx - 0.04 * rx, cy - 0.1 * ry, rx * 1.08, ry * 1.08))}" fill="${pal.light}" opacity="0.5" />`;
      extras += `<polygon points="${polyStr(ellPts(cx, cy, rx, ry))}" fill="${pal.dark}" opacity="0.55" />`;
      extras += `<polygon points="${polyStr(ellPts(cx + rx * 0.12, cy + ry * 0.18, rx * 0.72, ry * 0.68))}" fill="${pal.dark}" opacity="0.8" />`;
    });
    if (boulders) {
      for (let i = 0; i < 6; i += 1) {
        const u = (rand() * 2 - 1) * 0.8;
        const v = (rand() * 2 - 1) * 0.55;
        const bx = u * a;
        const by = v * b - bend * b * (1 - u * u);
        const s = b * 0.09;
        extras += tri([bx - s, by + s * 0.4], [bx, by - s], [bx + s, by + s * 0.5], pal.light);
        extras += tri([bx, by - s], [bx + s, by + s * 0.5], [bx + s * 0.1, by + s * 0.7], pal.dark);
      }
    }

    return `
      <g>
        <defs><clipPath id="clip-${uid}"><polygon points="${polyStr(boundary)}" /></clipPath></defs>
        <g clip-path="url(#clip-${uid})">
          ${texture ? `<image href="${texture}" x="${-a * 1.05}" y="${-b * 1.5}" width="${2.1 * a}" height="${3 * b}" preserveAspectRatio="xMidYMid slice" />` : ''}
          <g opacity="${texture ? '0.35' : '1'}">${faces}</g>
          ${extras}
        </g>
        <polygon points="${polyStr(boundary)}" fill="none" stroke="#0b1220" stroke-opacity="0.45" stroke-width="0.7" stroke-linejoin="round" />
      </g>
    `;
  }

  // 433 Eros: ~34 x 11 x 11 km (3:1), alargado, ligeramente curvado y con la depresión Himeros
  function asteroidErosBody(r = 30, opts = {}) {
    const small = r < 10;
    return smallBody({
      a: r * 2.15,
      b: r * 0.72,
      seed: opts.seed || 303,
      uid: opts.uid,
      bend: 0.28,
      taper: 0.12,
      lumps: 0.07,
      rings: small ? 3 : 5,
      seg: small ? 14 : 22,
      pal: EROS_PAL,
      saddle: !small,
      craters: small ? [] : EROS_CRATERS,
      boulders: r >= 24,
      texture: 'assets/textures/eros.jpg'
    });
  }

  // Fobos: patata con el gran cráter Stickney
  function phobosBody(r = 20, opts = {}) {
    return smallBody({
      a: r,
      b: r * 0.84,
      seed: opts.seed || 55,
      uid: opts.uid,
      lumps: 0.1,
      rings: 4,
      seg: 14,
      pal: PHOBOS_PAL,
      craters: [
        { u: 0.45, v: -0.1, s: 0.4 },
        { u: -0.45, v: 0.2, s: 0.15 },
        { u: 0.0, v: 0.45, s: 0.1 }
      ]
    });
  }

  // Asteroide genérico: cada semilla produce una forma distinta (nunca el cacahuate de Eros)
  function asteroidBody(r = 10, opts = {}) {
    const seed = opts.seed || 7;
    const rand = rng(seed * 97 + 13);
    const ratio = 1.1 + rand() * 0.45;
    return smallBody({
      a: r * ratio,
      b: r,
      seed,
      uid: opts.uid,
      taper: (rand() - 0.5) * 0.3,
      lumps: 0.14,
      rings: r < 8 ? 3 : 4,
      seg: r < 8 ? 12 : 16,
      pal: AST_PALS[seed % 3],
      craters: r < 7
        ? []
        : [
          { u: rand() * 1.1 - 0.55, v: rand() * 0.8 - 0.4, s: 0.2 },
          { u: rand() * 1.1 - 0.55, v: rand() * 0.8 - 0.4, s: 0.13 }
        ]
    });
  }

  /* ---------- Cráteres y rocas de superficie compartidos ---------- */

  function surfaceCrater(cx, cy, rx, ry, dark, rim) {
    return (
      `<polygon points="${polyStr(ellPts(cx, cy, rx, ry, 14))}" fill="${rim}" opacity="0.55" />` +
      `<polygon points="${polyStr(ellPts(cx + rx * 0.06, cy + ry * 0.22, rx * 0.8, ry * 0.7, 14))}" fill="${dark}" opacity="0.78" />`
    );
  }

  function surfaceRock(cx, cy, s, light, mid, dark) {
    return (
      `<polygon points="${n(cx - s)},${n(cy)} ${n(cx - s * 0.5)},${n(cy - s * 0.9)} ${n(cx)},${n(cy - s * 0.2)} ${n(cx)},${n(cy + s * 0.3)} ${n(cx - s * 0.7)},${n(cy + s * 0.3)}" fill="${mid}" />` +
      `<polygon points="${n(cx - s * 0.5)},${n(cy - s * 0.9)} ${n(cx + s * 0.4)},${n(cy - s * 0.8)} ${n(cx + s * 0.9)},${n(cy - s * 0.1)} ${n(cx)},${n(cy - s * 0.2)}" fill="${light}" />` +
      `<polygon points="${n(cx)},${n(cy - s * 0.2)} ${n(cx + s * 0.9)},${n(cy - s * 0.1)} ${n(cx + s * 0.8)},${n(cy + s * 0.3)} ${n(cx)},${n(cy + s * 0.3)}" fill="${dark}" />`
    );
  }

  M.facetShade = facetShade;
  M.asteroidErosBody = asteroidErosBody;
  M.phobosBody = phobosBody;
  M.asteroidBody = asteroidBody;
  M.surfaceCrater = surfaceCrater;
  M.surfaceRock = surfaceRock;
})(typeof window !== 'undefined' ? window : globalThis);
