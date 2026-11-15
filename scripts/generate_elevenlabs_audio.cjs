/**
 * Script de generación automática de audios para Cyberpenguins usando ElevenLabs API
 * Ejecución: node scripts/generate_elevenlabs_audio.cjs
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('⚠️ Error: Debes definir la variable de entorno ELEVENLABS_API_KEY para ejecutar este script.');
  console.error('Ejemplo: ELEVENLABS_API_KEY="tu_clave" node scripts/generate_elevenlabs_audio.cjs');
  process.exit(1);
}

// Mapeo de personajes a Voice IDs asignados por el usuario
const VOICE_MAP_ES = {
  'Cyberpenguin': 'ihKwLOjVUMG4lgUI6meZ',          // Leo – Curious Character
  'Surveyor 3': 'JZeTbA8jDZKTeMBPNXrK',            // Marco
  'Eagle': 'hAUJJty85xYTBnGyEWzw',                 // César Augusto – Spanish Neutral
  'Eagle (Apollo 11)': 'hAUJJty85xYTBnGyEWzw',     // César Augusto – Spanish Neutral
  'Viking 1': 'zJtOCbdQjTZt7YZtkRDP',              // Natalia – Doblaje Versátil
  'Sojourner Rover': 'iV6xDQ4wcM3ZcXDx30GB',       // Betty – Quirky, Cartoonish & Warm
  'Pioneer 10': 'c338PHkXJ2cW8fdMPhzP',            // Hanna – Warm, Deep, Inspiring
  'NEAR Shoemaker': 'MXbNlTMQcU6GZQlRkXHB',        // Jorge
  'IA de la Nave': 'A9OFofjAh6JEy1MNk5Mz',         // Paulina – Cálida y Comercial
  "Ship's AI": 'A9OFofjAh6JEy1MNk5Mz'             // Paulina – Cálida y Comercial
};

const VOICE_MAP_EN = {
  'Cyberpenguin': '0zj1iWvloMkAXydIFsJR',          // Leo / Curious Explorer (English)
  'Surveyor 3': 'eY7L7u95SA4iCJN5wCSV',            // Surveyor 3 (English)
  'Eagle': 'j9qIyycr9PcZ7d4yj21f',                 // Eagle Apollo 11 (English)
  'Eagle (Apollo 11)': 'j9qIyycr9PcZ7d4yj21f',     // Eagle Apollo 11 (English)
  'Viking 1': 'b8JMPeNuVrqqWExQc8e9',              // Viking 1 (English)
  'Sojourner': 'bxu4ptGyGRXdGcFkahWB',             // Sojourner Rover (English)
  'Sojourner Rover': 'bxu4ptGyGRXdGcFkahWB',       // Sojourner Rover (English)
  'Pioneer 10': 'fA4eSDsx5xNZ1RV7zEu5',            // Pioneer 10 (English)
  'NEAR Shoemaker': '1kvnzrSTos1KbmLKMLCC',        // NEAR Shoemaker (English)
  'IA de la Nave': '15M6OJD6hSZpYqHQEBKA',         // Ship's AI (English)
  "Ship's AI": '15M6OJD6hSZpYqHQEBKA'             // Ship's AI (English)
};

// Ajustes de voz recomendados por personaje para máxima expresividad
const SETTINGS_MAP = {
  'Cyberpenguin': { stability: 0.38, similarity_boost: 0.78, style: 0.45 },
  'Surveyor 3': { stability: 0.55, similarity_boost: 0.75, style: 0.30 },
  'Eagle': { stability: 0.65, similarity_boost: 0.80, style: 0.25 },
  'Eagle (Apollo 11)': { stability: 0.65, similarity_boost: 0.80, style: 0.25 },
  'Viking 1': { stability: 0.50, similarity_boost: 0.75, style: 0.35 },
  'Sojourner': { stability: 0.35, similarity_boost: 0.75, style: 0.55 },
  'Sojourner Rover': { stability: 0.35, similarity_boost: 0.75, style: 0.55 },
  'Pioneer 10': { stability: 0.68, similarity_boost: 0.82, style: 0.20 },
  'NEAR Shoemaker': { stability: 0.45, similarity_boost: 0.75, style: 0.40 },
  'IA de la Nave': { stability: 0.60, similarity_boost: 0.80, style: 0.20 },
  "Ship's AI": { stability: 0.60, similarity_boost: 0.80, style: 0.20 }
};

const isEnglish = process.argv.includes('--lang=en') || process.argv.includes('-en');
const VOICE_MAP = isEnglish ? VOICE_MAP_EN : VOICE_MAP_ES;
const SCRIPT_PATH = path.join(__dirname, '..', isEnglish ? 'ELEVENLABS_GUION_VOCES_EN.md' : 'ELEVENLABS_GUION_VOCES.md');
const AUDIO_DIR = path.join(__dirname, '..', 'audio');

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}
if (isEnglish && !fs.existsSync(path.join(AUDIO_DIR, 'en'))) {
  fs.mkdirSync(path.join(AUDIO_DIR, 'en'), { recursive: true });
}

function parseScript() {
  const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
  const blocks = content.split(/\[ID:\s*`([^`]+)`\]/).slice(1);
  const items = [];

  for (let i = 0; i < blocks.length; i += 2) {
    const filename = blocks[i].trim();
    const body = blocks[i + 1];

    // Extraer personaje (soporta español e inglés)
    const charMatch = body.match(/\*\*(?:Personaje|Character):\*\*\s*([^\n]+)/);
    let character = charMatch ? charMatch[1].trim() : '';
    // Limpiar notas como (⭐ Secreto ...)
    character = character.replace(/\s*\(.*?\)/, '').trim();

    // Extraer texto
    const textMatch = body.match(/>\s*"([\s\S]*?)"/);
    const text = textMatch ? textMatch[1].replace(/\s+/g, ' ').trim() : '';

    if (filename && character && text) {
      items.push({ filename, character, text });
    }
  }

  return items;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAudio(item, index, total) {
  const outputPath = path.join(AUDIO_DIR, item.filename);

  // Evitar gastar créditos si el archivo ya fue descargado previamente
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
    console.log(`[${index + 1}/${total}] ⏩ Omitido (ya existe): ${item.filename}`);
    return true;
  }

  const voiceId = VOICE_MAP[item.character];
  if (!voiceId) {
    console.error(`[${index + 1}/${total}] ⚠️ No se encontró Voice ID para el personaje: ${item.character}`);
    return false;
  }

  const settings = SETTINGS_MAP[item.character] || { stability: 0.5, similarity_boost: 0.75 };

  console.log(`[${index + 1}/${total}] 🎙️ Generando: ${item.filename} (${item.character} - ${item.text.length} caracteres)...`);

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: item.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: settings
        })
      });

      if (response.status === 429) {
        console.warn(`⏳ Rate limit alcanzado en ${item.filename}. Esperando 5 segundos antes de reintentar...`);
        await sleep(5000);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
      console.log(`[${index + 1}/${total}] ✅ Guardado: audio/${item.filename} (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB)`);
      return true;
    } catch (err) {
      if (attempts >= maxAttempts) {
        throw err;
      }
      console.warn(`⚠️ Intento ${attempts} fallido en ${item.filename}: ${err.message}. Reintentando en 2s...`);
      await sleep(2000);
    }
  }

  return false;
}

async function main() {
  const items = parseScript();
  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const limitCount = limitArg ? parseInt(limitArg.split('=')[1], 10) : items.length;
  const itemsToProcess = items.slice(0, limitCount);

  console.log(`🚀 Iniciando generación con ElevenLabs API (${isEnglish ? 'English' : 'Español'})...`);
  console.log(`Total de archivos en el guion: ${items.length} (procesando ${itemsToProcess.length})\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < itemsToProcess.length; i++) {
    try {
      const ok = await generateAudio(itemsToProcess[i], i, itemsToProcess.length);
      if (ok) successCount++;
      else failCount++;
      // Pequeña pausa entre peticiones
      await sleep(350);
    } catch (err) {
      console.error(`❌ Error definitivo en ${items[i].filename}:`, err.message);
      failCount++;
      if (err.message.includes('quota_exceeded') || err.message.includes('unauthorized')) {
        console.error('\n⚠️ Detención de seguridad: revisar saldo o permisos de la clave.');
        break;
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 Proceso finalizado:`);
  console.log(`   Audios completados con éxito: ${successCount}`);
  console.log(`   Audios con error / pendientes: ${failCount}`);
  console.log(`========================================`);
}

main().catch(console.error);
