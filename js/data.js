/**
 * Plantilla de datos del juego educativo Cyberpenguins.
 *
 * INSTRUCCIONES PARA EL EQUIPO:
 * - Diálogos: rellenar `penguinText` (intervención de Cyberpenguin) y `dialogueText` (intervención de la máquina).
 * - Audio futuro: colocar ruta o URL en `penguinAudioUrl` y `audioUrl` para sustituir el TTS por audios grabados o de IA.
 * - Quizzes: rellenar `question`, `options` (4 respuestas) y `correctIndex` (0..3) en cada capítulo.
 */
(function (global) {
  'use strict';

  const CHAPTERS = [
    {
      id: 'moon',
      name: 'La Luna',
      hasSurface: true,
      shipPos: { x: 20, y: 66 },
      spawnPos: { x: 30, y: 72 },
      sample: {
        id: 'sample-moon-1',
        siteId: 'oceanus-procellarum',
        variant: 0,
        label: 'Basalto del Océano de las Tormentas',
        pos: { x: 42, y: 80 }
      },
      samples: [
        {
          id: 'sample-moon-1',
          siteId: 'oceanus-procellarum',
          variant: 0,
          label: 'Basalto del Océano de las Tormentas',
          pos: { x: 42, y: 80 }
        },
        {
          id: 'sample-moon-2',
          siteId: 'oceanus-procellarum',
          variant: 1,
          label: 'Brecha de impacto lunar',
          pos: { x: 52, y: 69 }
        },
        {
          id: 'sample-moon-3',
          siteId: 'oceanus-procellarum',
          variant: 2,
          label: 'Regolito cristalino de Procellarum',
          pos: { x: 79, y: 76 }
        },
        {
          id: 'sample-moon-4',
          siteId: 'mare-tranquillitatis',
          variant: 1,
          label: 'Ilmenita del Mar de la Tranquilidad',
          pos: { x: 41, y: 79 }
        },
        {
          id: 'sample-moon-5',
          siteId: 'mare-tranquillitatis',
          variant: 2,
          label: 'Anortosita lunar antigua',
          pos: { x: 53, y: 68 }
        },
        {
          id: 'sample-moon-6',
          siteId: 'mare-tranquillitatis',
          variant: 0,
          label: 'Esférula vítrea de Tranquillitatis',
          pos: { x: 78, y: 75 }
        }
      ],
      machines: [
        {
          id: 'surveyor-3',
          modelKey: 'surveyor3',
          name: 'Surveyor 3',
          siteId: 'oceanus-procellarum',
          locationShort: 'Océano de las Tormentas',
          locationDetail: 'Surveyor 1 / 3: Océano de las Tormentas de la Luna',
          nasaUrl: 'https://science.nasa.gov/mission/surveyor-3/',
          pos: { x: 64, y: 60 },
          shipPos: { x: 20, y: 66 },
          spawnPos: { x: 30, y: 72 },
          penguinText: '',     // Espacio en blanco para diálogo de Cyberpenguin
          penguinAudioUrl: '', // Espacio reservado para audio de Cyberpenguin
          dialogueText: '',    // Espacio en blanco para diálogo de la máquina
          audioUrl: ''         // Espacio reservado para audio de la máquina
        },
        {
          id: 'apollo-11-eagle',
          modelKey: 'apolloEagle',
          name: 'Módulo Lunar Eagle (Apollo 11)',
          siteId: 'mare-tranquillitatis',
          locationShort: 'Mar de la Tranquilidad',
          locationDetail: 'Módulo Lunar Eagle: cerca del borde sur del Mar de la Tranquilidad',
          nasaUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
          pos: { x: 66, y: 61 },
          shipPos: { x: 20, y: 66 },
          spawnPos: { x: 30, y: 72 },
          penguinText: '',     // Espacio en blanco para diálogo de Cyberpenguin
          penguinAudioUrl: '', // Espacio reservado para audio de Cyberpenguin
          dialogueText: '',    // Espacio en blanco para diálogo de la máquina
          audioUrl: ''         // Espacio reservado para audio de la máquina
        }
      ]
    },
    {
      id: 'mars',
      name: 'Marte',
      hasSurface: true,
      shipPos: { x: 20, y: 66 },
      spawnPos: { x: 30, y: 72 },
      sample: {
        id: 'sample-mars-1',
        siteId: 'chryse-planitia',
        variant: 0,
        label: 'Basalto vesicular de Chryse',
        pos: { x: 42, y: 79 }
      },
      samples: [
        {
          id: 'sample-mars-1',
          siteId: 'chryse-planitia',
          variant: 0,
          label: 'Basalto vesicular de Chryse',
          pos: { x: 42, y: 79 }
        },
        {
          id: 'sample-mars-2',
          siteId: 'chryse-planitia',
          variant: 1,
          label: 'Concreción de hematita marciana',
          pos: { x: 52, y: 68 }
        },
        {
          id: 'sample-mars-3',
          siteId: 'chryse-planitia',
          variant: 2,
          label: 'Costra de sulfato férrico',
          pos: { x: 79, y: 76 }
        },
        {
          id: 'sample-mars-4',
          siteId: 'ares-vallis',
          variant: 1,
          label: 'Roca andesítica «Barnacle Bill»',
          pos: { x: 41, y: 80 }
        },
        {
          id: 'sample-mars-5',
          siteId: 'ares-vallis',
          variant: 2,
          label: 'Bloque basáltico «Yogi»',
          pos: { x: 53, y: 69 }
        },
        {
          id: 'sample-mars-6',
          siteId: 'ares-vallis',
          variant: 0,
          label: 'Sedimento cementado «Scooby Doo»',
          pos: { x: 78, y: 75 }
        }
      ],
      machines: [
        {
          id: 'viking-1',
          modelKey: 'viking1',
          name: 'Viking 1',
          siteId: 'chryse-planitia',
          locationShort: 'Chryse Planitia',
          locationDetail: 'Módulo de aterrizaje Viking 1: Chryse Planitia',
          nasaUrl: 'https://science.nasa.gov/mission/viking-1/',
          pos: { x: 64, y: 60 },
          shipPos: { x: 20, y: 66 },
          spawnPos: { x: 30, y: 72 },
          penguinText: '',     // Espacio en blanco para diálogo de Cyberpenguin
          penguinAudioUrl: '', // Espacio reservado para audio de Cyberpenguin
          dialogueText: '',    // Espacio en blanco para diálogo de la máquina
          audioUrl: ''         // Espacio reservado para audio de la máquina
        },
        {
          id: 'sojourner',
          modelKey: 'sojourner',
          name: 'Sojourner Rover',
          siteId: 'ares-vallis',
          locationShort: 'Ares Vallis',
          locationDetail: 'Sojourner Rover: Ares Vallis',
          nasaUrl: 'https://science.nasa.gov/mission/mars-pathfinder/',
          pos: { x: 66, y: 62 },
          shipPos: { x: 20, y: 66 },
          spawnPos: { x: 30, y: 72 },
          penguinText: '',     // Espacio en blanco para diálogo de Cyberpenguin
          penguinAudioUrl: '', // Espacio reservado para audio de Cyberpenguin
          dialogueText: '',    // Espacio en blanco para diálogo de la máquina
          audioUrl: ''         // Espacio reservado para audio de la máquina
        }
      ]
    },
    {
      id: 'deep-space',
      name: 'Espacio Profundo',
      hasSurface: false,
      shipPos: { x: 22, y: 58 },
      spawnPos: { x: 22, y: 58 },
      sample: null,
      samples: [],
      machines: [
        {
          id: 'pioneer-10',
          modelKey: 'pioneer10',
          name: 'Pioneer 10',
          siteId: 'aldebaran-trajectory',
          locationShort: 'Aldebarán',
          locationDetail: '5 nov. 2017: inerte a ~118.824 UA (~11 mil millones mi / 17.700 millones km) de la Tierra · Dirección a la estrella roja Aldebarán',
          nasaUrl: 'https://science.nasa.gov/mission/pioneer-10/',
          pos: { x: 64, y: 46 },
          shipPos: { x: 22, y: 58 },
          spawnPos: { x: 22, y: 58 },
          penguinText: '',     // Espacio en blanco para diálogo de Cyberpenguin
          penguinAudioUrl: '', // Espacio reservado para audio de Cyberpenguin
          dialogueText: '',    // Espacio en blanco para diálogo de la máquina
          audioUrl: ''         // Espacio reservado para audio de la máquina
        },
        {
          id: 'near-shoemaker',
          modelKey: 'nearShoemaker',
          name: 'NEAR Shoemaker',
          siteId: 'asteroid-eros',
          locationShort: 'Asteroide 433 Eros',
          locationDetail: 'NEAR Shoemaker: aterrizó en la superficie del asteroide 433 Eros',
          nasaUrl: 'https://science.nasa.gov/mission/near-shoemaker/',
          pos: { x: 68, y: 56 },
          shipPos: { x: 22, y: 58 },
          spawnPos: { x: 22, y: 58 },
          penguinText: '',     // Espacio en blanco para diálogo de Cyberpenguin
          penguinAudioUrl: '', // Espacio reservado para audio de Cyberpenguin
          dialogueText: '',    // Espacio en blanco para diálogo de la máquina
          audioUrl: ''         // Espacio reservado para audio de la máquina
        }
      ]
    }
  ];

  // 3 espacios de quiz (1 por capítulo), cada uno con 2 preguntas de 4 opciones en blanco.
  const QUIZZES = {
    moon: {
      chapterId: 'moon',
      chapterName: 'La Luna',
      questions: [
        {
          id: 'q-moon-1',
          hardwareId: 'surveyor-3',
          hardwareName: 'Surveyor 3',
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0
        },
        {
          id: 'q-moon-2',
          hardwareId: 'apollo-11-eagle',
          hardwareName: 'Módulo Lunar Eagle (Apollo 11)',
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0
        }
      ]
    },
    mars: {
      chapterId: 'mars',
      chapterName: 'Marte',
      questions: [
        {
          id: 'q-mars-1',
          hardwareId: 'viking-1',
          hardwareName: 'Viking 1',
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0
        },
        {
          id: 'q-mars-2',
          hardwareId: 'sojourner',
          hardwareName: 'Sojourner Rover',
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0
        }
      ]
    },
    'deep-space': {
      chapterId: 'deep-space',
      chapterName: 'Espacio Profundo',
      questions: [
        {
          id: 'q-deep-1',
          hardwareId: 'pioneer-10',
          hardwareName: 'Pioneer 10',
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0
        },
        {
          id: 'q-deep-2',
          hardwareId: 'near-shoemaker',
          hardwareName: 'NEAR Shoemaker',
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0
        }
      ]
    }
  };

  // Estructura de insignias (máximo 15 estrellas: 3 capítulos x 5 estrellas).
  const BADGES = [
    { id: 'aprendiz', name: 'Aprendiz', minStars: 0 },
    { id: 'ingeniero', name: 'Ingeniero', minStars: 3 },
    { id: 'especialista', name: 'Especialista', minStars: 6 },
    { id: 'piloto', name: 'Piloto', minStars: 10 },
    { id: 'comandante', name: 'Comandante', minStars: 13 }
  ];

  global.CYBERPENGUINS_DATA = {
    TITLE: 'Cyberpenguins',
    STORAGE_KEY: 'cyberpenguins_progress_v1',
    MAX_STARS_PER_CHAPTER: 5,
    CHAPTERS,
    QUIZZES,
    BADGES
  };
})(typeof window !== 'undefined' ? window : globalThis);
