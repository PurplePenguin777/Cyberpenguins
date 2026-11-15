/* =========================================================
   Elemento: Realismo de superficies
   Terreno lunar, marciano y de Eros con relieve iluminado (ruido + luz arriba-izquierda),
   cráteres con volumen, rocas con sombra de contacto, muestras realistas y relieve
   sobre planetas y asteroides.
   Calidad: M.REALISM.quality = 'high' | 'low'
     - 'low' desactiva los filtros SVG (dispositivos modestos). Se activa solo con
       ?calidad=baja en la URL o en equipos con <= 2 GB de memoria.
   Cargar DESPUÉS de models.js (para sobrescribir escenarios y muestras).
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
  const lowEnd = Boolean(global.navigator && global.navigator.deviceMemory && global.navigator.deviceMemory <= 2);
  M.REALISM = Object.assign(
    { quality: params.get('calidad') === 'baja' || lowEnd ? 'low' : 'high', marsSky: 'day' },
    M.REALISM || {}
  );
  const hi = () => M.REALISM.quality !== 'low';

  /* ---------- Utilidades ---------- */

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

  /* ---------- Filtros de relieve ---------- */

  // Textura de terreno: relieve grueso + grano fino (+ variación de albedo), multiplicado sobre el color base
  function bumpFilter(fid, o) {
    const albedo = o.ax
      ? `
        <feTurbulence type="fractalNoise" baseFrequency="${o.ax} ${o.ay}" numOctaves="3" seed="${o.seed + 9}" result="n3" />
        <feColorMatrix in="n3" type="matrix" values="0.55 0 0 0 0.72  0.55 0 0 0 0.72  0.55 0 0 0 0.72  0 0 0 0 1" result="alb" />
        <feComposite in="s1" in2="alb" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="s2" />`
      : '';
    return `
      <filter id="${fid}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="${o.fx} ${o.fy}" numOctaves="4" seed="${o.seed}" result="n1" />
        <feDiffuseLighting in="n1" surfaceScale="${f(o.s1)}" diffuseConstant="1" lighting-color="#ffffff" result="l1">
          <feDistantLight azimuth="225" elevation="50" />
        </feDiffuseLighting>
        <feTurbulence type="fractalNoise" baseFrequency="${o.gx} ${o.gy}" numOctaves="2" seed="${o.seed + 5}" result="n2" />
        <feDiffuseLighting in="n2" surfaceScale="${f(o.s2)}" diffuseConstant="1" lighting-color="#ffffff" result="l2">
          <feDistantLight azimuth="225" elevation="55" />
        </feDiffuseLighting>
        <feComposite in="l1" in2="l2" operator="arithmetic" k1="1.6" k2="0" k3="0" k4="0" result="lit" />
        <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="s1" />
        ${albedo}
        <feComposite in="${o.ax ? 's2' : 's1'}" in2="SourceAlpha" operator="in" />
      </filter>`;
  }

  // Relieve como capa translúcida (sombras negras y luces blancas) para cuerpos ya coloreados
  function reliefFilter(fid, size, seed, K) {
    const freq = (3.2 / size).toFixed(4);
    const surf = Math.max(1.2, size * 0.06).toFixed(2);
    return `
      <filter id="${fid}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="5" seed="${seed}" result="n" />
        <feDiffuseLighting in="n" surfaceScale="${surf}" diffuseConstant="1" lighting-color="#ffffff" result="lit">
          <feDistantLight azimuth="225" elevation="50" />
        </feDiffuseLighting>
        <feColorMatrix in="lit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${-K} 0 0 0 ${(0.766 * K).toFixed(3)}" result="sh" />
        <feColorMatrix in="lit" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${K} 0 0 0 ${(-0.766 * K).toFixed(3)}" result="hl" />
        <feMerge result="m"><feMergeNode in="sh" /><feMergeNode in="hl" /></feMerge>
        <feComposite in="m" in2="SourceAlpha" operator="in" />
      </filter>`;
  }

  // Cráteres de la Luna vista como esfera: más aplastados cerca del limbo
  function craterField(r, seed) {
    const rand = rng(seed * 31 + 7);
    const count = Math.max(10, Math.min(60, Math.round(r / 2.2)));
    let out = '';
    for (let i = 0; i < count; i += 1) {
      const ang = rand() * Math.PI * 2;
      const rho = Math.sqrt(rand()) * 0.92;
      const x = Math.cos(ang) * rho * r;
      const y = Math.sin(ang) * rho * r;
      const z = Math.sqrt(1 - rho * rho);
      const rc = r * (0.025 + Math.pow(rand(), 2.4) * 0.11);
      const rot = f((ang * 180) / Math.PI);
      out +=
        `<ellipse transform="translate(${f(x - rc * 0.18)} ${f(y - rc * 0.18)}) rotate(${rot})" rx="${f(rc * z * 1.08)}" ry="${f(rc * 1.08)}" fill="#f1f5f9" opacity="0.26" />` +
        `<ellipse transform="translate(${f(x + rc * 0.1)} ${f(y + rc * 0.1)}) rotate(${rot})" rx="${f(rc * z)}" ry="${f(rc)}" fill="#0f172a" opacity="0.34" />`;
    }
    return out;
  }

  // Para planetBody: relieve iluminado sobre la esfera (Tierra suave, Luna y Marte marcados)
  M.reliefCircle = function reliefCircle(r, seed = 1, kind = 'moon') {
    if (!hi()) return '';
    const fid = M.uid('rel');
    const K = kind === 'earth' ? 1.1 : kind === 'mars' ? 2.4 : 2.6;
    return `
      <defs>${reliefFilter(fid, r * 2, seed, K)}</defs>
      <circle r="${f(r)}" fill="#000" filter="url(#${fid})" />
      ${kind === 'moon' ? craterField(r, seed) : ''}
    `;
  };

  // Para asteroides: relieve sobre la silueta (puntos "x,y x,y ...")
  M.reliefShape = function reliefShape(points, size, seed = 1) {
    if (!hi()) return '';
    const fid = M.uid('rels');
    return `<defs>${reliefFilter(fid, size * 2, seed, 2.0)}</defs><polygon points="${points}" fill="#000" filter="url(#${fid})" />`;
  };

  /* ---------- Configuración por cuerpo ---------- */

  const CFG = {
    moon: {
      ground: ['#a9b0bb', '#8f97a4', '#6b7381', '#484f5d'],
      ridges: [
        { y0: 266, amp: 40, steps: 9, seed: 5, fill: '#2a3345', edge: '#8c99b2' },
        { y0: 276, amp: 22, steps: 12, seed: 9, fill: '#3a4457', edge: '#a3aec4' }
      ],
      crater: { dark: '#232831', mid: '#5a6270', rim: '#d6dbe3' },
      rock: { a: '#d6dbe3', b: '#8f96a3', c: '#474d59' },
      bump: 1,
      pebbles: 30,
      seed: 11
    },
    mars: {
      ground: ['#d99d69', '#c07746', '#9c5731', '#6d3b21'],
      ridges: [
        { y0: 262, amp: 24, steps: 10, seed: 15, fill: '#a56a54', edge: '#e0a888' },
        { y0: 272, amp: 14, steps: 12, seed: 19, fill: '#8c4f3a', edge: '#d49a7a' }
      ],
      haze: '#e2b08a',
      crater: { dark: '#4f2718', mid: '#8a4829', rim: '#f2bb8c' },
      rock: { a: '#e29a68', b: '#a4552f', c: '#5a2916' },
      bump: 1.15,
      pebbles: 34,
      seed: 23
    },
    eros: {
      ground: ['#b6b6b3', '#98989b', '#717174', '#4c4c50'],
      ridges: [],
      crater: { dark: '#25262a', mid: '#58585d', rim: '#d9d9d6' },
      rock: { a: '#d2d2cf', b: '#8d8d90', c: '#46464a' },
      bump: 1.3,
      pebbles: 52,
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

  /* ---------- Piezas del escenario ---------- */

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
          <radialGradient id="${id}-sun">
            <stop offset="0" stop-color="#fff0d8" stop-opacity="0.9" />
            <stop offset="0.3" stop-color="#ffd6aa" stop-opacity="0.35" />
            <stop offset="1" stop-color="#ffc896" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="594" fill="url(#${id}-sky)" />
        <circle cx="150" cy="104" r="58" fill="url(#${id}-sun)" />
        <circle cx="150" cy="104" r="6" fill="#fff4e0" />
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
      ${starField(CFG[kind].seed, 16, 200)}
      ${planet}
      ${phobos}
    `;
  }

  function ridgeLayers(C, site, id) {
    let out = '';
    C.ridges.forEach((rg) => {
      const rand = rng(rg.seed + site.ridgeSeed);
      const pts = [];
      for (let i = 0; i <= rg.steps; i += 1) {
        pts.push([-20 + (1040 * i) / rg.steps, rg.y0 - rand() * rg.amp]);
      }
      const d = smoothOpen(pts);
      out += `<path d="${d} L 1020,300 L -20,300 Z" fill="${rg.fill}" />`;
      out += `<path d="${d}" fill="none" stroke="${rg.edge}" stroke-opacity="0.5" stroke-width="1.2" />`;
    });

    if (site.twinPeaks) {
      const north = smoothOpen([[430, 280], [500, 248], [570, 208], [640, 242], [704, 280]]);
      const south = smoothOpen([[660, 282], [740, 228], [800, 176], [872, 224], [960, 282]]);
      out += `<path d="${north} L 704,300 L 430,300 Z" fill="url(#${id}-pk)" />`;
      out += `<path d="${south} L 960,300 L 660,300 Z" fill="url(#${id}-pk)" />`;
      out += `<path d="${north}" fill="none" stroke="#f0b894" stroke-opacity="0.45" stroke-width="1.2" />`;
      out += `<path d="${south}" fill="none" stroke="#f0b894" stroke-opacity="0.45" stroke-width="1.2" />`;
    }
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
          <stop offset="0.55" stop-color="${C.crater.rim}" stop-opacity="0.38" />
          <stop offset="1" stop-color="${C.crater.rim}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="${u}-bowl" x1="0.1" y1="0.05" x2="0.9" y2="0.95">
          <stop offset="0" stop-color="${C.crater.dark}" />
          <stop offset="0.5" stop-color="${C.crater.mid}" />
          <stop offset="1" stop-color="${C.crater.rim}" />
        </linearGradient>
        <mask id="${u}-m" maskUnits="userSpaceOnUse" x="${f(cx - rx * 1.2)}" y="${f(cy - ry * 1.2)}" width="${f(rx * 2.4)}" height="${f(ry * 2.4)}">
          <rect x="${f(cx - rx * 1.2)}" y="${f(cy - ry * 1.2)}" width="${f(rx * 2.4)}" height="${f(ry * 2.4)}" fill="#fff" />
          <ellipse cx="${f(cx + rx * 0.22)}" cy="${f(cy + ry * 0.3)}" rx="${f(rx * 0.95)}" ry="${f(ry * 0.9)}" fill="#000" />
        </mask>
      </defs>
      <ellipse cx="${cx}" cy="${cy}" rx="${f(rx * 1.5)}" ry="${f(ry * 1.5)}" fill="url(#${u}-ej)" />
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${u}-bowl)" />
      <g mask="url(#${u}-m)"><ellipse cx="${cx}" cy="${cy}" rx="${f(rx * 0.99)}" ry="${f(ry * 0.99)}" fill="#000" opacity="0.45" /></g>
      <ellipse cx="${f(cx + rx * 0.12)}" cy="${f(cy + ry * 0.2)}" rx="${f(rx * 0.62)}" ry="${f(ry * 0.5)}" fill="${C.crater.mid}" opacity="0.55" />
      <path d="${arc(178, 276)}" fill="none" stroke="${C.crater.rim}" stroke-width="1.6" stroke-linecap="round" opacity="0.7" />
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${C.crater.dark}" stroke-opacity="0.35" stroke-width="1" />
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
      <ellipse cx="${f(cx + s * 0.4)}" cy="${f(cy + s * 0.5)}" rx="${f(s * 1.3)}" ry="${f(s * 0.32)}" fill="#000" opacity="0.5" filter="url(#${id}-soft)" />
      <ellipse cx="${cx}" cy="${f(cy + s * 0.5)}" rx="${f(s * 0.95)}" ry="${f(s * 0.18)}" fill="#000" opacity="0.4" />
      <path d="${d}" fill="url(#${id}-rg)" stroke="${C.rock.c}" stroke-width="0.8" ${hi() ? `filter="url(#${id}-rf)"` : ''} />
      ${hl ? `<path d="${hl}" fill="none" stroke="${C.rock.a}" stroke-width="${f(s * 0.09)}" opacity="0.55" stroke-linecap="round" />` : ''}
    `;
  }

  function pebbles(C, seed, count) {
    const rand = rng(seed);
    let out = '';
    for (let i = 0; i < count; i += 1) {
      const y = 300 + Math.pow(rand(), 0.8) * 280;
      const s = 1.3 + ((y - 280) / 320) * 5;
      const x = rand() * 1000;
      out +=
        `<ellipse cx="${f(x + s * 0.5)}" cy="${f(y + s * 0.25)}" rx="${f(s * 1.1)}" ry="${f(s * 0.35)}" fill="#000" opacity="0.3" />` +
        `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s)}" ry="${f(s * 0.68)}" fill="${C.rock.b}" />` +
        `<ellipse cx="${f(x - s * 0.3)}" cy="${f(y - s * 0.25)}" rx="${f(s * 0.55)}" ry="${f(s * 0.3)}" fill="${C.rock.a}" opacity="0.6" />`;
    }
    return out;
  }

  /* ---------- Escenario completo ---------- */

  function backdrop(siteId) {
    const site = SITES[siteId] || SITES['mare-tranquillitatis'];
    const kind = site.kind;
    const C = CFG[kind];
    const id = M.uid('rl');
    const b = C.bump;

    const clipShape = kind === 'eros'
      ? '<ellipse cx="500" cy="900" rx="900" ry="640" />'
      : `<path d="M -10,${kind === 'mars' ? 276 : 278} Q 500,${kind === 'mars' ? 258 : 262} 1010,${kind === 'mars' ? 276 : 278} L 1010,600 L -10,600 Z" />`;

    const filters = hi()
      ? bumpFilter(`${id}-nf`, { fx: 0.007, fy: 0.018, s1: 3.2 * b, gx: 0.3, gy: 0.45, s2: 0.9 * b, seed: C.seed, ax: 0.0035, ay: 0.009 }) +
        bumpFilter(`${id}-ff`, { fx: 0.016, fy: 0.045, s1: 2.6 * b, gx: 0.5, gy: 0.8, s2: 0.7 * b, seed: C.seed + 2, ax: 0.008, ay: 0.02 }) +
        bumpFilter(`${id}-rf`, { fx: 0.06, fy: 0.06, s1: 2.2, gx: 0.4, gy: 0.4, s2: 0.9, seed: C.seed + 7 })
      : '';

    const craters = site.craters.map((c) => realCrater(C, c[0], c[1], c[2], c[3])).join('');
    const rocks = site.rocks.map((r) => realRock(C, id, r[0], r[1], r[2], r[3])).join('');
    const ponds = (site.ponds || [])
      .map((p) => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="${p[2]}" ry="${p[3]}" fill="${C.ground[0]}" opacity="0.5" filter="url(#${id}-soft)" />`)
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
            <stop offset="1" stop-color="#000" stop-opacity="0.3" />
          </linearGradient>
          <linearGradient id="${id}-fg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" />
            <stop offset="1" stop-color="#000" />
          </linearGradient>
          <mask id="${id}-fm" maskUnits="userSpaceOnUse" x="-10" y="250" width="1020" height="350">
            <rect x="-10" y="250" width="1020" height="150" fill="url(#${id}-fg)" />
          </mask>
          <linearGradient id="${id}-haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${C.haze || '#000'}" stop-opacity="0.5" />
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
          <filter id="${id}-soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="2.2" /></filter>
          <clipPath id="${id}-cl">${clipShape}</clipPath>
          ${filters}
        </defs>

        ${skySvg(kind, id, site)}
        ${ridgeLayers(C, site, id)}

        <g clip-path="url(#${id}-cl)">
          <rect x="-10" y="250" width="1020" height="350" fill="url(#${id}-gg)" ${hi() ? `filter="url(#${id}-nf)"` : ''} />
          ${hi() ? `<rect x="-10" y="250" width="1020" height="350" fill="url(#${id}-gg)" filter="url(#${id}-ff)" mask="url(#${id}-fm)" />` : ''}
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

  /* ---------- Muestras recolectables realistas (reemplaza la roca facetada) ---------- */

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
    const filters = hi()
      ? bumpFilter(`${id}-rf`, { fx: 0.07, fy: 0.07, s1: 2.4, gx: 0.45, gy: 0.45, s2: 0.9, seed: 5 + v }) +
        bumpFilter(`${id}-sf`, { fx: 0.12, fy: 0.12, s1: 1.4, gx: 0.6, gy: 0.6, s2: 0.8, seed: 9 + v })
      : '';

    return `
      <svg viewBox="0 0 84 68" width="66" height="54" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-rg" cx="0.3" cy="0.25" r="0.85">
            <stop offset="0" stop-color="${styles.a}" />
            <stop offset="0.55" stop-color="${styles.b}" />
            <stop offset="1" stop-color="${styles.c}" />
          </radialGradient>
          <filter id="${id}-soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="1.6" /></filter>
          <clipPath id="${id}-c"><path d="${d}" /></clipPath>
          ${filters}
        </defs>

        <!-- Anillo de escáner (indica que se puede recoger) -->
        <ellipse class="sample-ground-ring" cx="42" cy="50" rx="28" ry="9.5" fill="none" stroke="${styles.glint}" stroke-width="1.4" stroke-opacity="0.74" />

        <!-- Sombra de contacto y montículo trasero de regolito -->
        <ellipse cx="46" cy="51" rx="29" ry="6" fill="#000" opacity="0.5" filter="url(#${id}-soft)" />
        <ellipse cx="42" cy="47" rx="29" ry="8" fill="${styles.soilBack}" />

        <!-- Roca con relieve -->
        <path d="${d}" fill="url(#${id}-rg)" stroke="${styles.c}" stroke-width="0.8" ${hi() ? `filter="url(#${id}-rf)"` : ''} />
        ${hl ? `<path d="${hl}" fill="none" stroke="${styles.a}" stroke-width="1.4" opacity="0.55" stroke-linecap="round" />` : ''}
        <g clip-path="url(#${id}-c)">
          <path class="sample-glint-vein" d="M ${f(cx - rxv * 0.5)},${f(cy - ryv * 0.2)} Q ${cx},${f(cy - ryv * 0.55)} ${f(cx + rxv * 0.45)},${f(cy + ryv * 0.05)}" fill="none" stroke="${styles.glint}" stroke-width="1.8" stroke-linecap="round" />
          <path class="sample-glint-vein" d="M ${f(cx - rxv * 0.2)},${f(cy + ryv * 0.1)} L ${f(cx + rxv * 0.3)},${f(cy + ryv * 0.3)}" fill="none" stroke="#ffbe76" stroke-width="1.3" stroke-linecap="round" />
          <polygon class="sample-glint-vein" points="${f(cx + 6)},${f(cy - 9)} ${f(cx + 10)},${f(cy - 12)} ${f(cx + 12)},${f(cy - 7)}" fill="${styles.glint}" opacity="0.9" />
        </g>

        <!-- Collar de regolito que entierra parcialmente la base -->
        <path d="M 12,50 Q 28,43 42,47 Q 58,43 72,50 Q 62,60 42,60 Q 22,60 12,50 Z" fill="${styles.soilFront}" stroke="${styles.soilRim}" stroke-width="1" stroke-opacity="0.7" ${hi() ? `filter="url(#${id}-sf)"` : ''} />
        <ellipse cx="24" cy="53" rx="2.4" ry="1.4" fill="${styles.soilRim}" opacity="0.7" />
        <ellipse cx="60" cy="52.5" rx="2" ry="1.2" fill="${styles.soilRim}" opacity="0.6" />
      </svg>
    `;
  }

  /* ---------- Sobrescritura de escenarios y muestras ---------- */

  M.stageBackdropLuna = (siteId) => backdrop(siteId === 'mare-tranquillitatis' ? siteId : 'oceanus-procellarum');
  M.stageBackdropMarte = (siteId) => backdrop(siteId === 'ares-vallis' ? siteId : 'chryse-planitia');
  M.stageBackdropAsteroideEros = () => backdrop('asteroid-eros');
  M.renderRockSample = renderRockSample;
})(typeof window !== 'undefined' ? window : globalThis);
