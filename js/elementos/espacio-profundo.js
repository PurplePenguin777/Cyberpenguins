/* =========================================================
   Elemento: Espacio Profundo y Rumbo a Aldebarán (precisión científica + low-poly)
   Escenario interestelar real: banda suave de la Vía Láctea, Júpiter lejano con bandas
   ecuatoriales y lunas galileanas (sobrevuelo histórico de Pioneer 10 en 1973),
   cúmulo en «V» de las Híades y la gigante naranja Aldebarán (Alpha Tauri, sin línea guía).
   ========================================================= */
(function initElementoEspacioProfundo() {
  const M = (window.CYBERPENGUINS_MODELS = window.CYBERPENGUINS_MODELS || {});

  function distantJupiterGroup(cx, cy, scale = 1) {
    const gid = M.uid('jup');
    return `
      <g transform="translate(${cx}, ${cy}) scale(${scale})">
        <defs>
          <clipPath id="${gid}-clip">
            <circle cx="0" cy="0" r="22" />
          </clipPath>
        </defs>

        <!-- Júpiter lejano (sin anillos tipo Saturno) con bandas atmosféricas y Gran Mancha Roja -->
        <g transform="rotate(-8)">
          <!-- 3 Lunas galileanas puntuales alineadas en el plano ecuatorial (Ío, Europa, Ganímedes) -->
          <circle cx="-36" cy="0" r="1.4" fill="#fde68a" opacity="0.92" />
          <circle cx="-28" cy="0.4" r="1.2" fill="#e2e8f0" opacity="0.88" />
          <circle cx="34" cy="-0.3" r="1.6" fill="#cbd5e1" opacity="0.9" />

          <circle cx="0" cy="0" r="22" fill="#b45309" />
          <g clip-path="url(#${gid}-clip)">
            <!-- Bandas zonales y cinturones ecuatoriales low-poly -->
            <polygon points="-24,-22 24,-22 24,-13 -24,-14" fill="#92400e" />
            <polygon points="-24,-14 24,-13 24,-6 -24,-7" fill="#fde68a" />
            <polygon points="-24,-7 24,-6 24,-1 -24,-2" fill="#d97706" />
            <polygon points="-24,-2 24,-1 24,5 -24,4" fill="#f8fafc" />
            <polygon points="-24,4 24,5 24,11 -24,10" fill="#b45309" />
            <polygon points="-24,10 24,11 24,16 -24,15" fill="#fde68a" />
            <polygon points="-24,15 24,16 24,23 -24,23" fill="#9a3412" />
            <!-- Gran Mancha Roja en el hemisferio sur -->
            <polygon points="3,6 10,5 12,8 9,11 2,10 1,8" fill="#dc2626" />
          </g>
          <!-- Terminador nocturno suave del gigante gaseoso -->
          <path d="M 6,-22 A 22,22 0 0,1 6,22 A 14,22 0 0,0 6,-22 Z" fill="#040817" opacity="0.54" />
        </g>
      </g>
    `;
  }

  function distantAldebaranStar(cx, cy, scale = 1) {
    const aid = M.uid('ald');
    return `
      <g transform="translate(${cx}, ${cy}) scale(${scale})">
        <defs>
          <radialGradient id="${aid}-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fed7aa" stop-opacity="0.92" />
            <stop offset="22%" stop-color="#fb923c" stop-opacity="0.52" />
            <stop offset="55%" stop-color="#ea580c" stop-opacity="0.16" />
            <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Cúmulo abierto en «V» de las Híades en Tauro alrededor de Aldebarán -->
        <g fill="#dbeafe">
          <circle cx="-46" cy="-16" r="1.4" opacity="0.88" />
          <circle cx="-32" cy="-6" r="1.3" opacity="0.82" />
          <circle cx="-18" cy="4" r="1.5" opacity="0.9" />
          <circle cx="-54" cy="14" r="1.4" opacity="0.84" />
          <circle cx="-36" cy="16" r="1.2" opacity="0.78" />
          <circle cx="-22" cy="12" r="1.3" opacity="0.82" />
          <circle cx="-6" cy="-18" r="1.2" opacity="0.76" />
        </g>

        <!-- Gigante naranja Aldebarán (Alpha Tauri, K5 III a ~65.3 años luz) -->
        <circle cx="0" cy="0" r="24" fill="url(#${aid}-glow)" />
        <polygon points="0,-10 1.4,-1.4 10,0 1.4,1.4 0,10 -1.4,1.4 -10,0 -1.4,-1.4" fill="#fed7aa" opacity="0.9" />
        <circle cx="0" cy="0" r="3.2" fill="#fb923c" />
        <circle cx="0" cy="0" r="1.8" fill="#fed7aa" />
      </g>
    `;
  }

  function stageBackdropEspacioProfundo() {
    const id = M.uid('deep');
    return `
      <svg viewBox="0 0 1000 594" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-cosmos" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#02040d" />
            <stop offset="52%" stop-color="#050b1d" />
            <stop offset="100%" stop-color="#0a1430" />
          </linearGradient>
          <linearGradient id="${id}-mw" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1e3a8a" stop-opacity="0" />
            <stop offset="35%" stop-color="#312e81" stop-opacity="0.16" />
            <stop offset="52%" stop-color="#60a5fa" stop-opacity="0.12" />
            <stop offset="70%" stop-color="#312e81" stop-opacity="0.14" />
            <stop offset="100%" stop-color="#02040d" stop-opacity="0" />
          </linearGradient>
          <radialGradient id="${id}-mw-core" cx="26%" cy="24%" r="48%">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.14" />
            <stop offset="55%" stop-color="#1e1b4b" stop-opacity="0.09" />
            <stop offset="100%" stop-color="#02040d" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Cosmos interestelar profundo -->
        <rect width="1000" height="594" fill="url(#${id}-cosmos)" />

        <!-- Banda tenue y continua de nuestra Vía Láctea (sin cortes rectangulares ni galaxias externas gigantes) -->
        <rect width="1000" height="594" fill="url(#${id}-mw-core)" />
        <path d="M -120,-60 L 220,-60 L 1120,520 L 1120,680 L 760,680 L -120,120 Z" fill="url(#${id}-mw)" />

        <!-- Júpiter lejano (sobrevuelo de Pioneer 10 en 1973, sin anillos tipo Saturno) -->
        ${distantJupiterGroup(126, 486, 1.0)}

        <!-- Aldebarán (gigante naranja K5 III) y el cúmulo de las Híades en Tauro (sin línea guía) -->
        ${distantAldebaranStar(754, 114, 1.0)}

        <!-- Campo estelar de espacio profundo (sin rocas flotantes cerca de la trayectoria interestelar) -->
        <g fill="#ffffff">
          <circle cx="58" cy="48" r="1.3" opacity="0.86" />
          <circle cx="144" cy="108" r="1.1" opacity="0.72" />
          <circle cx="228" cy="64" r="1.4" opacity="0.88" />
          <circle cx="318" cy="142" r="1.0" opacity="0.68" />
          <circle cx="384" cy="46" r="1.5" opacity="0.9" />
          <circle cx="468" cy="112" r="1.1" opacity="0.74" />
          <circle cx="556" cy="44" r="1.4" opacity="0.86" />
          <circle cx="628" cy="84" r="1.2" opacity="0.72" />
          <circle cx="848" cy="54" r="1.5" opacity="0.88" />
          <circle cx="932" cy="118" r="1.2" opacity="0.78" />
          <circle cx="196" cy="214" r="1.2" opacity="0.74" />
          <circle cx="418" cy="218" r="1.3" opacity="0.76" />
          <circle cx="534" cy="248" r="1.1" opacity="0.7" />
          <circle cx="888" cy="236" r="1.4" opacity="0.84" />
          <circle cx="342" cy="488" r="1.3" opacity="0.78" />
          <circle cx="516" cy="524" r="1.2" opacity="0.72" />
          <circle cx="718" cy="512" r="1.4" opacity="0.84" />
          <circle cx="914" cy="496" r="1.3" opacity="0.78" />
          <circle cx="272" cy="364" r="1.1" opacity="0.72" />
          <circle cx="642" cy="382" r="1.2" opacity="0.76" />
          <circle cx="812" cy="342" r="1.1" opacity="0.72" />
          <circle cx="92" cy="284" r="1.2" opacity="0.74" />
          <polygon points="602,164 603.5,168.5 608,170 603.5,171.5 602,176 600.5,171.5 596,170 600.5,168.5" fill="#bae6fd" opacity="0.82" />
          <polygon points="484,386 485.5,390 489.5,391.5 485.5,393 484,397 482.5,393 478.5,391.5 482.5,390" fill="#fde68a" opacity="0.78" />
        </g>
      </svg>
    `;
  }

  function travelPhaseEspacioProfundo(phaseKey) {
    if (phaseKey !== 'deep-space-arrival') return '';
    const id = M.uid('trdp');

    return `
      <svg class="travel-scene-svg" viewBox="0 0 900 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#02040d" />
            <stop offset="100%" stop-color="#0a1634" />
          </linearGradient>
          <linearGradient id="${id}-mw" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1e3a8a" stop-opacity="0" />
            <stop offset="50%" stop-color="#4f46e5" stop-opacity="0.16" />
            <stop offset="100%" stop-color="#02040d" stop-opacity="0" />
          </linearGradient>
        </defs>

        <rect width="900" height="440" fill="url(#${id}-bg)" />
        <path d="M -80,-40 L 180,-40 L 980,410 L 980,490 L 720,490 L -80,80 Z" fill="url(#${id}-mw)" />

        <!-- Aldebarán (sin líneas de trayectoria) y Júpiter distante atrás -->
        ${distantAldebaranStar(762, 96, 1.05)}
        ${distantJupiterGroup(168, 352, 0.85)}

        <g class="travel-stars-warp" fill="#ffffff">
          <circle cx="82" cy="142" r="1.4" opacity="0.86" />
          <circle cx="196" cy="76" r="1.2" opacity="0.78" />
          <circle cx="294" cy="64" r="1.5" opacity="0.9" />
          <circle cx="432" cy="96" r="1.2" opacity="0.76" />
          <circle cx="576" cy="52" r="1.6" opacity="0.92" />
          <circle cx="648" cy="212" r="1.2" opacity="0.74" />
          <circle cx="312" cy="368" r="1.4" opacity="0.8" />
          <circle cx="542" cy="378" r="1.3" opacity="0.78" />
          <circle cx="786" cy="312" r="1.2" opacity="0.74" />
        </g>

        <g class="travel-ship-cruise" transform="translate(418, 146) rotate(64) scale(0.84)">
          ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
        </g>
      </svg>
    `;
  }

  // Emblema Espacio Profundo: 433 Eros facetado + gigante naranja Aldebarán y estrellas de Tauro sobre haz holográfico cian
  function emblemEspacioProfundo() {
    const id = M.uid('edeep');
    return `
      <svg viewBox="0 0 80 80" width="54" height="54" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.06" />
            <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.48" />
          </linearGradient>
          <radialGradient id="${id}-star" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fed7aa" stop-opacity="0.95" />
            <stop offset="45%" stop-color="#fb923c" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Haz vertical holográfico y anillos concéntricos cian en la base -->
        <polygon points="20,38 60,38 68,66 12,66" fill="url(#${id}-beam)" />
        <ellipse cx="40" cy="66" rx="28" ry="8.5" fill="#0891b2" fill-opacity="0.28" stroke="#67e8f9" stroke-width="2" />
        <ellipse cx="40" cy="66" rx="19" ry="5.5" fill="none" stroke="#a5f3fc" stroke-width="1.3" opacity="0.9" />
        <ellipse cx="40" cy="66" rx="9" ry="2.6" fill="#67e8f9" opacity="0.88" />

        <!-- Estrellas en «V» de Tauro / Híades y gigante naranja Aldebarán -->
        <g fill="#dbeafe">
          <circle cx="19" cy="18" r="1.2" opacity="0.88" />
          <circle cx="25" cy="23" r="1.1" opacity="0.82" />
          <circle cx="31" cy="26" r="1.1" opacity="0.85" />
          <circle cx="20" cy="30" r="1.2" opacity="0.82" />
          <circle cx="27" cy="29" r="1.0" opacity="0.78" />
        </g>
        <g transform="translate(55, 19)">
          <circle cx="0" cy="0" r="11" fill="url(#${id}-star)" />
          <polygon points="0,-6 1,-1 6,0 1,1 0,6 -1,1 -6,0 -1,-1" fill="#fed7aa" />
          <circle cx="0" cy="0" r="2.2" fill="#fb923c" />
        </g>

        <!-- Asteroide alargado 433 Eros facetado low-poly en forma de cacahuate -->
        <g transform="translate(39, 36) rotate(-14)">
          <polygon points="-20,-2 -11,-9 0,-6 12,-9 21,-3 18,6 7,9 -4,6 -16,8" fill="#64748b" />
          <polygon points="-11,-9 0,-6 -2,2 -15,1" fill="#cbd5e1" />
          <polygon points="0,-6 12,-9 14,1 -2,2" fill="#94a3b8" />
          <polygon points="12,-9 21,-3 18,6 14,1" fill="#64748b" />
          <polygon points="-15,1 -2,2 -4,6 -16,8 -20,-2" fill="#475569" />
          <polygon points="-2,2 14,1 18,6 7,9 -4,6" fill="#334155" />
          <!-- Depresión central Himeros sobre Eros -->
          <polygon points="-4,-3 2,-4 5,-1 1,2 -3,1" fill="#475569" />
        </g>
      </svg>
    `;
  }

  M.stageBackdropEspacioProfundo = stageBackdropEspacioProfundo;
  M.travelPhaseEspacioProfundo = travelPhaseEspacioProfundo;
  M.emblemEspacioProfundo = emblemEspacioProfundo;
})();
