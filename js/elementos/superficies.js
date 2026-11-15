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

  /* ---------- Planetas reconocibles: pocas facetas suaves + rasgos reales encima ---------- */

  const PLANET_FEATURES = {
    moon: {
      base: { dark: '#3b4658', mid: '#9aa7ba', light: '#f1f5f9' },
      patches: [
        { fill: '#475569', op: 0.34, pts: [[-0.5, -0.45], [-0.15, -0.62], [0.05, -0.42], [-0.05, -0.1], [-0.35, 0.0], [-0.56, -0.2]] },
        { fill: '#475569', op: 0.3, pts: [[0.1, 0.0], [0.45, -0.15], [0.62, 0.15], [0.36, 0.36], [0.1, 0.26]] }
      ],
      craters: [[-0.35, -0.3, 0.15], [0.25, -0.52, 0.1], [0.42, 0.08, 0.17], [-0.15, 0.38, 0.13], [-0.58, 0.16, 0.09], [0.04, -0.04, 0.07], [0.1, 0.64, 0.1], [-0.72, -0.1, 0.06]],
      craterDark: '#334155',
      craterRim: '#f1f5f9'
    },
    mars: {
      base: { dark: '#5c1d0c', mid: '#c2410c', light: '#fdba74' },
      patches: [
        { fill: '#7c2d12', op: 0.5, pts: [[-0.62, 0.0], [-0.2, -0.12], [0.02, 0.15], [-0.25, 0.46], [-0.55, 0.36]] },
        { fill: '#9a3412', op: 0.45, pts: [[0.2, -0.22], [0.56, -0.1], [0.62, 0.22], [0.3, 0.27]] },
        { fill: '#431407', op: 0.5, pts: [[-0.46, 0.06], [0.3, 0.13], [0.32, 0.18], [-0.46, 0.11]] },
        { fill: '#fff7ed', op: 0.92, pts: [[-0.36, -0.97], [0.36, -0.97], [0.3, -0.74], [0.1, -0.67], [-0.12, -0.71], [-0.3, -0.75]] },
        { fill: '#ffedd5', op: 0.7, pts: [[-0.22, 0.95], [0.22, 0.95], [0.14, 0.8], [-0.14, 0.8]] }
      ],
      craters: [[0.45, 0.45, 0.09], [-0.2, 0.6, 0.07], [0.55, -0.4, 0.06]],
      craterDark: '#431407',
      craterRim: '#fed7aa'
    },
    earth: {
      base: { dark: '#0a1740', mid: '#1d56c9', light: '#5fa8f5' },
      patches: [
        { fill: '#3da66d', op: 0.95, pts: [[-0.64, -0.55], [-0.26, -0.64], [-0.1, -0.4], [-0.22, -0.15], [-0.4, 0.0], [-0.5, -0.2], [-0.72, -0.3]] },
        { fill: '#359360', op: 0.95, pts: [[-0.32, 0.06], [-0.12, 0.13], [-0.1, 0.46], [-0.25, 0.72], [-0.36, 0.36]] },
        { fill: '#3da66d', op: 0.95, pts: [[0.1, -0.86], [0.7, -0.7], [0.92, -0.36], [0.62, -0.2], [0.36, -0.46], [0.1, -0.52]] },
        { fill: '#4fb87d', op: 0.95, pts: [[0.15, -0.4], [0.5, -0.3], [0.62, 0.0], [0.46, 0.36], [0.3, 0.52], [0.2, 0.16], [0.1, -0.1]] },
        { fill: '#ffffff', op: 0.5, pts: [[-0.72, -0.2], [-0.3, -0.3], [0.1, -0.22], [-0.3, -0.12]] },
        { fill: '#ffffff', op: 0.45, pts: [[0.2, 0.3], [0.7, 0.2], [0.82, 0.32], [0.4, 0.42]] },
        { fill: '#ffffff', op: 0.45, pts: [[-0.62, 0.52], [-0.2, 0.46], [0.0, 0.58], [-0.4, 0.64]] },
        { fill: '#f1f5f9', op: 0.85, pts: [[-0.3, -0.98], [0.3, -0.98], [0.22, -0.82], [-0.22, -0.82]] }
      ],
      craters: [],
      craterDark: '#0a1740',
      craterRim: '#5fa8f5'
    }
  };

  function planetBody(kind, r, opts = {}) {
    const f = PLANET_FEATURES[kind];
    const { rings = 4, seg = 16, seed = 1, uid = `${kind}${seed}` } = opts;
    const sc = (pts) => pts.map((q) => `${n(q[0] * r)},${n(q[1] * r)}`).join(' ');
    let overlay = '';
    f.patches.forEach((pt) => {
      overlay += `<polygon points="${sc(pt.pts)}" fill="${pt.fill}" opacity="${pt.op}" />`;
    });
    f.craters.forEach((c, ci) => {
      const cr = c[2] * r;
      let ring = '';
      let inner = '';
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        const wob = 1 + (((i * 7 + ci * 3) % 5) - 2) * 0.04;
        ring += `${n(c[0] * r + Math.cos(a) * cr * wob)},${n(c[1] * r + Math.sin(a) * cr * wob)} `;
        inner += `${n(c[0] * r + cr * 0.12 + Math.cos(a) * cr * 0.72 * wob)},${n(c[1] * r + cr * 0.12 + Math.sin(a) * cr * 0.72 * wob)} `;
      }
      overlay += `<polygon points="${ring.trim()}" fill="${f.craterRim}" opacity="0.55" />`;
      overlay += `<polygon points="${inner.trim()}" fill="${f.craterDark}" opacity="0.6" />`;
    });
    const body = lowPolyBody({
      r,
      rings,
      seg,
      seed,
      dark: f.base.dark,
      mid: f.base.mid,
      light: f.base.light,
      jitter: 0.04,
      litNoise: 0.04
    });
    return (
      `<g><defs>` +
      `<clipPath id="clip-${uid}"><circle r="${n(r * 0.985)}" /></clipPath>` +
      `<radialGradient id="shade-${uid}" cx="0.33" cy="0.3" r="0.85"><stop offset="0.45" stop-color="#020617" stop-opacity="0" /><stop offset="1" stop-color="#020617" stop-opacity="0.55" /></radialGradient>` +
      `</defs>${body}<g clip-path="url(#clip-${uid})">${overlay}<circle r="${n(r)}" fill="url(#shade-${uid})" /></g></g>`
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
