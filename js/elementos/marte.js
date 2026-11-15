/* =========================================================
   Elemento: Marte (estética low-poly)
   Escenarios de Ares Vallis y Chryse Planitia, fases orbitales,
   rocas marcianas y emblema holográfico naranja.
   ========================================================= */
(function initElementoMarte() {
  const M = (window.CYBERPENGUINS_MODELS = window.CYBERPENGUINS_MODELS || {});

  const MARTE_ROCK_STYLE = {
    a: '#fb923c',
    b: '#c2410c',
    c: '#7c2d12',
    glint: '#fde68a',
    soilBack: '#7c2d12',
    soilFront: '#ea580c',
    soilRim: '#9a3412'
  };

  function facetedPhobos(cx, cy, scale) {
    return `
      <g transform="translate(${cx}, ${cy}) scale(${scale})">
        <polygon points="-18,-6 -8,-15 8,-14 19,-4 15,10 -2,14 -15,8" fill="#8b6f63" />
        <polygon points="-8,-15 8,-14 4,0 -11,-3" fill="#c2a799" />
        <polygon points="8,-14 19,-4 15,10 4,0" fill="#a08375" />
        <polygon points="-15,8 4,0 -2,14" fill="#6b5248" />
        <polygon points="-3,-6 3,-7 5,-2 -1,0" fill="#5e473e" />
      </g>
    `;
  }

  function stageBackdropMarte(siteId) {
    const isAresVallis = siteId === 'ares-vallis';
    const id = M.uid('mars');

    if (isAresVallis) {
      // Ares Vallis — Twin Peaks al fondo, cielo terracota-ámbar cálido y planicie de inundación rocosa
      return `
        <svg viewBox="0 0 1000 594" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0d0818" />
              <stop offset="38%" stop-color="#3c1b29" />
              <stop offset="76%" stop-color="#8d382b" />
              <stop offset="100%" stop-color="#df7a47" />
            </linearGradient>
          </defs>

          <!-- Cielo marciano crepuscular -->
          <rect width="1000" height="594" fill="url(#${id}-sky)" />

          <!-- Estrellas tenues en lo alto del cielo (sin cruzar montes ni lunas) -->
          <g fill="#fde68a">
            <circle cx="88" cy="42" r="1.3" opacity="0.72" />
            <circle cx="194" cy="76" r="1.1" opacity="0.62" />
            <circle cx="318" cy="36" r="1.4" opacity="0.76" />
            <circle cx="526" cy="54" r="1.2" opacity="0.66" />
            <circle cx="648" cy="34" r="1.5" opacity="0.78" />
            <circle cx="876" cy="48" r="1.3" opacity="0.72" />
          </g>

          <!-- Fobos pequeño (~1/3 del diámetro aparente lunar, con cráter Stickney) y Deimos puntual casi estelar -->
          ${facetedPhobos(746, 86, 0.52)}
          <g transform="translate(184, 118)">
            <circle cx="0" cy="0" r="4.2" fill="#fed7aa" opacity="0.26" />
            <circle cx="0" cy="0" r="2.0" fill="#fed7aa" />
          </g>

          <!-- Cadenas montañosas lejanas y Twin Peaks de Ares Vallis low-poly -->
          <g>
            <!-- Meseta lejana izquierda -->
            <polygon points="-10,276 110,218 220,224 316,272" fill="#6b2920" />
            <polygon points="110,218 220,224 196,274 92,276" fill="#9a412d" />
            <!-- Twin Peaks clásicos en el cuadrante derecho -->
            <polygon points="480,274 584,186 648,192 718,266" fill="#7c2e22" />
            <polygon points="584,186 648,192 628,270 554,272" fill="#ba5335" />
            <polygon points="690,268 784,174 854,182 968,272" fill="#742b20" />
            <polygon points="784,174 854,182 826,272 746,270" fill="#c95e3c" />
            <polygon points="854,182 968,272 1015,274 1015,254 934,232" fill="#61231b" />
          </g>

          <!-- Llanura aluvial marciana compuesta por polígonos low-poly terracota/ocre -->
          <polygon points="-10,272 280,256 610,254 880,260 1010,274 1010,598 -10,598" fill="#c25632" />
          <polygon points="-10,272 280,256 218,358 -10,348" fill="#d96b3d" />
          <polygon points="280,256 610,254 574,354 218,358" fill="#e57c47" />
          <polygon points="610,254 880,260 854,358 574,354" fill="#d16238" />
          <polygon points="880,260 1010,274 1010,362 854,358" fill="#b64d2c" />

          <!-- Zona media iluminada para cyberpingüino, nave y Sojourner -->
          <polygon points="-10,348 218,358 310,492 -10,498" fill="#cb5e36" />
          <polygon points="218,358 574,354 662,486 310,492" fill="#dc7041" />
          <polygon points="574,354 854,358 1010,362 1010,496 662,486" fill="#c15430" />

          <!-- Primer plano sombreado -->
          <polygon points="-10,498 310,492 438,598 -10,598" fill="#a84326" />
          <polygon points="310,492 662,486 756,598 438,598" fill="#b74e2d" />
          <polygon points="662,486 1010,496 1010,598 756,598" fill="#9a3a20" />

          <!-- Cuencas de impacto someras -->
          <g transform="translate(806, 336)">
            <polygon points="-70,-6 -28,-22 30,-20 72,-4 52,16 -4,20 -56,12" fill="#a64225" />
            <polygon points="-50,-2 -18,-13 22,-12 52,-1 34,10 -4,12 -38,6" fill="#7c2d17" />
          </g>

          <!-- Rocas angulares low-poly estilo diapositiva 4 -->
          <g>
            <polygon points="82,312 114,282 148,290 158,316 98,320" fill="#8f361d" />
            <polygon points="114,282 148,290 132,318 98,320" fill="#df7141" />
            <polygon points="148,290 158,316 132,318" fill="#6b2613" />

            <polygon points="736,522 770,486 808,494 824,524 752,530" fill="#8f361d" />
            <polygon points="770,486 808,494 790,524 752,530" fill="#d96b3d" />
            <polygon points="808,494 824,524 790,524" fill="#652312" />

            <polygon points="132,536 164,512 198,520 206,544 148,548" fill="#87331b" />
            <polygon points="164,512 198,520 182,544 148,548" fill="#cf6137" />
          </g>
        </svg>
      `;
    }

    // Chryse Planitia — llanura dorada-ocre de Viking 1 con dunas facetadas y escarpes
    return `
      <svg viewBox="0 0 1000 594" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b091a" />
            <stop offset="40%" stop-color="#402026" />
            <stop offset="76%" stop-color="#9e4c2e" />
            <stop offset="100%" stop-color="#ea9a57" />
          </linearGradient>
        </defs>

        <rect width="1000" height="594" fill="url(#${id}-sky)" />

        <!-- Estrellas en el cielo alto -->
        <g fill="#fef3c7">
          <circle cx="116" cy="48" r="1.4" opacity="0.76" />
          <circle cx="242" cy="84" r="1.1" opacity="0.62" />
          <circle cx="384" cy="42" r="1.5" opacity="0.78" />
          <circle cx="568" cy="64" r="1.2" opacity="0.68" />
          <circle cx="712" cy="40" r="1.5" opacity="0.76" />
          <circle cx="888" cy="74" r="1.3" opacity="0.72" />
        </g>

        <!-- Fobos solitario sobre Chryse Planitia (escala aparente realista) -->
        ${facetedPhobos(236, 94, 0.48)}

        <!-- Escarpes amesetados ocre/óxido en el horizonte -->
        <g>
          <polygon points="-10,276 154,224 310,272" fill="#7c351e" />
          <polygon points="154,224 310,272 212,276" fill="#b45630" />
          <polygon points="270,272 444,234 612,270" fill="#702f1b" />
          <polygon points="444,234 612,270 492,274" fill="#a84e2a" />
          <polygon points="578,270 760,214 912,232 1015,274" fill="#7d361f" />
          <polygon points="760,214 912,232 874,274 714,272" fill="#c46235" />
        </g>

        <!-- Planicie dorada-óxido de Chryse Planitia (facetas low-poly) -->
        <polygon points="-10,272 260,258 580,254 840,260 1010,274 1010,598 -10,598" fill="#d16c3c" />
        <polygon points="-10,272 260,258 290,356 -10,352" fill="#df7d48" />
        <polygon points="260,258 580,254 608,354 290,356" fill="#eb8d53" />
        <polygon points="580,254 840,260 886,356 608,354" fill="#dc7743" />
        <polygon points="840,260 1010,274 1010,362 886,356" fill="#c15e32" />

        <polygon points="-10,352 290,356 244,488 -10,496" fill="#cf6a39" />
        <polygon points="290,356 608,354 670,486 244,488" fill="#e27f48" />
        <polygon points="608,354 886,356 1010,362 1010,494 670,486" fill="#c96436" />

        <polygon points="-10,496 244,488 456,598 -10,598" fill="#b44f29" />
        <polygon points="244,488 670,486 764,598 456,598" fill="#c2592f" />
        <polygon points="670,486 1010,494 1010,598 764,598" fill="#a34321" />

        <!-- Cráter somero izquierdo -->
        <g transform="translate(178, 344)">
          <polygon points="-66,-6 -24,-22 30,-20 68,-4 46,18 -6,22 -52,14" fill="#b54f2a" />
          <polygon points="-46,-3 -16,-14 22,-13 48,-1 30,11 -4,14 -34,8" fill="#843318" />
        </g>

        <!-- Rocas basálticas en bordes -->
        <g>
          <polygon points="844,298 878,270 914,276 928,302 862,306" fill="#8f361d" />
          <polygon points="878,270 914,276 896,304 862,306" fill="#df7a47" />
          <polygon points="240,540 272,512 312,518 324,548 256,552" fill="#843318" />
          <polygon points="272,512 312,518 294,548 256,552" fill="#d36b3b" />
        </g>
      </svg>
    `;
  }

  function travelPhaseMarte(phaseKey) {
    const id = M.uid('mrv');

    if (phaseKey === 'mars-arrival') {
      return `
        <!-- Vista horizontal -->
        <svg class="travel-scene-svg is-landscape" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#080514" />
              <stop offset="60%" stop-color="#2c1322" />
              <stop offset="100%" stop-color="#7c2e22" />
            </linearGradient>
          </defs>
          <rect width="960" height="540" fill="url(#${id}-sky)" />
          <g class="travel-stars-drift" fill="#fef3c7">
            <circle cx="96" cy="48" r="1.4" opacity="0.82" />
            <circle cx="212" cy="84" r="1.1" opacity="0.68" />
            <circle cx="348" cy="42" r="1.5" opacity="0.86" />
            <circle cx="628" cy="64" r="1.4" opacity="0.8" />
            <circle cx="776" cy="48" r="1.5" opacity="0.88" />
          </g>

          ${facetedPhobos(790, 102, 1.0)}

          <!-- Horizonte curvo marciano low-poly hasta la base -->
          <g class="travel-planet-approach">
            <path d="M -30,340 Q 480,248 990,340 L 990,560 L -30,560 Z" fill="#c25632" />
            <polygon points="-30,340 200,295 285,425 -30,460" fill="#df7141" />
            <polygon points="200,295 480,278 525,418 285,425" fill="#ea8850" />
            <polygon points="480,278 750,298 720,425 525,418" fill="#d16238" />
            <polygon points="750,298 990,340 990,460 720,425" fill="#ab4628" />
            <polygon points="-30,460 285,425 525,418 720,425 990,460 990,560 -30,560" fill="#89321b" />
            <polygon points="325,365 445,342 560,370 510,420 375,420" fill="#9a3a20" />
            <polygon points="635,385 725,366 795,390 760,426 665,426" fill="#89321b" />
          </g>

          <g class="travel-ship-descent" transform="translate(410, 78) scale(0.92)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>

        <!-- Vista vertical -->
        <svg class="travel-scene-svg is-portrait" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky-p" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#070412" />
              <stop offset="45%" stop-color="#220e1c" />
              <stop offset="75%" stop-color="#5a1d17" />
              <stop offset="100%" stop-color="#993822" />
            </linearGradient>
          </defs>
          <rect width="540" height="960" fill="url(#${id}-sky-p)" />

          <!-- Estrellas en el cielo marciano -->
          <g class="travel-stars-drift" fill="#fef3c7">
            <circle cx="68" cy="64" r="1.5" opacity="0.85" />
            <circle cx="178" cy="112" r="1.2" opacity="0.7" />
            <circle cx="290" cy="52" r="1.6" opacity="0.9" />
            <circle cx="396" cy="88" r="1.3" opacity="0.75" />
            <circle cx="82" cy="220" r="1.2" opacity="0.7" />
            <circle cx="454" cy="240" r="1.4" opacity="0.8" />
          </g>

          ${facetedPhobos(420, 118, 1.15)}

          <g class="travel-ship-descent" transform="translate(216, 200) scale(1.08)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>

          <!-- Gran superficie marciana cubriendo de 490 a 980 -->
          <g class="travel-planet-approach">
            <path d="M -20,500 Q 270,430 560,500 L 560,980 L -20,980 Z" fill="#89321b" />
            <polygon points="-20,500 120,470 190,580 -20,610" fill="#df7141" />
            <polygon points="120,470 270,450 330,575 190,580" fill="#ea8850" />
            <polygon points="270,450 430,475 390,580 330,575" fill="#d16238" />
            <polygon points="430,475 560,500 560,610 390,580" fill="#ab4628" />
            <polygon points="-20,610 190,580 330,575 390,580 560,610 560,740 -20,740" fill="#a03c20" />
            <polygon points="-20,740 160,715 310,735 460,710 560,740 560,980 -20,980" fill="#782914" />

            <!-- Grieta tipo cañón Valles Marineris y cráter -->
            <polygon points="90,640 240,625 360,650 280,680 150,670" fill="#581a0c" />
            <g transform="translate(180, 580)">
              <polygon points="-42,-6 -18,-15 20,-14 42,-4 30,12 -6,15 -34,9" fill="#9a3a20" />
              <polygon points="-28,-2 -12,-9 14,-8 28,-1 18,7 -4,9 -22,5" fill="#581a0c" />
            </g>
            <g transform="translate(390, 560)">
              <polygon points="-50,-6 -22,-18 24,-16 50,-4 36,13 -6,17 -40,10" fill="#9a3a20" />
              <polygon points="-34,-2 -14,-11 16,-10 34,-1 24,8 -4,11 -26,6" fill="#581a0c" />
            </g>
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'mars-liftoff') {
      return `
        <!-- Vista horizontal -->
        <svg class="travel-scene-svg is-landscape" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#090616" />
              <stop offset="58%" stop-color="#361826" />
              <stop offset="100%" stop-color="#9e412c" />
            </linearGradient>
          </defs>
          <rect width="960" height="540" fill="url(#${id}-sky)" />
          <g fill="#fde68a">
            <circle cx="88" cy="52" r="1.4" opacity="0.82" />
            <circle cx="248" cy="42" r="1.5" opacity="0.86" />
            <circle cx="642" cy="58" r="1.4" opacity="0.8" />
            <circle cx="808" cy="46" r="1.6" opacity="0.88" />
          </g>

          <!-- Mesas Twin Peaks y suelo marciano completo -->
          <g class="travel-horizon-drop">
            <polygon points="-20,350 150,295 300,340 640,335 790,288 980,352 980,560 -20,560" fill="#a84326" />
            <polygon points="-20,350 150,295 240,440 -20,480" fill="#cf6137" />
            <polygon points="300,340 640,335 620,450 240,440" fill="#e27a46" />
            <polygon points="790,288 980,352 980,560 620,450" fill="#b84d2c" />
            <polygon points="-20,480 240,440 620,450 980,560 -20,560" fill="#89321b" />
          </g>

          <g opacity="0.75">
            <polygon points="380,400 480,385 580,400 535,420 425,420" fill="#e27a46" opacity="0.65" />
          </g>

          <g class="travel-ship-liftoff" transform="translate(410, 96) scale(0.92)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>

        <!-- Vista vertical -->
        <svg class="travel-scene-svg is-portrait" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky-lp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#080514" />
              <stop offset="40%" stop-color="#2a1222" />
              <stop offset="80%" stop-color="#7a2a1a" />
              <stop offset="100%" stop-color="#b84a2d" />
            </linearGradient>
          </defs>
          <rect width="540" height="960" fill="url(#${id}-sky-lp)" />
          <g fill="#fde68a">
            <circle cx="68" cy="64" r="1.5" opacity="0.85" />
            <circle cx="180" cy="50" r="1.2" opacity="0.7" />
            <circle cx="360" cy="74" r="1.5" opacity="0.88" />
            <circle cx="470" cy="110" r="1.4" opacity="0.8" />
          </g>

          <g class="travel-ship-liftoff" transform="translate(216, 250) scale(1.08)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>

          <!-- Suelo marciano y mesas inferiores completas -->
          <g class="travel-horizon-drop">
            <polygon points="-20,540 110,490 220,530 380,520 480,475 560,540 560,980 -20,980" fill="#a84326" />
            <polygon points="-20,540 110,490 190,620 -20,660" fill="#cf6137" />
            <polygon points="220,530 380,520 360,630 190,620" fill="#e27a46" />
            <polygon points="480,475 560,540 560,660 360,630" fill="#b84d2c" />
            <polygon points="-20,660 190,620 360,630 560,660 560,980 -20,980" fill="#89321b" />
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'mars-suborbital') {
      return `
        <!-- Vista horizontal -->
        <svg class="travel-scene-svg is-landscape" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#070411" />
              <stop offset="100%" stop-color="#2c1220" />
            </linearGradient>
          </defs>
          <rect width="960" height="540" fill="url(#${id}-sky)" />
          <g class="travel-stars-warp" fill="#fef3c7">
            <circle cx="96" cy="52" r="1.4" opacity="0.86" />
            <circle cx="234" cy="96" r="1.2" opacity="0.72" />
            <circle cx="386" cy="48" r="1.6" opacity="0.9" />
            <circle cx="578" cy="72" r="1.3" opacity="0.78" />
            <circle cx="764" cy="54" r="1.5" opacity="0.88" />
          </g>

          ${facetedPhobos(176, 96, 0.95)}

          <g>
            <path d="M -40,370 Q 480,248 1000,370 L 1000,560 L -40,560 Z" fill="#c25632" />
            <polygon points="-40,370 250,305 340,480 -40,480" fill="#df7141" />
            <polygon points="250,305 540,290 570,480 340,480" fill="#eb8a52" />
            <polygon points="540,290 800,315 765,480 570,480" fill="#cf6238" />
            <polygon points="800,315 1000,370 1000,480 765,480" fill="#a84326" />
            <polygon points="-40,480 340,480 570,480 765,480 1000,480 1000,560 -40,560" fill="#802e17" />
            <polygon points="384,370 466,350 526,375 490,406 402,406" fill="#8f361d" />
          </g>

          <g class="travel-ship-cruise" transform="translate(498, 100) rotate(72) scale(0.82)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>

        <!-- Vista vertical -->
        <svg class="travel-scene-svg is-portrait" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky-sop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#06030e" />
              <stop offset="100%" stop-color="#240c19" />
            </linearGradient>
          </defs>
          <rect width="540" height="960" fill="url(#${id}-sky-sop)" />
          <g class="travel-stars-warp" fill="#fef3c7">
            <circle cx="68" cy="62" r="1.5" opacity="0.88" />
            <circle cx="180" cy="112" r="1.2" opacity="0.75" />
            <circle cx="340" cy="50" r="1.6" opacity="0.9" />
            <circle cx="468" cy="94" r="1.3" opacity="0.8" />
          </g>

          ${facetedPhobos(128, 120, 1.05)}

          <g class="travel-ship-cruise" transform="translate(270, 240) rotate(60) scale(0.95)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>

          <g>
            <path d="M -20,520 Q 270,450 560,520 L 560,980 L -20,980 Z" fill="#c25632" />
            <polygon points="-20,520 140,480 220,620 -20,650" fill="#df7141" />
            <polygon points="140,480 380,470 340,620 220,620" fill="#eb8a52" />
            <polygon points="380,470 560,520 560,650 340,620" fill="#cf6238" />
            <polygon points="-20,650 220,620 340,620 560,650 560,980 -20,980" fill="#802e17" />
          </g>
        </svg>
      `;
    }

    return '';
  }

  function sampleCrystalMarte(variant = 0) {
    return M.renderRockSample(MARTE_ROCK_STYLE, variant);
  }

  // Emblema diapositiva 2: Marte low-poly sobre anillos holográficos naranja
  function emblemMarte() {
    const id = M.uid('emars');
    return `
      <svg viewBox="0 0 80 80" width="54" height="54" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fb923c" stop-opacity="0.06" />
            <stop offset="100%" stop-color="#f97316" stop-opacity="0.5" />
          </linearGradient>
        </defs>

        <!-- Haz vertical y anillos holográficos naranjas en la base -->
        <polygon points="22,38 58,38 68,66 12,66" fill="url(#${id}-beam)" />
        <ellipse cx="40" cy="66" rx="28" ry="8.5" fill="#c2410c" fill-opacity="0.28" stroke="#fb923c" stroke-width="2" />
        <ellipse cx="40" cy="66" rx="19" ry="5.5" fill="none" stroke="#fed7aa" stroke-width="1.3" opacity="0.9" />
        <ellipse cx="40" cy="66" rx="9" ry="2.6" fill="#fdba74" opacity="0.88" />

        <!-- Esfera marciana low-poly facetada -->
        <g transform="translate(40, 29)">
          <circle cx="0" cy="0" r="20" fill="#9a3412" />
          <polygon points="-16,-12 0,-20 14,-13 4,-1 -12,-2" fill="#fb923c" />
          <polygon points="14,-13 20,2 10,16 4,-1" fill="#ea580c" />
          <polygon points="-20,1 -12,-2 4,-1 -2,16 -16,12" fill="#f05432" />
          <polygon points="-2,16 4,-1 10,16 -4,20" fill="#9a3412" />
          <polygon points="-16,12 -2,16 -4,20 -13,16" fill="#7c2d12" />
          <!-- Casquete polar norte y cañones angulares -->
          <polygon points="-6,-19 0,-20 6,-19 2,-14 -3,-14" fill="#ffedd5" opacity="0.92" />
          <polygon points="-10,1 -2,0 3,5 -6,7 -12,4" fill="#7c2d12" opacity="0.78" />
          <polygon points="5,-6 12,-4 10,3 3,1" fill="#c2410c" opacity="0.82" />
        </g>
      </svg>
    `;
  }

  M.stageBackdropMarte = stageBackdropMarte;
  M.travelPhaseMarte = travelPhaseMarte;
  M.sampleCrystalMarte = sampleCrystalMarte;
  M.emblemMarte = emblemMarte;
})();
