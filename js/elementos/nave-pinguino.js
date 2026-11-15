/**
 * Vehículo espacial interplanetario de aterrizaje vertical (estética low-poly):
 * Fuselaje cilíndrico-ojival facetado en acero térmico con escudo cerámico lateral,
 * galería panorámica de cabina multipanel, 4 aletas aerodinámicas (2 canards delanteros
 * y 2 flaps traseros), tren de aterrizaje telescópico de 4 apoyos, racimo de 3 toberas
 * acampanadas con pluma supersónica de metano-oxígeno y esclusa EVA presurizada.
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

  function spaceship({ hatchOpen = true, launching = false, penguinInHatch = false, inSpaceFlight = false } = {}) {
    const id = uid('ship');
    return `
      <svg viewBox="0 0 216 196" width="166" height="150" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.68)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-hull" x1="0" y1="0" x2="1" y2="0.18">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="38%" stop-color="#e8eff9" />
            <stop offset="72%" stop-color="#cbd5e1" />
            <stop offset="100%" stop-color="#8b9ab2" />
          </linearGradient>
          <linearGradient id="${id}-shield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#334155" />
            <stop offset="55%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
          <linearGradient id="${id}-glass" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stop-color="#bae6fd" />
            <stop offset="48%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
          <linearGradient id="${id}-plume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98" />
            <stop offset="28%" stop-color="#bae6fd" stop-opacity="0.92" />
            <stop offset="62%" stop-color="#38bdf8" stop-opacity="0.72" />
            <stop offset="86%" stop-color="#6366f1" stop-opacity="0.34" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="${id}-plume-core" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="45%" stop-color="#e0f2fe" />
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="${id}-ramp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.92" />
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.55" />
          </linearGradient>
        </defs>

        <!-- Sombra sobre superficie planetaria (oculta en vuelo espacial) -->
        ${inSpaceFlight ? '' : `<ellipse cx="108" cy="171" rx="78" ry="13" fill="url(#${id}-shadow)" />`}

        <!-- Pluma supersónica de metano-oxígeno con diamantes de Mach -->
        <g class="thruster-glow" style="transform-origin: 108px 150px;${launching ? ' opacity: 1;' : ''}">
          <polygon points="82,149 108,195 134,149" fill="url(#${id}-plume)" />
          <polygon points="88,150 94,176 102,150" fill="url(#${id}-plume-core)" opacity="0.72" />
          <polygon points="114,150 122,176 128,150" fill="url(#${id}-plume-core)" opacity="0.72" />
          <polygon points="97,150 108,188 119,150" fill="url(#${id}-plume-core)" />
          <!-- Diamantes de choque Mach low-poly -->
          <polygon points="108,154 114,161 108,167 102,161" fill="#ffffff" opacity="0.96" />
          <polygon points="108,167 112.5,173 108,178 103.5,173" fill="#bae6fd" opacity="0.88" />
          <polygon points="108,178 111,183 108,187 105,183" fill="#7dd3fc" opacity="0.72" />
        </g>

        <!-- 2 Aletas aerodinámicas delanteras (canards superiores en sección ojival) -->
        <g stroke="#0f172a" stroke-width="1" stroke-linejoin="round">
          <polygon points="82,25 57,40 53,53 76,54" fill="url(#${id}-shield)" />
          <polygon points="82,25 66,43 53,53 57,40" fill="#475569" opacity="0.68" />
          <polygon points="75,35 79,34 78,54 73,54" fill="#94a3b8" />

          <polygon points="134,25 159,40 163,53 140,54" fill="url(#${id}-shield)" />
          <polygon points="134,25 150,43 163,53 159,40" fill="#0f172a" opacity="0.52" />
          <polygon points="141,35 137,34 138,54 143,54" fill="#64748b" />
        </g>

        <!-- 2 Aletas aerodinámicas traseras (flaps inferiores junto a la falda de motores) -->
        <g stroke="#0f172a" stroke-width="1.1" stroke-linejoin="round">
          <polygon points="74,94 45,115 41,143 74,142" fill="url(#${id}-shield)" />
          <polygon points="74,94 56,121 41,143 45,115" fill="#475569" opacity="0.62" />
          <polygon points="69,104 75,101 75,139 69,138" fill="#cbd5e1" />

          <polygon points="142,94 171,115 175,143 142,142" fill="url(#${id}-shield)" />
          <polygon points="142,94 160,121 175,143 171,115" fill="#0f172a" opacity="0.55" />
          <polygon points="147,104 141,101 141,139 147,138" fill="#64748b" />
        </g>

        <!-- Tren de aterrizaje telescópico de 4 apoyos (retraído en vuelo espacial) -->
        ${inSpaceFlight ? '' : `
          <g stroke="#1e293b" stroke-width="1" stroke-linejoin="round">
            <!-- Pata principal izquierda + puntal hidráulico -->
            <polygon points="71,132 42,165 48,166 76,136" fill="#cbd5e1" />
            <polygon points="78,139 54,158 56,161 81,142" fill="#64748b" />
            <polygon points="35,166 44,163 53,166 49,169 39,169" fill="#475569" />

            <!-- Apoyo secundario izquierdo -->
            <polygon points="82,140 75,167 79,167 86,141" fill="#94a3b8" />
            <polygon points="69,168 76,165 83,168 80,170 72,170" fill="#334155" />

            <!-- Apoyo secundario derecho -->
            <polygon points="134,140 141,167 137,167 130,141" fill="#64748b" />
            <polygon points="133,168 140,165 147,168 144,170 136,170" fill="#1e293b" />

            <!-- Pata principal derecha + puntal hidráulico -->
            <polygon points="145,132 174,165 168,166 140,136" fill="#94a3b8" />
            <polygon points="138,139 162,158 160,161 135,142" fill="#475569" />
            <polygon points="163,166 172,163 181,166 177,169 167,169" fill="#334155" />
          </g>
        `}

        <!-- Racimo de 3 toberas acampanadas en la base -->
        <g stroke="#0f172a" stroke-width="1.1" stroke-linejoin="round">
          <polygon points="84,141 96,141 98,151 82,151" fill="#1e293b" />
          <polygon points="84,141 90,141 90,151 82,151" fill="#475569" opacity="0.65" />
          <line x1="82.5" y1="149" x2="97.5" y2="149" stroke="#64748b" stroke-width="1" />

          <polygon points="120,141 132,141 134,151 118,151" fill="#1e293b" />
          <polygon points="120,141 126,141 126,151 118,151" fill="#334155" opacity="0.7" />
          <line x1="118.5" y1="149" x2="133.5" y2="149" stroke="#475569" stroke-width="1" />

          <polygon points="100,141 116,141 119,152 97,152" fill="#334155" />
          <polygon points="100,141 108,141 108,152 97,152" fill="#475569" />
          <line x1="97.5" y1="150" x2="118.5" y2="150" stroke="#94a3b8" stroke-width="1.1" />
        </g>

        <!-- Fuselaje cilíndrico-ojival principal en acero/blanco térmico facetado -->
        <path d="M 108,8 C 93,14 78,31 74,56 L 74,142 Q 108,148 142,142 L 142,56 C 138,31 123,14 108,8 Z"
          fill="url(#${id}-hull)" stroke="#475569" stroke-width="1.25" stroke-linejoin="round" />

        <!-- Facetas poligonales del revestimiento metálico térmico -->
        <polygon points="108,8 88,24 76,56 108,58" fill="#ffffff" opacity="0.62" />
        <polygon points="108,8 128,24 140,56 108,58" fill="#94a3b8" opacity="0.28" />
        <polygon points="76,56 96,57 96,144 76,141" fill="#ffffff" opacity="0.45" />
        <polygon points="120,57 140,56 140,141 120,144" fill="#64748b" opacity="0.24" />

        <!-- Franjas laterales de losetas térmicas cerámicas en gris carbón -->
        <polygon points="108,8 101,12 115,12" fill="#1e293b" />
        <polygon points="75,56 80,56 80,142 75,141" fill="#1e293b" opacity="0.88" />
        <polygon points="136,56 141,56 141,141 136,142" fill="#0f172a" opacity="0.88" />

        <!-- Módulos de propulsores RCS de control de actitud (y = 60) -->
        <g fill="#334155" stroke="#0f172a" stroke-width="0.9">
          <rect x="77" y="59" width="7" height="5" rx="1.2" />
          <circle cx="80.5" cy="61.5" r="1.2" fill="#94a3b8" stroke="none" />
          <rect x="132" y="59" width="7" height="5" rx="1.2" />
          <circle cx="135.5" cy="61.5" r="1.2" fill="#64748b" stroke="none" />
        </g>

        <!-- Banda de paneles solares / radiadores térmicos oscuros (y: 72..82) -->
        <g>
          <path d="M 80,71 Q 108,74 136,71 L 136,82 Q 108,85 80,82 Z" fill="#0f172a" stroke="#334155" stroke-width="0.9" />
          <line x1="92" y1="72.5" x2="92" y2="83" stroke="#38bdf8" stroke-width="0.7" opacity="0.45" />
          <line x1="103" y1="73.2" x2="103" y2="83.6" stroke="#38bdf8" stroke-width="0.7" opacity="0.45" />
          <line x1="113" y1="73.2" x2="113" y2="83.6" stroke="#38bdf8" stroke-width="0.7" opacity="0.45" />
          <line x1="124" y1="72.5" x2="124" y2="83" stroke="#38bdf8" stroke-width="0.7" opacity="0.45" />
        </g>

        <!-- Anillos estructurales circunferenciales de ensamblaje -->
        <g fill="none" stroke="#64748b" stroke-width="1.15" opacity="0.72">
          <path d="M 75,56 Q 108,59 141,56" />
          <path d="M 75,84 Q 108,87 141,84" />
          <path d="M 75,128 Q 108,131 141,128" />
          <path d="M 75,142 Q 108,146 141,142" stroke="#475569" stroke-width="1.4" />
        </g>

        <!-- Galería panorámica de cabina multipanel (5 ventanales trapezoidales) -->
        <g>
          <path d="M 80,38 Q 108,30 136,38 L 137,49 Q 108,46 79,49 Z" fill="#0f172a" stroke="#475569" stroke-width="1" stroke-linejoin="round" />
          <polygon points="82,40 90,37.5 90,47 81.5,47.5" fill="url(#${id}-glass)" />
          <polygon points="92.5,37 100.5,35.5 100.5,46 92.5,46.8" fill="url(#${id}-glass)" />
          <polygon points="103,35.2 113,35.2 113,45.8 103,45.8" fill="url(#${id}-glass)" />
          <polygon points="115.5,35.5 123.5,37 123.5,46.8 115.5,46" fill="url(#${id}-glass)" />
          <polygon points="126,37.5 134,40 134.5,47.5 126,47" fill="url(#${id}-glass)" />
          <!-- Destellos especulares sobre el cristal -->
          <polygon points="84,40.5 87.5,39.5 85.5,46 83,46" fill="#ffffff" opacity="0.55" />
          <polygon points="104.5,36.5 109.5,36.5 106.5,44 104,44" fill="#ffffff" opacity="0.62" />
          <polygon points="127,39 130.5,40 128.5,45.5 126.5,45.5" fill="#ffffff" opacity="0.45" />
        </g>

        <!-- Esclusa presurizada EVA (centrada en 50% x 58% del viewBox) y plataforma de descenso -->
        ${hatchOpen ? `
          <rect x="93" y="96" width="30" height="33" rx="3.5" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8" />
          <rect x="95.5" y="98.5" width="25" height="28" rx="2.5" fill="#172554" />
          <line x1="98" y1="102" x2="118" y2="102" stroke="#38bdf8" stroke-width="1.2" opacity="0.65" />

          ${penguinInHatch ? `
            <g>
              <polygon points="97,125 119,125 117,114 99,114" fill="#f1f5f9" stroke="#64748b" stroke-width="0.9" />
              <polygon points="96,113 120,113 121,116.5 108,118.5 95,116.5" fill="#2563eb" />
              <rect x="97.5" y="99" width="21" height="15" rx="6.5" fill="#f8fafc" stroke="#64748b" stroke-width="0.9" />
              <rect x="94" y="102.5" width="4.5" height="7.5" rx="1.4" fill="#cbd5e1" />
              <rect x="117.5" y="102.5" width="4.5" height="7.5" rx="1.4" fill="#cbd5e1" />
              <rect x="100" y="101" width="16" height="11" rx="5" fill="#0f172a" />
              <path d="M 101.8,107 C 101.8,103.5 105.5,102.5 108,104.2 C 110.5,102.5 114.2,103.5 114.2,107 C 114.2,110.5 111.5,111.5 108,111.5 C 104.5,111.5 101.8,110.5 101.8,107 Z" fill="#f8fafc" />
              <circle cx="105" cy="106.2" r="1.5" fill="#090f24" />
              <circle cx="111" cy="106.2" r="1.5" fill="#090f24" />
              <circle cx="104.5" cy="105.7" r="0.55" fill="#ffffff" />
              <circle cx="110.5" cy="105.7" r="0.55" fill="#ffffff" />
              <polygon points="106.8,108.4 111.8,109.6 107,110.8" fill="#ff8b29" />
              <ellipse cx="96" cy="122" rx="3" ry="2.2" fill="#1e293b" />
              <ellipse cx="120" cy="122" rx="3" ry="2.2" fill="#1e293b" />
            </g>
          ` : ''}

          <!-- Puerta abatible presurizada de la esclusa -->
          <polygon points="123,96 132,93 132,126 123,129" fill="#cbd5e1" stroke="#475569" stroke-width="1" stroke-linejoin="round" />

          ${inSpaceFlight ? '' : `
            <!-- Elevador / rampa luminosa de descenso vertical hasta la superficie -->
            <polygon points="94,129 122,129 131,164 85,164" fill="url(#${id}-ramp)" stroke="#bae6fd" stroke-width="1.1" stroke-linejoin="round" />
            <line x1="92" y1="137" x2="124" y2="137" stroke="#0f172a" stroke-width="1.1" opacity="0.42" />
            <line x1="90" y1="146" x2="126" y2="146" stroke="#0f172a" stroke-width="1.1" opacity="0.42" />
            <line x1="87" y1="155" x2="129" y2="155" stroke="#0f172a" stroke-width="1.1" opacity="0.42" />
            <rect x="83" y="162" width="50" height="4" rx="1.5" fill="#cbd5e1" stroke="#475569" stroke-width="0.9" />
          `}
        ` : `
          <rect x="93" y="96" width="30" height="33" rx="3.5" fill="#cbd5e1" stroke="#475569" stroke-width="1.2" />
          <line x1="108" y1="96" x2="108" y2="129" stroke="#64748b" stroke-width="1" />
          <circle cx="108" cy="112.5" r="4.5" fill="#1e293b" stroke="#f8fafc" stroke-width="1" />
          <circle cx="108" cy="112.5" r="1.6" fill="#38bdf8" />
        `}
      </svg>
    `;
  }

  M.spaceship = spaceship;
})(typeof window !== 'undefined' ? window : globalThis);
