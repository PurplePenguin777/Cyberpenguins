# 🎙️ GUION TÉCNICO Y CASTING DE VOCES PARA ELEVENLABS
## *Proyecto: Cyberpenguins (Misiones Espaciales de la NASA)*

---

## ⚙️ 1. GUÍA DE CONFIGURACIÓN GENERAL EN ELEVENLABS

- **Modelo recomendado en ElevenLabs:** `Eleven Multilingual v2` (óptimo para español con riqueza emocional) o `Eleven Turbo v2.5` (si se busca generación ultrarrápida o en tiempo real).
- **Idioma del texto:** Español neutro internacional / latinoamericano, accesible, cálido y dinámico para público infantil de 8 a 12 años.
- **Consejo de post-producción (Opcional pero recomendado):**
  - Para **Eagle (Apollo 11)**: aplicar un filtro paso banda suave (*radio walkie-talkie / NASA quindar beep*) de 300 Hz a 3.5 kHz con sutil estática cósmica.
  - Para **Surveyor 1 y Sojourner**: añadir un ligero efecto *ring-modulator* o *chorus metálico* sutil para enfatizar su naturaleza robótica.

---

## 🎭 2. CASTING Y PERFILES DE VOZ (SETTINGS POR PERSONAJE)

| Personaje | Voz Seleccionada | Voice ID | Tipo / Arquetipo | Ajustes Recomendados (Stability / Similarity / Style) | Tono e Intención Actoral |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cyberpenguin** | Leo – Curious Character | `ihKwLOjVUMG4lgUI6meZ` | Niño explorador curioso | Stability: `0.38`<br>Similarity: `0.78`<br>Style: `0.45` | Muy expresivo, asombrado, juguetón y entusiasta. |
| **Surveyor 3** | Marco | `JZeTbA8jDZKTeMBPNXrK` | Robot vintage servicial | Stability: `0.55`<br>Similarity: `0.75`<br>Style: `0.30` | Pausas metódicas, limpio, educado. Sonido "bip bip". |
| **Eagle (Apollo 11)** | César Augusto – Spanish Neutral | `hAUJJty85xYTBnGyEWzw` | Comandante espacial épico | Stability: `0.65`<br>Similarity: `0.80`<br>Style: `0.25` | Calmo, noble, confiable, heroico de la NASA. |
| **Viking 1** | Natalia – Doblaje Versátil | `zJtOCbdQjTZt7YZtkRDP` | Laboratorio científico marciano | Stability: `0.50`<br>Similarity: `0.75`<br>Style: `0.35` | Elegante, analítica, apasionada de la ciencia. |
| **Sojourner Rover** | Betty – Quirky, Cartoonish & Warm | `iV6xDQ4wcM3ZcXDx30GB` | Robot travieso hiperactivo | Stability: `0.35`<br>Similarity: `0.75`<br>Style: `0.55` | Rápida, simpática, tierna, orgullosa de sus 6 ruedas. |
| **Pioneer 10** | Hanna – Warm, Deep, Inspiring | `c338PHkXJ2cW8fdMPhzP` | Viajera cósmica sabia | Stability: `0.68`<br>Similarity: `0.82`<br>Style: `0.20` | Ritmo pausado, suave, cálida, poética hacia las estrellas. |
| **NEAR Shoemaker** | Jorge | `MXbNlTMQcU6GZQlRkXHB` | Nave audaz y divertida | Stability: `0.45`<br>Similarity: `0.75`<br>Style: `0.40` | Alegre, chistosa, orgullosa de su alunizaje sin patas. |
| **IA de la Nave** | Paulina – Cálida y Comercial | `A9OFofjAh6JEy1MNk5Mz` | Asistente de vuelo holográfica | Stability: `0.60`<br>Similarity: `0.80`<br>Style: `0.20` | Pulcra, moderna, reconfortante y profesional. |

---

# 📜 3. GUION DE PRODUCCIÓN LÍNEA POR LÍNEA (CUE SHEET)

> **Instrucciones para generar en ElevenLabs:**
> 1. Copia el texto que está entre comillas en la casilla de texto de ElevenLabs.
> 2. Guárdalo con el nombre de archivo indicado en `[ID de Archivo]` dentro de la carpeta `audio/` del proyecto.
> 3. Las anotaciones entre corchetes `[como esta]` son indicaciones de actuación para orientar la entonación.

---

## 🌕 CAPÍTULO 1: LA LUNA

### 💭 Monólogos Ambientales de Cyberpenguin (La Luna)

- **[ID: `cp_luna_salto.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Riendo mientras salta en gravedad lunar, pura emoción infantil]*  
  > "¡Wiiiiii! ¡La gravedad aquí es solo un sexto de la gravedad de la Tierra! ¡Con mis patitas de pingüino puedo dar saltos gigantescos sin despeinarme!"

- **[ID: `cp_luna_regolito.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Curioso, mirando el suelo, explicando a los niños]*  
  > "El suelo está cubierto de regolito: un polvo gris finísimo como talco, pero afilado como diminutos trozos de cristal porque no hay viento que lo pula."

- **[ID: `cp_luna_cielo.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Maravillado, mirando la Tierra azul a la distancia]*  
  > "¡El cielo es completamente negro aunque sea de día! Como la Luna no tiene atmósfera, no hay aire que disperse la luz del Sol. ¡Y allá a lo lejos se ve la Tierra como una canica azul brillante!"

---

### 📡 SURVEYOR 3 (Misión 1)

- **[ID: `surveyor_saludo.mp3`]**  
  **Personaje:** Surveyor 3  
  **Dirección:** *[Tono robótico alegre de los años 60, con energía]*  
  > "¡Bip, biiip! ¡Alerta de sensores! ¡Detecto un visitante emplumado en mis patas! ¡Hola, pequeño viajero! ¿Vienes de la Tierra?"

#### 🎮 Rama 1 (Opciones de Cyberpenguin):
- **[ID: `cp_surveyor_opc_a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Cortés y curioso]*  
  > "¡Hola! Soy Cyberpenguin. ¿Tú quién eres y qué haces parada aquí?"

- **[ID: `cp_surveyor_opc_b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Sorprendido, gracioso, observando]*  
  > "¡Aaaah, un robot de tres patas! ¿Y por qué tienes ese brazo con una palita?"

- **[ID: `cp_surveyor_opc_c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Curioso y divertido]*  
  > "¿Es verdad que rebotaste como una pelota cuando aterrizaste?"

