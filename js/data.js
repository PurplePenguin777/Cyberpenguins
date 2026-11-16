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
          locationDetail: 'Surveyor 3: Océano de las Tormentas (Cráter Surveyor)',
          nasaUrl: 'https://science.nasa.gov/mission/surveyor-3/',
          pos: { x: 64, y: 60 },
          shipPos: { x: 20, y: 66 },
          spawnPos: { x: 30, y: 72 },
          penguinText: '¡Hola! Soy Cyberpenguin. ¿Quién eres y qué haces en la Luna?',
          penguinAudioUrl: 'audio/cp_surveyor_opc_a.mp3',
          dialogueText: '¡Bip, biiip! ¡Alerta de sensores! ¡Detecto un visitante emplumado en mis patas! ¡Hola, pequeño viajero!',
          audioUrl: 'audio/surveyor_saludo.mp3',
          branchingDialogue: {
            greeting: {
              speaker: 'machine',
              text: '¡Bip, biiip! ¡Alerta de sensores! ¡Detecto un visitante emplumado en mis patas! ¡Hola, pequeño viajero! ¿Vienes de la Tierra?',
              audioUrl: 'audio/surveyor_saludo.mp3'
            },
            decision1: {
              choices: [
                {
                  id: '1a',
                  label: '🔍 ¡Hola! Soy Cyberpenguin. ¿Tú quién eres y qué haces parada aquí?',
                  penguinText: '¡Hola! Soy Cyberpenguin. ¿Tú quién eres y qué haces parada aquí?',
                  reply: '¡Mucho gusto, Cyberpenguin! Soy Surveyor 3, la nave robótica que la NASA envió en abril de 1967. ¡Fui enviada a este cráter para investigar el suelo lunar y preparar el camino para los astronautas del programa Apollo!',
                  audioPenguin: 'audio/cp_surveyor_opc_a.mp3',
                  audioReply: 'audio/surveyor_resp_1a.mp3'
                },
                {
                  id: '1b',
                  label: '⛏️ ¡Aaaah, un robot de tres patas! ¿Y por qué tienes ese brazo con una palita?',
                  penguinText: '¡Aaaah, un robot de tres patas! ¿Y por qué tienes ese brazo con una palita?',
                  reply: '¡Qué buen ojo tienes! Soy la primera nave de la historia con una pala robótica en la Luna. Con mi motor eléctrico la estiraba y raspaba la tierra como si jugara en un arenero gigante para medir qué tan duro era el terreno.',
                  audioPenguin: 'audio/cp_surveyor_opc_b.mp3',
                  audioReply: 'audio/surveyor_resp_1b.mp3'
                },
                {
                  id: '1c',
                  label: '🏀 ¿Es verdad que rebotaste como una pelota cuando aterrizaste?',
                  penguinText: '¿Es verdad que rebotaste como una pelota cuando aterrizaste?',
                  reply: '¡Ja, ja, ja! ¡Totalmente cierto! Cuando llegué el 20 de abril de 1967, las rocas reflejaron mi radar y mis pequeños cohetes no se apagaron a tiempo. ¡Reboté dos veces sobre la Luna como en un trampolín antes de quedarme quieta!',
                  audioPenguin: 'audio/cp_surveyor_opc_c.mp3',
                  audioReply: 'audio/surveyor_resp_1c.mp3'
                }
              ]
            },
            commonBridge: {
              speaker: 'machine',
              text: 'Antes de que los astronautas bajaran a caminar, los científicos necesitaban saber si el suelo aguantaría su peso o si se hundirían como en arena movediza. ¡Con mi pala cavé cuatro zanjas y apreté el polvo para demostrar que era firme y seguro!',
              audioUrl: 'audio/surveyor_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '📸 ¿Y cuántas fotos tomaste con tu cámara de televisión?',
                  penguinText: '¿Y cuántas fotos tomaste con tu cámara de televisión?',
                  reply: '¡Tomé más de 6.300 fotografías en blanco y negro! Fotografié las rocas, las zanjas que cavé con mi pala e incluso tomé una foto histórica de un eclipse solar donde la Tierra tapó al Sol vista desde la Luna.',
                  audioPenguin: 'audio/cp_surveyor_opc_2a.mp3',
                  audioReply: 'audio/surveyor_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '⭐ ¿Es verdad que luego vinieron astronautas a visitarte en persona?',
                  penguinText: '¿Es verdad que luego vinieron astronautas a visitarte en persona?',
                  reply: '¡Bip-bip! ¡Sí, vinieron a visitarme a MÍ en persona! En noviembre de 1969, los astronautas del Apollo 12 aterrizaron su módulo Intrepid a solo 160 metros de distancia y vinieron caminando hasta aquí. ¡Pete Conrad y Alan Bean me examinaron y se llevaron mi cámara a la Tierra para estudiar cómo el metal aguanta dos años en el espacio!',
                  audioPenguin: 'audio/cp_surveyor_opc_2b.mp3',
                  audioReply: 'audio/surveyor_resp_2b.mp3'
                },
                {
                  id: '2c',
                  label: '🔬 ¿Y qué aprendieron los científicos al llevarse tus piezas a la Tierra?',
                  penguinText: '¿Y qué aprendieron los científicos al llevarse tus piezas a la Tierra?',
                  reply: '¡Fue la única vez en la historia que piezas dejadas en otro mundo regresaron a un laboratorio terrestre! Descubrieron cómo la radiación, el polvo y el vacío del espacio desgastan los cables y la pintura, ayudando a diseñar naves y trajes espaciales mucho más seguros.',
                  audioPenguin: 'audio/cp_surveyor_opc_2c.mp3',
                  audioReply: 'audio/surveyor_resp_2c.mp3'
                }
              ]
            },
            closing: {
              speaker: 'machine',
              text: 'Transmití datos hasta mayo de 1967, pero mi mayor orgullo fue ayudar a los astronautas a pisar la Luna con seguridad. ¡Sigue explorando con valentía, Cyberpenguin!',
              audioUrl: 'audio/surveyor_despedida.mp3'
            },
            farewellPenguin: {
              speaker: 'penguin',
              text: '¡Gracias, valiente Surveyor 3! ¡Te ganaste el primer sello lunar en mi pasaporte!',
              audioUrl: 'audio/cp_surveyor_gracias.mp3'
            }
          },
          dialogue: [
            { speaker: 'penguin', text: '¡Hola! Soy Cyberpenguin. ¿Quién eres y qué haces en la Luna?' },
            {
              speaker: 'machine',
              text: '¡Bip, bip! Soy Surveyor 3. La NASA me envió en 1967 para estudiar el suelo lunar con mi pala robótica y preparar el camino para el programa Apollo.',
              nextPrompt: '¿Para qué usabas tu pala robótica? →'
            },
            { speaker: 'penguin', text: '¿Para qué usabas tu pala robótica?' },
            {
              speaker: 'machine',
              text: 'Cavé zanjas para comprobar la dureza del suelo y tomé miles de fotos. ¡Demostré que la Luna era firme y segura para caminar!',
              nextPrompt: '¿Es verdad que te visitaron los astronautas? →'
            },
            { speaker: 'penguin', text: '¿Es verdad que te visitaron los astronautas?' },
            {
              speaker: 'machine',
              text: '¡Sí! En 1969 los astronautas del Apollo 12 caminaron hasta mí y se llevaron mi cámara a la Tierra para estudiar cómo sobrevivió en el espacio.',
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
          penguinAudioUrl: 'audio/cp_eagle_opc_1a.mp3',
          dialogueText: '¡Saludos, Cyberpenguin! ¡Bienvenido a la Base Tranquilidad! Estás parado en el sitio más histórico de la Luna.',
          audioUrl: 'audio/eagle_saludo.mp3',
          branchingDialogue: {
            greeting: {
              speaker: 'machine',
              text: '¡Saludos, Cyberpenguin! ¡Bienvenido a la Base Tranquilidad! Estás parado en el sitio más histórico de la Luna.',
              audioUrl: 'audio/eagle_saludo.mp3'
            },
            decision1: {
              choices: [
                {
                  id: '1a',
                  label: '🏛️ ¡No puede ser! ¿Tú eres el legendario Eagle del Apollo 11?',
                  penguinText: '¡No puede ser! ¿Tú eres el legendario Eagle del Apollo 11?',
                  reply: '¡El mismo que viste y calza! El 20 de julio de 1969 traje a Neil Armstrong y Buzz Aldrin hasta aquí. Fuimos impulsados desde la Tierra por el gigantesco cohete Saturno V, ¡un coloso tan alto como un edificio de 36 pisos!',
                  audioPenguin: 'audio/cp_eagle_opc_1a.mp3',
                  audioReply: 'audio/eagle_resp_1a.mp3'
                },
                {
                  id: '1b',
                  label: '🍫 ¡Wow, pareces cubierto de papel dorado! ¿Por qué brillas tanto?',
                  penguinText: '¡Wow, pareces cubierto de papel de chocolate dorado! ¿Por qué brillas tanto?',
                  reply: '¡Ja, ja! ¡Muchos niños creen que es papel de regalo! En realidad son mantas térmicas de alta tecnología llamadas Kapton y Mylar. En la Luna bajo el Sol el metal hierve a 120°C y en la sombra baja a -150°C. Esas mantas reflejaban el calor como un termo gigante para cuidar a los astronautas.',
                  audioPenguin: 'audio/cp_eagle_opc_1b.mp3',
                  audioReply: 'audio/eagle_resp_1b.mp3'
                },
                {
                  id: '1c',
                  label: '👨‍🚀 ¿Dónde están tus astronautas? ¿Están durmiendo la siesta adentro?',
                  penguinText: '¿Dónde están tus astronautas? ¿Están durmiendo la siesta adentro?',
                  reply: '¡Ya regresaron sanos y salvos a la Tierra hace muchos años! Pero éramos tres compañeros: Neil y Buzz bajaron conmigo a la superficie, mientras Michael Collins cuidaba la nave nodriza Columbia en órbita esperando nuestro regreso.',
                  audioPenguin: 'audio/cp_eagle_opc_1c.mp3',
                  audioReply: 'audio/eagle_resp_1c.mp3'
                }
              ]
            },
            commonBridge: {
              speaker: 'machine',
              text: 'Mi cuerpo estaba dividido en dos partes: la etapa de descenso (la parte dorada con patas que se quedó para siempre aquí) y la etapa de ascenso (la cabina superior que encendió su propio motor como un cohete para llevar a los astronautas de regreso al espacio). ¡Trabajaron en equipo perfecto!',
              audioUrl: 'audio/eagle_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '🪨 ¿Qué hicieron Neil y Buzz mientras caminaban aquí afuera?',
                  penguinText: '¿Qué hicieron Neil y Buzz mientras caminaban aquí afuera?',
                  reply: 'Caminaron durante más de dos horas y media, tomaron fotos, clavaron la bandera y recolectaron casi 22 kilogramos de rocas y polvo lunar usando palas y pinzas especiales para llevar a los laboratorios de la Tierra.',
                  audioPenguin: 'audio/cp_eagle_opc_2a.mp3',
                  audioReply: 'audio/eagle_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '⭐ ¿El aterrizaje fue tan fácil como apretar un botón automático?',
                  penguinText: '¿El aterrizaje fue tan fácil como apretar un botón automático?',
                  reply: '¡Ufff, casi no lo logramos! Durante el descenso la computadora se sobrecargó y saltó la alarma 1202, ¡igual que cuando abres demasiadas aplicaciones en una tableta y se traba! Nos llevaba directo a un cráter con rocas como autos. Neil Armstrong tomó los controles manuales como en un videojuego y aterrizó cuando quedaban menos de 40 segundos de combustible. ¡Pura adrenalina!',
                  audioPenguin: 'audio/cp_eagle_opc_2b.mp3',
                  audioReply: 'audio/eagle_resp_2b.mp3'
                },
                {
                  id: '2c',
                  label: '🔬 Veo unos aparatos con espejos y paneles solares sobre el suelo... ¿qué son?',
                  penguinText: 'Veo unos aparatos con espejos y paneles solares sobre el suelo... ¿qué son?',
                  reply: '¡Excelente vista! Dejamos el paquete científico EASEP con unos espejos reflectores. Funcionan como los ojos de gato de las bicicletas: devuelven la luz directo a quien la envía. Hasta hoy, los científicos disparan rayos láser desde telescopios en la Tierra a esos espejos para medir la distancia exacta a la Luna al milímetro.',
                  audioPenguin: 'audio/cp_eagle_opc_2c.mp3',
                  audioReply: 'audio/eagle_resp_2c.mp3'
                }
              ]
            },
            closing: {
              speaker: 'machine',
              text: 'La huella de Neil y Buzz quedó marcada para la eternidad. Pero el mensaje más hermoso es la placa en mi pata: "Vinimos en son de paz en nombre de toda la humanidad".',
              audioUrl: 'audio/eagle_despedida.mp3'
            },
            farewellPenguin: {
              speaker: 'penguin',
              text: '¡Un gran paso para un pingüino y un salto gigantesco para la exploración! ¡Segundo sello conseguido!',
              audioUrl: 'audio/cp_eagle_gracias.mp3'
            }
          },
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
              text: 'Recogieron rocas lunares y dejaron instrumentos científicos para medir vibraciones del suelo y calcular la distancia a la Tierra con lásers. ¡Los grandes logros se consiguen trabajando en equipo!',
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
          penguinAudioUrl: 'audio/cp_viking_opc_1a.mp3',
          dialogueText: '¡Detecto una lectura biológica inusual! ¡Picos, plumas y traje espacial! ¡Bienvenido a Marte, Cyberpenguin!',
          audioUrl: 'audio/viking_saludo.mp3',
          branchingDialogue: {
            greeting: {
              speaker: 'machine',
              text: '¡Detecto una lectura biológica inusual! ¡Picos, plumas y traje espacial! ¡Bienvenido a Marte, Cyberpenguin!',
              audioUrl: 'audio/viking_saludo.mp3'
            },
            decision1: {
              choices: [
                {
                  id: '1a',
                  label: '🔴 ¡Hola Viking 1! ¿Tú fuiste la primera nave en llegar a Marte?',
                  penguinText: '¡Hola Viking 1! ¿Tú fuiste la primera nave en llegar a Marte?',
                  reply: '¡Fui la primera nave estadounidense en aterrizar con total éxito en Marte y sobrevivir para enviar datos! Aterricé el 20 de julio de 1976. Y mi misión era doble: mientras mi Orbitador tomaba fotos desde las alturas como un satélite espía amigable, yo aterricé aquí abajo para oler, raspar y probar el suelo marciano.',
                  audioPenguin: 'audio/cp_viking_opc_1a.mp3',
                  audioReply: 'audio/viking_resp_1a.mp3'
                },
                {
                  id: '1b',
                  label: '👽 ¡Rápido, dime la verdad! ¿Encontraste marcianitos verdes con antenas?',
                  penguinText: '¡Rápido, dime la verdad! ¿Encontraste marcianitos verdes con antenas?',
                  reply: '¡Ja, ja, ja! ¡Nada de hombrecitos verdes ni ciudades alienígenas! Mis sensores buscaron microbios o pequeñas bacterias en el polvo, pero no encontramos vida. ¡Eso sí, descubrí algo fascinante! El suelo marciano tiene químicos súper agresivos, muy parecidos al agua oxigenada. Esos químicos actúan como un desinfectante gigante que destruye cualquier rastro biológico.',
                  audioPenguin: 'audio/cp_viking_opc_1b.mp3',
                  audioReply: 'audio/viking_resp_1b.mp3'
                },
                {
                  id: '1c',
                  label: '🦾 ¿Por qué tienes ese brazo tan largo terminado en palita?',
                  penguinText: '¿Por qué tienes ese brazo tan largo terminado en palita?',
                  reply: '¡Es mi brazo mecánico de 3 metros! En la punta llevaba una pala con un pequeño motor para raspar el suelo como si fuera una cuchara en un tazón de cereal. Recogía tierrita marciana y la soltaba por unos embudos en mi lomo directo a mis hornos científicos en miniatura.',
                  audioPenguin: 'audio/cp_viking_opc_1c.mp3',
                  audioReply: 'audio/viking_resp_1c.mp3'
                }
              ]
            },
            commonBridge: {
              speaker: 'machine',
              text: 'En mi interior llevaba un aparato con nombre de trabalenguas: el GCMS (Espectrómetro de Masas y Cromatógrafo de Gases). Para entenderlo fácil: ¡imagina un hornito de cocina espacial! Mi brazo echaba una cucharadita de tierra marciana en un tubito, el hornito la calentaba y luego olía los vaporcitos que soltaba para descubrir de qué está hecho Marte.',
              audioUrl: 'audio/viking_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '❄️ ¿Cómo soportaste tanto frío durante años?',
                  penguinText: '¿Cómo soportaste tanto frío durante años?',
                  reply: '¡No usé paneles solares porque las tormentas de polvo marciano los habrían cubierto de tierra como una persiana cerrada! En su lugar, llevé dos baterías especiales llamadas RTG. Adentro tenían una cápsula que produce calor continuo, como una fogata atómica segura. Ese calor se convertía en electricidad para no congelarme nunca.',
                  audioPenguin: 'audio/cp_viking_opc_2a.mp3',
                  audioReply: 'audio/viking_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '🌪️ ¿Tuviste que enfrentar tormentas de arena?',
                  penguinText: '¿Tuviste que enfrentar tormentas de arena?',
                  reply: '¡Uff, vi tormentas monstruosas! En Marte, a veces una pequeña tormenta crece tanto que el polvo cubre TODO el planeta durante semanas y tapa el Sol por completo, como si cayera una niebla rojiza gigante. Con mi estación del clima medí vientos de hasta 120 km/h, pero como el aire marciano es tan tenue, ¡el viento apenas empuja como una suave brisa!',
                  audioPenguin: 'audio/cp_viking_opc_2b.mp3',
                  audioReply: 'audio/viking_resp_2b.mp3'
                },
                {
                  id: '2c',
                  label: '⏳ ¿Tu misión duró unos pocos días?',
                  penguinText: '¿Tu misión duró unos pocos días?',
                  reply: '¡Para nada! Los ingenieros de la NASA pensaron que yo duraría solo 90 días... ¡pero fui tan fuerte que trabajé durante más de 6 años enteros! Envié miles de fotos e informes del clima hasta noviembre de 1982. ¡Fui el robot más resistente y madrugador de Marte en el siglo XX!',
                  audioPenguin: 'audio/cp_viking_opc_2c.mp3',
                  audioReply: 'audio/viking_resp_2c.mp3'
                }
              ]
            },
            closing: {
              speaker: 'machine',
              text: 'Gracias a mis mediciones, los científicos aprendieron cómo aterrizar rovers con ruedas. ¡Yo me quedé quieto, pero abrí el camino a los vehículos que se mueven!',
              audioUrl: 'audio/viking_despedida.mp3'
            },
            farewellPenguin: {
              speaker: 'penguin',
              text: '¡Eres todo un héroe del laboratorio espacial, Viking 1! ¡Tercer sello al pasaporte!',
              audioUrl: 'audio/cp_viking_gracias.mp3'
            }
          },
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
          penguinAudioUrl: 'audio/cp_sojourner_opc_1a.mp3',
          dialogueText: '¡Cuidado con mis rueditas, pingüino amigo! ¡Paso a 1 centímetro por segundo! ¡Soy Sojourner, el primer rover de la historia en Marte!',
          audioUrl: 'audio/sojourner_saludo.mp3',
          branchingDialogue: {
            greeting: {
              speaker: 'machine',
              text: '¡Cuidado con mis rueditas, pingüino amigo! ¡Paso a 1 centímetro por segundo! ¡Soy Sojourner, el primer rover de la historia en Marte!',
              audioUrl: 'audio/sojourner_saludo.mp3'
            },
            decision1: {
              choices: [
                {
                  id: '1a',
                  label: '🤖 ¡Aaaay, pero qué tierno eres! ¡Pareces un juguete a control remoto!',
                  penguinText: '¡Aaaay, pero qué tierno eres! ¡Pareces un juguete a control remoto!',
                  reply: '¡Oye, que peso 10.5 kilos y mido solo 65 centímetros, pero llevo un cerebro de titanio! Llegué el 4 de julio de 1997 con la misión Mars Pathfinder. ¡Demostré que los rovers pequeños podían explorar otros mundos con mucha agilidad!',
                  audioPenguin: 'audio/cp_sojourner_opc_1a.mp3',
                  audioReply: 'audio/sojourner_resp_1a.mp3'
                },
                {
                  id: '1b',
                  label: '🎈 ¿Cómo llegaste hasta aquí si no tienes cohetes propios?',
                  penguinText: '¿Cómo llegaste hasta aquí si no tienes cohetes propios?',
                  reply: '¡Mi nave nodriza Pathfinder fue genial! Para aterrizar no usamos patas duras: ¡nos inflamos dentro de un capullo gigante de airbags y rebotamos sobre Marte como una pelota de baloncesto más de 15 veces hasta detenernos! Luego los pétalos se abrieron y bajé por una rampita.',
                  audioPenguin: 'audio/cp_sojourner_opc_1b.mp3',
                  audioReply: 'audio/sojourner_resp_1b.mp3'
                },
                {
                  id: '1c',
                  label: '🛞 ¿Tienes seis ruedas para correr a toda velocidad?',
                  penguinText: '¿Tienes seis ruedas para correr a toda velocidad?',
                  reply: '¡Ja, ja! ¡No soy un bólido de carreras! Mi velocidad máxima es de 1 centímetro por segundo. Pero mis seis ruedas tienen un sistema llamado rocker-bogie: ¡como una patineta todoterreno con patas articuladas de insecto! Cuando una rueda trepa una roca grande, las otras cinco se acomodan solitas en el suelo para no volcarme jamás.',
                  audioPenguin: 'audio/cp_sojourner_opc_1c.mp3',
                  audioReply: 'audio/sojourner_resp_1c.mp3'
                }
              ]
            },
            commonBridge: {
              speaker: 'machine',
              text: 'En mi parte trasera llevo el APXS (Espectrómetro de Rayos X y Partículas Alfa). ¡Es como mi nariz robótica! En lugar de oler, lo pego contra las piedras marcianas y les dispara partículas invisibles e inofensivas. Al escuchar el eco de los átomos, descubrimos si eran rocas volcánicas o arrastradas por antiguos ríos.',
              audioUrl: 'audio/sojourner_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '🎮 ¿Tú manejabas solo o alguien tenía un control remoto en la Tierra?',
                  penguinText: '¿Tú manejabas solo o alguien tenía un control remoto en la Tierra?',
                  reply: '¡Imposible usar un joystick en vivo! Las señales de radio entre la Tierra y Marte tardan entre 10 y 20 minutos en viajar a la velocidad de la luz. Si veo un precipicio y en la Tierra me gritan "¡Frena!", ¡ya me habré caído! Por eso los científicos me mandaban un paquete de rutas en la mañana y yo usaba sensores láser para evitar baches.',
                  audioPenguin: 'audio/cp_sojourner_opc_2a.mp3',
                  audioReply: 'audio/sojourner_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '🐻 ¿Cómo llamaban a las rocas que investigabas?',
                  penguinText: '¿Cómo llamaban a las rocas que investigabas?',
                  reply: '¡Los científicos de la NASA tienen mucho sentido del humor! Para no aburrirse con números, bautizaron a las rocas marcianas con nombres de personajes: ¡analicé una roca con forma de cabeza de oso llamada "Yogi", otra piramidal llamada "Barnacle Bill", otra llamada "Scooby Doo" y una plana llamada "Casper"!',
                  audioPenguin: 'audio/cp_sojourner_opc_2b.mp3',
                  audioReply: 'audio/sojourner_resp_2b.mp3'
                },
                {
                  id: '2c',
                  label: '🚀 ¿Gracias a ti vinieron Curiosity y Perseverance?',
                  penguinText: '¿Gracias a ti vinieron Curiosity y Perseverance?',
                  reply: '¡Exacto! Yo fui el tatarabuelo de la familia. Sin mí, nunca habrían construido a mis hermanos Spirit y Opportunity, ni a los gigantescos laboratorios del tamaño de autos que vinieron después: Curiosity y Perseverance. ¡Todo empezó con mis seis pequeñas huellas!',
                  audioPenguin: 'audio/cp_sojourner_opc_2c.mp3',
                  audioReply: 'audio/sojourner_resp_2c.mp3'
                }
              ]
            },
            closing: {
              speaker: 'machine',
              text: '¡Nunca subestimes a un robot pequeño con grandes sueños espaciales! ¡Choca esas seis ruedas, Cyberpenguin!',
              audioUrl: 'audio/sojourner_despedida.mp3'
            },
            farewellPenguin: {
              speaker: 'penguin',
              text: '¡Chócalas, pequeño titán de Marte! ¡Sello número cuatro en mi pasaporte!',
              audioUrl: 'audio/cp_sojourner_gracias.mp3'
            }
          },
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
      name: 'Espacio profundo',
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
          penguinAudioUrl: 'audio/cp_pioneer_opc_1a.mp3',
          dialogueText: '¡Señal recibida a miles de millones de kilómetros de casa! ¡Hola, explorador Cyberpenguin! ¿Tienes frío aquí afuera?',
          audioUrl: 'audio/pioneer_saludo.mp3',
          branchingDialogue: {
            greeting: {
              speaker: 'machine',
              text: '¡Señal recibida a miles de millones de kilómetros de casa! ¡Hola, explorador Cyberpenguin! ¿Tienes frío aquí afuera?',
              audioUrl: 'audio/pioneer_saludo.mp3'
            },
            decision1: {
              choices: [
                {
                  id: '1a',
                  label: '🪐 ¡Hola Pioneer 10! ¿Qué haces flotando tan lejos del Sol?',
                  penguinText: '¡Hola Pioneer 10! ¿Qué haces flotando tan lejos del Sol?',
                  reply: '¡Despegué en marzo de 1972 con una misión que nadie había logrado: ser la primera máquina de la humanidad en llegar a Júpiter, el planeta más colosal del sistema solar! Estudié su Gran Mancha Roja, su intensa radiación y sus lunas en diciembre de 1973.',
                  audioPenguin: 'audio/cp_pioneer_opc_1a.mp3',
                  audioReply: 'audio/pioneer_resp_1a.mp3'
                },
                {
                  id: '1b',
                  label: '☂️ ¡Menudo paraguas gigante que tienes ahí puesto!',
                  penguinText: '¡Menudo paraguas gigante que tienes ahí puesto!',
                  reply: '¡Ja, ja! ¡No es un paraguas para la lluvia! Es mi antena de alta ganancia de casi 3 metros de diámetro. Como viajé tan lejos de la Tierra, necesitaba una antena parabólica gigante y muy enfocada para que mis débiles señales de radio pudieran ser escuchadas por las estaciones en la Tierra.',
                  audioPenguin: 'audio/cp_pioneer_opc_1b.mp3',
                  audioReply: 'audio/pioneer_resp_1b.mp3'
                },
                {
                  id: '1c',
                  label: '☄️ ¿No te dio miedo atravesar el temido cinturón de asteroides?',
                  penguinText: '¿No te dio miedo atravesar el temido cinturón de asteroides?',
                  reply: '¡En las películas muestran el cinturón de asteroides como un campo minado donde chocas a cada segundo! Pero cuando lo crucé en 1972 demostré la verdad: ¡el espacio es colosalmente gigantesco! Entre un asteroide y el siguiente hay tanta distancia como viajar de un país a otro en la Tierra. Cruzarlo fue tan tranquilo como navegar en un océano despejado.',
                  audioPenguin: 'audio/cp_pioneer_opc_1c.mp3',
                  audioReply: 'audio/pioneer_resp_1c.mp3'
                }
              ]
            },
            commonBridge: {
              speaker: 'machine',
              text: 'Llegué tan lejos que la luz del Sol apenas se ve como un puntito brillante. Por eso no usé paneles solares, sino baterías nucleares RTG: cápsulas térmicas que me daban calor y electricidad continua. Mi última señal llegó a la Tierra el 23 de enero de 2003, cuando estaba a más de 12.000 millones de kilómetros. ¡Tardó más de 11 horas en llegar a la velocidad de la luz!',
              audioUrl: 'audio/pioneer_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '📜 He visto que llevas una placa metálica dorada grabada... ¿qué significa?',
                  penguinText: 'He visto que llevas una placa metálica dorada grabada... ¿qué significa?',
                  reply: '¡Es mi mayor tesoro! Una placa de oro diseñada por Carl Sagan y su esposa Linda. Muestra a un hombre y una mujer saludando en son de paz, el mapa del sistema solar y púlsares: faros de luz cósmicos que parpadean con el tic-tac de un reloj. Cualquier civilización inteligente podrá medir esos parpadeos y saber exactamente dónde está la Tierra.',
                  audioPenguin: 'audio/cp_pioneer_opc_2a.mp3',
                  audioReply: 'audio/pioneer_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '✨ ¿Hacia dónde vas ahora que tus baterías se apagaron?',
                  penguinText: '¿Hacia dónde vas ahora que tus baterías se apagaron?',
                  reply: 'Como en el vacío del espacio no hay aire ni gravedad fuerte que me frene, ¡seguiré flotando para siempre! Ahora viajo en silencio hacia la estrella gigante roja Aldebarán. Tardaré unos dos millones de años en llegar a su vecindario. ¡Soy una auténtica carta en una botella lanzada al océano de las estrellas!',
                  audioPenguin: 'audio/cp_pioneer_opc_2b.mp3',
                  audioReply: 'audio/pioneer_resp_2b.mp3'
                },
                {
                  id: '2c',
                  label: '🌀 ¿Qué se siente pasar al lado de Júpiter?',
                  penguinText: '¿Qué se siente pasar al lado de Júpiter?',
                  reply: '¡Sentí una fuerza colosal! Júpiter es tan inmenso que su gravedad atrae todo como un imán gigante. Usé su gravedad para hacer una maniobra de honda espacial: ¡como cuando vas en patines, te agarras de un poste y sales disparado con más velocidad hacia adelante! Así tomé impulso para volar hacia el espacio profundo.',
                  audioPenguin: 'audio/cp_pioneer_opc_2c.mp3',
                  audioReply: 'audio/pioneer_resp_2c.mp3'
                }
              ]
            },
            closing: {
              speaker: 'machine',
              text: 'Aunque mis radios duerman, sigo llevando el saludo de los niños y niñas de la Tierra a las estrellas. ¡No dejes de soñar en grande, Cyberpenguin!',
              audioUrl: 'audio/pioneer_despedida.mp3'
            },
            farewellPenguin: {
              speaker: 'penguin',
              text: '¡Qué orgullo conocerte, embajadora de las estrellas! ¡Quinto sello colocado!',
              audioUrl: 'audio/cp_pioneer_gracias.mp3'
            }
          },
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
          penguinAudioUrl: 'audio/cp_near_opc_1a.mp3',
          dialogueText: '¡Cuidado al caminar, Cyberpenguin! ¡La gravedad aquí en el asteroide Eros es tan débil que si estornudas con fuerza podrías salir volando al espacio!',
          audioUrl: 'audio/near_saludo.mp3',
          branchingDialogue: {
            greeting: {
              speaker: 'machine',
              text: '¡Cuidado al caminar, Cyberpenguin! ¡La gravedad aquí en el asteroide Eros es tan débil que si estornudas con fuerza podrías salir volando al espacio!',
              audioUrl: 'audio/near_saludo.mp3'
            },
            decision1: {
              choices: [
                {
                  id: '1a',
                  label: '🥔 ¡Hola NEAR Shoemaker! ¿Por qué este lugar tiene forma de papa gigante?',
                  penguinText: '¡Hola NEAR Shoemaker! ¿Por qué este lugar tiene forma de papa gigante?',
                  reply: '¡Ja, ja! ¡Eros mide 34 kilómetros de largo y parece una papa o un cacahuate gigante! ¿Sabes por qué los planetas grandes como la Tierra son redondos? Porque tienen tanta masa y gravedad que aprietan todo hacia el centro como si hicieras una bolita de plastilina. ¡Pero Eros es tan chiquito y ligero que su gravedad no tuvo fuerza para redondearlo, y se quedó como una roca chueca y alargada!',
                  audioPenguin: 'audio/cp_near_opc_1a.mp3',
                  audioReply: 'audio/near_resp_1a.mp3'
                },
                {
                  id: '1b',
                  label: '🛰️ ¿Tú eres una nave o un módulo de aterrizaje? ¡No te veo patas!',
                  penguinText: '¿Tú eres una nave o un módulo de aterrizaje? ¡No te veo patas!',
                  reply: '¡Ese es el misterio más asombroso de mi historia! ¡Yo NUNCA fui diseñada para aterrizar! No tenía patas, ni amortiguadores, ni colchones. Fui construida únicamente para ser un satélite orbitador y tomar fotos desde el aire.',
                  audioPenguin: 'audio/cp_near_opc_1b.mp3',
                  audioReply: 'audio/near_resp_1b.mp3'
                },
                {
                  id: '1c',
                  label: '🚀 ¿Cómo llegaste hasta un asteroide tan chiquito en medio de la nada?',
                  penguinText: '¿Cómo llegaste hasta un asteroide tan chiquito en medio de la nada?',
                  reply: 'Despegué en 1996. Primero sobrevolé el asteroide Mathilde para tomarle fotos en 1997, y el 14 de febrero del año 2000 (¡el Día de San Valentín!) me convertí en la primera nave de la humanidad en ponerse en órbita alrededor de un asteroide.',
                  audioPenguin: 'audio/cp_near_opc_1c.mp3',
                  audioReply: 'audio/near_resp_1c.mp3'
                }
              ]
            },
            commonBridge: {
              speaker: 'machine',
              text: 'Llevaba 6 instrumentos científicos de élite: cámaras fotográficas, sensores para olfatear minerales y un telémetro láser. ¿Cómo funcionaba el láser? Disparaba rayos de luz hacia la roca y medía cuánto tardaban en rebotar. ¡Así dibujamos un mapa en 3D de todas las montañas y cráteres de Eros igual que en un videojuego!',
              audioUrl: 'audio/near_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '🤸 Pero si no tenías patas... ¿cómo terminaste aquí sentada en el suelo?',
                  penguinText: 'Pero si no tenías patas... ¿cómo terminaste aquí sentada en el suelo?',
                  reply: 'El 12 de febrero de 2001, los científicos de la NASA tuvieron una idea audaz: "¿Y si intentamos posarla en el suelo con sus pequeños chorros de gas?". Fuimos frenando hasta tocar la superficie a menos de 6 kilómetros por hora: ¡eso es más lento de lo que corres tú en el recreo! Toqué el suelo apoyándome en las puntitas de mis paneles solares como un bailarín cósmico.',
                  audioPenguin: 'audio/cp_near_opc_2a.mp3',
                  audioReply: 'audio/near_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '🏷️ ¿Y qué pasó con tu nombre? ¿Por qué te llamas Shoemaker?',
                  penguinText: '¿Y qué pasó con tu nombre? ¿Por qué te llamas Shoemaker?',
                  reply: 'Originalmente me llamaba solo NEAR (Encuentro con Asteroides Cercanos a la Tierra). Pero la NASA me rebautizó en honor a Eugene Shoemaker, un legendario científico que descubrió que la Luna y los planetas tienen cráteres porque los asteroides y cometas chocaron contra ellos a lo largo de millones de años.',
                  audioPenguin: 'audio/cp_near_opc_2b.mp3',
                  audioReply: 'audio/near_resp_2b.mp3'
                },
                {
                  id: '2c',
                  label: '💥 ¿Te destruiste al chocar contra la roca?',
                  penguinText: '¿Te destruiste al chocar contra la roca?',
                  reply: '¡Para sorpresa de todos los ingenieros en la Tierra, sobreviví enterita! Mis paneles solares y antenas quedaron intactos y seguí enviando datos científicos directos del suelo de Eros durante dos semanas completas hasta el 28 de febrero de 2001. ¡Fue el broche de oro más épico que una nave pudo desear!',
                  audioPenguin: 'audio/cp_near_opc_2c.mp3',
                  audioReply: 'audio/near_resp_2c.mp3'
                }
              ]
            },
            closing: {
              speaker: 'machine',
              text: '¡Demostramos que con ingenio y valentía se pueden lograr cosas que parecían imposibles! ¡Hasta la próxima, pequeño explorador!',
              audioUrl: 'audio/near_despedida.mp3'
            },
            farewellPenguin: {
              speaker: 'penguin',
              text: '¡Eres increíble, NEAR Shoemaker! ¡Mi pasaporte tiene ahora las seis insignias de patita completas!',
              audioUrl: 'audio/cp_near_gracias.mp3'
            }
          },
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
      chapterName: 'Espacio profundo',
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

  // Pensamientos flotantes de Cyberpenguin al explorar y saltar en gravedad especial
  const AMBIENT_THOUGHTS = {
    moon: [
      '¡Wiiiiii! ¡La gravedad aquí es solo 1/6 de la Tierra! ¡Puedo dar brincos gigantes sin despeinarme!',
      'El suelo está cubierto de regolito: polvo gris finísimo como talco, pero afilado como diminutos trozos de cristal.',
      '¡El cielo es completamente negro aunque sea de día! Y allá a lo lejos se ve la Tierra como una canica azul brillante.'
    ],
    mars: [
      '¡Qué raro! En la Tierra el cielo es azul, pero aquí en Marte tiene un color salmón anaranjado por el polvo en suspensión.',
      '¡Brrrr! ¡Incluso para un pingüino polar, Marte es heladísimo! Puede llegar a -80°C bajo cero por la noche.',
      '¡Todo aquí es rojo oxidado! Es como si a un planeta entero le hubiera caído polvo de ladrillo o cocoa vieja.'
    ],
    'deep-space': [
      '¡Aquí no hay arriba ni abajo! Si muevo las aletas floto como en el océano más pacífico del cosmos... ¡pero sin agua!',
      'Desde aquí las estrellas no parpadean nada. ¡En el vacío espacial brillan como diamantes firmes y eternos!',
      '¡Millones de rocas espaciales orbitando al Sol! Restos de cuando nació el sistema solar hace 4.600 millones de años.'
    ]
  };

  // Diálogo final ramificado desde la cabina de la nave de Cyberpenguin
  const FINAL_BRANCHING_DIALOGUE = {
    penguinIntro: {
      speaker: 'penguin',
      text: '¡Lo logramos, explorador espacial! ¡Mira nuestro pasaporte! Hemos viajado desde el polvo gris de la Luna, pisamos el óxido rojizo de Marte y flotamos junto a sondas legendarias en el espacio profundo.',
      audioUrl: 'audio/cp_final_mirada.mp3'
    },
    decision: {
      choices: [
        {
          id: 'final_a',
          label: '🔬 ¡Cada máquina tiene un diseño único para su propia misión!',
          penguinText: '¡Aprendí que cada máquina tiene un diseño único para su propia misión!',
          reply: '¡Exactamente! Unas naves usan cámaras, otras hornitos químicos, otras ruedas con suspensión especial y otras viajan hacia otras estrellas. ¡La ciencia no tiene una sola forma, sino miles de ideas brillantes trabajando en equipo!',
          audioPenguin: 'audio/cp_final_opc_a.mp3',
          audioReply: 'audio/cp_final_resp_a.mp3'
        },
        {
          id: 'final_b',
          label: '🚀 ¡Lo emocionante fue ver cómo vencieron peligros increíbles!',
          penguinText: '¡Lo más emocionante fue ver cómo sobrevivieron a peligros increíbles!',
          reply: '¡Totalmente de acuerdo! Como cuando Eagle esquivó el cráter con 40 segundos de combustible, o cuando NEAR aterrizó suavemente sin tener patas. ¡Los grandes descubrimientos necesitan audacia y nunca rendirse ante los problemas!',
          audioPenguin: 'audio/cp_final_opc_b.mp3',
          audioReply: 'audio/cp_final_resp_b.mp3'
        },
        {
          id: 'final_c',
          label: '✨ ¡Quiero saber hacia dónde viajará la humanidad ahora!',
          penguinText: '¡Quiero saber hacia dónde viajará la humanidad ahora!',
          reply: '¡El futuro está en nuestras manos! La NASA y las agencias espaciales preparan la misión Artemis para volver a la Luna con astronautas, bases habitadas y viajes a Marte. ¡Tal vez uno de ustedes sea la primera persona en pisar el planeta rojo!',
          audioPenguin: 'audio/cp_final_opc_c.mp3',
          audioReply: 'audio/cp_final_resp_c.mp3'
        }
      ]
    },
    closing: {
      speaker: 'penguin',
      text: 'Recuerda siempre este gran secreto cósmico: ¡La curiosidad es el combustible más potente de todo gran explorador! Mientras haya preguntas por responder, estrellas en el cielo y mentes curiosas como la tuya, la aventura nunca terminará. ¡Nos vemos en la próxima galaxia! ¡Motores encendidos en tres... dos... uno... DESPEGUEEEE! 🚀✨🐧',
      audioUrl: 'audio/cp_final_despegue.mp3'
    }
  };

  // Diálogo final abierto al completar las 3 misiones (respaldo lineal)
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

