/**
 * Modelos visuales detallados para Cyberpenguins.
 * - Personaje Cyberpenguin (pingüino bebé emperador con traje espacial EVA detallado)
 * - Nave espacial con escotilla presurizada y rampa extensible
 * - 6 dispositivos reales de la NASA con detalle técnico y fidelidad histórica
 * - Escenarios planetarios realistas (La Luna con la Tierra en horizonte, Marte con Fobos/Deimos y dunas, Espacio Profundo con planeta anillado, nebulosa y asteroide 433 Eros)
 * - Muestras geológicas, sello de patita de pingüino e insignias
 */
(function (global) {
  'use strict';

  let uidCounter = 0;
  function uid(prefix) {
    uidCounter += 1;
    return `${prefix}-${uidCounter}`;
  }

  function cyberpenguin(direction) {
    const id = uid('cp');
    const flip = direction === 'left' ? 'transform="translate(110,0) scale(-1,1)"' : '';
    return `
      <svg viewBox="0 0 110 124" width="84" height="95" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.62)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-suit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f3f7ff" />
            <stop offset="55%" stop-color="#c6d3ee" />
            <stop offset="100%" stop-color="#8a9cc7" />
          </linearGradient>
          <linearGradient id="${id}-down" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#b9c6e0" />
            <stop offset="65%" stop-color="#8796b8" />
            <stop offset="100%" stop-color="#606e91" />
          </linearGradient>
          <linearGradient id="${id}-head" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#323b59" />
            <stop offset="60%" stop-color="#1c2238" />
            <stop offset="100%" stop-color="#101424" />
          </linearGradient>
          <radialGradient id="${id}-helmet" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.48)" />
            <stop offset="45%" stop-color="rgba(160,235,255,0.16)" />
            <stop offset="88%" stop-color="rgba(105,210,245,0.22)" />
            <stop offset="100%" stop-color="rgba(180,242,255,0.52)" />
          </radialGradient>
          <linearGradient id="${id}-pack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#dce4f7" />
            <stop offset="100%" stop-color="#7687b5" />
          </linearGradient>
          <linearGradient id="${id}-beak" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#2c334d" />
            <stop offset="60%" stop-color="#191e30" />
            <stop offset="100%" stop-color="#ffb86b" />
          </linearGradient>
        </defs>
        <g ${flip}>
          <!-- Sombra suave en el terreno -->
          <ellipse cx="56" cy="113" rx="28" ry="8.5" fill="url(#${id}-shadow)" />

          <!-- Mochila de soporte vital (PLSS) -->
          <rect x="20" y="50" width="18" height="36" rx="5" fill="url(#${id}-pack)" stroke="#5c6d99" stroke-width="1" />
          <rect x="23" y="54" width="5" height="24" rx="2.5" fill="#9fb0d8" />
          <rect x="29.5" y="54" width="5" height="24" rx="2.5" fill="#8294c2" />
          <rect x="22" y="57" width="13" height="5" rx="1.5" fill="#ffbe76" />
          <circle cx="25" cy="81" r="1.8" fill="#7ee8fa" />
          <circle cx="31" cy="81" r="1.8" fill="#a8e6cf" />
          <!-- Manguera lateral de oxígeno -->
          <path d="M 33,52 Q 38,48 44,53" fill="none" stroke="#a6b6dc" stroke-width="2.6" stroke-linecap="round" />

          <!-- Antena del casco -->
          <line x1="36" y1="26" x2="31" y2="10" stroke="#b6c6eb" stroke-width="2" stroke-linecap="round" />
          <circle cx="31" cy="9" r="2.6" fill="#ffbe76" />

          <!-- Patitas / Botas lunares detalladas -->
          <path d="M 37,100 Q 43,98 48,103 L 49,109 Q 40,111 33,108 Q 32,103 37,100 Z" fill="#f09a4b" stroke="#b86621" stroke-width="0.9" />
          <path d="M 55,101 Q 63,99 70,104 L 73,109 Q 63,112 54,109 Z" fill="#ffb36b" stroke="#c7752c" stroke-width="0.9" />
          <path d="M 35,107 L 48,108 M 55,108 L 71,108" stroke="#6e3c12" stroke-width="1.4" stroke-linecap="round" />

          <!-- Cuerpo rechoncho de pingüino bebé emperador con traje espacial -->
          <path d="M 34,53 C 29,68 31,94 42,102 C 51,106 64,105 73,99 C 80,91 79,66 72,53 C 66,46 42,46 34,53 Z" fill="url(#${id}-suit)" stroke="#7587b8" stroke-width="1.1" />
          <!-- Plumaje gris suave en hombros y dorso visible tras visor pectoral -->
          <path d="M 37,56 C 34,69 36,90 43,96 C 48,99 54,99 58,97 C 52,85 50,68 48,54 Z" fill="url(#${id}-down)" opacity="0.48" />
          <!-- Pecho blanco esponjoso del polluelo -->
          <path d="M 46,56 C 44,70 46,92 54,99 C 62,101 69,97 72,89 C 75,78 73,63 67,56 Z" fill="#fbfcff" />
          <path d="M 59,57 C 66,64 69,78 66,93 C 69,91 73,83 72,70 C 71,62 67,57 59,57 Z" fill="#e1e8fa" />

          <!-- Módulo pectoral de control EVA -->
          <rect x="49" y="65" width="17" height="13" rx="3.2" fill="#2c3863" stroke="#99addb" stroke-width="1" />
          <rect x="51.5" y="67.5" width="6.5" height="4" rx="1" fill="#7ee8fa" />
          <circle cx="61.5" cy="69.5" r="1.4" fill="#ffbe76" />
          <circle cx="61.5" cy="74" r="1.4" fill="#a8e6cf" />
          <rect x="51.5" y="73.2" width="6.5" height="2" rx="1" fill="#a8b9e6" />

          <!-- Aleta izquierda (primer plano) con banda de traje -->
          <path d="M 39,58 C 30,66 26,78 32,85 C 36,87 42,80 44,68 Z" fill="#90a2cf" stroke="#5d6f9e" stroke-width="1" />
          <path d="M 32,74 L 40,77" stroke="#ffbe76" stroke-width="2" stroke-linecap="round" />

          <!-- Aleta derecha (adelantada) -->
          <path d="M 70,58 C 79,66 84,78 78,84 C 74,86 68,79 67,68 Z" fill="#7587b8" stroke="#536391" stroke-width="1" />
          <path d="M 71,74 L 78,72" stroke="#7ee8fa" stroke-width="2" stroke-linecap="round" />

          <!-- Anillo metálico del cuello con remaches -->
          <ellipse cx="55" cy="53" rx="19" ry="5.5" fill="#9fb2de" stroke="#596a99" stroke-width="1.1" />
          <ellipse cx="55" cy="52" rx="16.5" ry="3.6" fill="#e3ebff" />
          <circle cx="41" cy="53" r="1" fill="#44527a" />
          <circle cx="55" cy="55.5" r="1" fill="#44527a" />
          <circle cx="69" cy="53" r="1" fill="#44527a" />

          <!-- Cabeza de pingüino bebé emperador -->
          <path d="M 38,37 C 37,24 46,16 57,17 C 68,18 73,27 72,39 C 71,47 64,51 55,51 C 45,51 39,45 38,37 Z" fill="url(#${id}-head)" />
          <!-- Mejillas blancas características del polluelo emperador -->
          <path d="M 43,34 C 42,27 48,25 54,28 C 56,33 56,43 52,47 C 46,47 43,41 43,34 Z" fill="#f7f9ff" />
          <path d="M 59,28 C 64,25 70,28 70,36 C 70,42 66,46 61,47 C 58,43 58,34 59,28 Z" fill="#e8eefc" />
          <!-- Matiz cálido sutil bajo la mejilla -->
          <path d="M 49,46 Q 55,50 63,46 Q 56,48 49,46 Z" fill="#ffd9a0" opacity="0.65" />

          <!-- Ojo expresivo con brillo doble -->
          <circle cx="63.5" cy="33.5" r="3.2" fill="#0d111f" />
          <circle cx="63.5" cy="33.5" r="2.2" fill="#1e2947" />
          <circle cx="64.5" cy="32.4" r="1.05" fill="#ffffff" />
          <circle cx="62.4" cy="34.6" r="0.5" fill="#a8e6cf" />
          <!-- Segundo ojo en perspectiva 3/4 -->
          <circle cx="50.5" cy="33.8" r="2.6" fill="#0d111f" />
          <circle cx="51.2" cy="32.9" r="0.9" fill="#ffffff" />

          <!-- Pico curvado detallado -->
          <path d="M 65,37 Q 76,37.5 79,41 Q 73,43.5 64,42.5 Z" fill="url(#${id}-beak)" />
          <path d="M 66,40.8 Q 74,41.5 77,41 Q 71,42.6 66,42 Z" fill="#ff9f6b" opacity="0.85" />

          <!-- Casco espacial esférico transparente -->
          <circle cx="55" cy="34.5" r="22.5" fill="url(#${id}-helmet)" stroke="#9beaff" stroke-width="1.8" />
          <path d="M 38,26 C 42,17 52,14 61,16" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2.2" stroke-linecap="round" />
          <ellipse cx="44" cy="23" rx="4.5" ry="2.2" transform="rotate(-32 44 23)" fill="rgba(255,255,255,0.55)" />
        </g>
      </svg>
    `;
  }

  function spaceship({ hatchOpen = true, launching = false, penguinInHatch = false, inSpaceFlight = false } = {}) {
    const id = uid('ship');
    return `
      <svg viewBox="0 0 216 196" width="166" height="150" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.65)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-hull" x1="0" y1="0" x2="1" y2="0.45">
            <stop offset="0%" stop-color="#f8faff" />
            <stop offset="48%" stop-color="#d5e0f7" />
            <stop offset="85%" stop-color="#9cb0db" />
            <stop offset="100%" stop-color="#6b7fae" />
          </linearGradient>
          <linearGradient id="${id}-wing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffb880" />
            <stop offset="60%" stop-color="#e38c52" />
            <stop offset="100%" stop-color="#9e5226" />
          </linearGradient>
          <linearGradient id="${id}-nose" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffe1a3" />
            <stop offset="100%" stop-color="#d17b2c" />
          </linearGradient>
          <linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#b8f8ff" />
            <stop offset="45%" stop-color="#359ac9" />
            <stop offset="100%" stop-color="#142d59" />
          </linearGradient>
          <linearGradient id="${id}-flame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="28%" stop-color="#fff1b8" />
            <stop offset="65%" stop-color="#ff9f43" />
            <stop offset="100%" stop-color="rgba(255,107,107,0)" />
          </linearGradient>
        </defs>

        <!-- Sombra sobre superficie planetaria (oculta en vuelo espacial) -->
        ${inSpaceFlight ? '' : `<ellipse cx="108" cy="173" rx="74" ry="15" fill="url(#${id}-shadow)" />`}

        <!-- Plumas de los 3 motores con diamantes de choque -->
        <g class="thruster-glow" style="transform-origin: 108px 146px;">
          <path d="M 74,142 Q 86,184 98,142 Z" fill="url(#${id}-flame)" opacity="0.9" />
          <path d="M 118,142 Q 130,184 142,142 Z" fill="url(#${id}-flame)" opacity="0.9" />
          <path d="M 88,144 Q 108,195 128,144 Z" fill="url(#${id}-flame)" />
          <path d="M 98,144 Q 108,176 118,144 Z" fill="#ffffff" opacity="0.92" />
          <polygon points="108,150 112,158 108,166 104,158" fill="#ffffff" opacity="0.88" />
          <polygon points="108,167 110.5,173 108,179 105.5,173" fill="#ffeaa7" opacity="0.8" />
        </g>

        <!-- Tren de aterrizaje hidráulico desplegado en superficies -->
        ${inSpaceFlight ? '' : `
          <g stroke="#566796" stroke-width="1.2">
            <!-- Pata izquierda -->
            <path d="M 62,132 L 32,165 L 39,168 L 68,137 Z" fill="#a8b9e0" />
            <line x1="72" y1="140" x2="43" y2="162" stroke="#6477a8" stroke-width="3" />
            <line x1="60" y1="145" x2="50" y2="155" stroke="#ffbe76" stroke-width="2" />
            <ellipse cx="34" cy="167" rx="13" ry="4.5" fill="#d9a559" />
            <!-- Pata derecha -->
            <path d="M 154,132 L 184,165 L 177,168 L 148,137 Z" fill="#7689bd" />
            <line x1="144" y1="140" x2="173" y2="162" stroke="#4d5e8c" stroke-width="3" />
            <line x1="156" y1="145" x2="166" y2="155" stroke="#e09c50" stroke-width="2" />
            <ellipse cx="182" cy="167" rx="13" ry="4.5" fill="#b88237" />
          </g>
        `}

        <!-- Racimo de 3 toberas principales con aros de refrigeración -->
        <g stroke="#1b2238" stroke-width="1">
          <path d="M 78,136 L 95,136 L 98,147 L 75,147 Z" fill="#323b59" />
          <path d="M 121,136 L 138,136 L 141,147 L 118,147 Z" fill="#29314a" />
          <path d="M 96,138 L 120,138 L 125,150 L 91,150 Z" fill="#3e496e" />
          <line x1="94" y1="143" x2="122" y2="143" stroke="#6f80ab" stroke-width="1.2" />
          <line x1="92" y1="147" x2="124" y2="147" stroke="#5b6b94" stroke-width="1.2" />
        </g>

        <!-- Aletas aerodinámicas laterales con actuadores -->
        <path d="M 58,86 C 39,98 25,120 27,140 L 60,133 Z" fill="url(#${id}-wing)" stroke="#9e5928" stroke-width="1.1" />
        <line x1="40" y1="126" x2="55" y2="123" stroke="#ffe1b0" stroke-width="1.3" opacity="0.75" />
        <path d="M 158,86 C 177,98 191,120 189,140 L 156,133 Z" fill="url(#${id}-wing)" stroke="#85481e" stroke-width="1.1" />
        <line x1="176" y1="126" x2="161" y2="123" stroke="#ffd294" stroke-width="1.3" opacity="0.65" />

        <!-- Antena dorsal de telemetría y plato de comunicaciones -->
        <line x1="86" y1="26" x2="82" y2="10" stroke="#b9c6e8" stroke-width="1.8" />
        <circle cx="82" cy="9" r="2" fill="#7ee8fa" />
        <line x1="130" y1="26" x2="134" y2="12" stroke="#99aad4" stroke-width="1.6" />
        <ellipse cx="135" cy="10" rx="6.5" ry="3" fill="#eef3ff" stroke="#7587b8" stroke-width="0.9" />

        <!-- Fuselaje presurizado principal -->
        <path d="M 108,14 C 80,34 60,68 55,129 C 72,143 144,143 161,129 C 156,68 136,34 108,14 Z" fill="url(#${id}-hull)" stroke="#7588b8" stroke-width="1.3" />

        <!-- Costuras estructurales, paneles y remaches -->
        <path d="M 65,78 Q 108,88 151,78" fill="none" stroke="rgba(78,95,140,0.48)" stroke-width="1.2" />
        <path d="M 59,105 Q 108,116 157,105" fill="none" stroke="rgba(78,95,140,0.35)" stroke-width="1" />
        <line x1="108" y1="40" x2="108" y2="85" stroke="rgba(95,113,160,0.32)" stroke-width="1" />
        <circle cx="72" cy="83" r="1" fill="#5e709e" />
        <circle cx="144" cy="83" r="1" fill="#5e709e" />
        <circle cx="66" cy="116" r="1" fill="#5e709e" />
        <circle cx="150" cy="116" r="1" fill="#5e709e" />

        <!-- Escudo térmico inferior teselado -->
        <path d="M 56,125 Q 108,138 160,125 L 158,132 Q 108,145 58,132 Z" fill="#2c3552" stroke="#ffbe76" stroke-width="1.3" />
        <line x1="80" y1="130" x2="79" y2="137" stroke="#536187" stroke-width="1" />
        <line x1="108" y1="133" x2="108" y2="140" stroke="#536187" stroke-width="1" />
        <line x1="136" y1="130" x2="137" y2="137" stroke="#536187" stroke-width="1" />

        <!-- Cono nasal térmico y anillo de acoplamiento -->
        <path d="M 108,14 C 98,21 90,31 84,41 Q 108,47 132,41 C 126,31 118,21 108,14 Z" fill="url(#${id}-nose)" />
        <ellipse cx="108" cy="16" rx="8" ry="2.8" fill="#5a6b99" stroke="#dfe7fa" stroke-width="0.9" />

        <!-- Bloques de control RCS delanteros y traseros -->
        <g fill="#3a476e" stroke="#8ea1cc" stroke-width="0.7">
          <rect x="69" y="48" width="8" height="6" rx="1.5" />
          <rect x="139" y="48" width="8" height="6" rx="1.5" />
          <rect x="57" y="110" width="7" height="7" rx="1.5" />
          <rect x="152" y="110" width="7" height="7" rx="1.5" />
        </g>

        <!-- Cabina panorámica con consola luminosa interior -->
        <path d="M 81,55 Q 108,42 135,55 Q 130,77 108,80 Q 86,77 81,55 Z" fill="url(#${id}-glass)" stroke="#cbeaff" stroke-width="1.4" />
        <path d="M 93,71 L 123,71" stroke="#7ee8fa" stroke-width="2" opacity="0.65" stroke-linecap="round" />
        <circle cx="99" cy="67" r="1.4" fill="#ffbe76" opacity="0.85" />
        <circle cx="117" cy="67" r="1.4" fill="#a8e6cf" opacity="0.85" />
        <path d="M 87,56 Q 102,48 114,53" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="2.2" stroke-linecap="round" />

        <!-- Escotilla presurizada interactiva -->
        ${hatchOpen ? `
          <path d="M 89,90 Q 108,85 127,90 L 129,126 Q 108,131 87,126 Z" fill="#101833" stroke="#7ee8fa" stroke-width="1.9" />
          <rect x="92" y="93" width="32" height="30" rx="4" fill="#1d2f5e" />
          <line x1="96" y1="98" x2="120" y2="98" stroke="#7ee8fa" stroke-width="1.3" opacity="0.55" />

          ${penguinInHatch ? `
            <!-- Cyberpenguin observando desde la escotilla abierta en Espacio Profundo -->
            <g>
              <path d="M 96,125 C 96,115 100,111 108,111 C 116,111 120,115 120,125 Z" fill="#dce4f7" stroke="#7587b8" stroke-width="0.9" />
              <path d="M 101,114 C 101,120 103,125 108,125 C 113,125 115,120 115,114 Z" fill="#ffffff" />
              <rect x="103" y="116" width="10" height="6" rx="1.5" fill="#2c3863" />
              <rect x="104.5" y="117.5" width="4" height="2.5" fill="#7ee8fa" />
              <!-- Cabeza y casco -->
              <circle cx="108" cy="105" r="9.5" fill="#1d243b" />
              <ellipse cx="104" cy="106" rx="3" ry="4" fill="#f7f9ff" />
              <ellipse cx="112" cy="106" rx="3" ry="4" fill="#e8eefc" />
              <circle cx="104.8" cy="104.5" r="1.4" fill="#0d111f" />
              <circle cx="111.2" cy="104.5" r="1.4" fill="#0d111f" />
              <circle cx="105.2" cy="104" r="0.5" fill="#ffffff" />
              <circle cx="111.6" cy="104" r="0.5" fill="#ffffff" />
              <polygon points="107,107 114,108.5 107.5,110.5" fill="#ffb86b" />
              <circle cx="108" cy="105" r="11.5" fill="rgba(160,235,255,0.22)" stroke="#9beaff" stroke-width="1.3" />
              <!-- Aletas apoyadas en el marco de la escotilla -->
              <ellipse cx="95" cy="123" rx="4" ry="2.6" fill="#90a2cf" />
              <ellipse cx="121" cy="123" rx="4" ry="2.6" fill="#7587b8" />
            </g>
          ` : ''}

          <!-- Puerta presurizada abierta lateralmente -->
          <path d="M 127,90 L 140,86 L 142,122 L 129,126 Z" fill="#b4c4e8" stroke="#6476a6" stroke-width="1.1" />

          ${inSpaceFlight ? '' : `
            <!-- Rampa de descenso solo cuando hay superficie planetaria -->
            <path d="M 87,126 L 129,126 L 141,153 L 75,153 Z" fill="#7ee8fa" opacity="0.88" stroke="#c8f7ff" stroke-width="1.2" />
            <line x1="84" y1="133" x2="132" y2="133" stroke="#183259" stroke-width="1.3" opacity="0.55" />
            <line x1="80" y1="142" x2="136" y2="142" stroke="#183259" stroke-width="1.3" opacity="0.55" />
          `}
        ` : `
          <path d="M 89,90 Q 108,85 127,90 L 129,126 Q 108,131 87,126 Z" fill="#8fa2cf" stroke="#ffbe76" stroke-width="1.9" />
          <circle cx="108" cy="108" r="6.5" fill="#465682" stroke="#dbe5ff" stroke-width="1.2" />
          <line x1="104" y1="108" x2="112" y2="108" stroke="#dbe5ff" stroke-width="1.4" />
          <circle cx="108" cy="108" r="2.2" fill="#ffbe76" />
        `}

        ${launching ? `
          <path d="M 88,144 Q 108,195 128,144 Z" fill="url(#${id}-flame)" />
        ` : ''}
      </svg>
    `;
  }

  // 1. Surveyor 3 (La Luna - 1967)
  function surveyor3() {
    const id = uid('surv');
    return `
      <svg viewBox="0 0 150 138" width="114" height="105" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.58)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2c4a94" />
            <stop offset="100%" stop-color="#172754" />
          </linearGradient>
          <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffe28a" />
            <stop offset="50%" stop-color="#e3a83b" />
            <stop offset="100%" stop-color="#9e6d1b" />
          </linearGradient>
          <linearGradient id="${id}-white" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#bcc8e3" />
          </linearGradient>
        </defs>

        <ellipse cx="73" cy="124" rx="48" ry="12" fill="url(#${id}-shadow)" />

        <!-- Huellas / depresiones en regolito bajo los 3 platos -->
        <ellipse cx="32" cy="119" rx="12" ry="4.5" fill="rgba(45,54,82,0.55)" />
        <ellipse cx="114" cy="119" rx="12" ry="4.5" fill="rgba(45,54,82,0.55)" />
        <ellipse cx="73" cy="126" rx="12" ry="4.5" fill="rgba(45,54,82,0.55)" />

        <!-- Armazón tubular de aluminio y 3 patas con amortiguadores -->
        <g stroke-linecap="round">
          <line x1="65" y1="74" x2="32" y2="116" stroke="#d5dff5" stroke-width="4" />
          <line x1="81" y1="74" x2="114" y2="116" stroke="#99aad1" stroke-width="4" />
          <line x1="73" y1="78" x2="73" y2="123" stroke="#b9c7e8" stroke-width="4" />
          <!-- Amortiguadores hidráulicos -->
          <line x1="69" y1="62" x2="43" y2="103" stroke="#6c7da6" stroke-width="2.2" />
          <line x1="77" y1="62" x2="103" y2="103" stroke="#5b6b91" stroke-width="2.2" />
          <!-- Platos de aluminio tipo panal -->
          <ellipse cx="32" cy="117" rx="10" ry="3.8" fill="#cbd6f0" stroke="#7d8fb8" stroke-width="1" />
          <ellipse cx="114" cy="117" rx="10" ry="3.8" fill="#a2b2d9" stroke="#6677a1" stroke-width="1" />
          <ellipse cx="73" cy="124" rx="10.5" ry="4" fill="#b8c6e8" stroke="#6f80ab" stroke-width="1" />
          <!-- Bloques crushables bajo el armazón -->
          <rect x="44" y="88" width="6" height="5" rx="1" fill="#8999c2" />
          <rect x="96" y="88" width="6" height="5" rx="1" fill="#7383ad" />
        </g>

        <!-- Chasis espacial triangular tubular -->
        <path d="M 73,42 L 54,82 L 92,82 Z" fill="none" stroke="#eef3ff" stroke-width="3.2" stroke-linejoin="round" />
        <line x1="58" y1="68" x2="88" y2="68" stroke="#c7d3ed" stroke-width="2.4" />
        <line x1="63" y1="56" x2="83" y2="56" stroke="#dce4f7" stroke-width="2" />

        <!-- Tanques esféricos de helio/retropropulsión -->
        <circle cx="67" cy="75" r="7.5" fill="#9fb0d6" stroke="#62739e" stroke-width="1" />
        <circle cx="80" cy="75" r="7.5" fill="#7f91ba" stroke="#53638c" stroke-width="1" />

        <!-- Compartimentos térmicos (Compartment A y B) -->
        <rect x="47" y="60" width="16" height="19" rx="2" fill="url(#${id}-white)" stroke="#8e9ec7" stroke-width="1" />
        <rect x="49" y="62" width="12" height="6" fill="url(#${id}-gold)" />
        <rect x="81" y="62" width="14" height="16" rx="2" fill="url(#${id}-gold)" stroke="#8c621c" stroke-width="1" />

        <!-- Mástil central, Panel Solar con cuadrícula y Antena Plana -->
        <rect x="71" y="18" width="4" height="32" fill="#cdd8f0" />
        <g transform="rotate(-12 64 16)">
          <rect x="42" y="9" width="38" height="15" rx="1.5" fill="url(#${id}-panel)" stroke="#88acf5" stroke-width="1.2" />
          <line x1="51" y1="9" x2="51" y2="24" stroke="#537ad1" stroke-width="0.9" />
          <line x1="61" y1="9" x2="61" y2="24" stroke="#537ad1" stroke-width="0.9" />
          <line x1="70" y1="9" x2="70" y2="24" stroke="#537ad1" stroke-width="0.9" />
          <line x1="42" y1="16.5" x2="80" y2="16.5" stroke="#537ad1" stroke-width="0.9" />
        </g>
        <!-- Antena planar de alta ganancia -->
        <polygon points="78,24 102,19 105,33 81,38" fill="#f5f8ff" stroke="#9aaad1" stroke-width="1" />
        <line x1="83" y1="26" x2="100" y2="22.5" stroke="#bcc9e8" stroke-width="1" />
        <line x1="84" y1="31" x2="101" y2="27.5" stroke="#bcc9e8" stroke-width="1" />

        <!-- Cámara de TV vertical con capucha espejo -->
        <rect x="59" y="34" width="6.5" height="22" rx="1.5" fill="#dfe7fa" stroke="#7d8fb8" stroke-width="0.9" />
        <path d="M 58,34 L 66,31 L 67,36 L 58,36 Z" fill="#3a4a73" />

        <!-- Brazo excavador Surface Sampler tipo pantógrafo -->
        <g stroke="#dce4f7" stroke-width="2" stroke-linecap="round">
          <line x1="92" y1="68" x2="112" y2="57" />
          <line x1="92" y1="73" x2="112" y2="62" />
          <line x1="112" y1="57" x2="128" y2="74" stroke="#b9c6e6" />
          <line x1="112" y1="62" x2="124" y2="77" stroke="#b9c6e6" />
        </g>
        <!-- Pala excavadora metálica en el extremo -->
        <path d="M 124,73 L 136,75 L 133,83 L 122,80 Z" fill="#ffb86b" stroke="#996124" stroke-width="1" />
      </svg>
    `;
  }

  // 2. Módulo Lunar Eagle del Apollo 11 (La Luna - 1969)
  function apolloEagle() {
    const id = uid('eagle');
    return `
      <svg viewBox="0 0 164 148" width="128" height="116" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.62)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-kapton" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffe694" />
            <stop offset="40%" stop-color="#eeb346" />
            <stop offset="75%" stop-color="#c97d22" />
            <stop offset="100%" stop-color="#8c5113" />
          </linearGradient>
          <linearGradient id="${id}-kapton-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#d49335" />
            <stop offset="100%" stop-color="#7a4511" />
          </linearGradient>
          <linearGradient id="${id}-ascent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#e9effc" />
            <stop offset="55%" stop-color="#aab6d1" />
            <stop offset="100%" stop-color="#697594" />
          </linearGradient>
        </defs>

        <ellipse cx="82" cy="133" rx="58" ry="13" fill="url(#${id}-shadow)" />

        <!-- Tobera del motor de descenso bajo la etapa -->
        <path d="M 73,96 L 91,96 L 96,113 L 68,113 Z" fill="#323a52" stroke="#1b2030" stroke-width="1" />

        <!-- 4 Patas de aterrizaje desplegadas con sondas de contacto -->
        <g>
          <!-- Pata trasera -->
          <line x1="82" y1="88" x2="82" y2="112" stroke="#7c8bb3" stroke-width="3" />
          <!-- Pata izquierda -->
          <line x1="54" y1="86" x2="29" y2="124" stroke="#d9a54a" stroke-width="4" stroke-linecap="round" />
          <line x1="48" y1="77" x2="36" y2="110" stroke="#aebad6" stroke-width="2.2" />
          <line x1="50" y1="98" x2="35" y2="115" stroke="#93a1c2" stroke-width="2" />
          <ellipse cx="28" cy="126" rx="12" ry="4.5" fill="#eab75b" stroke="#996419" stroke-width="1" />
          <path d="M 21,126 L 16,133" stroke="#d5dff5" stroke-width="1.2" />

          <!-- Pata derecha -->
          <line x1="110" y1="86" x2="135" y2="124" stroke="#b8822e" stroke-width="4" stroke-linecap="round" />
          <line x1="116" y1="77" x2="128" y2="110" stroke="#8b98b8" stroke-width="2.2" />
          <line x1="114" y1="98" x2="129" y2="115" stroke="#7380a3" stroke-width="2" />
          <ellipse cx="136" cy="126" rx="12" ry="4.5" fill="#c79138" stroke="#7d4f12" stroke-width="1" />
          <path d="M 143,126 L 148,133" stroke="#b5c1de" stroke-width="1.2" />

          <!-- Pata frontal principal (con la escalera) -->
          <line x1="82" y1="92" x2="82" y2="134" stroke="#f0be62" stroke-width="4.5" stroke-linecap="round" />
          <ellipse cx="82" cy="135" rx="13" ry="4.8" fill="#f3c46b" stroke="#9c661c" stroke-width="1" />
        </g>

        <!-- Etapa de Descenso octogonal con lámina Kapton dorada y textura metálica -->
        <polygon points="48,72 82,63 116,72 120,95 82,104 44,95" fill="url(#${id}-kapton)" stroke="#8a5514" stroke-width="1.1" />
        <polygon points="82,63 116,72 120,95 82,104" fill="url(#${id}-kapton-dark)" opacity="0.88" />
        <polygon points="48,72 64,68 64,100 44,95" fill="#ffda7d" opacity="0.72" />
        <!-- Pliegues y paneles térmicos negros/plateados -->
        <polygon points="56,74 62,72 62,94 55,95" fill="#2c334a" opacity="0.75" />
        <polygon points="94,74 106,76 105,94 94,96" fill="#2b3145" opacity="0.7" />
        <path d="M 65,78 L 78,82 L 70,92 Z" fill="#ffeaa3" opacity="0.35" />

        <!-- Plataforma (porche) y escalera frontal de 9 peldaños -->
        <rect x="75" y="70" width="14" height="5" rx="1" fill="#dbe3f5" stroke="#6b799e" stroke-width="0.9" />
        <g stroke="#eef3ff" stroke-width="1.4">
          <line x1="78" y1="75" x2="78" y2="127" />
          <line x1="86" y1="75" x2="86" y2="127" />
          <line x1="78" y1="81" x2="86" y2="81" />
          <line x1="78" y1="87" x2="86" y2="87" />
          <line x1="78" y1="93" x2="86" y2="93" />
          <line x1="78" y1="99" x2="86" y2="99" />
          <line x1="78" y1="105" x2="86" y2="105" />
          <line x1="78" y1="111" x2="86" y2="111" />
          <line x1="78" y1="117" x2="86" y2="117" />
          <line x1="78" y1="123" x2="86" y2="123" />
        </g>

        <!-- Etapa de Ascenso presurizada -->
        <path d="M 55,40 L 66,30 L 98,30 L 109,40 L 111,64 L 94,71 L 70,71 L 53,64 Z" fill="url(#${id}-ascent)" stroke="#556180" stroke-width="1.1" />
        <!-- Faceta lateral oscura de la cabina -->
        <path d="M 92,30 L 109,40 L 111,64 L 94,71 Z" fill="#5b6685" opacity="0.65" />
        <!-- Paneles frontales de cabina de mando -->
        <rect x="65" y="37" width="34" height="31" rx="2" fill="#cfd8ed" stroke="#6b7799" stroke-width="1" />
        <!-- 2 Ventanas triangulares inclinadas con reflejo -->
        <polygon points="68,42 79,46 68,51" fill="#16213e" stroke="#425075" stroke-width="0.9" />
        <polygon points="96,42 85,46 96,51" fill="#16213e" stroke="#425075" stroke-width="0.9" />
        <line x1="69.5" y1="43.5" x2="75.5" y2="45.8" stroke="#7ee8fa" stroke-width="0.9" opacity="0.7" />
        <!-- Escotilla cuadrada frontal -->
        <rect x="76" y="54" width="12" height="11" rx="1.2" fill="#8b98b8" stroke="#4c5778" stroke-width="1" />

        <!-- Bloques propulsores RCS (4 toberas por lado) -->
        <g fill="#424c6b" stroke="#99a6c9" stroke-width="0.7">
          <rect x="49" y="45" width="7" height="10" rx="1" />
          <polygon points="49,47 45,45 45,50 49,49" />
          <polygon points="52,45 50,40 55,40 53,45" />
          <rect x="108" y="45" width="7" height="10" rx="1" />
          <polygon points="115,47 119,45 119,50 115,49" />
          <polygon points="111,45 109,40 114,40 112,45" />
        </g>

        <!-- Antena parabólica orientable de Banda S, radar y VHF -->
        <line x1="82" y1="30" x2="82" y2="18" stroke="#b9c6e3" stroke-width="2" />
        <ellipse cx="82" cy="15" rx="12" ry="5.5" fill="#f7f9ff" stroke="#8595bd" stroke-width="1.2" />
        <line x1="82" y1="15" x2="82" y2="9" stroke="#5b6a91" stroke-width="1.4" />
        <circle cx="82" cy="8.5" r="1.5" fill="#ffbe76" />
        <!-- Radar de encuentro -->
        <line x1="68" y1="32" x2="64" y2="21" stroke="#9aa8cc" stroke-width="1.5" />
        <ellipse cx="63" cy="20" rx="5.5" ry="3" fill="#dce5fa" stroke="#6f7fa8" stroke-width="0.9" />
        <!-- Antenas VHF -->
        <line x1="99" y1="31" x2="105" y2="16" stroke="#c7d3ed" stroke-width="1" />
        <line x1="102" y1="32" x2="111" y2="21" stroke="#c7d3ed" stroke-width="1" />
      </svg>
    `;
  }

  // 3. Viking 1 Lander (Marte - 1976)
  function viking1() {
    const id = uid('vik');
    return `
      <svg viewBox="0 0 158 138" width="120" height="105" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.58)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f2f5fc" />
            <stop offset="60%" stop-color="#c0cce6" />
            <stop offset="100%" stop-color="#8493ba" />
          </linearGradient>
          <linearGradient id="${id}-rtg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffd089" />
            <stop offset="100%" stop-color="#b87328" />
          </linearGradient>
        </defs>

        <ellipse cx="78" cy="123" rx="52" ry="12" fill="url(#${id}-shadow)" />

        <!-- 3 Patas de aterrizaje con amortiguadores y platos -->
        <g>
          <line x1="52" y1="84" x2="31" y2="118" stroke="#c3d0eb" stroke-width="4.2" stroke-linecap="round" />
          <line x1="59" y1="77" x2="41" y2="113" stroke="#7d8eb8" stroke-width="2" />
          <ellipse cx="30" cy="119" rx="11" ry="4" fill="#dfe7fa" stroke="#7687b3" stroke-width="1" />

          <line x1="104" y1="84" x2="125" y2="118" stroke="#8f9fc7" stroke-width="4.2" stroke-linecap="round" />
          <line x1="97" y1="77" x2="115" y2="113" stroke="#62729c" stroke-width="2" />
          <ellipse cx="126" cy="119" rx="11" ry="4" fill="#b4c2e3" stroke="#62729c" stroke-width="1" />

          <line x1="78" y1="90" x2="78" y2="125" stroke="#a6b5db" stroke-width="4.2" stroke-linecap="round" />
          <ellipse cx="78" cy="126" rx="11" ry="4" fill="#ccd7f2" stroke="#6c7da6" stroke-width="1" />
        </g>

        <!-- Tanques de combustible esféricos laterales -->
        <ellipse cx="48" cy="79" rx="10" ry="7" fill="#a8b7db" stroke="#5b6c96" stroke-width="1" />
        <ellipse cx="108" cy="79" rx="10" ry="7" fill="#8292ba" stroke="#4d5d85" stroke-width="1" />

        <!-- Cuerpo principal hexagonal -->
        <polygon points="44,62 78,50 112,62 110,85 78,94 46,85" fill="url(#${id}-body)" stroke="#62729c" stroke-width="1.2" />
        <polygon points="78,50 112,62 110,85 78,94" fill="#8796bd" opacity="0.45" />
        <!-- Bandera / panel técnico frontal -->
        <rect x="64" y="69" width="28" height="16" rx="1.5" fill="#46547a" stroke="#b9c6e3" stroke-width="0.9" />
        <rect x="68" y="72" width="11" height="6" fill="#e6ecf8" />
        <rect x="70" y="73.5" width="7" height="1.5" fill="#4a6fb8" />

        <!-- Cubiertas de los 2 generadores RTG -->
        <rect x="36" y="63" width="16" height="16" rx="3" fill="url(#${id}-rtg)" stroke="#8c581d" stroke-width="1" />
        <line x1="40" y1="65" x2="40" y2="77" stroke="#8c581d" stroke-width="1" />
        <line x1="46" y1="65" x2="46" y2="77" stroke="#8c581d" stroke-width="1" />

        <rect x="104" y="63" width="16" height="16" rx="3" fill="url(#${id}-rtg)" stroke="#7a4c18" stroke-width="1" />
        <line x1="108" y1="65" x2="108" y2="77" stroke="#7a4c18" stroke-width="1" />
        <line x1="114" y1="65" x2="114" y2="77" stroke="#7a4c18" stroke-width="1" />

        <!-- Antena parabólica blanca de alta ganancia en mástil -->
        <line x1="78" y1="53" x2="78" y2="27" stroke="#99aad1" stroke-width="3.2" />
        <g transform="rotate(-18 78 21)">
          <ellipse cx="78" cy="21" rx="22" ry="10.5" fill="#f7faff" stroke="#94a5cc" stroke-width="1.3" />
          <ellipse cx="78" cy="21.5" rx="18" ry="8" fill="#dce5fa" />
          <line x1="65" y1="21" x2="78" y2="9" stroke="#7888b0" stroke-width="1.2" />
          <line x1="91" y1="21" x2="78" y2="9" stroke="#7888b0" stroke-width="1.2" />
          <circle cx="78" cy="8.5" r="2.2" fill="#ffbe76" />
        </g>

        <!-- 2 Cámaras cilíndricas estereoscópicas tipo periscopio -->
        <g>
          <rect x="57" y="38" width="7" height="19" rx="2" fill="#e6ecf8" stroke="#62729c" stroke-width="1" />
          <rect x="56.5" y="39" width="8" height="4.5" rx="1" fill="#2c385e" />
          <circle cx="60.5" cy="41.2" r="1.4" fill="#7ee8fa" />

          <rect x="92" y="38" width="7" height="19" rx="2" fill="#cdd8f0" stroke="#53628a" stroke-width="1" />
          <rect x="91.5" y="39" width="8" height="4.5" rx="1" fill="#2c385e" />
          <circle cx="95.5" cy="41.2" r="1.4" fill="#7ee8fa" />
        </g>

        <!-- Brazo meteorológico izquierdo -->
        <line x1="46" y1="62" x2="26" y2="43" stroke="#d5dff5" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="25" cy="42" r="2.5" fill="#7ee8fa" />

        <!-- Brazo colector de muestras de suelo extendido -->
        <path d="M 103,72 L 136,86 L 135,91 L 101,77 Z" fill="#d9e3f7" stroke="#7a8bb5" stroke-width="1" />
        <path d="M 134,85 L 146,89 L 143,96 L 131,91 Z" fill="#ffb86b" stroke="#996124" stroke-width="1" />
      </svg>
    `;
  }

  // 4. Sojourner Rover (Marte - 1997)
  function sojourner() {
    const id = uid('soj');
    return `
      <svg viewBox="0 0 152 118" width="118" height="92" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.58)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <linearGradient id="${id}-solar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2c4b9e" />
            <stop offset="55%" stop-color="#1b3170" />
            <stop offset="100%" stop-color="#11204d" />
          </linearGradient>
          <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffe085" />
            <stop offset="55%" stop-color="#e3a63b" />
            <stop offset="100%" stop-color="#9e6b16" />
          </linearGradient>
        </defs>

        <ellipse cx="76" cy="103" rx="50" ry="12" fill="url(#${id}-shadow)" />

        <!-- 3 Ruedas traseras (lado derecho del rover) -->
        <g>
          <ellipse cx="42" cy="83" rx="8.5" ry="9.5" fill="#1e2438" stroke="#536085" stroke-width="1.3" />
          <ellipse cx="70" cy="88" rx="8.5" ry="9.5" fill="#1b2033" stroke="#4c587a" stroke-width="1.3" />
          <ellipse cx="101" cy="83" rx="8.5" ry="9.5" fill="#181d2e" stroke="#455070" stroke-width="1.3" />
        </g>

        <!-- Caja electrónica cálida (WEB) revestida en Kapton dorado -->
        <polygon points="44,54 78,46 111,56 108,76 74,84 42,74" fill="url(#${id}-gold)" stroke="#8c5c14" stroke-width="1.2" />
        <polygon points="78,46 111,56 108,76 74,84" fill="#b37820" opacity="0.55" />
        <!-- Panel frontal blanco de cámaras estéreo y láser -->
        <polygon points="82,59 103,56 103,65 82,68" fill="#eef3ff" stroke="#7c8bb3" stroke-width="0.9" />
        <circle cx="88" cy="63" r="2.1" fill="#1d2847" />
        <circle cx="97" cy="61.5" r="2.1" fill="#1d2847" />
        <circle cx="92.5" cy="62.2" r="1" fill="#ff7675" />

        <!-- Sensor trasero APXS desplegado -->
        <line x1="44" y1="68" x2="25" y2="75" stroke="#c3d0eb" stroke-width="2.5" />
        <rect x="17" y="72" width="10" height="8" rx="2" fill="#8fa2cf" stroke="#4e5e8a" stroke-width="1" />
        <circle cx="19" cy="76" r="2" fill="#7ee8fa" />

        <!-- Antena de UHF trasera -->
        <line x1="49" y1="48" x2="49" y2="23" stroke="#dce5fa" stroke-width="2" stroke-linecap="round" />
        <circle cx="49" cy="22" r="2" fill="#ffbe76" />

        <!-- Cubierta superior con cuadrícula detallada de celdas solares -->
        <polygon points="35,48 79,34 119,48 75,62" fill="url(#${id}-solar)" stroke="#9ab8ff" stroke-width="1.5" />
        <g stroke="#5b86e5" stroke-width="0.85" opacity="0.85">
          <line x1="46" y1="44.5" x2="86" y2="58.5" />
          <line x1="57" y1="41" x2="97" y2="55" />
          <line x1="68" y1="37.5" x2="108" y2="51.5" />
          <line x1="49" y1="53" x2="93" y2="39" />
          <line x1="62" y1="57.5" x2="106" y2="43.5" />
        </g>

        <!-- Suspensión articulada rocker-bogie (primer plano) -->
        <g stroke="#dce5fa" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <polyline points="51,90 66,73 84,82" />
          <polyline points="66,73 91,68 111,87" />
        </g>

        <!-- 3 Ruedas delanteras detalladas con tacos metálicos y bujes -->
        <g>
          <ellipse cx="51" cy="91" rx="9" ry="10.2" fill="#2d354f" stroke="#7c8bb3" stroke-width="1.5" />
          <ellipse cx="51" cy="91" rx="4.2" ry="4.8" fill="#8ea1cc" />
          <circle cx="51" cy="91" r="1.7" fill="#ffbe76" />

          <ellipse cx="83" cy="95" rx="9" ry="10.2" fill="#283047" stroke="#7c8bb3" stroke-width="1.5" />
          <ellipse cx="83" cy="95" rx="4.2" ry="4.8" fill="#8ea1cc" />
          <circle cx="83" cy="95" r="1.7" fill="#ffbe76" />

          <ellipse cx="111" cy="87" rx="8.8" ry="10" fill="#242b40" stroke="#7c8bb3" stroke-width="1.5" />
          <ellipse cx="111" cy="87" rx="4" ry="4.6" fill="#8ea1cc" />
          <circle cx="111" cy="87" r="1.6" fill="#ffbe76" />
        </g>
      </svg>
    `;
  }

  // 5. Pioneer 10 (Espacio Profundo - 1972)
  function pioneer10() {
    const id = uid('pio');
    return `
      <svg viewBox="0 0 176 144" width="136" height="112" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(3,6,18,0.45)" />
            <stop offset="100%" stop-color="rgba(3,6,18,0)" />
          </radialGradient>
          <radialGradient id="${id}-dish" cx="42%" cy="38%" r="65%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="55%" stop-color="#dfe7fa" />
            <stop offset="100%" stop-color="#9fb0d9" />
          </radialGradient>
          <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffe494" />
            <stop offset="100%" stop-color="#c48629" />
          </linearGradient>
        </defs>

        <ellipse cx="84" cy="126" rx="44" ry="10" fill="url(#${id}-shadow)" />

        <!-- Brazo largo en celosía del magnetómetro (6.6 m) -->
        <g stroke="#b6c6eb" stroke-width="1.4">
          <line x1="94" y1="74" x2="160" y2="96" />
          <line x1="92" y1="79" x2="158" y2="100" />
          <line x1="108" y1="79" x2="106" y2="83" />
          <line x1="124" y1="84" x2="122" y2="88" />
          <line x1="140" y1="89" x2="138" y2="93" />
        </g>
        <circle cx="161" cy="98" r="5" fill="#7ee8fa" stroke="#ffffff" stroke-width="1" />

        <!-- Brazos de generadores RTG SNAP-19 -->
        <g>
          <line x1="65" y1="70" x2="22" y2="84" stroke="#a8b8de" stroke-width="2.5" />
          <rect x="11" y="79" width="16" height="10" rx="2" transform="rotate(-17 19 84)" fill="#3b476e" stroke="#8597c4" stroke-width="1" />
          <line x1="15" y1="80" x2="17" y2="89" stroke="#ffbe76" stroke-width="1.2" />

          <line x1="75" y1="80" x2="48" y2="115" stroke="#8f9fc7" stroke-width="2.5" />
          <rect x="38" y="110" width="16" height="10" rx="2" transform="rotate(-52 46 115)" fill="#354063" stroke="#7c8eb8" stroke-width="1" />
          <line x1="43" y1="111" x2="49" y2="119" stroke="#ffbe76" stroke-width="1.2" />
        </g>

        <!-- Compartimento hexagonal trasero con manta dorada y la Placa de la Pioneer -->
        <polygon points="68,61 92,56 108,68 103,88 80,93 64,80" fill="url(#${id}-gold)" stroke="#8c5a18" stroke-width="1.2" />
        <polygon points="84,69 98,66 99,79 85,82" fill="#ffd978" stroke="#7a4c10" stroke-width="0.9" />
        <!-- Silueta grabada de la Placa de la Pioneer -->
        <circle cx="90" cy="74" r="1.4" fill="#6b420b" />
        <line x1="93" y1="71" x2="93" y2="77" stroke="#6b420b" stroke-width="1" />
        <line x1="96" y1="72" x2="96" y2="77" stroke="#6b420b" stroke-width="1" />

        <!-- Gran antena parabólica cóncava (2.74 m) con nervaduras radiales -->
        <g transform="rotate(-16 80 45)">
          <ellipse cx="80" cy="46" rx="44" ry="26" fill="url(#${id}-dish)" stroke="#8a9bc4" stroke-width="1.5" />
          <ellipse cx="80" cy="47" rx="38" ry="21" fill="none" stroke="rgba(125,144,191,0.35)" stroke-width="1" />
          <line x1="39" y1="46" x2="121" y2="46" stroke="rgba(125,144,191,0.28)" stroke-width="0.9" />
          <line x1="80" y1="22" x2="80" y2="70" stroke="rgba(125,144,191,0.28)" stroke-width="0.9" />
          <!-- Trípode de alimentación -->
          <line x1="56" y1="53" x2="80" y2="14" stroke="#7687b3" stroke-width="2" />
          <line x1="104" y1="53" x2="80" y2="14" stroke="#5b6b94" stroke-width="2" />
          <line x1="80" y1="64" x2="80" y2="14" stroke="#8d9ec9" stroke-width="2" />
          <rect x="75" y="10" width="10" height="7" rx="2" fill="#ffb86b" stroke="#8f5b1e" stroke-width="1" />
        </g>
      </svg>
    `;
  }

  // 6. NEAR Shoemaker sobre el Asteroide 433 Eros (Espacio Profundo - 2001)
  function nearShoemaker() {
    const id = uid('near');
    return `
      <svg viewBox="0 0 176 146" width="136" height="114" aria-hidden="true">
        <defs>
          <linearGradient id="${id}-eros" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#9caab8" />
            <stop offset="55%" stop-color="#6d7c8f" />
            <stop offset="100%" stop-color="#3c4759" />
          </linearGradient>
          <linearGradient id="${id}-solar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#345ab5" />
            <stop offset="100%" stop-color="#192d63" />
          </linearGradient>
          <linearGradient id="${id}-kapton" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffe28c" />
            <stop offset="100%" stop-color="#b87821" />
          </linearGradient>
        </defs>

        <!-- Superficie orgánica craterizada del asteroide 433 Eros -->
        <path d="M 16,112 C 26,90 62,82 96,86 C 128,89 156,99 160,115 C 154,132 114,138 78,136 C 42,135 20,126 16,112 Z" fill="url(#${id}-eros)" stroke="#4c5a6e" stroke-width="1.2" />
        <!-- Cráteres realistas en 433 Eros -->
        <ellipse cx="48" cy="108" rx="14" ry="6" fill="#4b5769" stroke="#9eb0c2" stroke-width="0.9" />
        <ellipse cx="122" cy="111" rx="17" ry="7" fill="#465263" stroke="#96a7ba" stroke-width="0.9" />
        <ellipse cx="86" cy="122" rx="10" ry="4" fill="#3a4554" />
        <circle cx="67" cy="116" r="2.6" fill="#8999ab" />
        <circle cx="105" cy="104" r="2" fill="#aab9c7" />

        <!-- Sombra de la sonda sobre Eros -->
        <ellipse cx="88" cy="96" rx="34" ry="8" fill="rgba(18,24,38,0.6)" />

        <!-- 2 Paneles solares traseros -->
        <g>
          <polygon points="62,52 22,36 28,22 68,40" fill="url(#${id}-solar)" stroke="#8eb4ff" stroke-width="1.1" />
          <line x1="36" y1="32" x2="41" y2="43" stroke="#5c88e6" stroke-width="0.9" />
          <line x1="50" y1="36" x2="55" y2="47" stroke="#5c88e6" stroke-width="0.9" />

          <polygon points="114,52 154,36 148,22 108,40" fill="url(#${id}-solar)" stroke="#7ea6f5" stroke-width="1.1" />
          <line x1="126" y1="36" x2="121" y2="47" stroke="#527ad4" stroke-width="0.9" />
          <line x1="140" y1="32" x2="135" y2="43" stroke="#527ad4" stroke-width="0.9" />
        </g>

        <!-- Cuerpo prismático octogonal revestido en Kapton dorado y paneles térmicos -->
        <polygon points="66,48 88,41 110,48 108,82 88,89 68,82" fill="#dce4f5" stroke="#5c6b94" stroke-width="1.2" />
        <polygon points="88,41 110,48 108,82 88,89" fill="#9fb0d6" opacity="0.6" />
        <polygon points="73,56 88,52 103,56 102,77 88,82 74,77" fill="url(#${id}-kapton)" stroke="#8f5c1a" stroke-width="1" />
        <!-- Instrumento óptico / espectrómetro en la cara frontal -->
        <circle cx="88" cy="67" r="4.5" fill="#232c47" stroke="#dfe7fa" stroke-width="1" />
        <circle cx="88" cy="67" r="2" fill="#7ee8fa" />

        <!-- Antena parabólica fija superior de 1.5 m -->
        <ellipse cx="88" cy="31" rx="22" ry="9" fill="#f7faff" stroke="#8596bf" stroke-width="1.3" />
        <ellipse cx="88" cy="31.5" rx="17" ry="6.5" fill="#dbe4f8" />
        <line x1="78" y1="31" x2="88" y2="17" stroke="#6f80ab" stroke-width="1.5" />
        <line x1="98" y1="31" x2="88" y2="17" stroke="#6f80ab" stroke-width="1.5" />
        <circle cx="88" cy="16.5" r="2" fill="#ffbe76" />

        <!-- 2 Paneles solares delanteros -->
        <g>
          <polygon points="68,70 30,94 22,82 62,58" fill="url(#${id}-solar)" stroke="#96baff" stroke-width="1.2" />
          <line x1="36" y1="74" x2="43" y2="85" stroke="#6691eb" stroke-width="0.9" />
          <line x1="50" y1="66" x2="57" y2="77" stroke="#6691eb" stroke-width="0.9" />

          <polygon points="108,70 146,94 154,82 114,58" fill="url(#${id}-solar)" stroke="#84aaf5" stroke-width="1.2" />
          <line x1="140" y1="74" x2="133" y2="85" stroke="#5880d9" stroke-width="0.9" />
          <line x1="126" y1="66" x2="119" y2="77" stroke="#5880d9" stroke-width="0.9" />
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
    const mx = ((x1 + 3 * cx1 + 3 * cx2 + x2) / 8).toFixed(1);
    const my = ((y1 + 3 * cy1 + 3 * cy2 + y2) / 8).toFixed(1);
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
      <path d="${pathD}" fill="none" stroke="rgba(126,232,250,0.28)" stroke-width="6.5" stroke-linecap="round" filter="url(#evaTetherGlow)" />
      <path d="${pathD}" fill="none" stroke="#dbe7ff" stroke-width="2.6" stroke-linecap="round" />
      <path d="${pathD}" fill="none" stroke="#93c5fd" stroke-width="1.1" stroke-linecap="round" stroke-opacity="0.85" />
      <circle cx="${mx}" cy="${my}" r="3.2" fill="#7ee8fa" stroke="#0c152b" stroke-width="1.2" />
      <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="4.2" fill="#ffbe76" stroke="#182747" stroke-width="1.4" />
    `;
  }

  // Superficies planetarias continuas y escenario de espacio profundo
  function stageBackdrop(chapterId, siteId) {
    const id = uid('bg');

    if (chapterId === 'moon') {
      const isTranquility = siteId === 'mare-tranquillitatis';
      return `
        <svg class="iso-backdrop" viewBox="0 0 1000 594" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#03050e" />
              <stop offset="70%" stop-color="#0a0f21" />
              <stop offset="100%" stop-color="#171f38" />
            </linearGradient>
            <radialGradient id="${id}-earth" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#7cd0ff" />
              <stop offset="52%" stop-color="#2268b8" />
              <stop offset="86%" stop-color="#0e2954" />
              <stop offset="100%" stop-color="#040a1a" />
            </radialGradient>
            <linearGradient id="${id}-regolith" x1="0.2" y1="0" x2="0.6" y2="1">
              <stop offset="0%" stop-color="${isTranquility ? '#bac2d4' : '#c3cadb'}" />
              <stop offset="35%" stop-color="${isTranquility ? '#929cb3' : '#9ca4b8'}" />
              <stop offset="75%" stop-color="${isTranquility ? '#6b758f' : '#767f96'}" />
              <stop offset="100%" stop-color="${isTranquility ? '#4c556e' : '#535c73'}" />
            </linearGradient>
            <radialGradient id="${id}-crater" cx="62%" cy="62%" r="65%">
              <stop offset="0%" stop-color="#b4bcd1" />
              <stop offset="55%" stop-color="#717a94" />
              <stop offset="100%" stop-color="#373e54" />
            </radialGradient>
          </defs>

          <!-- Cielo espacial lunar -->
          <rect x="0" y="0" width="1000" height="594" fill="url(#${id}-sky)" />
          <g fill="#f1f5f9" opacity="0.72">
            <circle cx="65" cy="42" r="1.3" />
            <circle cx="145" cy="84" r="1.0" fill="#ffeaa7" />
            <circle cx="220" cy="36" r="1.4" />
            <circle cx="315" cy="70" r="1.0" />
            <circle cx="420" cy="44" r="1.3" fill="#dbeafe" />
            <circle cx="535" cy="28" r="1.2" />
            <circle cx="620" cy="76" r="1.0" />
            <circle cx="705" cy="40" r="1.3" />
            <circle cx="928" cy="58" r="1.5" />
            <circle cx="965" cy="92" r="1.1" fill="#e2e8f0" />
          </g>

          <!-- La Tierra visible desde la ubicación lunar activa -->
          <g transform="${isTranquility ? 'translate(-445 -10)' : 'translate(0 0)'}">
            <circle cx="818" cy="96" r="50" fill="rgba(90,175,255,0.22)" />
            <circle cx="818" cy="96" r="40" fill="url(#${id}-earth)" />
            <path d="M 794,78 C 805,73 814,81 820,91 C 811,99 802,102 794,93 Z" fill="#5ca88a" opacity="0.72" />
            <path d="M 824,70 C 836,72 845,81 843,95 C 834,99 826,93 824,80 Z" fill="#68b594" opacity="0.65" />
            <path d="M 786,83 Q 814,76 842,85" fill="none" stroke="rgba(255,255,255,0.74)" stroke-width="3.2" stroke-linecap="round" />
            <path d="M 792,102 Q 820,95 846,104" fill="none" stroke="rgba(255,255,255,0.58)" stroke-width="2.5" stroke-linecap="round" />
            <path d="M 824,56 A 40,40 0 0,1 824,136 A 24,40 0 0,0 824,56 Z" fill="rgba(4,8,22,0.58)" />
          </g>

          ${isTranquility ? `
            <!-- Borde sur del Mar de la Tranquilidad: montes y llanura de alunizaje -->
            <path d="M 0,248 Q 160,180 310,206 Q 470,154 630,192 Q 820,162 1000,240 L 1000,315 L 0,315 Z" fill="#2e3754" />
            <path d="M 0,256 Q 210,194 420,214 Q 610,176 815,204 Q 920,195 1000,252 L 1000,330 L 0,330 Z" fill="#465170" />
            <!-- Superficie continua de la Luna (Mar de la Tranquilidad) -->
            <path d="M 0,250 Q 500,176 1000,250 L 1000,594 L 0,594 Z" fill="url(#${id}-regolith)" />
            <ellipse cx="480" cy="390" rx="340" ry="96" fill="#6d7791" opacity="0.28" />
            <!-- Cráter rocoso Little West al borde sur del Mar de la Tranquilidad -->
            <g>
              <ellipse cx="775" cy="300" rx="82" ry="28" fill="#bec6db" />
              <ellipse cx="775" cy="303" rx="68" ry="21" fill="url(#${id}-crater)" />
              <path d="M 728,312 L 739,296 L 751,310 Z" fill="#515b78" />
              <path d="M 804,316 L 814,302 L 826,315 Z" fill="#49526e" />
            </g>
            <ellipse cx="265" cy="455" rx="44" ry="15" fill="#aeb7cc" />
            <ellipse cx="265" cy="457" rx="35" ry="11" fill="url(#${id}-crater)" />
            <ellipse cx="430" cy="290" rx="22" ry="8" fill="#bac2d6" />
            <ellipse cx="430" cy="291" rx="16" ry="5.5" fill="url(#${id}-crater)" />
          ` : `
            <!-- Océano de las Tormentas: extensa planicie basáltica y cráteres de Surveyor -->
            <path d="M 0,248 Q 130,202 260,216 Q 380,184 500,204 Q 635,176 770,210 Q 890,194 1000,244 L 1000,310 L 0,310 Z" fill="#2d354f" />
            <path d="M 0,256 Q 175,212 355,224 Q 515,196 680,220 Q 845,208 1000,255 L 1000,330 L 0,330 Z" fill="#4b5573" />
            <!-- Superficie continua de la Luna (Océano de las Tormentas) -->
            <path d="M 0,250 Q 500,176 1000,250 L 1000,594 L 0,594 Z" fill="url(#${id}-regolith)" />
            <ellipse cx="260" cy="360" rx="240" ry="78" fill="#77819c" opacity="0.36" />
            <ellipse cx="670" cy="355" rx="195" ry="68" fill="#636d88" opacity="0.32" />
            <path d="M 0,470 Q 320,425 650,485 Q 840,515 1000,475 L 1000,594 L 0,594 Z" fill="rgba(45,52,74,0.22)" />
            <!-- Cráteres suaves del Océano de las Tormentas -->
            <g>
              <ellipse cx="640" cy="322" rx="92" ry="30" fill="#c8cfe0" />
              <ellipse cx="640" cy="325" rx="78" ry="24" fill="url(#${id}-crater)" />
              <ellipse cx="345" cy="448" rx="56" ry="20" fill="#aeb7cc" />
              <ellipse cx="345" cy="450" rx="46" ry="15" fill="url(#${id}-crater)" />
              <ellipse cx="148" cy="312" rx="38" ry="13" fill="#bec6d9" />
              <ellipse cx="148" cy="313" rx="31" ry="9.5" fill="url(#${id}-crater)" />
              <ellipse cx="865" cy="472" rx="48" ry="17" fill="#9ea8bf" />
              <ellipse cx="865" cy="474" rx="39" ry="13" fill="url(#${id}-crater)" />
            </g>
          `}

          <!-- Rocas lunares semienterradas con reborde de regolito -->
          <g>
            <ellipse cx="424" cy="512" rx="22" ry="6" fill="rgba(26,31,48,0.42)" />
            <path d="M 408,511 Q 414,491 429,493 Q 440,500 438,512 Z" fill="#6c7591" stroke="#aeb7cf" stroke-width="1" />
            <path d="M 405,512 Q 424,507 441,512 Q 424,516 405,512 Z" fill="#8b95b2" />
            <ellipse cx="290" cy="288" rx="14" ry="4" fill="rgba(26,31,48,0.34)" />
            <path d="M 279,288 Q 284,275 295,278 Q 300,283 298,288 Z" fill="#77819e" />
            <path d="M 277,288 Q 289,285 301,288 Q 289,291 277,288 Z" fill="#9da7c4" />
          </g>
        </svg>
      `;
    }

    if (chapterId === 'mars') {
      const isAresVallis = siteId === 'ares-vallis';
      // Superficie continua de Marte (sin forma cuadrada ni rojo saturado)
      return `
        <svg class="iso-backdrop" viewBox="0 0 1000 594" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#12152e" />
              <stop offset="55%" stop-color="${isAresVallis ? '#332c54' : '#2c294f'}" />
              <stop offset="100%" stop-color="${isAresVallis ? '#786280' : '#695678'}" />
            </linearGradient>
            <linearGradient id="${id}-surface" x1="0.2" y1="0" x2="0.6" y2="1">
              <stop offset="0%" stop-color="${isAresVallis ? '#edd0b7' : '#f0d3bc'}" />
              <stop offset="35%" stop-color="${isAresVallis ? '#c9a6bf' : '#cfacc4'}" />
              <stop offset="72%" stop-color="${isAresVallis ? '#967ea6' : '#9e87ad'}" />
              <stop offset="100%" stop-color="#756388" />
            </linearGradient>
            <radialGradient id="${id}-crater" cx="60%" cy="60%" r="65%">
              <stop offset="0%" stop-color="#dec2cc" />
              <stop offset="60%" stop-color="#8c759c" />
              <stop offset="100%" stop-color="#4e3f5e" />
            </radialGradient>
          </defs>

          <!-- Cielo marciano con polvo atmosférico tenue y estrellas -->
          <rect x="0" y="0" width="1000" height="594" fill="url(#${id}-sky)" />
          <g fill="#fff4e6" opacity="0.65">
            <circle cx="95" cy="42" r="1.3" />
            <circle cx="290" cy="64" r="1" />
            <circle cx="480" cy="36" r="1.4" />
            <circle cx="645" cy="76" r="1.1" />
            <circle cx="885" cy="48" r="1.4" />
          </g>

          <!-- Lunas de Marte: Fobos y Deimos -->
          <g>
            <path d="M 185,78 C 195,69 211,71 217,83 C 219,93 209,101 196,100 C 184,98 179,86 185,78 Z" fill="#bfa8c9" stroke="#7d698a" stroke-width="1" />
            <circle cx="200" cy="84" r="4" fill="#826c8f" />
            <circle cx="192" cy="91" r="2.2" fill="#826c8f" />
            <circle cx="272" cy="56" r="5.5" fill="#d9c6b8" />
          </g>

          ${isAresVallis ? `
            <!-- Colinas Twin Peaks características en el horizonte de Ares Vallis -->
            <path d="M 0,254 L 180,226 L 295,180 L 385,222 L 455,172 L 545,222 L 730,204 L 885,222 L 1000,248 L 1000,320 L 0,320 Z" fill="#544469" opacity="0.86" />
            <!-- Superficie continua de Marte (Ares Vallis) -->
            <path d="M 0,250 Q 500,176 1000,250 L 1000,594 L 0,594 Z" fill="url(#${id}-surface)" />
            <!-- Antiguo cauce de inundación en Ares Vallis -->
            <path d="M 180,594 Q 440,420 790,260 L 920,275 Q 590,450 385,594 Z" fill="rgba(96,78,120,0.22)" />
            <path d="M 40,385 Q 320,330 620,375 Q 830,406 1000,370" fill="none" stroke="#f7dec8" stroke-width="4.5" opacity="0.38" stroke-linecap="round" />
            <!-- Rocas y bloques semienterrados arrastrados por inundación alrededor de Sojourner -->
            <g>
              <ellipse cx="525" cy="383" rx="24" ry="5.5" fill="rgba(48,38,66,0.34)" />
              <path d="M 508,383 C 510,365 528,361 541,369 C 546,374 544,383 529,384 Z" fill="#92d4be" stroke="#5da38d" stroke-width="1" />
              <path d="M 504,383 Q 525,378 545,383 Q 525,388 504,383 Z" fill="#b495b8" />
              <ellipse cx="781" cy="403" rx="30" ry="6.5" fill="rgba(48,38,66,0.34)" />
              <path d="M 758,403 C 760,377 786,371 802,383 C 809,391 805,403 786,404 Z" fill="#b398b8" stroke="#7d6685" stroke-width="1" />
              <path d="M 754,403 Q 781,397 807,403 Q 781,409 754,403 Z" fill="#9e82a8" />
              <ellipse cx="615" cy="457" rx="19" ry="4.8" fill="rgba(48,38,66,0.32)" />
              <path d="M 601,457 C 604,443 622,441 629,449 C 632,453 628,458 613,458 Z" fill="#ebd0be" />
              <path d="M 598,457 Q 615,453 632,457 Q 615,461 598,457 Z" fill="#a88db0" />
            </g>
          ` : `
            <!-- Mesetas bajas en el horizonte de Chryse Planitia (Viking 1) -->
            <path d="M 0,252 L 125,212 L 245,214 L 315,238 L 485,204 L 620,206 L 710,232 L 845,206 L 945,212 L 1000,248 L 1000,320 L 0,320 Z" fill="#4f4163" opacity="0.78" />
            <!-- Superficie continua de Marte (Chryse Planitia) -->
            <path d="M 0,250 Q 500,176 1000,250 L 1000,594 L 0,594 Z" fill="url(#${id}-surface)" />
            <!-- Dunas eólicas continuas de Chryse Planitia -->
            <path d="M 0,335 Q 190,285 385,325 Q 585,365 785,315 Q 905,288 1000,315" fill="none" stroke="#f7dec8" stroke-width="6" opacity="0.45" stroke-linecap="round" />
            <path d="M 65,415 Q 290,368 515,412 Q 745,455 960,398" fill="none" stroke="#856f96" stroke-width="5" opacity="0.34" stroke-linecap="round" />
            <path d="M 140,515 Q 420,468 725,515 Q 875,536 1000,505" fill="none" stroke="#f7dec8" stroke-width="5" opacity="0.35" stroke-linecap="round" />
            <!-- Cráter marciano erosionado -->
            <ellipse cx="445" cy="285" rx="58" ry="20" fill="#e6c6b3" />
            <ellipse cx="445" cy="287" rx="47" ry="15" fill="url(#${id}-crater)" />
            <!-- Rocas semienterradas de Chryse Planitia -->
            <g>
              <ellipse cx="235" cy="307" rx="19" ry="4.8" fill="rgba(48,38,66,0.3)" />
              <path d="M 220,307 C 223,291 240,289 249,297 C 253,302 248,308 231,308 Z" fill="#ebd0be" stroke="#a6897c" stroke-width="0.9" />
              <path d="M 218,307 Q 235,303 252,307 Q 235,311 218,307 Z" fill="#cca9b8" />
              <ellipse cx="835" cy="513" rx="23" ry="5.5" fill="rgba(48,38,66,0.34)" />
              <path d="M 818,513 C 821,495 840,493 850,502 C 854,508 847,514 830,514 Z" fill="#7d6d94" />
              <path d="M 815,513 Q 835,508 854,513 Q 835,518 815,513 Z" fill="#89729c" />
            </g>
          `}
        </svg>
      `;
    }

    // Espacio Profundo: SIN superficie ni plataforma. Diferenciado según Pioneer 10 (rumbo a Aldebarán) o NEAR Shoemaker (433 Eros).
    const isErosSite = siteId === 'asteroid-eros';
    return `
      <svg class="iso-backdrop" viewBox="0 0 1000 594" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-space" cx="35%" cy="30%" r="85%">
            <stop offset="0%" stop-color="#192352" />
            <stop offset="48%" stop-color="#090f24" />
            <stop offset="100%" stop-color="#03050f" />
          </radialGradient>
          <radialGradient id="${id}-nebula1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(126,232,250,0.24)" />
            <stop offset="50%" stop-color="rgba(168,230,207,0.10)" />
            <stop offset="100%" stop-color="rgba(12,18,45,0)" />
          </radialGradient>
          <radialGradient id="${id}-nebula2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(195,177,225,0.24)" />
            <stop offset="55%" stop-color="rgba(255,190,118,0.08)" />
            <stop offset="100%" stop-color="rgba(12,18,45,0)" />
          </radialGradient>
          <radialGradient id="${id}-aldebaran" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fff4db" />
            <stop offset="30%" stop-color="#ffb870" />
            <stop offset="68%" stop-color="rgba(242,126,74,0.65)" />
            <stop offset="100%" stop-color="rgba(242,126,74,0)" />
          </radialGradient>
        </defs>

        <!-- Vacío del espacio profundo sin plano de suelo -->
        <rect x="0" y="0" width="1000" height="594" fill="url(#${id}-space)" />

        <!-- Nebulosas cósmicas difusas -->
        <ellipse cx="280" cy="220" rx="310" ry="145" transform="rotate(-18 280 220)" fill="url(#${id}-nebula1)" />
        ${isErosSite ? '' : `<ellipse cx="690" cy="360" rx="280" ry="135" transform="rotate(14 690 360)" fill="url(#${id}-nebula2)" />`}

        <!-- Campo estelar multicapa en el espacio profundo (evitando la silueta de 433 Eros) -->
        <g>
          <circle cx="72" cy="64" r="1.6" fill="#ffffff" />
          <circle cx="148" cy="186" r="1.1" fill="#dbeafe" />
          <circle cx="194" cy="458" r="1.4" fill="#ffeaa7" />
          <circle cx="310" cy="92" r="1.2" fill="#ffffff" />
          <circle cx="364" cy="312" r="1.0" fill="#e2e8f0" />
          <circle cx="430" cy="510" r="1.4" fill="#ffffff" />
          <circle cx="520" cy="68" r="1.3" fill="#ffbe76" />
          ${isErosSite ? '' : `<circle cx="585" cy="240" r="1" fill="#ffffff" />`}
          ${isErosSite ? '' : `<circle cx="628" cy="482" r="1.3" fill="#c3b1e1" />`}
          <circle cx="715" cy="82" r="1.4" fill="#ffffff" />
          <circle cx="885" cy="248" r="1.2" fill="#dbeafe" />
          <circle cx="932" cy="435" r="1.5" fill="#ffffff" />
          <circle cx="96" cy="520" r="1.1" fill="#ffeaa7" />
          <circle cx="495" cy="184" r="1.1" fill="#e2e8f0" />
        </g>

        ${isErosSite ? `
          <!-- Fragmentos rocosos menores alrededor del asteroide 433 Eros -->
          <g fill="#728296" stroke="#9eb0c4" stroke-width="0.9" opacity="0.85">
            <path d="M 155,148 L 172,140 L 180,154 L 164,162 Z" />
            <path d="M 380,126 L 392,120 L 398,131 L 385,137 Z" />
            <path d="M 865,168 L 886,158 L 895,175 L 874,183 Z" />
            <circle cx="295" cy="465" r="3.5" />
            <circle cx="515" cy="175" r="2.8" />
          </g>
        ` : `
          <!-- Galaxia espiral lejana -->
          <g transform="translate(215 128) rotate(-22)" opacity="0.65">
            <ellipse cx="0" cy="0" rx="52" ry="18" fill="rgba(195,177,225,0.25)" />
            <ellipse cx="0" cy="0" rx="24" ry="8" fill="rgba(255,232,195,0.55)" />
            <circle cx="0" cy="0" r="5" fill="#fff6db" />
          </g>
          <!-- Estrella gigante roja lejana Aldebarán (~65 años luz, sin línea para mantener la sensación de distancia) -->
          <g>
            <circle cx="922" cy="78" r="16" fill="url(#${id}-aldebaran)" opacity="0.78" />
            <line x1="908" y1="78" x2="936" y2="78" stroke="rgba(255,212,168,0.58)" stroke-width="0.9" />
            <line x1="922" y1="64" x2="922" y2="92" stroke="rgba(255,212,168,0.58)" stroke-width="0.9" />
            <circle cx="922" cy="78" r="3.2" fill="#ff8a54" stroke="rgba(255,235,205,0.75)" stroke-width="0.7" />
            <circle cx="922" cy="78" r="1.4" fill="#fff5e0" />
          </g>
        `}
      </svg>
    `;
  }

  // Escenas cinemáticas de despegue, salida de la atmósfera y viaje entre cuerpos celestes
  function travelCinematicSvg(phaseKey) {
    return `
      <div class="cine-crossfade">
        <div class="cine-camera-drift">
          ${renderTravelPhaseSvg(phaseKey)}
        </div>
      </div>
    `;
  }

  function renderTravelPhaseSvg(phaseKey) {
    const id = uid('cine');

    if (phaseKey === 'earth-liftoff') {
      return `
        <svg viewBox="0 0 900 500" class="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0b183d" />
              <stop offset="45%" stop-color="#1e4d92" />
              <stop offset="100%" stop-color="#69b8eb" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="900" height="500" fill="url(#${id}-sky)" />
          <!-- Nubes terrestres y horizonte -->
          <path d="M 0,405 Q 180,382 360,398 Q 620,418 900,388 L 900,500 L 0,500 Z" fill="#2c425e" />
          <ellipse cx="180" cy="310" rx="120" ry="26" fill="rgba(255,255,255,0.22)" />
          <ellipse cx="710" cy="270" rx="145" ry="28" fill="rgba(255,255,255,0.18)" />
          <!-- Torre umbilical de la Tierra -->
          <rect x="330" y="190" width="28" height="225" fill="#4e5d8c" stroke="#8599cf" stroke-width="1.5" />
          <line x1="358" y1="230" x2="405" y2="215" stroke="#b9c6e8" stroke-width="5" />
          <!-- Nubes expansivas de vapor y llamas en plataforma -->
          <g class="cine-steam-puff">
            <circle cx="390" cy="410" r="36" fill="rgba(255,244,225,0.68)" />
            <circle cx="450" cy="405" r="46" fill="rgba(255,220,175,0.75)" />
            <circle cx="515" cy="410" r="38" fill="rgba(255,244,225,0.68)" />
          </g>
          <!-- Nave ascendiendo en despegue terrestre -->
          <g class="cine-ship-ascend">
            <g transform="translate(367 165)">
              ${spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
            </g>
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'atmosphere-exit') {
      return `
        <svg viewBox="0 0 900 500" class="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-space" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#03050f" />
              <stop offset="65%" stop-color="#0a1638" />
              <stop offset="100%" stop-color="#194a8f" />
            </linearGradient>
            <radialGradient id="${id}-earth-limb" cx="50%" cy="100%" r="85%">
              <stop offset="0%" stop-color="#7ce0ff" />
              <stop offset="55%" stop-color="#286dc4" />
              <stop offset="100%" stop-color="#0a1a40" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="900" height="500" fill="url(#${id}-space)" />
          <g fill="#ffffff" opacity="0.88">
            <circle cx="95" cy="54" r="1.5" />
            <circle cx="235" cy="96" r="1.3" />
            <circle cx="410" cy="48" r="1.8" />
            <circle cx="630" cy="78" r="1.4" />
            <circle cx="790" cy="60" r="1.6" />
          </g>
          <!-- Halo azul brillante de la atmósfera terrestre -->
          <path d="M -80,455 Q 450,245 980,455 L 980,520 L -80,520 Z" fill="rgba(126,232,250,0.34)" />
          <path d="M -80,468 Q 450,262 980,468 L 980,520 L -80,520 Z" fill="url(#${id}-earth-limb)" />
          <path d="M 140,390 Q 340,350 560,378" fill="none" stroke="rgba(255,255,255,0.52)" stroke-width="6" stroke-linecap="round" />
          <!-- Nave cruzando el límite atmosférico hacia el espacio -->
          <g class="cine-ship-exit">
            <g transform="translate(367 165) rotate(18 83 75)">
              ${spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
            </g>
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'moon-arrival' || phaseKey === 'moon-liftoff') {
      const isLiftoff = phaseKey === 'moon-liftoff';
      return `
        <svg viewBox="0 0 900 500" class="w-full h-full" aria-hidden="true">
          <rect x="0" y="0" width="900" height="500" fill="#050814" />
          <circle cx="745" cy="82" r="34" fill="#2c75c9" />
          <path d="M 720,82 Q 748,72 774,84" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="3" />
          <g fill="#ffffff" opacity="0.85">
            <circle cx="110" cy="60" r="1.5" />
            <circle cx="290" cy="95" r="1.2" />
            <circle cx="490" cy="48" r="1.6" />
          </g>
          <path d="M 0,360 Q 450,295 900,360 L 900,500 L 0,500 Z" fill="#9ca5ba" />
          <ellipse cx="260" cy="405" rx="68" ry="20" fill="#68728c" />
          <ellipse cx="640" cy="415" rx="82" ry="24" fill="#59627a" />
          <g class="${isLiftoff ? 'cine-ship-ascend' : 'cine-ship-descend'}">
            <g transform="translate(367 155)">
              ${spaceship({ hatchOpen: false, launching: true, inSpaceFlight: false })}
            </g>
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'moon-suborbital') {
      return `
        <svg viewBox="0 0 900 500" class="w-full h-full" aria-hidden="true">
          <rect x="0" y="0" width="900" height="500" fill="#050814" />
          <g fill="#ffffff" opacity="0.85">
            <circle cx="95" cy="54" r="1.4" />
            <circle cx="240" cy="78" r="1.2" />
            <circle cx="480" cy="46" r="1.6" />
            <circle cx="670" cy="86" r="1.1" />
            <circle cx="815" cy="58" r="1.5" />
          </g>
          <!-- La Tierra visible durante la travesía orbital lunar -->
          <circle cx="450" cy="76" r="28" fill="#2c75c9" />
          <path d="M 428,76 Q 452,68 474,78" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="2.5" />
          <!-- Borde montañoso del Mar de la Tranquilidad a la derecha -->
          <path d="M 520,330 Q 640,268 755,294 Q 830,275 900,342 L 900,380 L 520,380 Z" fill="#3a4463" />
          <!-- Horizonte lunar continuo curvo: Océano de las Tormentas (izq) -> Mar de la Tranquilidad (der) -->
          <path d="M 0,360 Q 450,278 900,360 L 900,500 L 0,500 Z" fill="#9ca5ba" />
          <ellipse cx="195" cy="405" rx="92" ry="24" fill="#68728c" />
          <ellipse cx="725" cy="415" rx="76" ry="20" fill="#5b657d" />
          <g class="cine-ship-cruise">
            <g transform="translate(367 135) rotate(10 83 75)">
              ${spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
            </g>
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'mars-arrival' || phaseKey === 'mars-liftoff') {
      const isLiftoff = phaseKey === 'mars-liftoff';
      return `
        <svg viewBox="0 0 900 500" class="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-msky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#131630" />
              <stop offset="100%" stop-color="#6e5a7d" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="900" height="500" fill="url(#${id}-msky)" />
          <circle cx="195" cy="82" r="14" fill="#bfa8c9" />
          <circle cx="275" cy="58" r="5" fill="#d9c6b8" />
          <path d="M 0,360 Q 450,295 900,360 L 900,500 L 0,500 Z" fill="#cfacc4" />
          <path d="M 90,415 Q 340,375 610,420" fill="none" stroke="#f7dec8" stroke-width="6" opacity="0.5" stroke-linecap="round" />
          <g class="${isLiftoff ? 'cine-ship-ascend' : 'cine-ship-descend'}">
            <g transform="translate(367 155)">
              ${spaceship({ hatchOpen: false, launching: true, inSpaceFlight: false })}
            </g>
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'mars-suborbital') {
      return `
        <svg viewBox="0 0 900 500" class="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="${id}-msky2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#131630" />
              <stop offset="100%" stop-color="#766085" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="900" height="500" fill="url(#${id}-msky2)" />
          <circle cx="215" cy="80" r="13" fill="#bfa8c9" />
          <circle cx="285" cy="56" r="4.8" fill="#d9c6b8" />
          <!-- Colinas Twin Peaks de Ares Vallis a la derecha -->
          <path d="M 555,335 L 645,274 L 710,315 L 775,264 L 860,335 Z" fill="#524269" />
          <!-- Horizonte marciano continuo curvo: Chryse Planitia (izq) -> Ares Vallis (der) -->
          <path d="M 0,360 Q 450,278 900,360 L 900,500 L 0,500 Z" fill="#cfacc4" />
          <path d="M 40,405 Q 220,375 390,410" fill="none" stroke="#f7dec8" stroke-width="5.5" opacity="0.48" stroke-linecap="round" />
          <path d="M 560,412 Q 720,382 860,408" fill="none" stroke="#856f96" stroke-width="5" opacity="0.38" stroke-linecap="round" />
          <g class="cine-ship-cruise">
            <g transform="translate(367 135) rotate(10 83 75)">
              ${spaceship({ hatchOpen: false, launching: true, inSpaceFlight: true })}
            </g>
          </g>
        </svg>
      `;
    }

    if (phaseKey === 'deep-space-eros-transit') {
      return `
        <svg viewBox="0 0 900 500" class="w-full h-full" aria-hidden="true">
          <defs>
            <radialGradient id="${id}-ald" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fff4db" />
              <stop offset="35%" stop-color="#ffb870" />
              <stop offset="100%" stop-color="rgba(242,126,74,0)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="900" height="500" fill="#050817" />
          <g fill="#ffffff" opacity="0.86">
            <circle cx="85" cy="70" r="1.4" />
            <circle cx="310" cy="54" r="1.6" />
            <circle cx="520" cy="88" r="1.2" />
            <circle cx="670" cy="48" r="1.5" />
            <circle cx="820" cy="96" r="1.3" />
            <circle cx="430" cy="420" r="1.5" />
          </g>
          <!-- Estrella roja lejana Aldebarán quedando atrás en la distancia -->
          <g>
            <circle cx="115" cy="78" r="14" fill="url(#${id}-ald)" opacity="0.78" />
            <line x1="103" y1="78" x2="127" y2="78" stroke="rgba(255,212,168,0.55)" stroke-width="0.85" />
            <line x1="115" y1="66" x2="115" y2="90" stroke="rgba(255,212,168,0.55)" stroke-width="0.85" />
            <circle cx="115" cy="78" r="2.8" fill="#ff8a54" stroke="rgba(255,235,205,0.75)" stroke-width="0.65" />
            <circle cx="115" cy="78" r="1.2" fill="#fff5e0" />
          </g>
          <!-- Asteroide 433 Eros aproximándose a la derecha (sin suelo planetario) -->
          <path d="M 655,308 C 670,278 725,268 775,280 C 818,292 835,320 806,338 C 765,356 695,350 662,330 Z" fill="#707f94" stroke="#9fb1c7" stroke-width="1.4" />
          <ellipse cx="718" cy="306" rx="14" ry="6" fill="#4a5669" />
          <ellipse cx="768" cy="316" rx="16" ry="6.5" fill="#434f61" />
          <g class="cine-ship-cruise">
            <g transform="translate(367 160)">
              ${spaceship({ hatchOpen: true, launching: true, penguinInHatch: true, inSpaceFlight: true })}
            </g>
          </g>
        </svg>
      `;
    }

    // deep-space-arrival
    return `
      <svg viewBox="0 0 900 500" class="w-full h-full" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-ald-arr" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fff4db" />
            <stop offset="35%" stop-color="#ffb870" />
            <stop offset="100%" stop-color="rgba(242,126,74,0)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="900" height="500" fill="#060919" />
        <ellipse cx="260" cy="180" rx="220" ry="95" fill="rgba(126,232,250,0.16)" />
        <ellipse cx="715" cy="130" rx="85" ry="20" transform="rotate(-18 715 130)" fill="none" stroke="rgba(225,210,255,0.45)" stroke-width="7" />
        <circle cx="715" cy="130" r="35" fill="#b898c4" />
        <g fill="#ffffff" opacity="0.88">
          <circle cx="105" cy="80" r="1.6" />
          <circle cx="385" cy="52" r="1.4" />
          <circle cx="520" cy="390" r="1.7" />
          <circle cx="810" cy="360" r="1.5" />
        </g>
        <!-- Destello distante de la estrella roja Aldebarán -->
        <g>
          <circle cx="830" cy="74" r="14" fill="url(#${id}-ald-arr)" opacity="0.78" />
          <line x1="818" y1="74" x2="842" y2="74" stroke="rgba(255,212,168,0.55)" stroke-width="0.85" />
          <line x1="830" y1="62" x2="830" y2="86" stroke="rgba(255,212,168,0.55)" stroke-width="0.85" />
          <circle cx="830" cy="74" r="2.8" fill="#ff8a54" stroke="rgba(255,235,205,0.75)" stroke-width="0.65" />
          <circle cx="830" cy="74" r="1.2" fill="#fff5e0" />
        </g>
        <g class="cine-ship-cruise">
          <g transform="translate(367 175)">
            ${spaceship({ hatchOpen: true, launching: true, penguinInHatch: true, inSpaceFlight: true })}
          </g>
        </g>
      </svg>
    `;
  }

  function sampleCrystal(chapterId, variant = 0) {
    const id = uid('samp');
    const shapeIdx = ((Number(variant) || 0) % 3 + 3) % 3;
    const styles = {
      moon: {
        a: '#e2e9f7',
        b: '#8894b2',
        c: '#46506b',
        glint: '#7ee8fa',
        halo: 'rgba(126,232,250,0.42)',
        soilBack: '#55607d',
        soilFront: '#8894b3',
        soilRim: '#cad4eb'
      },
      mars: {
        a: '#f2d3be',
        b: '#ab90b4',
        c: '#594769',
        glint: '#a8e6cf',
        halo: 'rgba(168,230,207,0.44)',
        soilBack: '#685578',
        soilFront: '#9c83a8',
        soilRim: '#ebd0be'
      }
    }[chapterId] || {
      a: '#e2e9f7',
      b: '#8894b2',
      c: '#46506b',
      glint: '#7ee8fa',
      halo: 'rgba(126,232,250,0.42)',
      soilBack: '#55607d',
      soilFront: '#8894b3',
      soilRim: '#cad4eb'
    };

    const rockVariants = [
      // Variante 0: cresta prismática inclinada con doble veta mineral
      `
        <g>
          <path d="M 23,51 L 20,33 L 31,18 L 49,14 L 62,27 L 60,51 Z"
            fill="url(#${id}-rock)" stroke="${styles.glint}" stroke-width="1.5" stroke-opacity="0.82" stroke-linejoin="round" />
          <polygon points="31,18 49,14 45,34 26,37" fill="${styles.a}" opacity="0.45" />
          <polygon points="49,14 62,27 56,47 45,34" fill="${styles.c}" opacity="0.42" />
          <path class="sample-glint-vein" d="M 33,24 L 45,20 L 49,29 L 36,36 Z" fill="${styles.glint}" />
          <path class="sample-glint-vein" d="M 48,34 L 56,31 L 55,40 L 47,42 Z" fill="#ffbe76" />
        </g>
      `,
      // Variante 1: bloque bimorfo fracturado con núcleo cristalino expuesto
      `
        <g>
          <path d="M 19,51 L 24,27 L 39,20 L 50,24 L 64,34 L 61,51 Z"
            fill="url(#${id}-rock)" stroke="${styles.glint}" stroke-width="1.5" stroke-opacity="0.85" stroke-linejoin="round" />
          <polygon points="24,27 39,20 42,39 22,42" fill="${styles.a}" opacity="0.42" />
          <polygon points="44,19 52,13 58,24 49,33" fill="${styles.glint}" stroke="#e2e8f0" stroke-width="0.9" stroke-opacity="0.7" />
          <path class="sample-glint-vein" d="M 28,31 L 38,26 L 41,35 L 30,40 Z" fill="${styles.glint}" />
          <polygon class="sample-glint-vein" points="50,34 55,33 56,39 51,40" fill="#ffbe76" />
        </g>
      `,
      // Variante 2: laja basáltica escalonada emergiendo en diagonal del suelo
      `
        <g>
          <path d="M 21,51 L 17,37 L 28,24 L 43,19 L 60,21 L 65,36 L 61,51 Z"
            fill="url(#${id}-rock)" stroke="${styles.glint}" stroke-width="1.5" stroke-opacity="0.82" stroke-linejoin="round" />
          <polygon points="28,24 43,19 58,21 44,33" fill="${styles.a}" opacity="0.48" />
          <polygon points="44,33 60,21 65,36 49,47" fill="${styles.c}" opacity="0.4" />
          <path class="sample-glint-vein" d="M 26,33 L 39,25 L 43,31 L 29,40 Z" fill="#ffbe76" />
          <path class="sample-glint-vein" d="M 46,27 L 56,26 L 54,37 L 44,36 Z" fill="${styles.glint}" />
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

        <!-- Anillo escáner geológico y sombra de contacto a ras de superficie (sin halo brillante, estrellas ni líneas punteadas) -->
        <ellipse class="sample-ground-ring" cx="42" cy="50" rx="28" ry="9.5" fill="none" stroke="${styles.glint}" stroke-width="1.4" stroke-opacity="0.72" />
        <ellipse cx="42" cy="50" rx="21" ry="6.5" fill="rgba(4,7,18,0.44)" />

        <!-- Montículo trasero de suelo desplazado -->
        <path d="M 16,49 Q 42,37 68,49 Q 54,54 30,54 Z" fill="${styles.soilBack}" />

        <!-- Roca geológica semienterrada con facetas y vetas minerales mate -->
        ${rockVariants[shapeIdx]}

        <!-- Collar frontal de regolito cubriendo la base enterrada de la roca -->
        <path d="M 12,48 Q 27,43 42,47 Q 57,42 72,48 Q 62,58 42,59 Q 22,58 12,48 Z"
          fill="${styles.soilFront}" stroke="${styles.soilRim}" stroke-width="1.1" stroke-opacity="0.7" />
        <ellipse cx="23" cy="52" rx="3.2" ry="1.4" fill="${styles.soilRim}" opacity="0.75" />
        <ellipse cx="59" cy="51.5" rx="2.8" ry="1.2" fill="${styles.soilRim}" opacity="0.7" />
      </svg>
    `;
  }

  // Sello de patita de pingüino (usado en Pasaporte de Explorador y Certificado)
  function penguinPawStamp(filled = true, size = 56) {
    const mainFill = filled ? '#ffbe76' : 'rgba(154,167,212,0.22)';
    const subFill = filled ? '#ffe3b8' : 'rgba(154,167,212,0.12)';
    const stroke = filled ? '#e69845' : 'rgba(154,167,212,0.38)';

    return `
      <svg viewBox="0 0 80 80" width="${size}" height="${size}" aria-hidden="true">
        <path d="M 40,12 C 36,12 32,23 32,31 L 48,31 C 48,23 44,12 40,12 Z" fill="${mainFill}" stroke="${stroke}" stroke-width="1.5" />
        <path d="M 18,22 C 15,24 21,34 26,39 L 34,33 C 30,27 21,20 18,22 Z" fill="${mainFill}" stroke="${stroke}" stroke-width="1.5" />
        <path d="M 62,22 C 65,24 59,34 54,39 L 46,33 C 50,27 59,20 62,22 Z" fill="${mainFill}" stroke="${stroke}" stroke-width="1.5" />
        <path d="M 24,38 Q 40,30 56,38 C 58,49 51,64 40,65 C 29,64 22,49 24,38 Z" fill="${mainFill}" stroke="${stroke}" stroke-width="1.5" />
        <path d="M 31,43 Q 40,38 49,43 C 49,51 45,58 40,59 C 35,58 31,51 31,43 Z" fill="${subFill}" />
      </svg>
    `;
  }

  function badgeIcon(badgeId, unlocked) {
    const palette = unlocked
      ? { primary: '#ffbe76', secondary: '#7ee8fa' }
      : { primary: '#49547d', secondary: '#353e61' };

    const shapes = {
      aprendiz: `<polygon points="40,12 64,28 56,60 24,60 16,28" fill="${palette.primary}" /><polygon points="40,22 52,33 46,50 34,50 28,33" fill="${palette.secondary}" />`,
      ingeniero: `<polygon points="40,10 66,25 66,55 40,70 14,55 14,25" fill="${palette.secondary}" /><polygon points="40,22 54,30 54,50 40,58 26,50 26,30" fill="${palette.primary}" />`,
      especialista: `<polygon points="40,8 50,28 72,32 55,47 59,68 40,58 21,68 25,47 8,32 30,28" fill="${palette.primary}" />`,
      piloto: `<polygon points="40,10 68,42 54,48 40,30 26,48 12,42" fill="${palette.secondary}" /><polygon points="40,32 56,64 40,56 24,64" fill="${palette.primary}" />`,
      comandante: `<polygon points="16,22 30,36 40,14 50,36 64,22 58,58 22,58" fill="${palette.primary}" /><polygon points="26,58 54,58 50,66 30,66" fill="${palette.secondary}" />`
    };

    return `
      <svg viewBox="0 0 80 80" width="52" height="52" aria-hidden="true">
        ${shapes[badgeId] || shapes.aprendiz}
      </svg>
    `;
  }

  function chapterEmblem(chapterId) {
    const id = uid('emb');
    if (chapterId === 'mars') {
      return `
        <svg viewBox="0 0 80 80" width="68" height="68" aria-hidden="true">
          <defs>
            <radialGradient id="${id}-marsHalo" cx="50%" cy="50%" r="50%">
              <stop offset="52%" stop-color="rgba(255, 146, 92, 0.28)" />
              <stop offset="100%" stop-color="rgba(255, 146, 92, 0)" />
            </radialGradient>
            <radialGradient id="${id}-marsSphere" cx="34%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#ffd1a9" />
              <stop offset="36%" stop-color="#e47b4e" />
              <stop offset="76%" stop-color="#a13c29" />
              <stop offset="100%" stop-color="#3b1212" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="37" fill="url(#${id}-marsHalo)" />
          <circle cx="40" cy="40" r="24" fill="url(#${id}-marsSphere)" stroke="rgba(255, 198, 158, 0.42)" stroke-width="1.2" />
          <path d="M 31,19 Q 40,24 49,19 Q 40,15 31,19 Z" fill="rgba(255, 245, 238, 0.65)" />
          <path d="M 21,42 Q 36,37 55,44 Q 46,49 26,47 Z" fill="rgba(96, 28, 18, 0.42)" />
          <ellipse cx="32" cy="31" rx="4.2" ry="2.6" fill="rgba(166, 58, 36, 0.35)" />
          <ellipse cx="48" cy="51" rx="5.2" ry="3.1" fill="rgba(82, 22, 16, 0.42)" />
          <path d="M 46,17 A 24,24 0 0,1 46,63 A 15,24 0 0,0 46,17 Z" fill="rgba(10, 6, 16, 0.32)" />
        </svg>
      `;
    }

    if (chapterId === 'deep-space') {
      return `
        <svg viewBox="0 0 80 80" width="68" height="68" aria-hidden="true">
          <defs>
            <radialGradient id="${id}-aldeHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(255, 198, 120, 0.85)" />
              <stop offset="38%" stop-color="rgba(249, 115, 22, 0.32)" />
              <stop offset="100%" stop-color="rgba(249, 115, 22, 0)" />
            </radialGradient>
            <linearGradient id="${id}-erosGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#c3cbd9" />
              <stop offset="55%" stop-color="#7c859e" />
              <stop offset="100%" stop-color="#393f54" />
            </linearGradient>
          </defs>
          <circle cx="54" cy="24" r="22" fill="url(#${id}-aldeHalo)" />
          <circle cx="54" cy="24" r="7.5" fill="#ffd28a" />
          <circle cx="54" cy="24" r="4.2" fill="#fff7e2" />
          <path d="M 16,52 C 15,43 27,37 39,40 C 51,42 57,49 54,56 C 50,62 34,63 22,60 C 17,58 16,55 16,52 Z"
            fill="url(#${id}-erosGrad)" stroke="rgba(216, 226, 245, 0.36)" stroke-width="1.1" />
          <ellipse cx="29" cy="49" rx="4.2" ry="2.4" fill="rgba(35, 42, 62, 0.55)" />
          <ellipse cx="42" cy="52" rx="2.6" ry="1.6" fill="rgba(35, 42, 62, 0.5)" />
          <g transform="translate(27, 26) rotate(-18)">
            <ellipse cx="0" cy="0" rx="8.5" ry="3.2" fill="#e2e8f0" stroke="#7ee8fa" stroke-width="0.9" />
            <circle cx="0" cy="-2" r="2" fill="#ffbe76" />
            <line x1="-10" y1="0" x2="-4" y2="0" stroke="#ffbe76" stroke-width="1.4" stroke-linecap="round" />
            <line x1="0" y1="-2" x2="0" y2="-8" stroke="#cbd5e1" stroke-width="1.1" stroke-linecap="round" />
          </g>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 80 80" width="68" height="68" aria-hidden="true">
        <defs>
          <radialGradient id="${id}-moonHalo" cx="50%" cy="50%" r="50%">
            <stop offset="52%" stop-color="rgba(126, 232, 250, 0.24)" />
            <stop offset="100%" stop-color="rgba(126, 232, 250, 0)" />
          </radialGradient>
          <radialGradient id="${id}-moonSphere" cx="34%" cy="32%" r="68%">
            <stop offset="0%" stop-color="#f1f5ff" />
            <stop offset="48%" stop-color="#b8c3db" />
            <stop offset="82%" stop-color="#717d9c" />
            <stop offset="100%" stop-color="#37415c" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="37" fill="url(#${id}-moonHalo)" />
        <circle cx="40" cy="40" r="24" fill="url(#${id}-moonSphere)" stroke="rgba(219, 234, 254, 0.45)" stroke-width="1.2" />
        <ellipse cx="32" cy="31" rx="7" ry="5" fill="rgba(79, 90, 118, 0.36)" />
        <ellipse cx="47" cy="44" rx="6" ry="7.5" fill="rgba(79, 90, 118, 0.32)" />
        <circle cx="29" cy="47" r="3.4" fill="rgba(104, 115, 145, 0.52)" stroke="rgba(241, 245, 255, 0.4)" stroke-width="0.9" />
        <circle cx="45" cy="29" r="2.6" fill="rgba(104, 115, 145, 0.48)" stroke="rgba(241, 245, 255, 0.35)" stroke-width="0.8" />
        <path d="M 46,17 A 24,24 0 0,1 46,63 A 15,24 0 0,0 46,17 Z" fill="rgba(8, 12, 28, 0.28)" />
      </svg>
    `;
  }

  global.CYBERPENGUINS_MODELS = {
    cyberpenguin,
    spaceship,
    surveyor3,
    apolloEagle,
    viking1,
    sojourner,
    pioneer10,
    nearShoemaker,
    stageBackdrop,
    evaTether,
    travelCinematicSvg,
    sampleCrystal,
    penguinPawStamp,
    badgeIcon,
    chapterEmblem
  };
})(typeof window !== 'undefined' ? window : globalThis);
