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
        <svg class="travel-scene-svg" viewBox="0 0 900 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
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

          <rect width="900" height="440" fill="url(#${id}-sky)" />

          <!-- Estrellas en el cenit (solo sobre el cielo oscuro) -->
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

          <!-- Halo atmosférico sobre el horizonte curvado -->
          <path d="M -30,318 Q 450,248 930,318 L 930,348 Q 450,278 -30,348 Z" fill="url(#${id}-atmo)" />

          <!-- Horizonte terrestre low-poly: océanos y continentes facetados -->
          <g class="travel-horizon-drop">
            <path d="M -20,322 Q 450,254 920,322 L 920,452 L -20,452 Z" fill="#174a91" />
            <!-- Facetas oceánicas -->
            <polygon points="-20,322 140,295 95,452 -20,452" fill="#1e5eb3" />
            <polygon points="140,295 310,276 235,392 95,452" fill="#2876cf" />
            <polygon points="310,276 470,271 395,388 235,392" fill="#328be2" />
            <polygon points="470,271 650,279 585,394 395,388" fill="#266ec7" />
            <polygon points="650,279 810,301 765,452 585,394" fill="#1c56a8" />
            <polygon points="810,301 920,322 920,452 765,452" fill="#16468c" />
            <polygon points="235,392 395,388 320,452 95,452" fill="#1a529e" />
            <polygon points="395,388 585,394 765,452 320,452" fill="#154385" />

            <!-- Continente izquierdo low-poly (esmeralda/jade) -->
            <polygon points="48,358 142,314 232,336 208,402 106,422" fill="#2f915e" />
            <polygon points="142,314 232,336 266,374 208,402" fill="#46b878" />
            <polygon points="48,358 106,422 42,444 12,396" fill="#237249" />
            <polygon points="106,422 208,402 252,448 84,452" fill="#277b4f" />

            <!-- Continente derecho low-poly (costa verde y relieve cálido) -->
            <polygon points="630,326 742,306 838,342 798,404 684,398" fill="#37a368" />
            <polygon points="630,326 684,398 594,424 574,368" fill="#267b4d" />
            <polygon points="742,306 838,342 874,398 798,404" fill="#52c782" />
            <polygon points="712,344 776,340 760,376 704,370" fill="#a8c96f" opacity="0.72" />

            <!-- Península central de lanzamiento -->
            <polygon points="370,350 450,336 532,350 512,418 388,418" fill="#328f61" />
            <polygon points="450,336 532,350 512,418 450,394" fill="#45b075" />

            <!-- Base espacial geométrica sobre la península -->
            <polygon points="418,364 482,364 494,380 406,380" fill="#64748b" />
            <polygon points="424,356 476,356 482,364 418,364" fill="#cbd5e1" />
            <polygon points="424,328 432,328 434,364 420,364" fill="#94a3b8" />

            <!-- Cuñas geométricas de nubes blancas low-poly -->
            <polygon points="178,308 258,298 286,314 206,322" fill="#e6f4ff" opacity="0.75" />
            <polygon points="562,310 644,296 672,312 586,322" fill="#ffffff" opacity="0.68" />
          </g>

          <!-- Nubes de vapor y deflexión horizontal de escape en la plataforma de lanzamiento -->
          <g opacity="0.88">
            <polygon points="360,372 450,344 540,372 505,394 395,394" fill="#e2e8f0" opacity="0.85" />
            <polygon points="330,376 410,358 435,386 355,396" fill="#cbd5e1" opacity="0.75" />
            <polygon points="465,358 570,376 545,396 480,386" fill="#cbd5e1" opacity="0.75" />
          </g>

          <!-- Cohete Cyberpenguin despegando -->
          <g class="travel-ship-liftoff" transform="translate(384, 92) scale(0.9)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'atmosphere-exit') {
      return `
        <svg class="travel-scene-svg" viewBox="0 0 900 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
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

          <rect width="900" height="440" fill="url(#${id}-deep)" />

          <!-- Campo estelar espacial (sin estrellas sobre el globo) -->
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
            <circle cx="788" cy="336" r="1.2" opacity="0.72" />
            <circle cx="624" cy="368" r="1.4" opacity="0.8" />
            <polygon points="440,30 442,35 447,37 442,39 440,44 438,39 433,37 438,35" fill="#bae6fd" />
            <polygon points="688,108 690,112 694,114 690,116 688,120 686,116 682,114 686,112" fill="#fde68a" />
          </g>

          <!-- Luna distante facetada a escala angular realista (r = 16) en la esquina superior derecha -->
          <g transform="translate(766, 86)">
            <circle cx="0" cy="0" r="16" fill="#94a3b8" />
            <polygon points="-11.3,-10.3 1.9,-15.5 13.2,-5.6 3.8,3.8 -8.5,0.9" fill="#e2e8f0" />
            <polygon points="13.2,-5.6 15.5,5.6 4.7,15.1 3.8,3.8" fill="#cbd5e1" />
            <polygon points="-8.5,0.9 3.8,3.8 4.7,15.1 -10.3,11.3 -15.5,-1.9" fill="#64748b" />
            <polygon points="-2.8,-4.7 3.8,-6.6 6.6,-0.9 0.9,2.8" fill="#94a3b8" opacity="0.75" />
            <polygon points="-7.5,5.6 -1.9,4.7 0,10.3 -6.6,10.3" fill="#475569" opacity="0.7" />
          </g>

          <!-- Arco terrestre low-poly (océanos cobalto, continentes verdes, borde luminoso) -->
          <g>
            <path d="M -80,236 Q 210,164 468,452 L -80,452 Z" fill="url(#${id}-rim)" />
            <path d="M -80,254 Q 204,184 446,452 L -80,452 Z" fill="#1852a4" />
            <!-- Facetas oceánicas -->
            <polygon points="-80,254 90,232 146,320 -80,356" fill="#2b7be0" />
            <polygon points="90,232 238,266 268,368 146,320" fill="#2167c4" />
            <polygon points="238,266 364,344 374,452 268,368" fill="#1d59ad" />
            <polygon points="-80,356 146,320 268,368 176,452 -80,452" fill="#154791" />
            <polygon points="268,368 374,452 446,452 364,344" fill="#113c7d" />

            <!-- Continente verde facetado -->
            <polygon points="14,264 118,244 178,296 140,364 36,348" fill="#359c65" />
            <polygon points="118,244 198,274 178,296" fill="#57cc85" />
            <polygon points="36,348 140,364 166,434 24,422" fill="#25784d" />
            <polygon points="246,332 324,358 342,424 274,412" fill="#3ba96e" />
            <polygon points="78,292 136,284 146,322 92,326" fill="#a5c96e" opacity="0.65" />

            <!-- Nubes angulares sobre la curvatura -->
            <polygon points="148,248 214,264 204,280 136,262" fill="#ffffff" opacity="0.72" />
            <polygon points="256,310 318,342 296,352 242,324" fill="#e0f2fe" opacity="0.68" />
          </g>

          <!-- Cohete Cyberpenguin escapando de la atmósfera -->
          <g class="travel-ship-cruise" transform="translate(412, 128) rotate(36) scale(0.84)">
            ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
          </g>
        </svg>
      `;
    }

    return '';
  }

  M.travelPhaseTierra = travelPhaseTierra;
})();