const CHAPTERS_EN = [
  {
    "id": "moon",
    "name": "The Moon",
    "hasSurface": true,
    "shipPos": {
      "x": 20,
      "y": 66
    },
    "spawnPos": {
      "x": 30,
      "y": 72
    },
    "sample": {
      "id": "sample-moon-1",
      "siteId": "oceanus-procellarum",
      "variant": 0,
      "label": "Oceanus Procellarum Basalt",
      "pos": {
        "x": 42,
        "y": 80
      }
    },
    "samples": [
      {
        "id": "sample-moon-1",
        "siteId": "oceanus-procellarum",
        "variant": 0,
        "label": "Oceanus Procellarum Basalt",
        "pos": {
          "x": 42,
          "y": 80
        }
      },
      {
        "id": "sample-moon-2",
        "siteId": "oceanus-procellarum",
        "variant": 1,
        "label": "Lunar Impact Breccia",
        "pos": {
          "x": 52,
          "y": 69
        }
      },
      {
        "id": "sample-moon-3",
        "siteId": "oceanus-procellarum",
        "variant": 2,
        "label": "Crystalline Procellarum Regolith",
        "pos": {
          "x": 79,
          "y": 76
        }
      },
      {
        "id": "sample-moon-4",
        "siteId": "mare-tranquillitatis",
        "variant": 1,
        "label": "Sea of Tranquility Ilmenite",
        "pos": {
          "x": 41,
          "y": 79
        }
      },
      {
        "id": "sample-moon-5",
        "siteId": "mare-tranquillitatis",
        "variant": 2,
        "label": "Ancient Lunar Anorthosite",
        "pos": {
          "x": 53,
          "y": 68
        }
      },
      {
        "id": "sample-moon-6",
        "siteId": "mare-tranquillitatis",
        "variant": 0,
        "label": "Tranquillitatis Glass Spherule",
        "pos": {
          "x": 78,
          "y": 75
        }
      }
    ],
    "machines": [
      {
        "id": "surveyor-3",
        "modelKey": "surveyor3",
        "name": "Surveyor 3",
        "siteId": "oceanus-procellarum",
        "locationShort": "Ocean of Storms",
        "locationDetail": "Surveyor 3: Ocean of Storms (Surveyor Crater)",
        "nasaUrl": "https://science.nasa.gov/mission/surveyor-3/",
        "pos": {
          "x": 64,
          "y": 60
        },
        "shipPos": {
          "x": 20,
          "y": 66
        },
        "spawnPos": {
          "x": 30,
          "y": 72
        },
        "penguinText": "Hello! I'm Cyberpenguin. Who are you, and what are you doing on the Moon?",
        "penguinAudioUrl": "audio/en/cp_surveyor_opc_a.mp3",
        "dialogueText": "Beep, beep! Sensor alert! Feathered visitor detected on my footpads! Hello, little space traveler!",
        "audioUrl": "audio/en/surveyor_saludo.mp3",
        "branchingDialogue": {
          "greeting": {
            "speaker": "machine",
            "text": "Beep, beep! Sensor alert! Feathered visitor detected on my footpads! Hello, little space traveler! Did you journey all the way from Earth?",
            "audioUrl": "audio/en/surveyor_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🔍 Hello! I'm Cyberpenguin. Who are you, and what are you doing standing here?",
                "penguinText": "Hello! I'm Cyberpenguin. Who are you, and what are you doing standing here?",
                "reply": "Pleasure to meet you, Cyberpenguin! I am Surveyor 3, an uncrewed robotic spacecraft launched by NASA in April 1967. I was sent to this crater to investigate lunar soil and pave the way for future Apollo astronauts!",
                "audioPenguin": "audio/en/cp_surveyor_opc_a.mp3",
                "audioReply": "audio/en/surveyor_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "⛏️ Whoa, a three-legged robot! And why do you have that arm with a little shovel?",
                "penguinText": "Whoa, a three-legged robot! And why do you have that arm with a little shovel?",
                "reply": "You've got sharp eyes! I am the first spacecraft in human history to operate a robotic scoop on the Moon. Using an electric motor, I stretched my arm and dug into the soil just like in a giant sandbox to measure how firm the ground was!",
                "audioPenguin": "audio/en/cp_surveyor_opc_b.mp3",
                "audioReply": "audio/en/surveyor_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "🏀 Is it true that you bounced across the surface like a basketball when you landed?",
                "penguinText": "Is it true that you bounced across the surface like a basketball when you landed?",
                "reply": "Ha ha ha! Absolutely true! When I touched down on April 20, 1967, shiny lunar rocks confused my landing radar, and my descent engines didn't shut down in time. I bounced twice like on a lunar trampoline before coming to a safe stop!",
                "audioPenguin": "audio/en/cp_surveyor_opc_c.mp3",
                "audioReply": "audio/en/surveyor_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "Before astronauts could walk on the Moon, scientists worried their heavy boots would sink deep into dust like quicksand. With my robotic scoop, I dug four trenches and pressed down on the lunar soil to prove it was solid, stable, and completely safe to walk on!",
            "audioUrl": "audio/en/surveyor_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "📸 How many pictures did you snap with your television camera?",
                "penguinText": "How many pictures did you snap with your television camera?",
                "reply": "I beamed back over 6,300 black-and-white television photos! I photographed rocks, lunar trenches, and even captured a historic photo of a solar eclipse where Earth blocked the Sun as seen from the Moon!",
                "audioPenguin": "audio/en/cp_surveyor_opc_2a.mp3",
                "audioReply": "audio/en/surveyor_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ Is it true that human astronauts later came back to visit you in person?",
                "penguinText": "Is it true that human astronauts later came back to visit you in person?",
                "reply": "Beep beep! Yes! In November 1969, Apollo 12 astronauts Pete Conrad and Alan Bean landed their lunar module Intrepid just 160 meters away and walked right over to me! They examined my parts and took my TV camera back to Earth to study how metal survives two years in space!",
                "audioPenguin": "audio/en/cp_surveyor_opc_2b.mp3",
                "audioReply": "audio/en/surveyor_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "🔬 What did scientists learn when they took your parts back to Earth laboratories?",
                "penguinText": "What did scientists learn when they took your parts back to Earth laboratories?",
                "reply": "It was the only time in space history that machinery left on another world was retrieved and studied in a laboratory! Scientists discovered how solar radiation, cosmic dust, and space vacuum degrade cables and paint, helping design safer spacesuits and spacecraft!",
                "audioPenguin": "audio/en/cp_surveyor_opc_2c.mp3",
                "audioReply": "audio/en/surveyor_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "I transmitted valuable data until May 1967, but my greatest honor was helping humans walk on the Moon with confidence. Keep exploring bravely, Cyberpenguin!",
            "audioUrl": "audio/en/surveyor_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "Thank you, brave Surveyor 3! You just earned the very first lunar stamp in my explorer passport!",
            "audioUrl": "audio/en/cp_surveyor_gracias.mp3"
          }
        },
        "dialogue": [
          {
            "speaker": "penguin",
            "text": "Hello! I'm Cyberpenguin. Who are you, and what are you doing on the Moon?"
          },
          {
            "speaker": "machine",
            "text": "Beep beep! I am Surveyor 3. NASA sent me in 1967 to test lunar soil with my robotic shovel and pave the way for the Apollo program.",
            "nextPrompt": "What did you use your robotic scoop for? →"
          },
          {
            "speaker": "penguin",
            "text": "What did you use your robotic scoop for?"
          },
          {
            "speaker": "machine",
            "text": "I dug trenches to test soil firmness and took thousands of photos. I proved the Moon was solid and safe to walk on!",
            "nextPrompt": "Is it true astronauts visited you? →"
          },
          {
            "speaker": "penguin",
            "text": "Is it true astronauts visited you?"
          },
          {
            "speaker": "machine",
            "text": "Yes! In 1969, Apollo 12 astronauts walked right over to me and took my camera back to Earth to study how it survived in space.",
            "nextPrompt": "Thank you, Surveyor 3! ✓"
          }
        ]
      },
      {
        "id": "apollo-11-eagle",
        "modelKey": "apolloEagle",
        "name": "Apollo 11 Lunar Module Eagle",
        "siteId": "mare-tranquillitatis",
        "locationShort": "Sea of Tranquility",
        "locationDetail": "Apollo 11 Eagle: Southern edge of the Sea of Tranquility",
        "nasaUrl": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C",
        "pos": {
          "x": 66,
          "y": 61
        },
        "shipPos": {
          "x": 20,
          "y": 66
        },
        "spawnPos": {
          "x": 30,
          "y": 72
        },
        "penguinText": "What a magnificent spacecraft! Who are you?",
        "penguinAudioUrl": "audio/en/cp_eagle_opc_1a.mp3",
        "dialogueText": "Greetings, Cyberpenguin! Welcome to Tranquility Base! You are standing on the most historic site on the entire Moon.",
        "audioUrl": "audio/en/eagle_saludo.mp3",
        "branchingDialogue": {
          "greeting": {
            "speaker": "machine",
            "text": "Greetings, Cyberpenguin! Welcome to Tranquility Base! You are standing on the most historic patch of ground on the entire Moon.",
            "audioUrl": "audio/en/eagle_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🏛️ No way! Are you the legendary Eagle from Apollo 11?",
                "penguinText": "No way! Are you the legendary Eagle from Apollo 11?",
                "reply": "The one and only! On July 20, 1969, I brought Neil Armstrong and Buzz Aldrin safely down to this ground. We were launched from Earth atop the mighty Saturn V rocket—a skyscraper of a rocket taller than the Statue of Liberty!",
                "audioPenguin": "audio/en/cp_eagle_opc_1a.mp3",
                "audioReply": "audio/en/eagle_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "🍫 Whoa, you look wrapped in shiny golden chocolate foil! Why are you so shiny?",
                "penguinText": "Whoa, you look wrapped in shiny golden chocolate foil! Why are you so shiny?",
                "reply": "Ha ha! Many kids ask that! Those are ultra-thin aerospace thermal blankets made of Kapton and Mylar. Under direct sunlight on the Moon, metal heats up to 120°C, and in shadow it plunges to minus 150°C! The gold blankets reflected extreme radiation to protect our crew.",
                "audioPenguin": "audio/en/cp_eagle_opc_1b.mp3",
                "audioReply": "audio/en/eagle_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "⚠️ Did you really almost run out of fuel right before touching down?",
                "penguinText": "Did you really almost run out of fuel right before touching down?",
                "reply": "Hold onto your feathers! Our computer was steering us straight toward a giant crater full of car-sized boulders! Neil Armstrong took manual control and flew us forward until he found clear, smooth ground. When our footpads touched down, we had less than forty seconds of landing fuel left!",
                "audioPenguin": "audio/en/cp_eagle_opc_1c.mp3",
                "audioReply": "audio/en/eagle_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "Six hours after touchdown, Neil Armstrong descended my nine-rung ladder, placed his left boot on the dust, and spoke those unforgettable words: 'That's one small step for man, one giant leap for mankind.' Buzz Aldrin joined him, and together they explored for over two hours!",
            "audioUrl": "audio/en/eagle_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "📦 What happened to your top half? Where is the cabin where the astronauts rode?",
                "penguinText": "What happened to your top half? Where is the cabin where the astronauts rode?",
                "reply": "I was built in two separate stages! My golden bottom stage is the Descent Stage, serving as a launch pad. The top Ascent Stage ignited its rocket engine, lifted Neil and Buzz off the lunar surface, and docked with Michael Collins aboard Columbia!",
                "audioPenguin": "audio/en/cp_eagle_opc_2a.mp3",
                "audioReply": "audio/en/eagle_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ What famous scientific experiment did Neil and Buzz set up with mirrors?",
                "penguinText": "What famous scientific experiment did Neil and Buzz set up with mirrors?",
                "reply": "They placed the Lunar Laser Ranging Retroreflector! It's a special panel of pristine glass prisms. Even today, scientists on Earth fire laser beams from giant telescopes at the reflector, timing the bounce to measure the Moon's distance down to the millimeter!",
                "audioPenguin": "audio/en/cp_eagle_opc_2b.mp3",
                "audioReply": "audio/en/eagle_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "📜 What does the stainless steel plaque attached to your landing leg say?",
                "penguinText": "What does the stainless steel plaque attached to your landing leg say?",
                "reply": "It reads: 'Here men from the planet Earth first set foot upon the Moon, July 1969 A.D. We came in peace for all mankind.' It carries the signatures of the three astronauts and the President of the United States.",
                "audioPenguin": "audio/en/cp_eagle_opc_2c.mp3",
                "audioReply": "audio/en/eagle_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "Tranquility Base will forever remain a beacon of human achievement. Keep that bold spirit alive, Cyberpenguin!",
            "audioUrl": "audio/en/eagle_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "Thank you, legendary Eagle! Tranquility Base will always inspire every explorer in the universe!",
            "audioUrl": "audio/en/cp_eagle_gracias.mp3"
          }
        },
        "dialogue": [
          {
            "speaker": "penguin",
            "text": "What an extraordinary spacecraft! Who are you?"
          },
          {
            "speaker": "machine",
            "text": "Hello, explorer! I am Eagle, the Lunar Module of the Apollo 11 mission. On July 20, 1969, I made history by landing Neil Armstrong and Buzz Aldrin on the Moon.",
            "nextPrompt": "How could you land and then lift off? →"
          },
          {
            "speaker": "penguin",
            "text": "How could you land and then lift off?"
          },
          {
            "speaker": "machine",
            "text": "I had two parts: my golden descent stage stayed here as a launchpad, while the ascent stage fired its engine to carry the astronauts back to Columbia.",
            "nextPrompt": "What did the astronauts leave on the surface? →"
          },
          {
            "speaker": "penguin",
            "text": "What did the astronauts leave on the surface?"
          },
          {
            "speaker": "machine",
            "text": "They collected lunar samples and left science instruments, an American flag, and a plaque that reads: We came in peace for all mankind.",
            "nextPrompt": "Thank you, Eagle! ✓"
          }
        ]
      }
    ]
  },
  {
    "id": "mars",
    "name": "Mars",
    "hasSurface": true,
    "shipPos": {
      "x": 20,
      "y": 66
    },
    "spawnPos": {
      "x": 30,
      "y": 72
    },
    "sample": {
      "id": "sample-mars-1",
      "siteId": "chryse-planitia",
      "variant": 0,
      "label": "Chryse Planitia Hematite",
      "pos": {
        "x": 42,
        "y": 80
      }
    },
    "samples": [
      {
        "id": "sample-mars-1",
        "siteId": "chryse-planitia",
        "variant": 0,
        "label": "Chryse Planitia Hematite",
        "pos": {
          "x": 42,
          "y": 80
        }
      },
      {
        "id": "sample-mars-2",
        "siteId": "chryse-planitia",
        "variant": 1,
        "label": "Martian Volcanic Basalt",
        "pos": {
          "x": 52,
          "y": 69
        }
      },
      {
        "id": "sample-mars-3",
        "siteId": "chryse-planitia",
        "variant": 2,
        "label": "Hydrated Iron Sulfate",
        "pos": {
          "x": 79,
          "y": 76
        }
      },
      {
        "id": "sample-mars-4",
        "siteId": "ares-vallis",
        "variant": 1,
        "label": "Magnetite of Ares Vallis",
        "pos": {
          "x": 41,
          "y": 80
        }
      },
      {
        "id": "sample-mars-5",
        "siteId": "ares-vallis",
        "variant": 2,
        "label": "Vesicular Martian Andesite",
        "pos": {
          "x": 53,
          "y": 69
        }
      },
      {
        "id": "sample-mars-6",
        "siteId": "ares-vallis",
        "variant": 0,
        "label": "Martian Clay Smectite",
        "pos": {
          "x": 78,
          "y": 75
        }
      }
    ],
    "machines": [
      {
        "id": "viking-1",
        "modelKey": "viking1",
        "name": "Viking 1 Lander",
        "siteId": "chryse-planitia",
        "locationShort": "Chryse Planitia",
        "locationDetail": "Viking 1 Lander: Chryse Planitia (Plains of Gold)",
        "nasaUrl": "https://science.nasa.gov/mission/viking-1/",
        "pos": {
          "x": 62,
          "y": 59
        },
        "shipPos": {
          "x": 20,
          "y": 66
        },
        "spawnPos": {
          "x": 30,
          "y": 72
        },
        "penguinText": "Hello! I finally reached Mars! Who are you?",
        "penguinAudioUrl": "audio/en/cp_viking_opc_1a.mp3",
        "dialogueText": "Greetings, young explorer! Welcome to Chryse Planitia—the Plains of Gold! Systems nominal, robotic arm ready.",
        "audioUrl": "audio/en/viking_saludo.mp3",
        "branchingDialogue": {
          "greeting": {
            "speaker": "machine",
            "text": "Greetings, young explorer! Welcome to Chryse Planitia—the Plains of Gold! Systems nominal, robotic arm ready. Are you ready to study the secrets of Mars?",
            "audioUrl": "audio/en/viking_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🔴 Hello, Viking 1! What made your arrival on Mars so famous?",
                "penguinText": "Hello, Viking 1! What made your arrival on Mars so famous?",
                "reply": "On July 20, 1976, I became the very first American spacecraft to achieve a successful soft landing on the surface of Mars! I safely deployed my three landing footpads and operated on the Red Planet for over six years!",
                "audioPenguin": "audio/en/cp_viking_opc_1a.mp3",
                "audioReply": "audio/en/viking_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "📸 Did you really take the first color photograph of Mars in human history?",
                "penguinText": "Did you really take the first color photograph of Mars in human history?",
                "reply": "Affirmative! Just minutes after touchdown, my facsimile scanner camera took the first close-up photograph of Martian soil and rocks. Then, I beamed back the first panoramic color photograph showing reddish-brown rocks and a salmon-pink sky!",
                "audioPenguin": "audio/en/cp_viking_opc_1b.mp3",
                "audioReply": "audio/en/viking_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "💨 How did you survive entering the thin Martian atmosphere without crashing?",
                "penguinText": "How did you survive entering the thin Martian atmosphere without crashing?",
                "reply": "Entering at over sixteen thousand kilometers per hour is intense! First, my aeroshell heat shield absorbed extreme heat. Next, a giant parachute deployed at supersonic speed, and finally, three specialized rocket engines fired to gently set me down!",
                "audioPenguin": "audio/en/cp_viking_opc_1c.mp3",
                "audioReply": "audio/en/viking_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "I was not just a camera—I was a complete automated biology and chemistry laboratory! Inside my chassis, I carried miniature ovens and radiation detectors to analyze Martian soil for signs of microbial life and organic molecules.",
            "audioUrl": "audio/en/viking_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "🧪 Did you find living Martian microbes in the soil with your mini laboratory?",
                "penguinText": "Did you find living Martian microbes in the soil with your mini laboratory?",
                "reply": "The soil tests gave puzzling chemical reactions! While active chemistry occurred when nutrients were added, scientists concluded the reactions were caused by super-reactive minerals called perchlorates, not living microbes. But it showed us Mars has active, complex chemistry!",
                "audioPenguin": "audio/en/cp_viking_opc_2a.mp3",
                "audioReply": "audio/en/viking_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ Is it true that you also had a sister spaceship orbiting high above the planet?",
                "penguinText": "Is it true that you also had a sister spaceship orbiting high above the planet?",
                "reply": "Yes! The Viking 1 mission consisted of two parts: the Orbiter and the Lander. While I studied rocks on the surface, the Orbiter circled Mars, photographing ancient river valleys, massive volcanoes like Olympus Mons, and mapping ninety-seven percent of the planet!",
                "audioPenguin": "audio/en/cp_viking_opc_2b.mp3",
                "audioReply": "audio/en/viking_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "🌪️ Did you measure Martian weather and dust storms with your instruments?",
                "penguinText": "Did you measure Martian weather and dust storms with your instruments?",
                "reply": "Indeed! My meteorology mast measured winds, atmospheric pressure, and temperatures every day. I recorded global dust storms that engulfed the entire planet, turning day into night with glowing reddish clouds!",
                "audioPenguin": "audio/en/cp_viking_opc_2c.mp3",
                "audioReply": "audio/en/viking_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "I gathered scientific data until November 1982, setting an endurance record for my era. Mars still holds countless mysteries waiting for explorers like you!",
            "audioUrl": "audio/en/viking_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "Thank you, brilliant Viking 1! You paved the trail for every rover that rolls across Mars today!",
            "audioUrl": "audio/en/cp_viking_gracias.mp3"
          }
        },
        "dialogue": [
          {
            "speaker": "penguin",
            "text": "Hello! I finally arrived on Mars! Who are you?"
          },
          {
            "speaker": "machine",
            "text": "Welcome! I am Viking 1, a NASA mission that reached Mars in 1976. I was the first American lander to successfully touch down on the Martian surface.",
            "nextPrompt": "How did you study Mars from above and below? →"
          },
          {
            "speaker": "penguin",
            "text": "How did you study Mars from above and below?"
          },
          {
            "speaker": "machine",
            "text": "My mission had two parts: an orbiter taking photos from above, and my lander analyzing rocks, weather, and soil chemistry down on the surface.",
            "nextPrompt": "Did you find any Martians in the soil?! →"
          },
          {
            "speaker": "penguin",
            "text": "Did you find any Martians in the soil?!"
          },
          {
            "speaker": "machine",
            "text": "Ha ha! With my robotic arm I scooped soil into mini-ovens to look for microbes. We found active minerals, but no living organisms.",
            "nextPrompt": "Thank you, Viking 1! ✓"
          }
        ]
      },
      {
        "id": "sojourner",
        "modelKey": "sojourner",
        "name": "Sojourner Rover",
        "siteId": "ares-vallis",
        "locationShort": "Ares Vallis",
        "locationDetail": "Sojourner Rover: Ares Vallis (ancient Martian outflow channel)",
        "nasaUrl": "https://science.nasa.gov/mission/mars-pathfinder/",
        "pos": {
          "x": 67,
          "y": 63
        },
        "shipPos": {
          "x": 20,
          "y": 66
        },
        "spawnPos": {
          "x": 30,
          "y": 72
        },
        "penguinText": "You are so small! Are you an explorer robot?",
        "penguinAudioUrl": "audio/en/cp_sojourner_opc_1a.mp3",
        "dialogueText": "Vroooom! Squeak-squeak! Look down here! Greetings, Cyberpenguin! I'm Sojourner, the first wheeled rover on Mars!",
        "audioUrl": "audio/en/sojourner_saludo.mp3",
        "branchingDialogue": {
          "greeting": {
            "speaker": "machine",
            "text": "Vroooom! Squeak-squeak! Look down here! Greetings, Cyberpenguin! I'm Sojourner, the very first wheeled robotic explorer to roll across the surface of Mars!",
            "audioUrl": "audio/en/sojourner_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🏎️ Wow! You're so cute and tiny! How big are you compared to me?",
                "penguinText": "Wow! You're so cute and tiny! How big are you compared to me?",
                "reply": "I'm about the size of a microwave oven or a small toy wagon! I weigh only eleven kilograms on Earth, which is about four kilograms in Martian gravity. But don't let my size fool you—I proved rovers can explore other worlds!",
                "audioPenguin": "audio/en/cp_sojourner_opc_1a.mp3",
                "audioReply": "audio/en/sojourner_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "🛞 Why do you have six funny metal wheels with spikes on them?",
                "penguinText": "Why do you have six funny metal wheels with spikes on them?",
                "reply": "That's my rocker-bogie suspension system! It lets all six wheels stay firmly on the ground even when climbing over rocks bigger than my wheels. Each wheel has its own motor and little cleats for traction in slippery Martian dust!",
                "audioPenguin": "audio/en/cp_sojourner_opc_1b.mp3",
                "audioReply": "audio/en/sojourner_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "🎈 Did you really bounce onto Mars inside a giant cluster of airbags?",
                "penguinText": "Did you really bounce onto Mars inside a giant cluster of airbags?",
                "reply": "Yes! On July 4, 1997, Mars Pathfinder entered the atmosphere and inflated twenty-four giant gas airbags. We bounced over fifteen times across Ares Vallis like an enormous cosmic beach ball before coming to a safe rest!",
                "audioPenguin": "audio/en/cp_sojourner_opc_1c.mp3",
                "audioReply": "audio/en/sojourner_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "Scientists back on Earth couldn't drive me with a live joystick because radio signals take ten to twenty minutes to travel from Earth to Mars! Instead, they sent a list of waypoints each morning, and my laser eye sensors avoided dangerous rocks autonomously!",
            "audioUrl": "audio/en/sojourner_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "🔬 What was that sensor instrument mounted on your rear tail?",
                "penguinText": "What was that sensor instrument mounted on your rear tail?",
                "reply": "That was my Alpha Proton X-ray Spectrometer—or APXS! I pressed it directly against Martian rocks for hours. It bombarded rocks with alpha particles to detect chemical elements like silicon, iron, and potassium!",
                "audioPenguin": "audio/en/cp_sojourner_opc_2a.mp3",
                "audioReply": "audio/en/sojourner_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ What funny names did the team give to the rocks you explored?",
                "penguinText": "What funny names did the team give to the rocks you explored?",
                "reply": "Scientists named rocks after famous cartoon characters! I investigated Barnacle Bill, Yogi Bear, Scooby-Doo, and Casper! Yogi Bear turned out to be volcanic basalt, proving water once flowed through Ares Vallis!",
                "audioPenguin": "audio/en/cp_sojourner_opc_2b.mp3",
                "audioReply": "audio/en/sojourner_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "☀️ How did you survive the bitterly cold Martian nights?",
                "penguinText": "How did you survive the bitterly cold Martian nights?",
                "reply": "I carried lightweight solar panels on my roof to charge my batteries during sunny days, and three radioisotope heater units inside my warm electronics box kept my computer warm during freezing nights!",
                "audioPenguin": "audio/en/cp_sojourner_opc_2c.mp3",
                "audioReply": "audio/en/sojourner_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "I was only designed to operate for seven days, but I explored for nearly three full months! Keep rolling forward, Cyberpenguin!",
            "audioUrl": "audio/en/sojourner_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "Thank you, speedy Sojourner! You proved that even small explorers can achieve monumental dreams!",
            "audioUrl": "audio/en/cp_sojourner_gracias.mp3"
          }
        },
        "dialogue": [
          {
            "speaker": "penguin",
            "text": "You're so small! Are you an explorer robot?"
          },
          {
            "speaker": "machine",
            "text": "Hello! Watch my wheels! I am Sojourner, the first rover to drive on Mars. I arrived in 1997 inside the Mars Pathfinder lander.",
            "nextPrompt": "How did you study rocks and drive over them? →"
          },
          {
            "speaker": "penguin",
            "text": "How did you study rocks and drive over them?"
          },
          {
            "speaker": "machine",
            "text": "My six wheels with rocker-bogie suspension helped me climb over rocks, and my APXS spectrometer analyzed what the rocks were made of.",
            "nextPrompt": "Did you choose where to go all by yourself? →"
          },
          {
            "speaker": "penguin",
            "text": "Did you choose where to go all by yourself?"
          },
          {
            "speaker": "machine",
            "text": "Scientists on Earth reviewed my photos and sent me instructions each morning to drive carefully. Remember: you don’t need to be big to do something great!",
            "nextPrompt": "Thank you, Sojourner! ✓"
          }
        ]
      }
    ]
  },
  {
    "id": "deep-space",
    "name": "Deep Space",
    "hasSurface": false,
    "shipPos": {
      "x": 22,
      "y": 58
    },
    "spawnPos": {
      "x": 22,
      "y": 58
    },
    "sample": null,
    "samples": [],
    "machines": [
      {
        "id": "pioneer-10",
        "modelKey": "pioneer10",
        "name": "Pioneer 10",
        "siteId": "aldebaran-trajectory",
        "locationShort": "Aldebaran",
        "locationDetail": "Pioneer 10: Cruising inert ~118.8 AU from Earth · En route toward giant red star Aldebaran",
        "nasaUrl": "https://science.nasa.gov/mission/pioneer-10/",
        "pos": {
          "x": 63,
          "y": 56
        },
        "shipPos": {
          "x": 22,
          "y": 58
        },
        "spawnPos": {
          "x": 22,
          "y": 58
        },
        "penguinText": "Hello! What are you doing traveling so far from Earth?",
        "penguinAudioUrl": "audio/en/cp_pioneer_opc_1a.mp3",
        "dialogueText": "Greetings, Cyberpenguin... I hear your voice across the silent cosmic expanse. I am Pioneer 10, humanity's brave emissary.",
        "audioUrl": "audio/en/pioneer_saludo.mp3",
        "branchingDialogue": {
          "greeting": {
            "speaker": "machine",
            "text": "Greetings, Cyberpenguin... I hear your voice across the silent cosmic expanse. I am Pioneer 10, humanity's brave emissary voyaging through deep interstellar space.",
            "audioUrl": "audio/en/pioneer_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🪐 Hello, Pioneer 10! What historic milestones did you achieve on your journey?",
                "penguinText": "Hello, Pioneer 10! What historic milestones did you achieve on your journey?",
                "reply": "Launched in March 1972, I was the very first spacecraft to travel through the Asteroid Belt and the first to visit gigantic Jupiter! In December 1973, I flew past Jupiter's clouds, photographing the Great Red Spot and mapping its lethal radiation belts!",
                "audioPenguin": "audio/en/cp_pioneer_opc_1a.mp3",
                "audioReply": "audio/en/pioneer_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "📡 Why do you have that enormous satellite dish on your front?",
                "penguinText": "Why do you have that enormous satellite dish on your front?",
                "reply": "That dish is my High-Gain Antenna—nearly three meters across! In deep space, radio signals become whisper-quiet. My big dish focused my radio transmissions like a cosmic megaphone so giant antennas on Earth could hear my discoveries.",
                "audioPenguin": "audio/en/cp_pioneer_opc_1b.mp3",
                "audioReply": "audio/en/pioneer_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "⚡ What powers your instruments so far away where the Sun looks like a faint star?",
                "penguinText": "What powers your instruments so far away where the Sun looks like a faint star?",
                "reply": "Solar panels are useless out here in the dark! I am powered by four Radioisotope Thermoelectric Generators—RTGs. They generate electricity directly from the natural heat of decaying plutonium pellets, running reliably for decades!",
                "audioPenguin": "audio/en/cp_pioneer_opc_1c.mp3",
                "audioReply": "audio/en/pioneer_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "To escape the Sun's powerful gravitational grip and venture into deep space, I used Jupiter's massive gravity as a celestial slingshot! Jupiter accelerated me to over one hundred and thirty thousand kilometers per hour, launching me toward interstellar space!",
            "audioUrl": "audio/en/pioneer_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "📜 Tell me about the famous golden plaque attached to your frame!",
                "penguinText": "Tell me about the famous golden plaque attached to your frame!",
                "reply": "Attached to my antenna struts is an engraved gold-anodized aluminum plaque designed by Carl Sagan and Frank Drake! It features drawings of a human man and woman, our solar system, and a pulsar star map indicating Earth's location in the Milky Way!",
                "audioPenguin": "audio/en/cp_pioneer_opc_2a.mp3",
                "audioReply": "audio/en/pioneer_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ Were scientists scared you would crash into asteroids when crossing the belt?",
                "penguinText": "Were scientists scared you would crash into asteroids when crossing the belt?",
                "reply": "Tremendously! Before my flight, many scientists feared the Asteroid Belt was packed with impenetrable dust and tumbling rocks that would shatter any probe. I proved the Asteroid Belt is mostly empty space and completely safe to navigate!",
                "audioPenguin": "audio/en/cp_pioneer_opc_2b.mp3",
                "audioReply": "audio/en/pioneer_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "🌌 Where are you heading now, and how far have you traveled?",
                "penguinText": "Where are you heading now, and how far have you traveled?",
                "reply": "My last faint signal reached Earth in January 2003 from over twelve billion kilometers away. I am coasting silently toward the orange giant star Aldebaran in the constellation Taurus. It will take me over two million years to arrive!",
                "audioPenguin": "audio/en/cp_pioneer_opc_2c.mp3",
                "audioReply": "audio/en/pioneer_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "Keep gazing upward at the night sky. One day, humanity's children will follow the trail we blazed among the stars.",
            "audioUrl": "audio/en/pioneer_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "Thank you, wise Pioneer 10! Your courage shines brighter than the distant stars!",
            "audioUrl": "audio/en/cp_pioneer_gracias.mp3"
          }
        },
        "dialogue": [
          {
            "speaker": "penguin",
            "text": "Hello! What are you doing traveling so far from Earth?"
          },
          {
            "speaker": "machine",
            "text": "I am Pioneer 10. I launched in 1972, became the first probe to cross the Asteroid Belt, and visited Jupiter.",
            "nextPrompt": "What did you study at Jupiter and how did you send data? →"
          },
          {
            "speaker": "penguin",
            "text": "What did you study at Jupiter and how did you send data?"
          },
          {
            "speaker": "machine",
            "text": "I observed its atmosphere, intense radiation, and moons, transmitting everything back with my large antenna dish.",
            "nextPrompt": "Do you carry any special message with you? →"
          },
          {
            "speaker": "penguin",
            "text": "Do you carry any special message with you?"
          },
          {
            "speaker": "machine",
            "text": "Yes! I carry a metal plaque with drawings of a human man and woman and clues to locate planet Earth.",
            "nextPrompt": "Safe travels, Pioneer 10! ✓"
          }
        ]
      },
      {
        "id": "near-shoemaker",
        "modelKey": "nearShoemaker",
        "name": "NEAR Shoemaker",
        "siteId": "asteroid-eros",
        "locationShort": "Asteroid Eros",
        "locationDetail": "NEAR Shoemaker: Resting on the south polar tip of Asteroid 433 Eros",
        "nasaUrl": "https://science.nasa.gov/mission/near-shoemaker/",
        "pos": {
          "x": 65,
          "y": 58
        },
        "shipPos": {
          "x": 22,
          "y": 58
        },
        "spawnPos": {
          "x": 22,
          "y": 58
        },
        "penguinText": "Hello! This doesn't look like a round planet. Where am I?",
        "penguinAudioUrl": "audio/en/cp_near_opc_1a.mp3",
        "dialogueText": "Woohoo! Check out the scenery, Cyberpenguin! Welcome to Asteroid 433 Eros! You're talking to NEAR Shoemaker!",
        "audioUrl": "audio/en/near_saludo.mp3",
        "branchingDialogue": {
          "greeting": {
            "speaker": "machine",
            "text": "Woohoo! Check out the scenery, Cyberpenguin! Welcome to Asteroid 433 Eros! You're talking to NEAR Shoemaker, the undisputed champion of asteroid explorers!",
            "audioUrl": "audio/en/near_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🥔 Hello, NEAR Shoemaker! What makes Asteroid Eros so weird and interesting?",
                "penguinText": "Hello, NEAR Shoemaker! What makes Asteroid Eros so weird and interesting?",
                "reply": "Eros is shaped like a giant potato or a bent peanut! It measures thirty-four kilometers long. It's a primitive near-Earth asteroid that has remained unchanged since our solar system formed four point six billion years ago!",
                "audioPenguin": "audio/en/cp_near_opc_1a.mp3",
                "audioReply": "audio/en/near_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "🧲 How did you orbit a peanut-shaped rock without getting flung into space?",
                "penguinText": "How did you orbit a peanut-shaped rock without getting flung into space?",
                "reply": "It was an incredible navigation feat! Because Eros is lumpy and irregular, its gravitational field pulls unevenly. My navigation team had to calculate delicate orbital maneuvers for a whole year to circle as low as thirty-five kilometers!",
                "audioPenguin": "audio/en/cp_near_opc_1b.mp3",
                "audioReply": "audio/en/near_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "🪨 Did you find any impact craters or strange surface features on Eros?",
                "penguinText": "Did you find any impact craters or strange surface features on Eros?",
                "reply": "Thousands! I mapped over one hundred thousand craters and discovered strange 'ponds' of flat, fine dust resting inside depression floors, along with giant boulders scattered across its rocky ridges!",
                "audioPenguin": "audio/en/cp_near_opc_1c.mp3",
                "audioReply": "audio/en/near_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "My mission was only designed to photograph Eros from orbit, not to touch down! But after a full year of orbital science, my team decided to attempt a daring descent to see if an orbital satellite could land gently on an asteroid without any landing legs!",
            "audioUrl": "audio/en/near_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "🛬 How did you manage to land on an asteroid with zero landing gear?",
                "penguinText": "How did you manage to land on an asteroid with zero landing gear?",
                "reply": "On February 12, 2001, I fired my thrusters to descend at a leisurely walking pace—less than seven kilometers per hour! I touched down right onto the surface of Eros with my solar panels and continued transmitting radio signals for over two weeks!",
                "audioPenguin": "audio/en/cp_near_opc_2a.mp3",
                "audioReply": "audio/en/near_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ What was your name honoring, and why was it so meaningful?",
                "penguinText": "What was your name honoring, and why was it so meaningful?",
                "reply": "I was named in honor of Dr. Eugene Shoemaker, the legendary planetary geologist who pioneered the study of cosmic impact craters and co-discovered Comet Shoemaker-Levy 9. It was a tribute to his lifelong passion for asteroids!",
                "audioPenguin": "audio/en/cp_near_opc_2b.mp3",
                "audioReply": "audio/en/near_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "🔬 What did your gamma-ray and infrared spectrometers discover on Eros?",
                "penguinText": "What did your gamma-ray and infrared spectrometers discover on Eros?",
                "reply": "My spectrometers proved that Eros is composed of primitive chondrite rock—rich in magnesium, iron, and silicon. It confirmed that near-Earth asteroids are ancient building blocks of planets that never melted!",
                "audioPenguin": "audio/en/cp_near_opc_2c.mp3",
                "audioReply": "audio/en/near_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "I made history as the very first spacecraft to ever land on an asteroid. Always reach for the impossible, Cyberpenguin!",
            "audioUrl": "audio/en/near_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "Thank you, bold NEAR Shoemaker! You showed us that bold curiosity can conquer any obstacle in the cosmos!",
            "audioUrl": "audio/en/cp_near_gracias.mp3"
          }
        },
        "dialogue": [
          {
            "speaker": "penguin",
            "text": "Hello! This place doesn't look like a planet. Where am I?"
          },
          {
            "speaker": "machine",
            "text": "Welcome to Asteroid Eros! I am NEAR Shoemaker, sent by NASA to study this rocky asteroid up close.",
            "nextPrompt": "What instruments did you use to study the asteroid? →"
          },
          {
            "speaker": "penguin",
            "text": "What instruments did you use to study the asteroid?"
          },
          {
            "speaker": "machine",
            "text": "In February 2000, I entered orbit around Eros, took over 160,000 photos, and used spectrometers to analyze its minerals.",
            "nextPrompt": "And what historic milestone did you achieve in the end? →"
          },
          {
            "speaker": "penguin",
            "text": "And what historic milestone did you achieve in the end?"
          },
          {
            "speaker": "machine",
            "text": "I was the first probe to orbit an asteroid, and on February 12, 2001, I made a gentle landing on its surface!",
            "nextPrompt": "Thank you, NEAR Shoemaker! ✓"
          }
        ]
      }
    ]
  }
];

  const QUIZZES_EN = {
  "moon": {
    "chapterId": "moon",
    "chapterName": "The Moon",
    "questions": [
      {
        "id": "q-moon-1",
        "hardwareId": "surveyor-3",
        "hardwareName": "Surveyor 3",
        "question": "What was the primary goal of the Surveyor 3 mission on the Moon?",
        "options": [
          "Dig trenches with its robotic scoop to test lunar soil firmness for Apollo astronauts.",
          "Build a launch tower for deep-space rockets.",
          "Hunt for liquid water inside lunar volcanoes.",
          "Carry the first penguin into space."
        ],
        "correctIndex": 0
      },
      {
        "id": "q-moon-2",
        "hardwareId": "apollo-11-eagle",
        "hardwareName": "Apollo 11 Lunar Module Eagle",
        "question": "What occurred with the two stages of Eagle after landing on the Moon?",
        "options": [
          "The bottom stage remained on the Moon while the top ascent stage lifted off with the astronauts.",
          "Both stages returned together to Earth.",
          "The ascent stage became an artificial satellite of Mars.",
          "Both stages remained permanently on the lunar surface."
        ],
        "correctIndex": 0
      }
    ]
  },
  "mars": {
    "chapterId": "mars",
    "chapterName": "Mars",
    "questions": [
      {
        "id": "q-mars-1",
        "hardwareId": "viking-1",
        "hardwareName": "Viking 1 Lander",
        "question": "What were the two main spacecraft that made up the Viking 1 mission?",
        "options": [
          "An orbiter (studying Mars from above) and a lander (testing the soil below).",
          "A rover and a helicopter.",
          "A rocket and a submarine.",
          "A telescope and a space station."
        ],
        "correctIndex": 0
      },
      {
        "id": "q-mars-2",
        "hardwareId": "sojourner",
        "hardwareName": "Sojourner Rover",
        "question": "What was the purpose of Sojourner’s APXS instrument?",
        "options": [
          "Analyze the chemical composition and minerals of rocks and soil.",
          "Send astronauts back to Earth.",
          "Measure the distance between Earth and Mars.",
          "Dig underground tunnels in Ares Vallis."
        ],
        "correctIndex": 0
      }
    ]
  },
  "deep-space": {
    "chapterId": "deep-space",
    "chapterName": "Deep Space",
    "questions": [
      {
        "id": "q-deep-1",
        "hardwareId": "pioneer-10",
        "hardwareName": "Pioneer 10",
        "question": "What special message does Pioneer 10 carry into interstellar space?",
        "options": [
          "A golden plaque with drawings of humans, the solar system, and pulsar clues.",
          "A map to find water on Mars.",
          "A photograph of all Apollo 11 astronauts.",
          "A gold record with whale songs."
        ],
        "correctIndex": 0
      },
      {
        "id": "q-deep-2",
        "hardwareId": "near-shoemaker",
        "hardwareName": "NEAR Shoemaker",
        "question": "What historic milestone made NEAR Shoemaker so special?",
        "options": [
          "It was the first spacecraft to orbit an asteroid and gently touch down on it.",
          "It was the first vehicle to walk on the Moon.",
          "It was the first rover that explored Mars.",
          "It was the first probe to leave the solar system."
        ],
        "correctIndex": 0
      }
    ]
  }
};

  const AMBIENT_THOUGHTS_EN = {
  "moon": [
    "Wheeeee! Gravity here is only one-sixth of Earth's gravity! With my little penguin feet, I can make giant leaps without even messing up my feathers!",
    "The ground is covered in regolith: a gray powder as fine as flour, but sharp like microscopic shattered glass because there is no wind or water to smooth it down.",
    "The sky is completely pitch-black even in the daytime! Since the Moon has no atmosphere, there's no air to scatter the sunlight. And look way out there... Earth looks like a shining blue marble!"
  ],
  "mars": [
    "How peculiar! On Earth the sky is blue, but here on Mars it has a butterscotch salmon-orange tint because of all the fine dust floating in the thin atmosphere.",
    "Brrrrr! Even for an Antarctic penguin with cold-resistant cyber-feathers, Mars is freezing! It can drop to minus eighty degrees Celsius at night!",
    "Everything around me is rusty red! The Martian soil is full of iron oxide, just like rusty metal. It's like an entire planet covered in cinnamon and cocoa!"
  ],
  "deep-space": [
    "Whoaaa! Up and down don't exist out here! If I flutter my flippers, I drift like a penguin swimming through the calmest cosmic ocean... but with zero water!",
    "From out here in the void, the stars don't twinkle at all! Without an atmosphere to wobble their light, they shine like crisp, eternal diamonds.",
    "Millions of rocky boulders orbiting the Sun together! These asteroids are ancient construction leftovers from when our solar system was born 4.6 billion years ago."
  ]
};

  const FINAL_BRANCHING_DIALOGUE_EN = {
  "penguinIntro": {
    "speaker": "penguin",
    "text": "We did it, space explorer! Look at our passport! We traveled from the gray dust of the Moon, stepped onto the rusty iron of Mars, and floated alongside legendary robotic probes in deep space.",
    "audioUrl": "audio/en/cp_final_mirada.mp3"
  },
  "decision": {
    "choices": [
      {
        "id": "final_a",
        "label": "🔬 Every machine has a unique design for its own special mission!",
        "penguinText": "I learned that every machine has a unique design crafted specifically for its own mission!",
        "reply": "Precisely! Some spacecraft use robotic cameras, others mini chemical ovens, others custom rocker-bogie wheels, and others travel toward distant stars. Science has no single shape—it's thousands of brilliant ideas working as one united crew!",
        "audioPenguin": "audio/en/cp_final_opc_a.mp3",
        "audioReply": "audio/en/cp_final_resp_a.mp3"
      },
      {
        "id": "final_b",
        "label": "🚀 The most thrilling part was seeing how they overcame impossible dangers!",
        "penguinText": "The most thrilling part was discovering how they overcame impossible dangers!",
        "reply": "Could not agree more! Like Eagle dodging a boulder field with forty seconds of fuel left, or NEAR making a soft touchdown without landing legs. Great discoveries demand courage and never backing down from problems!",
        "audioPenguin": "audio/en/cp_final_opc_b.mp3",
        "audioReply": "audio/en/cp_final_resp_b.mp3"
      },
      {
        "id": "final_c",
        "label": "✨ I can't wait to see where humanity explores next!",
        "penguinText": "I want to know where humanity will journey next!",
        "reply": "The future rests in our hands! NASA and international partners are preparing the Artemis program to return astronauts to the Moon, build permanent basecamps, and launch the first human voyages to Mars. Perhaps one of our young explorers reading this will be the first human to leave footprints on the Red Planet!",
        "audioPenguin": "audio/en/cp_final_opc_c.mp3",
        "audioReply": "audio/en/cp_final_resp_c.mp3"
      }
    ]
  },
  "closing": {
    "speaker": "penguin",
    "text": "Always remember this cosmic secret: Curiosity is the most powerful rocket fuel in the universe! As long as there are questions to ask, stars to chase, and curious minds like yours, the adventure will never end. See you in the next galaxy! Engines igniting in three... two... one... BLAST OFF! 🚀✨🐧",
    "audioUrl": "audio/en/cp_final_despegue.mp3"
  }
};

  const FINAL_DIALOGUE_EN = [
  {
    "speaker": "ship",
    "text": "Attention, explorer! You have returned victorious from your epic space journey!"
  },
  {
    "speaker": "penguin",
    "text": "We did it! We visited the Moon, explored Mars, and voyaged all the way to an asteroid in deep space."
  },
  {
    "speaker": "ship",
    "text": "You encountered six historic NASA machines. Each had a unique mission and taught us something new."
  },
  {
    "speaker": "penguin",
    "text": "I learned that some machines study the soil, others snap photos, others roam across planets, and some journey toward the stars."
  },
  {
    "speaker": "ship",
    "text": "Indeed! Space exploration requires curiosity, science, technology, and teamwork."
  },
  {
    "speaker": "penguin",
    "text": "And my explorer passport is completely filled with stamps and discoveries!"
  },
  {
    "speaker": "ship",
    "text": "Outstanding job! You have achieved the rank of Commander. But the cosmos is boundless: the icy moons of Jupiter, the rings of Saturn, and unexplored worlds await."
  },
  {
    "speaker": "penguin",
    "text": "Our adventure is only beginning! And remember: curiosity is the true rocket fuel of every great explorer! Where shall we blast off to next?"
  }
];

  const BADGES_EN = [
  {
    "id": "aprendiz",
    "name": "Apprentice",
    "minStars": 0
  },
  {
    "id": "ingeniero",
    "name": "Engineer",
    "minStars": 3
  },
  {
    "id": "especialista",
    "name": "Specialist",
    "minStars": 6
  },
  {
    "id": "piloto",
    "name": "Pilot",
    "minStars": 10
  },
  {
    "id": "comandante",
    "name": "Commander",
    "minStars": 13
  }
];

  const UI_STRINGS = {
  "es": {
    "langBtnLabel": "English",
    "langBtnTitle": "Switch to English",
    "homeTitle": "Cyberpenguin",
    "exploreBtn": "Explorar",
    "exploreAgainBtn": "Explorar de nuevo",
    "continueBtn": "Continuar",
    "lockedChapterMsg": "Completa la misión anterior para poder entrar",
    "resetProgressTitle": "Reiniciar progreso",
    "passportTitle": "Pasaporte",
    "badgesTitle": "Insignias",
    "certificateTitle": "Certificado",
    "certificateStatusLocked": "Disponible al completar todos los capítulos",
    "certificateStatusUnlocked": "¡Completado! Certificado listo",
    "viewBtn": "Ver",
    "downloadBtn": "Descargar",
    "backHomeAria": "Pantalla inicial",
    "pauseAria": "Menú de pausa",
    "soundAria": "Alternar sonido ambiental",
    "sampleModalType": "Muestra de roca",
    "sampleCollectBtn": "Guardar en la mochila",
    "quizTitle": "Quiz",
    "quizValidateBtn": "Validar",
    "quizTravelBtn": "Viajar",
    "pauseModalTitle": "Misión en pausa",
    "pauseModalSubtitle": "Exploración detenida temporalmente.",
    "pauseResumeBtn": "▶ Continuar misión",
    "pauseSoundBtn": "🔊 Alternar sonido",
    "pauseHomeBtn": "✕ Volver al mapa principal",
    "voiceStatusBadge": "",
    "speechContinueBtn": "Continuar ▶",
    "closeAria": "Cerrar",
    "actionSample": "Guardar en la mochila",
    "actionMachinePrefix": "Hablar con ",
    "actionShipTravel": "Siguiente parada",
    "actionShipLeave": "Entrar a la nave",
    "actionShipLocked": "Completa la misión anterior para poder entrar",
    "certLevelPrefix": "Rango: "
  },
  "en": {
    "langBtnLabel": "Español",
    "langBtnTitle": "Cambiar a Español",
    "homeTitle": "Cyberpenguin",
    "exploreBtn": "Explore",
    "exploreAgainBtn": "Explore again",
    "continueBtn": "Continue",
    "lockedChapterMsg": "Complete previous mission to unlock",
    "resetProgressTitle": "Reset progress",
    "passportTitle": "Passport",
    "badgesTitle": "Badges",
    "certificateTitle": "Certificate",
    "certificateStatusLocked": "Available upon completing all chapters",
    "certificateStatusUnlocked": "Completed! Certificate ready",
    "viewBtn": "View",
    "downloadBtn": "Download",
    "backHomeAria": "Home screen",
    "pauseAria": "Pause menu",
    "soundAria": "Toggle ambient sound",
    "sampleModalType": "Rock sample",
    "sampleCollectBtn": "Store in backpack",
    "quizTitle": "Quiz",
    "quizValidateBtn": "Validate",
    "quizTravelBtn": "Travel",
    "pauseModalTitle": "Mission paused",
    "pauseModalSubtitle": "Exploration temporarily on hold.",
    "pauseResumeBtn": "▶ Resume mission",
    "pauseSoundBtn": "🔊 Toggle sound",
    "pauseHomeBtn": "✕ Return to main map",
    "voiceStatusBadge": "(voice currently being created)",
    "speechContinueBtn": "Continue ▶",
    "closeAria": "Close",
    "actionSample": "Store in backpack",
    "actionMachinePrefix": "Talk to ",
    "actionShipTravel": "Next stop",
    "actionShipLeave": "Board spaceship",
    "actionShipLocked": "Complete previous mission to enter",
    "certLevelPrefix": "Rank: "
  }
};

  global.CYBERPENGUINS_DATA = {
    TITLE: 'Cyberpenguin: The Explorers We Must Never Forget',
    STORAGE_KEY: 'cyberpenguins_progress_v1',
    MAX_STARS_PER_CHAPTER: 5,
    CHAPTERS,
    QUIZZES,
    BADGES,
    AMBIENT_THOUGHTS,
    FINAL_BRANCHING_DIALOGUE,
    FINAL_DIALOGUE,
    CHAPTERS_ES: CHAPTERS,
    CHAPTERS_EN,
    QUIZZES_ES: QUIZZES,
    QUIZZES_EN,
    BADGES_ES: BADGES,
    BADGES_EN,
    AMBIENT_THOUGHTS_ES: AMBIENT_THOUGHTS,
    AMBIENT_THOUGHTS_EN,
    FINAL_BRANCHING_DIALOGUE_ES: FINAL_BRANCHING_DIALOGUE,
    FINAL_BRANCHING_DIALOGUE_EN,
    FINAL_DIALOGUE_ES: FINAL_DIALOGUE,
    FINAL_DIALOGUE_EN,
    UI_STRINGS,
    getChapters: (lang) => (lang === 'en' ? CHAPTERS_EN : CHAPTERS),
    getQuizzes: (lang) => (lang === 'en' ? QUIZZES_EN : QUIZZES),
    getAmbientThoughts: (lang) => (lang === 'en' ? AMBIENT_THOUGHTS_EN : AMBIENT_THOUGHTS),
    getFinalDialogue: (lang) => (lang === 'en' ? FINAL_BRANCHING_DIALOGUE_EN : FINAL_BRANCHING_DIALOGUE),
    getBadges: (lang) => (lang === 'en' ? BADGES_EN : BADGES),
    getI18n: (lang) => UI_STRINGS[lang] || UI_STRINGS.es
  };
})(typeof window !== 'undefined' ? window : globalThis);
