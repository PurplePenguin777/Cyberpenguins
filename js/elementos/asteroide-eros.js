/* =========================================================
   Elemento: Asteroide 433 Eros (precisión científica + low-poly)
   Asteroide solitario cercano a la Tierra (grupo Amor), con su característica
   depresión en silla de montar (Himeros) y cielo negro espacial limpio.
   ========================================================= */
(function initElementoAsteroideEros() {
  const M = (window.CYBERPENGUINS_MODELS = window.CYBERPENGUINS_MODELS || {});

  function stageBackdropAsteroideEros() {
    const id = M.uid('eros');
    return `
      <svg viewBox="0 0 1000 594" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#02040a" />
            <stop offset="65%" stop-color="#040814" />
            <stop offset="100%" stop-color="#0a1224" />
          </linearGradient>
        </defs>

        <!-- Cielo negro espacial vacío alrededor del asteroide solitario 433 Eros -->
        <rect width="1000" height="594" fill="url(#${id}-sky)" />

        <!-- Estrellas únicamente en el cielo abierto exterior (nunca sobre la superficie del asteroide) -->
        <g fill="#ffffff">
          <circle cx="54" cy="48" r="1.4" opacity="0.86" />
          <circle cx="132" cy="84" r="1.2" opacity="0.72" />
          <circle cx="218" cy="42" r="1.6" opacity="0.9" />
          <circle cx="348" cy="64" r="1.3" opacity="0.76" />
          <circle cx="486" cy="44" r="1.5" opacity="0.84" />
          <circle cx="642" cy="52" r="1.4" opacity="0.82" />
          <circle cx="788" cy="42" r="1.6" opacity="0.88" />
          <circle cx="924" cy="76" r="1.3" opacity="0.78" />
          <circle cx="72" cy="212" r="1.2" opacity="0.74" />
          <circle cx="946" cy="224" r="1.2" opacity="0.74" />
          <circle cx="932" cy="542" r="1.4" opacity="0.76" />
          <circle cx="68" cy="554" r="1.3" opacity="0.74" />
        </g>

        <!-- Superficie curvada alargada de 433 Eros con la depresión central Himeros en silla de montar -->
        <g>
          <path d="M 38,392 Q 92,306 232,272 Q 390,248 504,268 Q 618,284 748,266 L 836,278 Q 934,308 968,404 L 948,546 L 62,548 Z" fill="#475569" />

          <!-- Facetas superiores iluminadas marcando el contorno en silla de montar (Himeros) -->
          <polygon points="38,392 146,294 284,264 316,356 126,388" fill="#94a3b8" />
          <polygon points="284,264 468,256 504,344 316,356" fill="#cbd5e1" />
          <polygon points="468,256 678,270 694,352 504,344" fill="#a8b7c9" />
          <polygon points="678,270 854,284 952,374 694,352" fill="#94a3b8" />

          <!-- Facetas medias de regolito silicatado -->
          <polygon points="38,392 126,388 316,356 268,474 72,492" fill="#7c8b9e" />
          <polygon points="316,356 504,344 522,468 268,474" fill="#a2b1c4" />
          <polygon points="504,344 694,352 728,470 522,468" fill="#8b9bae" />
          <polygon points="694,352 952,374 968,404 948,504 728,470" fill="#64748b" />

          <!-- Facetas inferiores sombreadas -->
          <polygon points="72,492 268,474 446,554 62,548" fill="#475569" />
          <polygon points="268,474 522,468 742,552 446,554" fill="#526278" />
          <polygon points="522,468 728,470 948,504 948,546 742,552" fill="#334155" />

          <!-- Depresión principal Himeros y cráteres geométricos limpios en Eros -->
          <g transform="translate(544, 326)">
            <polygon points="-78,-8 -32,-22 36,-20 76,-4 52,18 -10,24 -62,14" fill="#7c8b9e" />
            <polygon points="-54,-3 -20,-13 24,-12 52,-1 32,11 -8,14 -40,8" fill="#475569" />
          </g>
          <g transform="translate(214, 336)">
            <polygon points="-58,-6 -24,-20 26,-18 58,-4 42,16 -8,20 -46,12" fill="#64748b" />
            <polygon points="-40,-2 -14,-11 18,-10 40,-1 24,9 -6,12 -30,6" fill="#334155" />
          </g>
          <g transform="translate(766, 338)">
            <polygon points="-48,-6 -18,-18 24,-16 50,-2 34,14 -8,18 -38,10" fill="#475569" />
            <polygon points="-32,-2 -10,-10 18,-9 34,0 22,8 -6,11 -24,5" fill="#1e293b" />
          </g>
          <g transform="translate(466, 488)">
            <polygon points="-44,-4 -16,-14 20,-13 44,-2 30,12 -6,15 -34,8" fill="#3b485c" />
            <polygon points="-28,-1 -8,-8 14,-7 28,0 18,7 -4,8 -20,4" fill="#1e293b" />
          </g>

          <!-- Bloques de regolito sobre la propia superficie de Eros -->
          <polygon points="94,324 118,296 146,304 152,326 108,330" fill="#64748b" />
          <polygon points="118,296 146,304 132,326 108,330" fill="#cbd5e1" />

          <polygon points="844,442 872,414 904,422 912,448 858,452" fill="#475569" />
          <polygon points="872,414 904,422 888,448 858,452" fill="#94a3b8" />
        </g>
      </svg>
    `;
  }

  function travelPhaseAsteroideEros(phaseKey) {
    if (phaseKey !== 'deep-space-eros-transit') return '';
    const id = M.uid('treros');

    return `
      <!-- Vista horizontal -->
      <svg class="travel-scene-svg is-landscape" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#02040a" />
            <stop offset="100%" stop-color="#091329" />
          </linearGradient>
        </defs>

        <rect width="960" height="540" fill="url(#${id}-bg)" />

        <g class="travel-stars-warp" fill="#ffffff">
          <circle cx="82" cy="54" r="1.5" opacity="0.9" />
          <circle cx="176" cy="118" r="1.2" opacity="0.74" />
          <circle cx="288" cy="48" r="1.6" opacity="0.92" />
          <circle cx="408" cy="96" r="1.2" opacity="0.78" />
          <circle cx="524" cy="46" r="1.5" opacity="0.88" />
          <circle cx="642" cy="108" r="1.2" opacity="0.74" />
          <circle cx="774" cy="54" r="1.5" opacity="0.86" />
          <circle cx="142" cy="364" r="1.3" opacity="0.78" />
          <circle cx="468" cy="382" r="1.4" opacity="0.8" />
        </g>

        <!-- Asteroide 433 Eros low-poly -->
        <g class="travel-planet-approach" transform="translate(740, 270)">
          <polygon points="-148,-24 -86,-78 24,-54 128,-74 176,12 136,84 18,72 -108,78 -162,18" fill="#475569" />
          <polygon points="-86,-78 24,-54 42,-8 -96,-14" fill="#cbd5e1" />
          <polygon points="24,-54 128,-74 114,22 42,-8" fill="#94a3b8" />
          <polygon points="-148,-24 -86,-78 -96,-14 -162,18" fill="#94a3b8" />
          <polygon points="-96,-14 42,-8 18,72 -108,78" fill="#64748b" />
          <polygon points="42,-8 114,22 136,84 18,72" fill="#526278" />
          <polygon points="128,-74 176,12 136,84 114,22" fill="#334155" />
          <polygon points="-24,-26 14,-34 38,-18 18,-4 -20,-8" fill="#64748b" />
          <polygon points="-12,-22 12,-26 26,-16 12,-8 -10,-10" fill="#334155" />
        </g>

        <g class="travel-ship-cruise" transform="translate(360, 160) rotate(58) scale(0.85)">
          ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
        </g>
      </svg>

      <!-- Vista vertical -->
      <svg class="travel-scene-svg is-portrait" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-bg-p" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#020308" />
            <stop offset="100%" stop-color="#09142b" />
          </linearGradient>
        </defs>

        <rect width="540" height="960" fill="url(#${id}-bg-p)" />

        <g class="travel-stars-warp" fill="#ffffff">
          <circle cx="68" cy="74" r="1.5" opacity="0.9" />
          <circle cx="160" cy="120" r="1.2" opacity="0.75" />
          <circle cx="280" cy="52" r="1.6" opacity="0.92" />
          <circle cx="420" cy="98" r="1.3" opacity="0.78" />
          <circle cx="82" cy="240" r="1.2" opacity="0.7" />
          <circle cx="460" cy="280" r="1.5" opacity="0.85" />
          <circle cx="120" cy="420" r="1.3" opacity="0.75" />
        </g>

        <!-- Cohete Cyberpenguin en crucero vertical -->
        <g class="travel-ship-cruise" transform="translate(240, 260) rotate(52) scale(1.05)">
          ${M.spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
        </g>

        <!-- Asteroide 433 Eros en la mitad inferior -->
        <g class="travel-planet-approach" transform="translate(270, 680) scale(1.35)">
          <polygon points="-148,-24 -86,-78 24,-54 128,-74 176,12 136,84 18,72 -108,78 -162,18" fill="#475569" />
          <polygon points="-86,-78 24,-54 42,-8 -96,-14" fill="#cbd5e1" />
          <polygon points="24,-54 128,-74 114,22 42,-8" fill="#94a3b8" />
          <polygon points="-148,-24 -86,-78 -96,-14 -162,18" fill="#94a3b8" />
          <polygon points="-96,-14 42,-8 18,72 -108,78" fill="#64748b" />
          <polygon points="42,-8 114,22 136,84 18,72" fill="#526278" />
          <polygon points="128,-74 176,12 136,84 114,22" fill="#334155" />
          <polygon points="-24,-26 14,-34 38,-18 18,-4 -20,-8" fill="#64748b" />
          <polygon points="-12,-22 12,-26 26,-16 12,-8 -10,-10" fill="#334155" />
        </g>
      </svg>
    `;
  }

  M.stageBackdropAsteroideEros = stageBackdropAsteroideEros;
  M.travelPhaseAsteroideEros = travelPhaseAsteroideEros;
})();
