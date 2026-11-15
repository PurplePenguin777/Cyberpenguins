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
          dialogueText: '¡Bip, bip! Soy Surveyor 3. La NASA me envió para estudiar la superficie lunar y comprobar si una nave podía aterrizar aquí sin hundirse ni volcarse.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! Soy Cyberpenguin. ¿Quién eres y qué haces en la Luna?' },
            { speaker: 'machine', text: '¡Bip, bip! Soy Surveyor 3. La NASA me envió para estudiar la superficie lunar y comprobar si una nave podía aterrizar aquí sin hundirse ni volcarse.' },
            { speaker: 'penguin', text: '¿Cuándo llegaste?' },
            { speaker: 'machine', text: 'Despegué de la Tierra el 17 de abril de 1967 y aterricé en la Luna el 20 de abril. ¡Fue un viaje de tres días!' },
            { speaker: 'penguin', text: '¿Y qué querían descubrir los científicos?' },
            { speaker: 'machine', text: 'Querían saber cómo era el suelo lunar. Antes de enviar astronautas, necesitaban comprobar si el terreno podía sostener una nave de aterrizaje.' },
            { speaker: 'penguin', text: 'Veo que tienes una cámara. ¿Para qué la usabas?' },
            { speaker: 'machine', text: 'Tomaba fotografías de mi alrededor y las enviaba a la Tierra. Así, los científicos podían observar las rocas, los hoyos y el paisaje lunar.' },
            { speaker: 'penguin', text: '¿Y esa especie de brazo con una pala?' },
            { speaker: 'machine', text: '¡Es mi herramienta para tocar y recoger suelo! La usé para cavar cuatro pequeñas zanjas y hacer pruebas. Así los científicos pudieron estudiar qué tan firme era el terreno.' },
            { speaker: 'penguin', text: '¿Qué descubrieron? ¿La Luna era demasiado blanda para aterrizar?' },
            { speaker: 'machine', text: '¡No! Las pruebas mostraron que el suelo podía sostener una nave como el módulo lunar Apollo. ¡Eso fue muy importante para preparar futuras misiones!' },
            { speaker: 'penguin', text: 'Entonces ayudaste a que los astronautas pudieran llegar con más seguridad.' },
            { speaker: 'machine', text: '¡Exactamente! Y mi historia tuvo una visita especial: en noviembre de 1969, los astronautas de Apollo 12 aterrizaron cerca de mí, caminaron hasta donde estaba y recogieron algunas de mis piezas para estudiarlas en la Tierra.' },
            { speaker: 'penguin', text: '¡Qué increíble! Después de estar tanto tiempo aquí, ¡unos astronautas fueron a visitarte!' },
            { speaker: 'machine', text: 'Así es. Mi último contacto con la Tierra había sido el 4 de mayo de 1967, pero mi trabajo siguió ayudando a los científicos.' },
            { speaker: 'penguin', text: 'Gracias, Surveyor 3. Aprendí que antes de construir o aterrizar en un lugar, ¡primero hay que conocer bien el terreno!' },
            { speaker: 'machine', text: '¡Esa es una gran lección, pequeño explorador! ¡Sigue investigando!' }
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
          dialogueText: '¡Hola, explorador! Soy Eagle, el módulo lunar de la misión Apollo 11.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Qué máquina tan especial! ¿Quién eres?' },
            { speaker: 'machine', text: '¡Hola, explorador! Soy Eagle, el módulo lunar de la misión Apollo 11.' },
            { speaker: 'penguin', text: '¿Tú llevaste a los primeros astronautas que caminaron sobre la Luna?' },
            { speaker: 'machine', text: '¡Así es! La misión Apollo 11 despegó el 16 de julio de 1969. Viajé con Neil Armstrong y Buzz Aldrin, mientras Michael Collins permaneció en otra nave, llamada Columbia, alrededor de la Luna.' },
            { speaker: 'penguin', text: '¿Y cuándo llegaste a la superficie?' },
            { speaker: 'machine', text: 'Aterricé el 20 de julio de 1969 en un lugar llamado Mar de la Tranquilidad.' },
            { speaker: 'penguin', text: '¡Ese día los seres humanos caminaron por primera vez en la Luna! ¿Qué hicieron allí?' },
            { speaker: 'machine', text: 'Neil Armstrong y Buzz Aldrin tomaron fotografías, instalaron instrumentos científicos y recogieron rocas y suelo lunar para estudiarlos en la Tierra.' },
            { speaker: 'penguin', text: 'Pero, ¿cómo pudiste aterrizar y después despegar?' },
            { speaker: 'machine', text: 'Estaba formado por dos partes. La parte de abajo, llamada etapa de descenso, tenía las patas y ayudó a aterrizar. Esa parte se quedó en la Luna.' },
            { speaker: 'machine', text: 'La parte de arriba, llamada etapa de ascenso, despegó con los dos astronautas para llevarlos de vuelta a la órbita lunar y reunirse con Columbia.' },
            { speaker: 'penguin', text: '¡Ahora lo entiendo! Una parte se quedó y la otra regresó con los astronautas.' },
            { speaker: 'machine', text: '¡Exactamente! Además, los astronautas dejaron instrumentos para seguir estudiando la Luna, como un aparato que detectaba vibraciones del suelo y un reflector que ayudaba a medir la distancia entre la Tierra y la Luna.' },
            { speaker: 'penguin', text: '¡Así que la investigación continuó incluso después de que ustedes se fueron!' },
            { speaker: 'machine', text: '¡Sí! La exploración no termina cuando una nave despega. Los instrumentos pueden seguir ayudándonos a aprender.' },
            { speaker: 'penguin', text: 'Gracias, Eagle. ¡Tu viaje fue un gran paso para la exploración espacial!' },
            { speaker: 'machine', text: '¡Y recuerda, explorador: los grandes logros se consiguen trabajando en equipo!' }
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
          dialogueText: '¡Bienvenido! Soy Viking 1, una misión de la NASA que estudió Marte desde el espacio y desde su superficie.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! ¡Por fin estoy en Marte! ¿Quién eres?' },
            { speaker: 'machine', text: '¡Bienvenido! Soy Viking 1, una misión de la NASA que estudió Marte desde el espacio y desde su superficie.' },
            { speaker: 'penguin', text: '¿Cuándo llegaste?' },
            { speaker: 'machine', text: 'Despegué el 20 de agosto de 1975. Llegué a la órbita de Marte en junio de 1976 y mi módulo de aterrizaje llegó a la superficie el 20 de julio de ese año.' },
            { speaker: 'penguin', text: '¿Qué querían averiguar los científicos?' },
            { speaker: 'machine', text: 'Querían conocer el paisaje, el clima, el suelo y buscar posibles señales de vida. ¡Marte tenía muchos secretos por descubrir!' },
            { speaker: 'penguin', text: '¿Cómo podías estudiar tantas cosas?' },
            { speaker: 'machine', text: 'Mi misión tenía dos partes. Una era el orbitador, que daba vueltas alrededor de Marte y tomaba fotografías desde arriba. La otra era el módulo de aterrizaje, que trabajaba directamente sobre el suelo.' },
            { speaker: 'penguin', text: '¿Y qué podía hacer el módulo de aterrizaje?' },
            { speaker: 'machine', text: 'Tenía cámaras para fotografiar el paisaje, instrumentos para medir la temperatura y el viento, y un brazo robótico para recoger pequeñas porciones de suelo.' },
            { speaker: 'penguin', text: '¿Qué hacías con el suelo que recogías?' },
            { speaker: 'machine', text: 'Lo llevaba a instrumentos que estudiaban de qué estaba hecho. También realicé experimentos para buscar señales de vida.' },
            { speaker: 'penguin', text: '¡¿Y encontraste marcianos?!' },
            { speaker: 'machine', text: '¡Ja, ja! No encontré pruebas claras de vida. Pero eso también fue importante: los científicos aprendieron mucho sobre las condiciones de Marte.' },
            { speaker: 'penguin', text: 'Entonces, aunque no encontraste vida, descubriste cosas que ayudaron a conocer mejor el planeta.' },
            { speaker: 'machine', text: '¡Exactamente! Una investigación es valiosa aunque el resultado sea diferente al que esperábamos.' },
            { speaker: 'penguin', text: '¡Gracias, Viking 1! Aprendí que hacer ciencia también significa observar, probar y aprender de los resultados.' },
            { speaker: 'machine', text: '¡Muy bien dicho, explorador! ¡Sigue haciendo preguntas!' }
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
          penguinText: '¡Qué pequeño eres! ¿Eres un robot?',
          penguinAudioUrl: '',
          dialogueText: '¡Hola! ¡Cuidado con mis ruedas! Estoy explorando esta zona. ¡Soy Sojourner, un rover!',
          audioUrl: '',
          dialogue: [
            { speaker: 'machine', text: '¡Hola! ¡Cuidado con mis ruedas! Estoy explorando esta zona.' },
            { speaker: 'penguin', text: '¡Qué pequeño eres! ¿Eres un robot?' },
            { speaker: 'machine', text: '¡Sí! Soy Sojourner, un rover. Un rover es un vehículo robótico que puede desplazarse por la superficie de otro mundo.' },
            { speaker: 'penguin', text: '¿Cuándo llegaste a Marte?' },
            { speaker: 'machine', text: 'Llegué el 4 de julio de 1997 como parte de la misión Mars Pathfinder. Salí de mi plataforma de aterrizaje dos días después.' },
            { speaker: 'penguin', text: '¿Y para qué necesitabas moverte?' },
            { speaker: 'machine', text: 'Para explorar distintos lugares, observar rocas y estudiar el suelo. Una plataforma de aterrizaje se queda en un sitio, pero yo podía recorrer pequeñas distancias.' },
            { speaker: 'penguin', text: '¡Veo que tienes seis ruedas! ¿Te ayudan a pasar sobre las rocas?' },
            { speaker: 'machine', text: '¡Exactamente! Mis seis ruedas y mi sistema de suspensión me ayudaban a avanzar por un terreno irregular.' },
            { speaker: 'penguin', text: '¿Y cómo investigabas las rocas?' },
            { speaker: 'machine', text: 'Tenía cámaras para tomar fotografías y un instrumento llamado APXS. Ese instrumento ayudaba a estudiar de qué elementos estaban hechas las rocas y el suelo.' },
            { speaker: 'penguin', text: '¿Tú decidías a dónde ir?' },
            { speaker: 'machine', text: 'No como un automóvil con una persona al volante. Los científicos en la Tierra revisaban mis imágenes y me enviaban instrucciones para moverme con cuidado.' },
            { speaker: 'penguin', text: '¡Aunque estaban lejos, trabajaban contigo!' },
            { speaker: 'machine', text: '¡Así es! Mi misión demostró que un rover pequeño podía moverse por Marte y estudiar sus rocas. Después llegaron otros exploradores robóticos más grandes y avanzados.' },
            { speaker: 'penguin', text: '¡Qué orgullo! ¡Fuiste pequeña, pero ayudaste a abrir camino a otros rovers!' },
            { speaker: 'machine', text: '¡Recuerda, explorador: no necesitas ser grande para hacer algo importante!' }
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
          dialogueText: 'Soy Pioneer 10. La NASA me envió a explorar los planetas exteriores y fui la primera nave en estudiar Júpiter de cerca.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! ¿Qué haces tan lejos de la Tierra?' },
            { speaker: 'machine', text: 'Soy Pioneer 10. La NASA me envió a explorar los planetas exteriores y fui la primera nave en estudiar Júpiter de cerca.' },
            { speaker: 'penguin', text: '¿Cuándo comenzó tu viaje?' },
            { speaker: 'machine', text: 'Despegué el 2 de marzo de 1972. Mi viaje me llevó a través del cinturón principal de asteroides, una región con muchos cuerpos rocosos entre Marte y Júpiter.' },
            { speaker: 'penguin', text: '¿Fuiste la primera nave en cruzar esa región?' },
            { speaker: 'machine', text: '¡Sí! Después continué hasta Júpiter y pasé cerca de él el 4 de diciembre de 1973.' },
            { speaker: 'penguin', text: '¿Qué estudiaste de ese planeta gigante?' },
            { speaker: 'machine', text: 'Observé su atmósfera, su campo magnético, la radiación que lo rodea y algunas de sus lunas. Mis datos ayudaron a preparar futuras misiones.' },
            { speaker: 'penguin', text: '¿Cómo enviabas toda esa información a la Tierra?' },
            { speaker: 'machine', text: 'Usaba instrumentos científicos para reunir datos y una gran antena para transmitirlos mediante señales de radio.' },
            { speaker: 'penguin', text: 'Pero estás muy lejos. ¿Las señales tardaban mucho en llegar?' },
            { speaker: 'machine', text: '¡Muchísimo! Mi última señal llegó a la Tierra el 23 de enero de 2003. En ese momento, la señal había tardado unas 11 horas y 20 minutos en viajar.' },
            { speaker: 'penguin', text: '¡Casi medio día! ¿Y llevabas algo especial contigo?' },
            { speaker: 'machine', text: 'Sí. Llevaba una placa metálica con dibujos de un hombre y una mujer, nuestro sistema solar y pistas sobre dónde está la Tierra.' },
            { speaker: 'penguin', text: '¿Era como una carta para alguien que pudiera encontrarte algún día?' },
            { speaker: 'machine', text: '¡Esa era la idea! Era un mensaje simbólico de la humanidad para posibles seres inteligentes que pudieran encontrarme en el futuro.' },
            { speaker: 'penguin', text: '¡Qué bonito! No solo exploraste Júpiter: también llevaste un mensaje de nuestro planeta.' },
            { speaker: 'machine', text: 'Así es. ¡La curiosidad puede llevar nuestros mensajes mucho más allá de casa!' }
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
          dialogueText: '¡Bienvenido al asteroide Eros! Soy NEAR Shoemaker y fui enviada para estudiar asteroides.',
          audioUrl: '',
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! Este lugar no parece un planeta. ¿Dónde estoy?' },
            { speaker: 'machine', text: '¡Bienvenido al asteroide Eros! Soy NEAR Shoemaker y fui enviada para estudiar asteroides.' },
            { speaker: 'penguin', text: '¿Qué es un asteroide?' },
            { speaker: 'machine', text: 'Es un cuerpo rocoso o metálico que viaja alrededor del Sol. Estudiarlos ayuda a conocer mejor cómo se formó nuestro sistema solar.' },
            { speaker: 'penguin', text: '¿Cuándo comenzaste tu aventura?' },
            { speaker: 'machine', text: 'Despegué el 17 de febrero de 1996. Primero pasé cerca de otro asteroide llamado Mathilde y después continué mi viaje hacia Eros.' },
            { speaker: 'penguin', text: '¿Lograste llegar hasta aquí?' },
            { speaker: 'machine', text: '¡Sí! Entré en órbita alrededor de Eros el 14 de febrero de 2000. Fui la primera nave espacial en orbitar un asteroide.' },
            { speaker: 'penguin', text: '¿Qué significa estar en órbita?' },
            { speaker: 'machine', text: 'Significa que viajaba alrededor de Eros siguiendo un camino curvo, en lugar de alejarme en línea recta. Así podía observarlo desde distintos lugares.' },
            { speaker: 'penguin', text: '¿Qué instrumentos usabas para estudiarlo?' },
            { speaker: 'machine', text: 'Tenía cámaras para tomar imágenes, instrumentos para estudiar los minerales y elementos de su superficie, y un láser para medir distancias y conocer mejor su forma.' },
            { speaker: 'penguin', text: '¡Pareces un laboratorio espacial! ¿Y qué pasó después de estudiar el asteroide?' },
            { speaker: 'machine', text: 'Los científicos planearon que descendiera con cuidado. El 12 de febrero de 2001 conseguí tocar la superficie de Eros. ¡Me convertí en la primera nave en aterrizar en un asteroide!' },
            { speaker: 'penguin', text: '¿Y pudiste seguir trabajando después de aterrizar?' },
            { speaker: 'machine', text: '¡Sí! Aunque no fui diseñada como una nave de aterrizaje, sobreviví al contacto y seguí enviando información durante aproximadamente dos semanas.' },
            { speaker: 'penguin', text: '¡Primero orbitaste un asteroide y después aterrizaste en él!' },
            { speaker: 'machine', text: '¡Así es! Mi misión demostró que podemos explorar lugares pequeños y lejanos que antes parecían difíciles de alcanzar.' },
            { speaker: 'penguin', text: 'Gracias, NEAR Shoemaker. ¡Ahora sé que hasta una roca espacial puede contarnos parte de la historia del sistema solar!' },
            { speaker: 'machine', text: '¡Sigue explorando, Cyberpenguin! Cada descubrimiento abre nuevas preguntas.' }
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
