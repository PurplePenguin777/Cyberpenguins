/**
 * Hardware NASA 5/6 (estilo "facetado fiel"): Pioneer 10 (Espacio Profundo).
 * Referencia: antena parabólica de 2,74 m con alimentador sobre trípode, bus hexagonal poco
 * profundo detrás de la antena, 2 plumas con 2 RTG cada una (4 RTG en total), pluma larga del
 * magnetómetro y placa dorada fijada a los puntales de la antena.
 * Las plumas se dibujan acortadas para que quepan en la escena; las proporciones de la antena
 * y del bus respetan la referencia. Luz arriba-izquierda; la antena es cóncava, así que su
 * zona iluminada es la inferior derecha.
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

  // Pluma de celosía: dos rieles y diagonales
  function truss(x1, y1, x2, y2, w = 2.2, segs = 7, color = '#cbd5e1') {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * w;
    const ny = (dx / len) * w;
    let zig = `${f(x1 + nx)},${f(y1 + ny)}`;
    for (let i = 1; i <= segs; i += 1) {
      const t = i / segs;
      const sign = i % 2 ? -1 : 1;
      zig += ` ${f(x1 + dx * t + nx * sign)},${f(y1 + dy * t + ny * sign)}`;
    }
    return `
      <g stroke="${color}" stroke-width="0.9" stroke-linecap="round" fill="none">
        <line x1="${f(x1 + nx)}" y1="${f(y1 + ny)}" x2="${f(x2 + nx)}" y2="${f(y2 + ny)}" />
        <line x1="${f(x1 - nx)}" y1="${f(y1 - ny)}" x2="${f(x2 - nx)}" y2="${f(y2 - ny)}" />
        <polyline points="${zig}" stroke-width="0.7" />
      </g>
    `;
  }

  // Generador termoeléctrico SNAP-19: cilindro con aletas
  function rtg(x, y, angleDeg) {
    let fins = '';
    for (let i = -4; i <= 4; i += 2) {
      fins += `<line x1="${i}" y1="-4.6" x2="${i}" y2="4.6" />`;
    }
    return `
      <g transform="translate(${f(x)} ${f(y)}) rotate(${f(angleDeg)})">
        <rect x="-7.5" y="-3.4" width="15" height="6.8" rx="1.2" fill="#94a3b8" stroke="${S.outline}" stroke-width="0.9" />
        <rect x="-7.5" y="-3.4" width="15" height="2.4" fill="#e2e8f0" opacity="0.8" />
        <g stroke="#475569" stroke-width="0.9">${fins}</g>
        <rect x="-8.6" y="-2.2" width="2" height="4.4" rx="0.6" fill="#64748b" />
      </g>
    `;
  }

  function hexPts(cx, cy, rx, ry) {
    const pts = [];
    [-90, -30, 30, 90, 150, 210].forEach((deg) => {
      const a = (deg * Math.PI) / 180;
      pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    });
    return pts;
  }

  const poly = (pts) => pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');

  function pioneer10() {
    // Antena: elipse en perspectiva (eje apuntando hacia la derecha-frente)
    const cx = 96;
    const cy = 56;
    const rx = 22;
    const ry = 42;
    const rot = (-8 * Math.PI) / 180;
    const rimPt = (t, k = 1) => {
      const x = rx * k * Math.cos(t);
      const y = ry * k * Math.sin(t);
      return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
    };

    // Carcasa trasera (grosor del borde)
    const shell = [];
    const rimLine = [];
    const ridge = [];
    for (let i = 0; i < 32; i += 1) {
      const t = (i / 32) * Math.PI * 2;
      const p = rimPt(t);
      shell.push([p[0] - 6, p[1] + 1]);
      rimLine.push(p);
      ridge.push(rimPt(t, 0.5));
    }

    // Cara cóncava en abanico de 16 triángulos: tres tonos según la luz
    let fan = '';
    const N = 16;
    for (let i = 0; i < N; i += 1) {
      const t0 = (i / N) * Math.PI * 2;
      const t1 = ((i + 1) / N) * Math.PI * 2;
      const mid = rimPt((t0 + t1) / 2);
      const vx = mid[0] - cx;
      const vy = mid[1] - cy;
      const len = Math.hypot(vx, vy) || 1;
      const d = (vx / len) * 0.55 + (vy / len) * 0.83;
      const tone = d > 0.35 ? '#ffffff' : d > -0.25 ? '#e2e8f0' : d > -0.7 ? '#cbd5e1' : '#94a3b8';
      const a = rimPt(t0);
      const b = rimPt(t1);
      fan += `<polygon points="${f(cx)},${f(cy)} ${f(a[0])},${f(a[1])} ${f(b[0])},${f(b[1])}" fill="${tone}" stroke="${tone}" stroke-width="0.5" stroke-linejoin="round" />`;
    }

    // Alimentador y trípode
    const F = [128, 52];
    const tp = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6].map((t) => rimPt(t));
    const struts = tp
      .map((p) => `<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${F[0]}" y2="${F[1]}" />`)
      .join('');

    // Placa dorada en el puntal inferior izquierdo
    const pl = tp[2];
    const pt = 0.2;
    const px = pl[0] + (F[0] - pl[0]) * pt;
    const py = pl[1] + (F[1] - pl[1]) * pt;
    const pAng = (Math.atan2(F[1] - pl[1], F[0] - pl[0]) * 180) / Math.PI;

    // Bus hexagonal poco profundo (cara posterior desplazada a la izquierda)
    const front = hexPts(70, 64, 11, 21);
    const back = hexPts(60, 66, 11, 21);
    const sideTones = ['#b45309', '#92400e', '#92400e', '#92400e', '#f59e0b', '#fde68a'];
    let sides = '';
    for (let i = 0; i < 6; i += 1) {
      const j = (i + 1) % 6;
      sides += `<polygon points="${poly([back[i], back[j], front[j], front[i]])}" fill="${sideTones[i]}" stroke="#78350f" stroke-width="0.8" stroke-linejoin="round" />`;
    }

    return `
      <svg viewBox="0 0 176 144" width="136" height="112" aria-hidden="true">
        <!-- Pluma larga del magnetómetro (acortada) -->
        ${truss(58, 58, 14, 32, 2.2, 8)}
        <rect x="6" y="26" width="9" height="8" rx="1.2" fill="#f59e0b" stroke="#78350f" stroke-width="0.9" />

        <!-- Pluma de RTG izquierda: 2 generadores -->
        ${truss(60, 74, 30, 112, 2.4, 6)}
        ${rtg(42.5, 97, 128)}
        ${rtg(33.5, 108.5, 128)}

        <!-- Pluma de RTG derecha (parte oculta tras la antena): 2 generadores -->
        ${truss(76, 80, 112, 126, 2.4, 6)}
        ${rtg(100, 111, 52)}
        ${rtg(108.5, 121.5, 52)}

        <!-- Bus hexagonal con aislamiento térmico dorado -->
        <polygon points="${poly(back)}" fill="#b45309" stroke="#78350f" stroke-width="0.9" stroke-linejoin="round" />
        ${sides}
        <polygon points="${poly(front)}" fill="${S.kapton.mid}" stroke="#78350f" stroke-width="1" stroke-linejoin="round" />
        <polygon points="${poly([front[5], front[0], front[1], [70, 64]])}" fill="${S.kapton.light}" opacity="0.7" />
        <g stroke="#78350f" stroke-width="0.8" opacity="0.7">
          <line x1="62" y1="52" x2="62" y2="76" />
          <line x1="66" y1="48" x2="66" y2="80" />
        </g>

        <!-- Antena parabólica de 2,74 m: carcasa, cara cóncava facetada, borde y nervaduras -->
        <polygon points="${poly(shell)}" fill="#64748b" stroke="${S.outline}" stroke-width="1" stroke-linejoin="round" />
        ${fan}
        <polygon points="${poly(ridge)}" fill="none" stroke="#94a3b8" stroke-width="0.8" opacity="0.55" />
        <polygon points="${poly(rimLine)}" fill="none" stroke="${S.metal.dark}" stroke-width="1.3" stroke-linejoin="round" />

        <!-- Trípode, alimentador y bocina -->
        <g stroke="#64748b" stroke-width="1.8" stroke-linecap="round">${struts}</g>
        <polygon points="${F[0] - 1},${F[1] - 5} ${F[0] - 9},${F[1] - 8} ${F[0] - 9},${F[1] + 8} ${F[0] - 1},${F[1] + 5}" fill="#cbd5e1" stroke="${S.outline}" stroke-width="0.9" stroke-linejoin="round" />
        <rect x="${F[0] - 1}" y="${F[1] - 5}" width="8" height="10" rx="1.5" fill="${S.kapton.mid}" stroke="#78350f" stroke-width="0.9" />
        <line x1="${F[0] + 7}" y1="${F[1]}" x2="${F[0] + 14}" y2="${F[1]}" stroke="#94a3b8" stroke-width="1.4" />
        <circle cx="${F[0] + 14.5}" cy="${F[1]}" r="1.6" fill="#f59e0b" />

        <!-- Placa dorada de Pioneer en el puntal -->
        <g transform="translate(${f(px)} ${f(py)}) rotate(${f(pAng)})">
          <rect x="-3.8" y="-2.6" width="7.6" height="5.2" rx="0.6" fill="#fbbf24" stroke="#78350f" stroke-width="0.8" />
          <line x1="-2.4" y1="-0.8" x2="2.4" y2="-0.8" stroke="#78350f" stroke-width="0.5" />
          <line x1="-2.4" y1="0.9" x2="1" y2="0.9" stroke="#78350f" stroke-width="0.5" />
        </g>
      </svg>
    `;
  }

  M.pioneer10 = pioneer10;
})(typeof window !== 'undefined' ? window : globalThis);
