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

  /* ---------- Portadas de misión vectorizadas ultra-rápidas con realismo fotográfico ---------- */

  function realisticMoonCard() {
    const u = 'card-luna';
    return `
      <div class="chapter-scene chapter-scene-3d" data-scene="moon" style="background:#02050e;position:relative" aria-hidden="true">
        <svg class="w-full h-full block" viewBox="0 0 480 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${u}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#020617" stop-opacity="0.3" />
              <stop offset="60%" stop-color="#020617" stop-opacity="0.55" />
              <stop offset="100%" stop-color="#030712" stop-opacity="0.95" />
            </linearGradient>
            <clipPath id="${u}-earth-clip">
              <circle cx="380" cy="54" r="28" />
            </clipPath>
            <clipPath id="${u}-ground-clip">
              <path d="M -10,138 Q 110,122 230,132 Q 350,126 490,134 L 490,250 L -10,250 Z" />
            </clipPath>
            <linearGradient id="${u}-ground-shade" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.22" />
              <stop offset="35%" stop-color="#0f172a" stop-opacity="0" />
              <stop offset="85%" stop-color="#020617" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#020617" stop-opacity="0.9" />
            </linearGradient>
            <!-- Gradientes para láminas doradas Kapton MLI de Apollo 11 -->
            <linearGradient id="${u}-kapton" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="30%" stop-color="#f59e0b" />
              <stop offset="70%" stop-color="#b45309" />
              <stop offset="100%" stop-color="#78350f" />
            </linearGradient>
            <linearGradient id="${u}-aluminum" x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="45%" stop-color="#cbd5e1" />
              <stop offset="100%" stop-color="#475569" />
            </linearGradient>
          </defs>

          <!-- Vía Láctea estelar fotográfica real -->
          <rect width="480" height="240" fill="#01040a" />
          <image href="assets/textures/via-lactea.jpg" x="0" y="0" width="480" height="240" preserveAspectRatio="xMidYMid slice" opacity="0.85" />
          <rect width="480" height="240" fill="url(#${u}-sky)" />

          <!-- Salida de la Tierra (Earthrise) fotográfica 4K con halo atmosférico -->
          <g>
            <circle cx="380" cy="54" r="30.5" fill="none" stroke="rgba(96, 165, 250, 0.45)" stroke-width="2.5" />
            <circle cx="380" cy="54" r="29.2" fill="none" stroke="rgba(191, 219, 254, 0.6)" stroke-width="0.8" />
            <g clip-path="url(#${u}-earth-clip)">
              <rect x="350" y="24" width="60" height="60" fill="#0c4a6e" />
              <image href="assets/textures/tierra-4k.jpg" x="350" y="24" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
              <image href="assets/textures/nubes-tierra.jpg" x="350" y="24" width="60" height="60" preserveAspectRatio="xMidYMid slice" opacity="0.55" style="mix-blend-mode:screen" />
              <path d="M 380,26 A 28 28 0 0 1 380,82 A 18 28 0 0 1 380,26 Z" fill="#020617" opacity="0.75" />
            </g>
          </g>

          <!-- Relieve lunar lejano suave (macizos de Mare Tranquillitatis) -->
          <path d="M -10,126 Q 90,112 210,120 T 490,116 L 490,250 L -10,250 Z" fill="#151d2b" opacity="0.75" />
          <path d="M -10,132 Q 100,119 220,127 T 490,124 L 490,250 L -10,250 Z" fill="#1e293b" opacity="0.9" />

          <!-- Suelo lunar realista continuo con textura 4K (luna-4k.jpg) sin círculos low-poly -->
          <g clip-path="url(#${u}-ground-clip)">
            <rect x="-10" y="125" width="500" height="125" fill="#334155" />
            <image href="assets/textures/luna-4k.jpg" x="-10" y="115" width="500" height="135" preserveAspectRatio="xMidYMid slice" opacity="0.88" />
            <rect x="-10" y="125" width="500" height="125" fill="url(#${u}-ground-shade)" />

            <!-- Rocas redondeadas con sombra de contacto -->
            <ellipse cx="112" cy="195" rx="14" ry="4.5" fill="rgba(0,0,0,0.65)" />
            <path d="M 100,193 Q 104,181 112,182 Q 120,183 124,193 Q 118,198 107,196 Z" fill="#64748b" stroke="#334155" stroke-width="0.8" />
            <path d="M 104,185 Q 109,183 116,184" fill="none" stroke="#f1f5f9" stroke-width="1.3" opacity="0.85" stroke-linecap="round" />

            <ellipse cx="334" cy="162" rx="9" ry="3" fill="rgba(0,0,0,0.55)" />
            <path d="M 326,160 Q 330,153 335,154 Q 341,155 342,160 Q 338,164 330,163 Z" fill="#475569" stroke="#1e293b" stroke-width="0.6" />
          </g>

          <!-- Módulo Lunar Apollo 11 «Eagle» (LM-5) realista -->
          <g transform="translate(225, 126)">
            <!-- Sombra de contacto suave -->
            <ellipse cx="10" cy="46" rx="55" ry="11" fill="rgba(2, 6, 23, 0.72)" />

            <!-- Patas de aterrizaje y platos circulares al ras del regolito -->
            <!-- Pata izquierda -->
            <line x1="-18" y1="20" x2="-48" y2="44" stroke="url(#${u}-aluminum)" stroke-width="2.6" stroke-linecap="round" />
            <line x1="-18" y1="28" x2="-35" y2="34" stroke="url(#${u}-aluminum)" stroke-width="1.6" />
            <ellipse cx="-48" cy="44" rx="8" ry="3.2" fill="#94a3b8" stroke="#475569" stroke-width="0.8" />

            <!-- Pata derecha -->
            <line x1="28" y1="20" x2="62" y2="44" stroke="url(#${u}-aluminum)" stroke-width="2.6" stroke-linecap="round" />
            <line x1="28" y1="28" x2="48" y2="34" stroke="url(#${u}-aluminum)" stroke-width="1.6" />
            <ellipse cx="62" cy="44" rx="8" ry="3.2" fill="#94a3b8" stroke="#475569" stroke-width="0.8" />

            <!-- Pata frontal con escalera -->
            <line x1="6" y1="22" x2="10" y2="46" stroke="url(#${u}-aluminum)" stroke-width="3" stroke-linecap="round" />
            <line x1="2" y1="24" x2="6" y2="44" stroke="#64748b" stroke-width="1.2" />
            <line x1="10" y1="24" x2="14" y2="44" stroke="#64748b" stroke-width="1.2" />
            <!-- Peldaños de la escalera -->
            <line x1="2" y1="27" x2="10" y2="27" stroke="#cbd5e1" stroke-width="1.1" />
            <line x1="3" y1="31" x2="11" y2="31" stroke="#cbd5e1" stroke-width="1.1" />
            <line x1="4" y1="35" x2="12" y2="35" stroke="#cbd5e1" stroke-width="1.1" />
            <line x1="5" y1="39" x2="13" y2="39" stroke="#cbd5e1" stroke-width="1.1" />
            <line x1="6" y1="43" x2="14" y2="43" stroke="#cbd5e1" stroke-width="1.1" />
            <ellipse cx="10" cy="46" rx="9" ry="3.5" fill="#cbd5e1" stroke="#475569" stroke-width="0.9" />

            <!-- Pata trasera -->
            <line x1="-4" y1="16" x2="-8" y2="38" stroke="url(#${u}-aluminum)" stroke-width="2" opacity="0.6" />
            <ellipse cx="-8" cy="38" rx="6" ry="2.5" fill="#475569" opacity="0.6" />

            <!-- Etapa de Descenso (cuerpo octagonal con láminas doradas Kapton MLI) -->
            <polygon points="-24,10 32,10 36,28 26,34 -18,34 -28,28" fill="url(#${u}-kapton)" stroke="#78350f" stroke-width="0.9" />
            <!-- Panel facetado central con reflejo -->
            <polygon points="-12,12 20,12 22,32 -10,32" fill="#d97706" opacity="0.85" />
            <polygon points="-2,13 10,13 11,31 -1,31" fill="#fef08a" opacity="0.65" />
            <!-- Tobera de descenso cónica -->
            <polygon points="1,34 9,34 12,41 -2,41" fill="#1f2937" stroke="#111827" stroke-width="0.8" />

            <!-- Etapa de Ascenso (cabina superior plateada de aluminio) -->
            <path d="M -18,10 L -18,-10 L -12,-18 L 22,-18 L 28,-10 L 28,10 Z" fill="url(#${u}-aluminum)" stroke="#334155" stroke-width="1" />
            <!-- Paneles térmicos frontales oscuros -->
            <polygon points="-16,-6 -6,-6 -6,8 -16,8" fill="#1e293b" />
            <polygon points="16,-6 26,-6 26,8 16,8" fill="#1e293b" />
            <!-- Ventanas triangulares cantadas de la cabina -->
            <polygon points="-10,-12 -2,-12 -4,-4 -12,-4" fill="#0284c7" stroke="#0369a1" stroke-width="0.8" />
            <polygon points="14,-12 6,-12 8,-4 16,-4" fill="#0284c7" stroke="#0369a1" stroke-width="0.8" />
            <polygon points="-8,-11 -4,-11 -5,-6 -9,-6" fill="#7dd3fc" opacity="0.75" />
            <polygon points="12,-11 8,-11 9,-6 13,-6" fill="#7dd3fc" opacity="0.75" />

            <!-- Escotilla de salida del astronauta -->
            <rect x="1" y="-4" width="8" height="12" rx="1.5" fill="#334155" stroke="#1e293b" stroke-width="0.8" />

            <!-- Propulsores RCS cuádruples en cruceta -->
            <g transform="translate(-24, 0)">
              <circle cx="0" cy="0" r="2.2" fill="#cbd5e1" />
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#f8fafc" stroke-width="1" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#f8fafc" stroke-width="1" />
            </g>
            <g transform="translate(34, 0)">
              <circle cx="0" cy="0" r="2.2" fill="#cbd5e1" />
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#f8fafc" stroke-width="1" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#f8fafc" stroke-width="1" />
            </g>

            <!-- Antena de radar parabólica de encuentro (rendezvous) en el techo -->
            <line x1="5" y1="-18" x2="5" y2="-27" stroke="#94a3b8" stroke-width="1.4" />
            <path d="M -1,-29 Q 5,-33 11,-29" fill="none" stroke="#f8fafc" stroke-width="2.2" stroke-linecap="round" />
            <circle cx="5" cy="-29" r="1.3" fill="#38bdf8" />
          </g>
        </svg>
        <canvas class="chapter-card-3d-canvas" width="480" height="240" aria-hidden="true"></canvas>
      </div>
    `;
  }

  function realisticMarsCard() {
    const u = 'card-marte';
    return `
      <div class="chapter-scene chapter-scene-3d" data-scene="mars" style="background:#130603;position:relative" aria-hidden="true">
        <svg class="w-full h-full block" viewBox="0 0 480 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${u}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#05060f" />
              <stop offset="35%" stop-color="#1c0b10" />
              <stop offset="70%" stop-color="#581c0c" />
              <stop offset="100%" stop-color="#9a3412" />
            </linearGradient>
            <clipPath id="${u}-phobos-clip">
              <path d="M 0,0 Q 14,-2 24,6 Q 30,16 22,26 Q 10,32 2,24 Q -6,14 0,0 Z" />
            </clipPath>
            <clipPath id="${u}-ground-clip">
              <path d="M -10,136 Q 120,118 240,130 Q 360,122 490,132 L 490,250 L -10,250 Z" />
            </clipPath>
            <linearGradient id="${u}-ground-shade" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stop-color="#fed7aa" stop-opacity="0.25" />
              <stop offset="40%" stop-color="#7c2d12" stop-opacity="0" />
              <stop offset="85%" stop-color="#2e0a03" stop-opacity="0.65" />
              <stop offset="100%" stop-color="#1c0502" stop-opacity="0.9" />
            </linearGradient>
            <linearGradient id="${u}-soj-panel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#1e3a8a" />
              <stop offset="50%" stop-color="#172554" />
              <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>
            <linearGradient id="${u}-soj-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="50%" stop-color="#eab308" />
              <stop offset="100%" stop-color="#a16207" />
            </linearGradient>
            <linearGradient id="${u}-rock-yogi" x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stop-color="#c2410c" />
              <stop offset="40%" stop-color="#9a3412" />
              <stop offset="80%" stop-color="#67250e" />
              <stop offset="100%" stop-color="#3b1104" />
            </linearGradient>
          </defs>

          <!-- Cielo y horizonte crepuscular marciano -->
          <rect width="480" height="240" fill="url(#${u}-sky)" />

          <!-- Luna marciana Fobos en el cielo -->
          <g transform="translate(68, 38) scale(0.65)">
            <g clip-path="url(#${u}-phobos-clip)">
              <rect x="-10" y="-10" width="45" height="45" fill="#78716c" />
              <image href="assets/textures/marte-mini.jpg" x="-10" y="-10" width="45" height="45" preserveAspectRatio="xMidYMid slice" opacity="0.65" />
              <path d="M 0,0 Q 14,-2 24,6 Q 30,16 22,26 Q 10,32 2,24 Z" fill="#1c1917" opacity="0.55" />
            </g>
          </g>

          <!-- Dunas lejanas de Ares Vallis -->
          <path d="M -10,122 Q 110,108 230,118 T 490,112 L 490,250 L -10,250 Z" fill="#451a03" opacity="0.75" />
          <path d="M -10,128 Q 120,114 240,124 T 490,120 L 490,250 L -10,250 Z" fill="#782a0b" opacity="0.9" />

          <!-- Suelo marciano con textura real 2K (marte-2k.jpg) y dunas suaves -->
          <g clip-path="url(#${u}-ground-clip)">
            <rect x="-10" y="120" width="500" height="130" fill="#9a3412" />
            <image href="assets/textures/marte-2k.jpg" x="-10" y="110" width="500" height="140" preserveAspectRatio="xMidYMid slice" opacity="0.88" />
            <rect x="-10" y="120" width="500" height="130" fill="url(#${u}-ground-shade)" />

            <!-- Megabloque basáltico «Yogi» con estratos y sombra de contacto -->
            <ellipse cx="370" cy="188" rx="28" ry="8" fill="rgba(24, 6, 2, 0.75)" />
            <path d="M 344,185 Q 352,156 370,158 Q 388,160 396,184 Q 386,194 354,191 Z" fill="url(#${u}-rock-yogi)" stroke="#431407" stroke-width="0.8" />
            <!-- Estratos geológicos pulidos por inundación -->
            <path d="M 350,172 Q 368,168 388,171" fill="none" stroke="#ea580c" stroke-width="1.3" opacity="0.75" />
            <path d="M 354,180 Q 372,176 392,179" fill="none" stroke="#ea580c" stroke-width="1.3" opacity="0.75" />

            <!-- Roca sedimentaria dura «Scooby Doo» plana -->
            <ellipse cx="118" cy="192" rx="16" ry="5.5" fill="rgba(24, 6, 2, 0.65)" />
            <path d="M 104,190 Q 110,183 118,184 Q 126,185 130,191 Q 124,196 110,195 Z" fill="#b45309" stroke="#78350f" stroke-width="0.7" />
          </g>

          <!-- Pétalo del aterrizador Pathfinder con airbags desinflados en segundo plano -->
          <g transform="translate(148, 148)">
            <ellipse cx="0" cy="12" rx="36" ry="8" fill="rgba(24, 6, 2, 0.55)" />
            <polygon points="-32,10 0,-4 32,10 0,16" fill="#cbd5e1" stroke="#64748b" stroke-width="0.9" />
            <!-- Airbags blancos en los bordes -->
            <ellipse cx="-28" cy="11" rx="8" ry="4" fill="#f1f5f9" stroke="#94a3b8" stroke-width="0.6" />
            <ellipse cx="28" cy="11" rx="8" ry="4" fill="#f1f5f9" stroke="#94a3b8" stroke-width="0.6" />
            <ellipse cx="0" cy="15" rx="9" ry="4.5" fill="#f1f5f9" stroke="#94a3b8" stroke-width="0.6" />
            <!-- Mástil central Pathfinder -->
            <line x1="0" y1="2" x2="0" y2="-22" stroke="#94a3b8" stroke-width="1.6" />
            <circle cx="0" cy="-22" r="2.5" fill="#e2e8f0" />
          </g>

          <!-- Rover Sojourner en primer plano en Ares Vallis -->
          <g transform="translate(230, 158)">
            <!-- Sombra de contacto de las 6 ruedas -->
            <ellipse cx="14" cy="22" rx="36" ry="7" fill="rgba(20, 4, 1, 0.78)" />

            <!-- Suspensión Rocker-Bogie de titanio -->
            <line x1="-10" y1="8" x2="-22" y2="18" stroke="#cbd5e1" stroke-width="2.4" stroke-linecap="round" />
            <line x1="-10" y1="8" x2="6" y2="18" stroke="#cbd5e1" stroke-width="2.4" stroke-linecap="round" />
            <line x1="18" y1="8" x2="34" y2="18" stroke="#cbd5e1" stroke-width="2.4" stroke-linecap="round" />

            <!-- Las 6 ruedas metálicas con tacos/clavos y cubos azules -->
            <!-- Rueda 1 (trasera izq) -->
            <g transform="translate(-22, 18)">
              <circle cx="0" cy="0" r="7.2" fill="#94a3b8" stroke="#e2e8f0" stroke-width="1.2" />
              <circle cx="0" cy="0" r="3.2" fill="#2563eb" />
            </g>
            <!-- Rueda 2 (media izq) -->
            <g transform="translate(6, 18)">
              <circle cx="0" cy="0" r="7.2" fill="#94a3b8" stroke="#e2e8f0" stroke-width="1.2" />
              <circle cx="0" cy="0" r="3.2" fill="#2563eb" />
            </g>
            <!-- Rueda 3 (delantera izq) -->
            <g transform="translate(34, 18)">
              <circle cx="0" cy="0" r="7.2" fill="#94a3b8" stroke="#e2e8f0" stroke-width="1.2" />
              <circle cx="0" cy="0" r="3.2" fill="#2563eb" />
            </g>

            <!-- Chasis aislado dorado (Warm Electronics Box - WEB) -->
            <rect x="-18" y="0" width="46" height="13" rx="2" fill="url(#${u}-soj-body)" stroke="#854d0e" stroke-width="0.9" />

            <!-- Panel solar fotovoltaico superior azul marino oscuro -->
            <polygon points="-21,0 29,0 33,-2 -17,-2" fill="url(#${u}-soj-panel)" stroke="#38bdf8" stroke-width="0.7" />
            <!-- Rejilla de celdas solares GaAs -->
            <line x1="-11" y1="0" x2="-7" y2="-2" stroke="#60a5fa" stroke-width="0.6" opacity="0.7" />
            <line x1="-1" y1="0" x2="3" y2="-2" stroke="#60a5fa" stroke-width="0.6" opacity="0.7" />
            <line x1="9" y1="0" x2="13" y2="-2" stroke="#60a5fa" stroke-width="0.6" opacity="0.7" />
            <line x1="19" y1="0" x2="23" y2="-2" stroke="#60a5fa" stroke-width="0.6" opacity="0.7" />

            <!-- Sensor APXS en la parte posterior -->
            <rect x="-24" y="5" width="6" height="5" rx="1" fill="#475569" stroke="#334155" stroke-width="0.6" />

            <!-- Mástil de antena y cámaras frontales de navegación estéreo -->
            <rect x="25" y="2" width="6" height="5" rx="1" fill="#f8fafc" stroke="#475569" stroke-width="0.7" />
            <circle cx="27" cy="4.5" r="1.3" fill="#0284c7" />
            <circle cx="29.5" cy="4.5" r="1.3" fill="#0284c7" />

            <!-- Antena UHF de varilla -->
            <line x1="18" y1="-2" x2="21" y2="-24" stroke="#e2e8f0" stroke-width="1.2" />
            <circle cx="21" cy="-24" r="1.4" fill="#f59e0b" />
          </g>
        </svg>
        <canvas class="chapter-card-3d-canvas" width="480" height="240" aria-hidden="true"></canvas>
      </div>
    `;
  }

  function realisticDeepSpaceCard() {
    const u = 'card-eros';
    return `
      <div class="chapter-scene chapter-scene-3d" data-scene="deep-space" style="background:#020409;position:relative" aria-hidden="true">
        <svg class="w-full h-full block" viewBox="0 0 480 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${u}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#020617" stop-opacity="0.25" />
              <stop offset="70%" stop-color="#020617" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#030712" stop-opacity="0.95" />
            </linearGradient>
            <!-- Silueta curvada de cacahuate / plátano de 433 Eros -->
            <clipPath id="${u}-eros-clip">
              <path d="M 285,125 C 275,80 325,58 375,64 C 420,70 455,95 448,135 C 442,168 395,190 355,182 C 322,175 292,158 285,125 Z" />
            </clipPath>
            <radialGradient id="${u}-eros-shade" cx="35%" cy="32%" r="75%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2" />
              <stop offset="42%" stop-color="#0f172a" stop-opacity="0" />
              <stop offset="78%" stop-color="#020617" stop-opacity="0.75" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0.95" />
            </radialGradient>
            <linearGradient id="${u}-near-solar" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#1e40af" />
              <stop offset="50%" stop-color="#172554" />
              <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>
            <linearGradient id="${u}-near-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="45%" stop-color="#d97706" />
              <stop offset="100%" stop-color="#78350f" />
            </linearGradient>
            <linearGradient id="${u}-dish" x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="60%" stop-color="#cbd5e1" />
              <stop offset="100%" stop-color="#64748b" />
            </linearGradient>
          </defs>

          <!-- Espacio profundo con Vía Láctea estelar fotográfica real -->
          <rect width="480" height="240" fill="#01040a" />
          <image href="assets/textures/via-lactea.jpg" x="0" y="0" width="480" height="240" preserveAspectRatio="xMidYMid slice" opacity="0.88" />
          <rect width="480" height="240" fill="url(#${u}-sky)" />

          <!-- Asteroide 433 Eros fotorrealista con textura real NASA eros.jpg -->
          <g>
            <!-- Silueta recortada con textura de NASA de Eros -->
            <g clip-path="url(#${u}-eros-clip)">
              <rect x="270" y="50" width="190" height="145" fill="#334155" />
              <image href="assets/textures/eros.jpg" x="270" y="50" width="190" height="145" preserveAspectRatio="xMidYMid slice" opacity="0.92" />
              <!-- Sombreado 3D de esferoide elongado -->
              <rect x="270" y="50" width="190" height="145" fill="url(#${u}-eros-shade)" />

              <!-- Depresión Himeros y cráter Shoemaker tallados en el relieve -->
              <ellipse cx="365" cy="115" rx="24" ry="14" fill="#0f172a" opacity="0.32" />
              <ellipse cx="330" cy="140" rx="15" ry="9" fill="#0f172a" opacity="0.38" />
            </g>
          </g>

          <!-- Sonda espacial NEAR Shoemaker en aproximación a Eros -->
          <g transform="translate(142, 115) rotate(-16)">
            <!-- Alas de paneles solares GaAs (4 paneles en cruz/alas) -->
            <!-- Ala izquierda superior -->
            <polygon points="-70,-32 -26,-14 -24,-8 -68,-26" fill="url(#${u}-near-solar)" stroke="#60a5fa" stroke-width="0.8" />
            <line x1="-48" y1="-23" x2="-46" y2="-17" stroke="#fbbf24" stroke-width="0.6" opacity="0.8" />

            <!-- Ala izquierda inferior -->
            <polygon points="-70,26 -26,8 -24,14 -68,32" fill="url(#${u}-near-solar)" stroke="#60a5fa" stroke-width="0.8" />
            <line x1="-48" y1="17" x2="-46" y2="23" stroke="#fbbf24" stroke-width="0.6" opacity="0.8" />

            <!-- Ala derecha superior -->
            <polygon points="26,-14 70,-32 68,-26 24,-8" fill="url(#${u}-near-solar)" stroke="#60a5fa" stroke-width="0.8" />
            <line x1="48" y1="-23" x2="46" y2="-17" stroke="#fbbf24" stroke-width="0.6" opacity="0.8" />

            <!-- Ala derecha inferior -->
            <polygon points="26,8 70,26 68,32 24,14" fill="url(#${u}-near-solar)" stroke="#60a5fa" stroke-width="0.8" />
            <line x1="48" y1="17" x2="46" y2="23" stroke="#fbbf24" stroke-width="0.6" opacity="0.8" />

            <!-- Antena de Alta Ganancia parabólica blanca orientada a la Tierra -->
            <ellipse cx="-4" cy="-6" rx="22" ry="14" fill="url(#${u}-dish)" stroke="#475569" stroke-width="1" />
            <ellipse cx="-4" cy="-6" rx="16" ry="10" fill="#f8fafc" opacity="0.9" />
            <circle cx="-4" cy="-6" r="3.2" fill="#1e293b" />
            <!-- Trípode alimentador del foco -->
            <line x1="-4" y1="-6" x2="-4" y2="-18" stroke="#334155" stroke-width="1.2" />
            <circle cx="-4" cy="-18" r="1.6" fill="#0284c7" />

            <!-- Cuerpo principal (Bus cúbico con mantas térmicas doradas Kapton) -->
            <rect x="-14" y="0" width="28" height="24" rx="2" fill="url(#${u}-near-gold)" stroke="#78350f" stroke-width="0.9" />
            <!-- Radiador térmico plateado de instrumentos -->
            <rect x="-8" y="4" width="16" height="12" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.7" />

            <!-- Sensores científicos ópticos (MSI y NLR) apuntando hacia Eros -->
            <rect x="12" y="6" width="6" height="5" rx="1" fill="#334155" stroke="#1e293b" stroke-width="0.7" />
            <circle cx="15" cy="8.5" r="1.5" fill="#38bdf8" />
            <rect x="12" y="13" width="7" height="4" rx="1" fill="#334155" stroke="#1e293b" stroke-width="0.7" />
            <circle cx="16" cy="15" r="1.3" fill="#22d3ee" />

            <!-- Mástil del magnetómetro extendido -->
            <line x1="-14" y1="20" x2="-36" y2="34" stroke="#cbd5e1" stroke-width="1.3" />
            <circle cx="-36" cy="34" r="1.5" fill="#f59e0b" />
          </g>
        </svg>
        <canvas class="chapter-card-3d-canvas" width="480" height="240" aria-hidden="true"></canvas>
      </div>
    `;
  }

  function chapterScene(chapterId) {
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
