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
    if (typeof M.planetBody === 'function') {
      const uid = 'learth_' + Math.round(cx) + '_' + Math.round(cy);
      return `<g transform="translate(${cx}, ${cy})">${M.planetBody('earth', r, { uid })}</g>`;
    }
    const scale = r / 50;
    return `
      <g transform="translate(${cx}, ${cy}) scale(${scale.toFixed(3)})">
        <circle cx="0" cy="0" r="54" fill="#38bdf8" opacity="0.32" />
        <circle cx="0" cy="0" r="50" fill="#1d4ed8" />
        <path d="M -12,-38 C -4,-44 8,-42 16,-34 C 22,-24 18,-12 8,-8 C -2,-4 -14,-14 -18,-26 Z" fill="#2d8a56" />
        <path d="M 6,-4 C 18,-6 28,-14 36,-10 C 44,-2 38,18 26,24 C 14,28 6,14 4,4 Z" fill="#2d8a56" />
        <path d="M -26,8 C -14,10 -8,22 -14,36 C -20,44 -32,38 -36,24 C -38,14 -32,8 -26,8 Z" fill="#2d8a56" />
        <path d="M -28,-18 Q -4,-28 14,-16 Q 32,-8 24,12 Q 8,4 -16,-2 Z" fill="#ffffff" opacity="0.65" />
        <path d="M 10,-49 A 50,50 0 0,1 10,49 A 34,50 0 0,0 10,-49 Z" fill="#020617" opacity="0.65" />
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

          <!-- Cordillera lejana en el horizonte lunar (Montes Secchi / Apeninos) -->
          <g>
            <path d="M -10,278 Q 80,240 180,248 Q 280,256 380,232 Q 480,210 580,242 Q 680,230 780,215 Q 890,240 1015,268 L 1015,290 L -10,290 Z" fill="#243044" />
            <path d="M -10,282 Q 120,246 250,264 Q 390,238 520,258 Q 660,228 810,256 Q 920,244 1015,274 L 1015,292 L -10,292 Z" fill="#334155" />
          </g>

          <!-- Vasta y plana llanura basáltica del Mar de la Tranquilidad (Apollo 11) -->
          <path d="M -10,274 Q 500,264 1015,274 L 1015,598 L -10,598 Z" fill="#cbd5e1" />
          <polygon points="-10,274 260,260 320,348 -10,362" fill="#d9e2ec" />
          <polygon points="260,260 560,258 630,346 320,348" fill="#e2ebf5" />
          <polygon points="560,258 820,262 890,350 630,346" fill="#d5e0ec" />
          <polygon points="820,262 1015,274 1015,366 890,350" fill="#c3cfde" />

          <!-- Área central de regolito fino ilmenítico para módulo Eagle y Cyberpenguin -->
          <polygon points="-10,362 320,348 250,486 -10,492" fill="#c5d2e0" />
          <polygon points="320,348 630,346 690,478 250,486" fill="#dde6f0" />
          <polygon points="630,346 890,350 1015,366 1015,494 690,478" fill="#cbd7e5" />
          <polygon points="-10,492 250,486 480,598 -10,598" fill="#b0bece" />
          <polygon points="250,486 690,478 760,598 480,598" fill="#bcc9d8" />
          <polygon points="690,478 1015,494 1015,598 760,598" fill="#a6b5c6" />

          <!-- Cráter de impacto con relieve realista (Cráter Little West cercano a Apollo 11) -->
          <g transform="translate(768, 336)">
            <!-- Borde iluminado superior -->
            <ellipse cx="0" cy="0" rx="86" ry="26" fill="#94a3b8" />
            <!-- Interior del cráter en sombra de luz solar rasante -->
            <ellipse cx="-4" cy="4" rx="72" ry="20" fill="#475569" />
            <ellipse cx="-8" cy="6" rx="54" ry="14" fill="#1e293b" />
            <!-- Borde iluminado noreste -->
            <path d="M -86,0 C -50,-24 50,-24 86,0 C 70,-18 -30,-18 -86,0 Z" fill="#f1f5f9" opacity="0.85" />
          </g>

          <!-- Cráter secundario izquierdo con sombra orográfica -->
          <g transform="translate(178, 496)">
            <ellipse cx="0" cy="0" rx="54" ry="18" fill="#94a3b8" />
            <ellipse cx="-3" cy="3" rx="44" ry="14" fill="#475569" />
            <ellipse cx="-6" cy="4" rx="30" ry="9" fill="#1e293b" />
            <path d="M -54,0 C -30,-16 30,-16 54,0 C 40,-12 -20,-12 -54,0 Z" fill="#e2e8f0" opacity="0.8" />
          </g>

          <!-- Pequeño cráter de impacto superior -->
          <g transform="translate(362, 294)">
            <ellipse cx="0" cy="0" rx="32" ry="11" fill="#8898ac" />
            <ellipse cx="-2" cy="2" rx="24" ry="8" fill="#334155" />
            <path d="M -32,0 C -18,-10 18,-10 32,0 C 22,-7 -12,-7 -32,0 Z" fill="#e2e8f0" opacity="0.75" />
          </g>

          <!-- Bloques rocosos de eyección de anortosita e ilmenita -->
          <g>
            <polygon points="104,312 126,288 152,295 162,316 122,320" fill="#8595a8" />
            <polygon points="126,288 152,295 140,317 122,320" fill="#e2e8f0" />
            <polygon points="152,295 162,316 140,317" fill="#475569" />

            <polygon points="222,542 250,516 284,522 294,548 238,554" fill="#718296" />
            <polygon points="250,516 284,522 268,548 238,554" fill="#cbd5e1" />
            <polygon points="284,522 294,548 268,548" fill="#334155" />

            <polygon points="864,440 886,420 910,426 918,446 876,450" fill="#7c8d9e" />
            <polygon points="886,420 910,426 898,446 876,450" fill="#d9e2ec" />
            <polygon points="910,426 918,446 898,446" fill="#3b4859" />
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

        <!-- Cordillera basáltica lejana de Oceanus Procellarum (Montes Riphaeus) -->
        <g>
          <path d="M -10,278 Q 90,208 210,270 Q 330,192 450,264 Q 600,212 740,268 Q 870,202 1015,274 L 1015,290 L -10,290 Z" fill="#202c3e" />
          <path d="M -10,280 Q 96,218 206,274 Q 318,206 446,266 Q 594,222 742,268 Q 868,214 1015,274 L 1015,292 L -10,292 Z" fill="#324259" />
        </g>

        <!-- Cuenca y pendiente interior suave del cráter Surveyor en Oceanus Procellarum -->
        <path d="M -10,274 Q 500,260 1015,276 L 1015,598 L -10,598 Z" fill="#b4c2d4" />
        <polygon points="-10,274 280,256 220,362 -10,352" fill="#c4d1e2" />
        <polygon points="280,256 620,254 550,356 220,362" fill="#cfdcee" />
        <polygon points="620,254 880,262 840,358 550,356" fill="#bfccd9" />
        <polygon points="880,262 1010,276 1010,364 840,358" fill="#a4b3c7" />

        <polygon points="-10,352 220,362 310,492 -10,498" fill="#b3c1d3" />
        <polygon points="220,362 550,356 640,486 310,492" fill="#c7d3e2" />
        <polygon points="550,356 840,358 1010,364 1010,494 640,486" fill="#aebdcb" />

        <polygon points="-10,498 310,492 430,598 -10,598" fill="#98a7bc" />
        <polygon points="310,492 640,486 730,598 430,598" fill="#a8b7ca" />
        <polygon points="640,486 1010,494 1010,598 730,598" fill="#8f9fb4" />

        <!-- Cráter Surveyor (200 m de diámetro) con pendiente suave de regolito -->
        <g transform="translate(226, 332)">
          <ellipse cx="0" cy="0" rx="76" ry="24" fill="#78899f" />
          <ellipse cx="-4" cy="3" rx="62" ry="18" fill="#46556c" />
          <ellipse cx="-8" cy="5" rx="42" ry="12" fill="#1e293b" />
          <path d="M -76,0 C -45,-20 45,-20 76,0 C 58,-14 -28,-14 -76,0 Z" fill="#dce6f2" opacity="0.8" />
        </g>

        <!-- Cráter secundario de impacto sureste -->
        <g transform="translate(804, 488)">
          <ellipse cx="0" cy="0" rx="64" ry="20" fill="#708298" />
          <ellipse cx="-3" cy="3" rx="50" ry="15" fill="#3d4c62" />
          <ellipse cx="-6" cy="4" rx="32" ry="9" fill="#1e293b" />
          <path d="M -64,0 C -36,-16 36,-16 64,0 C 46,-11 -20,-11 -64,0 Z" fill="#cbd7e6" opacity="0.75" />
        </g>

        <!-- Bloques rocosos basálticos de Oceanus Procellarum -->
        <g>
          <polygon points="64,458 98,426 138,434 150,464 82,468" fill="#58677c" />
          <polygon points="98,426 138,434 118,462 82,468" fill="#94a3b8" />
          <polygon points="138,434 150,464 118,462" fill="#3c4959" />

          <polygon points="866,306 898,278 934,284 946,312 886,316" fill="#58677c" />
          <polygon points="898,278 934,284 916,312 886,316" fill="#94a3b8" />
          <polygon points="934,284 946,312 916,312" fill="#3c4959" />
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
