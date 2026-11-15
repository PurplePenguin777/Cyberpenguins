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

        <!-- Superficie geomorfológica real de 433 Eros (depresión Himeros, "ponds" de regolito y boulders) -->
        <g>
          <!-- Perfil general con la curvatura de la cuenca Himeros (sitio de aterrizaje de NEAR Shoemaker) -->
          <path d="M 38,392 Q 92,306 232,272 Q 390,248 504,268 Q 618,284 748,266 L 836,278 Q 934,308 968,404 L 948,546 L 62,548 Z" fill="#3b4859" />

          <!-- Facetas superiores iluminadas por el sol directo (sin atmósfera = luz dura brillante) -->
          <polygon points="38,392 146,294 284,264 316,356 126,388" fill="#9fb0c4" />
          <polygon points="284,264 468,256 504,344 316,356" fill="#d9e2ec" />
          <polygon points="468,256 678,270 694,352 504,344" fill="#b0bfd1" />
          <polygon points="678,270 854,284 952,374 694,352" fill="#9cb0c4" />

          <!-- Depósitos ultraplanos de polvo ("ponds" de regolito electrostático de Eros) -->
          <ellipse cx="440" cy="358" rx="72" ry="16" fill="#75889e" opacity="0.85" />
          <ellipse cx="620" cy="372" rx="54" ry="12" fill="#6a7d94" opacity="0.8" />

          <!-- Facetas medias de regolito silicatado -->
          <polygon points="38,392 126,388 316,356 268,474 72,492" fill="#7c8b9e" />
          <polygon points="316,356 504,344 522,468 268,474" fill="#9cb0c4" />
          <polygon points="504,344 694,352 728,470 522,468" fill="#8899ac" />
          <polygon points="694,352 952,374 968,404 948,504 728,470" fill="#58687a" />

          <!-- Facetas inferiores en sombra orográfica nítida -->
          <polygon points="72,492 268,474 446,554 62,548" fill="#384656" />
          <polygon points="268,474 522,468 742,552 446,554" fill="#445366" />
          <polygon points="522,468 728,470 948,504 948,546 742,552" fill="#202c3a" />

          <!-- Gran cuenca central Himeros con paredes aterrazadas de regolito -->
          <g transform="translate(544, 326)">
            <ellipse cx="0" cy="0" rx="76" ry="22" fill="#6d7f95" />
            <ellipse cx="-4" cy="4" rx="60" ry="16" fill="#47566a" />
            <ellipse cx="-8" cy="6" rx="42" ry="10" fill="#1e2938" />
            <path d="M -76,0 C -45,-18 45,-18 76,0 C 56,-12 -28,-12 -76,0 Z" fill="#e2ebf5" opacity="0.8" />
          </g>

          <!-- Cráter de impacto oeste con relieve realista -->
          <g transform="translate(214, 336)">
            <ellipse cx="0" cy="0" rx="56" ry="18" fill="#5a6a7e" />
            <ellipse cx="-3" cy="3" rx="44" ry="13" fill="#384758" />
            <ellipse cx="-6" cy="4" rx="28" ry="8" fill="#182330" />
            <path d="M -56,0 C -32,-14 32,-14 56,0 C 40,-9 -20,-9 -56,0 Z" fill="#cbd7e6" opacity="0.75" />
          </g>

          <!-- Cráter este en el lóbulo menor -->
          <g transform="translate(766, 338)">
            <ellipse cx="0" cy="0" rx="48" ry="16" fill="#47566a" />
            <ellipse cx="-3" cy="2" rx="36" ry="11" fill="#253242" />
            <path d="M -48,0 C -28,-12 28,-12 48,0 C 34,-8 -16,-8 -48,0 Z" fill="#9fb1c4" opacity="0.7" />
          </g>

          <g transform="translate(466, 488)">
            <ellipse cx="0" cy="0" rx="42" ry="14" fill="#384656" />
            <ellipse cx="-2" cy="2" rx="30" ry="9" fill="#182330" />
          </g>

          <!-- Boulders y bloques de regolito dispersos de 433 Eros -->
          <g>
            <polygon points="94,324 116,296 144,304 150,326 108,330" fill="#526274" />
            <polygon points="116,296 144,304 130,326 108,330" fill="#d9e3ed" />
            <polygon points="144,304 150,326 130,326" fill="#253242" />

            <polygon points="844,442 870,414 902,422 910,448 858,452" fill="#3c4b5c" />
            <polygon points="870,414 902,422 886,448 858,452" fill="#9fb0c4" />
            <polygon points="902,422 910,448 886,448" fill="#182330" />

            <polygon points="330,440 348,422 372,428 376,448 340,452" fill="#47566a" />
            <polygon points="348,422 372,428 362,448 340,452" fill="#cbd7e6" />
          </g>
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

        <!-- Asteroide 433 Eros realista con la depresión Himeros y cráter Psyche -->
        <g class="travel-planet-approach" transform="translate(740, 270)">
          ${typeof M.asteroidErosBody === 'function' ? M.asteroidErosBody(72, { uid: `${id}-eros-l` }) : `
            <polygon points="-148,-24 -86,-78 24,-54 128,-74 176,12 136,84 18,72 -108,78 -162,18" fill="#475569" />
            <polygon points="-86,-78 24,-54 42,-8 -96,-14" fill="#cbd5e1" />
            <polygon points="24,-54 128,-74 114,22 42,-8" fill="#94a3b8" />
            <polygon points="-148,-24 -86,-78 -96,-14 -162,18" fill="#94a3b8" />
            <polygon points="-96,-14 42,-8 18,72 -108,78" fill="#64748b" />
            <polygon points="42,-8 114,22 136,84 18,72" fill="#526278" />
            <polygon points="128,-74 176,12 136,84 114,22" fill="#334155" />
          `}
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
        <g class="travel-planet-approach" transform="translate(270, 680)">
          ${typeof M.asteroidErosBody === 'function' ? M.asteroidErosBody(86, { uid: `${id}-eros-p` }) : `
            <polygon points="-148,-24 -86,-78 24,-54 128,-74 176,12 136,84 18,72 -108,78 -162,18" fill="#475569" />
            <polygon points="-86,-78 24,-54 42,-8 -96,-14" fill="#cbd5e1" />
            <polygon points="24,-54 128,-74 114,22 42,-8" fill="#94a3b8" />
            <polygon points="-148,-24 -86,-78 -96,-14 -162,18" fill="#94a3b8" />
            <polygon points="-96,-14 42,-8 18,72 -108,78" fill="#64748b" />
          `}
        </g>
      </svg>
    `;
  }

  M.stageBackdropAsteroideEros = stageBackdropAsteroideEros;
  M.travelPhaseAsteroideEros = travelPhaseAsteroideEros;
})();
