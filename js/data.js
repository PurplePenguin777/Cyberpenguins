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
      name: 'Frontera espacial',
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
      chapterName: 'Frontera espacial',
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
    greeting: {
      speaker: 'ship',
      text: '¡Bienvenido a bordo, Comandante Cyberpenguin! Todos los sistemas están al 100%. Motores iónicos listos y pasaporte de descubrimientos verificado con honores máximos.',
      audioUrl: 'audio/ia_nave_bienvenida.mp3'
    },
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

  global.CYBERPENGUINS_DATA = {
    TITLE: 'Cyberpenguins',
    STORAGE_KEY: 'cyberpenguins_progress_v1',
    MAX_STARS_PER_CHAPTER: 5,
    CHAPTERS,
    QUIZZES,
    BADGES,
    AMBIENT_THOUGHTS,
    FINAL_BRANCHING_DIALOGUE,
    FINAL_DIALOGUE
  };
})(typeof window !== 'undefined' ? window : globalThis);
