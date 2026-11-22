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
        atmoOp: 0,
        texture: 'assets/textures/luna-4k.jpg'
      },
      mars: {
        baseColor: '#b44214',
        darkGrad: '#2e0a03',
        midGrad: '#a83c12',
        lightGrad: '#ea7238',
        atmoColor: '#fed7aa',
        atmoOp: 0.16,
        texture: 'assets/textures/marte-2k.jpg'
      },
      earth: {
        baseColor: '#1d4ed8',
        darkGrad: '#071536',
        midGrad: '#1d4ed8',
        lightGrad: '#60a5fa',
        atmoColor: '#38bdf8',
        atmoOp: 0.35,
        texture: 'assets/textures/tierra-4k.jpg'
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
        <!-- Base esférica continua -->
        <circle r="${n(r)}" fill="url(#sphereLight-${uid})" />
        <g clip-path="url(#clip-${uid})">
          ${baseConfig.texture
            ? `<image href="${baseConfig.texture}" x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}" preserveAspectRatio="xMidYMid slice" />`
            : `${featuresSvg}${M.facetShade ? M.facetShade(r, { seed: seed + 7, strength: kind === 'earth' ? 0.12 : 0.18 }) : ''}`
          }
          <!-- Terminador nocturno y sombreado esférico tridimensional -->
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

  /* ---------- Escenas de las tarjetas (La Luna, Marte, Espacio profundo) ---------- */

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

  /* ---------- Portadas de misión realistas fotográficas (sin formas low poly) ---------- */

  function realisticMoonCard() {
    const u = 'card-moon';
    return `
      <div class="chapter-scene" data-scene="moon" style="background:#01040a" aria-hidden="true">
        <svg class="w-full h-full block" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${u}-space-tint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#020617" stop-opacity="0.25" />
              <stop offset="55%" stop-color="#020617" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#030712" stop-opacity="0.95" />
            </linearGradient>
            <clipPath id="${u}-earth-c">
              <circle cx="316" cy="46" r="23" />
            </clipPath>
            <clipPath id="${u}-ground-c">
              <path d="M -10,122 Q 95,108 200,118 Q 300,112 410,118 L 410,210 L -10,210 Z" />
            </clipPath>
            <linearGradient id="${u}-ground-shade" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.2" />
              <stop offset="40%" stop-color="#0f172a" stop-opacity="0" />
              <stop offset="80%" stop-color="#020617" stop-opacity="0.45" />
              <stop offset="100%" stop-color="#020617" stop-opacity="0.85" />
            </linearGradient>
            <radialGradient id="${u}-crater-1" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.5" />
              <stop offset="35%" stop-color="#1e293b" stop-opacity="0.75" />
              <stop offset="75%" stop-color="#020617" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#000000" />
            </radialGradient>
            <radialGradient id="${u}-crater-2" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.45" />
              <stop offset="40%" stop-color="#1e293b" stop-opacity="0.7" />
              <stop offset="85%" stop-color="#020617" stop-opacity="0.95" />
            </radialGradient>
            <linearGradient id="${u}-mli-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="35%" stop-color="#f59e0b" />
              <stop offset="75%" stop-color="#b45309" />
              <stop offset="100%" stop-color="#78350f" />
            </linearGradient>
            <linearGradient id="${u}-strut" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="45%" stop-color="#cbd5e1" />
              <stop offset="100%" stop-color="#475569" />
            </linearGradient>
            <linearGradient id="${u}-solar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3b82f6" />
              <stop offset="50%" stop-color="#1d4ed8" />
              <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>
          </defs>

          <!-- Fondo estelar real de la Vía Láctea -->
          <rect width="400" height="200" fill="#01040a" />
          <image href="assets/textures/via-lactea.jpg" x="0" y="0" width="400" height="200" preserveAspectRatio="xMidYMid slice" opacity="0.85" />
          <rect width="400" height="200" fill="url(#${u}-space-tint)" />

          <!-- Salida de la Tierra (Earthrise) con atmósfera y textura fotográfica real 4K -->
          <g>
            <circle cx="316" cy="46" r="25.5" fill="none" stroke="rgba(96, 165, 250, 0.45)" stroke-width="2.5" />
            <circle cx="316" cy="46" r="24.2" fill="none" stroke="rgba(191, 219, 254, 0.6)" stroke-width="0.8" />
            <g clip-path="url(#${u}-earth-c)">
              <rect x="290" y="20" width="52" height="52" fill="#0c4a6e" />
              <image href="assets/textures/tierra-4k.jpg" x="290" y="20" width="52" height="52" preserveAspectRatio="xMidYMid slice" />
              <image href="assets/textures/nubes-tierra.jpg" x="290" y="20" width="52" height="52" preserveAspectRatio="xMidYMid slice" opacity="0.55" style="mix-blend-mode:screen" />
              <path d="M 316,23 A 23 23 0 0 1 316,69 A 15 23 0 0 1 316,23 Z" fill="#020617" opacity="0.78" />
            </g>
          </g>

          <!-- Relieve lunar lejano en el horizonte -->
          <path d="M -10,112 Q 70,98 160,106 T 410,104 L 410,210 L -10,210 Z" fill="#151d2b" opacity="0.75" />
          <path d="M -10,118 Q 80,106 180,114 T 410,111 L 410,210 L -10,210 Z" fill="#1e293b" opacity="0.88" />

          <!-- Suelo lunar realista con textura fotográfica real 4K (luna-4k.jpg) -->
          <g clip-path="url(#${u}-ground-c)">
            <rect x="-10" y="105" width="420" height="105" fill="#334155" />
            <image href="assets/textures/luna-4k.jpg" x="-10" y="90" width="420" height="120" preserveAspectRatio="xMidYMid slice" opacity="0.88" />
            <rect x="-10" y="105" width="420" height="105" fill="url(#${u}-ground-shade)" />

            <!-- Cráteres suaves y geológicos con relieve natural (sin polígonos) -->
            <g transform="translate(325, 158)">
              <ellipse cx="0" cy="0" rx="46" ry="14" fill="none" stroke="rgba(241, 245, 249, 0.45)" stroke-width="1.8" />
              <ellipse cx="-1.5" cy="1" rx="43" ry="12.5" fill="url(#${u}-crater-1)" />
              <ellipse cx="3" cy="2" rx="36" ry="9" fill="#010409" opacity="0.7" />
            </g>

            <g transform="translate(78, 146)">
              <ellipse cx="0" cy="0" rx="26" ry="8" fill="none" stroke="rgba(241, 245, 249, 0.35)" stroke-width="1.4" />
              <ellipse cx="-1" cy="0.8" rx="24" ry="7" fill="url(#${u}-crater-2)" />
              <ellipse cx="2" cy="1.5" rx="19" ry="5" fill="#010409" opacity="0.65" />
            </g>

            <!-- Rocas redondeadas naturales con sombra de contacto -->
            <ellipse cx="120" cy="172" rx="13" ry="4" fill="rgba(0,0,0,0.65)" />
            <path d="M 109,170 Q 112,160 120,161 Q 128,162 131,170 Q 126,174 116,173 Z" fill="#64748b" stroke="#334155" stroke-width="0.7" />
            <path d="M 112,163 Q 117,161 123,162" fill="none" stroke="#f1f5f9" stroke-width="1.2" opacity="0.8" stroke-linecap="round" />

            <ellipse cx="264" cy="138" rx="8" ry="2.6" fill="rgba(0,0,0,0.55)" />
            <path d="M 257,137 Q 260,131 265,132 Q 270,133 271,137 Q 267,140 261,139 Z" fill="#475569" stroke="#1e293b" stroke-width="0.6" />
          </g>

          <!-- Sonda Lunar Surveyor 3 / Chang'e realista integrada en el escenario -->
          <g transform="translate(195, 144)">
            <ellipse cx="12" cy="19" rx="38" ry="8" fill="rgba(2, 6, 23, 0.65)" />
            <polygon points="-8,18 36,22 48,19 8,16" fill="rgba(2, 6, 23, 0.45)" />

            <!-- Huellas de los 3 platos de aterrizaje -->
            <ellipse cx="-34" cy="17" rx="8" ry="3" fill="#0f172a" />
            <ellipse cx="32" cy="17" rx="8" ry="3" fill="#0f172a" />
            <ellipse cx="2" cy="20" rx="9" ry="3.5" fill="#0f172a" />

            <!-- Platos de contacto en aluminio -->
            <ellipse cx="-34" cy="16" rx="7.5" ry="2.6" fill="#e2e8f0" stroke="#64748b" stroke-width="0.8" />
            <ellipse cx="32" cy="16" rx="7.5" ry="2.6" fill="#cbd5e1" stroke="#475569" stroke-width="0.8" />
            <ellipse cx="2" cy="19" rx="8.5" ry="2.8" fill="#f8fafc" stroke="#64748b" stroke-width="0.8" />

            <!-- Patas de soporte y amortiguadores hidráulicos de titanio -->
            <line x1="-12" y1="-8" x2="-34" y2="16" stroke="url(#${u}-strut)" stroke-width="3" stroke-linecap="round" />
            <line x1="12" y1="-8" x2="32" y2="16" stroke="url(#${u}-strut)" stroke-width="3" stroke-linecap="round" />
            <line x1="0" y1="-2" x2="2" y2="19" stroke="url(#${u}-strut)" stroke-width="3.2" stroke-linecap="round" />
            <line x1="-6" y1="-12" x2="-26" y2="10" stroke="#64748b" stroke-width="1.3" />
            <line x1="6" y1="-12" x2="24" y2="10" stroke="#475569" stroke-width="1.3" />

            <!-- Chasis central con aislamiento térmico dorado (Kapton MLI) -->
            <polygon points="-16,-12 0,-20 16,-12 14,2 0,6 -14,2" fill="url(#${u}-mli-gold)" stroke="#78350f" stroke-width="0.9" stroke-linejoin="round" />
            <polygon points="-16,-12 0,-20 0,6 -14,2" fill="rgba(255, 255, 255, 0.22)" />
            <path d="M -12,-8 L -4,-14 L -6,-2" fill="none" stroke="#fef08a" stroke-width="0.9" opacity="0.8" />
            <path d="M 2,-14 L 10,-8 L 8,-1" fill="none" stroke="#b45309" stroke-width="0.8" opacity="0.9" />

            <!-- Compartimentos de aviónica y baterías blancas térmicas -->
            <rect x="-8" y="-10" width="7" height="9" rx="1" fill="#f8fafc" stroke="#64748b" stroke-width="0.7" />
            <rect x="2" y="-10" width="7" height="9" rx="1" fill="#e2e8f0" stroke="#64748b" stroke-width="0.7" />

            <!-- Mástil central -->
            <line x1="0" y1="-20" x2="0" y2="-44" stroke="#e2e8f0" stroke-width="2.2" stroke-linecap="round" />

            <!-- Panel solar fotovoltaico azul profundo -->
            <g transform="translate(0, -42) rotate(-14)">
              <rect x="-14" y="-11" width="28" height="15" rx="1.2" fill="url(#${u}-solar)" stroke="#60a5fa" stroke-width="0.8" />
              <line x1="-5" y1="-11" x2="-5" y2="4" stroke="#93c5fd" stroke-width="0.6" opacity="0.6" />
              <line x1="5" y1="-11" x2="5" y2="4" stroke="#93c5fd" stroke-width="0.6" opacity="0.6" />
              <line x1="-14" y1="-3" x2="14" y2="-3" stroke="#93c5fd" stroke-width="0.6" opacity="0.6" />
              <line x1="-12" y1="-9" x2="-2" y2="-9" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity="0.85" />
            </g>

            <!-- Antena planar dirigida hacia la Tierra -->
            <g transform="translate(10, -32) rotate(22)">
              <ellipse cx="0" cy="0" rx="9" ry="5.5" fill="#cbd5e1" stroke="#475569" stroke-width="0.8" />
              <ellipse cx="-1.5" cy="-0.5" rx="6.5" ry="3.8" fill="#f8fafc" />
              <line x1="0" y1="0" x2="5" y2="-3" stroke="#e2e8f0" stroke-width="1.2" />
            </g>
          </g>
        </svg>
      </div>
    `;
  }

  function realisticMarsCard() {
    const u = 'card-mars';
    return `
      <div class="chapter-scene" data-scene="mars" style="background:#150604" aria-hidden="true">
        <svg class="w-full h-full block" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${u}-sky-real" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#190704" />
              <stop offset="35%" stop-color="#3d1309" />
              <stop offset="70%" stop-color="#803318" />
              <stop offset="100%" stop-color="#ba5d32" />
            </linearGradient>
            <clipPath id="${u}-ground-c">
              <path d="M -10,122 Q 90,110 190,118 Q 300,112 410,117 L 410,210 L -10,210 Z" />
            </clipPath>
            <linearGradient id="${u}-ground-shade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#d97706" stop-opacity="0.25" />
              <stop offset="30%" stop-color="#000000" stop-opacity="0" />
              <stop offset="85%" stop-color="#451a03" stop-opacity="0.55" />
              <stop offset="100%" stop-color="#2c0b02" stop-opacity="0.9" />
            </linearGradient>
            <radialGradient id="${u}-yogi-grad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#78350f" />
              <stop offset="35%" stop-color="#451a03" />
              <stop offset="75%" stop-color="#261005" />
              <stop offset="100%" stop-color="#140602" />
            </radialGradient>
            <linearGradient id="${u}-soj-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fde047" />
              <stop offset="45%" stop-color="#f59e0b" />
              <stop offset="100%" stop-color="#b45309" />
            </linearGradient>
            <linearGradient id="${u}-solar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2563eb" />
              <stop offset="50%" stop-color="#1d4ed8" />
              <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>
          </defs>

          <!-- Atmósfera marciana con gradiente real de dispersión de polvo rojizo -->
          <rect width="400" height="200" fill="url(#${u}-sky-real)" />
          <image href="assets/textures/via-lactea.jpg" x="0" y="0" width="400" height="85" preserveAspectRatio="xMidYMid slice" opacity="0.18" />

          <!-- Fobos en el cielo de Ares Vallis -->
          <g transform="translate(68, 36) rotate(-18)">
            <ellipse cx="0" cy="0" rx="9" ry="7.2" fill="#a89284" />
            <circle cx="2" cy="1" r="7" fill="#3b2016" opacity="0.65" />
            <ellipse cx="-3" cy="-1" rx="2.5" ry="1.8" fill="#523224" />
            <circle cx="-3.2" cy="-1.1" r="1.4" fill="#24120c" />
          </g>

          <!-- Colinas lejanas de Ares Vallis (Twin Peaks) con calina de polvo -->
          <path d="M -10,114 Q 50,99 110,107 Q 170,93 230,109 Q 320,97 410,111 L 410,210 L -10,210 Z" fill="#692512" opacity="0.75" />
          <path d="M -10,118 Q 80,105 180,114 T 410,112 L 410,210 L -10,210 Z" fill="#883618" opacity="0.65" />

          <!-- Superficie marciana con textura real de Marte (marte-2k.jpg) -->
          <g clip-path="url(#${u}-ground-c)">
            <rect x="-10" y="105" width="420" height="105" fill="#9a3412" />
            <image href="assets/textures/marte-2k.jpg" x="-10" y="85" width="420" height="125" preserveAspectRatio="xMidYMid slice" opacity="0.92" />
            <rect x="-10" y="105" width="420" height="105" fill="url(#${u}-ground-shade)" />

            <!-- Dunas de arena y ondulaciones de viento suaves -->
            <path d="M -10,146 Q 60,136 140,149 Q 220,139 310,153 T 410,145" fill="none" stroke="#ea580c" stroke-width="1.8" opacity="0.45" />
            <path d="M -10,166 Q 80,156 170,169 Q 260,157 350,171 T 410,163" fill="none" stroke="#ea580c" stroke-width="1.4" opacity="0.35" />

            <!-- Megabloque basáltico redondeado "Yogi" -->
            <g transform="translate(305, 150)">
              <ellipse cx="2" cy="11" rx="26" ry="7" fill="rgba(35, 10, 5, 0.75)" />
              <path d="M -22,8 C -25,-9 -12,-15 3,-12 C 16,-9 22,-2 20,8 C 12,14 -14,14 -22,8 Z" fill="url(#${u}-yogi-grad)" stroke="#381404" stroke-width="0.8" />
              <path d="M -15,-4 Q 3,-11 14,-6" fill="none" stroke="#fb923c" stroke-width="1.6" opacity="0.8" stroke-linecap="round" />
              <path d="M -8,0 Q 4,-4 12,1" fill="none" stroke="#d97706" stroke-width="1" opacity="0.65" stroke-linecap="round" />
            </g>

            <!-- Rocas "Barnacle Bill" y suelo del valle -->
            <g transform="translate(86, 162)">
              <ellipse cx="2" cy="7" rx="14" ry="4" fill="rgba(35, 10, 5, 0.65)" />
              <path d="M -11,5 Q -6,-3 2,-2 Q 9,-1 11,5 Q 4,8 -6,7 Z" fill="#522312" stroke="#2d1107" stroke-width="0.6" />
              <path d="M -8,2 Q 1,-1 7,2" fill="none" stroke="#f97316" stroke-width="1.1" opacity="0.75" />
            </g>
          </g>

          <!-- Mars Pathfinder Lander (pétalos abiertos y estación) -->
          <g transform="translate(165, 142)">
            <ellipse cx="6" cy="18" rx="34" ry="8" fill="rgba(30, 8, 4, 0.65)" />
            <polygon points="-28,14 -8,8 -2,18" fill="#1e293b" stroke="#f59e0b" stroke-width="0.9" />
            <polygon points="32,14 12,8 6,18" fill="#1e293b" stroke="#f59e0b" stroke-width="0.9" />
            <polygon points="-8,18 20,18 6,24" fill="#0f172a" stroke="#d97706" stroke-width="0.9" />

            <!-- Cuerpo central de aviónica y mástil meteorológico ASI/MET -->
            <rect x="-6" y="2" width="16" height="12" rx="1.5" fill="#f8fafc" stroke="#64748b" stroke-width="0.8" />
            <rect x="-4" y="4" width="12" height="4" fill="#cbd5e1" />
            <line x1="2" y1="2" x2="2" y2="-22" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round" />
            <circle cx="2" cy="-22" r="2.2" fill="#f8fafc" stroke="#475569" stroke-width="0.6" />
          </g>

          <!-- Rover Sojourner fotorrealista con sus 6 ruedas rocker-bogie -->
          <g transform="translate(225, 154)">
            <ellipse cx="3" cy="14" rx="22" ry="5.5" fill="rgba(30, 8, 4, 0.72)" />

            <!-- Ruedas traseras (3 ruedas del lado lejano) -->
            <ellipse cx="-13" cy="9" rx="3.8" ry="4.5" fill="#475569" stroke="#1e293b" stroke-width="0.7" />
            <ellipse cx="0" cy="9" rx="3.8" ry="4.5" fill="#475569" stroke="#1e293b" stroke-width="0.7" />
            <ellipse cx="13" cy="9" rx="3.8" ry="4.5" fill="#475569" stroke="#1e293b" stroke-width="0.7" />

            <!-- Chasis cilíndrico / caja dorada -->
            <rect x="-16" y="0" width="32" height="10" rx="2" fill="url(#${u}-soj-gold)" stroke="#78350f" stroke-width="0.8" />

            <!-- Panel solar superior -->
            <rect x="-18" y="-3.5" width="36" height="4.5" rx="1" fill="url(#${u}-solar)" stroke="#60a5fa" stroke-width="0.7" />
            <line x1="-15" y1="-1.5" x2="15" y2="-1.5" stroke="#93c5fd" stroke-width="0.5" opacity="0.7" />

            <!-- Mecanismo Rocker-Bogie de titanio -->
            <line x1="-12" y1="4" x2="-14" y2="12" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round" />
            <line x1="-2" y1="3" x2="0" y2="12" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round" />
            <line x1="8" y1="4" x2="14" y2="12" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round" />

            <!-- Ruedas delanteras con tacos metálicos (3 ruedas del lado cercano) -->
            <g>
              <ellipse cx="-14" cy="12" rx="4.8" ry="5.8" fill="#e2e8f0" stroke="#475569" stroke-width="0.8" />
              <circle cx="-14" cy="12" r="2.2" fill="#2563eb" />
              <ellipse cx="0" cy="12" rx="4.8" ry="5.8" fill="#e2e8f0" stroke="#475569" stroke-width="0.8" />
              <circle cx="0" cy="12" r="2.2" fill="#2563eb" />
              <ellipse cx="14" cy="12" rx="4.8" ry="5.8" fill="#e2e8f0" stroke="#475569" stroke-width="0.8" />
              <circle cx="14" cy="12" r="2.2" fill="#2563eb" />
            </g>

            <!-- Antena látigo con esfera sensora -->
            <line x1="12" y1="-3" x2="14" y2="-20" stroke="#f8fafc" stroke-width="1.1" stroke-linecap="round" />
            <circle cx="14" cy="-20" r="1.6" fill="#facc15" />
          </g>
        </svg>
      </div>
    `;
  }

  function realisticDeepSpaceCard() {
    const u = 'card-deep';
    return `
      <div class="chapter-scene" data-scene="deep-space" style="background:#010309" aria-hidden="true">
        <svg class="w-full h-full block" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="${u}-eros-c">
              <path d="M 195,100 C 205,62 255,50 315,56 C 365,62 395,85 390,118 C 385,152 335,162 280,146 C 248,136 215,150 196,132 C 178,116 184,106 195,100 Z" />
            </clipPath>
            <radialGradient id="${u}-eros-light" cx="32%" cy="26%" r="72%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
              <stop offset="42%" stop-color="#0f172a" stop-opacity="0" />
              <stop offset="76%" stop-color="#020617" stop-opacity="0.75" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0.96" />
            </radialGradient>
            <linearGradient id="${u}-dish-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#f8fafc" />
              <stop offset="35%" stop-color="#cbd5e1" />
              <stop offset="75%" stop-color="#64748b" />
              <stop offset="100%" stop-color="#1e293b" />
            </linearGradient>
            <linearGradient id="${u}-pioneer-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="35%" stop-color="#f59e0b" />
              <stop offset="75%" stop-color="#b45309" />
              <stop offset="100%" stop-color="#78350f" />
            </linearGradient>
          </defs>

          <!-- Fondo estelar real de la Vía Láctea -->
          <rect width="400" height="200" fill="#010309" />
          <image href="assets/textures/via-lactea.jpg" x="0" y="0" width="400" height="200" preserveAspectRatio="xMidYMid slice" opacity="0.95" />
          <rect width="400" height="200" fill="radial-gradient(ellipse at 50% 50%, rgba(1,3,10,0.1) 0%, rgba(1,3,10,0.65) 100%)" />

          <!-- Asteroide 433 Eros en 3D con textura real NASA fotográfica (eros.jpg) -->
          <g>
            <ellipse cx="290" cy="106" rx="98" ry="54" fill="rgba(148, 163, 184, 0.08)" filter="blur(6px)" />

            <!-- Cuerpo volumétrico de Eros con textura real y terminador de sombra solar -->
            <g clip-path="url(#${u}-eros-c)">
              <rect x="170" y="45" width="235" height="130" fill="#475569" />
              <image href="assets/textures/eros.jpg" x="175" y="45" width="225" height="125" preserveAspectRatio="xMidYMid slice" opacity="0.96" />
              <rect x="170" y="45" width="235" height="130" fill="url(#${u}-eros-light)" />
              <ellipse cx="250" cy="80" rx="14" ry="8" fill="none" stroke="rgba(255, 255, 255, 0.35)" stroke-width="1.2" />
              <ellipse cx="251" cy="81" rx="12" ry="6.5" fill="#020617" opacity="0.55" />
            </g>
            <!-- Borde iluminado por el sol -->
            <path d="M 195,100 C 205,62 255,50 315,56 C 350,60 375,75 385,95" fill="none" stroke="rgba(248, 250, 252, 0.5)" stroke-width="1.2" />
          </g>

          <!-- Sonda Pioneer 10 / NEAR Shoemaker en gravedad cero -->
          <g transform="translate(105, 96)">
            <ellipse cx="4" cy="18" rx="28" ry="10" fill="rgba(96, 165, 250, 0.12)" filter="blur(3px)" />

            <!-- Pluma de RTGs (generadores nucleares) en celosía -->
            <line x1="-12" y1="8" x2="-44" y2="28" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />
            <line x1="-10" y1="12" x2="-42" y2="32" stroke="#64748b" stroke-width="1.4" stroke-linecap="round" />
            <rect x="-52" y="24" width="12" height="7" rx="1.5" fill="#475569" stroke="#94a3b8" stroke-width="0.8" />
            <rect x="-48" y="32" width="12" height="7" rx="1.5" fill="#334155" stroke="#64748b" stroke-width="0.8" />

            <!-- Pluma larga del magnetómetro hacia el espacio -->
            <line x1="8" y1="-8" x2="38" y2="-38" stroke="#cbd5e1" stroke-width="1.2" stroke-linecap="round" />
            <circle cx="38" cy="-38" r="2.2" fill="#f8fafc" />

            <!-- Bus hexagonal dorado envuelto en Kapton MLI -->
            <polygon points="-16,-6 4,-14 20,-6 16,12 -4,18 -18,10" fill="url(#${u}-pioneer-gold)" stroke="#78350f" stroke-width="0.9" stroke-linejoin="round" />
            <polygon points="-16,-6 4,-14 4,18 -18,10" fill="rgba(255, 255, 255, 0.22)" />
            <circle cx="-2" cy="2" r="3.2" fill="#d97706" />

            <!-- Antena parabólica de alta ganancia (2.74 m) realista orientada al observador -->
            <g transform="translate(2, -2) rotate(-16)">
              <ellipse cx="0" cy="0" rx="30" ry="22" fill="url(#${u}-dish-metal)" stroke="#94a3b8" stroke-width="1" />
              <ellipse cx="-1.5" cy="-0.5" rx="27" ry="19.5" fill="#334155" />
              <ellipse cx="-4" cy="-2" rx="24" ry="17" fill="#64748b" opacity="0.65" />
              <ellipse cx="-6" cy="-3" rx="20" ry="14" fill="#cbd5e1" opacity="0.5" />
              <ellipse cx="-8" cy="-4" rx="15" ry="10" fill="#f8fafc" opacity="0.6" />

              <line x1="0" y1="0" x2="-6" y2="-12" stroke="#f1f5f9" stroke-width="1.3" />
              <line x1="-14" y1="4" x2="-6" y2="-12" stroke="#cbd5e1" stroke-width="1.3" />
              <line x1="14" y1="4" x2="-6" y2="-12" stroke="#94a3b8" stroke-width="1.3" />
              <circle cx="-6" cy="-12" r="3" fill="#f8fafc" stroke="#475569" stroke-width="0.8" />
              <path d="M -24,-12 C -12,-20 8,-20 22,-12" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0.85" stroke-linecap="round" />
            </g>
          </g>
        </svg>
      </div>
    `;
  }

  function chapterScene(chapterId, machineSvg) {
    if (chapterId === 'moon') {
      return realisticMoonCard();
    }
    if (chapterId === 'mars') {
      return realisticMarsCard();
    }
    return realisticDeepSpaceCard();
  }

  /* ---------- Fondo cósmico (horizontal y vertical) sin mallas residuales en el espacio ---------- */

  function homeBackdrop(orientation) {
    const land = orientation !== 'portrait';
    const W = land ? 1920 : 1080;
    const H = land ? 1080 : 1920;
    const k = land ? 'l' : 'p';
    const pos = land
      ? { moon: [215, 200, 96], earth: [150, 1085, 310], eros: [1525, 240], mars: [1735, 595, 118] }
      : { moon: [200, 300, 120], earth: [90, 2040, 420], eros: [800, 380], mars: [900, 1180, 150] };

    const moon = `<g transform="translate(${pos.moon[0]},${pos.moon[1]})" opacity="0.94">${planetBody('moon', pos.moon[2], { seed: 101, uid: 'bgmoon' + k })}</g>`;
    const earth =
      `<g transform="translate(${pos.earth[0]},${pos.earth[1]})">` +
      planetBody('earth', pos.earth[2], { seed: 202, uid: 'bgearth' + k }) +
      '</g>';
    // Asteroide 433 Eros realista con textura real NASA
    const eros = `<g transform="translate(${pos.eros[0]},${pos.eros[1]}) rotate(-14)" opacity="0.92">${asteroidErosBody(pos.eros[2] || 38, { seed: 303, uid: 'bgeros' + k, texture: 'assets/textures/eros.jpg' })}</g>`;
    // Marte volumétrico con textura real 2K
    const mars = `<g transform="translate(${pos.mars[0]},${pos.mars[1]})" opacity="0.96">${planetBody('mars', pos.mars[2], { seed: 404, uid: 'bgmars' + k })}</g>`;

    return `
      <!-- Fondo de estrellas real fotográfico de la Vía Láctea (sin líneas orbitales ni formas geométricas sintéticas) -->
      <image href="assets/textures/via-lactea.jpg" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" opacity="0.9" />
      <rect width="${W}" height="${H}" fill="rgba(3, 7, 18, 0.36)" />
      ${moon}
      ${earth}
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
