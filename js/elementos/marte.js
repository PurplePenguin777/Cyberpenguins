/* =========================================================
   Elemento: Marte (estética low-poly Canva)
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
        <svg class="travel-scene-svg" viewBox="0 0 900 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#080514" />
              <stop offset="60%" stop-color="#2c1322" />
              <stop offset="100%" stop-color="#7c2e22" />
            </linearGradient>
          </defs>
          <rect width="900" height="440" fill="url(#${id}-sky)" />
          <g class="travel-stars-drift" fill="#fef3c7">
            <circle cx="96" cy="48" r="1.4" opacity="0.82" />
            <circle cx="212" cy="84" r="1.1" opacity="0.68" />
            <circle cx="348" cy="42" r="1.5" opacity="0.86" />
            <circle cx="628" cy="64" r="1.4" opacity="0.8" />
            <circle cx="776" cy="48" r="1.5" opacity="0.88" />
          </g>

          ${facetedPhobos(762, 102, 1.0)}

          <!-- Horizonte curvo marciano low-poly -->
          <g class="travel-planet-approach">
            <path d="M -30,308 Q 450,224 930,308 L 930,454 L -30,454 Z" fill="#c25632" />
            <polygon points="-30,308 190,268 270,390 -30,420" fill="#df7141" />
            <polygon points="190,268 460,252 500,382 270,390" fill="#ea8850" />
            <polygon points="460,252 720,270 690,390 500,382" fill="#d16238" />
            <polygon points="720,270 930,308 930,420 690,390" fill="#ab4628" />
            <polygon points="310,336 424,316 532,340 486,386 356,386" fill="#9a3a20" />
            <polygon points="602,356 688,338 756,360 720,394 630,394" fill="#89321b" />
          </g>

          <g class="travel-ship-descent" transform="translate(384, 70) scale(0.86)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'mars-liftoff') {
      return `
        <svg class="travel-scene-svg" viewBox="0 0 900 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#090616" />
              <stop offset="58%" stop-color="#361826" />
              <stop offset="100%" stop-color="#9e412c" />
            </linearGradient>
          </defs>
          <rect width="900" height="440" fill="url(#${id}-sky)" />
          <g fill="#fde68a">
            <circle cx="88" cy="52" r="1.4" opacity="0.82" />
            <circle cx="248" cy="42" r="1.5" opacity="0.86" />
            <circle cx="642" cy="58" r="1.4" opacity="0.8" />
            <circle cx="808" cy="46" r="1.6" opacity="0.88" />
          </g>

          <!-- Mesas Twin Peaks y suelo marciano -->
          <g class="travel-horizon-drop">
            <polygon points="-20,334 140,282 280,322 610,318 754,274 920,336 920,452 -20,452" fill="#a84326" />
            <polygon points="-20,334 140,282 230,420 -20,452" fill="#cf6137" />
            <polygon points="280,322 610,318 590,428 230,420" fill="#e27a46" />
            <polygon points="754,274 920,336 920,452 590,428" fill="#b84d2c" />
          </g>

          <!-- Expansión radial de polvo marciano a ras de suelo en el despegue -->
          <g opacity="0.75">
            <polygon points="360,374 450,360 540,374 500,392 400,392" fill="#e27a46" opacity="0.65" />
          </g>

          <g class="travel-ship-liftoff" transform="translate(384, 88) scale(0.88)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'mars-suborbital') {
      return `
        <svg class="travel-scene-svg" viewBox="0 0 900 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#070411" />
              <stop offset="100%" stop-color="#2c1220" />
            </linearGradient>
          </defs>
          <rect width="900" height="440" fill="url(#${id}-sky)" />
          <g class="travel-stars-warp" fill="#fef3c7">
            <circle cx="96" cy="52" r="1.4" opacity="0.86" />
            <circle cx="234" cy="96" r="1.2" opacity="0.72" />
            <circle cx="386" cy="48" r="1.6" opacity="0.9" />
            <circle cx="578" cy="72" r="1.3" opacity="0.78" />
            <circle cx="764" cy="54" r="1.5" opacity="0.88" />
          </g>

          ${facetedPhobos(164, 92, 0.9)}

          <g>
            <path d="M -40,352 Q 450,234 940,352 L 940,456 L -40,456 Z" fill="#c25632" />
            <polygon points="-40,352 240,288 320,456 -40,456" fill="#df7141" />
            <polygon points="240,288 520,276 550,456 320,456" fill="#eb8a52" />
            <polygon points="520,276 760,298 730,456 550,456" fill="#cf6238" />
            <polygon points="760,298 940,352 940,456 730,456" fill="#a84326" />
            <polygon points="368,354 446,334 504,358 470,388 386,388" fill="#8f361d" />
          </g>

          <g class="travel-ship-cruise" transform="translate(468, 92) rotate(72) scale(0.76)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
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
