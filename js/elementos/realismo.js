/* =========================================================
   Elemento: Realismo de superficies (Optimizado 100% Vectorial)
   Terreno lunar, marciano y de Eros con volumen tridimensional,
   sombreado suave (luz arriba-izquierda), cráteres con profundidad,
   rocas con sombra de contacto y atmósfera realista de Marte.
   Rendimiento nativo 60 FPS sin filtros pesados de CPU.
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

  let params;
  try {
    params = new URLSearchParams(global.location.search);
  } catch (_e) {
    params = new URLSearchParams('');
  }

  M.REALISM = Object.assign(
    { marsSky: 'day' },
    M.REALISM || {}
  );

  /* ---------- Utilidades Generadoras ---------- */

  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return function next() {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  const f = (v) => Math.round(v * 10) / 10;

  function smoothClosed(pts) {
    const len = pts.length;
    let d = `M ${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < len; i += 1) {
      const p0 = pts[(i - 1 + len) % len];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % len];
      const p3 = pts[(i + 2) % len];
      d += ` C ${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
    }
    return `${d} Z`;
  }

  function smoothOpen(pts) {
    const len = pts.length;
    let d = `M ${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < len - 1; i += 1) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(len - 1, i + 2)];
      d += ` C ${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
    }
    return d;
  }

  /* ---------- Configuración visual por cuerpo celeste ---------- */

  const CFG = {
    moon: {
      texture: 'assets/textures/luna-4k.jpg',
      ground: ['#a9b0bb', '#8f97a4', '#6b7381', '#484f5d'],
      dunes: ['#7c8594', '#596170', '#3b4352'],
      ridges: [
        { y0: 266, amp: 38, steps: 9, seed: 5, fill: '#2a3345', edge: '#8c99b2' },
        { y0: 276, amp: 20, steps: 12, seed: 9, fill: '#3a4457', edge: '#a3aec4' }
      ],
      crater: { dark: '#1e232b', mid: '#505865', rim: '#d6dbe3' },
      rock: { a: '#dce1e8', b: '#8f96a3', c: '#474d59' },
      pebbles: 32,
      seed: 11
    },
    mars: {
      texture: 'assets/textures/marte-2k.jpg',
      ground: ['#d99d69', '#c07746', '#9c5731', '#6d3b21'],
      dunes: ['#aa5e37', '#834224', '#592915'],
      ridges: [
        { y0: 262, amp: 24, steps: 10, seed: 15, fill: '#a56a54', edge: '#e0a888' },
        { y0: 272, amp: 14, steps: 12, seed: 19, fill: '#8c4f3a', edge: '#d49a7a' }
      ],
      haze: '#e2b08a',
      crater: { dark: '#462013', mid: '#7f3f22', rim: '#f2bb8c' },
      rock: { a: '#e8a576', b: '#a4552f', c: '#5a2916' },
      pebbles: 36,
      seed: 23
    },
    eros: {
      texture: 'assets/textures/eros.jpg',
      ground: ['#b6b6b3', '#98989b', '#717174', '#4c4c50'],
      dunes: ['#88888b', '#626266', '#424246'],
      ridges: [],
      crater: { dark: '#222326', mid: '#525257', rim: '#d9d9d6' },
      rock: { a: '#d7d7d4', b: '#8d8d90', c: '#46464a' },
      pebbles: 44,
      seed: 31
    }
  };

  const SITES = {
    'mare-tranquillitatis': {
      kind: 'moon',
      earth: [366, 98, 48],
      ridgeSeed: 0,
      craters: [[768, 336, 86, 26], [178, 496, 54, 18], [362, 294, 32, 11]],
      rocks: [[126, 316, 22, 3], [262, 548, 28, 5], [888, 444, 20, 8]]
    },
    'oceanus-procellarum': {
      kind: 'moon',
      earth: [742, 92, 44],
      ridgeSeed: 40,
      craters: [[226, 332, 76, 24], [804, 488, 64, 20]],
      rocks: [[110, 462, 30, 2], [906, 310, 24, 7]]
    },
    'ares-vallis': {
      kind: 'mars',
      twinPeaks: true,
      phobos: [746, 86, 10],
      ridgeSeed: 0,
      craters: [[806, 336, 64, 18]],
      rocks: [[118, 312, 26, 4], [770, 524, 38, 6], [170, 544, 26, 9], [432, 476, 18, 3]]
    },
    'chryse-planitia': {
      kind: 'mars',
      phobos: [236, 94, 9],
      ridgeSeed: 60,
      craters: [[178, 344, 58, 18]],
      rocks: [[880, 306, 38, 1], [276, 544, 30, 12], [708, 516, 22, 13]]
    },
    'asteroid-eros': {
      kind: 'eros',
      ridgeSeed: 0,
      craters: [[216, 380, 64, 18], [498, 364, 72, 19], [822, 396, 52, 15], [470, 520, 46, 13]],
      rocks: [[96, 430, 20, 4], [884, 486, 24, 6], [330, 506, 18, 8], [640, 436, 14, 2]],
      ponds: [[610, 384, 70, 11], [300, 446, 54, 9]]
    }
  };

  /* ---------- Elementos Vectoriales de Escenario ---------- */

  function starField(seed, count, yMax) {
    const rand = rng(seed);
    let out = '<g fill="#ffffff">';
    for (let i = 0; i < count; i += 1) {
      out += `<circle cx="${f(rand() * 1000)}" cy="${f(rand() * yMax + 14)}" r="${f(0.9 + rand() * 0.8)}" opacity="${f(0.55 + rand() * 0.35)}" />`;
    }
    return `${out}</g>`;
  }

  function skySvg(kind, id, site) {
    const planet = site.earth && M.planetBody
      ? `<g transform="translate(${site.earth[0]},${site.earth[1]})">${M.planetBody('earth', site.earth[2], { uid: M.uid('rlearth') })}</g>`
      : '';
    const phobos = site.phobos && M.phobosBody
      ? `<g transform="translate(${site.phobos[0]},${site.phobos[1]})" opacity="0.9">${M.phobosBody(site.phobos[2], { uid: M.uid('rlphobos') })}</g>`
      : '';

    if (kind === 'mars' && M.REALISM.marsSky !== 'night') {
      return `
        <defs>
          <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#3d3040" />
            <stop offset="0.4" stop-color="#8a5f57" />
            <stop offset="0.75" stop-color="#c98f6c" />
            <stop offset="1" stop-color="#e2b48a" />
          </linearGradient>
          <radialGradient id="${id}-sun" cx="30%" cy="30%" r="70%">
            <stop offset="0" stop-color="#fff5e6" stop-opacity="0.95" />
            <stop offset="0.3" stop-color="#ffd6aa" stop-opacity="0.4" />
            <stop offset="1" stop-color="#ffc896" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="594" fill="url(#${id}-sky)" />
        <circle cx="150" cy="104" r="54" fill="url(#${id}-sun)" />
        <circle cx="150" cy="104" r="5.5" fill="#fffaf0" />
        ${phobos}
      `;
    }

    const top = kind === 'mars' ? '#0d0818' : '#02040a';
    const bottom = kind === 'mars' ? '#3c1b29' : '#060b14';
    return `
      <defs>
        <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${top}" />
          <stop offset="1" stop-color="${bottom}" />
        </linearGradient>
      </defs>
      <rect width="1000" height="594" fill="url(#${id}-sky)" />
      ${(kind === 'moon' || kind === 'eros') ? `<image href="assets/textures/via-lactea.jpg" x="0" y="0" width="1000" height="320" preserveAspectRatio="xMidYMid slice" opacity="0.28" />` : ''}
      ${starField(CFG[kind].seed, 18, 200)}
      ${planet}
      ${phobos}
    `;
  }

  function ridgeLayers(C, site, id) {
    let out = '';
    const rgId = M.uid('rgcl');
    let clipPaths = '';

    C.ridges.forEach((rg) => {
      const rand = rng(rg.seed + site.ridgeSeed);
      const pts = [];
      for (let i = 0; i <= rg.steps; i += 1) {
        pts.push([-20 + (1040 * i) / rg.steps, rg.y0 - rand() * rg.amp]);
      }
      const d = smoothOpen(pts);
      clipPaths += `<path d="${d} L 1020,300 L -20,300 Z" />`;
      out += `<path d="${d} L 1020,300 L -20,300 Z" fill="${rg.fill}" />`;
      out += `<path d="${d}" fill="none" stroke="${rg.edge}" stroke-opacity="0.55" stroke-width="1.3" />`;
    });

    if (C.texture && clipPaths) {
      out += `
        <defs><clipPath id="${rgId}">${clipPaths}</clipPath></defs>
        <g clip-path="url(#${rgId})">
          <image href="${C.texture}" x="-20" y="200" width="1040" height="110" preserveAspectRatio="xMidYMid slice" opacity="0.32" />
        </g>
      `;
    }

    if (site.twinPeaks) {
      const tpId = M.uid('tp');
      const north = smoothOpen([[430, 280], [500, 248], [570, 208], [640, 242], [704, 280]]);
      const south = smoothOpen([[660, 282], [740, 228], [800, 176], [872, 224], [960, 282]]);
      out += `
        <defs>
          <clipPath id="${tpId}">
            <path d="${north} L 704,300 L 430,300 Z ${south} L 960,300 L 660,300 Z" />
          </clipPath>
        </defs>
        <path d="${north} L 704,300 L 430,300 Z" fill="url(#${id}-pk)" />
        <path d="${south} L 960,300 L 660,300 Z" fill="url(#${id}-pk)" />
        <g clip-path="url(#${tpId})">
          <image href="${C.texture}" x="430" y="170" width="540" height="140" preserveAspectRatio="xMidYMid slice" opacity="0.45" />
        </g>
        <path d="${north}" fill="none" stroke="#f0b894" stroke-opacity="0.55" stroke-width="1.3" />
        <path d="${south}" fill="none" stroke="#f0b894" stroke-opacity="0.55" stroke-width="1.3" />
      `;
    }
    return out;
  }

  /* Ondulaciones y dunas vectoriales de regolito (sensación de superficie real sin lag) */
  function groundDunes(C, seed) {
    const rand = rng(seed * 43 + 19);
    let out = '';
    const duneLevels = [
      { y: 315, amp: 12, fill: C.dunes[0], op: 0.38 },
      { y: 385, amp: 16, fill: C.dunes[1], op: 0.32 },
      { y: 475, amp: 20, fill: C.dunes[2], op: 0.28 }
    ];
    duneLevels.forEach((dl) => {
      const pts = [];
      const steps = 7;
      for (let i = 0; i <= steps; i += 1) {
        pts.push([-20 + (1040 * i) / steps, dl.y + (rand() - 0.5) * dl.amp]);
      }
      const d = smoothOpen(pts);
      out += `<path d="${d} L 1020,600 L -20,600 Z" fill="${dl.fill}" opacity="${dl.op}" />`;
      out += `<path d="${d}" fill="none" stroke="${C.ground[0]}" stroke-opacity="0.25" stroke-width="1.2" />`;
    });
    return out;
  }

  function realCrater(C, cx, cy, rx, ry) {
    const u = M.uid('rlcr');
    const arc = (t0, t1) => {
      const a0 = (t0 * Math.PI) / 180;
      const a1 = (t1 * Math.PI) / 180;
      return `M ${f(cx + rx * Math.cos(a0))},${f(cy + ry * Math.sin(a0))} A ${f(rx)} ${f(ry)} 0 0 1 ${f(cx + rx * Math.cos(a1))},${f(cy + ry * Math.sin(a1))}`;
    };
    return `
      <defs>
        <radialGradient id="${u}-ej" cx="50%" cy="50%" r="50%">
          <stop offset="0.55" stop-color="${C.crater.rim}" stop-opacity="0.32" />
          <stop offset="1" stop-color="${C.crater.rim}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="${u}-bowl" x1="0.1" y1="0.05" x2="0.9" y2="0.95">
          <stop offset="0" stop-color="${C.crater.dark}" />
          <stop offset="0.45" stop-color="${C.crater.mid}" />
          <stop offset="1" stop-color="${C.crater.rim}" />
        </linearGradient>
      </defs>
      <ellipse cx="${cx}" cy="${cy}" rx="${f(rx * 1.45)}" ry="${f(ry * 1.45)}" fill="url(#${u}-ej)" />
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${u}-bowl)" />
      <ellipse cx="${f(cx + rx * 0.12)}" cy="${f(cy + ry * 0.18)}" rx="${f(rx * 0.72)}" ry="${f(ry * 0.62)}" fill="${C.crater.mid}" opacity="0.65" />
      <path d="${arc(178, 276)}" fill="none" stroke="${C.crater.rim}" stroke-width="1.8" stroke-linecap="round" opacity="0.75" />
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${C.crater.dark}" stroke-opacity="0.4" stroke-width="1" />
    `;
  }

  function realRock(C, id, cx, cy, s, seed) {
    const rand = rng(seed * 53 + 11);
    const N = 9;
    const pts = [];
    for (let i = 0; i < N; i += 1) {
      const a = (i / N) * Math.PI * 2 + (rand() - 0.5) * 0.25;
      const rr = s * (0.8 + rand() * 0.4);
      const sn = Math.sin(a);
      pts.push([cx + Math.cos(a) * rr * 1.15, cy + (sn > 0 ? sn * rr * 0.6 : sn * rr * 0.95)]);
    }
    const d = smoothClosed(pts);
    const lit = pts.filter((_, i) => i / N > 0.5 && i / N < 0.85);
    const hl = lit.length >= 3 ? smoothOpen(lit) : '';
    return `
      <ellipse cx="${f(cx + s * 0.35)}" cy="${f(cy + s * 0.48)}" rx="${f(s * 1.25)}" ry="${f(s * 0.32)}" fill="#000000" opacity="0.38" />
      <ellipse cx="${cx}" cy="${f(cy + s * 0.48)}" rx="${f(s * 0.95)}" ry="${f(s * 0.18)}" fill="#000000" opacity="0.25" />
      <path d="${d}" fill="url(#${id}-rg)" stroke="${C.rock.c}" stroke-width="0.8" />
      ${hl ? `<path d="${hl}" fill="none" stroke="${C.rock.a}" stroke-width="${f(Math.max(1, s * 0.09))}" opacity="0.65" stroke-linecap="round" />` : ''}
    `;
  }

  function pebbles(C, seed, count) {
    const rand = rng(seed);
    let out = '';
    for (let i = 0; i < count; i += 1) {
      const y = 300 + Math.pow(rand(), 0.8) * 280;
      const s = 1.3 + ((y - 280) / 320) * 4.5;
      const x = rand() * 1000;
      out +=
        `<ellipse cx="${f(x + s * 0.5)}" cy="${f(y + s * 0.25)}" rx="${f(s * 1.1)}" ry="${f(s * 0.35)}" fill="#000" opacity="0.28" />` +
        `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s)}" ry="${f(s * 0.68)}" fill="${C.rock.b}" />` +
        `<ellipse cx="${f(x - s * 0.3)}" cy="${f(y - s * 0.25)}" rx="${f(s * 0.55)}" ry="${f(s * 0.3)}" fill="${C.rock.a}" opacity="0.65" />`;
    }
    return out;
  }

  /* ---------- Escenario completo ultra-fluido ---------- */

  function backdrop(siteId) {
    const site = SITES[siteId] || SITES['mare-tranquillitatis'];
    const kind = site.kind;
    const C = CFG[kind];
    const id = M.uid('rl');

    const clipShape = kind === 'eros'
      ? '<ellipse cx="500" cy="900" rx="900" ry="640" />'
      : `<path d="M -10,${kind === 'mars' ? 276 : 278} Q 500,${kind === 'mars' ? 258 : 262} 1010,${kind === 'mars' ? 276 : 278} L 1010,600 L -10,600 Z" />`;

    const craters = site.craters.map((c) => realCrater(C, c[0], c[1], c[2], c[3])).join('');
    const rocks = site.rocks.map((r) => realRock(C, id, r[0], r[1], r[2], r[3])).join('');
    const ponds = (site.ponds || [])
      .map((p) => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="${p[2]}" ry="${p[3]}" fill="${C.ground[0]}" opacity="0.45" stroke="${C.ground[1]}" stroke-width="1.2" />`)
      .join('');
    const haze = C.haze
      ? `<rect x="-10" y="250" width="1020" height="130" fill="url(#${id}-haze)" />`
      : '';

    return `
      <svg viewBox="0 0 1000 594" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-gg" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="594">
            <stop offset="0" stop-color="${C.ground[0]}" />
            <stop offset="0.25" stop-color="${C.ground[1]}" />
            <stop offset="0.6" stop-color="${C.ground[2]}" />
            <stop offset="1" stop-color="${C.ground[3]}" />
          </linearGradient>
          <linearGradient id="${id}-depth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#000" stop-opacity="0" />
            <stop offset="1" stop-color="#000" stop-opacity="0.32" />
          </linearGradient>
          <linearGradient id="${id}-haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${C.haze || '#000'}" stop-opacity="0.55" />
            <stop offset="1" stop-color="${C.haze || '#000'}" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="${id}-pk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#c07a58" />
            <stop offset="1" stop-color="#6b3524" />
          </linearGradient>
          <radialGradient id="${id}-rg" cx="0.3" cy="0.25" r="0.85">
            <stop offset="0" stop-color="${C.rock.a}" />
            <stop offset="0.55" stop-color="${C.rock.b}" />
            <stop offset="1" stop-color="${C.rock.c}" />
          </radialGradient>
          <clipPath id="${id}-cl">${clipShape}</clipPath>
        </defs>

        ${skySvg(kind, id, site)}
        ${ridgeLayers(C, site, id)}

        <g clip-path="url(#${id}-cl)">
          <rect x="-10" y="250" width="1020" height="350" fill="url(#${id}-gg)" />
          ${C.texture ? `<image href="${C.texture}" x="-20" y="240" width="1040" height="360" preserveAspectRatio="xMidYMid slice" opacity="${kind === 'eros' ? 0.42 : 0.28}" />` : ''}
          ${groundDunes(C, C.seed)}
          ${haze}
          ${ponds}
          ${craters}
          ${pebbles(C, C.seed, C.pebbles)}
          ${rocks}
          <rect x="-10" y="250" width="1020" height="350" fill="url(#${id}-depth)" />
        </g>

        ${kind === 'eros' ? '<ellipse cx="500" cy="900" rx="900" ry="640" fill="none" stroke="#e8edf5" stroke-opacity="0.4" stroke-width="2" />' : ''}
      </svg>
    `;
  }

  /* ---------- Muestras recolectables realistas ---------- */

  function renderRockSample(styles, variant = 0) {
    const id = M.uid('rsx');
    const v = (((Number(variant) || 0) % 3) + 3) % 3;
    const rand = rng(v * 71 + 19);
    const cx = 42;
    const cy = 40;
    const rxv = [25, 23, 27][v];
    const ryv = [17, 19, 15][v];
    const N = 10;
    const pts = [];
    for (let i = 0; i < N; i += 1) {
      const a = (i / N) * Math.PI * 2 + (rand() - 0.5) * 0.2;
      const rr = 0.82 + rand() * 0.34;
      const sn = Math.sin(a);
      pts.push([cx + Math.cos(a) * rxv * rr, cy + (sn > 0 ? sn * ryv * rr * 0.55 : sn * ryv * rr)]);
    }
    const d = smoothClosed(pts);
    const lit = pts.filter((_, i) => i / N > 0.5 && i / N < 0.85);
    const hl = lit.length >= 3 ? smoothOpen(lit) : '';

    return `
      <svg viewBox="0 0 84 68" width="44" height="36" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-rg" cx="0.3" cy="0.25" r="0.85">
            <stop offset="0" stop-color="${styles.a}" />
            <stop offset="0.55" stop-color="${styles.b}" />
            <stop offset="1" stop-color="${styles.c}" />
          </radialGradient>
          <clipPath id="${id}-c"><path d="${d}" /></clipPath>
        </defs>

        <!-- Sombra de contacto geológica y montículo trasero de regolito -->
        <ellipse cx="46" cy="51" rx="28" ry="6" fill="#000000" opacity="0.45" />
        <ellipse cx="42" cy="47" rx="28" ry="7.5" fill="${styles.soilBack}" />

        <!-- Roca con relieve volumétrico curvo -->
        <path d="${d}" fill="url(#${id}-rg)" stroke="${styles.c}" stroke-width="0.8" />
        ${hl ? `<path d="${hl}" fill="none" stroke="${styles.a}" stroke-width="1.3" opacity="0.65" stroke-linecap="round" />` : ''}
        <g clip-path="url(#${id}-c)">
          <path d="M ${f(cx - rxv * 0.5)},${f(cy - ryv * 0.2)} Q ${cx},${f(cy - ryv * 0.55)} ${f(cx + rxv * 0.45)},${f(cy + ryv * 0.05)}" fill="none" stroke="${styles.glint}" stroke-width="1.4" stroke-linecap="round" opacity="0.75" />
          <path d="M ${f(cx - rxv * 0.2)},${f(cy + ryv * 0.1)} L ${f(cx + rxv * 0.3)},${f(cy + ryv * 0.3)}" fill="none" stroke="#ffbe76" stroke-width="1.1" stroke-linecap="round" opacity="0.75" />
        </g>

        <!-- Collar de regolito que entierra parcialmente la base -->
        <path d="M 12,50 Q 28,43 42,47 Q 58,43 72,50 Q 62,60 42,60 Q 22,60 12,50 Z" fill="${styles.soilFront}" stroke="${styles.soilRim}" stroke-width="0.9" stroke-opacity="0.6" />
        <ellipse cx="24" cy="53" rx="2.4" ry="1.4" fill="${styles.soilRim}" opacity="0.6" />
        <ellipse cx="60" cy="52.5" rx="2" ry="1.2" fill="${styles.soilRim}" opacity="0.5" />
      </svg>
    `;
  }

  /* Sobrescritura de escenarios y muestras */
  M.stageBackdropLuna = (siteId) => backdrop(siteId === 'mare-tranquillitatis' ? siteId : 'oceanus-procellarum');
  M.stageBackdropMarte = (siteId) => backdrop(siteId === 'ares-vallis' ? siteId : 'chryse-planitia');
  M.stageBackdropAsteroideEros = () => backdrop('asteroid-eros');
  M.renderRockSample = renderRockSample;
  M.reliefCircle = () => '';
  M.reliefShape = () => '';
})(typeof window !== 'undefined' ? window : globalThis);
