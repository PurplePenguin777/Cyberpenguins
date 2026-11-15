/* =========================================================
   Elemento: Superficies y escenas low-poly de la pantalla inicial
   - Malla de terreno triangulada (suelo lunar / marciano)
   - Cuerpos celestes facetados (Luna, Marte, Tierra, asteroide)
   - Escenas por capas para las tarjetas (efecto de profundidad al deslizar o pasar el mouse)
   - Fondo cósmico para pantallas horizontales y verticales
   Todo se genera con una semilla fija, así que el resultado es siempre el mismo.
   ========================================================= */
(function initElementoSuperficies() {
  const M = (window.CYBERPENGUINS_MODELS = window.CYBERPENGUINS_MODELS || {});

  /* ---------- Utilidades ---------- */

  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return function next() {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function mix(a, b, t) {
    const k = Math.max(0, Math.min(1, t));
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    const out = ca.map((v, i) => Math.round(v + (cb[i] - v) * k));
    return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }

  function n(v) {
    return Math.round(v * 10) / 10;
  }

  function tri(p, q, r, fill, extra = '') {
    return `<polygon points="${n(p[0])},${n(p[1])} ${n(q[0])},${n(q[1])} ${n(r[0])},${n(r[1])}" fill="${fill}" stroke="${fill}" stroke-width="0.5" stroke-linejoin="round"${extra} />`;
  }

  /* ---------- Cuerpo celeste facetado (vista de disco con luz lateral) ---------- */

  function lowPolyBody(opts) {
    const {
      r,
      rings = 4,
      seg = 11,
      seed = 1,
      dark,
      mid,
      light,
      stretchX = 1,
      jitter = 0.18,
      craters = 0,
      cap = null,
      tint = null,
      litNoise = 0.14
    } = opts;
    const rand = rng(seed);
    const pts = [[0, 0]];
    const ringIdx = [];

    for (let k = 1; k <= rings; k += 1) {
      const rad = (r * k) / rings;
      const idx = [];
      for (let i = 0; i < seg; i += 1) {
        const ang = ((i + (rand() - 0.5) * 0.45) / seg) * Math.PI * 2;
        const rr = rad * (1 + (rand() - 0.5) * jitter * (k === rings ? 1.3 : 0.8));
        pts.push([Math.cos(ang) * rr * stretchX, Math.sin(ang) * rr]);
        idx.push(pts.length - 1);
      }
      ringIdx.push(idx);
    }

    const faces = [];
    const first = ringIdx[0];
    for (let i = 0; i < seg; i += 1) {
      faces.push([0, first[i], first[(i + 1) % seg]]);
    }
    for (let k = 0; k < rings - 1; k += 1) {
      const a = ringIdx[k];
      const b = ringIdx[k + 1];
      for (let i = 0; i < seg; i += 1) {
        const i2 = (i + 1) % seg;
        faces.push([a[i], b[i], a[i2]]);
        faces.push([a[i2], b[i], b[i2]]);
      }
    }

    const L = [-0.52, -0.62, 0.58];
    const ll = Math.hypot(L[0], L[1], L[2]);
    let out = '';
    faces.forEach((f) => {
      const cx = (pts[f[0]][0] + pts[f[1]][0] + pts[f[2]][0]) / 3;
      const cy = (pts[f[0]][1] + pts[f[1]][1] + pts[f[2]][1]) / 3;
      const nx = cx / stretchX / r;
      const ny = cy / r;
      const z = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const lit = Math.max(0, Math.min(1, (nx * L[0] + ny * L[1] + z * L[2]) / ll + (rand() - 0.5) * litNoise));
      let color = lit < 0.5 ? mix(dark, mid, lit / 0.5) : mix(mid, light, (lit - 0.5) / 0.5);
      if (tint && lit > 0.3 && rand() < tint.prob) color = mix(color, tint.color, 0.72);
      if (cap && ny < -0.6) color = mix(color, cap, 0.8);
      out += tri(pts[f[0]], pts[f[1]], pts[f[2]], color);
    });

    for (let c = 0; c < craters; c += 1) {
      const ang = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * r * 0.55;
      const px = Math.cos(ang) * dist * stretchX;
      const py = Math.sin(ang) * dist;
      const cr = r * (0.07 + rand() * 0.07);
      let pathPts = '';
      for (let i = 0; i < 7; i += 1) {
        const a = (i / 7) * Math.PI * 2 + rand() * 0.3;
        pathPts += `${n(px + Math.cos(a) * cr * stretchX)},${n(py + Math.sin(a) * cr * 0.9)} `;
      }
      out += `<polygon points="${pathPts.trim()}" fill="${dark}" opacity="0.5" />`;
    }
    return `<g>${out}</g>`;
  }

  /* ---------- Planetas con geografía real (proyección ortográfica de latitud/longitud) ----------
     Los rasgos se colocan por coordenadas y los cráteres usan su diámetro real, así que
     las proporciones entre cráteres, mares, volcanes y continentes son las del astro. */

  const D2R = Math.PI / 180;
  const BODY_KM = { moon: 1737.4, mars: 3389.5, earth: 6371 };
  const BODY_VIEW = {
    moon: { lat0: 0, lon0: 0 },
    mars: { lat0: 8, lon0: -75 },
    earth: { lat0: 28, lon0: -35 }
  };
  const BODY_BASE = {
    moon: { dark: '#3b4658', mid: '#9aa7ba', light: '#f1f5f9' },
    mars: { dark: '#5c1d0c', mid: '#c2410c', light: '#fdba74' },
    earth: { dark: '#0a1740', mid: '#1d56c9', light: '#5fa8f5' }
  };

  // [latitud, longitud, diámetro en km]
  const MOON_CRATERS = [
    [-43.3, -11.4, 85], [9.6, -20.1, 93], [8.1, -38.0, 32], [23.7, -47.4, 40], [51.6, -9.3, 101],
    [-5.2, -68.5, 172], [-58.4, -14.4, 225], [-8.9, 60.9, 132], [-25.3, 60.4, 177], [-11.4, 26.4, 100],
    [-49.5, -27.5, 98], [-39.0, 4.0, 66], [-9.0, 6.0, 45], [30.0, 80.0, 90]
  ];
  // Mares como círculos: [latitud, longitud, diámetro en km]
  const MOON_MARIA = [
    [33, -16, 1123], [28, 18, 707], [8.5, 31, 873], [-7.8, 51.3, 840], [17, 59, 418],
    [-15, 34, 333], [-21, -16, 715], [-24, -39, 389], [-10, -23, 376]
  ];
  const MOON_PROCELLARUM = [[52, -64], [45, -46], [33, -33], [14, -24], [-4, -22], [-14, -36], [-12, -58], [4, -66], [22, -70], [40, -70]];
  const MOON_FRIGORIS = [[56, -42], [58, 0], [56, 40], [51, 40], [52, 0], [51, -42]];

  const MARS_CRATERS = [
    [-5.4, 137.8, 154], [18.4, 77.5, 45], [-13.8, 55.6, 470], [-2.7, 16.8, 460], [-14.5, 129.9, 304],
    [-52, -81, 203], [23.5, 32, 415], [-44, -9, 280], [-30, 70, 150], [-20, -170, 220],
    [-35, 40, 200], [-56, 20, 180], [-25, 100, 260], [-8, -165, 120]
  ];
  const MARS_VOLCANOES = [[18.65, -133.8, 600], [-8.3, -120.1, 435], [1.5, -113.4, 375], [11.8, -104.5, 460], [40.5, -110.5, 1000]];
  const MARS_BASINS = [[-42.7, 70.0, 2300], [-49.7, -43.0, 1800], [12.9, 87.0, 1500]];
  const MARS_VALLES = [[-8, -92], [-12, -84], [-13, -72], [-10, -60], [-6, -50], [-9, -48], [-14, -58], [-16, -72], [-15, -85], [-11, -94]];
  const MARS_DARK = [
    [[-3, 60], [5, 58], [18, 66], [14, 76], [0, 74]],
    [[20, -40], [38, -52], [52, -42], [50, -10], [36, -14], [24, -24]],
    [[-40, -10], [-30, 15], [-18, 30], [-22, 4]]
  ];

  const EARTH_LAND = {
    northAmerica: [[66, -165], [60, -165], [55, -160], [58, -152], [60, -146], [59, -138], [55, -130], [49, -125], [42, -124.5], [34, -120.5], [30, -116], [24, -110], [28, -112.5], [24, -108], [20, -105.5], [16, -99], [15, -93.5], [12, -87], [10, -85.5], [8, -83], [8.8, -79.5], [9, -78], [10, -83.5], [15.5, -83.5], [16, -88.5], [21, -87], [21, -90.5], [19, -91], [18.5, -93.5], [22, -97.5], [26, -97.2], [29, -94.5], [29.5, -90], [30, -87.5], [29.5, -84.5], [26, -81.8], [25.2, -80.5], [27.5, -80], [30.5, -81.3], [33, -79], [35.2, -75.5], [37, -76], [39.5, -74], [41, -72], [41.8, -70], [43.5, -70], [44.5, -67], [45.5, -61], [47, -64.5], [51, -56], [53, -56], [58, -62], [60, -64.5], [62.5, -72], [62.5, -78], [58, -78], [53, -79], [51.5, -80], [52.5, -82], [55, -85], [57, -92], [59, -94], [62, -93], [64, -88], [66, -85], [68, -85], [69, -95], [68, -108], [69, -115], [70, -128], [69, -135], [70, -145], [71, -156]],
    greenland: [[60, -43], [61, -48], [65, -53], [69, -52], [72, -55], [76, -68], [80, -62], [82, -40], [81, -20], [76, -18], [70, -22], [66, -35], [63, -42]],
    southAmerica: [[11, -71.5], [11, -64], [10.5, -61], [8, -60], [5, -52], [2, -50], [0, -50], [-2, -44], [-5, -35.5], [-8, -34.8], [-13, -38.5], [-18, -39.5], [-23, -41.5], [-24, -46.5], [-28, -48.5], [-32, -52], [-35, -57], [-38, -57.5], [-41, -62.5], [-46, -67.5], [-50, -69], [-53.5, -68], [-55, -66], [-54, -71], [-50, -75], [-45, -74], [-40, -73.5], [-33, -71.5], [-27, -70.5], [-18, -70.5], [-14, -76], [-8, -79.5], [-4, -81], [0, -80], [3, -77.5], [7.5, -77.5], [9, -76], [11, -74.5]],
    africa: [[35.8, -5.5], [33, -8], [30, -10], [26, -14.5], [21, -17], [15, -17.5], [12, -16.5], [8, -13.5], [5, -8], [4.5, -2], [5.5, 2], [6.2, 4], [4, 8], [0, 9.5], [-5, 12], [-12, 13.5], [-17, 11.8], [-22.5, 14.5], [-29, 16.5], [-34.5, 19], [-34, 26], [-30, 31], [-25, 33], [-20, 35.5], [-15, 40.5], [-10, 40.5], [-4, 39.5], [2, 44], [10, 51], [12, 51], [11.5, 43.3], [15, 40], [22, 37], [28, 34], [31, 32.3], [31.3, 30], [31, 25], [32.5, 20], [30.5, 19], [32.8, 22], [33, 13], [35, 11], [37, 10], [36.9, 3], [36, -2]],
    eurasia: [[36, -5.5], [37, -9], [43, -9], [43.5, -1.5], [47, -2], [48.5, -4.5], [49.5, -1], [51, 2], [53, 5], [54, 8], [57, 8], [57, 10.5], [54.5, 10], [55, 15], [56, 21], [59, 23], [60, 30], [65, 25], [63, 21], [60, 17], [56, 16], [56, 12.5], [59, 11], [58, 6], [62, 5], [66, 13], [70, 20], [71, 28], [69.5, 33], [67, 41], [68, 44], [68.5, 53], [71, 56], [73, 68], [73, 110], [66, 180], [60, 150], [50, 140], [40, 130], [30, 122], [20, 110], [10, 106], [1, 104], [8, 98], [16, 94], [20, 92], [22, 90], [16, 81], [8, 77], [21, 72], [25, 66], [25, 57], [30, 48.5], [26, 50.5], [24, 54], [26, 56.5], [22, 59.5], [17, 55], [13, 45], [15, 42.5], [21, 39], [28, 34.5], [31.3, 34.3], [36.5, 35.8], [36.8, 30], [37, 27], [40, 26], [41, 29], [42, 35], [41, 41], [43, 40], [46, 37], [46, 31], [44, 28], [41.5, 28.5], [40.5, 24], [38, 24], [36.5, 22.7], [38, 21], [40, 19.5], [42, 18.5], [45.5, 13.5], [44, 12.5], [41.5, 16], [40, 18.5], [38, 16], [38, 15.7], [40, 15.5], [41.5, 13], [43.5, 10.5], [44.3, 8.5], [43.3, 5.5], [43, 3], [42, 3], [40.5, 0], [38.5, -0.5], [37, -2], [36.7, -4.5]],
    britain: [[50, -5.5], [51, -3], [51.5, 1.5], [53, 1.5], [55, -1.5], [57.5, -2], [58.6, -3], [58.6, -5], [57, -6], [55, -5], [54, -3], [53, -4.5], [52, -4.5], [51.5, -5.3]],
    ireland: [[51.5, -10], [52, -6.2], [54, -5.5], [55, -7.5], [54, -10], [52, -10.5]],
    iceland: [[63.5, -20], [64, -14], [65.5, -14], [66.4, -17], [65.5, -22], [64, -22.5]],
    madagascar: [[-12, 49.5], [-15, 50.5], [-20, 48], [-25, 45], [-25, 44], [-21, 43.5], [-16, 44], [-13, 48]]
  };
  const EARTH_SAHARA = [[30, -12], [31, 10], [31, 30], [22, 36], [18, 25], [16, 5], [18, -12]];
  const EARTH_CLOUDS = [
    [[48, -48], [52, -30], [46, -14], [40, -30]],
    [[12, -40], [14, -22], [8, -10], [4, -28]],
    [[-26, -30], [-22, -10], [-30, 4], [-34, -16]]
  ];

  function makeProjector(lat0, lon0) {
    const s0 = Math.sin(lat0 * D2R);
    const c0 = Math.cos(lat0 * D2R);
    const l0 = lon0 * D2R;
    return function project(lat, lon) {
      const p = lat * D2R;
      const dl = lon * D2R - l0;
      const cp = Math.cos(p);
      const sp = Math.sin(p);
      const cosc = s0 * sp + c0 * cp * Math.cos(dl);
      return { x: cp * Math.sin(dl), y: -(c0 * sp - s0 * cp * Math.cos(dl)), vis: cosc > 0 };
    };
  }

  function geoPolygon(proj, pts, r, fill, op) {
    const q = pts.map((c) => proj(c[0], c[1]));
    if (!q.some((v) => v.vis)) return '';
    const str = q
      .map((v) => {
        let x = v.x;
        let y = v.y;
        if (!v.vis) {
          const len = Math.hypot(x, y) || 1;
          x /= len;
          y /= len;
        }
        return `${n(x * r)},${n(y * r)}`;
      })
      .join(' ');
    return `<polygon points="${str}" fill="${fill}" opacity="${op}" stroke="${fill}" stroke-width="0.4" stroke-linejoin="round" />`;
  }

  // Círculo sobre la superficie esférica: se proyecta como elipse y se acorta hacia el borde
  function geoCircle(proj, lat, lon, diameterKm, bodyKm, r, fill, op, scale = 1) {
    const rho = ((diameterKm * scale) / 2) / bodyKm;
    if (rho * r < 0.7) return '';
    const p = lat * D2R;
    const l = lon * D2R;
    const pts = [];
    for (let i = 0; i < 18; i += 1) {
      const b = (i / 18) * Math.PI * 2;
      const lat2 = Math.asin(Math.sin(p) * Math.cos(rho) + Math.cos(p) * Math.sin(rho) * Math.cos(b));
      const lon2 = l + Math.atan2(Math.sin(b) * Math.sin(rho) * Math.cos(p), Math.cos(rho) - Math.sin(p) * Math.sin(lat2));
      pts.push([lat2 / D2R, lon2 / D2R]);
    }
    return geoPolygon(proj, pts, r, fill, op);
  }

  function craterSet(proj, list, bodyKm, r, rim, dark) {
    let out = '';
    list.forEach((c) => {
      out += geoCircle(proj, c[0], c[1], c[2], bodyKm, r, rim, 0.5);
      out += geoCircle(proj, c[0], c[1], c[2], bodyKm, r, dark, 0.55, 0.72);
    });
    return out;
  }

  function geoFeatures(kind, proj, r) {
    const km = BODY_KM[kind];
    let o = '';
    if (kind === 'moon') {
      o += geoPolygon(proj, MOON_PROCELLARUM, r, '#475569', 0.36);
      o += geoPolygon(proj, MOON_FRIGORIS, r, '#475569', 0.3);
      MOON_MARIA.forEach((m) => {
        o += geoCircle(proj, m[0], m[1], m[2], km, r, '#475569', 0.4);
      });
      o += craterSet(proj, MOON_CRATERS, km, r, '#f1f5f9', '#334155');
    } else if (kind === 'mars') {
      MARS_DARK.forEach((pts) => {
        o += geoPolygon(proj, pts, r, '#7c2d12', 0.5);
      });
      MARS_BASINS.forEach((b) => {
        o += geoCircle(proj, b[0], b[1], b[2], km, r, '#fdba74', 0.4);
      });
      o += geoPolygon(proj, [[30, -125], [25, -95], [-15, -98], [-25, -125], [0, -140]], r, '#e0743a', 0.3);
      o += geoPolygon(proj, MARS_VALLES, r, '#431407', 0.6);
      o += craterSet(proj, MARS_CRATERS, km, r, '#fed7aa', '#431407');
      MARS_VOLCANOES.forEach((v) => {
        o += geoCircle(proj, v[0], v[1], v[2], km, r, '#7c2d12', 0.55);
        o += geoCircle(proj, v[0], v[1], v[2], km, r, '#fdba74', 0.5, 0.4);
      });
      o += geoCircle(proj, 90, 0, 1100, km, r, '#fff7ed', 0.92);
      o += geoCircle(proj, -90, 0, 700, km, r, '#ffedd5', 0.8);
    } else {
      Object.keys(EARTH_LAND).forEach((k) => {
        o += geoPolygon(proj, EARTH_LAND[k], r, '#3f9d6b', 0.97);
      });
      o += geoPolygon(proj, EARTH_SAHARA, r, '#d9c77a', 0.8);
      EARTH_CLOUDS.forEach((c) => {
        o += geoPolygon(proj, c, r, '#ffffff', 0.4);
      });
      o += geoCircle(proj, 90, 0, 2800, km, r, '#f1f5f9', 0.85);
    }
    return o;
  }

  function planetBody(kind, r, opts = {}) {
    const { rings = 4, seg = 16, seed = 1, uid = `${kind}${seed}` } = opts;
    const view = Object.assign({}, BODY_VIEW[kind], opts.view || {});
    const proj = makeProjector(view.lat0, view.lon0);
    const base = BODY_BASE[kind];
    const body = lowPolyBody({
      r,
      rings,
      seg,
      seed,
      dark: base.dark,
      mid: base.mid,
      light: base.light,
      jitter: 0.03,
      litNoise: 0.04
    });
    return (
      `<g><defs>` +
      `<clipPath id="clip-${uid}"><circle r="${n(r * 0.985)}" /></clipPath>` +
      `<radialGradient id="shade-${uid}" cx="0.33" cy="0.3" r="0.85"><stop offset="0.45" stop-color="#020617" stop-opacity="0" /><stop offset="1" stop-color="#020617" stop-opacity="0.55" /></radialGradient>` +
      `</defs>${body}<g clip-path="url(#clip-${uid})">${geoFeatures(kind, proj, r)}<circle r="${n(r)}" fill="url(#shade-${uid})" /></g></g>`
    );
  }

  /* ---------- Malla triangulada de terreno ---------- */

  function groundMesh(opts) {
    const {
      x0 = 0,
      y0 = 0,
      w,
      h,
      cols,
      rows,
      seed = 1,
      dark,
      light,
      jitter = 0.4,
      persp = false,
      noise = 0.4
    } = opts;
    const rand = rng(seed);
    const pts = [];
    for (let j = 0; j <= rows; j += 1) {
      const v = j / rows;
      const vy = persp ? Math.pow(v, 1.35) : v;
      for (let i = 0; i <= cols; i += 1) {
        const u = i / cols;
        let jx = (rand() - 0.5) * jitter * (w / cols);
        let jy = (rand() - 0.5) * jitter * (h / rows) * (persp ? 0.4 + v : 1);
        if (i === 0 || i === cols) jx = 0;
        if (j === 0 || j === rows) jy = 0;
        pts.push([x0 + u * w + jx, y0 + vy * h + jy]);
      }
    }
    let out = '';
    for (let j = 0; j < rows; j += 1) {
      for (let i = 0; i < cols; i += 1) {
        const a = j * (cols + 1) + i;
        const b = a + 1;
        const c = a + cols + 1;
        const d = c + 1;
        const pairs = (i + j) % 2 ? [[a, b, c], [b, d, c]] : [[a, b, d], [a, d, c]];
        pairs.forEach((p) => {
          const base = persp ? 0.22 + 0.58 * ((j + 0.5) / rows) : 0.5;
          const t = base + (rand() - 0.5) * noise;
          out += tri(pts[p[0]], pts[p[1]], pts[p[2]], mix(dark, light, t));
        });
      }
    }
    return out;
  }

  function ridge(opts) {
    const { y0, amp, seed, color, x0 = -30, x1 = 330, steps = 16, bottom = 150 } = opts;
    const rand = rng(seed);
    let d = `${x0},${bottom}`;
    for (let i = 0; i <= steps; i += 1) {
      const x = x0 + ((x1 - x0) * i) / steps;
      d += ` ${n(x)},${n(y0 - rand() * amp)}`;
    }
    d += ` ${x1},${bottom}`;
    return `<polygon points="${d}" fill="${color}" />`;
  }

  function crater(cx, cy, rx, ry, dark, rim) {
    const ring = [];
    const inner = [];
    for (let i = 0; i < 9; i += 1) {
      const a = (i / 9) * Math.PI * 2;
      ring.push(`${n(cx + Math.cos(a) * rx)},${n(cy + Math.sin(a) * ry)}`);
      inner.push(`${n(cx + Math.cos(a) * rx * 0.72)},${n(cy + 0.6 + Math.sin(a) * ry * 0.7)}`);
    }
    return `<polygon points="${ring.join(' ')}" fill="${rim}" opacity="0.6" /><polygon points="${inner.join(' ')}" fill="${dark}" opacity="0.7" />`;
  }

  function rock(cx, cy, s, light, mid, dark) {
    return (
      `<polygon points="${n(cx - s)},${n(cy)} ${n(cx - s * 0.5)},${n(cy - s * 0.9)} ${n(cx)},${n(cy - s * 0.2)} ${n(cx)},${n(cy + s * 0.3)} ${n(cx - s * 0.7)},${n(cy + s * 0.3)}" fill="${mid}" />` +
      `<polygon points="${n(cx - s * 0.5)},${n(cy - s * 0.9)} ${n(cx + s * 0.4)},${n(cy - s * 0.8)} ${n(cx + s * 0.9)},${n(cy - s * 0.1)} ${n(cx)},${n(cy - s * 0.2)}" fill="${light}" />` +
      `<polygon points="${n(cx)},${n(cy - s * 0.2)} ${n(cx + s * 0.9)},${n(cy - s * 0.1)} ${n(cx + s * 0.8)},${n(cy + s * 0.3)} ${n(cx)},${n(cy + s * 0.3)}" fill="${dark}" />`
    );
  }

  function stars(seed, count, yMax, xMax, colors) {
    const rand = rng(seed);
    let out = '';
    for (let i = 0; i < count; i += 1) {
      const x = rand() * xMax;
      const y = rand() * yMax;
      const rr = 0.45 + rand() * 0.95;
      const color = colors[Math.floor(rand() * colors.length)];
      out += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(rr)}" fill="${color}" opacity="${n(0.35 + rand() * 0.6)}" />`;
    }
    return out;
  }

  /* ---------- Escenas de las tarjetas (La Luna, Marte, Frontera Espacial) ---------- */

  const SCENES = {
    moon: {
      sky: 'linear-gradient(180deg, #02040c 0%, #0a1124 62%, #1a2336 100%)',
      starColors: ['#ffffff', '#e2e8f0', '#bae6fd'],
      ridgeFar: '#2f3b52',
      ridgeMid: '#475569',
      dark: '#3b4658',
      light: '#dbe3ee',
      craterDark: '#2a3344',
      craterRim: '#e2e8f0',
      rock: ['#e2e8f0', '#94a3b8', '#475569'],
      seed: 11
    },
    mars: {
      sky: 'linear-gradient(180deg, #0d0715 0%, #3a1a22 58%, #8a3b26 100%)',
      starColors: ['#fef3c7', '#fed7aa', '#ffffff'],
      ridgeFar: '#6f2c1e',
      ridgeMid: '#8f3a22',
      dark: '#7c2d12',
      light: '#fdba74',
      craterDark: '#5c1d0c',
      craterRim: '#fed7aa',
      rock: ['#fdba74', '#c2410c', '#7c2d12'],
      seed: 23
    }
  };

  function surfaceScene(cfg, chapterId, machineSvg) {
    const far =
      stars(cfg.seed, 34, 78, 300, cfg.starColors) +
      (chapterId === 'moon'
        ? `<g transform="translate(246,34)">${planetBody('earth', 12, { rings: 3, seg: 12, seed: 5, uid: 'cardearth' })}</g>`
        : `<g transform="translate(40,38)">${lowPolyBody({ r: 7, rings: 2, seg: 7, seed: 9, dark: '#3f3f46', mid: '#78716c', light: '#d6d3d1', jitter: 0.4 })}</g>`) +
      ridge({ y0: 96, amp: 14, seed: cfg.seed + 1, color: cfg.ridgeFar, steps: 20 });
    const mid = ridge({ y0: 104, amp: 10, seed: cfg.seed + 2, color: cfg.ridgeMid, steps: 18 });
    const ground =
      groundMesh({ x0: -40, y0: 104, w: 380, h: 52, cols: 14, rows: 5, seed: cfg.seed + 3, dark: cfg.dark, light: cfg.light, persp: true }) +
      crater(60, 124, 18, 4.6, cfg.craterDark, cfg.craterRim) +
      crater(238, 134, 24, 5.8, cfg.craterDark, cfg.craterRim) +
      rock(118, 143, 5.5, cfg.rock[0], cfg.rock[1], cfg.rock[2]) +
      rock(206, 119, 3.6, cfg.rock[0], cfg.rock[1], cfg.rock[2]) +
      rock(278, 148, 6.2, cfg.rock[0], cfg.rock[1], cfg.rock[2]);

    return `
      <div class="chapter-scene" data-scene="${chapterId}" style="background:${cfg.sky}" aria-hidden="true">
        <svg class="scene-layer scene-far" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice">${far}</svg>
        <svg class="scene-layer scene-mid" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice">${mid}</svg>
        <svg class="scene-layer scene-ground" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice">${ground}</svg>
        <div class="scene-shadow"></div>
        <div class="scene-machine"><div class="scene-machine-inner">${machineSvg}</div></div>
      </div>
    `;
  }

  function frontierScene(machineSvg) {
    const far = stars(41, 78, 150, 300, ['#ffffff', '#e0f2fe', '#7ee8fa', '#fed7aa', '#bae6fd']);
    let dust = '';
    [
      { x: 52, y: 96, r: 9, s: 3 },
      { x: 248, y: 112, r: 7, s: 4 },
      { x: 222, y: 40, r: 5, s: 6 }
    ].forEach((a) => {
      dust += `<g transform="translate(${a.x},${a.y})" opacity="0.55">${lowPolyBody({ r: a.r, rings: 2, seg: 7, seed: a.s, dark: '#0f172a', mid: '#334155', light: '#94a3b8', stretchX: 1.4, jitter: 0.5 })}</g>`;
    });
    const mid =
      dust +
      `<g transform="translate(262,26)"><polygon points="0,-9 2.4,-2.4 9,0 2.4,2.4 0,9 -2.4,2.4 -9,0 -2.4,-2.4" fill="#fb923c" opacity="0.5" /><polygon points="0,-4.5 1.3,-1.3 4.5,0 1.3,1.3 0,4.5 -1.3,1.3 -4.5,0 -1.3,-1.3" fill="#fef08a" /></g>`;
    const near = stars(77, 14, 150, 300, ['#ffffff', '#e0f2fe']).replace(/r="([0-9.]+)"/g, (m, v) => `r="${n(Number(v) * 1.5)}"`);

    return `
      <div class="chapter-scene" data-scene="deep-space" style="background:linear-gradient(180deg, #020412 0%, #060b1f 100%)" aria-hidden="true">
        <svg class="scene-layer scene-far" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice">${far}</svg>
        <svg class="scene-layer scene-mid" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice">${mid}</svg>
        <svg class="scene-layer scene-ground" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice">${near}</svg>
        <div class="scene-glow"></div>
        <div class="scene-machine"><div class="scene-machine-inner">${machineSvg}</div></div>
      </div>
    `;
  }

  function chapterScene(chapterId, machineSvg) {
    if (chapterId === 'moon' || chapterId === 'mars') {
      return surfaceScene(SCENES[chapterId], chapterId, machineSvg || '');
    }
    return frontierScene(machineSvg || '');
  }

  /* ---------- Fondo cósmico (horizontal y vertical) ---------- */

  function homeBackdrop(orientation) {
    const land = orientation !== 'portrait';
    const W = land ? 1920 : 1080;
    const H = land ? 1080 : 1920;
    const k = land ? 'l' : 'p';
    const pos = land
      ? { moon: [215, 200, 96], earth: [150, 1085, 310], eros: [1525, 240], ald: [1690, 185], mars: [1745, 790, 138] }
      : { moon: [200, 300, 120], earth: [90, 2040, 420], eros: [800, 380], ald: [930, 260], mars: [900, 1180, 150] };

    const moon = `<g transform="translate(${pos.moon[0]},${pos.moon[1]})" opacity="0.88">${planetBody('moon', pos.moon[2], { rings: 5, seg: 18, seed: 101, uid: 'bgmoon' + k })}</g>`;
    const earth =
      `<g transform="translate(${pos.earth[0]},${pos.earth[1]})">` +
      `<circle r="${pos.earth[2] + 10}" fill="none" stroke="url(#bgAtmoRim-${k})" stroke-width="7" />` +
      planetBody('earth', pos.earth[2], { rings: 6, seg: 28, seed: 202, uid: 'bgearth' + k }) +
      '</g>';
    const eros = `<g transform="translate(${pos.eros[0]},${pos.eros[1]}) rotate(-14)" opacity="0.85">${lowPolyBody({ r: 30, rings: 3, seg: 10, seed: 303, dark: '#1e293b', mid: '#64748b', light: '#cbd5e1', stretchX: 1.8, jitter: 0.4 })}</g>`;
    const aldebaran = `<g transform="translate(${pos.ald[0]},${pos.ald[1]})"><polygon points="0,-24 6,-6 24,0 6,6 0,24 -6,6 -24,0 -6,-6" fill="#fb923c" opacity="0.55" /><polygon points="0,-13 3.5,-3.5 13,0 3.5,3.5 0,13 -3.5,3.5 -13,0 -3.5,-3.5" fill="#fef08a" /><polygon points="0,-5 5,0 0,5 -5,0" fill="#ffffff" /></g>`;
    const mars = `<g transform="translate(${pos.mars[0]},${pos.mars[1]})" opacity="0.88">${planetBody('mars', pos.mars[2], { rings: 5, seg: 20, seed: 404, uid: 'bgmars' + k })}</g>`;

    const facets =
      `<g opacity="0.2">${groundMesh({ x0: 0, y0: 0, w: W * 0.34, h: H * 0.34, cols: 8, rows: 6, seed: 11, dark: '#0b1226', light: '#1e293b', jitter: 0.5, noise: 0.9 })}</g>` +
      `<g opacity="0.16">${groundMesh({ x0: W * 0.62, y0: H * 0.66, w: W * 0.38, h: H * 0.34, cols: 8, rows: 6, seed: 12, dark: '#0f0b24', light: '#312e81', jitter: 0.5, noise: 0.9 })}</g>`;

    return `
      <defs>
        <linearGradient id="bgCosmosGrad-${k}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#050814" />
          <stop offset="52%" stop-color="#070c1d" />
          <stop offset="100%" stop-color="#0b1329" />
        </linearGradient>
        <linearGradient id="bgAtmoRim-${k}" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.34" />
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bgCosmosGrad-${k})" />
      ${facets}
      <ellipse cx="${W / 2}" cy="${H * 0.52}" rx="${W * 0.53}" ry="${H * 0.31}" transform="rotate(-12 ${W / 2} ${H * 0.52})" fill="none" stroke="rgba(148, 163, 184, 0.08)" stroke-width="1" />
      <ellipse cx="${W / 2}" cy="${H * 0.5}" rx="${W * 0.4}" ry="${H * 0.21}" transform="rotate(7 ${W / 2} ${H * 0.5})" fill="none" stroke="rgba(126, 232, 250, 0.06)" stroke-width="1" />
      <g>${stars(land ? 61 : 62, land ? 90 : 120, H, W, ['#f8fafc', '#bae6fd', '#7ee8fa', '#fed7aa'])}</g>
      ${moon}
      ${earth}
      ${aldebaran}
      ${eros}
      ${mars}
    `;
  }

  M.lowPolyBody = lowPolyBody;
  M.planetBody = planetBody;
  M.groundMesh = groundMesh;
  M.chapterScene = chapterScene;
  M.homeBackdrop = homeBackdrop;
})();
