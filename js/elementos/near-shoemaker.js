/**
 * Hardware NASA 6/6 rediseñado con estética Canva (Diapositiva 4): NEAR Shoemaker (433 Eros).
 * Bus prismático octogonal blanco/plata facetado con módulo frontal dorado y lente oscuro,
 * antena superior y 2 grandes alas rectangulares azules de paneles solares con rejilla.
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

  function nearShoemaker() {
    const id = uid('near');
    return `
      <svg viewBox="0 0 176 146" width="136" height="114" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.62)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-solar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#3b82f6" />
            <stop offset="60%" stop-color="#1d4ed8" />
            <stop offset="100%" stop-color="#172554" />
          </linearGradient>
          <linearGradient id="${id}-kapton" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="48%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>
        </defs>

        <!-- Sombra suave de contacto sobre el regolito de 433 Eros (sin base duplicada de asteroide) -->
        <ellipse cx="88" cy="122" rx="52" ry="12" fill="url(#${id}-shadow)" />

        <!-- 2 Paneles solares traseros superiores (cruz en X de arseniuro de galio) -->
        <g>
          <polygon points="68,60 18,42 25,26 72,46" fill="url(#${id}-solar)" stroke="#93c5fd" stroke-width="1.2" stroke-linejoin="round" />
          <line x1="34" y1="30" x2="31" y2="47" stroke="#93c5fd" stroke-width="0.85" />
          <line x1="50" y1="37" x2="46" y2="52" stroke="#93c5fd" stroke-width="0.85" />
          <line x1="21" y1="34" x2="70" y2="53" stroke="#60a5fa" stroke-width="0.85" />

          <polygon points="108,60 158,42 151,26 104,46" fill="url(#${id}-solar)" stroke="#93c5fd" stroke-width="1.2" stroke-linejoin="round" />
          <line x1="142" y1="30" x2="145" y2="47" stroke="#93c5fd" stroke-width="0.85" />
          <line x1="126" y1="37" x2="130" y2="52" stroke="#93c5fd" stroke-width="0.85" />
          <line x1="155" y1="34" x2="106" y2="53" stroke="#60a5fa" stroke-width="0.85" />
        </g>

        <!-- Instrumentos científicos inferiores orientados hacia la superficie de Eros (MSI y espectrómetro XGRS) -->
        <g>
          <polygon points="73,96 81,96 83,108 71,108" fill="#334155" stroke="#94a3b8" stroke-width="0.9" />
          <circle cx="77" cy="107" r="2.6" fill="#0f172a" stroke="#38bdf8" stroke-width="0.8" />
          <polygon points="91,96 103,96 104,106 90,106" fill="#e2e8f0" stroke="#475569" stroke-width="0.9" />
          <rect x="93" y="99" width="8" height="4" rx="1" fill="#1e293b" />
        </g>

        <!-- Cuerpo prismático octogonal con aislamiento térmico dorado Kapton y costillas metálicas -->
        <polygon points="68,55 88,48 108,55 106,94 88,101 70,94" fill="url(#${id}-kapton)" stroke="#78350f" stroke-width="1.2" stroke-linejoin="round" />
        <polygon points="68,55 88,48 88,101 70,94" fill="#fde047" opacity="0.52" />
        <polygon points="88,48 108,55 106,94 88,101" fill="#92400e" opacity="0.52" />
        <!-- Bastidor estructural superior en aluminio y abertura frontal de sensores -->
        <polygon points="68,55 88,48 108,55 101,59 88,54 75,59" fill="#e2e8f0" stroke="#475569" stroke-width="0.9" />
        <polygon points="77,64 88,60 99,64 98,87 88,91 78,87" fill="#f8fafc" stroke="#64748b" stroke-width="0.9" />
        <circle cx="88" cy="75" r="5" fill="#1e293b" stroke="#94a3b8" stroke-width="1.1" />
        <circle cx="88" cy="75" r="2.2" fill="#38bdf8" />

        <!-- Antena parabólica fija superior de 1.5 m y magnetómetro -->
        <rect x="86" y="40" width="4" height="10" fill="#cbd5e1" />
        <ellipse cx="88" cy="39" rx="22" ry="8.5" fill="#ffffff" stroke="#64748b" stroke-width="1.3" />
        <line x1="77" y1="39" x2="88" y2="24" stroke="#475569" stroke-width="1.4" />
        <line x1="99" y1="39" x2="88" y2="24" stroke="#475569" stroke-width="1.4" />
        <circle cx="88" cy="23" r="2.2" fill="#f59e0b" />

        <!-- 2 Grandes alas delanteras inferiores de paneles solares azules (completan los 4 paneles en cruz) -->
        <g>
          <polygon points="68,78 20,103 13,85 63,62" fill="url(#${id}-solar)" stroke="#bae6fd" stroke-width="1.2" stroke-linejoin="round" />
          <line x1="30" y1="77" x2="36" y2="94" stroke="#93c5fd" stroke-width="0.85" />
          <line x1="46" y1="70" x2="52" y2="86" stroke="#93c5fd" stroke-width="0.85" />
          <line x1="16" y1="94" x2="66" y2="70" stroke="#60a5fa" stroke-width="0.85" />

          <polygon points="108,78 156,103 163,85 113,62" fill="url(#${id}-solar)" stroke="#bae6fd" stroke-width="1.2" stroke-linejoin="round" />
          <line x1="146" y1="77" x2="140" y2="94" stroke="#93c5fd" stroke-width="0.85" />
          <line x1="130" y1="70" x2="124" y2="86" stroke="#93c5fd" stroke-width="0.85" />
          <line x1="160" y1="94" x2="110" y2="70" stroke="#60a5fa" stroke-width="0.85" />
        </g>
      </svg>
    `;
  }

  M.nearShoemaker = nearShoemaker;
})(typeof window !== 'undefined' ? window : globalThis);
