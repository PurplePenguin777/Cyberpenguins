/**
 * Hardware NASA 2/6 (estética low-poly): Apollo 11 Eagle (La Luna).
 * Etapa de descenso octogonal dorado-ámbar Kapton facetado con 4 patas y escalera,
 * coronada por una etapa de ascenso geométrica facetada en blanco/plata con ventanas hundidas.
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

  function apolloEagle() {
    const id = uid('eagle');
    return `
      <svg viewBox="0 0 164 148" width="210" height="190" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.62)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-kapton" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="45%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>
        </defs>

        <ellipse cx="82" cy="133" rx="58" ry="13" fill="url(#${id}-shadow)" />

        <!-- Tobera del motor de descenso -->
        <polygon points="73,96 91,96 96,113 68,113" fill="#334155" stroke="#0f172a" stroke-width="1" />

        <!-- 4 Patas de aterrizaje desplegadas con platos circulares y sondas de contacto lunar -->
        <g>
          <line x1="82" y1="88" x2="82" y2="112" stroke="#64748b" stroke-width="3" />
          <line x1="54" y1="86" x2="29" y2="124" stroke="#e2e8f0" stroke-width="3.8" stroke-linecap="round" />
          <line x1="48" y1="77" x2="36" y2="110" stroke="#94a3b8" stroke-width="2" />
          <line x1="25" y1="128" x2="25" y2="138" stroke="#cbd5e1" stroke-width="1.2" />
          <ellipse cx="28" cy="126" rx="11.5" ry="4.4" fill="#fbbf24" stroke="#92400e" stroke-width="1" />

          <line x1="110" y1="86" x2="135" y2="124" stroke="#94a3b8" stroke-width="3.8" stroke-linecap="round" />
          <line x1="116" y1="77" x2="128" y2="110" stroke="#64748b" stroke-width="2" />
          <line x1="139" y1="128" x2="139" y2="138" stroke="#94a3b8" stroke-width="1.2" />
          <ellipse cx="136" cy="126" rx="11.5" ry="4.4" fill="#d97706" stroke="#78350f" stroke-width="1" />

          <line x1="82" y1="92" x2="82" y2="134" stroke="#cbd5e1" stroke-width="4.2" stroke-linecap="round" />
          <ellipse cx="82" cy="135" rx="12.5" ry="4.6" fill="#fbbf24" stroke="#92400e" stroke-width="1" />
        </g>

        <!-- Etapa de Descenso octogonal con facetas Kapton doradas -->
        <polygon points="46,74 82,65 118,74 121,96 82,104 43,96" fill="url(#${id}-kapton)" stroke="#78350f" stroke-width="1.1" stroke-linejoin="round" />
        <polygon points="46,74 64,70 64,100 43,96" fill="#fef08a" opacity="0.65" />
        <polygon points="82,65 118,74 121,96 82,104" fill="#b45309" opacity="0.72" />
        <polygon points="64,70 82,65 82,104 64,100" fill="#f59e0b" />
        <!-- Recortes térmicos negros geométricos -->
        <polygon points="53,77 61,75 61,94 52,95" fill="#1e293b" />
        <polygon points="96,76 108,78 107,95 96,97" fill="#1e293b" />

        <!-- Porche, escalera frontal y placa conmemorativa del Apollo 11 -->
        <rect x="75" y="70" width="14" height="5" rx="1" fill="#e2e8f0" stroke="#475569" stroke-width="0.9" />
        <g stroke="#f8fafc" stroke-width="1.4">
          <line x1="78" y1="75" x2="78" y2="127" />
          <line x1="86" y1="75" x2="86" y2="127" />
          <line x1="78" y1="83" x2="86" y2="83" />
          <line x1="78" y1="91" x2="86" y2="91" />
          <line x1="78" y1="99" x2="86" y2="99" />
          <line x1="78" y1="107" x2="86" y2="107" />
          <line x1="78" y1="115" x2="86" y2="115" />
          <line x1="78" y1="123" x2="86" y2="123" />
        </g>
        <rect x="79.2" y="100.5" width="5.6" height="4.5" rx="0.6" fill="#cbd5e1" stroke="#475569" stroke-width="0.6" />

        <!-- Etapa de Ascenso facetada low-poly en blanco / plata -->
        <polygon points="50,42 63,29 101,29 114,42 112,66 96,71 68,71 52,66" fill="#cbd5e1" stroke="#475569" stroke-width="1.2" stroke-linejoin="round" />
        <!-- Facetas poligonales marcadas -->
        <polygon points="50,42 63,29 82,29 66,40 66,68 52,66" fill="#f8fafc" />
        <polygon points="98,29 101,29 114,42 112,66 98,70 98,40" fill="#64748b" />
        <polygon points="66,37 98,37 98,70 66,70" fill="#e2e8f0" stroke="#64748b" stroke-width="1" />
        <polygon points="63,29 101,29 98,37 66,37" fill="#ffffff" />

        <!-- 2 Ventanas triangulares inclinadas hacia afuera/abajo (configuración real Grumman LM) y escotilla frontal -->
        <polygon points="68,47 79,40 77,50 68,49" fill="#0f172a" stroke="#334155" stroke-width="0.9" stroke-linejoin="round" />
        <polygon points="96,47 85,40 87,50 96,49" fill="#0f172a" stroke="#334155" stroke-width="0.9" stroke-linejoin="round" />
        <rect x="76" y="54" width="12" height="12" rx="1" fill="#475569" stroke="#1e293b" stroke-width="0.9" />

        <!-- 4 Bloques cuádruples de propulsores RCS (superiores + inferiores laterales) -->
        <g fill="#334155" stroke="#94a3b8" stroke-width="0.7">
          <!-- Par superior -->
          <rect x="47" y="34" width="6.5" height="8" rx="1" />
          <line x1="47" y1="36" x2="43.5" y2="36" stroke="#cbd5e1" stroke-width="1" />
          <line x1="50.2" y1="34" x2="50.2" y2="30.5" stroke="#cbd5e1" stroke-width="1" />
          <rect x="110.5" y="34" width="6.5" height="8" rx="1" />
          <line x1="117" y1="36" x2="120.5" y2="36" stroke="#cbd5e1" stroke-width="1" />
          <line x1="113.8" y1="34" x2="113.8" y2="30.5" stroke="#cbd5e1" stroke-width="1" />
          <!-- Par inferior lateral -->
          <rect x="44" y="48" width="7" height="10" rx="1" />
          <line x1="44" y1="53" x2="40" y2="53" stroke="#cbd5e1" stroke-width="1.1" />
          <line x1="47.5" y1="58" x2="47.5" y2="61.5" stroke="#cbd5e1" stroke-width="1" />
          <rect x="113" y="48" width="7" height="10" rx="1" />
          <line x1="120" y1="53" x2="124" y2="53" stroke="#cbd5e1" stroke-width="1.1" />
          <line x1="116.5" y1="58" x2="116.5" y2="61.5" stroke="#cbd5e1" stroke-width="1" />
        </g>

        <!-- Antena parabólica superior blanca y antenas VHF -->
        <line x1="82" y1="29" x2="82" y2="17" stroke="#cbd5e1" stroke-width="2" />
        <ellipse cx="82" cy="15" rx="12" ry="5" fill="#ffffff" stroke="#64748b" stroke-width="1.1" />
        <line x1="82" y1="15" x2="82" y2="9" stroke="#475569" stroke-width="1.3" />
        <circle cx="82" cy="8.5" r="1.5" fill="#f59e0b" />
        <line x1="66" y1="30" x2="62" y2="19" stroke="#94a3b8" stroke-width="1.4" />
        <ellipse cx="61" cy="18" rx="5" ry="2.6" fill="#e2e8f0" stroke="#475569" stroke-width="0.8" />
        <line x1="100" y1="30" x2="106" y2="16" stroke="#cbd5e1" stroke-width="1" />
      </svg>
    `;
  }

  M.apolloEagle = apolloEagle;
})(typeof window !== 'undefined' ? window : globalThis);
