/**
 * Hardware NASA 4/6 (estilo "facetado fiel"): Mars Pathfinder Sojourner Rover (Marte).
 * Referencia: ~65 cm de largo, 48 cm de ancho, ~30 cm de alto; 6 ruedas de 13 cm con tacos,
 * suspensión rocker-bogie, panel solar plano de GaAs cubriendo toda la parte superior,
 * cámaras estéreo y 5 proyectores láser en el FRENTE, espectrómetro APXS en la parte TRASERA
 * y antena UHF trasera.
 * Frente del rover hacia la derecha. Luz arriba-izquierda: cara superior clara,
 * cara lateral media, cara frontal en sombra.
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
    solar: { light: '#3b82f6', mid: '#1d4ed8', dark: '#172554' }
  };

  const f = (v) => Number(v).toFixed(1);

  function wheel(cx, cy, far) {
    const rx = 9;
    const ry = 10.5;
    const tire = far ? '#334155' : '#475569';
    const rim = far ? '#64748b' : '#94a3b8';
    const hub = far ? '#94a3b8' : '#e2e8f0';
    let cleats = '';
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      cleats += `<line x1="${f(cx + c * rx * 0.86)}" y1="${f(cy + s * ry * 0.86)}" x2="${f(cx + c * (rx + 1.6))}" y2="${f(cy + s * (ry + 1.6))}" />`;
    }
    return `
      <g>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${tire}" stroke="${S.outline}" stroke-width="1" />
        <g stroke="#e2e8f0" stroke-width="1.3" stroke-linecap="round">${cleats}</g>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.55}" ry="${ry * 0.55}" fill="${rim}" stroke="${S.outline}" stroke-width="0.8" />
        <circle cx="${cx}" cy="${cy}" r="2.2" fill="${hub}" />
      </g>
    `;
  }

  function sojourner() {
    const id = uid('soj');

    // Panel solar: cuadrícula de celdas sobre la cara superior
    let grid = '';
    for (let i = 1; i < 6; i += 1) {
      const t = i / 6;
      grid += `<line x1="${f(40 + 68 * t)}" y1="60.5" x2="${f(53 + 69 * t)}" y2="54.5" />`;
    }
    for (let j = 1; j < 3; j += 1) {
      const v = j / 3;
      grid += `<line x1="${f(40 + 13 * v)}" y1="${f(60.5 - 6 * v)}" x2="${f(108 + 14 * v)}" y2="${f(60.5 - 6 * v)}" />`;
    }

    // 5 proyectores láser en la cara frontal
    let lasers = '';
    [0.12, 0.32, 0.52, 0.72, 0.92].forEach((t) => {
      lasers += `<circle cx="${f(114 + 16 * t)}" cy="${f(72 - 9 * t)}" r="1.15" fill="#ef4444" />`;
    });

    return `
      <svg viewBox="0 0 152 118" width="54" height="42" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.58)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
        </defs>

        <ellipse cx="76" cy="103" rx="58" ry="11" fill="url(#${id}-shadow)" />

        <!-- Lado lejano: ruedas y brazos en tono oscuro -->
        <g stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <polyline points="128,83 78,65" />
          <polyline points="52,83 78,65 90,83" />
        </g>
        ${wheel(52, 83, true)}
        ${wheel(90, 83, true)}
        ${wheel(128, 83, true)}

        <!-- Antena látigo UHF trasera -->
        <line x1="50" y1="55" x2="43" y2="22" stroke="${S.metal.light}" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="43" cy="21.5" r="2" fill="#f59e0b" stroke="#78350f" stroke-width="0.7" />

        <!-- Cuerpo (Warm Electronics Box): cara superior clara, lateral media, frontal en sombra -->
        <polygon points="34,62 114,62 130,53 50,53" fill="${S.metal.light}" stroke="${S.outline}" stroke-width="1" stroke-linejoin="round" />
        <polygon points="34,62 114,62 114,81 34,81" fill="${S.metal.mid}" stroke="${S.outline}" stroke-width="1" stroke-linejoin="round" />
        <polygon points="114,62 130,53 130,72 114,81" fill="#94a3b8" stroke="${S.outline}" stroke-width="1" stroke-linejoin="round" />
        <polygon points="34,62 114,62 114,66 34,66" fill="${S.metal.light}" opacity="0.7" />
        <g stroke="${S.metal.dark}" stroke-width="0.8" opacity="0.8">
          <line x1="56" y1="66" x2="56" y2="81" />
          <line x1="78" y1="66" x2="78" y2="81" />
          <line x1="98" y1="66" x2="98" y2="81" />
        </g>

        <!-- Panel solar plano de arseniuro de galio sobre toda la cara superior -->
        <polygon points="40,60.5 108,60.5 122,54.5 53,54.5" fill="${S.solar.mid}" stroke="#93c5fd" stroke-width="1" stroke-linejoin="round" />
        <g stroke="#60a5fa" stroke-width="0.7" opacity="0.85">${grid}</g>

        <!-- FRENTE: cámaras estéreo y láseres -->
        <circle cx="118.8" cy="59.3" r="2.3" fill="#0f172a" stroke="${S.metal.light}" stroke-width="0.8" />
        <circle cx="118.8" cy="59.3" r="1" fill="#38bdf8" />
        <circle cx="125.2" cy="55.7" r="2.3" fill="#0f172a" stroke="${S.metal.light}" stroke-width="0.8" />
        <circle cx="125.2" cy="55.7" r="1" fill="#38bdf8" />
        ${lasers}

        <!-- TRASERA: APXS desplegado hacia el suelo detrás del rover -->
        <rect x="24" y="64" width="10" height="10" rx="1.5" fill="#475569" stroke="${S.outline}" stroke-width="0.9" />
        <line x1="27" y1="74" x2="19" y2="90" stroke="${S.metal.light}" stroke-width="2.2" stroke-linecap="round" />
        <polygon points="12,90 25,90 26,99 11,99" fill="#d97706" stroke="#78350f" stroke-width="0.9" stroke-linejoin="round" />
        <ellipse cx="18.5" cy="99" rx="6.5" ry="1.8" fill="${S.metal.light}" stroke="${S.outline}" stroke-width="0.7" />

        <!-- Suspensión rocker-bogie del lado cercano -->
        <g stroke="${S.metal.light}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <polyline points="112,92 62,74" />
          <polyline points="36,92 62,74 74,92" />
        </g>
        <circle cx="62" cy="74" r="2.8" fill="${S.metal.dark}" stroke="${S.metal.light}" stroke-width="1" />

        <!-- 3 ruedas cercanas con tacos metálicos -->
        ${wheel(36, 92, false)}
        ${wheel(74, 92, false)}
        ${wheel(112, 92, false)}
      </svg>
    `;
  }

  M.sojourner = sojourner;
})(typeof window !== 'undefined' ? window : globalThis);