#### 🗣️ Respuestas de Surveyor 3 a la Rama 1:
- **[ID: `surveyor_resp_1a.mp3`]**  
  **Personaje:** Surveyor 3  
  **Dirección:** *[Orgullosa e informativa]*  
  > "¡Mucho gusto, Cyberpenguin! Soy Surveyor 3, la nave robótica que la NASA envió en abril de 1967. ¡Fui enviada a este cráter para investigar el suelo lunar y preparar el camino para los astronautas del programa Apollo!"

- **[ID: `surveyor_resp_1b.mp3`]**  
  **Personaje:** Surveyor 3  
  **Dirección:** *[Risas mecánicas, orgullosa de su herramienta]*  
  > "¡Qué buen ojo tienes! Soy la primera nave de la historia con una pala robótica en la Luna. Con mi motor eléctrico la estiraba y raspaba la tierra como si jugara en un arenero gigante para medir qué tan duro era el terreno."

- **[ID: `surveyor_resp_1c.mp3`]**  
  **Personaje:** Surveyor 3  
  **Dirección:** *[Divertida, contando una anécdota simpática]*  
  > "¡Ja, ja, ja! ¡Totalmente cierto! Cuando llegué el veinte de abril de 1967, las rocas reflejaron mi radar y mis pequeños cohetes no se apagaron a tiempo. ¡Reboté dos veces sobre la Luna como en un trampolín antes de quedarme quieta!"

#### 🔄 Conexión Narrativa Común (Surveyor 3):
- **[ID: `surveyor_puente_clave.mp3`]**  
  **Personaje:** Surveyor 3  
  **Dirección:** *[Explicativa, pedagógica y clara]*  
  > "Antes de que los astronautas bajaran a caminar, los científicos necesitaban saber si el suelo aguantaría su peso o si se hundirían como en arena movediza. ¡Con mi pala cavé cuatro zanjas y apreté el polvo para demostrar que era firme y seguro!"

#### 🎮 Rama 2 (Opciones de Cyberpenguin):
- **[ID: `cp_surveyor_opc_2a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Interesado en la tecnología de imagen]*  
  > "¿Y cuántas fotos tomaste con tu cámara de televisión?"

- **[ID: `cp_surveyor_opc_2b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Asombrado por el encuentro histórico]*  
  > "¿Es verdad que luego vinieron astronautas a visitarte en persona?"

- **[ID: `cp_surveyor_opc_2c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Intrigado por el experimento]*  
  > "¿Y qué aprendieron los científicos al llevarse tus piezas a la Tierra?"

#### 🗣️ Respuestas de Surveyor 3 a la Rama 2 (Secretos NASA):
- **[ID: `surveyor_resp_2a.mp3`]**  
  **Personaje:** Surveyor 3  
  **Dirección:** *[Feliz, presumiendo su cámara]*  
  > "¡Tomé más de seis mil trescientas fotografías en blanco y negro! Fotografié las rocas, las zanjas que cavé con mi pala e incluso tomé una foto histórica de un eclipse solar donde la Tierra tapó al Sol vista desde la Luna."

- **[ID: `surveyor_resp_2b.mp3`]**  
  **Personaje:** Surveyor 3 (⭐ *Secreto Apollo 12*)  
  **Dirección:** *[Entusiasmada, contando su mayor momento histórico]*  
  > "¡Bip-bip! ¡Sí, vinieron a visitarme a MÍ en persona! En noviembre de 1969, los astronautas del Apollo 12 aterrizaron su módulo Intrepid a solo ciento sesenta metros de distancia y vinieron caminando hasta aquí. ¡Pete Conrad y Alan Bean me examinaron y se llevaron mi cámara a la Tierra para estudiar cómo el metal aguanta dos años en el espacio!"

- **[ID: `surveyor_resp_2c.mp3`]**  
  **Personaje:** Surveyor 3 (⭐ *Secreto Ciencia de Materiales*)  
  **Dirección:** *[Asombrada, explicando la ciencia de su retorno]*  
  > "¡Fue la única vez en la historia que piezas dejadas en otro mundo regresaron a un laboratorio terrestre! Descubrieron cómo la radiación, el polvo y el vacío del espacio desgastan los cables y la pintura, ayudando a diseñar naves y trajes espaciales mucho más seguros."

#### 🎯 Cierre de Surveyor 3:
- **[ID: `surveyor_despedida.mp3`]**  
  **Personaje:** Surveyor 3  
  **Dirección:** *[Cálida, satisfecha de su deber cumplido]*  
  > "Transmití datos hasta mayo de 1967, pero mi mayor orgullo fue ayudar a los astronautas a pisar la Luna con seguridad. ¡Sigue explorando con valentía, Cyberpenguin!"

- **[ID: `cp_surveyor_gracias.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Agradecido y contento con su sello]*  
  > "¡Gracias, valiente Surveyor 3! ¡Te ganaste el primer sello lunar en mi pasaporte!"

---

### 🦅 MÓDULO LUNAR EAGLE (Apollo 11 - Misión 2)

- **[ID: `eagle_saludo.mp3`]**  
  **Personaje:** Eagle  
  **Dirección:** *[Voz serena, solemne y cálida, con aire de comandante legendario]*  
  > "¡Saludos, Cyberpenguin! ¡Bienvenido a la Base Tranquilidad! Estás parado en el sitio más histórico de la Luna."

#### 🎮 Rama 1 (Opciones de Cyberpenguin):
- **[ID: `cp_eagle_opc_1a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Voz de niño fanático, maravillado]*  
  > "¡No puede ser! ¿Tú eres el legendario Eagle del Apollo 11?"

- **[ID: `cp_eagle_opc_1b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Divertido, observador]*  
  > "¡Wow, pareces cubierto de papel de chocolate dorado! ¿Por qué brillas tanto?"

