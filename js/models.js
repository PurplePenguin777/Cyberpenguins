/**
 * Coordinador de modelos visuales de Cyberpenguins.
 * Unifica los elementos individuales cargados desde js/elementos/*.js
 * bajo window.CYBERPENGUINS_MODELS manteniendo compatibilidad completa.
 */
(function (global) {
  'use strict';

  const M = (global.CYBERPENGUINS_MODELS = global.CYBERPENGUINS_MODELS || {});
  if (!M.uid) {
    let uidCounter = 0;
    M.uid = function uid(prefix) {
      uidCounter += 1;
      return `${prefix}-${uidCounter}`;
    };
  }
  const uid = M.uid;

  // Escenarios planetarios y de espacio profundo delegados por astro
  function stageBackdrop(chapterId, siteId) {
    if (chapterId === 'moon') {
      return M.stageBackdropLuna(siteId);
    }
    if (chapterId === 'mars') {
      return M.stageBackdropMarte(siteId);
    }
    if (siteId === 'asteroid-eros') {
      return M.stageBackdropAsteroideEros();
    }
    return M.stageBackdropEspacioProfundo();
  }

  // Escenas cinemáticas de despegue, salida de la atmósfera y viaje entre astros
  function renderTravelPhaseSvg(phaseKey) {
    return (
      (M.travelPhaseTierra && M.travelPhaseTierra(phaseKey)) ||
      (M.travelPhaseLuna && M.travelPhaseLuna(phaseKey)) ||
      (M.travelPhaseMarte && M.travelPhaseMarte(phaseKey)) ||
      (M.travelPhaseAsteroideEros && M.travelPhaseAsteroideEros(phaseKey)) ||
      (M.travelPhaseEspacioProfundo && M.travelPhaseEspacioProfundo(phaseKey)) ||
      M.travelPhaseEspacioProfundo('deep-space-arrival')
    );
  }

  function travelCinematicSvg(phaseKey) {
    return `
      <div class="cine-crossfade">
        <div class="cine-camera-drift">
          ${renderTravelPhaseSvg(phaseKey)}
        </div>
      </div>
    `;
  }

  // Renderizado compartido de rocas geológicas low-poly semienterradas con variantes morfológicas
  function renderRockSample(styles, variant = 0) {
    const id = uid('samp');
    const shapeIdx = ((Number(variant) || 0) % 3 + 3) % 3;

    const rockVariants = [
      // Variante 0: monolito prismático low-poly con crestas triangulares y veta mineral
      `
        <g>
          <polygon points="22,50 18,32 32,14 50,12 64,27 60,50"
            fill="url(#${id}-rock)" stroke="${styles.glint}" stroke-width="1.4" stroke-opacity="0.82" stroke-linejoin="round" />
          <polygon points="18,32 32,14 40,34 22,50" fill="${styles.a}" opacity="0.72" />
          <polygon points="32,14 50,12 40,34" fill="${styles.a}" opacity="0.92" />
          <polygon points="50,12 64,27 54,48 40,34" fill="${styles.c}" opacity="0.68" />
          <polygon points="22,50 40,34 54,48" fill="${styles.b}" opacity="0.8" />
          <polygon class="sample-glint-vein" points="33,22 44,18 47,27 36,33" fill="${styles.glint}" />
          <polygon class="sample-glint-vein" points="48,33 56,30 55,39 46,41" fill="#ffbe76" />
        </g>
      `,
      // Variante 1: bloque fracturado low-poly con pico cristalino lateral
      `
        <g>
          <polygon points="18,50 23,26 39,18 51,23 65,33 61,50"
            fill="url(#${id}-rock)" stroke="${styles.glint}" stroke-width="1.4" stroke-opacity="0.85" stroke-linejoin="round" />
          <polygon points="23,26 39,18 41,38 20,44" fill="${styles.a}" opacity="0.76" />
          <polygon points="39,18 51,23 41,38" fill="${styles.b}" opacity="0.65" />
          <polygon points="51,23 65,33 61,50 41,38" fill="${styles.c}" opacity="0.72" />
          <polygon points="44,18 52,11 59,23 49,32" fill="${styles.glint}" stroke="#f8fafc" stroke-width="0.9" stroke-opacity="0.75" />
          <polygon class="sample-glint-vein" points="27,30 37,25 39,34 29,39" fill="${styles.glint}" />
          <polygon class="sample-glint-vein" points="49,34 55,32 56,39 50,40" fill="#ffbe76" />
        </g>
      `,
      // Variante 2: laja basáltica escalonada low-poly emergiendo en diagonal
      `
        <g>
          <polygon points="20,50 16,36 28,22 44,17 61,20 66,35 61,50"
            fill="url(#${id}-rock)" stroke="${styles.glint}" stroke-width="1.4" stroke-opacity="0.82" stroke-linejoin="round" />
          <polygon points="16,36 28,22 43,32 24,48" fill="${styles.a}" opacity="0.72" />
          <polygon points="28,22 44,17 61,20 43,32" fill="${styles.a}" opacity="0.9" />
          <polygon points="43,32 61,20 66,35 50,48" fill="${styles.c}" opacity="0.7" />
          <polygon class="sample-glint-vein" points="26,32 39,24 43,30 29,39" fill="#ffbe76" />
          <polygon class="sample-glint-vein" points="46,26 56,25 54,36 44,35" fill="${styles.glint}" />
        </g>
      `
    ];

    return `
      <svg viewBox="0 0 84 68" width="66" height="54" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-rock" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${styles.a}" />
            <stop offset="52%" stop-color="${styles.b}" />
            <stop offset="100%" stop-color="${styles.c}" />
          </linearGradient>
        </defs>

        <!-- Anillo escáner geológico y sombra angular de contacto -->
        <ellipse class="sample-ground-ring" cx="42" cy="50" rx="28" ry="9.5" fill="none" stroke="${styles.glint}" stroke-width="1.4" stroke-opacity="0.74" />
        <polygon points="18,50 31,44 53,44 66,50 54,56 30,56" fill="rgba(4,7,18,0.44)" />

        <!-- Montículo trasero poligonal de regolito -->
        <polygon points="15,49 29,42 55,42 69,49 54,54 30,54" fill="${styles.soilBack}" />

        <!-- Roca geológica semienterrada con facetas low-poly -->
        ${rockVariants[shapeIdx]}

        <!-- Collar frontal geométrico de regolito cubriendo la base -->
        <polygon points="11,48 25,44 42,47 59,43 73,48 61,58 42,59 23,58"
          fill="${styles.soilFront}" stroke="${styles.soilRim}" stroke-width="1.1" stroke-opacity="0.74" stroke-linejoin="round" />
        <polygon points="20,51 26,49 28,53 21,54" fill="${styles.soilRim}" opacity="0.75" />
        <polygon points="56,50 62,49 63,53 57,54" fill="${styles.soilRim}" opacity="0.7" />
      </svg>
    `;
  }

  function sampleCrystal(chapterId = 'moon', variant = 0) {
    if (chapterId === 'moon' && M.sampleCrystalLuna) {
      return M.sampleCrystalLuna(variant);
    }
    if (chapterId === 'mars' && M.sampleCrystalMarte) {
      return M.sampleCrystalMarte(variant);
    }
    return renderRockSample(
      {
        a: '#e2e9f7',
        b: '#8894b2',
        c: '#46506b',
        glint: '#7ee8fa',
        halo: 'rgba(126,232,250,0.42)',
        soilBack: '#55607d',
        soilFront: '#8894b3',
        soilRim: '#cad4eb'
      },
      variant
    );
  }

  // Insignias de rango estilo diapositiva 6: escudos hexagonales verticales biselados con estrella central
  function badgeIcon(badgeId, unlocked) {
    const unlockedPalettes = {
      aprendiz: { outer: '#c87d45', light: '#e8a26d', dark: '#8d5127', inner: '#4c2b16', star: '#f5b982', starShade: '#d8894e' },
      ingeniero: { outer: '#cbd5e1', light: '#f8fafc', dark: '#64748b', inner: '#334155', star: '#f1f5f9', starShade: '#94a3b8' },
      especialista: { outer: '#38bdf8', light: '#7dd3fc', dark: '#0369a1', inner: '#0c3356', star: '#7dd3fc', starShade: '#0ea5e9' },
      piloto: { outer: '#facc15', light: '#fef08a', dark: '#ca8a04', inner: '#5b3c06', star: '#fef08a', starShade: '#eab308' },
      comandante: { outer: '#f05432', light: '#fb8667', dark: '#9f2a15', inner: '#4c140b', star: '#ff9c80', starShade: '#e04224' }
    };

    const lockedPalette = {
      outer: '#3b466b',
      light: '#55628a',
      dark: '#232a45',
      inner: '#1a2038',
      star: '#47557a',
      starShade: '#2e3859'
    };

    const p = unlocked ? (unlockedPalettes[badgeId] || unlockedPalettes.aprendiz) : lockedPalette;

    return `
      <svg viewBox="0 0 80 80" width="52" height="52" aria-hidden="true">
        <!-- Escudo hexagonal vertical biselado -->
        <polygon points="40,6 68,22 68,58 40,74 12,58 12,22" fill="${p.outer}" />
        <!-- Facetas del bisel exterior -->
        <polygon points="40,6 12,22 21,26 40,15" fill="${p.light}" />
        <polygon points="40,6 68,22 59,26 40,15" fill="${p.outer}" />
        <polygon points="12,22 12,58 21,54 21,26" fill="${p.outer}" opacity="0.9" />
        <polygon points="68,22 68,58 59,54 59,26" fill="${p.dark}" opacity="0.85" />
        <polygon points="12,58 40,74 40,65 21,54" fill="${p.dark}" />
        <polygon points="68,58 40,74 40,65 59,54" fill="${p.dark}" opacity="0.95" />

        <!-- Centro hexagonal hundido -->
        <polygon points="40,15 59,26 59,54 40,65 21,54 21,26" fill="${p.inner}" />
        <polygon points="40,15 59,26 59,36 21,36 21,26" fill="${p.light}" opacity="0.1" />

        <!-- Estrella central facetada de 5 puntas -->
        <polygon points="40,24 44.8,33.6 55.4,35.1 47.7,42.6 49.5,53.2 40,48.2 30.5,53.2 32.3,42.6 24.6,35.1 35.2,33.6" fill="${p.star}" />
        <polygon points="40,24 44.8,33.6 55.4,35.1 47.7,42.6 49.5,53.2 40,48.2" fill="${p.starShade}" opacity="0.72" />
      </svg>
    `;
  }

  function chapterEmblem(chapterId) {
    if (chapterId === 'mars' && M.emblemMarte) {
      return M.emblemMarte();
    }
    if (chapterId === 'deep-space' && M.emblemEspacioProfundo) {
      return M.emblemEspacioProfundo();
    }
    return M.emblemLuna();
  }

  Object.assign(M, {
    renderRockSample,
    stageBackdrop,
    travelCinematicSvg,
    sampleCrystal,
    badgeIcon,
    chapterEmblem
  });
})(typeof window !== 'undefined' ? window : globalThis);
