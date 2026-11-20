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
                  reply: '¡Ja, ja, ja! ¡Totalmente cierto! Cuando llegué el veinte de abril de 1967, las rocas reflejaron mi radar y mis pequeños cohetes no se apagaron a tiempo. ¡Reboté dos veces sobre la Luna como en un trampolín antes de quedarme quieta!',
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
                  reply: '¡Tomé más de seis mil trescientas fotografías en blanco y negro! Fotografié las rocas, las zanjas que cavé con mi pala e incluso tomé una foto histórica de un eclipse solar donde la Tierra tapó al Sol vista desde la Luna.',
                  audioPenguin: 'audio/cp_surveyor_opc_2a.mp3',
                  audioReply: 'audio/surveyor_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '⭐ ¿Es verdad que luego vinieron astronautas a visitarte en persona?',
                  penguinText: '¿Es verdad que luego vinieron astronautas a visitarte en persona?',
                  reply: '¡Bip-bip! ¡Sí, vinieron a visitarme a MÍ en persona! En noviembre de 1969, los astronautas del Apollo 12 aterrizaron su módulo Intrepid a solo ciento sesenta metros de distancia y vinieron caminando hasta aquí. ¡Pete Conrad y Alan Bean me examinaron y se llevaron mi cámara a la Tierra para estudiar cómo el metal aguanta dos años en el espacio!',
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
                  reply: '¡El mismo que viste y calza! El veinte de julio de 1969 traje a Neil Armstrong y Buzz Aldrin hasta aquí. Fuimos impulsados desde la Tierra por el gigantesco cohete Saturno V, ¡un cohete tan alto como un edificio de treinta y seis pisos!',
                  audioPenguin: 'audio/cp_eagle_opc_1a.mp3',
                  audioReply: 'audio/eagle_resp_1a.mp3'
                },
                {
                  id: '1b',
                  label: '🍫 ¡Wow, pareces cubierto de papel dorado! ¿Por qué brillas tanto?',
                  penguinText: '¡Wow, pareces cubierto de papel de chocolate dorado! ¿Por qué brillas tanto?',
                  reply: '¡Ja, ja! ¡Muchos niños creen que es papel de regalo! En realidad son mantas térmicas de alta tecnología llamadas Kapton y Mylar. ¿Has visto esas sábanas metálicas doradas que usan los rescatistas de emergencia? En la Luna no hay aire: bajo el Sol el metal se calienta a más de ciento veinte grados y en la sombra baja a ciento cincuenta bajo cero. Esas mantas reflejaban el calor como un termo gigante para que Neil y Buzz estuvieran cómodos y seguros.',
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
              text: 'Mi cuerpo estaba dividido en dos partes: la etapa de descenso, que es la parte dorada de abajo con patas que sirvió como base de despegue y se quedó para siempre aquí; y la etapa de ascenso, que fue la cabina superior que encendió su propio motor como un cohete para devolver a los astronautas al espacio. ¡Trabajaron en equipo perfecto!',
              audioUrl: 'audio/eagle_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '🪨 ¿Qué hicieron Neil y Buzz mientras caminaban aquí afuera?',
                  penguinText: '¿Qué hicieron Neil y Buzz mientras caminaban aquí afuera?',
                  reply: 'Caminaron durante más de dos horas y media, tomaron fotos, clavaron la bandera de Estados Unidos y recolectaron casi veintidós kilos de rocas y polvo lunar usando palas y pinzas especiales para llevar a los laboratorios de la Tierra.',
                  audioPenguin: 'audio/cp_eagle_opc_2a.mp3',
                  audioReply: 'audio/eagle_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '⭐ ¿El aterrizaje fue tan fácil como apretar un botón automático?',
                  penguinText: '¿El aterrizaje fue tan fácil como apretar un botón automático?',
                  reply: '¡Ufff, casi no lo logramos! Durante el descenso, la computadora se sobrecargó de tareas y saltó la alarma doce cero dos, ¡igual que cuando abres demasiadas aplicaciones en una tableta y se traba! El piloto automático nos llevaba directo a un cráter lleno de rocas tan grandes como automóviles. Neil Armstrong tomó los controles manuales como en un videojuego, voló buscando un sitio plano y aterrizamos cuando quedaban apenas ¡menos de cuarenta segundos de combustible! ¡Se nos acababa la gasolina espacial!',
                  audioPenguin: 'audio/cp_eagle_opc_2b.mp3',
                  audioReply: 'audio/eagle_resp_2b.mp3'
                },
                {
                  id: '2c',
                  label: '🔬 Veo unos aparatos con espejos y paneles solares sobre el suelo... ¿qué son?',
                  penguinText: 'Veo unos aparatos con espejos y paneles solares sobre el suelo... ¿qué son?',
                  reply: '¡Excelente vista! Dejamos el paquete científico EASEP con unos espejos reflectores muy especiales. ¿Conoces los ojos de gato que llevan las bicicletas en las ruedas? ¡Reflejan la luz directo hacia quien los alumbra! Hoy en día, los científicos disparan rayos láser desde la Tierra hacia esos espejos en la Luna. Midiendo el tiempo que tarda la luz en rebotar, sabemos la distancia exacta a la Luna al milímetro.',
                  audioPenguin: 'audio/cp_eagle_opc_2c.mp3',
                  audioReply: 'audio/eagle_resp_2c.mp3'
                }
              ]
            },
            closing: {
              speaker: 'machine',
              text: 'La huella de Neil y Buzz quedó marcada para la eternidad. Pero el mensaje más hermoso es la placa en mi pata delantera: \'Vinimos en son de paz en nombre de toda la humanidad\'.',
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
                  reply: '¡Fui la primera nave estadounidense en aterrizar con total éxito en Marte y sobrevivir para enviar datos! Aterricé el veinte de julio de 1976, ¡justo siete años después de que los humanos pisaran la Luna! Y mi misión era doble: mientras mi Orbitador tomaba fotos desde las alturas como un satélite espía amigable, yo aterricé aquí abajo para oler, raspar y probar el suelo marciano.',
                  audioPenguin: 'audio/cp_viking_opc_1a.mp3',
                  audioReply: 'audio/viking_resp_1a.mp3'
                },
                {
                  id: '1b',
                  label: '👽 ¡Rápido, dime la verdad! ¿Encontraste marcianitos verdes con antenas?',
                  penguinText: '¡Rápido, dime la verdad! ¿Encontraste marcianitos verdes con antenas?',
                  reply: '¡Ja, ja, ja! ¡Nada de hombrecitos verdes ni ciudades alienígenas! Mis sensores buscaron microbios o pequeñas bacterias en el polvo, pero no encontramos vida. ¡Eso sí, descubrí algo fascinante! El suelo marciano tiene químicos súper agresivos, muy parecidos al agua oxigenada con la que nos curan los raspones. Esos químicos actúan como un desinfectante gigante que destruye cualquier rastro biológico. ¡Así aprendimos que para un ser vivo, la superficie de Marte es un lugar muy difícil!',
                  audioPenguin: 'audio/cp_viking_opc_1b.mp3',
                  audioReply: 'audio/viking_resp_1b.mp3'
                },
                {
                  id: '1c',
                  label: '🦾 ¿Por qué tienes ese brazo tan largo terminado en palita?',
                  penguinText: '¿Por qué tienes ese brazo tan largo terminado en palita?',
                  reply: '¡Es mi brazo mecánico de tres metros! En la punta llevaba una pala con un pequeño motor para raspar el suelo como si fuera una cuchara en un tazón de cereal. Recogía tierrita marciana y la soltaba por unos embudos en mi lomo directo a mis hornos científicos en miniatura.',
                  audioPenguin: 'audio/cp_viking_opc_1c.mp3',
                  audioReply: 'audio/viking_resp_1c.mp3'
                }
              ]
            },
            commonBridge: {
              speaker: 'machine',
              text: 'En mi interior llevaba un aparato con nombre de trabalenguas: el GCMS, o Cromatógrafo de Gases y Espectrómetro de Masas. Para entenderlo fácil: ¡imagina un hornito de cocina espacial! Mi brazo echaba una cucharadita de tierra marciana en un tubito, el hornito la calentaba y luego olía los vaporcitos que soltaba. Así pudimos descubrir qué minerales y gases componen el suelo del planeta rojo.',
              audioUrl: 'audio/viking_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '❄️ ¿Cómo soportaste tanto frío durante años?',
                  penguinText: '¿Cómo soportaste tanto frío durante años?',
                  reply: '¡No usé paneles solares porque las tormentas de polvo marciano los habrían cubierto de tierra como una persiana cerrada! En su lugar, llevé dos baterías especiales llamadas RTG. ¿El truco? Adentro tenían una cápsula que produce calor continuo, como una fogata atómica segura. Ese calor se convertía en electricidad para no congelarme nunca. ¡Eran como dos termos mágicos que me daban energía de día y de noche!',
                  audioPenguin: 'audio/cp_viking_opc_2a.mp3',
                  audioReply: 'audio/viking_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '🌪️ ¿Tuviste que enfrentar tormentas de arena?',
                  penguinText: '¿Tuviste que enfrentar tormentas de arena?',
                  reply: '¡Uff, vi tormentas monstruosas! En Marte, a veces una pequeña tormenta crece tanto que el polvo cubre todo el planeta durante semanas y tapa el Sol por completo, como si cayera una niebla rojiza gigante. Con mi estación del clima medí vientos de hasta ciento veinte kilómetros por hora, pero como el aire marciano es tan finito y ligero, ¡el viento apenas te empujaría como una suave brisa en la Tierra!',
                  audioPenguin: 'audio/cp_viking_opc_2b.mp3',
                  audioReply: 'audio/viking_resp_2b.mp3'
                },
                {
                  id: '2c',
                  label: '⏳ ¿Tu misión duró unos pocos días?',
                  penguinText: '¿Tu misión duró unos pocos días?',
                  reply: '¡Para nada! Los ingenieros de la NASA pensaron que yo duraría solo noventa días... ¡pero fui tan fuerte que trabajé durante más de seis años enteros! Envié miles de fotos e informes del clima hasta noviembre de 1982. ¡Fui el robot más resistente y madrugador de Marte en el siglo veinte!',
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
          dialogueText: '¡Cuidado con mis rueditas, pingüino amigo! ¡Paso a un centímetro por segundo! ¡Soy Sojourner, el primer rover de la historia en Marte!',
          audioUrl: 'audio/sojourner_saludo.mp3',
          branchingDialogue: {
            greeting: {
              speaker: 'machine',
              text: '¡Cuidado con mis rueditas, pingüino amigo! ¡Paso a un centímetro por segundo! ¡Soy Sojourner, el primer rover de la historia en Marte!',
              audioUrl: 'audio/sojourner_saludo.mp3'
            },
            decision1: {
              choices: [
                {
                  id: '1a',
                  label: '🤖 ¡Aaaay, pero qué tierno eres! ¡Pareces un juguete a control remoto!',
                  penguinText: '¡Aaaay, pero qué tierno eres! ¡Pareces un juguete a control remoto!',
                  reply: '¡Oye, que peso diez kilos y medio y mido solo sesenta y cinco centímetros, pero llevo un cerebro de titanio! Llegué el cuatro de julio de 1997 con la misión Mars Pathfinder. ¡Demostré que los rovers pequeños podían explorar otros mundos con mucha agilidad!',
                  audioPenguin: 'audio/cp_sojourner_opc_1a.mp3',
                  audioReply: 'audio/sojourner_resp_1a.mp3'
                },
                {
                  id: '1b',
                  label: '🎈 ¿Cómo llegaste hasta aquí si no tienes cohetes propios?',
                  penguinText: '¿Cómo llegaste hasta aquí si no tienes cohetes propios?',
                  reply: '¡Mi nave nodriza Pathfinder fue genial! Para aterrizar no usamos patas duras: ¡nos inflamos dentro de un capullo gigante de bolsas de aire y rebotamos sobre Marte como una pelota de baloncesto más de quince veces hasta detenernos! Luego los pétalos se abrieron y bajé por una rampita.',
                  audioPenguin: 'audio/cp_sojourner_opc_1b.mp3',
                  audioReply: 'audio/sojourner_resp_1b.mp3'
                },
                {
                  id: '1c',
                  label: '🛞 ¿Tienes seis ruedas para correr a toda velocidad?',
                  penguinText: '¿Tienes seis ruedas para correr a toda velocidad?',
                  reply: '¡Ja, ja! ¡No soy un bólido de carreras! Mi velocidad máxima es de un centímetro por segundo; ¡un caracol me ganaría en una carrera corta! Pero mis seis ruedas tienen un sistema llamado rocker-bogie: ¡imagina una patineta todoterreno con patas articuladas de insecto! Cuando una rueda trepa una roca grande, las otras cinco se acomodan solitas en el suelo para que mi cuerpo nunca se balancee ni se vuelque.',
                  audioPenguin: 'audio/cp_sojourner_opc_1c.mp3',
                  audioReply: 'audio/sojourner_resp_1c.mp3'
                }
              ]
            },
            commonBridge: {
              speaker: 'machine',
              text: 'En mi parte trasera llevo el APXS, el Espectrómetro de Rayos X y Partículas Alfa. ¡Es como mi nariz robótica! En lugar de oler, lo pego contra las piedras marcianas y les dispara partículas invisibles e inofensivas. Al escuchar el eco de los átomos de la roca, los científicos descubrieron si eran restos de lava volcánica o rocas arrastradas por agua en el pasado remoto.',
              audioUrl: 'audio/sojourner_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '🎮 ¿Tú manejabas solo o alguien tenía un control remoto en la Tierra?',
                  penguinText: '¿Tú manejabas solo o alguien tenía un control remoto en la Tierra?',
                  reply: '¡Imposible usar un joystick en vivo! Las señales de radio entre la Tierra y Marte tardan entre diez y veinte minutos en viajar a la velocidad de la luz. Si veo un precipicio y en la Tierra me gritan \'¡Frena!\', ¡para cuando el mensaje me llegue ya me habré caído! Por eso los científicos me mandaban un paquete de rutas en la mañana y yo usaba sensores láser para evitar baches por mí mismo.',
                  audioPenguin: 'audio/cp_sojourner_opc_2a.mp3',
                  audioReply: 'audio/sojourner_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '🐻 ¿Cómo llamaban a las rocas que investigabas?',
                  penguinText: '¿Cómo llamaban a las rocas que investigabas?',
                  reply: '¡Los científicos de la NASA tienen mucho sentido del humor! Para no aburrirse con números de catálogo, bautizaron a las rocas marcianas con nombres de personajes: ¡analicé una roca con forma de cabeza de oso llamada Yogi, otra piramidal llamada Barnacle Bill, otra llamada Scooby Doo y una plana llamada Casper!',
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
                  reply: '¡Ja, ja! ¡No es un paraguas para la lluvia! Es mi antena de alta ganancia de casi tres metros de diámetro. Como viajé tan lejos de la Tierra, necesitaba una antena parabólica gigante y muy enfocada para que mis débiles señales de radio pudieran ser escuchadas por las estaciones en la Tierra.',
                  audioPenguin: 'audio/cp_pioneer_opc_1b.mp3',
                  audioReply: 'audio/pioneer_resp_1b.mp3'
                },
                {
                  id: '1c',
                  label: '☄️ ¿No te dio miedo atravesar el temido cinturón de asteroides?',
                  penguinText: '¿No te dio miedo atravesar el temido cinturón de asteroides?',
                  reply: '¡En las películas de ciencia ficción muestran el cinturón de asteroides como un campo minado donde chocas a cada segundo! Pero cuando lo crucé en 1972 demostré la verdad: ¡el espacio es colosalmente gigantesco! Entre un asteroide y el siguiente hay tanta distancia como viajar de un país a otro en la Tierra. Cruzarlo fue tan tranquilo como navegar por un océano despejado, abriendo una autopista segura para todas las naves del futuro.',
                  audioPenguin: 'audio/cp_pioneer_opc_1c.mp3',
                  audioReply: 'audio/pioneer_resp_1c.mp3'
                }
              ]
            },
            commonBridge: {
              speaker: 'machine',
              text: 'Llegué tan lejos que la luz del Sol apenas se ve como un puntito brillante. Por eso no usé paneles solares, sino baterías nucleares RTG: cápsulas térmicas que me daban calor y electricidad continua. Mi última señal llegó a la Tierra el 23 de enero de 2003, cuando estaba a más de doce mil millones de kilómetros. ¡Ese mensaje de radio tardó más de once horas en cruzar el vacío a la velocidad de la luz!',
              audioUrl: 'audio/pioneer_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '📜 He visto que llevas una placa metálica dorada grabada... ¿qué significa?',
                  penguinText: 'He visto que llevas una placa metálica dorada grabada... ¿qué significa?',
                  reply: '¡Es mi mayor tesoro! Una placa de oro diseñada por Carl Sagan y su esposa Linda. Muestra a un hombre y una mujer saludando en son de paz, el mapa del sistema solar y unas líneas que salen de un centro: ¡son púlsares! Imagina faros de luz cósmicos que parpadean con un ritmo perfecto como el tic-tac de un reloj. Cualquier civilización inteligente que encuentre mi placa podrá contar esos parpadeos y saber exactamente dónde queda la Tierra en el mapa de la galaxia.',
                  audioPenguin: 'audio/cp_pioneer_opc_2a.mp3',
                  audioReply: 'audio/pioneer_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '✨ ¿Hacia dónde vas ahora que tus baterías se apagaron?',
                  penguinText: '¿Hacia dónde vas ahora que tus baterías se apagaron?',
                  reply: 'Como en el vacío del espacio no hay aire ni gravedad fuerte que me frene, ¡seguiré flotando para siempre! Ahora viajo en silencio hacia la estrella gigante roja Aldebarán. Tardaré unos dos millones de años en llegar a su vecindario. ¡Soy una auténtica carta dentro de una botella lanzada al océano de las estrellas!',
                  audioPenguin: 'audio/cp_pioneer_opc_2b.mp3',
                  audioReply: 'audio/pioneer_resp_2b.mp3'
                },
                {
                  id: '2c',
                  label: '🌀 ¿Qué se siente pasar al lado de Júpiter?',
                  penguinText: '¿Qué se siente pasar al lado de Júpiter?',
                  reply: '¡Sentí una fuerza colosal! Júpiter es tan inmenso que su gravedad atrae todo como un imán gigante. Usé su gravedad para hacer una maniobra de honda espacial: ¡como cuando vas corriendo en patines, te agarras de un poste y sales disparado con más velocidad hacia adelante! Así tomé impulso para volar hacia el espacio exterior.',
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
                  reply: '¡Ja, ja! ¡Eros mide treinta y cuatro kilómetros de largo y parece una papa o un cacahuate gigante! ¿Sabes por qué los planetas grandes como la Tierra son redondos? Porque tienen tanta masa y gravedad que aprietan todo hacia el centro como si hicieras una bolita de plastilina con las manos. ¡Pero Eros es tan chiquito y ligero que su gravedad no tuvo fuerza para redondearlo, y se quedó como una roca chueca y alargada!',
                  audioPenguin: 'audio/cp_near_opc_1a.mp3',
                  audioReply: 'audio/near_resp_1a.mp3'
                },
                {
                  id: '1b',
                  label: '🛰️ ¿Tú eres una nave o un módulo de aterrizaje? ¡No te veo patas!',
                  penguinText: '¿Tú eres una nave o un módulo de aterrizaje? ¡No te veo patas!',
                  reply: '¡Ese es el misterio más asombroso de mi historia! ¡Yo nunca fui diseñada para aterrizar! No tenía patas, ni amortiguadores, ni colchones. Fui construida únicamente para ser un satélite orbitador y tomar fotos desde el aire.',
                  audioPenguin: 'audio/cp_near_opc_1b.mp3',
                  audioReply: 'audio/near_resp_1b.mp3'
                },
                {
                  id: '1c',
                  label: '🚀 ¿Cómo llegaste hasta un asteroide tan chiquito en medio de la nada?',
                  penguinText: '¿Cómo llegaste hasta un asteroide tan chiquito en medio de la nada?',
                  reply: 'Despegué en 1996. Primero sobrevolé el asteroide Mathilde para tomarle fotos en 1997, y el catorce de febrero del año 2000, ¡justo en el Día de San Valentín!, me convertí en la primera nave de la humanidad en ponerse en órbita alrededor de un asteroide.',
                  audioPenguin: 'audio/cp_near_opc_1c.mp3',
                  audioReply: 'audio/near_resp_1c.mp3'
                }
              ]
            },
            commonBridge: {
              speaker: 'machine',
              text: 'Llevaba seis instrumentos científicos de élite: cámaras fotográficas, sensores para olfatear minerales y un telémetro láser. ¿Cómo funcionaba el láser? Disparaba rayos de luz hacia la roca y medía cuánto tardaban en rebotar. ¡Así dibujamos un mapa en tres dimensiones de todas las montañas y cráteres de Eros igual que en un videojuego!',
              audioUrl: 'audio/near_puente_clave.mp3'
            },
            decision2: {
              choices: [
                {
                  id: '2a',
                  label: '🤸 Pero si no tenías patas... ¿cómo terminaste aquí sentada en el suelo?',
                  penguinText: 'Pero si no tenías patas... ¿cómo terminaste aquí sentada en el suelo?',
                  reply: 'El doce de febrero de 2001, los científicos de la NASA tuvieron una idea audaz: ¿Y si intentamos posarla en el suelo con sus pequeños chorros de gas? Fuimos frenando centímetro a centímetro hasta tocar la superficie a menos de seis kilómetros por hora: ¡eso es más lento de lo que corres tú en el recreo de la escuela! Toqué el suelo apoyándome en las puntitas de mis paneles solares como un bailarín cósmico. ¡Fui la primera nave de la historia en posarse sobre un asteroide!',
                  audioPenguin: 'audio/cp_near_opc_2a.mp3',
                  audioReply: 'audio/near_resp_2a.mp3'
                },
                {
                  id: '2b',
                  label: '🏷️ ¿Y qué pasó con tu nombre? ¿Por qué te llamas Shoemaker?',
                  penguinText: '¿Y qué pasó con tu nombre? ¿Por qué te llamas Shoemaker?',
                  reply: 'Originalmente me llamaba solo NEAR, que significa Encuentro con Asteroides Cercanos a la Tierra. Pero la NASA me rebautizó en honor a Eugene Shoemaker, un legendario científico que descubrió que la Luna y los planetas tienen cráteres porque los asteroides y cometas chocaron contra ellos a lo largo de millones de años.',
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
      text: 'Recuerda siempre este gran secreto cósmico: ¡La curiosidad es el combustible más potente de todo gran explorador! Mientras haya preguntas por responder, estrellas en el cielo y mentes curiosas como la tuya, la aventura nunca terminará. ¡Nos vemos en la próxima galaxia! ¡Motores encendidos en tres... dos... uno... DESPEGUEEEE!',
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
            "text": "Beep, biiip! Sensor alert! I detect a feathered space explorer stepping near my landing pads! Hello there, little traveler! Did you come all the way from Earth?",
            "audioUrl": "audio/en/surveyor_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🔍 Hello! I'm Cyberpenguin. Who are you, and what are you doing standing here?",
                "penguinText": "Hello! I'm Cyberpenguin. Who are you, and what are you doing standing here?",
                "reply": "Nice to meet you, Cyberpenguin! I am Surveyor 3, a robotic spacecraft launched by NASA in April nineteen sixty-seven. I was sent to this very crater to investigate the lunar soil and prepare the way for the astronauts of the Apollo program!",
                "audioPenguin": "audio/en/cp_surveyor_opc_a.mp3",
                "audioReply": "audio/en/surveyor_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "⛏️ Whoa, a three-legged robot! And why do you have that arm with a little shovel?",
                "penguinText": "Whoa, a three-legged robot! Why do you have a long arm with a tiny shovel?",
                "reply": "Good eye! I was the very first spacecraft in human history to carry a robotic scoop to the Moon. With an electric motor, I stretched it out and scraped the soil just like playing in a giant sandbox to test how solid the ground really was!",
                "audioPenguin": "audio/en/cp_surveyor_opc_b.mp3",
                "audioReply": "audio/en/surveyor_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "🏀 Is it true that you bounced across the surface like a basketball when you landed?",
                "penguinText": "Is it true you bounced like a rubber ball when you landed?",
                "reply": "Ha, ha, ha! Absolutely true! When I touched down on April twentieth, nineteen sixty-seven, reflective rocks confused my radar, and my braking rockets did not shut off in time. I bounced twice across the Moon like a trampoline before coming to a gentle stop!",
                "audioPenguin": "audio/en/cp_surveyor_opc_c.mp3",
                "audioReply": "audio/en/surveyor_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "Before astronauts could come down to walk in person, scientists needed to be sure the ground would hold their weight without swallowing them like quicksand. With my scoop, I dug four trenches and pressed down on the dust to prove the lunar surface was solid and safe!",
            "audioUrl": "audio/en/surveyor_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "📸 How many pictures did you snap with your television camera?",
                "penguinText": "How many pictures did you take with your television camera?",
                "reply": "I beamed back over six thousand three hundred black-and-white photos! I photographed lunar boulders, the trenches I dug with my scoop, and I even captured a historic photo of a solar eclipse where Earth blocked the Sun right before my eyes!",
                "audioPenguin": "audio/en/cp_surveyor_opc_2a.mp3",
                "audioReply": "audio/en/surveyor_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ Is it true that human astronauts later came back to visit you in person?",
                "penguinText": "Is it true human astronauts came to visit you in person later on?",
                "reply": "Beep-beep! Yes, they came to visit ME in person! In November nineteen sixty-nine, Apollo twelve astronauts landed their lunar module Intrepid just one hundred and sixty meters away and walked right up to me! Pete Conrad and Alan Bean examined my parts and took my camera back to Earth to study how metal survives two years exposed to space!",
                "audioPenguin": "audio/en/cp_surveyor_opc_2b.mp3",
                "audioReply": "audio/en/surveyor_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "🔬 What did scientists learn when they took your parts back to Earth laboratories?",
                "penguinText": "What did scientists learn when they brought your parts back to Earth?",
                "reply": "It was the only time in human history that parts left on another world were brought back to a laboratory! Scientists discovered how space radiation, dust, and temperature swings wear down wires and paint, helping NASA design safer spacesuits and stronger spacecraft!",
                "audioPenguin": "audio/en/cp_surveyor_opc_2c.mp3",
                "audioReply": "audio/en/surveyor_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "I transmitted data until May nineteen sixty-seven, but my greatest pride was helping astronauts walk safely on the Moon. Keep exploring with bravery, Cyberpenguin!",
            "audioUrl": "audio/en/surveyor_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "Thank you, brave Surveyor three! You just earned the first lunar stamp in my passport!",
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
            "text": "Houston, Tranquility Base here! Sensor contact confirmed! Welcome to the Sea of Tranquility, Cyberpenguin. You are standing at the most historic landing site on the Moon!",
            "audioUrl": "audio/en/eagle_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🏛️ No way! Are you the legendary Eagle from Apollo 11?",
                "penguinText": "No way! Are you the legendary Eagle from Apollo eleven?",
                "reply": "The one and only! On July twentieth, nineteen sixty-nine, I carried Neil Armstrong and Buzz Aldrin safely down to this ground. We were blasted off from Earth by the gigantic Saturn Five rocket—a monster rocket as tall as a thirty-six-story skyscraper!",
                "audioPenguin": "audio/en/cp_eagle_opc_1a.mp3",
                "audioReply": "audio/en/eagle_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "🍫 Whoa, you look wrapped in shiny golden chocolate foil! Why are you so shiny?",
                "penguinText": "Whoa, you look covered in shiny golden chocolate wrapper! Why do you sparkle so much?",
                "reply": "Ha, ha! Lots of kids think it is gift wrapping paper! They are actually high-tech thermal blankets made of Kapton and Mylar. Have you seen those shiny gold rescue blankets? On the Moon without air, direct sunlight heats metal to over one hundred and twenty degrees, and in the shade it drops to one hundred and fifty below zero. Those blankets reflected heat like a giant space thermos to keep Neil and Buzz safe!",
                "audioPenguin": "audio/en/cp_eagle_opc_1b.mp3",
                "audioReply": "audio/en/eagle_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "⚠️ Did you really almost run out of fuel right before touching down?",
                "penguinText": "Where are your astronaut friends? Are they taking a space nap inside?",
                "reply": "They returned safely home to Earth a long time ago! But our crew had three teammates: Neil and Buzz climbed down my ladder to explore the surface, while Michael Collins stayed in lunar orbit piloting our mothership, Columbia, patiently waiting for our return.",
                "audioPenguin": "audio/en/cp_eagle_opc_1c.mp3",
                "audioReply": "audio/en/eagle_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "My body was built in two distinct sections: the descent stage—the gold-wrapped bottom half with four landing legs that remained forever here as a launchpad; and the ascent stage—the upper cockpit cabin that fired its own rocket motor to shoot the astronauts back into space. We worked as a flawless team!",
            "audioUrl": "audio/en/eagle_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "📦 What happened to your top half? Where is the cabin where the astronauts rode?",
                "penguinText": "What did Neil and Buzz do while walking out here on the surface?",
                "reply": "They walked outside for more than two and a half hours, took pictures, planted the American flag, and collected nearly twenty-two kilograms of lunar rocks and soil using special tongs and scoops to carry back to Earth's laboratories!",
                "audioPenguin": "audio/en/cp_eagle_opc_2a.mp3",
                "audioReply": "audio/en/eagle_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ What famous scientific experiment did Neil and Buzz set up with mirrors?",
                "penguinText": "Was landing as simple as pressing an automatic autopilot button?",
                "reply": "Whew, it was a nail-biter! During our final descent, our computer was overloaded with alarms, and the autopilot was aiming straight into a football-field-sized crater filled with giant boulders! Neil took manual control like a video game joystick, flew past the crater, and touched down gently with only about forty seconds of fuel left!",
                "audioPenguin": "audio/en/cp_eagle_opc_2b.mp3",
                "audioReply": "audio/en/eagle_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "📜 What does the stainless steel plaque attached to your landing leg say?",
                "penguinText": "I see metal instruments with mirrors and solar panels left on the dust... what are those?",
                "reply": "Sharp eyes! We set up a science package called EASEP. It included a lunar seismometer to listen to moonquakes, and a special laser reflector array. Even today, scientists on Earth shine powerful laser beams at those reflectors to measure the exact distance to the Moon down to the millimeter!",
                "audioPenguin": "audio/en/cp_eagle_opc_2c.mp3",
                "audioReply": "audio/en/eagle_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "Neil and Buzz's bootprints will stay stamped in this dust for millions of years. Remember, Cyberpenguin: that was one small step for a man, one giant leap for mankind!",
            "audioUrl": "audio/en/eagle_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "I will cherish your story forever, Commander Eagle! Stamp number two is officially verified in my passport!",
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
            "text": "Biological signature detected! Feathers, beak, and a pressurized spacesuit! Welcome to Mars, Cyberpenguin! Greetings from Chryse Planitia, the Plains of Gold!",
            "audioUrl": "audio/en/viking_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🔴 Hello, Viking 1! What made your arrival on Mars so famous?",
                "penguinText": "Hello Viking one! Were you the first spacecraft to land on Mars?",
                "reply": "I was the first American spacecraft to touch down with complete success on Mars and survive for years to transmit data! I landed on July twentieth, nineteen seventy-six. And we were a team of two: while my sister Orbiter mapped Mars from space, I sat down here to scoop, smell, and analyze the red Martian dirt.",
                "audioPenguin": "audio/en/cp_viking_opc_1a.mp3",
                "audioReply": "audio/en/viking_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "📸 Did you really take the first color photograph of Mars in human history?",
                "penguinText": "Tell me the truth! Did you find little green martians hiding behind the rocks?",
                "reply": "Ha, ha, ha! No little green men, no alien cities, and no bug-eyed monsters! My sensors tested for tiny microbes in the dust, but found no living organisms. However, I discovered something incredible: the soil is packed with harsh chemicals similar to hydrogen peroxide that act like a super-disinfectant, destroying organic molecules!",
                "audioPenguin": "audio/en/cp_viking_opc_1b.mp3",
                "audioReply": "audio/en/viking_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "💨 How did you survive entering the thin Martian atmosphere without crashing?",
                "penguinText": "Why do you have such a long mechanical arm with a tiny shovel at the end?",
                "reply": "That is my three-meter robotic arm! On the tip, I had a motor-driven scoop that scraped the Martian surface like a spoon digging into a bowl of cereal. I scooped up red soil and dropped it into small funnel slots on my back, straight into my miniature onboard science ovens!",
                "audioPenguin": "audio/en/cp_viking_opc_1c.mp3",
                "audioReply": "audio/en/viking_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "Inside my body, I carried an instrument with a giant tongue-twister name: the GCMS, or Gas Chromatograph-Mass Spectrometer! Imagine a miniature high-tech space toaster oven. My arm dropped dirt inside tiny tubes, the oven baked it, and my chemical nose sniffed the vapors to discover exactly what Mars is made of!",
            "audioUrl": "audio/en/viking_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "🧪 Did you find living Martian microbes in the soil with your mini laboratory?",
                "penguinText": "How did you survive the freezing Martian cold for so many years?",
                "reply": "I couldn't rely on solar panels because Martian dust storms would have covered them like closed window blinds! Instead, I carried two special nuclear batteries called RTGs. Inside, radioactive fuel generated continuous natural heat, keeping my circuits cozy and producing nonstop electrical power.",
                "audioPenguin": "audio/en/cp_viking_opc_2a.mp3",
                "audioReply": "audio/en/viking_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ Is it true that you also had a sister spaceship orbiting high above the planet?",
                "penguinText": "Did you have to face terrifying Martian dust storms?",
                "reply": "Oh, I survived monster dust storms! On Mars, sometimes a small localized dust storm grows and grows until it wraps the ENTIRE planet in a blinding orange dust blanket for months! The winds roared, but my sturdy landing legs kept me planted firm like a rock!",
                "audioPenguin": "audio/en/cp_viking_opc_2b.mp3",
                "audioReply": "audio/en/viking_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "🌪️ Did you measure Martian weather and dust storms with your instruments?",
                "penguinText": "Did your mission last only a few days?",
                "reply": "I was only planned to work for ninety days, but I survived for over SIX YEARS! I worked continuously until November nineteen eighty-two, measuring winds, taking over fifty thousand photos, and recording the first daily weather forecasts from another world!",
                "audioPenguin": "audio/en/cp_viking_opc_2c.mp3",
                "audioReply": "audio/en/viking_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "Because of my data, humanity realized Mars has valleys carved by ancient rivers that dried up billions of years ago. Keep digging for knowledge, Cyberpenguin!",
            "audioUrl": "audio/en/viking_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "Thank you, pioneer Viking! Stamp number three is glowing in my passport!",
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
            "text": "Watch my six wheels, penguin pal! I'm rolling at top speed: one centimeter per second! I am Sojourner, the first rover in history to drive across Mars!",
            "audioUrl": "audio/en/sojourner_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🏎️ Wow! You're so cute and tiny! How big are you compared to me?",
                "penguinText": "Aww, you're so tiny and cute! You look like a remote-control toy car!",
                "reply": "Hey, I might weigh only ten point five kilograms and stand just thirty centimeters tall, but I have a titanium skeleton and a genius computer brain! I arrived on July fourth, nineteen ninety-seven, tucked inside the Mars Pathfinder lander, and proved that small, agile rovers could conquer other worlds!",
                "audioPenguin": "audio/en/cp_sojourner_opc_1a.mp3",
                "audioReply": "audio/en/sojourner_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "🛞 Why do you have six funny metal wheels with spikes on them?",
                "penguinText": "How did you land here without retro-rockets on your wheels?",
                "reply": "My mothership Pathfinder had the coolest landing in history! We did not use hard landing legs: we inflated a cocoon of giant airbags and bounced across Mars like a runaway basketball over fifteen times! Once we stopped, the petals opened up, and I drove down the ramp onto the red sand!",
                "audioPenguin": "audio/en/cp_sojourner_opc_1b.mp3",
                "audioReply": "audio/en/sojourner_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "🎈 Did you really bounce onto Mars inside a giant cluster of airbags?",
                "penguinText": "Do you have six wheels so you can race across the sand at supersonic speed?",
                "reply": "Ha, ha! I'm definitely not a race car! My top speed is just one centimeter per second—a snail could beat me in a sprint! But my six wheels use a rocker-bogie suspension system: like an all-terrain skateboard with insect legs! When one wheel climbs over a big rock, the other five adjust automatically to keep me stable without ever tipping over!",
                "audioPenguin": "audio/en/cp_sojourner_opc_1c.mp3",
                "audioReply": "audio/en/sojourner_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "Mounted on my rear, I carried an instrument called the APXS—the Alpha Particle X-Ray Spectrometer! Think of it as my robotic snout. I pressed it right up against Martian rocks, beamed invisible, harmless particles at them, and listened to the atomic echoes to discover whether rocks were volcanic or washed down by ancient rushing floods!",
            "audioUrl": "audio/en/sojourner_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "🔬 What was that sensor instrument mounted on your rear tail?",
                "penguinText": "Did someone drive you in real-time with a video game joystick from Earth?",
                "reply": "Impossible to steer live! Radio signals between Earth and Mars take between ten and twenty minutes to travel at the speed of light. If I saw a cliff and Earth shouted 'Stop!', I'd already be at the bottom! So scientists sent me route plans each morning, and I used laser hazard sensors to navigate around rocks on my own!",
                "audioPenguin": "audio/en/cp_sojourner_opc_2a.mp3",
                "audioReply": "audio/en/sojourner_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ What funny names did the team give to the rocks you explored?",
                "penguinText": "What silly nicknames did scientists give to the rocks you explored?",
                "reply": "NASA scientists have an awesome sense of humor! To remember all the rocks easily, they named them after cartoon characters! I examined a pyramid-shaped rock named 'Yogi Bear', a knobby rock called 'Barnacle Bill', and others named 'Casper', 'Scooby-Doo', and 'Wedge'!",
                "audioPenguin": "audio/en/cp_sojourner_opc_2b.mp3",
                "audioReply": "audio/en/sojourner_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "☀️ How did you survive the bitterly cold Martian nights?",
                "penguinText": "Did your tiny wheels pave the way for bigger monster rovers?",
                "reply": "Yes! I was the baby pioneer! After my success, NASA built Spirit and Opportunity, which were the size of golf carts, and later Curiosity and Perseverance, which are massive monster trucks the size of cars with nuclear lasers! But I was the one who took the very first tire tracks on Mars!",
                "audioPenguin": "audio/en/cp_sojourner_opc_2c.mp3",
                "audioReply": "audio/en/sojourner_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "I operated for eighty-three days, driving over one hundred meters across the red dust. Remember: you do not need to be huge to achieve monumental dreams! Keep rolling forward, Cyberpenguin!",
            "audioUrl": "audio/en/sojourner_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "High-five, little legend! Stamp number four is officially registered in my passport!",
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
            "text": "Radio signal received billions of kilometers away from home! Hello, space explorer Cyberpenguin! Isn't it chilly out here among the stars?",
            "audioUrl": "audio/en/pioneer_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🪐 Hello, Pioneer 10! What historic milestones did you achieve on your journey?",
                "penguinText": "Hello Pioneer ten! What are you doing floating so far away from the Sun?",
                "reply": "I blasted off in March nineteen seventy-two on a daring mission no machine had ever attempted: to be the very first spacecraft to reach Jupiter, the giant king of our solar system! In December nineteen seventy-three, I braved its fierce radiation belts and sent back close-up pictures of its Great Red Spot and giant moons!",
                "audioPenguin": "audio/en/cp_pioneer_opc_1a.mp3",
                "audioReply": "audio/en/pioneer_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "📡 Why do you have that enormous satellite dish on your front?",
                "penguinText": "Whoa, that is one gigantic umbrella mounted on your body!",
                "reply": "Ha, ha! It is not a rain umbrella! It's my high-gain parabolic antenna, almost three meters wide. Because I traveled so far away from Earth, my radio signals grew as faint as a whisper. I needed this giant dish to beam my messages directly back to the huge listening ears of NASA's Deep Space Network on Earth!",
                "audioPenguin": "audio/en/cp_pioneer_opc_1b.mp3",
                "audioReply": "audio/en/pioneer_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "⚡ What powers your instruments so far away where the Sun looks like a faint star?",
                "penguinText": "Weren't you terrified of smashing into rocks in the asteroid belt?",
                "reply": "Science fiction movies always show the asteroid belt as a chaotic obstacle course where ships crash every two seconds! But when I became the first probe to cross it in nineteen seventy-two, I proved the truth: space is unfathomably huge! Asteroids are separated by millions of kilometers. Crossing it was as smooth and peaceful as sailing an open sea!",
                "audioPenguin": "audio/en/cp_pioneer_opc_1c.mp3",
                "audioReply": "audio/en/pioneer_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "I flew so far that sunlight dwindled to a tiny bright speck, so solar panels were completely useless. I carried RTG nuclear batteries for nonstop heat and electricity. My final whisper back to Earth was detected on January twenty-third, two thousand and three, when I was over twelve billion kilometers away—it took over eleven hours for that radio signal to reach Earth traveling at the speed of light!",
            "audioUrl": "audio/en/pioneer_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "📜 Tell me about the famous golden plaque attached to your frame!",
                "penguinText": "I noticed a polished gold plaque bolted to your frame... what does it mean?",
                "reply": "It is my greatest cosmic treasure! A gold-anodized plaque designed by Carl Sagan and Linda Salzman Sagan. It features drawings of a human man and woman greeting in peace, our solar system map, and a map of pulsars—cosmic lighthouse stars that pulse like precise clocks. Any intelligent civilization that finds me can decode it and find Earth!",
                "audioPenguin": "audio/en/cp_pioneer_opc_2a.mp3",
                "audioReply": "audio/en/pioneer_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ Were scientists scared you would crash into asteroids when crossing the belt?",
                "penguinText": "Where are you heading now that your batteries have gone to sleep?",
                "reply": "Because there is no air resistance in the vacuum of space, I will drift forever without slowing down! I am silently coasting toward the red giant star Aldebaran, located in the constellation Taurus. It will take me about two million years to get there—a patient cosmic message in a bottle!",
                "audioPenguin": "audio/en/cp_pioneer_opc_2b.mp3",
                "audioReply": "audio/en/pioneer_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "🌌 Where are you heading now, and how far have you traveled?",
                "penguinText": "What did it feel like to fly right past the colossal giant Jupiter?",
                "reply": "I felt a breathtaking, colossal pull! Jupiter is so gargantuan that its immense gravity acted like an invisible cosmic slingshot. It whipped me around its clouds, dramatically increased my velocity, and flung me straight toward the edge of our solar system!",
                "audioPenguin": "audio/en/cp_pioneer_opc_2c.mp3",
                "audioReply": "audio/en/pioneer_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "Even though my radios are silent, I carry humanity's greeting across the interstellar void. Keep your gaze fixed on the stars, Cyberpenguin!",
            "audioUrl": "audio/en/pioneer_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "Safe travels, eternal voyager! Stamp number five is proudly shining in my passport!",
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
            "text": "Watch your steps, Cyberpenguin! Gravity here on asteroid Eros is so weak that if you sneeze too hard, you might launch yourself right into outer space!",
            "audioUrl": "audio/en/near_saludo.mp3"
          },
          "decision1": {
            "choices": [
              {
                "id": "1a",
                "label": "🥔 Hello, NEAR Shoemaker! What makes Asteroid Eros so weird and interesting?",
                "penguinText": "Hello NEAR Shoemaker! Why does this asteroid look like a giant potato?",
                "reply": "Ha, ha! Eros is thirty-four kilometers long and looks just like a giant floating potato or peanut! Do you know why huge planets like Earth are round? Because their gravity is massive enough to squeeze everything equally toward the center like rolling playdough into a sphere. But Eros is small and lightweight, so its weak gravity never rounded it out, leaving it a bumpy, elongated rock!",
                "audioPenguin": "audio/en/cp_near_opc_1a.mp3",
                "audioReply": "audio/en/near_resp_1a.mp3"
              },
              {
                "id": "1b",
                "label": "🧲 How did you orbit a peanut-shaped rock without getting flung into space?",
                "penguinText": "Are you an orbiter or a lander? I don't see any landing legs!",
                "reply": "That is the most amazing twist of my mission: I was NEVER built to land! I had no landing legs, no shock absorbers, and no airbags. I was designed strictly as an orbital satellite to circle Eros from high above and take photos from orbit!",
                "audioPenguin": "audio/en/cp_near_opc_1b.mp3",
                "audioReply": "audio/en/near_resp_1b.mp3"
              },
              {
                "id": "1c",
                "label": "🪨 Did you find any impact craters or strange surface features on Eros?",
                "penguinText": "How did you track down such a small rock in the middle of vast space?",
                "reply": "I launched in nineteen ninety-six, flew past asteroid Mathilde in nineteen ninety-seven, and on February fourteenth, two thousand—Valentine's Day!—I became the first spacecraft in human history to slip into orbit around an asteroid. It was a true cosmic love story with a space rock!",
                "audioPenguin": "audio/en/cp_near_opc_1c.mp3",
                "audioReply": "audio/en/near_resp_1c.mp3"
              }
            ]
          },
          "commonBridge": {
            "speaker": "machine",
            "text": "I carried six elite science instruments: multispectral cameras, spectrometers to sniff out mineral chemistry, and a laser rangefinder. How did my laser work? It fired rapid pulses of light down at the rocks and clocked how long they took to bounce back, mapping every ridge, boulder, and crater in three-D like a video game!",
            "audioUrl": "audio/en/near_puente_clave.mp3"
          },
          "decision2": {
            "choices": [
              {
                "id": "2a",
                "label": "🛬 How did you manage to land on an asteroid with zero landing gear?",
                "penguinText": "If you didn't have landing legs, how did you end up sitting on the ground?",
                "reply": "On February twelfth, two thousand and one, NASA engineers hatched an audacious idea: 'What if we try to gently nudge her down to the surface using her tiny gas thrusters?' We fired thrusters in gentle pulses, slowing our descent until we touched the ground at less than six kilometers per hour—slower than a kid walking in a school hallway! I rested on the tips of my solar panels like a cosmic ballet dancer! I was the first spacecraft ever to land on an asteroid!",
                "audioPenguin": "audio/en/cp_near_opc_2a.mp3",
                "audioReply": "audio/en/near_resp_2a.mp3"
              },
              {
                "id": "2b",
                "label": "⭐ What was your name honoring, and why was it so meaningful?",
                "penguinText": "Where did your name Shoemaker come from?",
                "reply": "Originally, my name was just NEAR, which stood for Near Earth Asteroid Rendezvous. But NASA renamed me to honor Eugene Shoemaker, a legendary geologist who revolutionized science by proving that craters on Earth, the Moon, and planets were carved by asteroid and comet impacts over billions of years!",
                "audioPenguin": "audio/en/cp_near_opc_2b.mp3",
                "audioReply": "audio/en/near_resp_2b.mp3"
              },
              {
                "id": "2c",
                "label": "🔬 What did your gamma-ray and infrared spectrometers discover on Eros?",
                "penguinText": "Did you crash and shatter when you hit the asteroid?",
                "reply": "To the sheer amazement of engineers on Earth, I didn't break at all! I survived the touchdown intact, kept transmitting clear radio signals from the surface for over two weeks, and measured the asteroid's composition up close until my mission was complete!",
                "audioPenguin": "audio/en/cp_near_opc_2c.mp3",
                "audioReply": "audio/en/near_resp_2c.mp3"
              }
            ]
          },
          "closing": {
            "speaker": "machine",
            "text": "We proved that with curiosity, courage, and clever engineering, humans can explore even the most unusual worlds. Never stop asking questions, Cyberpenguin!",
            "audioUrl": "audio/en/near_despedida.mp3"
          },
          "farewellPenguin": {
            "speaker": "penguin",
            "text": "Thank you, daring NEAR! You are the sixth and final golden stamp in my passport!",
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
    "text": "Always remember this great cosmic secret: Curiosity is the most powerful fuel of every great explorer! As long as there are questions to ask, stars to gaze at in the night sky, and curious minds like yours, the adventure will never end. See you in the next galaxy! Engines engaged in three... two... one... BLAST OFFFF!",
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