- **[ID: `cp_eagle_opc_1c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Curioso, mirando hacia adentro]*  
  > "¿Dónde están tus astronautas? ¿Están durmiendo la siesta adentro?"

#### 🗣️ Respuestas de Eagle a la Rama 1:
- **[ID: `eagle_resp_1a.mp3`]**  
  **Personaje:** Eagle  
  **Dirección:** *[Épico, rememorando el despegue]*  
  > "¡El mismo que viste y calza! El veinte de julio de 1969 traje a Neil Armstrong y Buzz Aldrin hasta aquí. Fuimos impulsados desde la Tierra por el gigantesco cohete Saturno V, ¡un cohete tan alto como un edificio de treinta y seis pisos!"

- **[ID: `eagle_resp_1b.mp3`]**  
  **Personaje:** Eagle (⭐ *Secreto Mylar/Kapton*)  
  **Dirección:** *[Risa amigable, explicando la ciencia]*  
  > "¡Ja, ja! ¡Muchos niños creen que es papel de regalo! En realidad son mantas térmicas de alta tecnología llamadas Kapton y Mylar. ¿Has visto esas sábanas metálicas doradas que usan los rescatistas de emergencia? En la Luna no hay aire: bajo el Sol el metal se calienta a más de ciento veinte grados y en la sombra baja a ciento cincuenta bajo cero. Esas mantas reflejaban el calor como un termo gigante para que Neil y Buzz estuvieran cómodos y seguros."

- **[ID: `eagle_resp_1c.mp3`]**  
  **Personaje:** Eagle  
  **Dirección:** *[Afectuoso con sus tres tripulantes]*  
  > "¡Ya regresaron sanos y salvos a la Tierra hace muchos años! Pero éramos tres compañeros: Neil y Buzz bajaron conmigo a la superficie, mientras Michael Collins cuidaba la nave nodriza Columbia en órbita esperando nuestro regreso."

#### 🔄 Conexión Narrativa Común (Eagle):
- **[ID: `eagle_puente_clave.mp3`]**  
  **Personaje:** Eagle  
  **Dirección:** *[Claro y didáctico]*  
  > "Mi cuerpo estaba dividido en dos partes: la etapa de descenso, que es la parte dorada de abajo con patas que sirvió como base de despegue y se quedó para siempre aquí; y la etapa de ascenso, que fue la cabina superior que encendió su propio motor como un cohete para devolver a los astronautas al espacio. ¡Trabajaron en equipo perfecto!"

#### 🎮 Rama 2 (Opciones de Cyberpenguin):
- **[ID: `cp_eagle_opc_2a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Fascinado]*  
  > "¿Qué hicieron Neil y Buzz mientras caminaban aquí afuera?"

- **[ID: `cp_eagle_opc_2b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Intrigado]*  
  > "¿El aterrizaje fue tan fácil como apretar un botón automático?"

- **[ID: `cp_eagle_opc_2c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Mirando al suelo]*  
  > "Veo unos aparatos con espejos y paneles solares sobre el suelo... ¿qué son?"

#### 🗣️ Respuestas de Eagle a la Rama 2 (Secretos NASA):
- **[ID: `eagle_resp_2a.mp3`]**  
  **Personaje:** Eagle  
  **Dirección:** *[Orgullo sereno]*  
  > "Caminaron durante más de dos horas y media, tomaron fotos, clavaron la bandera de Estados Unidos y recolectaron casi veintidós kilos de rocas y polvo lunar usando palas y pinzas especiales para llevar a los laboratorios de la Tierra."

- **[ID: `eagle_resp_2b.mp3`]**  
  **Personaje:** Eagle (⭐ *Secreto Alarma 1202 y Combustible*)  
  **Dirección:** *[Con emoción y tensión dramática bien contada]*  
  > "¡Ufff, casi no lo logramos! Durante el descenso, la computadora se sobrecargó de tareas y saltó la alarma doce cero dos, ¡igual que cuando abres demasiadas aplicaciones en una tableta y se traba! El piloto automático nos llevaba directo a un cráter lleno de rocas tan grandes como automóviles. Neil Armstrong tomó los controles manuales como en un videojuego, voló buscando un sitio plano y aterrizamos cuando quedaban apenas ¡menos de cuarenta segundos de combustible! ¡Se nos acababa la gasolina espacial!"

- **[ID: `eagle_resp_2c.mp3`]**  
  **Personaje:** Eagle (⭐ *Secreto Espejos Láser EASEP*)  
  **Dirección:** *[Fascinado por el legado que sigue activo]*  
  > "¡Excelente vista! Dejamos el paquete científico EASEP con unos espejos reflectores muy especiales. ¿Conoces los ojos de gato que llevan las bicicletas en las ruedas? ¡Reflejan la luz directo hacia quien los alumbra! Hoy en día, los científicos disparan rayos láser desde la Tierra hacia esos espejos en la Luna. Midiendo el tiempo que tarda la luz en rebotar, sabemos la distancia exacta a la Luna al milímetro."

#### 🎯 Cierre de Eagle:
- **[ID: `eagle_despedida.mp3`]**  
  **Personaje:** Eagle  
  **Dirección:** *[Conmovedor y memorable]*  
  > "La huella de Neil y Buzz quedó marcada para la eternidad. Pero el mensaje más hermoso es la placa en mi pata delantera: 'Vinimos en son de paz en nombre de toda la humanidad'."

- **[ID: `cp_eagle_gracias.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Con voz triunfal]*  
  > "¡Un gran paso para un pingüino y un salto gigantesco para la exploración! ¡Segundo sello conseguido!"

---

## 🔴 CAPÍTULO 2: MARTE

### 💭 Monólogos Ambientales de Cyberpenguin (Marte)

- **[ID: `cp_marte_cielo.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Mirando al cielo marciano con extrañeza]*  
  > "¡Qué raro! En la Tierra el cielo es azul, pero aquí en Marte tiene un color salmón anaranjado... ¡Es por las diminutas partículas de polvo de óxido de hierro suspendidas en el aire!"

- **[ID: `cp_marte_frio.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Tiritando de frío cósmico]*  
  > "¡Brrrr! ¡Incluso para un pingüino del polo sur, Marte es heladísimo! Puede llegar a ochenta grados bajo cero por la noche. Y el aire es tan fino que es casi puro dióxido de carbono. ¡Menos mal tengo mi casco espacial hermético!"

- **[ID: `cp_marte_rocas.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Observando el suelo rojo]*  
  > "¡Todo aquí es rojo oxidado! Es como si a un planeta entero le hubiera caído polvo de ladrillo o cocoa vieja."

