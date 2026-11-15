/* =========================================================
   Elemento: La Luna (estética low-poly)
   Escenarios de alunizaje, fases orbitales, rocas lunares y emblema holográfico.
   ========================================================= */
(function initElementoLuna() {
  const M = (window.CYBERPENGUINS_MODELS = window.CYBERPENGUINS_MODELS || {});

  const LUNA_ROCK_STYLE = {
    a: '#f1f5f9',
    b: '#94a3b8',
    c: '#475569',
    glint: '#7dd3fc',
    soilBack: '#64748b',
    soilFront: '#cbd5e1',
    soilRim: '#475569'
  };

  function facetedEarthGroup(cx, cy, r) {
    const scale = r / 50;
    return `
      <g transform="translate(${cx}, ${cy}) scale(${scale.toFixed(3)})">
        <!-- Halo atmosférico sutil -->
        <circle cx="0" cy="0" r="56" fill="#38bdf8" opacity="0.16" />
        <circle cx="0" cy="0" r="50" fill="#184e9e" />
        <!-- Facetas oceánicas low-poly -->
        <polygon points="-44,-22 -14,-48 18,-46 4,-12 -28,-6" fill="#2c7be5" />
        <polygon points="18,-46 46,-20 44,12 4,-12" fill="#246bc7" />
        <polygon points="-48,-4 -28,-6 4,-12 -8,28 -44,20" fill="#2262b8" />
        <polygon points="4,-12 44,12 24,44 -8,28" fill="#184e9e" />
        <polygon points="-44,20 -8,28 24,44 -14,48 -36,36" fill="#123d7e" />
        <!-- Continentes verdes facetados estilo diapositivas 1 y 7 -->
        <polygon points="-32,-26 -6,-40 12,-24 0,-8 -24,-10" fill="#3da66d" />
        <polygon points="-6,-40 16,-36 12,-24" fill="#63d48f" />
        <polygon points="16,-14 38,-6 34,18 14,16 8,-2" fill="#359360" />
        <polygon points="-24,10 -2,12 -10,34 -30,28" fill="#2c8052" />
        <!-- Bandas angulares de nubes y sombra nocturna -->
        <polygon points="-26,-16 8,-22 14,-15 -20,-9" fill="#ffffff" opacity="0.68" />
        <polygon points="-14,4 22,12 16,18 -18,10" fill="#e0f2fe" opacity="0.52" />
        <path d="M 10,-49 A 50,50 0 0,1 10,49 A 34,50 0 0,0 10,-49 Z" fill="#06122b" opacity="0.46" />
      </g>
    `;
  }

  function stageBackdropLuna(siteId) {
    const isTranquility = siteId === 'mare-tranquillitatis';
    const id = M.uid('moon');

    if (isTranquility) {
      return `
        <svg viewBox="0 0 1000 594" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#02040a" />
              <stop offset="65%" stop-color="#040710" />
              <stop offset="100%" stop-color="#060b14" />
            </linearGradient>
          </defs>

          <!-- Cielo espacial profundo -->
          <rect width="1000" height="594" fill="url(#${id}-sky)" />

          <!-- Estrellas únicamente en el cielo oscuro (sin puntos sobre Tierra ni suelo lunar) -->
          <g fill="#ffffff">
            <circle cx="72" cy="48" r="1.4" opacity="0.88" />
            <circle cx="148" cy="96" r="1.1" opacity="0.72" />
            <circle cx="228" cy="36" r="1.6" opacity="0.92" />
            <circle cx="294" cy="132" r="1.2" opacity="0.74" />
            <circle cx="486" cy="52" r="1.5" opacity="0.86" />
            <circle cx="574" cy="94" r="1.1" opacity="0.7" />
            <circle cx="664" cy="40" r="1.6" opacity="0.9" />
            <circle cx="752" cy="112" r="1.2" opacity="0.78" />
            <circle cx="848" cy="54" r="1.5" opacity="0.88" />
            <circle cx="928" cy="98" r="1.2" opacity="0.74" />
            <polygon points="184,142 186,147 191,149 186,151 184,156 182,151 177,149 182,147" fill="#dbeafe" opacity="0.84" />
            <polygon points="804,144 806,148 810,150 806,152 804,156 802,152 798,150 802,148" fill="#dbeafe" opacity="0.8" />
          </g>

          <!-- La Tierra low-poly flotando en el cielo lunar -->
          ${facetedEarthGroup(366, 98, 48)}

          <!-- Cordillera trasera low-poly en el horizonte lunar -->
          <g>
            <polygon points="-10,278 120,214 250,268" fill="#334155" />
            <polygon points="120,214 250,268 156,280" fill="#475569" />
            <polygon points="210,272 390,218 540,266" fill="#2b374d" />
            <polygon points="390,218 540,266 432,276" fill="#475569" />
            <polygon points="500,268 688,208 860,268" fill="#334155" />
            <polygon points="688,208 860,268 742,278" fill="#52627a" />
            <polygon points="810,268 945,224 1015,274" fill="#2b374d" />
          </g>

          <!-- Planicie lunar principal compuesta por grandes facetas low-poly -->
          <polygon points="-10,276 260,256 540,254 810,260 1010,276 1010,598 -10,598" fill="#cbd5e1" />
          <polygon points="-10,276 260,256 320,348 -10,362" fill="#dfe7f0" />
          <polygon points="260,256 540,254 610,344 320,348" fill="#e6edf5" />
          <polygon points="540,254 810,260 880,350 610,344" fill="#d3dde9" />
          <polygon points="810,260 1010,276 1010,366 880,350" fill="#bac6d6" />

          <!-- Área central iluminada para los elementos del juego -->
          <polygon points="-10,362 320,348 250,486 -10,492" fill="#c3cfde" />
          <polygon points="320,348 610,344 680,478 250,486" fill="#d9e2ec" />
          <polygon points="610,344 880,350 1010,366 1010,494 680,478" fill="#c0ccd9" />
          <polygon points="-10,492 250,486 480,598 -10,598" fill="#aebccb" />
          <polygon points="250,486 680,478 760,598 480,598" fill="#b9c6d6" />
          <polygon points="680,478 1010,494 1010,598 760,598" fill="#a2b0c2" />

          <!-- Cráter facetado grande (Mare Tranquillitatis, zona derecha superior del plano) -->
          <g transform="translate(768, 336)">
            <polygon points="-92,-12 -46,-36 32,-38 92,-12 72,20 0,34 -74,20" fill="#94a3b8" />
            <polygon points="-76,-8 -36,-28 28,-30 76,-8 58,14 0,24 -60,14" fill="#64748b" />
            <polygon points="-58,-4 -24,-18 22,-20 56,-4 20,12 -32,10" fill="#475569" />
            <polygon points="-92,-12 -46,-36 32,-38 28,-30 -36,-28 -76,-8" fill="#e2e8f0" />
          </g>

          <!-- Cráter medio izquierdo -->
          <g transform="translate(178, 496)">
            <polygon points="-58,-6 -24,-22 28,-22 60,-4 44,18 -4,24 -48,16" fill="#94a3b8" />
            <polygon points="-44,-4 -18,-16 24,-16 46,-2 32,12 -2,16 -36,10" fill="#64748b" />
            <polygon points="-58,-6 -24,-22 28,-22 24,-16 -18,-16 -44,-4" fill="#cbd5e1" />
          </g>

          <!-- Cráter pequeño superior centro-izquierda -->
          <g transform="translate(362, 294)">
            <polygon points="-34,-4 -14,-13 18,-13 36,-3 26,10 -2,14 -28,9" fill="#94a3b8" />
            <polygon points="-24,-2 -10,-9 14,-9 26,-1 18,7 -2,9 -20,6" fill="#64748b" />
          </g>

          <!-- Bloques de roca angular low-poly en los márgenes -->
          <g>
            <polygon points="104,312 128,288 154,296 164,316 122,320" fill="#94a3b8" />
            <polygon points="128,288 154,296 142,318 122,320" fill="#cbd5e1" />
            <polygon points="154,296 164,316 142,318" fill="#64748b" />

            <polygon points="222,542 252,516 286,522 296,548 238,554" fill="#7c8b9e" />
            <polygon points="252,516 286,522 270,548 238,554" fill="#aebccb" />
            <polygon points="286,522 296,548 270,548" fill="#526278" />
          </g>
        </svg>
      `;
    }

    // Oceanus Procellarum — macizo basáltico más frío y accidentado
    return `
      <svg viewBox="0 0 1000 594" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#02040a" />
            <stop offset="65%" stop-color="#040710" />
            <stop offset="100%" stop-color="#060b14" />
          </linearGradient>
        </defs>

        <rect width="1000" height="594" fill="url(#${id}-sky)" />

        <!-- Estrellas en cielo nocturno -->
        <g fill="#ffffff">
          <circle cx="84" cy="44" r="1.4" opacity="0.88" />
          <circle cx="164" cy="108" r="1.1" opacity="0.72" />
          <circle cx="256" cy="54" r="1.6" opacity="0.92" />
          <circle cx="348" cy="86" r="1.2" opacity="0.74" />
          <circle cx="442" cy="42" r="1.5" opacity="0.88" />
          <circle cx="534" cy="126" r="1.1" opacity="0.72" />
          <circle cx="628" cy="48" r="1.6" opacity="0.9" />
          <circle cx="852" cy="144" r="1.3" opacity="0.78" />
          <circle cx="932" cy="64" r="1.5" opacity="0.88" />
          <polygon points="122,126 124,131 129,133 124,135 122,140 120,135 115,133 120,131" fill="#dbeafe" opacity="0.84" />
          <polygon points="562,62 564,66 568,68 564,70 562,74 560,70 556,68 560,66" fill="#dbeafe" opacity="0.82" />
        </g>

        <!-- Tierra low-poly en posición alta derecha -->
        ${facetedEarthGroup(742, 92, 44)}

        <!-- Cordillera basáltica elevada de Oceanus Procellarum -->
        <g>
          <polygon points="-10,278 96,204 206,274" fill="#2c3a52" />
          <polygon points="96,204 206,274 128,282" fill="#465672" />
          <polygon points="172,272 318,186 446,266" fill="#253247" />
          <polygon points="318,186 446,266 346,274" fill="#4c5e7c" />
          <polygon points="418,268 594,210 742,268" fill="#2f3e57" />
          <polygon points="594,210 742,268 634,274" fill="#526583" />
          <polygon points="710,270 868,196 1015,274" fill="#263349" />
          <polygon points="868,196 1015,274 904,280" fill="#485a77" />
        </g>

        <!-- Planicie de basalto gris-azulado low-poly -->
        <polygon points="-10,274 280,256 620,254 880,262 1010,276 1010,598 -10,598" fill="#b4c2d4" />
        <polygon points="-10,274 280,256 220,362 -10,352" fill="#c6d2e1" />
        <polygon points="280,256 620,254 550,356 220,362" fill="#d2dceb" />
        <polygon points="620,254 880,262 840,358 550,356" fill="#bfccd9" />
        <polygon points="880,262 1010,276 1010,364 840,358" fill="#a4b3c7" />

        <polygon points="-10,352 220,362 310,492 -10,498" fill="#b3c1d3" />
        <polygon points="220,362 550,356 640,486 310,492" fill="#c7d3e2" />
        <polygon points="550,356 840,358 1010,364 1010,494 640,486" fill="#aebdcb" />

        <polygon points="-10,498 310,492 430,598 -10,598" fill="#98a7bc" />
        <polygon points="310,492 640,486 730,598 430,598" fill="#a8b7ca" />
        <polygon points="640,486 1010,494 1010,598 730,598" fill="#8f9fb4" />

        <!-- Cráteres facetados en Oceanus Procellarum -->
        <g transform="translate(226, 332)">
          <polygon points="-74,-8 -34,-28 26,-28 74,-6 54,18 -4,26 -58,16" fill="#8192a8" />
          <polygon points="-58,-4 -24,-20 20,-20 58,-2 40,12 -2,18 -44,10" fill="#52627a" />
          <polygon points="-74,-8 -34,-28 26,-28 20,-20 -24,-20 -58,-4" fill="#d4dfec" />
        </g>

        <g transform="translate(804, 488)">
          <polygon points="-64,-8 -26,-24 30,-22 66,-4 46,18 -6,24 -52,14" fill="#7c8da4" />
          <polygon points="-48,-4 -18,-16 24,-15 50,-2 34,12 -4,15 -38,8" fill="#4b5a72" />
          <polygon points="-64,-8 -26,-24 30,-22 24,-15 -18,-16 -48,-4" fill="#c6d3e2" />
        </g>

        <!-- Promontorios basálticos angulares -->
        <g>
          <polygon points="64,458 98,426 138,434 150,464 82,468" fill="#64748b" />
          <polygon points="98,426 138,434 118,462 82,468" fill="#94a3b8" />
          <polygon points="138,434 150,464 118,462" fill="#475569" />

          <polygon points="866,306 898,278 934,284 946,312 886,316" fill="#64748b" />
          <polygon points="898,278 934,284 916,312 886,316" fill="#94a3b8" />
          <polygon points="934,284 946,312 916,312" fill="#475569" />
        </g>
      </svg>
    `;
  }

  function travelPhaseLuna(phaseKey) {
    const id = M.uid('mtrl');

    if (phaseKey === 'moon-arrival') {
      return `
        <!-- Vista horizontal / panorámica -->
        <svg class="travel-scene-svg is-landscape" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="960" height="540" fill="#040816" />
          <g class="travel-stars-drift" fill="#ffffff">
            <circle cx="94" cy="58" r="1.4" opacity="0.9" />
            <circle cx="248" cy="98" r="1.1" opacity="0.74" />
            <circle cx="368" cy="52" r="1.6" opacity="0.92" />
            <circle cx="582" cy="78" r="1.2" opacity="0.78" />
            <circle cx="724" cy="48" r="1.6" opacity="0.92" />
            <circle cx="844" cy="118" r="1.3" opacity="0.82" />
            <circle cx="912" cy="68" r="1.1" opacity="0.72" />
          </g>

          ${facetedEarthGroup(146, 102, 38)}

          <!-- Horizonte lunar curvado low-poly y superficie completa -->
          <g class="travel-planet-approach">
            <path d="M -30,340 Q 480,260 990,340 L 990,560 L -30,560 Z" fill="#94a3b8" />
            <polygon points="-30,340 190,305 275,430 -30,460" fill="#cbd5e1" />
            <polygon points="190,305 480,285 520,418 275,430" fill="#dce5ef" />
            <polygon points="480,285 765,305 725,428 520,418" fill="#c3cfde" />
            <polygon points="765,305 990,340 990,460 725,428" fill="#9fb0c4" />
            <polygon points="-30,460 275,430 520,418 725,428 990,460 990,560 -30,560" fill="#899ab0" />

            <!-- Cráteres lunares con relieve facetado y sombra -->
            <g transform="translate(230, 390)">
              <polygon points="-62,-7 -26,-22 28,-20 62,-4 45,18 -9,22 -50,13" fill="#64748b" />
              <polygon points="-45,-2 -17,-13 19,-12 43,-1 28,10 -6,13 -34,7" fill="#475569" />
              <polygon points="-4,2 6,-2 8,6 0,8" fill="#cbd5e1" opacity="0.6" />
            </g>
            <g transform="translate(700, 382)">
              <polygon points="-80,-9 -34,-28 38,-26 80,-6 57,22 -9,28 -66,17" fill="#64748b" />
              <polygon points="-58,-3 -22,-17 28,-15 58,-2 39,13 -6,17 -45,10" fill="#475569" />
              <polygon points="-2,1 8,-3 10,7 1,9" fill="#cbd5e1" opacity="0.6" />
            </g>
          </g>

          <g class="travel-ship-descent" transform="translate(410, 80) scale(0.92)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>

        <!-- Vista vertical / responsiva (móviles y tablets en vertical) -->
        <svg class="travel-scene-svg is-portrait" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-space-p" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#02040b" />
              <stop offset="55%" stop-color="#060c1d" />
              <stop offset="100%" stop-color="#0a1632" />
            </linearGradient>
          </defs>
          <rect width="540" height="960" fill="url(#${id}-space-p)" />
          <!-- Estrellas en el espacio superior -->
          <g class="travel-stars-drift" fill="#ffffff">
            <circle cx="56" cy="74" r="1.5" opacity="0.9" />
            <circle cx="168" cy="48" r="1.2" opacity="0.75" />
            <circle cx="230" cy="110" r="1.6" opacity="0.9" />
            <circle cx="340" cy="56" r="1.4" opacity="0.8" />
            <circle cx="440" cy="98" r="1.7" opacity="0.92" />
            <circle cx="504" cy="42" r="1.2" opacity="0.7" />
            <circle cx="86" cy="220" r="1.3" opacity="0.76" />
            <circle cx="460" cy="240" r="1.5" opacity="0.85" />
            <circle cx="130" cy="340" r="1.2" opacity="0.7" />
            <circle cx="410" cy="360" r="1.4" opacity="0.78" />
          </g>
          <!-- Tierra visible arriba a la izquierda (Earthrise) -->
          ${facetedEarthGroup(118, 126, 38)}
          <!-- Cohete Cyberpenguin en descenso vertical en el tercio superior -->
          <g class="travel-ship-descent" transform="translate(216, 200) scale(1.08)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
          <!-- Gran relieve lunar que cubre toda la mitad inferior de 480 a 960 -->
          <g class="travel-planet-approach">
            <!-- Horizonte curvo lunar -->
            <path d="M -20,510 Q 270,440 560,510 L 560,980 L -20,980 Z" fill="#899ab0" />
            <!-- Crestas y laderas low-poly -->
            <polygon points="-20,510 110,480 180,590 -20,620" fill="#cbd5e1" />
            <polygon points="110,480 270,455 320,580 180,590" fill="#dce5ef" />
            <polygon points="270,455 430,480 390,585 320,580" fill="#c3cfde" />
            <polygon points="430,480 560,510 560,620 390,585" fill="#9fb0c4" />
            <polygon points="-20,620 180,590 320,580 390,585 560,620 560,760 -20,760" fill="#8294aa" />
            <!-- Mesetas intermedias y mares oscuros -->
            <polygon points="-20,760 140,730 290,750 450,725 560,760 560,980 -20,980" fill="#6f8196" />
            <!-- Mare Tranquillitatis / regolito profundo -->
            <polygon points="60,660 170,640 230,690 140,720" fill="#475569" opacity="0.7" />
            <polygon points="320,645 440,635 480,695 360,710" fill="#475569" opacity="0.65" />
            <!-- Cráteres lunares con relieve, borde iluminado y foso de sombra -->
            <g transform="translate(145, 595)">
              <polygon points="-52,-6 -22,-18 24,-16 52,-4 38,14 -8,18 -42,11" fill="#64748b" />
              <polygon points="-38,-2 -14,-11 16,-10 36,-1 24,9 -5,11 -29,6" fill="#334155" />
              <polygon points="-3,2 6,-2 8,5 0,7" fill="#cbd5e1" opacity="0.65" />
            </g>
            <g transform="translate(385, 570)">
              <polygon points="-65,-7 -28,-22 31,-20 65,-5 46,17 -7,22 -53,13" fill="#64748b" />
              <polygon points="-47,-3 -18,-13 23,-12 47,-2 32,10 -5,14 -37,8" fill="#334155" />
              <polygon points="-2,1 7,-2 9,6 1,8" fill="#cbd5e1" opacity="0.65" />
            </g>
            <!-- Cráter secundario en primer plano -->
            <g transform="translate(260, 780)">
              <polygon points="-75,-8 -32,-25 36,-23 75,-6 53,19 -8,25 -61,15" fill="#5a6a7e" />
              <polygon points="-54,-3 -20,-15 26,-13 54,-2 37,12 -6,16 -42,9" fill="#293548" />
              <polygon points="-3,2 8,-2 10,7 1,9" fill="#94a3b8" opacity="0.7" />
            </g>
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'moon-liftoff') {
      return `
        <!-- Vista horizontal -->
        <svg class="travel-scene-svg is-landscape" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="960" height="540" fill="#050a18" />
          <g fill="#ffffff">
            <circle cx="94" cy="48" r="1.4" opacity="0.88" />
            <circle cx="212" cy="86" r="1.2" opacity="0.74" />
            <circle cx="332" cy="40" r="1.6" opacity="0.92" />
            <circle cx="574" cy="64" r="1.5" opacity="0.88" />
            <circle cx="716" cy="96" r="1.2" opacity="0.76" />
            <circle cx="836" cy="46" r="1.6" opacity="0.92" />
          </g>

          ${facetedEarthGroup(788, 92, 38)}

          <!-- Relieve lunar bajo el despegue que llena hasta la base -->
          <g class="travel-horizon-drop">
            <polygon points="-20,350 180,312 360,328 580,314 780,332 980,352 980,560 -20,560" fill="#9fb0c4" />
            <polygon points="-20,350 180,312 290,440 -20,480" fill="#bac8d8" />
            <polygon points="180,312 580,314 540,442 290,440" fill="#cbd5e1" />
            <polygon points="580,314 980,352 980,560 540,442" fill="#90a2b8" />
            <polygon points="-20,480 290,440 540,442 980,560 -20,560" fill="#75869c" />
            <g transform="translate(480, 410)">
              <polygon points="-84,-8 -36,-24 38,-24 84,-8 62,18 -4,24 -66,16" fill="#64748b" />
              <polygon points="-58,-4 -24,-14 26,-14 58,-4 42,10 -4,14 -44,9" fill="#475569" />
            </g>
          </g>

          <g class="travel-ship-liftoff" transform="translate(414, 96) scale(0.92)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>

        <!-- Vista vertical -->
        <svg class="travel-scene-svg is-portrait" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="540" height="960" fill="#040816" />
          <g fill="#ffffff">
            <circle cx="68" cy="74" r="1.5" opacity="0.9" />
            <circle cx="184" cy="52" r="1.2" opacity="0.75" />
            <circle cx="376" cy="68" r="1.6" opacity="0.92" />
            <circle cx="478" cy="112" r="1.4" opacity="0.8" />
            <circle cx="92" cy="240" r="1.3" opacity="0.75" />
            <circle cx="452" cy="260" r="1.5" opacity="0.85" />
          </g>

          ${facetedEarthGroup(412, 134, 38)}

          <g class="travel-ship-liftoff" transform="translate(216, 260) scale(1.08)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>

          <!-- Relieve lunar inferior completo -->
          <g class="travel-horizon-drop">
            <polygon points="-20,550 120,520 270,535 420,515 560,550 560,980 -20,980" fill="#9fb0c4" />
            <polygon points="-20,550 120,520 200,640 -20,680" fill="#bac8d8" />
            <polygon points="120,520 420,515 370,645 200,640" fill="#cbd5e1" />
            <polygon points="420,515 560,550 560,680 370,645" fill="#90a2b8" />
            <polygon points="-20,680 200,640 370,645 560,680 560,980 -20,980" fill="#75869c" />
            <g transform="translate(270, 620)">
              <polygon points="-74,-8 -32,-22 34,-22 74,-8 55,16 -4,22 -58,14" fill="#64748b" />
              <polygon points="-52,-4 -21,-13 23,-13 52,-4 37,9 -4,13 -39,8" fill="#475569" />
            </g>
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'moon-suborbital') {
      return `
        <!-- Vista horizontal -->
        <svg class="travel-scene-svg is-landscape" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-orb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#030712" />
              <stop offset="100%" stop-color="#0d1a38" />
            </linearGradient>
          </defs>
          <rect width="960" height="540" fill="url(#${id}-orb)" />
          <g class="travel-stars-warp" fill="#ffffff">
            <circle cx="96" cy="54" r="1.4" opacity="0.9" />
            <circle cx="192" cy="116" r="1.2" opacity="0.76" />
            <circle cx="318" cy="48" r="1.6" opacity="0.92" />
            <circle cx="482" cy="84" r="1.2" opacity="0.74" />
            <circle cx="624" cy="44" r="1.6" opacity="0.9" />
            <circle cx="776" cy="126" r="1.3" opacity="0.82" />
          </g>

          ${facetedEarthGroup(158, 92, 34)}

          <!-- Arco orbital lunar low-poly debajo de la nave -->
          <g>
            <path d="M -40,370 Q 480,250 1000,370 L 1000,560 L -40,560 Z" fill="#9fb0c4" />
            <polygon points="-40,370 230,305 325,480 -40,480" fill="#cbd5e1" />
            <polygon points="230,305 510,290 550,480 325,480" fill="#dce5ef" />
            <polygon points="510,290 780,315 750,480 550,480" fill="#b4c2d4" />
            <polygon points="780,315 1000,370 1000,480 750,480" fill="#899ab0" />
            <polygon points="-40,480 325,480 550,480 750,480 1000,480 1000,560 -40,560" fill="#6f8196" />
            <polygon points="364,372 438,352 498,374 466,406 384,406" fill="#64748b" />
            <polygon points="652,386 708,370 756,388 732,414 670,414" fill="#64748b" />
          </g>

          <g class="travel-ship-cruise" transform="translate(498, 102) rotate(72) scale(0.82)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>

        <!-- Vista vertical -->
        <svg class="travel-scene-svg is-portrait" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-orb-p" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#02040b" />
              <stop offset="100%" stop-color="#0a1532" />
            </linearGradient>
          </defs>
          <rect width="540" height="960" fill="url(#${id}-orb-p)" />
          <g class="travel-stars-warp" fill="#ffffff">
            <circle cx="68" cy="64" r="1.5" opacity="0.9" />
            <circle cx="184" cy="116" r="1.2" opacity="0.75" />
            <circle cx="340" cy="52" r="1.6" opacity="0.92" />
            <circle cx="468" cy="98" r="1.3" opacity="0.8" />
          </g>

          ${facetedEarthGroup(118, 118, 36)}

          <g class="travel-ship-cruise" transform="translate(270, 240) rotate(60) scale(0.95)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>

          <!-- Arco lunar cubriendo la base -->
          <g>
            <path d="M -20,530 Q 270,460 560,530 L 560,980 L -20,980 Z" fill="#9fb0c4" />
            <polygon points="-20,530 140,490 220,630 -20,660" fill="#cbd5e1" />
            <polygon points="140,490 380,480 340,630 220,630" fill="#dce5ef" />
            <polygon points="380,480 560,530 560,660 340,630" fill="#b4c2d4" />
            <polygon points="-20,660 220,630 340,630 560,660 560,980 -20,980" fill="#75869c" />
            <polygon points="220,580 290,560 340,580 310,610 240,610" fill="#64748b" />
          </g>
        </svg>
      `;
    }

    return '';
  }

  function sampleCrystalLuna(variant = 0) {
    return M.renderRockSample(LUNA_ROCK_STYLE, variant);
  }

  // Emblema diapositiva 2: Luna low-poly proyectada sobre anillos holográficos cian
  function emblemLuna() {
    const id = M.uid('eluna');
    return `
      <svg viewBox="0 0 80 80" width="54" height="54" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.06" />
            <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.48" />
          </linearGradient>
        </defs>

        <!-- Haz vertical holográfico y anillos concéntricos cian en la base -->
        <polygon points="22,38 58,38 68,66 12,66" fill="url(#${id}-beam)" />
        <ellipse cx="40" cy="66" rx="28" ry="8.5" fill="#0891b2" fill-opacity="0.28" stroke="#67e8f9" stroke-width="2" />
        <ellipse cx="40" cy="66" rx="19" ry="5.5" fill="none" stroke="#a5f3fc" stroke-width="1.3" opacity="0.9" />
        <ellipse cx="40" cy="66" rx="9" ry="2.6" fill="#67e8f9" opacity="0.85" />

        <!-- Esfera lunar low-poly facetada -->
        <g transform="translate(40, 29)">
          <circle cx="0" cy="0" r="20" fill="#64748b" />
          <polygon points="-16,-12 0,-20 14,-13 4,-1 -12,-2" fill="#e2e8f0" />
          <polygon points="14,-13 20,2 10,16 4,-1" fill="#94a3b8" />
          <polygon points="-20,1 -12,-2 4,-1 -2,16 -16,12" fill="#cbd5e1" />
          <polygon points="-2,16 4,-1 10,16 -4,20" fill="#64748b" />
          <polygon points="-16,12 -2,16 -4,20 -13,16" fill="#475569" />
          <!-- Cráteres geométricos limpios -->
          <polygon points="-9,-9 -3,-12 1,-7 -4,-3 -10,-5" fill="#94a3b8" stroke="#cbd5e1" stroke-width="0.6" />
          <polygon points="5,2 11,0 13,6 8,9 4,6" fill="#64748b" stroke="#94a3b8" stroke-width="0.6" />
          <polygon points="-10,5 -5,3 -3,8 -8,10" fill="#64748b" opacity="0.85" />
        </g>
      </svg>
    `;
  }

  M.stageBackdropLuna = stageBackdropLuna;
  M.travelPhaseLuna = travelPhaseLuna;
  M.sampleCrystalLuna = sampleCrystalLuna;
  M.emblemLuna = emblemLuna;
})();
