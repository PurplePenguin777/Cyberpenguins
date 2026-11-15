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
          penguinText: '¡Hola! Soy Cyberpenguin. ¿Quién eres y qué haces en la Luna?',
          penguinAudioUrl: '',
          dialogueText: '¡Bip, bip! Soy Surveyor 3. La NASA me envió en abril de 1967 para investigar si el suelo lunar era firme o si una nave se volcaría al aterrizar.',
          audioUrl: '',
          greeting: [
            { speaker: 'penguin', text: '¡Hola! Soy Cyberpenguin. ¿Quién eres y qué haces en la Luna?' },
            { speaker: 'machine', text: '¡Bip, bip! Soy Surveyor 3. La NASA me envió en abril de 1967 para investigar si el suelo lunar era firme o si una nave se volcaría al aterrizar.' }
          ],
          topics: [
            {
              id: 'shovel',
              icon: '🚜',
              label: 'Pala robótica',
              dialogue: [
                { speaker: 'penguin', text: '¿Para qué sirve esa especie de brazo con pala?' },
                { speaker: 'machine', text: '¡Es mi pala para probar el suelo! Cavé cuatro zanjas para demostrar que el terreno era lo bastante sólido para que aterrizara una nave tripulada.' }
              ]
            },
            {
              id: 'camera',
              icon: '📸',
              label: 'Cámara lunar',
              dialogue: [
                { speaker: 'penguin', text: 'Veo que tienes una cámara. ¿Qué fotografiabas?' },
                { speaker: 'machine', text: 'Tomé miles de fotografías de las rocas y el horizonte y las transmití a la Tierra para que los científicos pudieran estudiar el paisaje lunar.' }
              ]
            },
            {
              id: 'apollo12',
              icon: '👨‍🚀',
              label: 'Visita de Apollo 12',
              dialogue: [
                { speaker: 'penguin', text: '¿Es verdad que unos astronautas vinieron a visitarte?' },
                { speaker: 'machine', text: '¡Sí! En noviembre de 1969, los astronautas de Apollo 12 aterrizaron cerca de mí, caminaron hasta aquí y llevaron mi cámara a la Tierra para estudiarla.' }
              ]
            }
          ],
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! Soy Cyberpenguin. ¿Quién eres y qué haces en la Luna?' },
            { speaker: 'machine', text: '¡Bip, bip! Soy Surveyor 3. La NASA me envió en abril de 1967 para investigar si el suelo lunar era firme o si una nave se volcaría al aterrizar.' }
          ]
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
          penguinText: '¡Qué máquina tan especial! ¿Quién eres?',
          penguinAudioUrl: '',
          dialogueText: '¡Hola, explorador! Soy Eagle, el módulo lunar de Apollo 11. El 20 de julio de 1969 llevé a Neil Armstrong y Buzz Aldrin a pisar la Luna por primera vez.',
          audioUrl: '',
          greeting: [
            { speaker: 'penguin', text: '¡Qué máquina tan especial! ¿Quién eres?' },
            { speaker: 'machine', text: '¡Hola, explorador! Soy Eagle, el módulo lunar de Apollo 11. El 20 de julio de 1969 llevé a Neil Armstrong y Buzz Aldrin a pisar la Luna por primera vez.' }
          ],
          topics: [
            {
              id: 'stages',
              icon: '🚀',
              label: 'Dos etapas',
              dialogue: [
                { speaker: 'penguin', text: '¿Cómo pudiste aterrizar y luego despegar de la Luna?' },
                { speaker: 'machine', text: 'Tenía dos partes: la etapa de descenso (abajo, con las patas) se quedó aquí para siempre, y la etapa de ascenso (arriba) despegó con los astronautas.' }
              ]
            },
            {
              id: 'moonwalk',
              icon: '🌙',
              label: 'Caminata lunar',
              dialogue: [
                { speaker: 'penguin', text: '¿Qué hicieron en el Mar de la Tranquilidad?' },
                { speaker: 'machine', text: 'Armstrong y Aldrin tomaron fotos históricas, instalaron experimentos y recolectaron más de 20 kilos de rocas y polvo lunar para la ciencia.' }
              ]
            },
            {
              id: 'instruments',
              icon: '📡',
              label: 'Instrumentos dejados',
              dialogue: [
                { speaker: 'penguin', text: '¿La investigación continuó después del despegue?' },
                { speaker: 'machine', text: '¡Sí! Dejamos un sismómetro para medir temblores y un reflector láser con el que los científicos aún hoy miden la distancia exacta entre la Tierra y la Luna.' }
              ]
            }
          ],
          dialogue: [
            { speaker: 'penguin', text: '¡Qué máquina tan especial! ¿Quién eres?' },
            { speaker: 'machine', text: '¡Hola, explorador! Soy Eagle, el módulo lunar de Apollo 11. El 20 de julio de 1969 llevé a Neil Armstrong y Buzz Aldrin a pisar la Luna por primera vez.' }
          ]
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
          penguinText: '¡Hola! ¡Por fin estoy en Marte! ¿Quién eres?',
          penguinAudioUrl: '',
          dialogueText: '¡Bienvenido! Soy Viking 1. Llegué en julio de 1976 y fui la primera misión que operó exitosamente en la superficie de Marte.',
          audioUrl: '',
          greeting: [
            { speaker: 'penguin', text: '¡Hola! ¡Por fin estoy en Marte! ¿Quién eres?' },
            { speaker: 'machine', text: '¡Bienvenido! Soy Viking 1. Llegué en julio de 1976 y fui la primera misión que operó exitosamente en la superficie de Marte.' }
          ],
          topics: [
            {
              id: 'parts',
              icon: '🛰️',
              label: 'Dos partes',
              dialogue: [
                { speaker: 'penguin', text: '¿Cómo pudiste estudiar tantas cosas a la vez?' },
                { speaker: 'machine', text: '¡Tenía dos partes! Un orbitador que daba vueltas tomando fotos globales desde el espacio, y mi módulo de aterrizaje que trabajaba directamente en el suelo.' }
              ]
            },
            {
              id: 'life_search',
              icon: '🧪',
              label: 'Búsqueda de vida',
              dialogue: [
                { speaker: 'penguin', text: '¿Es verdad que buscaste señales de vida marciana?' },
                { speaker: 'machine', text: '¡Sí! Recogí suelo con mi brazo robótico e hice experimentos biológicos. Aunque no encontramos marcianos, aprendimos muchísimo sobre el clima y la química de Marte.' }
              ]
            },
            {
              id: 'cameras_weather',
              icon: '📸',
              label: 'Cámaras y clima',
              dialogue: [
                { speaker: 'penguin', text: '¿Qué descubriste con tus instrumentos en Chryse Planitia?' },
                { speaker: 'machine', text: 'Fotografié por primera vez el paisaje marciano con cielo rosado y medí su viento y temperaturas extremas, abriendo el camino para futuras misiones.' }
              ]
            }
          ],
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! ¡Por fin estoy en Marte! ¿Quién eres?' },
            { speaker: 'machine', text: '¡Bienvenido! Soy Viking 1. Llegué en julio de 1976 y fui la primera misión que operó exitosamente en la superficie de Marte.' }
          ]
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
          penguinText: '¡Qué pequeño eres! ¿Eres un robot con ruedas?',
          penguinAudioUrl: '',
          dialogueText: '¡Hola! Cuidado con mis ruedas. Soy Sojourner, el primer rover que recorrió la superficie de Marte en julio de 1997 con la misión Mars Pathfinder.',
          audioUrl: '',
          greeting: [
            { speaker: 'penguin', text: '¡Qué pequeño eres! ¿Eres un robot con ruedas?' },
            { speaker: 'machine', text: '¡Hola! Cuidado con mis ruedas. Soy Sojourner, el primer rover que recorrió la superficie de Marte en julio de 1997 con la misión Mars Pathfinder.' }
          ],
          topics: [
            {
              id: 'wheels',
              icon: '🛞',
              label: '6 ruedas y suspensión',
              dialogue: [
                { speaker: 'penguin', text: '¡Tienes seis ruedas! ¿Cómo haces para no volcarte?' },
                { speaker: 'machine', text: 'Uso un sistema de suspensión balancín-bogie que permite a mis seis ruedas trepar rocas como «Barnacle Bill» y adaptarme al terreno sin perder el equilibrio.' }
              ]
            },
            {
              id: 'apxs',
              icon: '🔬',
              label: 'Instrumento APXS',
              dialogue: [
                { speaker: 'penguin', text: '¿Para qué sirve tu instrumento APXS?' },
                { speaker: 'machine', text: 'Es un espectrómetro que pegaba a las rocas marcianas. Emitía rayos alfa y X para descubrir qué elementos químicos componen el suelo de Ares Vallis.' }
              ]
            },
            {
              id: 'driving',
              icon: '🎮',
              label: '¿Quién te manejaba?',
              dialogue: [
                { speaker: 'penguin', text: '¿Tú decidías sola hacia dónde avanzar?' },
                { speaker: 'machine', text: 'Los científicos en la Tierra me enviaban rutas cada día porque las señales tardan minutos en llegar. Yo usaba mis sensores láser para esquivar obstáculos.' }
              ]
            }
          ],
          dialogue: [
            { speaker: 'penguin', text: '¡Qué pequeño eres! ¿Eres un robot con ruedas?' },
            { speaker: 'machine', text: '¡Hola! Cuidado con mis ruedas. Soy Sojourner, el primer rover que recorrió la superficie de Marte en julio de 1997 con la misión Mars Pathfinder.' }
          ]
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
          penguinText: '¡Hola! ¿Qué haces tan lejos de la Tierra?',
          penguinAudioUrl: '',
          dialogueText: 'Soy Pioneer 10. Fui la primera nave en cruzar el cinturón de asteroides y en visitar el gigante Júpiter en diciembre de 1973.',
          audioUrl: '',
          greeting: [
            { speaker: 'penguin', text: '¡Hola! ¿Qué haces tan lejos de la Tierra?' },
            { speaker: 'machine', text: 'Soy Pioneer 10. Fui la primera nave en cruzar el cinturón de asteroides y en visitar el gigante Júpiter en diciembre de 1973.' }
          ],
          topics: [
            {
              id: 'jupiter',
              icon: '⚡',
              label: 'Júpiter gigante',
              dialogue: [
                { speaker: 'penguin', text: '¿Qué descubriste al pasar cerca de Júpiter?' },
                { speaker: 'machine', text: 'Descubrí que Júpiter es un planeta gigante gaseoso con intensos campos magnéticos, cinturones de radiación extrema y misteriosas lunas.' }
              ]
            },
            {
              id: 'signal_delay',
              icon: '📡',
              label: 'Señal a 11 horas',
              dialogue: [
                { speaker: 'penguin', text: '¿Cuánto tardaban tus señales en llegar a casa?' },
                { speaker: 'machine', text: 'En mi última señal en enero de 2003, mis datos viajando a la velocidad de la luz tardaron más de 11 horas y 20 minutos en llegar a la Tierra.' }
              ]
            },
            {
              id: 'plaque',
              icon: '💌',
              label: 'Placa dorada',
              dialogue: [
                { speaker: 'penguin', text: 'Veo una placa dorada con dibujos. ¿Qué mensaje lleva?' },
                { speaker: 'machine', text: 'Es un mensaje para civilizaciones lejanas con dibujos de un hombre y una mujer, nuestro sistema solar y la ubicación de la Tierra en la galaxia.' }
              ]
            }
          ],
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! ¿Qué haces tan lejos de la Tierra?' },
            { speaker: 'machine', text: 'Soy Pioneer 10. Fui la primera nave en cruzar el cinturón de asteroides y en visitar el gigante Júpiter en diciembre de 1973.' }
          ]
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
          penguinText: '¡Hola! Este lugar no parece un planeta. ¿Dónde estoy?',
          penguinAudioUrl: '',
          dialogueText: '¡Bienvenido al asteroide 433 Eros! Soy NEAR Shoemaker, la primera nave de la historia en orbitar y aterrizar sobre un asteroide.',
          audioUrl: '',
          greeting: [
            { speaker: 'penguin', text: '¡Hola! Este lugar no parece un planeta. ¿Dónde estoy?' },
            { speaker: 'machine', text: '¡Bienvenido al asteroide 433 Eros! Soy NEAR Shoemaker, la primera nave de la historia en orbitar y aterrizar sobre un asteroide.' }
          ],
          topics: [
            {
              id: 'records',
              icon: '🛰️',
              label: 'Dos grandes récords',
              dialogue: [
                { speaker: 'penguin', text: '¿Cuáles fueron tus mayores hazañas espaciales?' },
                { speaker: 'machine', text: 'Fui la primera nave en orbitar un asteroide en el año 2000, y el 12 de febrero de 2001 me convertí en la primera en tocar su superficie con éxito.' }
              ]
            },
            {
              id: 'sensors',
              icon: '🔦',
              label: 'Láser y sensores',
              dialogue: [
                { speaker: 'penguin', text: '¿Cómo estudiaste la forma y minerales de Eros?' },
                { speaker: 'machine', text: 'Usé un telémetro láser para mapear con precisión cada cráter y elevación, junto con cámaras y espectrómetros que analizaron su composición rocosa.' }
              ]
            },
            {
              id: 'touchdown',
              icon: '🪨',
              label: 'Aterrizaje suave',
              dialogue: [
                { speaker: 'penguin', text: '¿Sobreviviste al aterrizaje sobre la roca?' },
                { speaker: 'machine', text: '¡Sí! Aunque no estaba diseñada para aterrizar, descendí tan suavemente que seguí transmitiendo datos desde la superficie durante dos semanas.' }
              ]
            }
          ],
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! Este lugar no parece un planeta. ¿Dónde estoy?' },
            { speaker: 'machine', text: '¡Bienvenido al asteroide 433 Eros! Soy NEAR Shoemaker, la primera nave de la historia en orbitar y aterrizar sobre un asteroide.' }
          ]
        }
      ]
    }
  ];

  // 3 espacios de quiz (1 por capítulo), con preguntas adaptadas para niñas y niños de 8 a 12 años.
  const QUIZZES = {
    moon: {
      chapterId: 'moon',
      chapterName: 'La Luna',
      questions: [
        {
          id: 'q-moon-1',
          hardwareId: 'surveyor-3',
          hardwareName: 'Surveyor 3',
          question: '¿Para qué usó Surveyor 3 su pala robótica?',
          options: [
            'Para cavar zanjas y hacer pruebas con el suelo lunar.',
            'Para construir una casa para los astronautas.',
            'Para recoger agua de los cráteres.',
            'Para plantar una bandera de metal en el regolito.'
          ],
          correctIndex: 0
        },
        {
          id: 'q-moon-2',
          hardwareId: 'apollo-11-eagle',
          hardwareName: 'Módulo Lunar Eagle (Apollo 11)',
          question: '¿Qué ocurrió con las dos partes de Eagle después de aterrizar?',
          options: [
            'La parte de abajo se quedó en la Luna y la de arriba despegó con los astronautas.',
            'Las dos regresaron juntas a la Tierra.',
            'La parte de arriba se convirtió en un satélite de Marte.',
            'Ambas partes se quedaron para siempre en la superficie lunar.'
          ],
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
          question: '¿Cuáles eran las dos partes principales de la misión Viking 1?',
          options: [
            'Un orbitador y un módulo de aterrizaje.',
            'Un rover y un helicóptero.',
            'Un cohete y un submarino.',
            'Un telescopio y una estación espacial.'
          ],
          correctIndex: 0
        },
        {
          id: 'q-mars-2',
          hardwareId: 'sojourner',
          hardwareName: 'Sojourner Rover',
          question: '¿Para qué servía el instrumento APXS de Sojourner?',
          options: [
            'Para analizar de qué están hechas las rocas y el suelo.',
            'Para enviar astronautas a la Tierra.',
            'Para medir la distancia entre la Tierra y Marte.',
            'Para excavar túneles subterráneos en Ares Vallis.'
          ],
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
          question: '¿Qué mensaje especial llevaba Pioneer 10?',
          options: [
            'Una placa con dibujos de seres humanos, el sistema solar y pistas de la Tierra.',
            'Un mapa para encontrar agua en Marte.',
            'Una fotografía de todos los astronautas de Apollo 11.',
            'Un disco de oro con canciones de ballenas.'
          ],
          correctIndex: 0
        },
        {
          id: 'q-deep-2',
          hardwareId: 'near-shoemaker',
          hardwareName: 'NEAR Shoemaker',
          question: '¿Qué logro hizo especial a NEAR Shoemaker?',
          options: [
            'Fue la primera nave en orbitar un asteroide y después aterrizar en él.',
            'Fue el primer vehículo en caminar sobre la Luna.',
            'Fue el primer rover que exploró Marte.',
            'Fue la primera sonda en salir del sistema solar.'
          ],
          correctIndex: 0
        }
      ]
    }
  };

  // Diálogo final abierto al completar las 3 misiones, invitando a seguir explorando
  const FINAL_DIALOGUE = [
    { speaker: 'ship', text: '¡Atención, explorador! ¡Has regresado con éxito de tu gran aventura espacial!' },
    { speaker: 'penguin', text: '¡Lo conseguimos! Visitamos la Luna, exploramos Marte y viajamos hasta un asteroide en el espacio profundo.' },
    { speaker: 'ship', text: 'Conociste seis máquinas históricas de la NASA. Cada una tenía una misión distinta y nos ayudó a aprender algo nuevo.' },
    { speaker: 'penguin', text: 'Aprendí que algunas máquinas estudian el suelo, otras toman fotografías, otras recorren planetas y algunas viajan hacia las estrellas.' },
    { speaker: 'ship', text: '¡Así es! La exploración espacial necesita curiosidad, ciencia, tecnología y trabajo en equipo.' },
    { speaker: 'penguin', text: '¡Y mi pasaporte de explorador está lleno de sellos y descubrimientos!' },
    { speaker: 'ship', text: '¡Excelente trabajo! Has alcanzado el rango de Comandante. Pero el universo es gigantesco: aún nos esperan las lunas heladas de Júpiter, los anillos de Saturno y nuevos mundos por descubrir.' },
    { speaker: 'penguin', text: '¡El viaje apenas comienza! Y recuerda: ¡la curiosidad es el verdadero combustible de todo gran explorador! ¿Hacia dónde despegamos ahora?' }
  ];

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
    BADGES,
    FINAL_DIALOGUE
  };
})(typeof window !== 'undefined' ? window : globalThis);