---

### 🧪 VIKING 1 (Lander - Misión 3)

- **[ID: `viking_saludo.mp3`]**  
  **Personaje:** Viking 1  
  **Dirección:** *[Voz de científica alegre y formal con toques mecánicos]*  
  > "¡Detecto una lectura biológica inusual! ¡Picos, plumas y traje espacial! ¡Bienvenido a Marte, Cyberpenguin!"

#### 🎮 Rama 1 (Opciones de Cyberpenguin):
- **[ID: `cp_viking_opc_1a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Interesado]*  
  > "¡Hola Viking 1! ¿Tú fuiste la primera nave en llegar a Marte?"

- **[ID: `cp_viking_opc_1b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Susurrando conspirativo, divertido]*  
  > "¡Rápido, dime la verdad! ¿Encontraste marcianitos verdes con antenas?"

- **[ID: `cp_viking_opc_1c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Señalando el brazo]*  
  > "¿Por qué tienes ese brazo tan largo terminado en palita?"

#### 🗣️ Respuestas de Viking 1 a la Rama 1:
- **[ID: `viking_resp_1a.mp3`]**  
  **Personaje:** Viking 1  
  **Dirección:** *[Con orgullo científico]*  
  > "¡Fui la primera nave estadounidense en aterrizar con total éxito en Marte y sobrevivir para enviar datos! Aterricé el veinte de julio de 1976, ¡justo siete años después de que los humanos pisaran la Luna! Y mi misión era doble: mientras mi Orbitador tomaba fotos desde las alturas como un satélite espía amigable, yo aterricé aquí abajo para oler, raspar y probar el suelo marciano."

- **[ID: `viking_resp_1b.mp3`]**  
  **Personaje:** Viking 1 (⭐ *El Misterio de la Vida*)  
  **Dirección:** *[Riendo amablemente, explicando con rigor]*  
  > "¡Ja, ja, ja! ¡Nada de hombrecitos verdes ni ciudades alienígenas! Mis sensores buscaron microbios o pequeñas bacterias en el polvo, pero no encontramos vida. ¡Eso sí, descubrí algo fascinante! El suelo marciano tiene químicos súper agresivos, muy parecidos al agua oxigenada con la que nos curan los raspones. Esos químicos actúan como un desinfectante gigante que destruye cualquier rastro biológico. ¡Así aprendimos que para un ser vivo, la superficie de Marte es un lugar muy difícil!"

- **[ID: `viking_resp_1c.mp3`]**  
  **Personaje:** Viking 1  
  **Dirección:** *[Emocionada con su excavadora]*  
  > "¡Es mi brazo mecánico de tres metros! En la punta llevaba una pala con un pequeño motor para raspar el suelo como si fuera una cuchara en un tazón de cereal. Recogía tierrita marciana y la soltaba por unos embudos en mi lomo directo a mis hornos científicos en miniatura."

#### 🔄 Conexión Narrativa Común (Viking 1):
- **[ID: `viking_puente_clave.mp3`]**  
  **Personaje:** Viking 1  
  **Dirección:** *[Con gracia ante un nombre complejo]*  
  > "En mi interior llevaba un aparato con nombre de trabalenguas: el GCMS, o Cromatógrafo de Gases y Espectrómetro de Masas. Para entenderlo fácil: ¡imagina un hornito de cocina espacial! Mi brazo echaba una cucharadita de tierra marciana en un tubito, el hornito la calentaba y luego olía los vaporcitos que soltaba. Así pudimos descubrir qué minerales y gases componen el suelo del planeta rojo."

#### 🎮 Rama 2 (Opciones de Cyberpenguin):
- **[ID: `cp_viking_opc_2a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Curioso]*  
  > "¿Cómo soportaste tanto frío durante años?"

- **[ID: `cp_viking_opc_2b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Ojos abiertos de asombro]*  
  > "¿Tuviste que enfrentar tormentas de arena?"

- **[ID: `cp_viking_opc_2c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Dudoso]*  
  > "¿Tu misión duró unos pocos días?"

#### 🗣️ Respuestas de Viking 1 a la Rama 2 (Secretos NASA):
- **[ID: `viking_resp_2a.mp3`]**  
  **Personaje:** Viking 1 (⭐ *Secreto RTG Nuclear*)  
  **Dirección:** *[Didáctica e interesante]*  
  > "¡No usé paneles solares porque las tormentas de polvo marciano los habrían cubierto de tierra como una persiana cerrada! En su lugar, llevé dos baterías especiales llamadas RTG. ¿El truco? Adentro tenían una cápsula que produce calor continuo, como una fogata atómica segura. Ese calor se convertía en electricidad para no congelarme nunca. ¡Eran como dos termos mágicos que me daban energía de día y de noche!"

- **[ID: `viking_resp_2b.mp3`]**  
  **Personaje:** Viking 1 (⭐ *Secreto Megatormentas*)  
  **Dirección:** *[Impresionada recordando el viento marciano]*  
  > "¡Uff, vi tormentas monstruosas! En Marte, a veces una pequeña tormenta crece tanto que el polvo cubre todo el planeta durante semanas y tapa el Sol por completo, como si cayera una niebla rojiza gigante. Con mi estación del clima medí vientos de hasta ciento veinte kilómetros por hora, pero como el aire marciano es tan finito y ligero, ¡el viento apenas te empujaría como una suave brisa en la Tierra!"

- **[ID: `viking_resp_2c.mp3`]**  
  **Personaje:** Viking 1 (⭐ *Secreto 6 Años de Longevidad*)  
  **Dirección:** *[Súper orgullosa de su récord]*  
  > "¡Para nada! Los ingenieros de la NASA pensaron que yo duraría solo noventa días... ¡pero fui tan fuerte que trabajé durante más de seis años enteros! Envié miles de fotos e informes del clima hasta noviembre de 1982. ¡Fui el robot más resistente y madrugador de Marte en el siglo veinte!"

#### 🎯 Cierre de Viking 1:
- **[ID: `viking_despedida.mp3`]**  
  **Personaje:** Viking 1  
  **Dirección:** *[Inspiradora]*  
  > "Gracias a mis mediciones, los científicos aprendieron cómo aterrizar rovers con ruedas. ¡Yo me quedé quieto, pero abrí el camino a los vehículos que se mueven!"

