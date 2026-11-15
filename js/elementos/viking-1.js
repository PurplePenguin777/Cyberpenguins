/**
 * Hardware NASA 3/6 (estilo "facetado fiel"): Viking 1 Lander (Marte).
 * Referencia: cuerpo hexagonal bajo, 3 patas con platos, 2 cámaras sobre postes cortos,
 * 2 generadores RTG bajo cubiertas metálicas contra el viento, antena de alta ganancia
 * pequeña (disco de ~0,75 m) sobre un mástil en una esquina, antena UHF de paleta,
 * pluma meteorológica y brazo recolector con cuchara al frente.
 * Luz arriba-izquierda: cara superior clara, lado izquierdo medio-claro, lado derecho en sombra.
 */
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
  const uid = M.uid;

  const S = M.STYLE || {
    outline: '#334155',
    metal: { light: '#f1f5f9', mid: '#cbd5e1', dark: '#64748b' },
    kapton: { light: '#fde68a', mid: '#f59e0b', dark: '#b45309' }
  };

  const f = (v) => Number(v).toFixed(1);
  const poly = (pts) => pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');

  // Disco parabólico pequeño: cara en abanico de tres tonos
  function dish(cx, cy, rx, ry, rotDeg, N) {
    const rot = (rotDeg * Math.PI) / 180;
    const rim = (t) => {
      const x = rx * Math.cos(t);
      const y = ry * Math.sin(t);
      return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
    };
    const shell = [];
    const rimLine = [];
    for (let i = 0; i < 24; i += 1) {
      const p = rim((i / 24) * Math.PI * 2);
      rimLine.push(p);
      shell.push([p[0] - 2, p[1] + 2]);
    }
    let fan = '';
    for (let i = 0; i < N; i += 1) {
      const t0 = (i / N) * Math.PI * 2;
      const t1 = ((i + 1) / N) * Math.PI * 2;
      const mid = rim((t0 + t1) / 2);
      const vx = mid[0] - cx;
      const vy = mid[1] - cy;
      const len = Math.hypot(vx, vy) || 1;
      const d = (vx / len) * 0.55 + (vy / len) * 0.83;
      const tone = d > 0.35 ? '#ffffff' : d > -0.25 ? '#e2e8f0' : d > -0.7 ? '#cbd5e1' : '#94a3b8';
      const a = rim(t0);
      const b = rim(t1);
      fan += `<polygon points="${f(cx)},${f(cy)} ${f(a[0])},${f(a[1])} ${f(b[0])},${f(b[1])}" fill="${tone}" stroke="${tone}" stroke-width="0.5" stroke-linejoin="round" />`;
    }
    return `
      <polygon points="${poly(shell)}" fill="#64748b" stroke="${S.outline}" stroke-width="0.9" stroke-linejoin="round" />
      ${fan}
      <polygon points="${poly(rimLine)}" fill="none" stroke="${S.metal.dark}" stroke-width="1.1" stroke-linejoin="round" />
    `;
  }

  // Cubierta contra el viento de un RTG: cilindro con costillas
  function rtgCover(x, y) {
    let ribs = '';
    for (let i = 1; i < 5; i += 1) {
      ribs += `<line x1="${x + i * 3.2}" y1="${y + 0.8}" x2="${x + i * 3.2}" y2="${y + 9.2}" />`;
    }
    return `
      <rect x="${x}" y="${y}" width="16" height="10" rx="3" fill="${S.metal.mid}" stroke="${S.outline}" stroke-width="0.9" />
      <rect x="${x}" y="${y}" width="16" height="3.2" rx="1.6" fill="${S.metal.light}" opacity="0.8" />
      <g stroke="${S.metal.dark}" stroke-width="0.8">${ribs}</g>
    `;
  }

  function viking1() {
    const id = uid('vik');

    // Cuerpo: hexágono achatado, cara superior y 3 caras laterales visibles
    const cx = 79;
    const cy = 70;
    const rx = 38;
    const ry = 11;
    const depth = 16;
    const top = [0, 60, 120, 180, 240, 300].map((deg) => {
      const a = (deg * Math.PI) / 180;
      return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
    });
    const bot = top.map((p) => [p[0], p[1] + depth]);
    const hatch = top.map((p) => [cx + (p[0] - cx) * 0.6, cy - 1 + (p[1] - cy) * 0.6]);
    const sideTones = ['#94a3b8', '#cbd5e1', '#e2e8f0'];
    let sides = '';
    for (let i = 0; i < 3; i += 1) {
      sides += `<polygon points="${poly([top[i], top[i + 1], bot[i + 1], bot[i]])}" fill="${sideTones[i]}" stroke="${S.outline}" stroke-width="1" stroke-linejoin="round" />`;
    }

    return `
      <svg viewBox="0 0 158 138" width="120" height="105" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.58)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
        </defs>

        <ellipse cx="79" cy="123" rx="58" ry="11" fill="url(#${id}-shadow)" />

        <!-- 3 patas con puntal y plato -->
        <g stroke-linecap="round">
          <line x1="56" y1="80" x2="38" y2="106" stroke="${S.metal.dark}" stroke-width="2" />
          <line x1="48" y1="84" x2="26" y2="116" stroke="${S.metal.light}" stroke-width="4.2" />
          <line x1="102" y1="80" x2="120" y2="106" stroke="${S.metal.dark}" stroke-width="2" />
          <line x1="110" y1="84" x2="132" y2="116" stroke="${S.metal.mid}" stroke-width="4.2" />
          <line x1="79" y1="92" x2="79" y2="123" stroke="${S.metal.light}" stroke-width="4.2" />
        </g>
        <ellipse cx="26" cy="117" rx="11" ry="4" fill="${S.metal.light}" stroke="${S.metal.dark}" stroke-width="1" />
        <ellipse cx="132" cy="117" rx="11" ry="4" fill="${S.metal.mid}" stroke="${S.metal.dark}" stroke-width="1" />
        <ellipse cx="79" cy="124" rx="11" ry="4" fill="${S.metal.light}" stroke="${S.metal.dark}" stroke-width="1" />

        <!-- Pluma meteorológica a la izquierda -->
        <line x1="42" y1="66" x2="20" y2="46" stroke="${S.metal.light}" stroke-width="2" stroke-linecap="round" />
        <circle cx="19" cy="45" r="2.4" fill="#38bdf8" stroke="${S.outline}" stroke-width="0.7" />

        <!-- Cuerpo hexagonal -->
        ${sides}
        <polygon points="${poly(top)}" fill="${S.metal.light}" stroke="${S.outline}" stroke-width="1" stroke-linejoin="round" />
        <polygon points="${poly(hatch)}" fill="#94a3b8" stroke="${S.metal.dark}" stroke-width="0.9" stroke-linejoin="round" />

        <!-- Cubiertas de RTG a ambos lados de la cubierta superior -->
        ${rtgCover(38, 62)}
        ${rtgCover(104, 62)}

        <!-- Antena UHF de paleta y mástil -->
        <line x1="60" y1="62" x2="57" y2="44" stroke="${S.metal.dark}" stroke-width="1.8" stroke-linecap="round" />
        <polygon points="51,37 62,39 61,47 50,45" fill="${S.metal.light}" stroke="${S.outline}" stroke-width="0.9" stroke-linejoin="round" />

        <!-- 2 cámaras sobre postes cortos -->
        <rect x="65" y="50" width="6" height="14" rx="1.4" fill="${S.metal.mid}" stroke="${S.outline}" stroke-width="0.9" />
        <rect x="64.5" y="48" width="7" height="5" rx="1.2" fill="#1e293b" />
        <circle cx="68" cy="50.5" r="1.2" fill="#38bdf8" />
        <rect x="85" y="50" width="6" height="14" rx="1.4" fill="${S.metal.light}" stroke="${S.outline}" stroke-width="0.9" />
        <rect x="84.5" y="48" width="7" height="5" rx="1.2" fill="#1e293b" />
        <circle cx="88" cy="50.5" r="1.2" fill="#38bdf8" />

        <!-- Antena de alta ganancia pequeña sobre mástil -->
        <line x1="100" y1="62" x2="110" y2="42" stroke="${S.metal.dark}" stroke-width="2" stroke-linecap="round" />
        ${dish(113, 33, 10, 12, 25, 10)}

        <!-- Brazo recolector con cuchara al frente-derecha -->
        <line x1="96" y1="84" x2="134" y2="97" stroke="${S.metal.light}" stroke-width="2.4" stroke-linecap="round" />
        <polygon points="132,94 142,97 140,103 130,100" fill="${S.metal.mid}" stroke="${S.outline}" stroke-width="0.9" stroke-linejoin="round" />
      </svg>
    `;
  }

  M.viking1 = viking1;
})(typeof window !== 'undefined' ? window : globalThis);
