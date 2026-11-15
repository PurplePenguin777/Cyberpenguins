/**
 * Hardware NASA 5/6 (estética low-poly): Pioneer 10 (Espacio Profundo).
 * Compartimento hexagonal dorado-ámbar detrás de una gran antena parabólica circular blanca
 * con trípode alimentador frontal y brazos largos metálicos de magnetómetro y RTG.
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

  function pioneer10() {
    const id = uid('pio');
    return `
      <svg viewBox="0 0 176 144" width="136" height="112" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-dish" cx="42%" cy="38%" r="65%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="65%" stop-color="#e2e8f0" />
            <stop offset="100%" stop-color="#94a3b8" />
          </radialGradient>
          <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="45%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>
        </defs>

        <!-- Brazo largo del magnetómetro de helio vectorial hacia la izquierda (en vacío, 0 g) -->
        <g stroke="#cbd5e1" stroke-width="1.6" stroke-linecap="round">
          <line x1="68" y1="62" x2="16" y2="48" />
          <line x1="66" y1="66" x2="16" y2="51" stroke="#64748b" stroke-width="1.1" />
        </g>
        <rect x="9" y="45" width="9" height="8" rx="1.5" fill="#f59e0b" stroke="#78350f" stroke-width="0.9" />

        <!-- Brazos de generadores RTG SNAP-19 extendidos -->
        <g>
          <line x1="74" y1="76" x2="48" y2="118" stroke="#cbd5e1" stroke-width="2.6" stroke-linecap="round" />
          <rect x="40" y="113" width="13" height="8" rx="1.5" transform="rotate(-55 46 117)" fill="#1e293b" stroke="#94a3b8" stroke-width="1" />
          <line x1="94" y1="74" x2="132" y2="112" stroke="#94a3b8" stroke-width="2.6" stroke-linecap="round" />
          <rect x="126" y="108" width="13" height="8" rx="1.5" transform="rotate(42 132 112)" fill="#1e293b" stroke="#64748b" stroke-width="1" />
        </g>

        <!-- Cuerpo hexagonal dorado-ámbar con aislamiento Kapton detrás de la antena -->
        <polygon points="56,48 79,40 96,53 91,79 68,85 52,70" fill="url(#${id}-gold)" stroke="#78350f" stroke-width="1.2" stroke-linejoin="round" />
        <polygon points="56,48 79,40 74,64 52,70" fill="#fef08a" opacity="0.5" />
        <polygon points="59,60 72,56 71,71 58,74" fill="#fbbf24" stroke="#78350f" stroke-width="0.9" />

        <!-- Gran antena parabólica blanca de 2.74 m orientada hacia el frente-derecha -->
        <g transform="rotate(14 96 52)">
          <ellipse cx="96" cy="52" rx="34" ry="40" fill="url(#${id}-dish)" stroke="#64748b" stroke-width="1.5" />
          <ellipse cx="98" cy="52" rx="28" ry="33" fill="none" stroke="rgba(100,116,139,0.28)" stroke-width="1" />
          <!-- Trípode de alimentación -->
          <line x1="76" y1="30" x2="118" y2="48" stroke="#64748b" stroke-width="2.1" />
          <line x1="76" y1="74" x2="118" y2="48" stroke="#475569" stroke-width="2.1" />
          <line x1="95" y1="22" x2="118" y2="48" stroke="#94a3b8" stroke-width="2.1" />
          <rect x="113" y="43" width="9" height="10" rx="2" fill="#f59e0b" stroke="#78350f" stroke-width="1" />
        </g>

        <!-- Placa dorada de Pioneer montada en los puntales del bus / antena -->
        <g transform="rotate(-10 64 78)">
          <rect x="59" y="73" width="11" height="8" rx="0.8" fill="#fbbf24" stroke="#78350f" stroke-width="0.9" />
          <line x1="61" y1="75.5" x2="68" y2="75.5" stroke="#78350f" stroke-width="0.7" />
          <circle cx="64.5" cy="78.5" r="1.2" fill="#f59e0b" stroke="#78350f" stroke-width="0.6" />
        </g>
      </svg>
    `;
  }

  M.pioneer10 = pioneer10;
})(typeof window !== 'undefined' ? window : globalThis);
