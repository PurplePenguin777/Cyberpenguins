/**
 * Hardware NASA 4/6 (precisión científica + low-poly): Mars Pathfinder Sojourner Rover (Marte).
 * 6 ruedas de aluminio con tacos metálicos y suspensión rocker-bogie, Warm Electronics Box (WEB)
 * aislada con Kapton dorado, panel solar plano GaAs en el techo (sin mástil alto),
 * cámaras estéreo y láseres integrados en el frente del chasis, APXS desplegado y antena UHF trasera.
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

  function wheelSvg(cx, cy, isFront = true) {
    const tireFill = isFront ? '#475569' : '#334155';
    const rimFill = isFront ? '#94a3b8' : '#64748b';
    const hubFill = isFront ? '#cbd5e1' : '#94a3b8';
    const stroke = isFront ? '#cbd5e1' : '#64748b';
    return `
      <g>
        <ellipse cx="${cx}" cy="${cy}" rx="9.5" ry="10.5" fill="${tireFill}" stroke="${stroke}" stroke-width="1.3" />
        <!-- Tacos metálicos (cleats) para tracción sobre regolito marciano -->
        <g stroke="#e2e8f0" stroke-width="1.4" stroke-linecap="round">
          <line x1="${cx}" y1="${cy - 11.2}" x2="${cx}" y2="${cy - 8.4}" />
          <line x1="${cx}" y1="${cy + 8.4}" x2="${cx}" y2="${cy + 11.2}" />
          <line x1="${cx - 10.2}" y1="${cy}" x2="${cx - 7.6}" y2="${cy}" />
          <line x1="${cx + 7.6}" y1="${cy}" x2="${cx + 10.2}" y2="${cy}" />
          <line x1="${cx - 7.2}" y1="${cy - 7.6}" x2="${cx - 5.2}" y2="${cy - 5.6}" />
          <line x1="${cx + 5.2}" y1="${cy - 5.6}" x2="${cx + 7.2}" y2="${cy - 7.6}" />
          <line x1="${cx - 7.2}" y1="${cy + 7.6}" x2="${cx - 5.2}" y2="${cy + 5.6}" />
          <line x1="${cx + 5.2}" y1="${cy + 5.6}" x2="${cx + 7.2}" y2="${cy + 7.6}" />
        </g>
        <ellipse cx="${cx}" cy="${cy}" rx="5" ry="5.5" fill="${rimFill}" stroke="#334155" stroke-width="0.9" />
        <circle cx="${cx}" cy="${cy}" r="2.1" fill="${hubFill}" />
      </g>
    `;
  }

  function sojourner() {
    const id = uid('soj');
    return `
      <svg viewBox="0 0 152 118" width="118" height="92" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.58)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-kapton" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fbbf24" />
            <stop offset="52%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#d97706" />
          </linearGradient>
          <linearGradient id="${id}-solar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2563eb" />
            <stop offset="65%" stop-color="#1e3a8a" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>

        <ellipse cx="76" cy="103" rx="52" ry="12" fill="url(#${id}-shadow)" />

        <!-- 3 Ruedas del lado lejano -->
        <g>
          ${wheelSvg(44, 83, false)}
          ${wheelSvg(74, 86, false)}
          ${wheelSvg(106, 82, false)}
        </g>

        <!-- Antena látigo UHF trasera (sin mástil de cámaras) -->
        <line x1="39" y1="53" x2="35" y2="23" stroke="#e2e8f0" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="35" cy="22" r="2.2" fill="#f59e0b" stroke="#78350f" stroke-width="0.7" />

        <!-- Chasis Warm Electronics Box (WEB) con Kapton dorado y bastidor de aluminio -->
        <polygon points="35,54 94,48 117,59 115,78 80,84 33,76" fill="#cbd5e1" stroke="#475569" stroke-width="1.2" stroke-linejoin="round" />
        <!-- Cara lateral revestida de Kapton dorado dentro de marco de aluminio -->
        <polygon points="34,56 82,61 80,83 33,76" fill="#e2e8f0" />
        <polygon points="38,59 77,63 76,79 37,73" fill="url(#${id}-kapton)" stroke="#92400e" stroke-width="0.9" />
        <line x1="51" y1="60" x2="50" y2="75" stroke="#fde68a" stroke-width="0.7" opacity="0.75" />
        <line x1="64" y1="62" x2="63" y2="77" stroke="#b45309" stroke-width="0.7" opacity="0.75" />

        <!-- Cara frontal del chasis con cámaras estéreo y proyectores láser integrados (sin mástil superior) -->
        <polygon points="82,61 117,59 115,78 80,83" fill="#94a3b8" />
        <rect x="85" y="62" width="27" height="12" rx="1.5" fill="#e2e8f0" stroke="#475569" stroke-width="0.8" />
        <!-- Cámara estéreo izquierda + derecha -->
        <circle cx="91" cy="67.5" r="2.6" fill="#0f172a" stroke="#475569" stroke-width="0.8" />
        <circle cx="91" cy="67.5" r="1.2" fill="#38bdf8" />
        <circle cx="105.5" cy="66.5" r="2.6" fill="#0f172a" stroke="#475569" stroke-width="0.8" />
        <circle cx="105.5" cy="66.5" r="1.2" fill="#38bdf8" />
        <!-- Proyector central de franjas láser -->
        <rect x="96.5" y="66" width="4" height="2.4" rx="0.6" fill="#ef4444" />

        <!-- Espectrómetro de Rayos X y Partículas Alfa (APXS) desplegado al frente -->
        <g>
          <line x1="112" y1="73" x2="132" y2="81" stroke="#cbd5e1" stroke-width="2.4" stroke-linecap="round" />
          <polygon points="129,77 137,80 135,88 127,85" fill="#d97706" stroke="#78350f" stroke-width="0.9" />
          <circle cx="135" cy="85" r="2.2" fill="#e2e8f0" stroke="#475569" stroke-width="0.8" />
        </g>

        <!-- Techo plano con panel solar de arseniuro de galio (GaAs) ajustado sobre la WEB -->
        <polygon points="34,52 79,41 114,50 69,61" fill="url(#${id}-solar)" stroke="#93c5fd" stroke-width="1.3" stroke-linejoin="round" />
        <g stroke="#60a5fa" stroke-width="0.8" opacity="0.85">
          <line x1="45" y1="49" x2="80" y2="58" />
          <line x1="56" y1="46.5" x2="91" y2="55.5" />
          <line x1="67" y1="44" x2="102" y2="53" />
          <line x1="51" y1="56.5" x2="96" y2="45.5" />
        </g>

        <!-- Suspensión articulada rocker-bogie -->
        <g stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <polyline points="47,91 64,74 82,82" />
          <polyline points="64,74 92,71 113,86" />
        </g>

        <!-- 3 Ruedas delanteras de aluminio con tacos metálicos -->
        <g>
          ${wheelSvg(47, 91, true)}
          ${wheelSvg(82, 95, true)}
          ${wheelSvg(113, 87, true)}
        </g>
      </svg>
    `;
  }

  M.sojourner = sojourner;
})(typeof window !== 'undefined' ? window : globalThis);
