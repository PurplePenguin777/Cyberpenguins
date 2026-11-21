/* =========================================================
   Elemento: Asteroide 433 Eros (estilo "facetado fiel")
   Escenario de superficie: regolito gris con horizonte muy curvo (cuerpo pequeño),
   cráteres, bloques y cielo negro sin atmósfera. El cuerpo completo de Eros en las
   cinemáticas usa M.asteroidErosBody (js/elementos/cuerpos.js).
   ========================================================= */
(function initElementoAsteroideEros() {
  const M = (window.CYBERPENGUINS_MODELS = window.CYBERPENGUINS_MODELS || {});

  // Paleta de regolito de Eros (la misma gama gris-azulada del modelo del asteroide)
  const REGOLITH = { dark: '#38414f', mid: '#8f99a8', light: '#cbd3de' };

  function stageBackdropAsteroideEros() {
    const id = M.uid('eros');

    // Terreno triangulado con perspectiva (posicionado para dar amplio cielo cósmico)
    const mesh = typeof M.groundMesh === 'function'
      ? M.groundMesh({
          x0: -60,
          y0: 305,
          w: 1120,
          h: 320,
          cols: 18,
          rows: 7,
          seed: 303,
          dark: REGOLITH.dark,
          light: REGOLITH.light,
          jitter: 0.4,
          persp: true,
          noise: 0.42
        })
      : `<rect x="0" y="315" width="1000" height="280" fill="${REGOLITH.mid}" />`;

    const craters =
      M.surfaceCrater(216, 435, 64, 18, '#1e2733', '#dfe5ee') +
      M.surfaceCrater(498, 419, 72, 19, '#1e2733', '#dfe5ee') +
      M.surfaceCrater(822, 451, 52, 15, '#1e2733', '#dfe5ee') +
      M.surfaceCrater(470, 545, 46, 13, '#1e2733', '#cbd3de');

    const rocks =
      M.surfaceRock(96, 485, 20, '#dfe5ee', '#8f99a8', '#2a3340') +
      M.surfaceRock(884, 541, 24, '#dfe5ee', '#8f99a8', '#2a3340') +
      M.surfaceRock(330, 561, 18, '#cbd3de', '#7d8797', '#2a3340') +
      M.surfaceRock(640, 491, 14, '#cbd3de', '#7d8797', '#2a3340');

    return `
      <svg viewBox="0 0 1000 594" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#02040a" />
            <stop offset="65%" stop-color="#040814" />
            <stop offset="100%" stop-color="#0a1224" />
          </linearGradient>
          <linearGradient id="${id}-depth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#02060f" stop-opacity="0" />
            <stop offset="100%" stop-color="#02060f" stop-opacity="0.38" />
          </linearGradient>
          <!-- Horizonte muy curvo posicionado en y ~315 para dar más espacio vertical en el cielo -->
          <clipPath id="${id}-surf">
            <ellipse cx="500" cy="955" rx="900" ry="640" />
          </clipPath>
        </defs>

        <!-- Cielo negro sin atmósfera -->
        <rect width="1000" height="594" fill="url(#${id}-sky)" />

        <!-- Estrellas distribuidas en el cielo cósmico -->
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
          <circle cx="168" cy="180" r="1.3" opacity="0.75" />
          <circle cx="380" cy="220" r="1.5" opacity="0.82" />
          <circle cx="590" cy="190" r="1.4" opacity="0.78" />
          <circle cx="810" cy="210" r="1.3" opacity="0.8" />
          <circle cx="946" cy="224" r="1.2" opacity="0.74" />
        </g>

        <!-- Superficie de regolito -->
        <g clip-path="url(#${id}-surf)">
          <image href="assets/textures/eros.jpg" x="-60" y="270" width="1120" height="340" preserveAspectRatio="xMidYMid slice" opacity="0.4" />
          ${mesh}
          <!-- Depósitos planos de polvo ("ponds") -->
          <ellipse cx="610" cy="439" rx="70" ry="11" fill="#aab4c2" opacity="0.35" />
          <ellipse cx="300" cy="501" rx="54" ry="9" fill="#aab4c2" opacity="0.3" />
          ${craters}
          ${rocks}
          <rect x="0" y="305" width="1000" height="289" fill="url(#${id}-depth)" />
        </g>

        <!-- Borde iluminado del horizonte -->
        <ellipse cx="500" cy="955" rx="900" ry="640" fill="none" stroke="#e8edf5" stroke-opacity="0.4" stroke-width="2" />
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

        <!-- 433 Eros: el mismo cuerpo canónico que en el resto del juego -->
        <g class="travel-planet-approach" transform="translate(740, 270) rotate(-14)">
          ${M.asteroidErosBody(72, { uid: `${id}-eros-l` })}
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

        <!-- 433 Eros en la mitad inferior -->
        <g class="travel-planet-approach" transform="translate(270, 680) rotate(-14)">
          ${M.asteroidErosBody(64, { uid: `${id}-eros-p` })}
        </g>
      </svg>
    `;
  }

  M.stageBackdropAsteroideEros = stageBackdropAsteroideEros;
  M.travelPhaseAsteroideEros = travelPhaseAsteroideEros;
})();
