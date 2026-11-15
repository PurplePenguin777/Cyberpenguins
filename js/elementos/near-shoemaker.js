/**
 * Hardware NASA 6/6 (estilo "facetado fiel"): NEAR Shoemaker (433 Eros).
 * Referencia: cuerpo prismático compacto con aislamiento dorado, 4 paneles solares fijos de GaAs
 * dispuestos en 2 alas (2 paneles por lado, sin articulaciones), antena parabólica de alta
 * ganancia fija de 1,5 m en la parte superior y la cubierta de instrumentos (cámara MSI,
 * espectrómetro NIS, altímetro láser NLR) en una cara del cuerpo. No tiene patas: terminó
 * posada sobre el regolito de Eros.
 * Luz arriba-izquierda: cara superior clara, cara frontal media, cara derecha en sombra.
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
    kapton: { light: '#fde68a', mid: '#f59e0b', dark: '#b45309' },
    solar: { light: '#3b82f6', mid: '#1d4ed8', dark: '#172554' }
  };

  const f = (v) => Number(v).toFixed(1);
  const poly = (pts) => pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');

  // Interpolación bilineal sobre un cuadrilátero TL, TR, BR, BL
  function quadPoint(q, u, v) {
    const [tl, tr, br, bl] = q;
    return [
      (1 - u) * (1 - v) * tl[0] + u * (1 - v) * tr[0] + u * v * br[0] + (1 - u) * v * bl[0],
      (1 - u) * (1 - v) * tl[1] + u * (1 - v) * tr[1] + u * v * br[1] + (1 - u) * v * bl[1]
    ];
  }

  // Panel solar con cuadrícula de celdas
  function panel(q, cols, rows) {
    let grid = '';
    for (let i = 1; i < cols; i += 1) {
      const a = quadPoint(q, i / cols, 0);
      const b = quadPoint(q, i / cols, 1);
      grid += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" />`;
    }
    for (let j = 1; j < rows; j += 1) {
      const a = quadPoint(q, 0, j / rows);
      const b = quadPoint(q, 1, j / rows);
      grid += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" />`;
    }
    return `
      <polygon points="${poly(q)}" fill="${S.solar.mid}" stroke="#93c5fd" stroke-width="1" stroke-linejoin="round" />
      <g stroke="#60a5fa" stroke-width="0.7" opacity="0.85">${grid}</g>
    `;
  }

  function nearShoemaker() {
    const id = uid('near');

    // Antena parabólica: elipse en perspectiva, cara cóncava en abanico de tres tonos
    const dcx = 90;
    const dcy = 34;
    const drx = 22;
    const dry = 11;
    const rot = (-10 * Math.PI) / 180;
    const rim = (t) => {
      const x = drx * Math.cos(t);
      const y = dry * Math.sin(t);
      return [dcx + x * Math.cos(rot) - y * Math.sin(rot), dcy + x * Math.sin(rot) + y * Math.cos(rot)];
    };
    const shell = [];
    const rimLine = [];
    for (let i = 0; i < 28; i += 1) {
      const p = rim((i / 28) * Math.PI * 2);
      rimLine.push(p);
      shell.push([p[0], p[1] + 3]);
    }
    let fan = '';
    const N = 14;
    for (let i = 0; i < N; i += 1) {
      const t0 = (i / N) * Math.PI * 2;
      const t1 = ((i + 1) / N) * Math.PI * 2;
      const mid = rim((t0 + t1) / 2);
      const vx = mid[0] - dcx;
      const vy = mid[1] - dcy;
      const len = Math.hypot(vx, vy) || 1;
      const d = (vx / len) * 0.55 + (vy / len) * 0.83;
      const tone = d > 0.35 ? '#ffffff' : d > -0.25 ? '#e2e8f0' : d > -0.7 ? '#cbd5e1' : '#94a3b8';
      const a = rim(t0);
      const b = rim(t1);
      fan += `<polygon points="${f(dcx)},${f(dcy)} ${f(a[0])},${f(a[1])} ${f(b[0])},${f(b[1])}" fill="${tone}" stroke="${tone}" stroke-width="0.5" stroke-linejoin="round" />`;
    }
    const F = [98, 14];
    const struts = [0.15 * Math.PI, 0.85 * Math.PI, -0.5 * Math.PI]
      .map((t) => {
        const p = rim(t);
        return `<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${F[0]}" y2="${F[1]}" />`;
      })
      .join('');

    // Paneles: 2 alas x 2 paneles
    const leftOuter = [[10, 76], [38, 74], [38, 95], [10, 97]];
    const leftInner = [[40, 74], [66, 72.5], [66, 94], [40, 95]];
    const rightInner = [[110, 72.5], [136, 74], [136, 95], [110, 94]];
    const rightOuter = [[138, 74], [166, 76], [166, 97], [138, 95]];

    return `
      <svg viewBox="0 0 176 146" width="156" height="128" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.62)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
        </defs>

        <!-- Sombra suave de contacto sobre el regolito -->
        <ellipse cx="88" cy="110" rx="66" ry="9" fill="url(#${id}-shadow)" />

        <!-- 4 paneles solares fijos en 2 alas -->
        ${panel(leftOuter, 5, 3)}
        ${panel(leftInner, 4, 3)}
        ${panel(rightInner, 4, 3)}
        ${panel(rightOuter, 5, 3)}
        <rect x="65" y="80" width="5" height="9" rx="1" fill="${S.metal.dark}" stroke="${S.outline}" stroke-width="0.8" />
        <rect x="106" y="80" width="5" height="9" rx="1" fill="${S.metal.dark}" stroke="${S.outline}" stroke-width="0.8" />

        <!-- Cuerpo prismático con aislamiento dorado -->
        <polygon points="68,62 106,62 114,56 76,56" fill="${S.kapton.light}" stroke="#78350f" stroke-width="1" stroke-linejoin="round" />
        <polygon points="68,62 106,62 106,106 68,106" fill="${S.kapton.mid}" stroke="#78350f" stroke-width="1" stroke-linejoin="round" />
        <polygon points="106,62 114,56 114,100 106,106" fill="${S.kapton.dark}" stroke="#78350f" stroke-width="1" stroke-linejoin="round" />
        <g stroke="#78350f" stroke-width="0.7" opacity="0.6">
          <line x1="68" y1="84" x2="106" y2="84" />
          <line x1="87" y1="62" x2="87" y2="106" />
        </g>

        <!-- Cubierta de instrumentos: cámara MSI, espectrómetro NIS y altímetro láser NLR -->
        <circle cx="79" cy="73" r="6.2" fill="#1e293b" stroke="${S.metal.light}" stroke-width="1.1" />
        <circle cx="79" cy="73" r="3" fill="#0f172a" stroke="#38bdf8" stroke-width="0.8" />
        <rect x="92" y="67" width="11" height="14" rx="1.4" fill="${S.metal.mid}" stroke="${S.outline}" stroke-width="0.9" />
        <rect x="94.5" y="70" width="6" height="8" rx="1" fill="#1e293b" />
        <circle cx="76" cy="95" r="3.6" fill="#334155" stroke="${S.metal.light}" stroke-width="0.9" />
        <rect x="88" y="91" width="13" height="8" rx="1.2" fill="${S.metal.light}" stroke="${S.outline}" stroke-width="0.9" />

        <!-- Soporte y antena parabólica fija de alta ganancia -->
        <line x1="88" y1="57" x2="90" y2="44" stroke="${S.metal.dark}" stroke-width="3.2" stroke-linecap="round" />
        <polygon points="${poly(shell)}" fill="#64748b" stroke="${S.outline}" stroke-width="1" stroke-linejoin="round" />
        ${fan}
        <polygon points="${poly(rimLine)}" fill="none" stroke="${S.metal.dark}" stroke-width="1.3" stroke-linejoin="round" />
        <g stroke="#64748b" stroke-width="1.6" stroke-linecap="round">${struts}</g>
        <rect x="${F[0] - 2.5}" y="${F[1] - 3}" width="5.5" height="6" rx="1.2" fill="${S.kapton.mid}" stroke="#78350f" stroke-width="0.8" />
      </svg>
    `;
  }

  M.nearShoemaker = nearShoemaker;
})(typeof window !== 'undefined' ? window : globalThis);
