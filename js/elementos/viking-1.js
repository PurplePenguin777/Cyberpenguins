/**
 * Hardware NASA 3/6 rediseñado con estética Canva (Diapositiva 4): Viking 1 Lander (Marte).
 * Cuerpo hexagonal ancho low-poly en plata/blanco mate, 3 patas metálicas con platos,
 * cubiertas doradas RTG y gran antena parabólica circular blanca orientada hacia arriba.
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

  function viking1() {
    const id = uid('vik');
    return `
      <svg viewBox="0 0 158 138" width="120" height="105" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.58)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <radialGradient id="${id}-dish" cx="40%" cy="38%" r="65%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="70%" stop-color="#e2e8f0" />
            <stop offset="100%" stop-color="#94a3b8" />
          </radialGradient>
        </defs>

        <ellipse cx="79" cy="123" rx="52" ry="12" fill="url(#${id}-shadow)" />

        <!-- 3 Patas metálicas con platos -->
        <g>
          <line x1="50" y1="85" x2="29" y2="118" stroke="#e2e8f0" stroke-width="4.2" stroke-linecap="round" />
          <line x1="58" y1="78" x2="40" y2="112" stroke="#64748b" stroke-width="2" />
          <ellipse cx="29" cy="119" rx="11" ry="4" fill="#f1f5f9" stroke="#64748b" stroke-width="1" />

          <line x1="108" y1="85" x2="129" y2="118" stroke="#94a3b8" stroke-width="4.2" stroke-linecap="round" />
          <line x1="100" y1="78" x2="118" y2="112" stroke="#475569" stroke-width="2" />
          <ellipse cx="129" cy="119" rx="11" ry="4" fill="#cbd5e1" stroke="#475569" stroke-width="1" />

          <line x1="79" y1="90" x2="79" y2="125" stroke="#cbd5e1" stroke-width="4.2" stroke-linecap="round" />
          <ellipse cx="79" cy="126" rx="11" ry="4" fill="#e2e8f0" stroke="#475569" stroke-width="1" />
        </g>

        <!-- Cuerpo hexagonal ancho facetado en blanco/plata (Diapositiva 4) -->
        <polygon points="34,68 79,53 124,68 118,89 79,97 40,89" fill="#cbd5e1" stroke="#475569" stroke-width="1.2" stroke-linejoin="round" />
        <polygon points="34,68 79,53 79,97 40,89" fill="#f8fafc" />
        <polygon points="79,53 124,68 118,89 79,97" fill="#94a3b8" />
        <polygon points="48,70 79,60 110,70 107,87 79,93 51,87" fill="#e2e8f0" stroke="#64748b" stroke-width="0.9" />

        <!-- Bahía técnica frontal oscura y cubiertas RTG -->
        <rect x="65" y="72" width="28" height="16" rx="1.5" fill="#1e293b" stroke="#94a3b8" stroke-width="0.9" />
        <rect x="69" y="75" width="11" height="6" fill="#f8fafc" />
        <rect x="71" y="76.5" width="7" height="1.5" fill="#2563eb" />
        <circle cx="86" cy="79" r="2.2" fill="#38bdf8" />

        <polygon points="33,66 47,63 48,80 35,82" fill="#f59e0b" stroke="#78350f" stroke-width="0.9" />
        <polygon points="111,63 125,66 123,82 110,80" fill="#d97706" stroke="#78350f" stroke-width="0.9" />

        <!-- 2 Cámaras estereoscópicas cilíndricas -->
        <g>
          <rect x="55" y="45" width="6.5" height="18" rx="1.5" fill="#f1f5f9" stroke="#475569" stroke-width="0.9" />
          <rect x="54.5" y="46" width="7.5" height="4" rx="1" fill="#1e293b" />
          <circle cx="58.2" cy="48" r="1.2" fill="#38bdf8" />

          <rect x="96.5" y="45" width="6.5" height="18" rx="1.5" fill="#cbd5e1" stroke="#475569" stroke-width="0.9" />
          <rect x="96" y="46" width="7.5" height="4" rx="1" fill="#1e293b" />
          <circle cx="99.8" cy="48" r="1.2" fill="#38bdf8" />
        </g>

        <!-- Gran antena parabólica circular blanca frontal (Diapositiva 4) -->
        <rect x="76.5" y="42" width="5" height="19" fill="#94a3b8" />
        <circle cx="79" cy="28" r="20.5" fill="url(#${id}-dish)" stroke="#64748b" stroke-width="1.3" />
        <circle cx="79" cy="28" r="15.5" fill="none" stroke="rgba(100,116,139,0.28)" stroke-width="1" />
        <line x1="65" y1="28" x2="79" y2="21" stroke="#475569" stroke-width="1.3" />
        <line x1="93" y1="28" x2="79" y2="21" stroke="#475569" stroke-width="1.3" />
        <line x1="79" y1="42" x2="79" y2="21" stroke="#334155" stroke-width="1.5" />
        <circle cx="79" cy="21" r="2.8" fill="#1e293b" stroke="#f8fafc" stroke-width="0.9" />

        <!-- Brazo meteorológico y colector -->
        <line x1="42" y1="66" x2="23" y2="49" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" />
        <circle cx="22" cy="48" r="2.3" fill="#38bdf8" />
        <path d="M 113,75 L 142,87 L 140,92 L 111,80 Z" fill="#cbd5e1" stroke="#475569" stroke-width="0.9" />
        <path d="M 139,86 L 149,89 L 146,95 L 136,91 Z" fill="#f05432" />
      </svg>
    `;
  }

  M.viking1 = viking1;
})(typeof window !== 'undefined' ? window : globalThis);
