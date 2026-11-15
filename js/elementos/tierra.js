/* =========================================================
   Elemento: La Tierra (estética low-poly)
   Fases de despegue terrestre y salida atmosférica hacia el cosmos.
   ========================================================= */
(function initElementoTierra() {
  const M = (window.CYBERPENGUINS_MODELS = window.CYBERPENGUINS_MODELS || {});

  function travelPhaseTierra(phaseKey) {
    const id = M.uid('trv');

    if (phaseKey === 'earth-liftoff') {
      return `
        <!-- Vista horizontal -->
        <svg class="travel-scene-svg is-landscape" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#050b1c" />
              <stop offset="48%" stop-color="#0f2554" />
              <stop offset="80%" stop-color="#1e56a0" />
              <stop offset="100%" stop-color="#48a8e8" />
            </linearGradient>
            <linearGradient id="${id}-atmo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#60d5ff" stop-opacity="0" />
              <stop offset="100%" stop-color="#7ee8fa" stop-opacity="0.34" />
            </linearGradient>
          </defs>

          <rect width="960" height="540" fill="url(#${id}-sky)" />

          <!-- Estrellas en el cenit -->
          <g fill="#ffffff">
            <circle cx="96" cy="46" r="1.4" opacity="0.88" />
            <circle cx="174" cy="82" r="1.1" opacity="0.72" />
            <circle cx="248" cy="34" r="1.6" opacity="0.92" />
            <circle cx="338" cy="68" r="1.1" opacity="0.76" />
            <circle cx="526" cy="42" r="1.5" opacity="0.86" />
            <circle cx="614" cy="76" r="1.2" opacity="0.74" />
            <circle cx="712" cy="38" r="1.7" opacity="0.92" />
            <circle cx="808" cy="64" r="1.3" opacity="0.82" />
            <polygon points="140,36 142,41 147,43 142,45 140,50 138,45 133,43 138,41" fill="#dbeafe" opacity="0.85" />
            <polygon points="758,92 760,96 764,98 760,100 758,104 756,100 752,98 756,96" fill="#dbeafe" opacity="0.82" />
          </g>

          <path d="M -30,340 Q 480,265 990,340 L 990,375 Q 480,300 -30,375 Z" fill="url(#${id}-atmo)" />

          <!-- Horizonte terrestre que cubre hasta la base -->
          <g class="travel-horizon-drop">
            <path d="M -20,345 Q 480,270 980,345 L 980,560 L -20,560 Z" fill="#174a91" />
            <polygon points="-20,345 150,315 100,560 -20,560" fill="#1e5eb3" />
            <polygon points="150,315 330,295 250,425 100,560" fill="#2876cf" />
            <polygon points="330,295 500,290 420,420 250,425" fill="#328be2" />
            <polygon points="500,290 690,298 620,425 420,420" fill="#266ec7" />
            <polygon points="690,298 860,322 815,560 620,425" fill="#1c56a8" />
            <polygon points="860,322 980,345 980,560 815,560" fill="#16468c" />
            <polygon points="250,425 420,420 340,560 100,560" fill="#1a529e" />
            <polygon points="420,420 620,425 815,560 340,560" fill="#154385" />

            <!-- Continente izquierdo -->
            <polygon points="52,385 150,335 245,360 220,435 112,455" fill="#2f915e" />
            <polygon points="150,335 245,360 280,405 220,435" fill="#46b878" />

            <!-- Continente derecho -->
            <polygon points="670,350 790,328 890,368 850,435 730,428" fill="#37a368" />

            <!-- Península central de lanzamiento -->
            <polygon points="395,375 480,360 570,375 545,445 415,445" fill="#328f61" />
            <polygon points="480,360 570,375 545,445 480,422" fill="#45b075" />

            <!-- Base y torre -->
            <polygon points="445,390 515,390 528,408 432,408" fill="#64748b" />
            <polygon points="452,382 508,382 515,390 445,390" fill="#cbd5e1" />
            <polygon points="452,352 460,352 462,390 448,390" fill="#94a3b8" />
          </g>

          <!-- Nubes de vapor y despegue con curvas suaves en la plataforma -->
          <g opacity="0.88">
            <path d="M 360,410 Q 420,365 480,368 Q 540,370 600,410 Q 560,432 480,430 Q 400,432 360,410 Z" fill="#e2e8f0" opacity="0.85" />
            <path d="M 400,420 Q 450,380 480,382 Q 510,380 560,420 Q 520,436 480,434 Q 440,436 400,420 Z" fill="#ffffff" opacity="0.9" />
          </g>

          <g class="travel-ship-liftoff" transform="translate(410, 102) scale(0.92)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>

        <!-- Vista vertical -->
        <svg class="travel-scene-svg is-portrait" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky-p" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#04091a" />
              <stop offset="30%" stop-color="#0b1e48" />
              <stop offset="60%" stop-color="#194c92" />
              <stop offset="85%" stop-color="#3b9de2" />
              <stop offset="100%" stop-color="#7dd3fc" />
            </linearGradient>
            <linearGradient id="${id}-atmo-p" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#60d5ff" stop-opacity="0" />
              <stop offset="100%" stop-color="#7ee8fa" stop-opacity="0.4" />
            </linearGradient>
          </defs>
          <rect width="540" height="960" fill="url(#${id}-sky-p)" />

          <!-- Estrellas en la parte alta oscura -->
          <g fill="#ffffff">
            <circle cx="68" cy="56" r="1.5" opacity="0.9" />
            <circle cx="164" cy="98" r="1.2" opacity="0.75" />
            <circle cx="270" cy="48" r="1.6" opacity="0.92" />
            <circle cx="390" cy="86" r="1.3" opacity="0.8" />
            <circle cx="482" cy="52" r="1.5" opacity="0.88" />
            <circle cx="112" cy="180" r="1.2" opacity="0.7" />
            <circle cx="438" cy="210" r="1.4" opacity="0.78" />
          </g>

          <!-- Halo atmosférico -->
          <path d="M -20,580 Q 270,520 560,580 L 560,630 Q 270,570 -20,630 Z" fill="url(#${id}-atmo-p)" />

          <!-- Horizonte y superficie que cubre hasta el fondo de la pantalla -->
          <g class="travel-horizon-drop">
            <path d="M -20,590 Q 270,530 560,590 L 560,980 L -20,980 Z" fill="#174a91" />
            <!-- Océano facetado -->
            <polygon points="-20,590 120,560 200,680 -20,720" fill="#1e5eb3" />
            <polygon points="120,560 270,545 320,670 200,680" fill="#2876cf" />
            <polygon points="270,545 420,560 380,675 320,670" fill="#328be2" />
            <polygon points="420,560 560,590 560,720 380,675" fill="#266ec7" />
            <polygon points="-20,720 200,680 380,675 560,720 560,980 -20,980" fill="#154385" />

            <!-- Continente y costa verde -->
            <polygon points="30,640 120,600 210,630 180,710 80,720" fill="#2f915e" />
            <polygon points="120,600 210,630 240,680 180,710" fill="#46b878" />
            <polygon points="360,630 460,610 540,650 510,720 400,710" fill="#37a368" />

            <!-- Península central y torre de lanzamiento -->
            <polygon points="200,660 270,640 340,660 320,740 220,740" fill="#328f61" />
            <polygon points="270,640 340,660 320,740 270,720" fill="#45b075" />
            <polygon points="245,670 295,670 305,688 235,688" fill="#64748b" />
            <polygon points="250,662 290,662 295,670 245,670" fill="#cbd5e1" />
            <polygon points="250,630 258,630 260,662 248,662" fill="#94a3b8" />

            <!-- Nubes de vapor de despegue con curvas suaves -->
            <path d="M 180,684 Q 220,642 270,644 Q 320,642 360,684 Q 330,715 270,712 Q 210,715 180,684 Z" fill="#e2e8f0" opacity="0.85" />
            <path d="M 210,690 Q 240,655 270,656 Q 300,655 330,690 Q 300,716 270,714 Q 240,716 210,690 Z" fill="#ffffff" opacity="0.9" />
          </g>

          <!-- Cohete Cyberpenguin en ascenso vertical -->
          <g class="travel-ship-liftoff" transform="translate(216, 250) scale(1.08)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'atmosphere-exit') {
      return `
        <!-- Vista horizontal -->
        <svg class="travel-scene-svg is-landscape" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-deep" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#020512" />
              <stop offset="55%" stop-color="#07122c" />
              <stop offset="100%" stop-color="#102756" />
            </linearGradient>
            <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#7ce8ff" stop-opacity="0.78" />
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.16" />
            </linearGradient>
          </defs>

          <rect width="960" height="540" fill="url(#${id}-deep)" />

          <g class="travel-stars-drift" fill="#ffffff">
            <circle cx="88" cy="54" r="1.4" opacity="0.9" />
            <circle cx="182" cy="112" r="1.2" opacity="0.72" />
            <circle cx="294" cy="48" r="1.7" opacity="0.94" />
            <circle cx="386" cy="128" r="1.1" opacity="0.76" />
            <circle cx="492" cy="64" r="1.5" opacity="0.86" />
            <circle cx="578" cy="144" r="1.2" opacity="0.78" />
            <circle cx="652" cy="42" r="1.6" opacity="0.9" />
            <circle cx="714" cy="186" r="1.3" opacity="0.74" />
            <circle cx="842" cy="242" r="1.5" opacity="0.84" />
            <circle cx="890" cy="86" r="1.3" opacity="0.82" />
          </g>

          <!-- Luna distante en la esquina superior derecha -->
          <g transform="translate(810, 92)">
            <circle cx="0" cy="0" r="18" fill="#94a3b8" />
            <polygon points="-12,-11 2,-16 14,-6 4,4 -9,1" fill="#e2e8f0" />
            <polygon points="14,-6 16,6 5,16 4,4" fill="#cbd5e1" />
            <polygon points="-9,1 4,4 5,16 -11,12 -16,-2" fill="#64748b" />
          </g>

          <!-- Curvatura de la Tierra con borde atmosférico luminoso -->
          <g>
            <path d="M -80,270 Q 240,190 520,560 L -80,560 Z" fill="url(#${id}-rim)" />
            <path d="M -80,288 Q 230,210 500,560 L -80,560 Z" fill="#1852a4" />
            <polygon points="-80,288 100,265 160,360 -80,400" fill="#2b7be0" />
            <polygon points="100,265 260,300 295,410 160,360" fill="#2167c4" />
            <polygon points="260,300 400,385 410,560 295,410" fill="#1d59ad" />
            <polygon points="-80,400 160,360 295,410 200,560 -80,560" fill="#154791" />
            <polygon points="295,410 410,560 500,560 400,385" fill="#113c7d" />

            <polygon points="20,298 135,276 200,332 158,405 45,388" fill="#359c65" />
            <polygon points="135,276 220,308 200,332" fill="#57cc85" />
            <polygon points="45,388 158,405 186,480 30,468" fill="#25784d" />
            <polygon points="270,370 355,398 375,470 300,458" fill="#3ba96e" />

            <!-- Nubes atmosféricas fluidas con curvas suaves -->
            <path d="M 60,285 Q 120,265 180,282 Q 230,300 200,320 Q 140,305 60,285 Z" fill="#ffffff" opacity="0.75" />
            <path d="M 170,340 Q 250,325 310,358 Q 340,385 280,380 Q 220,360 170,340 Z" fill="#ffffff" opacity="0.72" />
            <path d="M -20,330 Q 50,310 110,340 Q 90,370 20,360 Z" fill="#e0f2fe" opacity="0.65" />
          </g>

          <g class="travel-ship-cruise" transform="translate(440, 138) rotate(36) scale(0.88)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>

        <!-- Vista vertical -->
        <svg class="travel-scene-svg is-portrait" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-deep-p" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#02040e" />
              <stop offset="50%" stop-color="#060f24" />
              <stop offset="100%" stop-color="#0f2658" />
            </linearGradient>
            <linearGradient id="${id}-rim-p" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#7ce8ff" stop-opacity="0.85" />
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="540" height="960" fill="url(#${id}-deep-p)" />

          <!-- Campo estelar cósmico -->
          <g class="travel-stars-drift" fill="#ffffff">
            <circle cx="64" cy="62" r="1.5" opacity="0.9" />
            <circle cx="178" cy="118" r="1.2" opacity="0.75" />
            <circle cx="288" cy="54" r="1.6" opacity="0.92" />
            <circle cx="410" cy="88" r="1.4" opacity="0.8" />
            <circle cx="492" cy="140" r="1.2" opacity="0.7" />
            <circle cx="92" cy="220" r="1.3" opacity="0.75" />
            <circle cx="448" cy="260" r="1.5" opacity="0.85" />
          </g>

          <!-- Luna distante en la esquina superior derecha -->
          <g transform="translate(440, 96)">
            <circle cx="0" cy="0" r="18" fill="#94a3b8" />
            <polygon points="-12,-11 2,-16 14,-6 4,4 -9,1" fill="#e2e8f0" />
            <polygon points="14,-6 16,6 5,16 4,4" fill="#cbd5e1" />
            <polygon points="-9,1 4,4 5,16 -11,12 -16,-2" fill="#64748b" />
          </g>

          <!-- Curvatura de la Tierra que llena toda la mitad inferior de 520 a 960 -->
          <g>
            <path d="M -30,520 Q 270,430 570,520 L 570,980 L -30,980 Z" fill="url(#${id}-rim-p)" />
            <path d="M -30,538 Q 270,452 570,538 L 570,980 L -30,980 Z" fill="#1852a4" />
            <!-- Océano azul cobalto facetado -->
            <polygon points="-30,538 120,505 190,620 -30,660" fill="#2b7be0" />
            <polygon points="120,505 270,480 320,610 190,620" fill="#2167c4" />
            <polygon points="270,480 430,505 390,615 320,610" fill="#1d59ad" />
            <polygon points="430,505 570,538 570,660 390,615" fill="#1852a4" />
            <polygon points="-30,660 190,620 320,610 390,615 570,660 570,980 -30,980" fill="#113c7d" />

            <!-- Continente verde -->
            <polygon points="50,570 150,535 220,580 180,660 70,650" fill="#359c65" />
            <polygon points="150,535 240,565 220,580" fill="#57cc85" />
            <polygon points="340,565 440,545 490,610 430,650 350,630" fill="#3ba96e" />

            <!-- Nubes atmosféricas curvadas y fluidas (sin triángulos toscos) -->
            <path d="M 130,520 Q 185,505 240,522 Q 275,540 230,550 Q 175,536 130,520 Z" fill="#ffffff" opacity="0.75" />
            <path d="M 250,565 Q 310,550 370,580 Q 360,610 290,598 Q 240,585 250,565 Z" fill="#ffffff" opacity="0.72" />
            <path d="M 30,590 Q 90,570 145,595 Q 120,625 50,615 Z" fill="#e0f2fe" opacity="0.65" />
          </g>

          <!-- Nave Cyberpenguin orientada en ascenso orbital -->
          <g class="travel-ship-cruise" transform="translate(230, 240) rotate(28) scale(1.05)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>
      `;
    }

    return '';
  }

  M.travelPhaseTierra = travelPhaseTierra;
})();
