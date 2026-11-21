/**
 * Modelo visual realista de Cyberpenguin (CyberPenguin 2.0):
 * - Polluelo de pingüino emperador (*Aptenodytes forsteri*) anatómico con plumón gris ceniza/plateado,
 *   capucha negro-azabache suave, máscara facial blanca en mejillas y ojos, pico corto oscuro con base coral
 *   y cuerpo rechoncho en forma de perita con patitas cortas.
 * - Traje espacial EVA de la NASA (inspirado en Apollo A7L / EMU): casco de burbuja de policarbonato
 *   con sobrevisor solar dorado (LEVA) levantado, anillo metálico de desconexión en el cuello,
 *   módulo de control frontal (DCM) con válvulas umbilicales roja y azul, mochila de soporte vital PLSS
 *   con antena UHF, mangas anatómicas para aletas y sobrebotas lunares con suela acanalada.
 * - Cuerda umbilical EVA luminosa y sello de patita palmeada de 3 dedos.
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
      <svg viewBox="0 0 110 128" width="58" height="67" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(4,7,20,0.68)" />
            <stop offset="65%" stop-color="rgba(4,7,20,0.28)" />
            <stop offset="100%" stop-color="rgba(4,7,20,0)" />
          </radialGradient>
          <radialGradient id="${id}-suit-body" cx="42%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="52%" stop-color="#f1f0ec" />
            <stop offset="82%" stop-color="#d5dce6" />
            <stop offset="100%" stop-color="#9aa6b8" />
          </radialGradient>
          <linearGradient id="${id}-plss" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="55%" stop-color="#cbd5e1" />
            <stop offset="100%" stop-color="#64748b" />
          </linearGradient>
          <linearGradient id="${id}-cobalt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#60a5fa" />
            <stop offset="40%" stop-color="#2563eb" />
            <stop offset="100%" stop-color="#172554" />
          </linearGradient>
          <linearGradient id="${id}-alu" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stop-color="#f1f5f9" />
            <stop offset="48%" stop-color="#94a3b8" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <linearGradient id="${id}-gold-visor" x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="35%" stop-color="#eab308" />
            <stop offset="75%" stop-color="#b45309" />
            <stop offset="100%" stop-color="#78350f" />
          </linearGradient>
          <radialGradient id="${id}-helmet-back" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="70%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#060a17" />
          </radialGradient>
          <radialGradient id="${id}-chick-hood" cx="46%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#272c3a" />
            <stop offset="55%" stop-color="#151821" />
            <stop offset="100%" stop-color="#090b10" />
          </radialGradient>
          <radialGradient id="${id}-chick-mask" cx="48%" cy="42%" r="60%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="68%" stop-color="#f1f5f9" />
            <stop offset="100%" stop-color="#cbd5e1" />
          </radialGradient>
          <linearGradient id="${id}-chick-down" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e2e8f0" />
            <stop offset="55%" stop-color="#b6c0ce" />
            <stop offset="100%" stop-color="#7c8798" />
          </linearGradient>
          <linearGradient id="${id}-chick-beak" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#333947" />
            <stop offset="55%" stop-color="#181b24" />
            <stop offset="100%" stop-color="#0d0f14" />
          </linearGradient>
          <radialGradient id="${id}-bubble-glass" cx="38%" cy="28%" r="68%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.45)" />
            <stop offset="32%" stop-color="rgba(186,230,253,0.14)" />
            <stop offset="78%" stop-color="rgba(56,189,248,0.06)" />
            <stop offset="100%" stop-color="rgba(125,211,252,0.28)" />
          </radialGradient>
        </defs>
        <g ${flip}>
          <!-- Sombra suave de contacto en el suelo -->
          <g class="cp-shadow">
            <ellipse cx="55" cy="118" rx="26" ry="7" fill="url(#${id}-shadow)" />
          </g>

          <!-- Patita corta izquierda y sobrebota lunar A7L con suela acanalada -->
          <g class="cp-leg cp-leg-left">
            <path d="M 38,90 C 37,95 37,101 38,106 L 50,106 C 51,101 51,95 50,90 Z" fill="url(#${id}-suit-body)" stroke="#94a3b8" stroke-width="0.9" />
            <path d="M 37.5,95 Q 44,97 50.5,95 M 37.5,99.5 Q 44,101.5 50.5,99.5" fill="none" stroke="#94a3b8" stroke-width="1" />
            <!-- Sobrebota lunar redondeada -->
            <path d="M 33,109 C 33,104.5 37,103 44,103 C 50,103 53,105 53,109.5 C 53,112.5 50,114 43,114 L 34.5,114 C 33.4,114 33,112 33,109 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1" />
            <!-- Puntera azul cobalto NASA y suela acanalada gris oscuro -->
            <path d="M 41,104.5 C 47.5,104.5 51.8,106.5 52.3,110.5 L 40,110.5 C 39.5,107.5 39.8,105 41,104.5 Z" fill="url(#${id}-cobalt)" />
            <rect x="33" y="111.2" width="20" height="3.4" rx="1.6" fill="#334155" stroke="#1e293b" stroke-width="0.7" />
            <path d="M 36,111.5 L 36,114.4 M 39.5,111.5 L 39.5,114.4 M 43,111.5 L 43,114.4 M 46.5,111.5 L 46.5,114.4 M 50,111.5 L 50,114.4" stroke="#0f172a" stroke-width="0.9" />
          </g>

          <!-- Patita corta derecha y sobrebota lunar A7L con suela acanalada -->
          <g class="cp-leg cp-leg-right">
            <path d="M 59,90 C 58,95 58,101 59,106 L 71,106 C 72,101 72,95 71,90 Z" fill="url(#${id}-suit-body)" stroke="#94a3b8" stroke-width="0.9" />
            <path d="M 58.5,95 Q 65,97 71.5,95 M 58.5,99.5 Q 65,101.5 71.5,99.5" fill="none" stroke="#94a3b8" stroke-width="1" />
            <path d="M 57,109.5 C 57,105 60,103 66.5,103 C 73.5,103 77.5,105 77.5,109.5 C 77.5,112.5 76.2,114 74.5,114 L 59,114 C 57.5,114 57,112 57,109.5 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1" />
            <path d="M 64,104.5 C 71,104.5 76,106.5 76.8,110.5 L 63,110.5 C 62.5,107.5 62.8,105 64,104.5 Z" fill="url(#${id}-cobalt)" />
            <rect x="57" y="111.2" width="20.5" height="3.4" rx="1.6" fill="#334155" stroke="#1e293b" stroke-width="0.7" />
            <path d="M 60,111.5 L 60,114.4 M 63.5,111.5 L 63.5,114.4 M 67,111.5 L 67,114.4 M 70.5,111.5 L 70.5,114.4 M 74,111.5 L 74,114.4" stroke="#0f172a" stroke-width="0.9" />
          </g>

          <!-- Aleta trasera anatómica dentro de manga EVA curva -->
          <g class="cp-arm cp-arm-back">
            <path d="M 73,58 C 80,61 86,69 87,79 C 88,86 85,92 81,92 C 77,92 73,86 71,77 C 69,69 70,61 73,58 Z" fill="#d5dce6" stroke="#64748b" stroke-width="1" />
            <path d="M 74,64 Q 80,65 83,70 M 74,73 Q 81,74 86,78" fill="none" stroke="#2563eb" stroke-width="1.6" stroke-linecap="round" />
            <path d="M 75,81 C 79,81 84,82 86.8,84 C 86.2,89.5 83.5,92 80.5,92 C 77.5,92 75,87.5 75,81 Z" fill="#334155" />
          </g>

          <!-- Cuerpo rechoncho de bebé pingüino emperador, mochila PLSS y casco de burbuja -->
          <g class="cp-body">
            <!-- Antena UHF y mochila de soporte vital PLSS de la NASA detrás del torso -->
            <line x1="25" y1="50" x2="25" y2="33" stroke="#475569" stroke-width="2" stroke-linecap="round" />
            <circle cx="25" cy="32.5" r="2.1" fill="#f59e0b" />
            <rect x="19" y="51" width="21" height="39" rx="6" fill="url(#${id}-plss)" stroke="#475569" stroke-width="1.1" />
            <rect x="20.5" y="55" width="7" height="31" rx="3" fill="url(#${id}-cobalt)" />
            <rect x="22" y="61" width="4" height="2.5" rx="0.8" fill="#38bdf8" />
            <circle cx="24" cy="76" r="1.6" fill="#fbbf24" />

            <!-- Torso rechoncho en forma de perita (tejido Beta-cloth con pliegues de presión) -->
            <path d="M 35,55 C 31,64 30,77 33,87 C 36,94 45,97 55.5,97 C 66,97 75,94 77.5,87 C 80.5,77 79,64 75,55 Z" fill="url(#${id}-suit-body)" stroke="#64748b" stroke-width="1.15" />
            <!-- Pliegues anulares suaves del traje presurizado -->
            <path d="M 32.5,71 Q 55.5,75.5 78,71" fill="none" stroke="#94a3b8" stroke-width="0.95" opacity="0.65" />
            <path d="M 32,81 Q 55.5,85.5 78.5,81" fill="none" stroke="#64748b" stroke-width="1.1" opacity="0.7" />
            <path d="M 35,89.5 Q 55.5,93.5 76,89.5" fill="none" stroke="#94a3b8" stroke-width="0.9" opacity="0.6" />

            <!-- Insignia circular azul estilo NASA en el pecho -->
            <circle cx="67.5" cy="64.5" r="4.5" fill="url(#${id}-cobalt)" stroke="#e2e8f0" stroke-width="0.9" />
            <path d="M 64.8,65.5 Q 67.5,62 70.2,64.8" fill="none" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" />
            <circle cx="66.5" cy="63.3" r="0.6" fill="#ffffff" />

            <!-- Módulo de control frontal DCM (Display & Controls Module) en el pecho -->
            <rect x="45.5" y="62" width="16.5" height="12.5" rx="2.6" fill="#e2e8f0" stroke="#64748b" stroke-width="1" />
            <rect x="47.5" y="64" width="12.5" height="3.2" rx="1" fill="#0f172a" />
            <rect x="48.5" y="64.8" width="4" height="1.6" rx="0.5" fill="#38bdf8" />
            <circle cx="56.8" cy="65.6" r="0.9" fill="#f59e0b" />
            <circle cx="51" cy="70.8" r="2.1" fill="#334155" stroke="#94a3b8" stroke-width="0.6" />
            <rect x="55" y="69.5" width="4.5" height="2.4" rx="0.6" fill="#475569" />

            <!-- Conectores umbilicales reales de oxígeno/refrigeración (válvulas roja y azul) -->
            <circle cx="48.5" cy="79.5" r="2.8" fill="#2563eb" stroke="#1e3a8a" stroke-width="0.9" />
            <circle cx="48.5" cy="79.5" r="1.1" fill="#93c5fd" />
            <circle cx="62" cy="79.5" r="2.8" fill="#dc2626" stroke="#7f1d1d" stroke-width="0.9" />
            <circle cx="62" cy="79.5" r="1.1" fill="#fca5a5" />

            <!-- Anillo metálico de desconexión del cuello (Apollo A7L / EMU Neck Ring) -->
            <ellipse cx="55.5" cy="54.5" rx="23.5" ry="5.5" fill="url(#${id}-cobalt)" stroke="#1e3a8a" stroke-width="1.1" />
            <ellipse cx="55.5" cy="53.3" rx="22" ry="4.1" fill="none" stroke="url(#${id}-alu)" stroke-width="1.8" />
            <!-- Seguros de bayoneta metálicos alrededor del anillo -->
            <rect x="36" y="52.2" width="3.2" height="2.4" rx="0.6" fill="#e2e8f0" stroke="#475569" stroke-width="0.5" />
            <rect x="46" y="54.5" width="3.4" height="2.4" rx="0.6" fill="#e2e8f0" stroke="#475569" stroke-width="0.5" />
            <rect x="61" y="54.5" width="3.4" height="2.4" rx="0.6" fill="#e2e8f0" stroke="#475569" stroke-width="0.5" />
            <rect x="71" y="52.2" width="3.2" height="2.4" rx="0.6" fill="#e2e8f0" stroke="#475569" stroke-width="0.5" />

            <!-- Fondo interior oscuro de la burbuja del casco -->
            <ellipse cx="55.5" cy="32.5" rx="22.8" ry="22.2" fill="url(#${id}-helmet-back)" stroke="#64748b" stroke-width="1.1" />

            <!-- =================================================================
                 POLLUELO DE PINGÜINO EMPERADOR (*Aptenodytes forsteri*) EN EL CASCO
                 ================================================================= -->
            <!-- Plumón esponjoso gris ceniza/plateado del cuello del polluelo -->
            <path d="M 38.5,45 C 40,39 46,37 55.5,37 C 65,37 71,39 72.5,45 C 73.5,49.5 66,53 55.5,53 C 45,53 37.5,49.5 38.5,45 Z" fill="url(#${id}-chick-down)" />

            <!-- Cabecita redondeada con capucha negro-azabache aterciopelada -->
            <path d="M 36.5,33.5 C 36.5,20 44.5,14 55.8,14 C 67,14 74.8,20 74.8,33.5 C 74.8,43.5 67.5,48.5 55.8,48.5 C 44,48.5 36.5,43.5 36.5,33.5 Z" fill="url(#${id}-chick-hood)" />

            <!-- Máscara facial blanca característica del bebé emperador (mejillas infladas y contorno de ojos) -->
            <path d="M 39.2,34.8 C 38.8,26.8 43.8,22.2 49.8,23.2 C 53.2,23.8 55.2,26.5 56.5,26.5 C 57.8,26.5 59.8,23.8 63.2,23.2 C 69,22.2 73.8,26.8 73.4,34.8 C 73,42.5 66.8,46.8 56.5,46.8 C 45.8,46.8 39.6,42.5 39.2,34.8 Z" fill="url(#${id}-chick-mask)" />

            <!-- Mentón limpio con rubor kawaii suave en las mejillas regordetas -->
            <ellipse cx="42.5" cy="36.8" rx="4.2" ry="2.6" fill="#ff8da1" opacity="0.45" />
            <ellipse cx="70.2" cy="36.8" rx="4.2" ry="2.6" fill="#ff8da1" opacity="0.45" />
            <path d="M 40.5,39.5 C 43,44.2 48.5,46.0 52.5,45.4" fill="none" stroke="#cbd5e1" stroke-width="1.2" stroke-linecap="round" />
            <path d="M 72,39.5 C 69.5,44.2 64.5,46.0 60.5,45.4" fill="none" stroke="#cbd5e1" stroke-width="1.2" stroke-linecap="round" />

            <!-- Grandes ojos Kawaii expresivos con media luna azul zafiro y doble brillo estelar -->
            <g>
              <ellipse cx="47.2" cy="32.8" rx="5.4" ry="5.8" fill="#070a12" />
              <path d="M 43.4,35.2 Q 47.2,38.4 51.0,35.2" fill="none" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round" opacity="0.88" />
              <circle cx="45.3" cy="30.4" r="2.0" fill="#ffffff" />
              <circle cx="49.2" cy="35.0" r="0.95" fill="#e0f2fe" />

              <ellipse cx="65.4" cy="32.8" rx="5.2" ry="5.6" fill="#070a12" />
              <path d="M 61.8,35.2 Q 65.4,38.2 69.0,35.2" fill="none" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round" opacity="0.88" />
              <circle cx="63.6" cy="30.4" r="1.9" fill="#ffffff" />
              <circle cx="67.3" cy="35.0" r="0.9" fill="#e0f2fe" />
            </g>

            <!-- Piquito corto tipo botón sonriente entre los ojos (gris pizarra oscuro con sonrisa coral suave) -->
            <path d="M 52.8,35.2 C 53.2,33.2 55.8,32.5 58.5,33.2 C 61.0,33.8 62.6,35.3 62.4,36.8 C 62.1,38.4 59.5,39.5 56.8,39.5 C 54.1,39.5 52.5,37.4 52.8,35.2 Z" fill="url(#${id}-chick-beak)" stroke="#0f172a" stroke-width="0.65" />
            <path d="M 53.6,37.1 C 55.5,38.5 59.3,38.5 61.4,37.1 C 60.2,39.0 55.2,39.1 53.6,37.1 Z" fill="#ff8a75" opacity="0.92" />
            <path d="M 54.0,34.7 Q 57.5,33.6 60.8,35.4" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.85" stroke-linecap="round" />

            <!-- Cúpula cristalina del casco de burbuja con reflejos curvos -->
            <ellipse cx="55.5" cy="32.5" rx="22.8" ry="22.2" fill="url(#${id}-bubble-glass)" stroke="#bae6fd" stroke-width="1.1" stroke-opacity="0.75" />
            <path d="M 38.5,24 C 41.5,16.5 48.5,12.8 57,13.2" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="2.1" stroke-linecap="round" />
            <path d="M 71.5,39 C 69.5,45 64.5,49 58.5,50.2" fill="none" stroke="rgba(186,230,253,0.42)" stroke-width="1.3" stroke-linecap="round" />

            <!-- Sobrevisor solar dorado (NASA LEVA Gold Sun Visor) y carcasa protectora blanca levantados en la frente -->
            <path d="M 32.8,26.5 C 33.8,13.5 43.5,6.8 55.5,6.8 C 67.5,6.8 77.2,13.5 78.2,26.5 C 71.5,20.2 63.8,17.5 55.5,17.5 C 47.2,17.5 39.5,20.2 32.8,26.5 Z" fill="url(#${id}-gold-visor)" stroke="#92400e" stroke-width="0.9" />
            <path d="M 32.2,23.5 C 33.8,11.2 43.2,4.8 55.5,4.8 C 67.8,4.8 77.2,11.2 78.8,23.5 C 72.2,16.2 64.2,13.2 55.5,13.2 C 46.8,13.2 38.8,16.2 32.2,23.5 Z" fill="url(#${id}-suit-body)" stroke="#64748b" stroke-width="1.1" />
            <path d="M 43,12.5 Q 55.5,9.8 68,12.5" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" />

            <!-- Pivotes laterales metálicos del visor LEVA y lámparas EVA compactas -->
            <g>
              <rect x="28.5" y="27" width="5.8" height="10.5" rx="2.6" fill="url(#${id}-alu)" stroke="#475569" stroke-width="0.9" />
              <circle cx="31.4" cy="32.2" r="1.6" fill="#38bdf8" />
              <rect x="76.7" y="27" width="5.8" height="10.5" rx="2.6" fill="url(#${id}-alu)" stroke="#475569" stroke-width="0.9" />
              <circle cx="79.6" cy="32.2" r="1.6" fill="#38bdf8" />
            </g>
          </g>

          <!-- Aleta delantera anatómica dentro de manga EVA curva con pliegues de hombro -->
          <g class="cp-arm cp-arm-front">
            <path d="M 37,58 C 30,61 24.5,69.5 23.8,79.5 C 23.2,86.5 26,92 30,92 C 34,92 38,85.5 39.5,76.5 C 41,68.5 40,60.5 37,58 Z" fill="url(#${id}-suit-body)" stroke="#64748b" stroke-width="1.05" />
            <!-- Pliegues del hombro y franja azul de misión -->
            <path d="M 30.5,63.5 Q 35.5,65 39.2,63.2 M 28.5,67.5 Q 34.5,69 39.2,67" fill="none" stroke="#94a3b8" stroke-width="0.9" />
            <path d="M 25.2,74.5 Q 31.8,76.5 38.2,74.2" fill="none" stroke="#2563eb" stroke-width="2.1" stroke-linecap="round" />
            <!-- Punta térmica gris oscuro de la aleta EVA -->
            <path d="M 24,81.5 C 27.5,82.5 32.5,82.5 36.5,81 C 34.8,87.8 32.2,92 29.5,92 C 26,92 23.5,87.5 24,81.5 Z" fill="#334155" stroke="#1e293b" stroke-width="0.8" />
          </g>
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