- **[ID: `cp_viking_gracias.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Alegre]*  
  > "¡Eres todo un héroe del laboratorio espacial, Viking 1! ¡Tercer sello al pasaporte!"

---

### 🚙 SOJOURNER ROVER (Mars Pathfinder - Misión 4)

- **[ID: `sojourner_saludo.mp3`]**  
  **Personaje:** Sojourner Rover  
  **Dirección:** *[Voz aguda, simpatiquísima y veloz de robot pequeño]*  
  > "¡Cuidado con mis rueditas, pingüino amigo! ¡Paso a un centímetro por segundo! ¡Soy Sojourner, el primer rover de la historia en Marte!"

#### 🎮 Rama 1 (Opciones de Cyberpenguin):
- **[ID: `cp_sojourner_opc_1a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Con ternura y una risita]*  
  > "¡Aaaay, pero qué tierno eres! ¡Pareces un juguete a control remoto!"

- **[ID: `cp_sojourner_opc_1b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Asombrado]*  
  > "¿Cómo llegaste hasta aquí si no tienes cohetes propios?"

- **[ID: `cp_sojourner_opc_1c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Curioso]*  
  > "¿Tienes seis ruedas para correr a toda velocidad?"

#### 🗣️ Respuestas de Sojourner a la Rama 1:
- **[ID: `sojourner_resp_1a.mp3`]**  
  **Personaje:** Sojourner Rover  
  **Dirección:** *[Haciéndose el rudo con tono tierno]*  
  > "¡Oye, que peso diez kilos y medio y mido solo sesenta y cinco centímetros, pero llevo un cerebro de titanio! Llegué el cuatro de julio de 1997 con la misión Mars Pathfinder. ¡Demostré que los rovers pequeños podían explorar otros mundos con mucha agilidad!"

- **[ID: `sojourner_resp_1b.mp3`]**  
  **Personaje:** Sojourner Rover (⭐ *Secreto Airbags Gigantes*)  
  **Dirección:** *[Divertidísimo recreando los rebotes]*  
  > "¡Mi nave nodriza Pathfinder fue genial! Para aterrizar no usamos patas duras: ¡nos inflamos dentro de un capullo gigante de bolsas de aire y rebotamos sobre Marte como una pelota de baloncesto más de quince veces hasta detenernos! Luego los pétalos se abrieron y bajé por una rampita."

- **[ID: `sojourner_resp_1c.mp3`]**  
  **Personaje:** Sojourner Rover (⭐ *Secreto Suspensión Rocker-Bogie*)  
  **Dirección:** *[Risas de robot, muy gráfico]*  
  > "¡Ja, ja! ¡No soy un bólido de carreras! Mi velocidad máxima es de un centímetro por segundo; ¡un caracol me ganaría en una carrera corta! Pero mis seis ruedas tienen un sistema llamado rocker-bogie: ¡imagina una patineta todoterreno con patas articuladas de insecto! Cuando una rueda trepa una roca grande, las otras cinco se acomodan solitas en el suelo para que mi cuerpo nunca se balancee ni se vuelque."

#### 🔄 Conexión Narrativa Común (Sojourner):
- **[ID: `sojourner_puente_clave.mp3`]**  
  **Personaje:** Sojourner Rover  
  **Dirección:** *[Divertido, mostrando su sensor trasero]*  
  > "En mi parte trasera llevo el APXS, el Espectrómetro de Rayos X y Partículas Alfa. ¡Es como mi nariz robótica! En lugar de oler, lo pego contra las piedras marcianas y les dispara partículas invisibles e inofensivas. Al escuchar el eco de los átomos de la roca, los científicos descubrieron si eran restos de lava volcánica o rocas arrastradas por agua en el pasado remoto."

#### 🎮 Rama 2 (Opciones de Cyberpenguin):
- **[ID: `cp_sojourner_opc_2a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Pensativo]*  
  > "¿Tú manejabas solo o alguien tenía un control remoto en la Tierra?"

- **[ID: `cp_sojourner_opc_2b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Sonriendo con curiosidad]*  
  > "¿Cómo llamaban a las rocas que investigabas?"

- **[ID: `cp_sojourner_opc_2c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Emocionado por los otros robots]*  
  > "¿Gracias a ti vinieron Curiosity y Perseverance?"

#### 🗣️ Respuestas de Sojourner a la Rama 2 (Secretos NASA):
- **[ID: `sojourner_resp_2a.mp3`]**  
  **Personaje:** Sojourner Rover (⭐ *Secreto Retraso de Radio*)  
  **Dirección:** *[Explicando el drama de la distancia]*  
  > "¡Imposible usar un joystick en vivo! Las señales de radio entre la Tierra y Marte tardan entre diez y veinte minutos en viajar a la velocidad de la luz. Si veo un precipicio y en la Tierra me gritan '¡Frena!', ¡para cuando el mensaje me llegue ya me habré caído! Por eso los científicos me mandaban un paquete de rutas en la mañana y yo usaba sensores láser para evitar baches por mí mismo."

- **[ID: `sojourner_resp_2b.mp3`]**  
  **Personaje:** Sojourner Rover (⭐ *Secreto Nombres de Caricaturas*)  
  **Dirección:** *[Contando un chisme divertido con entusiasmo]*  
  > "¡Los científicos de la NASA tienen mucho sentido del humor! Para no aburrirse con números de catálogo, bautizaron a las rocas marcianas con nombres de personajes: ¡analicé una roca con forma de cabeza de oso llamada Yogi, otra piramidal llamada Barnacle Bill, otra llamada Scooby Doo y una plana llamada Casper!"

- **[ID: `sojourner_resp_2c.mp3`]**  
  **Personaje:** Sojourner Rover (⭐ *Secreto Familia de Rovers*)  
  **Dirección:** *[Con tono de abuelito orgulloso pero en voz chiquita]*  
  > "¡Exacto! Yo fui el tatarabuelo de la familia. Sin mí, nunca habrían construido a mis hermanos Spirit y Opportunity, ni a los gigantescos laboratorios del tamaño de autos que vinieron después: Curiosity y Perseverance. ¡Todo empezó con mis seis pequeñas huellas!"

#### 🎯 Cierre de Sojourner:
- **[ID: `sojourner_despedida.mp3`]**  
  **Personaje:** Sojourner Rover  
  **Dirección:** *[Super motivacional y simpático]*  
  > "¡Nunca subestimes a un robot pequeño con grandes sueños espaciales! ¡Choca esas seis ruedas, Cyberpenguin!"

- **[ID: `cp_sojourner_gracias.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Efusivo]*  
  > "¡Chócalas, pequeño titán de Marte! ¡Sello número cuatro en mi pasaporte!"

