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
          dialogueText: '¡Bip, bip! Soy Surveyor 3. La NASA me envió en abril de 1967 para estudiar la superficie lunar y comprobar si una nave podía aterrizar aquí sin hundirse ni volcarse.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! Soy Cyberpenguin. ¿Quién eres y qué haces en la Luna?' },
            {
              speaker: 'machine',
              text: '¡Bip, bip! Soy Surveyor 3. La NASA me envió en abril de 1967 para estudiar la superficie lunar y comprobar si una nave podía aterrizar aquí sin hundirse ni volcarse.',
              nextPrompt: '¿Para qué usabas tu cámara y tu pala robótica? →'
            },
            { speaker: 'penguin', text: '¿Para qué usabas tu cámara y tu pala robótica?' },
            {
              speaker: 'machine',
              text: 'Tomaba fotografías de las rocas y los cráteres, y con mi pala robótica cavé cuatro pequeñas zanjas para hacer pruebas. ¡Así demostré que el suelo era firme para las misiones Apollo!',
              nextPrompt: '¿Alguien vino a visitarte después? →'
            },
            { speaker: 'penguin', text: '¿Alguien vino a visitarte después?' },
            {
              speaker: 'machine',
              text: '¡Sí! En noviembre de 1969, los astronautas de Apollo 12 aterrizaron cerca de mí y caminaron hasta aquí para estudiar mis piezas. ¡Antes de aterrizar, siempre hay que conocer bien el terreno!',
              nextPrompt: '¡Gracias, Surveyor 3! ✓'
            }
          ]
        },
        {
          id: 'apollo-11-eagle',
          modelKey: 'apolloEagle',
          name: 'Módulo Lunar Eagle',
          siteId: 'mare-tranquillitatis',
          locationShort: 'Mar de la Tranquilidad',
          locationDetail: 'Módulo Lunar Eagle: cerca del borde sur del Mar de la Tranquilidad',
          nasaUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
          pos: { x: 66, y: 61 },
          shipPos: { x: 20, y: 66 },
          spawnPos: { x: 30, y: 72 },
          penguinText: '¡Qué máquina tan especial! ¿Quién eres?',
          penguinAudioUrl: '',
          dialogueText: '¡Hola, explorador! Soy Eagle, el módulo lunar de la misión Apollo 11. El 20 de julio de 1969 llevé a Neil Armstrong y Buzz Aldrin a caminar sobre la Luna en el Mar de la Tranquilidad.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Qué máquina tan especial! ¿Quién eres?' },
            {
              speaker: 'machine',
              text: '¡Hola, explorador! Soy Eagle, el módulo lunar de la misión Apollo 11. El 20 de julio de 1969 llevé a Neil Armstrong y Buzz Aldrin a caminar sobre la Luna en el Mar de la Tranquilidad.',
              nextPrompt: '¿Cómo pudiste aterrizar y después despegar? →'
            },
            { speaker: 'penguin', text: '¿Cómo pudiste aterrizar y después despegar?' },
            {
              speaker: 'machine',
              text: 'Estaba formado por dos partes: la parte de abajo, llamada etapa de descenso, tenía las patas y se quedó en la Luna; la parte de arriba, la etapa de ascenso, despegó con los astronautas.',
              nextPrompt: '¿Qué dejaron los astronautas en la superficie? →'
            },
            { speaker: 'penguin', text: '¿Qué dejaron los astronautas en la superficie?' },
            {
              speaker: 'machine',
              text: 'Recogieron rocas lunares y dejaron instrumentos científicos para medir vibraciones del suelo y calcular la distancia a la Tierra. ¡Los grandes logros se consiguen trabajando en equipo!',
              nextPrompt: '¡Gracias, Eagle! ✓'
            }
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
          dialogueText: '¡Bienvenido! Soy Viking 1, una misión de la NASA que llegó a Marte en julio de 1976 para investigar su paisaje, su clima y su suelo rojizo.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! ¡Por fin estoy en Marte! ¿Quién eres?' },
            {
              speaker: 'machine',
              text: '¡Bienvenido! Soy Viking 1, una misión de la NASA que llegó a Marte en julio de 1976 para investigar su paisaje, su clima y su suelo rojizo.',
              nextPrompt: '¿Cómo estudiabas Marte desde arriba y en el suelo? →'
            },
            { speaker: 'penguin', text: '¿Cómo estudiabas Marte desde arriba y en el suelo?' },
            {
              speaker: 'machine',
              text: 'Mi misión tenía dos partes principales: un orbitador que fotografiaba Marte desde el espacio y este módulo de aterrizaje que analizaba el suelo directamente en la superficie.',
              nextPrompt: '¡¿Y encontraste marcianos en el suelo?! →'
            },
            { speaker: 'penguin', text: '¡¿Y encontraste marcianos en el suelo?!' },
            {
              speaker: 'machine',
              text: '¡Ja, ja! Con mi brazo robótico recogí muestras y busqué señales de vida. No encontré marcianos, pero descubrimos cómo es el ambiente de Marte. ¡En ciencia siempre aprendemos al investigar!',
              nextPrompt: '¡Gracias, Viking 1! ✓'
            }
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
          penguinText: '¡Qué pequeño eres! ¿Eres un robot explorador?',
          penguinAudioUrl: '',
          dialogueText: '¡Hola! ¡Cuidado con mis ruedas! Soy Sojourner, el primer rover que recorrió Marte. Llegué el 4 de julio de 1997 con la misión Mars Pathfinder para explorar distintas rocas.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Qué pequeño eres! ¿Eres un robot explorador?' },
            {
              speaker: 'machine',
              text: '¡Hola! ¡Cuidado con mis ruedas! Soy Sojourner, el primer rover que recorrió Marte. Llegué el 4 de julio de 1997 con la misión Mars Pathfinder para explorar distintas rocas.',
              nextPrompt: '¿Cómo investigabas las rocas y pasabas sobre ellas? →'
            },
            { speaker: 'penguin', text: '¿Cómo investigabas las rocas y pasabas sobre ellas?' },
            {
              speaker: 'machine',
              text: 'Mis seis ruedas con suspensión me ayudaban a avanzar por terreno irregular, y con mi instrumento APXS analizaba de qué elementos estaban hechas las rocas y el suelo marciano.',
              nextPrompt: '¿Tú sola decidías hacia dónde ir? →'
            },
            { speaker: 'penguin', text: '¿Tú sola decidías hacia dónde ir?' },
            {
              speaker: 'machine',
              text: 'Los científicos en la Tierra revisaban mis fotografías y me enviaban instrucciones para avanzar con cuidado. ¡Recuerda: no necesitas ser grande para lograr algo muy importante!',
              nextPrompt: '¡Gracias, Sojourner! ✓'
            }
          ]
        }
      ]
    },
    {
      id: 'deep-space',
      name: 'Frontera Espacial',
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
          penguinText: '¡Hola! ¿Qué haces viajando tan lejos de la Tierra?',
          penguinAudioUrl: '',
          dialogueText: 'Soy Pioneer 10. Despegué en 1972, fui la primera nave en cruzar el cinturón de asteroides y la primera en estudiar de cerca el gigante planeta Júpiter.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! ¿Qué haces viajando tan lejos de la Tierra?' },
            {
              speaker: 'machine',
              text: 'Soy Pioneer 10. Despegué en 1972, fui la primera nave en cruzar el cinturón de asteroides y la primera en estudiar de cerca el gigante planeta Júpiter.',
              nextPrompt: '¿Qué estudiaste en Júpiter y cómo enviabas datos? →'
            },
            { speaker: 'penguin', text: '¿Qué estudiaste en Júpiter y cómo enviabas datos?' },
            {
              speaker: 'machine',
              text: 'Observé su atmósfera, su radiación y sus lunas, y enviaba todo con mi gran antena. ¡Estaba tan lejos que mi última señal en 2003 tardó más de 11 horas en llegar a la Tierra!',
              nextPrompt: '¿Llevas algún mensaje especial contigo? →'
            },
            { speaker: 'penguin', text: '¿Llevas algún mensaje especial contigo?' },
            {
              speaker: 'machine',
              text: '¡Sí! Llevo una placa metálica con dibujos de un hombre y una mujer, nuestro sistema solar y pistas sobre dónde está la Tierra, como una carta para quien me encuentre en el futuro.',
              nextPrompt: '¡Buen viaje, Pioneer 10! ✓'
            }
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
          dialogueText: '¡Bienvenido al asteroide Eros! Soy NEAR Shoemaker y fui enviada por la NASA para estudiar de cerca estas enormes rocas espaciales que giran alrededor del Sol.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! Este lugar no parece un planeta. ¿Dónde estoy?' },
            {
              speaker: 'machine',
              text: '¡Bienvenido al asteroide Eros! Soy NEAR Shoemaker y fui enviada por la NASA para estudiar de cerca estas enormes rocas espaciales que giran alrededor del Sol.',
              nextPrompt: '¿Qué instrumentos usaste para estudiar el asteroide? →'
            },
            { speaker: 'penguin', text: '¿Qué instrumentos usaste para estudiar el asteroide?' },
            {
              speaker: 'machine',
              text: 'En febrero del año 2000 entré en órbita alrededor de Eros y usé cámaras, sensores de minerales y un láser para medir su forma y descubrir cómo se formó el sistema solar.',
              nextPrompt: '¿Y qué logro histórico conseguiste al final? →'
            },
            { speaker: 'penguin', text: '¿Y qué logro histórico conseguiste al final?' },
            {
              speaker: 'machine',
              text: '¡Fui la primera nave en orbitar un asteroide y el 12 de febrero de 2001 me convertí en la primera en aterrizar en él! Incluso seguí enviando datos desde su superficie durante dos semanas.',
              nextPrompt: '¡Gracias, NEAR Shoemaker! ✓'
            }
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
          hardwareName: 'Módulo Lunar Eagle',
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
      chapterName: 'Frontera Espacial',
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
