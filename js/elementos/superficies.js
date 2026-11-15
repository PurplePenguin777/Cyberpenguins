/* =========================================================
   Elemento: Superficies y escenas low-poly de la pantalla inicial
   - Malla de terreno triangulada (suelo lunar / marciano)
   - Cuerpos celestes realistas y facetados (Luna, Marte, Tierra, asteroide 433 Eros)
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

  /* Catmull-Rom a Bézier cúbico para generar curvas fluidas y nubes sin triángulos */
  function smoothPolygonPath(pts) {
    if (!pts || pts.length < 3) return '';
    let d = `M ${n(pts[0][0])},${n(pts[0][1])}`;
    const len = pts.length;
    for (let i = 0; i < len; i += 1) {
      const p0 = pts[(i - 1 + len) % len];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % len];
      const p3 = pts[(i + 2) % len];
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${n(cp1x)},${n(cp1y)} ${n(cp2x)},${n(cp2y)} ${n(p2[0])},${n(p2[1])}`;
    }
    return d + ' Z';
  }

  /* ---------- Cuerpo celeste facetado (para pequeños fragmentos y lunas secundarias) ---------- */

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

  /* ---------- Asteroide 433 Eros realista (forma elongada de cacahuate / silla de montar Himeros) ---------- */

  function asteroidErosBody(r, o) {
    if (typeof M.asteroidErosBody === 'function' && M.asteroidErosBody !== asteroidErosBody) {
      return M.asteroidErosBody(r, o);
    }
    return '';
  }

  /* ---------- Planetas con geografía real y curvas fluidas (sin rayos radiales ni bolas blancas) ---------- */

  const D2R = Math.PI / 180;
  const BODY_KM = { moon: 1737.4, mars: 3389.5, earth: 6371 };
  const BODY_VIEW = {
    moon: { lat0: 0, lon0: 0 },
    mars: { lat0: 8, lon0: -75 },
    earth: { lat0: 25, lon0: -40 }
  };

  // Coordenadas geográficas fidedignas de continentes terrestres
  const EARTH_LAND = {
    northAmerica: [
      [71, -156], [70, -145], [69, -135], [70, -128], [69, -115], [68, -108], [69, -95],
      [68, -85], [66, -85], [64, -88], [62, -93], [59, -94], [57, -92], [55, -85],
      [52.5, -82], [51.5, -80], [53, -79], [58, -78], [62.5, -78], [62.5, -72], [60, -64.5],
      [58, -62], [53, -56], [51, -56], [47, -64.5], [45.5, -61], [44.5, -67], [43.5, -70],
      [41.8, -70], [41, -72], [39.5, -74], [37, -76], [35.2, -75.5], [33, -79], [30.5, -81.3],
      [27.5, -80], [25.2, -80.5], [26, -81.8], [29.5, -84.5], [30, -87.5], [29.5, -90],
      [29, -94.5], [26, -97.2], [22, -97.5], [18.5, -93.5], [19, -91], [21, -90.5], [21, -87],
      [16, -88.5], [15.5, -83.5], [10, -83.5], [9, -78], [8.8, -79.5], [8, -83], [10, -85.5],
      [12, -87], [15, -93.5], [16, -99], [20, -105.5], [24, -108], [28, -112.5], [24, -110],
      [30, -116], [34, -120.5], [42, -124.5], [49, -125], [55, -130], [59, -138], [60, -146],
      [58, -152], [55, -160], [60, -165], [66, -165]
    ],
    greenland: [
      [60, -43], [61, -48], [65, -53], [69, -52], [72, -55], [76, -68], [80, -62], [82, -40],
      [81, -20], [76, -18], [70, -22], [66, -35], [63, -42]
    ],
    southAmerica: [
      [11, -71.5], [11, -64], [10.5, -61], [8, -60], [5, -52], [2, -50], [0, -50], [-2, -44],
      [-5, -35.5], [-8, -34.8], [-13, -38.5], [-18, -39.5], [-23, -41.5], [-24, -46.5],
      [-28, -48.5], [-32, -52], [-35, -57], [-38, -57.5], [-41, -62.5], [-46, -67.5],
      [-50, -69], [-53.5, -68], [-55, -66], [-54, -71], [-50, -75], [-45, -74], [-40, -73.5],
      [-33, -71.5], [-27, -70.5], [-18, -70.5], [-14, -76], [-8, -79.5], [-4, -81], [0, -80],
      [3, -77.5], [7.5, -77.5], [9, -76], [11, -74.5]
    ],
    africa: [
      [35.8, -5.5], [33, -8], [30, -10], [26, -14.5], [21, -17], [15, -17.5], [12, -16.5],
      [8, -13.5], [5, -8], [4.5, -2], [5.5, 2], [6.2, 4], [4, 8], [0, 9.5], [-5, 12],
      [-12, 13.5], [-17, 11.8], [-22.5, 14.5], [-29, 16.5], [-34.5, 19], [-34, 26],
      [-30, 31], [-25, 33], [-20, 35.5], [-15, 40.5], [-10, 40.5], [-4, 39.5], [2, 44],
      [10, 51], [12, 51], [11.5, 43.3], [15, 40], [22, 37], [28, 34], [31, 32.3],
      [31.3, 30], [31, 25], [32.5, 20], [30.5, 19], [32.8, 22], [33, 13], [35, 11],
      [37, 10], [36.9, 3], [36, -2]
    ],
    eurasia: [
      [36, -5.5], [37, -9], [43, -9], [43.5, -1.5], [47, -2], [48.5, -4.5], [49.5, -1],
      [51, 2], [53, 5], [54, 8], [57, 8], [57, 10.5], [54.5, 10], [55, 15], [56, 21],
      [59, 23], [60, 30], [65, 25], [63, 21], [60, 17], [56, 16], [56, 12.5], [59, 11],
      [58, 6], [62, 5], [66, 13], [70, 20], [71, 28], [69.5, 33], [67, 41], [68, 44],
      [42, 3], [40.5, 0], [38.5, -0.5], [37, -2], [36.7, -4.5]
    ],
    britain: [
      [50, -5.5], [51, -3], [51.5, 1.5], [53, 1.5], [55, -1.5], [57.5, -2], [58.6, -3],
      [58.6, -5], [57, -6], [55, -5], [54, -3], [53, -4.5], [52, -4.5], [51.5, -5.3]
    ]
  };
  const EARTH_SAHARA = [[30, -12], [31, 10], [31, 30], [22, 36], [18, 25], [16, 5], [18, -12]];

  // Sistemas nubosos atmosféricos fluidos y translúcidos (sutiles y orgánicos)
  const EARTH_CLOUD_BANDS = [
    // Borrasca en espiral del Atlántico Norte
    [[58, -38], [54, -24], [47, -26], [45, -36], [49, -46], [56, -44]],
    // Brazo frontal atlántico medio
    [[35, -56], [38, -42], [32, -28], [26, -34], [31, -48]],
    // ITCZ ecuatorial sinuosa
    [[8, -55], [10, -38], [6, -20], [4, -5], [1, 10], [-1, 2], [1, -15], [3, -35], [4, -52]],
    // Sistema ciclónico austral
    [[-25, -42], [-22, -26], [-28, -12], [-35, -18], [-32, -36]],
    // Frente austral curvado
    [[-52, -52], [-48, -32], [-54, -16], [-58, -26], [-55, -46]]
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

  function geoPolygon(proj, pts, r, fill, op, smooth = false) {
    const q = pts.map((c) => proj(c[0], c[1]));
    if (!q.some((v) => v.vis)) return '';
    const mapped = q.map((v) => {
      let x = v.x;
      let y = v.y;
      if (!v.vis) {
        const len = Math.hypot(x, y) || 1;
        x /= len;
        y /= len;
      }
      return [x * r, y * r];
    });

    if (smooth) {
      const pathData = smoothPolygonPath(mapped);
      return `<path d="${pathData}" fill="${fill}" opacity="${op}" />`;
    }

    const str = mapped.map((pt) => `${n(pt[0])},${n(pt[1])}`).join(' ');
    return `<polygon points="${str}" fill="${fill}" opacity="${op}" stroke="${fill}" stroke-width="0.3" stroke-linejoin="round" />`;
  }

  function geoCircle(proj, lat, lon, diameterKm, bodyKm, r, fill, op, scale = 1) {
    const rho = ((diameterKm * scale) / 2) / bodyKm;
    if (rho * r < 0.6) return '';
    const p = lat * D2R;
    const l = lon * D2R;
    const pts = [];
    for (let i = 0; i < 20; i += 1) {
      const b = (i / 20) * Math.PI * 2;
      const lat2 = Math.asin(Math.sin(p) * Math.cos(rho) + Math.cos(p) * Math.sin(rho) * Math.cos(b));
      const lon2 = l + Math.atan2(Math.sin(b) * Math.sin(rho) * Math.cos(p), Math.cos(rho) - Math.sin(p) * Math.sin(lat2));
      pts.push([lat2 / D2R, lon2 / D2R]);
    }
    return geoPolygon(proj, pts, r, fill, op, true);
  }

  /* Rasgos geográficos de Marte: albedos naturales, cañones integrados y atmósfera suave (sin ramas ni lunares) */
  function renderMarsFeatures(proj, r) {
    const km = BODY_KM.mars;
    let out = '';

    // 1. Grandes regiones de albedo oscuro difusas (Syrtis Major, Sinus Sabaeus, Acidalia Planitia, Mare Erythraeum)
    const MARS_DARK_REGIONS = [
      // Acidalia Planitia (tierras bajas del norte)
      [[42, -50], [54, -40], [55, -18], [44, -14], [32, -30], [34, -46]],
      // Sinus Meridiani / Sinus Sabaeus (cinturón oscuro ecuatorial)
      [[3, -24], [9, -8], [2, 14], [-8, 22], [-11, 0], [-5, -18]],
      // Mare Erythraeum / Margaritifer
      [[-20, -42], [-14, -26], [-26, -16], [-36, -30], [-30, -50]],
      // Solis Lacus ("El Ojo de Marte") - forma orgánica suave
      [[-26, -88], [-22, -80], [-25, -74], [-31, -78], [-31, -86]],
      // Mare Tyrrhenum y borde de Hellas
      [[-16, 56], [-8, 70], [-20, 84], [-30, 68], [-24, 52]]
    ];

    MARS_DARK_REGIONS.forEach((pts) => {
      out += geoPolygon(proj, pts, r, '#4a1508', 0.46, true);
    });

    // 2. Valles Marineris modelado como un rift geológico fluido y suave (sin ramas de palo secas)
    const VALLES_MARINERIS = [
      [-10, -86], [-12, -72], [-14, -58], [-11, -48], [-13, -58], [-15, -72], [-12, -86]
    ];
    out += geoPolygon(proj, VALLES_MARINERIS, r, '#3b1006', 0.48, true);

    // 3. Meseta de Tharsis: elevación orográfica cálida y suave
    const THARSIS_BULGE = [[28, -125], [20, -96], [-12, -98], [-22, -122], [4, -135]];
    out += geoPolygon(proj, THARSIS_BULGE, r, '#d96c34', 0.22, true);

    // 4. Olympus Mons y Tharsis Montes: relieve orográfico con calderas difusas y sombras naturales (sin lunares negros)
    const VOLCANOES = [
      { lat: 18.65, lon: -133.8, d: 520 }, // Olympus Mons
      { lat: 11.8, lon: -104.5, d: 360 },  // Ascraeus
      { lat: 1.5, lon: -113.4, d: 340 },   // Pavonis
      { lat: -8.3, lon: -120.1, d: 380 }   // Arsia
    ];
    VOLCANOES.forEach((v) => {
      out += geoCircle(proj, v.lat, v.lon, v.d, km, r, '#6a220e', 0.35);
      out += geoCircle(proj, v.lat - 1, v.lon + 1, v.d * 0.45, km, r, '#2c0b04', 0.45);
    });

    // 5. Casquete Polar Norte (Planum Boreum): escarcha suave y translúcida (sin pegatinas blancas rígidas)
    const NORTH_CAP = [
      [78, -180], [80, -135], [83, -90], [81, -45], [84, 0], [81, 45], [83, 90], [80, 135]
    ];
    out += geoPolygon(proj, NORTH_CAP, r, '#ffedd5', 0.52, true);

    return out;
  }

  /* Rasgos geográficos de la Luna: cara visible con mares orgánicos y albedo suave (sin radios de rueda de bicicleta) */
  function renderMoonFeatures(proj, r) {
    const km = BODY_KM.moon;
    let out = '';

    // 1. Mares basálticos lunares con la fisonomía real de la cara visible ("Man in the Moon")
    const PROCELLARUM_IMBRIUM = [
      [58, -45], [52, -20], [42, -10], [32, -12], [26, -20], [32, -36],
      [42, -52], [54, -68], [44, -76], [28, -74], [14, -68], [-4, -62],
      [-14, -40], [-8, -24], [6, -22], [18, -32], [24, -46]
    ];
    const SERENITATIS_TRANQUILLITATIS = [
      [36, 10], [34, 25], [24, 32], [14, 36], [4, 32], [-2, 22],
      [4, 14], [12, 10], [22, 14], [28, 8]
    ];
    const MARE_CRISIUM = [
      [22, 54], [20, 64], [14, 66], [12, 56], [16, 52]
    ];
    const FOECUNDITATIS_NECTARIS = [
      [2, 46], [-4, 56], [-14, 54], [-20, 42], [-14, 32], [-8, 36]
    ];
    const MARE_NUBIUM = [
      [-14, -20], [-18, -10], [-26, -14], [-28, -26], [-22, -30]
    ];

    out += geoPolygon(proj, PROCELLARUM_IMBRIUM, r, '#2d3748', 0.52, true);
    out += geoPolygon(proj, SERENITATIS_TRANQUILLITATIS, r, '#334155', 0.48, true);
    out += geoPolygon(proj, MARE_CRISIUM, r, '#252f3e', 0.55, true);
    out += geoPolygon(proj, FOECUNDITATIS_NECTARIS, r, '#334155', 0.44, true);
    out += geoPolygon(proj, MARE_NUBIUM, r, '#2d3748', 0.46, true);

    // 2. Cráter Tycho: resplandor de albedo difuso y natural (sin líneas rectas de rayos geométricos)
    const tychoProj = proj(-43.3, -11.4);
    if (tychoProj.vis) {
      const tx = tychoProj.x * r;
      const ty = tychoProj.y * r;
      // Halo brillante de eyección con gradiente difuso
      out += `<circle cx="${n(tx)}" cy="${n(ty)}" r="${n(r * 0.16)}" fill="#f8fafc" opacity="0.18" />`;
      out += `<circle cx="${n(tx)}" cy="${n(ty)}" r="${n(r * 0.08)}" fill="#ffffff" opacity="0.45" />`;
      out += `<circle cx="${n(tx)}" cy="${n(ty)}" r="${n(r * 0.035)}" fill="#ffffff" opacity="0.9" />`;
    }

    // 3. Cráteres emblemáticos Copernicus, Kepler y Aristarchus (puntos de albedo natural)
    const BRIGHT_CRATERS = [
      [9.6, -20.1, 95],   // Copernicus
      [8.1, -38.0, 35],   // Kepler
      [23.7, -47.4, 42]   // Aristarchus
    ];
    BRIGHT_CRATERS.forEach(([clat, clon, cdiam]) => {
      const p = proj(clat, clon);
      if (p.vis) {
        const px = p.x * r;
        const py = p.y * r;
        out += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(r * 0.055)}" fill="#f1f5f9" opacity="0.22" />`;
        out += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(r * 0.022)}" fill="#ffffff" opacity="0.75" />`;
      }
    });

    return out;
  }

  /* Rasgos geográficos de la Tierra: continentes verdes fidedignos y nubes etéreas fluidas */
  function renderEarthFeatures(proj, r) {
    const km = BODY_KM.earth;
    let out = '';

    // 1. Continentes verdes reconocibles (América, África, Europa, etc.)
    Object.keys(EARTH_LAND).forEach((k) => {
      out += geoPolygon(proj, EARTH_LAND[k], r, '#247a4b', 0.94, true);
    });

    // 2. Desierto del Sáhara y península Arábiga en tono ocre dorado natural
    out += geoPolygon(proj, EARTH_SAHARA, r, '#c8a25c', 0.85, true);

    // 3. Casquete polar ártico suave
    out += geoCircle(proj, 85, 0, 2400, km, r, '#f8fafc', 0.72);

    // 4. Nubes atmosféricas etéreas y translúcidas (curvas suaves con velo semitransparente)
    EARTH_CLOUD_BANDS.forEach((pts) => {
      out += geoPolygon(proj, pts, r, '#ffffff', 0.32, true);
    });

    return out;
  }

  /* ---------- Planeta volumétrico 3D sin líneas radiales en el centro ---------- */

  function planetBody(kind, r, opts = {}) {
    const { seed = 1, uid = `${kind}${seed}` } = opts;
    const view = Object.assign({}, BODY_VIEW[kind], opts.view || {});
    const proj = makeProjector(view.lat0, view.lon0);

    const baseConfig = {
      moon: {
        baseColor: '#8a99ad',
        darkGrad: '#111827',
        midGrad: '#64748b',
        lightGrad: '#e2e8f0',
        atmoColor: '#94a3b8',
        atmoOp: 0
      },
      mars: {
        baseColor: '#b44214',
        darkGrad: '#2e0a03',
        midGrad: '#a83c12',
        lightGrad: '#ea7238',
        atmoColor: '#fed7aa',
        atmoOp: 0.16
      },
      earth: {
        baseColor: '#1d4ed8',
        darkGrad: '#071536',
        midGrad: '#1d4ed8',
        lightGrad: '#60a5fa',
        atmoColor: '#38bdf8',
        atmoOp: 0.35
      }
    }[kind] || {
      baseColor: '#64748b',
      darkGrad: '#0f172a',
      midGrad: '#475569',
      lightGrad: '#cbd5e1',
      atmoColor: '#94a3b8',
      atmoOp: 0.1
    };

    let featuresSvg = '';
    if (kind === 'mars') {
      featuresSvg = renderMarsFeatures(proj, r);
    } else if (kind === 'moon') {
      featuresSvg = renderMoonFeatures(proj, r);
    } else {
      featuresSvg = renderEarthFeatures(proj, r);
    }

    const atmoRim = baseConfig.atmoOp > 0
      ? `<circle r="${n(r * 1.008)}" fill="none" stroke="${baseConfig.atmoColor}" stroke-width="1.2" opacity="${n(baseConfig.atmoOp * 1.2)}" />`
      : '';

    return `
      <g id="${uid}">
        <defs>
          <clipPath id="clip-${uid}">
            <circle r="${n(r * 0.99)}" />
          </clipPath>
          <radialGradient id="sphereLight-${uid}" cx="35%" cy="32%" r="68%">
            <stop offset="0%" stop-color="${baseConfig.lightGrad}" />
            <stop offset="55%" stop-color="${baseConfig.midGrad}" />
            <stop offset="100%" stop-color="${baseConfig.darkGrad}" />
          </radialGradient>
          <radialGradient id="sphereShade-${uid}" cx="32%" cy="30%" r="80%">
            <stop offset="42%" stop-color="#020617" stop-opacity="0" />
            <stop offset="82%" stop-color="#020617" stop-opacity="0.48" />
            <stop offset="100%" stop-color="#020617" stop-opacity="0.82" />
          </radialGradient>
        </defs>
        ${atmoRim}
        <!-- Base esférica continua y curvada sin líneas radiales en el centro -->
        <circle r="${n(r)}" fill="url(#sphereLight-${uid})" />
        <g clip-path="url(#clip-${uid})">
          ${featuresSvg}
          <!-- Terminador nocturno y sombreado esférico tridimensional -->
          ${M.facetShade ? M.facetShade(r, { seed: seed + 7, strength: kind === 'earth' ? 0.12 : 0.18 }) : ''}
          <circle r="${n(r)}" fill="url(#sphereShade-${uid})" />
        </g>
      </g>
    `;
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
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      ring.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
      inner.push([cx + Math.cos(a) * rx * 0.72, cy + 0.5 + Math.sin(a) * ry * 0.7]);
    }
    return `<path d="${smoothPolygonPath(ring)}" fill="${rim}" opacity="0.6" /><path d="${smoothPolygonPath(inner)}" fill="${dark}" opacity="0.75" />`;
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
      sky: 'linear-gradient(180deg, #02040c 0%, #0c1224 38%, #3a1a22 68%, #7c2d12 100%)',
      starColors: ['#fef3c7', '#fed7aa', '#ffffff'],
      ridgeFar: '#522016',
      ridgeMid: '#702b1a',
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
        ? `<g transform="translate(246,34)">${planetBody('earth', 13, { seed: 5, uid: 'cardearth' })}</g>`
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
      { x: 52, y: 96, r: 8, s: 3 },
      { x: 248, y: 112, r: 6, s: 4 },
      { x: 222, y: 40, r: 5, s: 6 }
    ].forEach((a) => {
      dust += `<g transform="translate(${a.x},${a.y})" opacity="0.65">${M.asteroidBody(a.r, { seed: a.s, uid: `carddust${a.s}` })}
        </g>`;
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

  /* ---------- Fondo cósmico (horizontal y vertical) sin mallas residuales en el espacio ---------- */

  function homeBackdrop(orientation) {
    const land = orientation !== 'portrait';
    const W = land ? 1920 : 1080;
    const H = land ? 1080 : 1920;
    const k = land ? 'l' : 'p';
    const pos = land
      ? { moon: [215, 200, 96], earth: [150, 1085, 310], eros: [1525, 240], ald: [1690, 185], mars: [1735, 595, 118] }
      : { moon: [200, 300, 120], earth: [90, 2040, 420], eros: [800, 380], ald: [930, 260], mars: [900, 1180, 150] };

    const moon = `<g transform="translate(${pos.moon[0]},${pos.moon[1]})" opacity="0.94">${planetBody('moon', pos.moon[2], { seed: 101, uid: 'bgmoon' + k })}</g>`;
    const earth =
      `<g transform="translate(${pos.earth[0]},${pos.earth[1]})">` +
      planetBody('earth', pos.earth[2], { seed: 202, uid: 'bgearth' + k }) +
      '</g>';
    // Asteroide 433 Eros realista (con su forma alargada en silla de montar Himeros)
    const eros = `<g transform="translate(${pos.eros[0]},${pos.eros[1]}) rotate(-14)" opacity="0.9">${asteroidErosBody(pos.eros[2] || 32, { seed: 303, uid: 'bgeros' + k })}</g>`;
    const aldebaran = `<g transform="translate(${pos.ald[0]},${pos.ald[1]})"><polygon points="0,-24 6,-6 24,0 6,6 0,24 -6,6 -24,0 -6,-6" fill="#fb923c" opacity="0.55" /><polygon points="0,-13 3.5,-3.5 13,0 3.5,3.5 0,13 -3.5,3.5 -13,0 -3.5,-3.5" fill="#fef08a" /><polygon points="0,-5 5,0 0,5 -5,0" fill="#ffffff" /></g>`;
    // Marte volumétrico sin líneas radiales en el centro, sin bolas blancas y sin mallas de terreno alrededor
    const mars = `<g transform="translate(${pos.mars[0]},${pos.mars[1]})" opacity="0.96">${planetBody('mars', pos.mars[2], { seed: 404, uid: 'bgmars' + k })}</g>`;

    return `
      <defs>
        <linearGradient id="bgCosmosGrad-${k}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#050814" />
          <stop offset="42%" stop-color="#070c1d" />
          <stop offset="85%" stop-color="#091228" />
          <stop offset="100%" stop-color="#0d1834" />
        </linearGradient>
      </defs>
      <!-- Espacio exterior profundo y limpio (sin texturas poligonales extrañas alrededor de Marte) -->
      <rect width="${W}" height="${H}" fill="url(#bgCosmosGrad-${k})" />
      <ellipse cx="${W / 2}" cy="${H * 0.52}" rx="${W * 0.53}" ry="${H * 0.31}" transform="rotate(-12 ${W / 2} ${H * 0.52})" fill="none" stroke="rgba(148, 163, 184, 0.08)" stroke-width="1" />
      <ellipse cx="${W / 2}" cy="${H * 0.5}" rx="${W * 0.4}" ry="${H * 0.21}" transform="rotate(7 ${W / 2} ${H * 0.5})" fill="none" stroke="rgba(126, 232, 250, 0.06)" stroke-width="1" />
      <g>${stars(land ? 61 : 62, land ? 95 : 125, H, W, ['#f8fafc', '#bae6fd', '#7ee8fa', '#fed7aa'])}</g>
      ${moon}
      ${earth}
      ${aldebaran}
      ${eros}
      ${mars}
    `;
  }

  M.lowPolyBody = lowPolyBody;
  if (!M.asteroidErosBody) {
    M.asteroidErosBody = asteroidErosBody;
  }
  M.planetBody = planetBody;
  M.groundMesh = groundMesh;
  M.chapterScene = chapterScene;
  M.homeBackdrop = homeBackdrop;
})();