---

## 🌌 CAPÍTULO 3: ESPACIO PROFUNDO

### 💭 Monólogos Ambientales de Cyberpenguin (Espacio Profundo)

- **[ID: `cp_espacio_gravedad.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Flotando en gravedad cero, voz relajada y feliz]*  
  > "¡Aquí no hay arriba ni abajo! Si muevo las aletas floto como si estuviera nadando en el océano más pacífico del cosmos... ¡pero sin agua!"

- **[ID: `cp_espacio_estrellas.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Con asombro poético ante las estrellas fijas]*  
  > "Desde aquí las estrellas no parpadean nada de nada. En la Tierra titilan porque la atmósfera mueve la luz, ¡pero en el vacío espacial brillan como diamantes firmes y eternos!"

- **[ID: `cp_espacio_cinturon.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Mirando asteroides flotar]*  
  > "¡Millones de rocas espaciales orbitando al Sol! Parecen escombros sobrantes de cuando se construyó el sistema solar hace más de cuatro mil seiscientos millones de años."

---

### 🛰️ PIONEER 10 (Misión 5)

- **[ID: `pioneer_saludo.mp3`]**  
  **Personaje:** Pioneer 10  
  **Dirección:** *[Voz profunda, serena, cálida, de viajera cósmica sabia]*  
  > "¡Señal recibida a miles de millones de kilómetros de casa! ¡Hola, explorador Cyberpenguin! ¿Tienes frío aquí afuera?"

#### 🎮 Rama 1 (Opciones de Cyberpenguin):
- **[ID: `cp_pioneer_opc_1a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Con reverencia]*  
  > "¡Hola Pioneer 10! ¿Qué haces flotando tan lejos del Sol?"

- **[ID: `cp_pioneer_opc_1b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Divertido, mirando la antena]*  
  > "¡Menudo paraguas gigante que tienes ahí puesto!"

- **[ID: `cp_pioneer_opc_1c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Curioso ante el peligro]*  
  > "¿No te dio miedo atravesar el temido cinturón de asteroides?"

#### 🗣️ Respuestas de Pioneer 10 a la Rama 1:
- **[ID: `pioneer_resp_1a.mp3`]**  
  **Personaje:** Pioneer 10  
  **Dirección:** *[Tranquilo y majestuoso]*  
  > "¡Despegué en marzo de 1972 con una misión que nadie había logrado: ser la primera máquina de la humanidad en llegar a Júpiter, el planeta más colosal del sistema solar! Estudié su Gran Mancha Roja, su intensa radiación y sus lunas en diciembre de 1973."

- **[ID: `pioneer_resp_1b.mp3`]**  
  **Personaje:** Pioneer 10  
  **Dirección:** *[Sonrisa serena en la voz]*  
  > "¡Ja, ja! ¡No es un paraguas para la lluvia! Es mi antena de alta ganancia de casi tres metros de diámetro. Como viajé tan lejos de la Tierra, necesitaba una antena parabólica gigante y muy enfocada para que mis débiles señales de radio pudieran ser escuchadas por las estaciones en la Tierra."

- **[ID: `pioneer_resp_1c.mp3`]**  
  **Personaje:** Pioneer 10 (⭐ *Secreto Cinturón de Asteroides*)  
  **Dirección:** *[Revelando una gran verdad cósmica]*  
  > "¡En las películas de ciencia ficción muestran el cinturón de asteroides como un campo minado donde chocas a cada segundo! Pero cuando lo crucé en 1972 demostré la verdad: ¡el espacio es colosalmente gigantesco! Entre un asteroide y el siguiente hay tanta distancia como viajar de un país a otro en la Tierra. Cruzarlo fue tan tranquilo como navegar por un océano despejado, abriendo una autopista segura para todas las naves del futuro."

#### 🔄 Conexión Narrativa Común (Pioneer 10):
- **[ID: `pioneer_puente_clave.mp3`]**  
  **Personaje:** Pioneer 10  
  **Dirección:** *[Conmovedor, transmitiendo la lejanía]*  
  > "Llegué tan lejos que la luz del Sol apenas se ve como un puntito brillante. Por eso no usé paneles solares, sino baterías nucleares RTG: cápsulas térmicas que me daban calor y electricidad continua. Mi última señal llegó a la Tierra el 23 de enero de 2003, cuando estaba a más de doce mil millones de kilómetros. ¡Ese mensaje de radio tardó más de once horas en cruzar el vacío a la velocidad de la luz!"

#### 🎮 Rama 2 (Opciones de Cyberpenguin):
- **[ID: `cp_pioneer_opc_2a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Fascinado]*  
  > "He visto que llevas una placa metálica dorada grabada... ¿qué significa?"

- **[ID: `cp_pioneer_opc_2b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Conmovido]*  
  > "¿Hacia dónde vas ahora que tus baterías se apagaron?"

