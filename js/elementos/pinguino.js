/**
 * Elemento visual (estética low-poly):
 * - Cyberpenguin low-poly con casco blanco de auriculares laterales, cuello y mochila azul cobalto,
 *   rostro en máscara blanca, ojos grandes expresivos, pico naranja y botas naranjas.
 * - Cuerda umbilical EVA luminosa.
 * - Sello de patita de 4 dedos geométricos (Estilo Pasaporte Diapositiva 3).
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

  function cyberpenguin(direction) {
    const id = uid('cp');
    const flip = direction === 'left' ? 'transform="translate(110,0) scale(-1,1)"' : '';
    return `
      <svg viewBox="0 0 110 124" width="56" height="63" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.62)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-suit" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="55%" stop-color="#e2e8f0" />
            <stop offset="100%" stop-color="#94a3b8" />
          </linearGradient>
          <linearGradient id="${id}-cobalt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="35%" stop-color="#2563eb" />
            <stop offset="100%" stop-color="#1e3a8a" />
          </linearGradient>
          <linearGradient id="${id}-visor" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="55%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#090f24" />
          </linearGradient>
          <linearGradient id="${id}-beak" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffb347" />
            <stop offset="60%" stop-color="#ff7b29" />
            <stop offset="100%" stop-color="#c2410c" />
          </linearGradient>
          <linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="rgba(186,230,253,0.42)" />
            <stop offset="45%" stop-color="rgba(56,189,248,0.08)" />
            <stop offset="100%" stop-color="rgba(14,165,233,0.22)" />
          </linearGradient>
        </defs>
        <g ${flip}>
          <!-- Sombra suave de contacto dinámica -->
          <g class="cp-shadow">
            <ellipse cx="55" cy="114" rx="26" ry="7.5" fill="url(#${id}-shadow)" />
          </g>

          <!-- Pierna y bota izquierda articulada -->
          <g class="cp-leg cp-leg-left">
            <polygon points="37,86 52,86 50,104 36,104" fill="url(#${id}-suit)" stroke="#64748b" stroke-width="1" stroke-linejoin="round" />
            <polygon points="36,94 51,94 50.5,98 36,98" fill="#1e293b" />
            <polygon points="37,88 45,88 44,103 36,103" fill="#ffffff" opacity="0.45" />
            <polygon points="35,104 49,104 51,111 33,111 32,107" fill="#ff8b29" stroke="#9a3412" stroke-width="1" stroke-linejoin="round" />
            <polygon points="35,104 48,104 45,107 34,107" fill="#ffb86b" />
          </g>

          <!-- Pierna y bota derecha articulada -->
          <g class="cp-leg cp-leg-right">
            <polygon points="58,86 73,86 74,104 60,104" fill="url(#${id}-suit)" stroke="#64748b" stroke-width="1" stroke-linejoin="round" />
            <polygon points="59,94 73.5,94 74,98 59.5,98" fill="#1e293b" />
            <polygon points="59,88 66,88 66,103 60,103" fill="#ffffff" opacity="0.45" />
            <polygon points="60,104 75,104 78,108 75,112 58,111" fill="#ff8b29" stroke="#9a3412" stroke-width="1" stroke-linejoin="round" />
            <polygon points="61,104 74,104 75,107 60,107" fill="#ffb86b" />
          </g>

          <!-- Brazo / Aleta trasera articulada -->
          <g class="cp-arm cp-arm-back">
            <polygon points="73,59 86,70 83,84 72,82 70,69" fill="#cbd5e1" stroke="#64748b" stroke-width="1" stroke-linejoin="round" />
            <polygon points="74,80 84,81 85,89 79,92 73,88" fill="#1e293b" stroke="#0f172a" stroke-width="1" />
          </g>

          <!-- Cuerpo superior (Torso, Casco y Mochila PLSS con balanceo waddle) -->
          <g class="cp-body">
            <!-- Mochila azul cobalto (PLSS) estilizada tras la espalda -->
            <polygon points="22,52 38,49 39,87 24,87 20,81" fill="url(#${id}-cobalt)" stroke="#172554" stroke-width="1.1" stroke-linejoin="round" />
            <polygon points="22,55 30,54 30,83 22,82" fill="#3b82f6" opacity="0.55" />
            <rect x="24" y="60" width="8" height="4" rx="1" fill="#7ee8fa" />
            <circle cx="27" cy="77" r="1.8" fill="#fbbf24" />

            <!-- Torso blanco facetado del traje EVA -->
            <polygon points="36,56 74,56 76,87 55,90 34,87" fill="url(#${id}-suit)" stroke="#64748b" stroke-width="1.1" stroke-linejoin="round" />
            <polygon points="36,56 56,56 55,89 34,87" fill="#ffffff" opacity="0.48" />
            <!-- Parche azul de misión en pecho izquierdo -->
            <polygon points="62,62 69,62 70,68 65.5,71 61,68" fill="#2563eb" stroke="#93c5fd" stroke-width="0.8" />
            <!-- Cinturón técnico gris con hebilla -->
            <polygon points="34,76 76,76 76,81 34,81" fill="#64748b" stroke="#334155" stroke-width="0.9" />
            <rect x="51" y="75" width="9" height="7" rx="1.2" fill="#cbd5e1" stroke="#334155" stroke-width="0.9" />
            <rect x="53.5" y="77" width="4" height="3" fill="#38bdf8" />

            <!-- Collarín grueso azul cobalto brillante -->
            <polygon points="33,50 77,50 79,57 55,61 31,57" fill="url(#${id}-cobalt)" stroke="#1e3a8a" stroke-width="1.1" stroke-linejoin="round" />
            <polygon points="35,51 64,51 55,55 34,54" fill="#60a5fa" opacity="0.55" />

            <!-- Auriculares laterales rectangulares del casco -->
            <g>
              <rect x="24" y="25" width="9" height="16" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="1" />
              <rect x="26" y="29" width="2.2" height="8" rx="1" fill="#2563eb" />
              <rect x="29.5" y="29" width="2" height="8" rx="1" fill="#38bdf8" />

              <rect x="77" y="25" width="9" height="16" rx="3" fill="#cbd5e1" stroke="#64748b" stroke-width="1" />
              <rect x="78.5" y="29" width="2" height="8" rx="1" fill="#38bdf8" />
              <rect x="81.8" y="29" width="2.2" height="8" rx="1" fill="#2563eb" />
            </g>

            <!-- Carcasa exterior blanca facetada del casco -->
            <path d="M 30,32 C 30,14 42,7 55,7 C 68,7 80,14 80,32 C 80,45 72,53 55,53 C 38,53 30,45 30,32 Z" fill="url(#${id}-suit)" stroke="#64748b" stroke-width="1.2" />
            <path d="M 33,27 C 35,13 46,9 58,10 C 48,14 39,20 35,30 Z" fill="#ffffff" opacity="0.85" />

            <!-- Visor oscuro interior -->
            <rect x="35" y="15" width="40" height="32" rx="14" fill="url(#${id}-visor)" stroke="#94a3b8" stroke-width="1.4" />

            <!-- Cabeza azul marino oscuro del pingüino dentro del casco -->
            <path d="M 38,32 C 38,20 45,16 55,16 C 65,16 72,20 72,32 C 72,41 65,45 55,45 C 45,45 38,41 38,32 Z" fill="#172b59" />

            <!-- Máscara facial blanca en forma de corazón -->
            <path d="M 40,32 C 40,24 46,21 52,24 C 54,25.5 55,27 56,27 C 57,27 58,25.5 60,24 C 66,21 71,25 71,32 C 71,40 64,44 55,44 C 46,44 40,40 40,32 Z" fill="#f8fafc" />
            <path d="M 41,37 Q 55,45 70,37 Q 63,44 55,44 Q 47,44 41,37 Z" fill="#e2e8f0" />

            <!-- Grandes ojos expresivos -->
            <circle cx="48" cy="31.5" r="4.4" fill="#090f24" />
            <circle cx="48" cy="31.5" r="3.3" fill="#162954" />
            <circle cx="48" cy="31.8" r="2.2" fill="#060914" />
            <circle cx="46.6" cy="30.0" r="1.4" fill="#ffffff" />
            <circle cx="49.5" cy="33.2" r="0.65" fill="#7ee8fa" />

            <circle cx="64.5" cy="31.5" r="4.2" fill="#090f24" />
            <circle cx="64.5" cy="31.5" r="3.1" fill="#162954" />
            <circle cx="64.5" cy="31.8" r="2.1" fill="#060914" />
            <circle cx="63.1" cy="30.0" r="1.3" fill="#ffffff" />
            <circle cx="65.9" cy="33.2" r="0.6" fill="#7ee8fa" />

            <!-- Pico triangular facetado naranja -->
            <polygon points="52,35.5 58,34 65,37.5 57.5,41 52,38.5" fill="url(#${id}-beak)" stroke="#9a3412" stroke-width="0.7" stroke-linejoin="round" />
            <polygon points="52.5,35.6 58,34.4 63.5,37.2 57.5,37.8" fill="#ffb86b" opacity="0.75" />

            <!-- Cúpula cristalina del visor con brillo diagonal -->
            <rect x="35" y="15" width="40" height="32" rx="14" fill="url(#${id}-glass)" stroke="#bae6fd" stroke-width="1.3" />
            <path d="M 41,19 Q 51,16 61,19" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <!-- Brazo / Aleta delantera articulada -->
          <g class="cp-arm cp-arm-front">
            <polygon points="36,59 24,71 27,84 38,81 39,68" fill="url(#${id}-suit)" stroke="#64748b" stroke-width="1" stroke-linejoin="round" />
            <polygon points="28,67 34,64 35,70 29,72" fill="#2563eb" />
            <!-- Guante azul marino oscuro -->
            <polygon points="26,81 37,80 39,88 33,92 26,88" fill="#1e293b" stroke="#0f172a" stroke-width="1" />
          </g>
      </svg>
    `;
  }

  // Umbilical espacial animado para caminatas EVA en Espacio Profundo
  function evaTether(hatchPos, penguinPos, phase = 0, penguinDir = 'right') {
    const x1 = hatchPos.x * 10;
    const y1 = hatchPos.y * 5.94;
    const dirOffset = penguinDir === 'left' ? 6 : -8;
    const x2 = penguinPos.x * 10 + dirOffset;
    const y2 = penguinPos.y * 5.94 - 22;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const slack = Math.max(26, Math.min(82, 92 - dist * 0.11));
    const sway = Math.sin(phase) * 9;
    const cx1 = x1 + (x2 - x1) * 0.34 + sway * 0.5;
    const cy1 = Math.max(y1, y2) + slack;
    const cx2 = x1 + (x2 - x1) * 0.68 - sway;
    const cy2 = y2 + slack * 0.72 + Math.cos(phase * 0.7) * 6;
    const pathD = `M ${x1.toFixed(1)},${y1.toFixed(1)} C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
    return `
      <defs>
        <filter id="evaTetherGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="7" fill="#1b2a47" stroke="#7ee8fa" stroke-width="1.6" />
      <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="2.6" fill="#ffbe76" />
      <path d="${pathD}" fill="none" stroke="rgba(56,189,248,0.32)" stroke-width="6.5" stroke-linecap="round" filter="url(#evaTetherGlow)" />
      <path d="${pathD}" fill="none" stroke="#f8fafc" stroke-width="2.6" stroke-linecap="round" />
      <path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="1.1" stroke-linecap="round" stroke-opacity="0.9" />
      <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="4.2" fill="#f05432" stroke="#182747" stroke-width="1.4" />
    `;
  }

  // Sello de patita palmeada de pingüino (3 dedos unidos por membrana interdigital y talón continuo)
  function penguinPawStamp(filled = true, size = 56) {
    const mainFill = filled ? '#ffbe76' : 'rgba(154,167,212,0.22)';
    const subFill = filled ? '#ffe3b8' : 'rgba(154,167,212,0.12)';
    const foldStroke = filled ? '#f29a4b' : 'rgba(154,167,212,0.26)';
    const stroke = filled ? '#e06d38' : 'rgba(154,167,212,0.38)';

    return `
      <svg viewBox="0 0 80 80" width="${size}" height="${size}" aria-hidden="true">
        <!-- Contorno continuo de patita palmeada de pingüino (3 dedos + membrana + talón) -->
        <path d="M 27,64 C 22,57 18,46 14,31 C 12,24 17,19 22,23 C 26,26 29,31 33,33 C 35,24 36,14 40,12 C 44,14 45,24 47,33 C 51,31 54,26 58,23 C 63,19 68,24 66,31 C 62,46 58,57 53,64 C 48,70 32,70 27,64 Z"
          fill="${mainFill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" />

        <!-- Brillo suave de la planta y los 3 dedos convergentes sobre la membrana -->
        <path d="M 32,61 C 29,56 26,48 22,36 C 25,35 28,37 32,42 C 35,33 37,25 40,21 C 43,25 45,33 48,42 C 52,37 55,35 58,36 C 54,48 51,56 48,61 C 44,64 36,64 32,61 Z"
          fill="${subFill}" />

        <!-- Pliegues anatómicos de la membrana interdigital hacia el talón -->
        <path d="M 30,32 Q 34,45 36,56" fill="none" stroke="${foldStroke}" stroke-width="1.3" stroke-linecap="round" />
        <path d="M 50,32 Q 46,45 44,56" fill="none" stroke="${foldStroke}" stroke-width="1.3" stroke-linecap="round" />
      </svg>
    `;
  }

  M.cyberpenguin = cyberpenguin;
  M.evaTether = evaTether;
  M.penguinPawStamp = penguinPawStamp;
})(typeof window !== 'undefined' ? window : globalThis);
