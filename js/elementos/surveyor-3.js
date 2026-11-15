/**
 * Hardware NASA 1/6 (precisión científica + low-poly): Surveyor 1/3 (La Luna).
 * Bastidor trípode de aluminio con 3 platos articulados, mástil central coronado por el panel solar azul
 * inclinado junto a la antena plana de alta ganancia, cámara de TV vertical blanca con capucha de espejo
 * en el bastidor y brazo excavador en pantógrafo (Soil Mechanics Surface Sampler).
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

  function surveyor3() {
    const id = uid('surv');
    return `
      <svg viewBox="0 0 150 138" width="132" height="122" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.58)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2563eb" />
            <stop offset="100%" stop-color="#172554" />
          </linearGradient>
        </defs>

        <ellipse cx="75" cy="124" rx="48" ry="12" fill="url(#${id}-shadow)" />

        <!-- Huellas / depresiones lunares bajo los 3 platos -->
        <ellipse cx="30" cy="120" rx="12" ry="4.5" fill="rgba(45,54,82,0.55)" />
        <ellipse cx="118" cy="120" rx="12" ry="4.5" fill="rgba(45,54,82,0.55)" />
        <ellipse cx="74" cy="126" rx="12" ry="4.5" fill="rgba(45,54,82,0.55)" />

        <!-- 3 Patas trípode metálicas con amortiguadores y platos circulares -->
        <g stroke-linecap="round">
          <line x1="60" y1="84" x2="30" y2="117" stroke="#f1f5f9" stroke-width="4.2" />
          <line x1="65" y1="74" x2="41" y2="106" stroke="#64748b" stroke-width="2" />
          <line x1="90" y1="84" x2="118" y2="117" stroke="#94a3b8" stroke-width="4.2" />
          <line x1="85" y1="74" x2="107" y2="106" stroke="#475569" stroke-width="2" />
          <line x1="74" y1="88" x2="74" y2="123" stroke="#cbd5e1" stroke-width="4.2" />

          <ellipse cx="30" cy="118" rx="10" ry="3.8" fill="#e2e8f0" stroke="#64748b" stroke-width="1" />
          <ellipse cx="118" cy="118" rx="10" ry="3.8" fill="#94a3b8" stroke="#475569" stroke-width="1" />
          <ellipse cx="74" cy="124" rx="10.5" ry="4" fill="#cbd5e1" stroke="#475569" stroke-width="1" />
        </g>

        <!-- Estructura espacial abierta y compartimentos térmicos de Surveyor -->
        <polygon points="48,74 75,65 102,74 98,94 75,101 52,94" fill="#cbd5e1" stroke="#475569" stroke-width="1.1" stroke-linejoin="round" />
        <polygon points="48,74 75,65 75,101 52,94" fill="#f8fafc" />
        <polygon points="75,65 102,74 98,94 75,101" fill="#94a3b8" opacity="0.85" />
        <!-- Compartimento A/B blanco y dorado con sensor térmico -->
        <rect x="53" y="75" width="16" height="16" rx="1.5" fill="#e2e8f0" stroke="#64748b" stroke-width="0.9" />
        <rect x="55" y="77" width="12" height="6" fill="#f59e0b" />
        <rect x="81" y="76" width="15" height="15" rx="1.5" fill="#475569" stroke="#cbd5e1" stroke-width="0.8" />
        <circle cx="88.5" cy="83.5" r="2.2" fill="#38bdf8" />

        <!-- Cámara de TV vertical blanca con capucha de espejo inclinado en el bastidor (debajo de la cima) -->
        <g>
          <rect x="69" y="55" width="11" height="26" rx="1.2" fill="#f8fafc" stroke="#475569" stroke-width="1" />
          <polygon points="69,55 80,55 83,49 71,49" fill="#e2e8f0" stroke="#475569" stroke-width="1" stroke-linejoin="round" />
          <polygon points="71,52 79,52 80.5,55 69.5,55" fill="#0f172a" />
          <circle cx="74.5" cy="59" r="2.2" fill="#1e293b" stroke="#38bdf8" stroke-width="0.8" />
        </g>

        <!-- Brazo excavador en pantógrafo / acordeón (Soil Mechanics Surface Sampler) -->
        <g>
          <g fill="none" stroke="#e2e8f0" stroke-width="1.7" stroke-linejoin="round">
            <polyline points="98,81 105,74 111,83 118,75 125,83" />
            <polyline points="98,86 105,79 111,74 118,83 125,77" stroke="#94a3b8" stroke-width="1.4" />
          </g>
          <polygon points="124,75 135,79 133,86 123,83" fill="#f59e0b" stroke="#92400e" stroke-width="0.9" />
        </g>

        <!-- Mástil vertical central hasta la cima -->
        <rect x="72.5" y="21" width="4.5" height="32" fill="#cbd5e1" stroke="#475569" stroke-width="0.9" />

        <!-- Panel solar azul inclinado en la cima del mástil -->
        <polygon points="36,24 68,14 82,25 50,35" fill="url(#${id}-panel)" stroke="#93c5fd" stroke-width="1.2" stroke-linejoin="round" />
        <g stroke="#60a5fa" stroke-width="0.8" opacity="0.9">
          <line x1="44" y1="21.5" x2="58" y2="32.5" />
          <line x1="52" y1="19" x2="66" y2="30" />
          <line x1="60" y1="16.5" x2="74" y2="27.5" />
          <line x1="43" y1="29.5" x2="75" y2="19.5" />
        </g>

        <!-- Antena plana de alta ganancia (planar array) en la cima junto al panel solar -->
        <g>
          <polygon points="79,16 111,11 114,27 82,32" fill="#f8fafc" stroke="#475569" stroke-width="1.1" stroke-linejoin="round" />
          <polygon points="83,18.5 108,14.5 110.5,25 85.5,29" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.8" />
          <line x1="89" y1="17.5" x2="91.5" y2="28" stroke="#94a3b8" stroke-width="0.7" />
          <line x1="96" y1="16.4" x2="98.5" y2="27" stroke="#94a3b8" stroke-width="0.7" />
          <line x1="103" y1="15.3" x2="105.5" y2="26" stroke="#94a3b8" stroke-width="0.7" />
        </g>
      </svg>
    `;
  }

  M.surveyor3 = surveyor3;
  M.surveyor1 = surveyor3; // Alias para compatibilidad con la misión Surveyor 1
})(typeof window !== 'undefined' ? window : globalThis);