- **[ID: `cp_pioneer_opc_2c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Ojos como platos]*  
  > "¿Qué se siente pasar al lado de Júpiter?"

#### 🗣️ Respuestas de Pioneer 10 a la Rama 2 (Secretos NASA):
- **[ID: `pioneer_resp_2a.mp3`]**  
  **Personaje:** Pioneer 10 (⭐ *Secreto Placa de Carl Sagan y Púlsares*)  
  **Dirección:** *[Con profunda belleza poética]*  
  > "¡Es mi mayor tesoro! Una placa de oro diseñada por Carl Sagan y su esposa Linda. Muestra a un hombre y una mujer saludando en son de paz, el mapa del sistema solar y unas líneas que salen de un centro: ¡son púlsares! Imagina faros de luz cósmicos que parpadean con un ritmo perfecto como el tic-tac de un reloj. Cualquier civilización inteligente que encuentre mi placa podrá contar esos parpadeos y saber exactamente dónde queda la Tierra en el mapa de la galaxia."

- **[ID: `pioneer_resp_2b.mp3`]**  
  **Personaje:** Pioneer 10 (⭐ *Secreto Rumbo a Aldebarán*)  
  **Dirección:** *[Paz absoluta, eterno viajero]*  
  > "Como en el vacío del espacio no hay aire ni gravedad fuerte que me frene, ¡seguiré flotando para siempre! Ahora viajo en silencio hacia la estrella gigante roja Aldebarán. Tardaré unos dos millones de años en llegar a su vecindario. ¡Soy una auténtica carta dentro de una botella lanzada al océano de las estrellas!"

- **[ID: `pioneer_resp_2c.mp3`]**  
  **Personaje:** Pioneer 10 (⭐ *Secreto Honda Espacial de Júpiter*)  
  **Dirección:** *[Impresionado]*  
  > "¡Sentí una fuerza colosal! Júpiter es tan inmenso que su gravedad atrae todo como un imán gigante. Usé su gravedad para hacer una maniobra de honda espacial: ¡como cuando vas corriendo en patines, te agarras de un poste y sales disparado con más velocidad hacia adelante! Así tomé impulso para volar hacia el espacio exterior."

#### 🎯 Cierre de Pioneer 10:
- **[ID: `pioneer_despedida.mp3`]**  
  **Personaje:** Pioneer 10  
  **Dirección:** *[Emotivo]*  
  > "Aunque mis radios duerman, sigo llevando el saludo de los niños y niñas de la Tierra a las estrellas. ¡No dejes de soñar en grande, Cyberpenguin!"

- **[ID: `cp_pioneer_gracias.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Lleno de admiración]*  
  > "¡Qué orgullo conocerte, embajadora de las estrellas! ¡Quinto sello colocado!"

---

### 🥔 NEAR SHOEMAKER (Asteroide 433 Eros - Misión 6)

- **[ID: `near_saludo.mp3`]**  
  **Personaje:** NEAR Shoemaker  
  **Dirección:** *[Voz alegre, vivaz, pícara y muy divertida]*  
  > "¡Cuidado al caminar, Cyberpenguin! ¡La gravedad aquí en el asteroide Eros es tan débil que si estornudas con fuerza podrías salir volando al espacio!"

#### 🎮 Rama 1 (Opciones de Cyberpenguin):
- **[ID: `cp_near_opc_1a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Riendo]*  
  > "¡Hola NEAR Shoemaker! ¿Por qué este lugar tiene forma de papa gigante?"

- **[ID: `cp_near_opc_1b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Observador]*  
  > "¿Tú eres una nave o un módulo de aterrizaje? ¡No te veo patas!"

- **[ID: `cp_near_opc_1c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Intrigado]*  
  > "¿Cómo llegaste hasta un asteroide tan chiquito en medio de la nada?"

#### 🗣️ Respuestas de NEAR Shoemaker a la Rama 1:
- **[ID: `near_resp_1a.mp3`]**  
  **Personaje:** NEAR Shoemaker  
  **Dirección:** *[Divertido, comiendo palabras]*  
  > "¡Ja, ja! ¡Eros mide treinta y cuatro kilómetros de largo y parece una papa o un cacahuate gigante! ¿Sabes por qué los planetas grandes como la Tierra son redondos? Porque tienen tanta masa y gravedad que aprietan todo hacia el centro como si hicieras una bolita de plastilina con las manos. ¡Pero Eros es tan chiquito y ligero que su gravedad no tuvo fuerza para redondearlo, y se quedó como una roca chueca y alargada!"

- **[ID: `near_resp_1b.mp3`]**  
  **Personaje:** NEAR Shoemaker (⭐ *Secreto Nave sin Patas*)  
  **Dirección:** *[Picarón, revelando el gran misterio]*  
  > "¡Ese es el misterio más asombroso de mi historia! ¡Yo nunca fui diseñada para aterrizar! No tenía patas, ni amortiguadores, ni colchones. Fui construida únicamente para ser un satélite orbitador y tomar fotos desde el aire."

- **[ID: `near_resp_1c.mp3`]**  
  **Personaje:** NEAR Shoemaker  
  **Dirección:** *[Orgulloso]*  
  > "Despegué en 1996. Primero sobrevolé el asteroide Mathilde para tomarle fotos en 1997, y el catorce de febrero del año 2000, ¡justo en el Día de San Valentín!, me convertí en la primera nave de la humanidad en ponerse en órbita alrededor de un asteroide."

#### 🔄 Conexión Narrativa Común (NEAR Shoemaker):
- **[ID: `near_puente_clave.mp3`]**  
  **Personaje:** NEAR Shoemaker  
  **Dirección:** *[Didáctico e inteligente]*  
  > "Llevaba seis instrumentos científicos de élite: cámaras fotográficas, sensores para olfatear minerales y un telémetro láser. ¿Cómo funcionaba el láser? Disparaba rayos de luz hacia la roca y medía cuánto tardaban en rebotar. ¡Así dibujamos un mapa en tres dimensiones de todas las montañas y cráteres de Eros igual que en un videojuego!"

#### 🎮 Rama 2 (Opciones de Cyberpenguin):
- **[ID: `cp_near_opc_2a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Sorprendidísimo]*  
  > "Pero si no tenías patas... ¿cómo terminaste aquí sentada en el suelo?"

- **[ID: `cp_near_opc_2b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Curioso]*  
  > "¿Y qué pasó con tu nombre? ¿Por qué te llamas Shoemaker?"

- **[ID: `cp_near_opc_2c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Preocupado]*  
  > "¿Te destruiste al chocar contra la roca?"

#### 🗣️ Respuestas de NEAR Shoemaker a la Rama 2 (Secretos NASA):
- **[ID: `near_resp_2a.mp3`]**  
  **Personaje:** NEAR Shoemaker (⭐ *Secreto El Aterrizaje Imposible*)  
  **Dirección:** *[Contando una hazaña audaz con orgullo]*  
  > "El doce de febrero de 2001, los científicos de la NASA tuvieron una idea audaz: ¿Y si intentamos posarla en el suelo con sus pequeños chorros de gas? Fuimos frenando centímetro a centímetro hasta tocar la superficie a menos de seis kilómetros por hora: ¡eso es más lento de lo que corres tú en el recreo de la escuela! Toqué el suelo apoyándome en las puntitas de mis paneles solares como un bailarín cósmico. ¡Fui la primera nave de la historia en posarse sobre un asteroide!"

- **[ID: `near_resp_2b.mp3`]**  
  **Personaje:** NEAR Shoemaker (⭐ *Secreto Eugene Shoemaker*)  
  **Dirección:** *[Con reverencia y afecto]*  
  > "Originalmente me llamaba solo NEAR, que significa Encuentro con Asteroides Cercanos a la Tierra. Pero la NASA me rebautizó en honor a Eugene Shoemaker, un legendario científico que descubrió que la Luna y los planetas tienen cráteres porque los asteroides y cometas chocaron contra ellos a lo largo de millones de años."

- **[ID: `near_resp_2c.mp3`]**  
  **Personaje:** NEAR Shoemaker (⭐ *Secreto Dos Semanas Vivas*)  
  **Dirección:** *[Triunfal y feliz]*  
  > "¡Para sorpresa de todos los ingenieros en la Tierra, sobreviví enterita! Mis paneles solares y antenas quedaron intactos y seguí enviando datos científicos directos del suelo de Eros durante dos semanas completas hasta el 28 de febrero de 2001. ¡Fue el broche de oro más épico que una nave pudo desear!"

#### 🎯 Cierre de NEAR Shoemaker:
- **[ID: `near_despedida.mp3`]**  
  **Personaje:** NEAR Shoemaker  
  **Dirección:** *[Inspiradora y enérgica]*  
  > "¡Demostramos que con ingenio y valentía se pueden lograr cosas que parecían imposibles! ¡Hasta la próxima, pequeño explorador!"

- **[ID: `cp_near_gracias.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Pura euforia infantil]*  
  > "¡Eres increíble, NEAR Shoemaker! ¡Mi pasaporte tiene ahora las seis insignias de patita completas!"

---

## 🚀 ESCENA FINAL: DESPEDIDA DESDE LA NAVE DE CYBERPENGUIN

- **[ID: `ia_nave_bienvenida.mp3`]**  
  **Personaje:** IA de la Nave  
  **Dirección:** *[Voz futurista, dulce, clara y reconfortante]*  
  > "¡Bienvenido a bordo, Comandante Cyberpenguin! Todos los sistemas están al cien por ciento. Motores iónicos listos y pasaporte de descubrimientos verificado con honores máximos."

- **[ID: `cp_final_mirada.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Hablando directamente al jugador, con emoción sincera en los ojos]*  
  > "¡Lo logramos, explorador espacial! ¡Mira nuestro pasaporte! Hemos viajado desde el polvo gris de la Luna, pisamos el óxido rojizo de Marte y flotamos junto a sondas legendarias en la oscuridad del espacio profundo."

#### 🎮 Opciones Finales del Jugador:
- **[ID: `cp_final_opc_a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Reflexivo y alegre]*  
  > "¡Aprendí que cada máquina tiene un diseño único para su propia misión!"

- **[ID: `cp_final_opc_b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Entusiasta y aventurero]*  
  > "¡Lo más emocionante fue ver cómo sobrevivieron a peligros increíbles!"

- **[ID: `cp_final_opc_c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Mirando al futuro]*  
  > "¡Quiero saber hacia dónde viajará la humanidad ahora!"

#### 🗣️ Respuestas de Cyberpenguin:
- **[ID: `cp_final_resp_a.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Convincente, inspirador]*  
  > "¡Exactamente! Unas naves usan cámaras, otras brazos mecánicos, otras ruedas con suspensión especial y otras viajan hacia otras estrellas. ¡La ciencia no tiene una sola forma, sino miles de ideas brillantes trabajando en equipo!"

- **[ID: `cp_final_resp_b.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Enérgico]*  
  > "¡Totalmente de acuerdo! Como cuando Eagle esquivó el cráter con cuarenta segundos de combustible, o cuando NEAR aterrizó sin tener patas. ¡Los grandes descubrimientos necesitan audacia y nunca rendirse ante los problemas!"

- **[ID: `cp_final_resp_c.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Mirando a las estrellas con esperanza]*  
  > "¡El futuro está en nuestras manos! La NASA y las agencias espaciales preparan la misión Artemis para volver a la Luna con astronautas, bases habitadas y viajes tripulados a Marte. ¡Tal vez uno de ustedes sea la primera persona en pisar el planeta rojo!"

#### 🌠 Cierre Cinematográfico de Cyberpenguin (Despegue):
- **[ID: `cp_final_despegue.mp3`]**  
  **Personaje:** Cyberpenguin  
  **Dirección:** *[Voz culminante, inspiradora, subiendo la emoción hasta el grito final alegre de despegue]*  
  > "Recuerda siempre este gran secreto cósmico: ¡La curiosidad es el combustible más potente de todo gran explorador! Mientras haya preguntas por responder, estrellas en el cielo y mentes curiosas como la tuya, la aventura nunca terminará. ¡Nos vemos en la próxima galaxia! ¡Motores encendidos en tres... dos... uno... DESPEGUEEEE!"

---

## 💻 4. MAPEO LISTO PARA JAVASCRIPT (`js/data.js`)

Cada ID listado arriba corresponde a una ruta en el directorio del proyecto:
`audio/[ID_DE_ARCHIVO]`

> **Misión Surveyor 3:**  
> El personaje narrativo y el componente gráfico/SVG 3D en el motor (`js/elementos/surveyor-3.js`) utilizan la clave técnica `modelKey: 'surveyor3'` y nombre `'Surveyor 3'`. Los archivos de audio usan el prefijo unificado `surveyor_*.mp3`, integrándose y reproduciéndose con total compatibilidad.

Por ejemplo:
```javascript
{
  id: 'surveyor-3',
  modelKey: 'surveyor3',
  name: 'Surveyor 3',
  dialogueAudioUrl: 'audio/surveyor_saludo.mp3',
  dialogueBranches: [
    {
      choiceText: '¡Hola! Soy Cyberpenguin. ¿Tú quién eres y qué haces parada aquí?',
      choiceAudioUrl: 'audio/cp_surveyor_opc_a.mp3',
      replyAudioUrl: 'audio/surveyor_resp_1a.mp3'
    },
    // ...
  ]
}
```

*Fin del Guion Técnico para ElevenLabs.*
