# 🎙️ ELEVENLABS ENGLISH VOICE CUE SHEET & CASTING SCRIPT
## *Project: Cyberpenguins (NASA Space Exploration Missions)*

---

## ⚙️ 1. GENERAL ELEVENLABS CONFIGURATION GUIDE

- **Recommended ElevenLabs Model:** `Eleven Multilingual v2` (outstanding for emotional richness, cadence, and clear pronunciation) or `Eleven Turbo v2.5` (for ultra-fast low-latency generation).
- **Language / Accent:** General American English (friendly, warm, expressive, and easily accessible for 8 to 12-year-old international audiences).
- **Post-Production Tips (Optional):**
  - **Eagle (Apollo 11):** Soft band-pass filter (*NASA Quindar beep / radio walkie-talkie*) from 300 Hz to 3.5 kHz with subtle cosmic static.
  - **Surveyor 3 & Sojourner:** Subtle metallic robotic ring-modulator or chorus to highlight their vintage/quirky robotic nature.

---

## 🎭 2. OFFICIAL CASTING & VOICE SETTINGS PER CHARACTER

| Character | Selected Voice | Voice ID | Archetype | Recommended Settings (Stability / Similarity / Style) | Tone & Acting Direction |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cyberpenguin** | Leo – Curious Character | `ihKwLOjVUMG4lgUI6meZ` | Curious young explorer (8-11 yrs) | Stability: `0.38`<br>Similarity: `0.78`<br>Style: `0.45` | Very expressive, awestruck, cheerful, and full of energy. |
| **Surveyor 3** | Marco | `JZeTbA8jDZKTeMBPNXrK` | Vintage 1960s helpful robot | Stability: `0.55`<br>Similarity: `0.75`<br>Style: `0.30` | Methodical pauses, polite, neat. "Beep beep" sounds. |
| **Eagle (Apollo 11)** | César Augusto – Spanish Neutral | `hAUJJty85xYTBnGyEWzw` | Legendary space commander | Stability: `0.65`<br>Similarity: `0.80`<br>Style: `0.25` | Calm, noble, reliable, heroic NASA radio voice. |
| **Viking 1** | Natalia – Doblaje Versátil | `zJtOCbdQjTZt7YZtkRDP` | Martian chemistry lab computer | Stability: `0.50`<br>Similarity: `0.75`<br>Style: `0.35` | Elegant, analytical, enthusiastic about science. |
| **Sojourner Rover** | Betty – Quirky, Cartoonish & Warm | `iV6xDQ4wcM3ZcXDx30GB` | Hyperactive little robot brother | Stability: `0.35`<br>Similarity: `0.75`<br>Style: `0.55` | Quick, funny, sweet, very proud of its 6 wheels. |
| **Pioneer 10** | Hanna – Warm, Deep, Inspiring | `c338PHkXJ2cW8fdMPhzP` | Deep space wise traveler | Stability: `0.68`<br>Similarity: `0.82`<br>Style: `0.20` | Gentle, warm, poetic, gazing toward the stars. |
| **NEAR Shoemaker** | Jorge | `MXbNlTMQcU6GZQlRkXHB` | Daring, witty adventurer | Stability: `0.45`<br>Similarity: `0.75`<br>Style: `0.40` | Joyful, humorous, proud of landing without legs. |
| **Ship's AI** | Paulina – Cálida y Comercial | `A9OFofjAh6JEy1MNk5Mz` | Holographic flight assistant | Stability: `0.60`<br>Similarity: `0.80`<br>Style: `0.20` | Pristine, modern, comforting, and professional. |

---

# 📜 3. LINE-BY-LINE PRODUCTION SCRIPT (114 AUDIO CUES)

> **Instructions for Generating Audio:**
> 1. Copy the quoted text into the ElevenLabs text box.
> 2. Numbers and units have been written phonetically as words for natural pronunciation.
> 3. Save files with the given `[ID]` into the `audio/en/` directory of the project.
> 4. Bracketed text `[like this]` provides acting instructions and should not be read aloud.

---

## 🌕 CHAPTER 1: THE MOON

### 💭 Ambient Thought Monologues (The Moon)

- **[ID: `en/cp_luna_salto.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Laughing with joy while bounding in lunar gravity]*  
  > "Wheeeee! Gravity here is only one-sixth of Earth's gravity! With my little penguin feet, I can make giant leaps without even messing up my feathers!"

- **[ID: `en/cp_luna_regolito.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Curious, leaning down to inspect the fine dust]*  
  > "The ground is covered in regolith: a gray powder as fine as flour, but sharp like microscopic shattered glass because there is no wind to smooth it down."

- **[ID: `en/cp_luna_cielo.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Awestruck, gazing at the pitch-black sky and Earth]*  
  > "The sky is completely pitch-black even in the daytime! Since the Moon has no atmosphere, there's no air to scatter the sunlight. And look way out there... Earth looks like a shining blue marble!"

---

### 📡 SURVEYOR 3 (Mission 1)

- **[ID: `en/surveyor_saludo.mp3`]**  
  **Character:** Surveyor 3  
  **Direction:** *[Cheerful 1960s mechanical robotic tone]*  
  > "Beep, biiip! Sensor alert! I detect a feathered space explorer stepping near my landing pads! Hello there, little traveler! Did you come all the way from Earth?"

#### 🎮 Branch 1 (Cyberpenguin Choices):
- **[ID: `en/cp_surveyor_opc_a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Polite and curious]*  
  > "Hello! I'm Cyberpenguin. Who are you, and what are you doing standing here?"

- **[ID: `en/cp_surveyor_opc_b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Surprised, chuckling]*  
  > "Whoa, a three-legged robot! Why do you have a long arm with a tiny shovel?"

- **[ID: `en/cp_surveyor_opc_c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Curious and playful]*  
  > "Is it true you bounced like a rubber ball when you landed?"

#### 🗣️ Surveyor 3 Replies to Branch 1:
- **[ID: `en/surveyor_resp_1a.mp3`]**  
  **Character:** Surveyor 3  
  **Direction:** *[Proud and informative]*  
  > "Nice to meet you, Cyberpenguin! I am Surveyor 3, a robotic spacecraft launched by NASA in April nineteen sixty-seven. I was sent to this very crater to investigate the lunar soil and prepare the way for the astronauts of the Apollo program!"

- **[ID: `en/surveyor_resp_1b.mp3`]**  
  **Character:** Surveyor 3  
  **Direction:** *[Mechanical chuckle, proud of its scoop]*  
  > "Good eye! I was the very first spacecraft in human history to carry a robotic scoop to the Moon. With an electric motor, I stretched it out and scraped the soil just like playing in a giant sandbox to test how solid the ground really was!"

- **[ID: `en/surveyor_resp_1c.mp3`]**  
  **Character:** Surveyor 3  
  **Direction:** *[Amused, sharing a fun story]*  
  > "Ha, ha, ha! Absolutely true! When I touched down on April twentieth, nineteen sixty-seven, reflective rocks confused my radar, and my braking rockets did not shut off in time. I bounced twice across the Moon like a trampoline before coming to a gentle stop!"

#### 🔄 Common Narrative Bridge (Surveyor 3):
- **[ID: `en/surveyor_puente_clave.mp3`]**  
  **Character:** Surveyor 3  
  **Direction:** *[Clear and pedagogical]*  
  > "Before astronauts could come down to walk in person, scientists needed to be sure the ground would hold their weight without swallowing them like quicksand. With my scoop, I dug four trenches and pressed down on the dust to prove the lunar surface was solid and safe!"

#### 🎮 Branch 2 (Cyberpenguin Choices):
- **[ID: `en/cp_surveyor_opc_2a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Interested in camera technology]*  
  > "How many pictures did you take with your television camera?"

- **[ID: `en/cp_surveyor_opc_2b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Awestruck by the historic meeting]*  
  > "Is it true human astronauts came to visit you in person later on?"

- **[ID: `en/cp_surveyor_opc_2c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Curious about scientific discoveries]*  
  > "What did scientists learn when they brought your parts back to Earth?"

#### 🗣️ Surveyor 3 Replies to Branch 2 (NASA Secrets):
- **[ID: `en/surveyor_resp_2a.mp3`]**  
  **Character:** Surveyor 3  
  **Direction:** *[Happy, boasting its camera]*  
  > "I beamed back over six thousand three hundred black-and-white photos! I photographed lunar boulders, the trenches I dug with my scoop, and I even captured a historic photo of a solar eclipse where Earth blocked the Sun right before my eyes!"

- **[ID: `en/surveyor_resp_2b.mp3`]**  
  **Character:** Surveyor 3 (⭐ *Apollo 12 Rendezvous*)  
  **Direction:** *[Excited, sharing its greatest moment]*  
  > "Beep-beep! Yes, they came to visit ME in person! In November nineteen sixty-nine, Apollo twelve astronauts landed their lunar module Intrepid just one hundred and sixty meters away and walked right up to me! Pete Conrad and Alan Bean examined my parts and took my camera back to Earth to study how metal survives two years exposed to space!"

- **[ID: `en/surveyor_resp_2c.mp3`]**  
  **Character:** Surveyor 3 (⭐ *Space Materials Science*)  
  **Direction:** *[Explaining real materials engineering]*  
  > "It was the only time in human history that parts left on another world were brought back to a laboratory! Scientists discovered how space radiation, dust, and temperature swings wear down wires and paint, helping NASA design safer spacesuits and stronger spacecraft!"

#### 🎯 Farewell:
- **[ID: `en/surveyor_despedida.mp3`]**  
  **Character:** Surveyor 3  
  **Direction:** *[Warm, duty fulfilled]*  
  > "I transmitted data until May nineteen sixty-seven, but my greatest pride was helping astronauts walk safely on the Moon. Keep exploring with bravery, Cyberpenguin!"

- **[ID: `en/cp_surveyor_gracias.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Cheerful and grateful]*  
  > "Thank you, brave Surveyor three! You just earned the first lunar stamp in my passport!"

---

### 🦅 APOLLO 11 EAGLE (Mission 2)

- **[ID: `en/eagle_saludo.mp3`]**  
  **Character:** Eagle  
  **Direction:** *[Calm, heroic, vintage NASA commander tone]*  
  > "Houston, Tranquility Base here! Sensor contact confirmed! Welcome to the Sea of Tranquility, Cyberpenguin. You are standing at the most historic landing site on the Moon!"

#### 🎮 Branch 1 (Cyberpenguin Choices):
- **[ID: `en/cp_eagle_opc_1a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Awestruck and excited]*  
  > "No way! Are you the legendary Eagle from Apollo eleven?"

- **[ID: `en/cp_eagle_opc_1b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Amused, observing the gold foil]*  
  > "Whoa, you look covered in shiny golden chocolate wrapper! Why do you sparkle so much?"

- **[ID: `en/cp_eagle_opc_1c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Curious, looking inside]*  
  > "Where are your astronaut friends? Are they taking a space nap inside?"

#### 🗣️ Eagle Replies to Branch 1:
- **[ID: `en/eagle_resp_1a.mp3`]**  
  **Character:** Eagle  
  **Direction:** *[Proud, epic]*  
  > "The one and only! On July twentieth, nineteen sixty-nine, I carried Neil Armstrong and Buzz Aldrin safely down to this ground. We were blasted off from Earth by the gigantic Saturn Five rocket—a monster rocket as tall as a thirty-six-story skyscraper!"

- **[ID: `en/eagle_resp_1b.mp3`]**  
  **Character:** Eagle  
  **Direction:** *[Friendly, explaining the thermal engineering]*  
  > "Ha, ha! Lots of kids think it is gift wrapping paper! They are actually high-tech thermal blankets made of Kapton and Mylar. Have you seen those shiny gold rescue blankets? On the Moon without air, direct sunlight heats metal to over one hundred and twenty degrees, and in the shade it drops to one hundred and fifty below zero. Those blankets reflected heat like a giant space thermos to keep Neil and Buzz safe!"

- **[ID: `en/eagle_resp_1c.mp3`]**  
  **Character:** Eagle  
  **Direction:** *[Gentle, honoring the crew]*  
  > "They returned safely home to Earth a long time ago! But our crew had three teammates: Neil and Buzz climbed down my ladder to explore the surface, while Michael Collins stayed in lunar orbit piloting our mothership, Columbia, patiently waiting for our return."

#### 🔄 Common Narrative Bridge (Eagle):
- **[ID: `en/eagle_puente_clave.mp3`]**  
  **Character:** Eagle  
  **Direction:** *[Authoritative and clear]*  
  > "My body was built in two distinct sections: the descent stage—the gold-wrapped bottom half with four landing legs that remained forever here as a launchpad; and the ascent stage—the upper cockpit cabin that fired its own rocket motor to shoot the astronauts back into space. We worked as a flawless team!"

#### 🎮 Branch 2 (Cyberpenguin Choices):
- **[ID: `en/cp_eagle_opc_2a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Interested in lunar activities]*  
  > "What did Neil and Buzz do while walking out here on the surface?"

- **[ID: `en/cp_eagle_opc_2b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Intrigued about the landing difficulty]*  
  > "Was landing as simple as pressing an automatic autopilot button?"

- **[ID: `en/cp_eagle_opc_2c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Observing the instruments on the ground]*  
  > "I see metal instruments with mirrors and solar panels left on the dust... what are those?"

#### 🗣️ Eagle Replies to Branch 2 (NASA Secrets):
- **[ID: `en/eagle_resp_2a.mp3`]**  
  **Character:** Eagle  
  **Direction:** *[Proud, recounting the science]*  
  > "They walked outside for more than two and a half hours, took pictures, planted the American flag, and collected nearly twenty-two kilograms of lunar rocks and soil using special tongs and scoops to carry back to Earth's laboratories!"

- **[ID: `en/eagle_resp_2b.mp3`]**  
  **Character:** Eagle (⭐ *Armstrong's Manual Flying*)  
  **Direction:** *[Dramatic, thrilling storytelling]*  
  > "Whew, it was a nail-biter! During our final descent, our computer was overloaded with alarms, and the autopilot was aiming straight into a football-field-sized crater filled with giant boulders! Neil took manual control like a video game joystick, flew past the crater, and touched down gently with only about forty seconds of fuel left!"

- **[ID: `en/eagle_resp_2c.mp3`]**  
  **Character:** Eagle (⭐ *The EASEP Laser Retroreflectors*)  
  **Direction:** *[Fascinated by long-term science]*  
  > "Sharp eyes! We set up a science package called EASEP. It included a lunar seismometer to listen to moonquakes, and a special laser reflector array. Even today, scientists on Earth shine powerful laser beams at those reflectors to measure the exact distance to the Moon down to the millimeter!"

#### 🎯 Farewell:
- **[ID: `en/eagle_despedida.mp3`]**  
  **Character:** Eagle  
  **Direction:** *[Heroic, historic]*  
  > "Neil and Buzz's bootprints will stay stamped in this dust for millions of years. Remember, Cyberpenguin: that was one small step for a man, one giant leap for mankind!"

- **[ID: `en/cp_eagle_gracias.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Solemn, inspired]*  
  > "I will cherish your story forever, Commander Eagle! Stamp number two is officially verified in my passport!"

---

## 🔴 CHAPTER 2: MARS

### 💭 Ambient Thought Monologues (Mars)

- **[ID: `en/cp_marte_cielo.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Curious, looking at the Martian sky]*  
  > "How weird! On Earth the sky is blue, but here on Mars it has an orange-pink butterscotch color because the wind lifts fine rust dust high into the thin atmosphere!"

- **[ID: `en/cp_marte_frio.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Shivering playfully]*  
  > "Brrrr! Even for a polar penguin wearing thermal feathers, Mars is bone-chillingly cold! Nighttime temperatures drop all the way down to eighty degrees below zero. Thank goodness for my heated spacesuit!"

- **[ID: `en/cp_marte_rocas.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Examining red soil]*  
  > "Everything here looks like rusty reddish dust! Mars is covered in iron oxide, which is the exact same chemical as rusted metal or powdered brick dust. It really is the Red Planet!"

---

### 🧪 VIKING 1 LANDER (Mission 3)

- **[ID: `en/viking_saludo.mp3`]**  
  **Character:** Viking 1  
  **Direction:** *[Warm, scientific computer greeting]*  
  > "Biological signature detected! Feathers, beak, and a pressurized spacesuit! Welcome to Mars, Cyberpenguin! Greetings from Chryse Planitia, the Plains of Gold!"

#### 🎮 Branch 1 (Cyberpenguin Choices):
- **[ID: `en/cp_viking_opc_1a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Excited, curious]*  
  > "Hello Viking one! Were you the first spacecraft to land on Mars?"

- **[ID: `en/cp_viking_opc_1b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Cheeky, asking about aliens]*  
  > "Tell me the truth! Did you find little green martians hiding behind the rocks?"

- **[ID: `en/cp_viking_opc_1c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Looking at the robotic arm]*  
  > "Why do you have such a long mechanical arm with a tiny shovel at the end?"

#### 🗣️ Viking 1 Replies to Branch 1:
- **[ID: `en/viking_resp_1a.mp3`]**  
  **Character:** Viking 1  
  **Direction:** *[Proud, analytical]*  
  > "I was the first American spacecraft to touch down with complete success on Mars and survive for years to transmit data! I landed on July twentieth, nineteen seventy-six. And we were a team of two: while my sister Orbiter mapped Mars from space, I sat down here to scoop, smell, and analyze the red Martian dirt."

- **[ID: `en/viking_resp_1b.mp3`]**  
  **Character:** Viking 1  
  **Direction:** *[Laughing gently, explaining soil chemistry]*  
  > "Ha, ha, ha! No little green men, no alien cities, and no bug-eyed monsters! My sensors tested for tiny microbes in the dust, but found no living organisms. However, I discovered something incredible: the soil is packed with harsh chemicals similar to hydrogen peroxide that act like a super-disinfectant, destroying organic molecules!"

- **[ID: `en/viking_resp_1c.mp3`]**  
  **Character:** Viking 1  
  **Direction:** *[Enthusiastic about its mechanical arm]*  
  > "That is my three-meter robotic arm! On the tip, I had a motor-driven scoop that scraped the Martian surface like a spoon digging into a bowl of cereal. I scooped up red soil and dropped it into small funnel slots on my back, straight into my miniature onboard science ovens!"

#### 🔄 Common Narrative Bridge (Viking 1):
- **[ID: `en/viking_puente_clave.mp3`]**  
  **Character:** Viking 1  
  **Direction:** *[Pedagogical, didactic analogy]*  
  > "Inside my body, I carried an instrument with a giant tongue-twister name: the GCMS, or Gas Chromatograph-Mass Spectrometer! Imagine a miniature high-tech space toaster oven. My arm dropped dirt inside tiny tubes, the oven baked it, and my chemical nose sniffed the vapors to discover exactly what Mars is made of!"

#### 🎮 Branch 2 (Cyberpenguin Choices):
- **[ID: `en/cp_viking_opc_2a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Interested in power systems]*  
  > "How did you survive the freezing Martian cold for so many years?"

- **[ID: `en/cp_viking_opc_2b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Worried about weather]*  
  > "Did you have to face terrifying Martian dust storms?"

- **[ID: `en/cp_viking_opc_2c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Wondering about mission length]*  
  > "Did your mission last only a few days?"

#### 🗣️ Viking 1 Replies to Branch 2 (NASA Secrets):
- **[ID: `en/viking_resp_2a.mp3`]**  
  **Character:** Viking 1 (⭐ *Nuclear RTGs*)  
  **Direction:** *[Explaining nuclear thermal energy]*  
  > "I couldn't rely on solar panels because Martian dust storms would have covered them like closed window blinds! Instead, I carried two special nuclear batteries called RTGs. Inside, radioactive fuel generated continuous natural heat, keeping my circuits cozy and producing nonstop electrical power."

- **[ID: `en/viking_resp_2b.mp3`]**  
  **Character:** Viking 1 (⭐ *Global Dust Storms*)  
  **Direction:** *[Dramatic, awe-inspiring]*  
  > "Oh, I survived monster dust storms! On Mars, sometimes a small localized dust storm grows and grows until it wraps the ENTIRE planet in a blinding orange dust blanket for months! The winds roared, but my sturdy landing legs kept me planted firm like a rock!"

- **[ID: `en/viking_resp_2c.mp3`]**  
  **Character:** Viking 1 (⭐ *Record Longevity*)  
  **Direction:** *[Proud, accomplished]*  
  > "I was only planned to work for ninety days, but I survived for over SIX YEARS! I worked continuously until November nineteen eighty-two, measuring winds, taking over fifty thousand photos, and recording the first daily weather forecasts from another world!"

#### 🎯 Farewell:
- **[ID: `en/viking_despedida.mp3`]**  
  **Character:** Viking 1  
  **Direction:** *[Warm, encouraging]*  
  > "Because of my data, humanity realized Mars has valleys carved by ancient rivers that dried up billions of years ago. Keep digging for knowledge, Cyberpenguin!"

- **[ID: `en/cp_viking_gracias.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Enthusiastic]*  
  > "Thank you, pioneer Viking! Stamp number three is glowing in my passport!"

---

### 🛞 SOJOURNER ROVER (Mission 4)

- **[ID: `en/sojourner_saludo.mp3`]**  
  **Character:** Sojourner Rover  
  **Direction:** *[Bubbly, energetic, cute high-pitched tone]*  
  > "Watch my six wheels, penguin pal! I'm rolling at top speed: one centimeter per second! I am Sojourner, the first rover in history to drive across Mars!"

#### 🎮 Branch 1 (Cyberpenguin Choices):
- **[ID: `en/cp_sojourner_opc_1a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Delighted and smiling]*  
  > "Aww, you're so tiny and cute! You look like a remote-control toy car!"

- **[ID: `en/cp_sojourner_opc_1b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Curious about landing]*  
  > "How did you land here without retro-rockets on your wheels?"

- **[ID: `en/cp_sojourner_opc_1c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Playful teasing]*  
  > "Do you have six wheels so you can race across the sand at supersonic speed?"

#### 🗣️ Sojourner Replies to Branch 1:
- **[ID: `en/sojourner_resp_1a.mp3`]**  
  **Character:** Sojourner Rover  
  **Direction:** *[Puffed up with pride, funny]*  
  > "Hey, I might weigh only ten point five kilograms and stand just thirty centimeters tall, but I have a titanium skeleton and a genius computer brain! I arrived on July fourth, nineteen ninety-seven, tucked inside the Mars Pathfinder lander, and proved that small, agile rovers could conquer other worlds!"

- **[ID: `en/sojourner_resp_1b.mp3`]**  
  **Character:** Sojourner Rover  
  **Direction:** *[Giggling, animated storytelling]*  
  > "My mothership Pathfinder had the coolest landing in history! We did not use hard landing legs: we inflated a cocoon of giant airbags and bounced across Mars like a runaway basketball over fifteen times! Once we stopped, the petals opened up, and I drove down the ramp onto the red sand!"

- **[ID: `en/sojourner_resp_1c.mp3`]**  
  **Character:** Sojourner Rover  
  **Direction:** *[Laughing, explaining the suspension]*  
  > "Ha, ha! I'm definitely not a race car! My top speed is just one centimeter per second—a snail could beat me in a sprint! But my six wheels use a rocker-bogie suspension system: like an all-terrain skateboard with insect legs! When one wheel climbs over a big rock, the other five adjust automatically to keep me stable without ever tipping over!"

#### 🔄 Common Narrative Bridge (Sojourner):
- **[ID: `en/sojourner_puente_clave.mp3`]**  
  **Character:** Sojourner Rover  
  **Direction:** *[Didactic, cute science explanation]*  
  > "Mounted on my rear, I carried an instrument called the APXS—the Alpha Particle X-Ray Spectrometer! Think of it as my robotic snout. I pressed it right up against Martian rocks, beamed invisible, harmless particles at them, and listened to the atomic echoes to discover whether rocks were volcanic or washed down by ancient rushing floods!"

#### 🎮 Branch 2 (Cyberpenguin Choices):
- **[ID: `en/cp_sojourner_opc_2a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Asking about steering]*  
  > "Did someone drive you in real-time with a video game joystick from Earth?"

- **[ID: `en/cp_sojourner_opc_2b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Curious about rock nicknames]*  
  > "What silly nicknames did scientists give to the rocks you explored?"

- **[ID: `en/cp_sojourner_opc_2c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Reflecting on bigger rovers]*  
  > "Did your tiny wheels pave the way for bigger monster rovers?"

#### 🗣️ Sojourner Replies to Branch 2 (NASA Secrets):
- **[ID: `en/sojourner_resp_2a.mp3`]**  
  **Character:** Sojourner Rover (⭐ *The 20-Minute Radio Delay*)  
  **Direction:** *[Animated, explaining speed of light lag]*  
  > "Impossible to steer live! Radio signals between Earth and Mars take between ten and twenty minutes to travel at the speed of light. If I saw a cliff and Earth shouted 'Stop!', I'd already be at the bottom! So scientists sent me route plans each morning, and I used laser hazard sensors to navigate around rocks on my own!"

- **[ID: `en/sojourner_resp_2b.mp3`]**  
  **Character:** Sojourner Rover (⭐ *Cartoon Rock Names*)  
  **Direction:** *[Giggling, proud of the nicknames]*  
  > "NASA scientists have an awesome sense of humor! To remember all the rocks easily, they named them after cartoon characters! I examined a pyramid-shaped rock named 'Yogi Bear', a knobby rock called 'Barnacle Bill', and others named 'Casper', 'Scooby-Doo', and 'Wedge'!"

- **[ID: `en/sojourner_resp_2c.mp3`]**  
  **Character:** Sojourner Rover (⭐ *The Rover Dynasty*)  
  **Direction:** *[Proud older sibling vibe]*  
  > "Yes! I was the baby pioneer! After my success, NASA built Spirit and Opportunity, which were the size of golf carts, and later Curiosity and Perseverance, which are massive monster trucks the size of cars with nuclear lasers! But I was the one who took the very first tire tracks on Mars!"

#### 🎯 Farewell:
- **[ID: `en/sojourner_despedida.mp3`]**  
  **Character:** Sojourner Rover  
  **Direction:** *[Sweet and inspiring]*  
  > "I operated for eighty-three days, driving over one hundred meters across the red dust. Remember: you do not need to be huge to achieve monumental dreams! Keep rolling forward, Cyberpenguin!"

- **[ID: `en/cp_sojourner_gracias.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Brimming with admiration]*  
  > "High-five, little legend! Stamp number four is officially registered in my passport!"

---

## 🌌 CHAPTER 3: DEEP SPACE & ASTEROIDS

### 💭 Ambient Thought Monologues (Deep Space)

- **[ID: `en/cp_espacio_gravedad.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Tranquil, wondering at zero gravity]*  
  > "Total silence and zero gravity! Far away from planets, there is no up or down. If I let go of my tools, they just drift peacefully beside me like little metallic fish in an infinite ocean!"

- **[ID: `en/cp_espacio_estrellas.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Deep wonder, looking at the cosmos]*  
  > "Without any city lights or atmosphere in the way, the Milky Way shines with billions of bright diamond stars, glowing nebulae, and colorful distant galaxies. It's the most magnificent view in the cosmos!"

- **[ID: `en/cp_espacio_cinturon.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Calm, sharing a fun fact]*  
  > "In movies, asteroid belts are packed like bumper cars, but here in reality, asteroids are separated by millions of kilometers of empty space! Navigating through them is as calm and quiet as floating on a tranquil sea."

---

### 🪐 PIONEER 10 (Mission 5)

- **[ID: `en/pioneer_saludo.mp3`]**  
  **Character:** Pioneer 10  
  **Direction:** *[Deep, calm, wise, reverberant space transmission]*  
  > "Radio signal received billions of kilometers away from home! Hello, space explorer Cyberpenguin! Isn't it chilly out here among the stars?"

#### 🎮 Branch 1 (Cyberpenguin Choices):
- **[ID: `en/cp_pioneer_opc_1a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Wondering, gentle]*  
  > "Hello Pioneer ten! What are you doing floating so far away from the Sun?"

- **[ID: `en/cp_pioneer_opc_1b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Playfully pointing at the big dish]*  
  > "Whoa, that is one gigantic umbrella mounted on your body!"

- **[ID: `en/cp_pioneer_opc_1c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Intrigued about asteroid collisions]*  
  > "Weren't you terrified of smashing into rocks in the asteroid belt?"

#### 🗣️ Pioneer 10 Replies to Branch 1:
- **[ID: `en/pioneer_resp_1a.mp3`]**  
  **Character:** Pioneer 10  
  **Direction:** *[Epic, recounting humanity's first Jupiter mission]*  
  > "I blasted off in March nineteen seventy-two on a daring mission no machine had ever attempted: to be the very first spacecraft to reach Jupiter, the giant king of our solar system! In December nineteen seventy-three, I braved its fierce radiation belts and sent back close-up pictures of its Great Red Spot and giant moons!"

- **[ID: `en/pioneer_resp_1b.mp3`]**  
  **Character:** Pioneer 10  
  **Direction:** *[Warm, explaining communications]*  
  > "Ha, ha! It is not a rain umbrella! It's my high-gain parabolic antenna, almost three meters wide. Because I traveled so far away from Earth, my radio signals grew as faint as a whisper. I needed this giant dish to beam my messages directly back to the huge listening ears of NASA's Deep Space Network on Earth!"

- **[ID: `en/pioneer_resp_1c.mp3`]**  
  **Character:** Pioneer 10  
  **Direction:** *[Poetic, demystifying the asteroid belt]*  
  > "Science fiction movies always show the asteroid belt as a chaotic obstacle course where ships crash every two seconds! But when I became the first probe to cross it in nineteen seventy-two, I proved the truth: space is unfathomably huge! Asteroids are separated by millions of kilometers. Crossing it was as smooth and peaceful as sailing an open sea!"

#### 🔄 Common Narrative Bridge (Pioneer 10):
- **[ID: `en/pioneer_puente_clave.mp3`]**  
  **Character:** Pioneer 10  
  **Direction:** *[Reflective, awe-inspiring distance]*  
  > "I flew so far that sunlight dwindled to a tiny bright speck, so solar panels were completely useless. I carried RTG nuclear batteries for nonstop heat and electricity. My final whisper back to Earth was detected on January twenty-third, two thousand and three, when I was over twelve billion kilometers away—it took over eleven hours for that radio signal to reach Earth traveling at the speed of light!"

#### 🎮 Branch 2 (Cyberpenguin Choices):
- **[ID: `en/cp_pioneer_opc_2a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Looking at the golden plaque]*  
  > "I noticed a polished gold plaque bolted to your frame... what does it mean?"

- **[ID: `en/cp_pioneer_opc_2b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Curious about its infinite voyage]*  
  > "Where are you heading now that your batteries have gone to sleep?"

- **[ID: `en/cp_pioneer_opc_2c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Asking about Jupiter's immense pull]*  
  > "What did it feel like to fly right past the colossal giant Jupiter?"

#### 🗣️ Pioneer 10 Replies to Branch 2 (NASA Secrets):
- **[ID: `en/pioneer_resp_2a.mp3`]**  
  **Character:** Pioneer 10 (⭐ *The Golden Plaque*)  
  **Direction:** *[Reverent, philosophical]*  
  > "It is my greatest cosmic treasure! A gold-anodized plaque designed by Carl Sagan and Linda Salzman Sagan. It features drawings of a human man and woman greeting in peace, our solar system map, and a map of pulsars—cosmic lighthouse stars that pulse like precise clocks. Any intelligent civilization that finds me can decode it and find Earth!"

- **[ID: `en/pioneer_resp_2b.mp3`]**  
  **Character:** Pioneer 10 (⭐ *Interstellar Journey*)  
  **Direction:** *[Poetic, serene]*  
  > "Because there is no air resistance in the vacuum of space, I will drift forever without slowing down! I am silently coasting toward the red giant star Aldebaran, located in the constellation Taurus. It will take me about two million years to get there—a patient cosmic message in a bottle!"

- **[ID: `en/pioneer_resp_2c.mp3`]**  
  **Character:** Pioneer 10 (⭐ *Gravity Slingshot*)  
  **Direction:** *[Dramatic, dynamic]*  
  > "I felt a breathtaking, colossal pull! Jupiter is so gargantuan that its immense gravity acted like an invisible cosmic slingshot. It whipped me around its clouds, dramatically increased my velocity, and flung me straight toward the edge of our solar system!"

#### 🎯 Farewell:
- **[ID: `en/pioneer_despedida.mp3`]**  
  **Character:** Pioneer 10  
  **Direction:** *[Warm, timeless blessing]*  
  > "Even though my radios are silent, I carry humanity's greeting across the interstellar void. Keep your gaze fixed on the stars, Cyberpenguin!"

- **[ID: `en/cp_pioneer_gracias.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Deeply inspired]*  
  > "Safe travels, eternal voyager! Stamp number five is proudly shining in my passport!"

---

### 🥔 NEAR SHOEMAKER (Mission 6)

- **[ID: `en/near_saludo.mp3`]**  
  **Character:** NEAR Shoemaker  
  **Direction:** *[Playful, energetic adventurer tone]*  
  > "Watch your steps, Cyberpenguin! Gravity here on asteroid Eros is so weak that if you sneeze too hard, you might launch yourself right into outer space!"

#### 🎮 Branch 1 (Cyberpenguin Choices):
- **[ID: `en/cp_near_opc_1a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Amused, looking at the oblong asteroid]*  
  > "Hello NEAR Shoemaker! Why does this asteroid look like a giant potato?"

- **[ID: `en/cp_near_opc_1b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Looking for landing gear]*  
  > "Are you an orbiter or a lander? I don't see any landing legs!"

- **[ID: `en/cp_near_opc_1c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Curious about asteroid hunting]*  
  > "How did you track down such a small rock in the middle of vast space?"

#### 🗣️ NEAR Shoemaker Replies to Branch 1:
- **[ID: `en/near_resp_1a.mp3`]**  
  **Character:** NEAR Shoemaker  
  **Direction:** *[Cheerful, explaining why asteroids are lumpy]*  
  > "Ha, ha! Eros is thirty-four kilometers long and looks just like a giant floating potato or peanut! Do you know why huge planets like Earth are round? Because their gravity is massive enough to squeeze everything equally toward the center like rolling playdough into a sphere. But Eros is small and lightweight, so its weak gravity never rounded it out, leaving it a bumpy, elongated rock!"

- **[ID: `en/near_resp_1b.mp3`]**  
  **Character:** NEAR Shoemaker  
  **Direction:** *[Witty, sharing its surprising secret]*  
  > "That is the most amazing twist of my mission: I was NEVER built to land! I had no landing legs, no shock absorbers, and no airbags. I was designed strictly as an orbital satellite to circle Eros from high above and take photos from orbit!"

- **[ID: `en/near_resp_1c.mp3`]**  
  **Character:** NEAR Shoemaker  
  **Direction:** *[Smiling, recounting Valentine's Day orbit]*  
  > "I launched in nineteen ninety-six, flew past asteroid Mathilde in nineteen ninety-seven, and on February fourteenth, two thousand—Valentine's Day!—I became the first spacecraft in human history to slip into orbit around an asteroid. It was a true cosmic love story with a space rock!"

#### 🔄 Common Narrative Bridge (NEAR Shoemaker):
- **[ID: `en/near_puente_clave.mp3`]**  
  **Character:** NEAR Shoemaker  
  **Direction:** *[Enthusiastic about laser mapping]*  
  > "I carried six elite science instruments: multispectral cameras, spectrometers to sniff out mineral chemistry, and a laser rangefinder. How did my laser work? It fired rapid pulses of light down at the rocks and clocked how long they took to bounce back, mapping every ridge, boulder, and crater in three-D like a video game!"

#### 🎮 Branch 2 (Cyberpenguin Choices):
- **[ID: `en/cp_near_opc_2a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Wondering how it touched down]*  
  > "If you didn't have landing legs, how did you end up sitting on the ground?"

- **[ID: `en/cp_near_opc_2b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Asking about Eugene Shoemaker]*  
  > "Where did your name Shoemaker come from?"

- **[ID: `en/cp_near_opc_2c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Asking about impact survival]*  
  > "Did you crash and shatter when you hit the asteroid?"

#### 🗣️ NEAR Shoemaker Replies to Branch 2 (NASA Secrets):
- **[ID: `en/near_resp_2a.mp3`]**  
  **Character:** NEAR Shoemaker (⭐ *The Improvised Touchdown*)  
  **Direction:** *[Excited, recounting the ballet landing]*  
  > "On February twelfth, two thousand and one, NASA engineers hatched an audacious idea: 'What if we try to gently nudge her down to the surface using her tiny gas thrusters?' We fired thrusters in gentle pulses, slowing our descent until we touched the ground at less than six kilometers per hour—slower than a kid walking in a school hallway! I rested on the tips of my solar panels like a cosmic ballet dancer! I was the first spacecraft ever to land on an asteroid!"

- **[ID: `en/near_resp_2b.mp3`]**  
  **Character:** NEAR Shoemaker (⭐ *Eugene Shoemaker Tribute*)  
  **Direction:** *[Honoring the geologist pioneer]*  
  > "Originally, my name was just NEAR, which stood for Near Earth Asteroid Rendezvous. But NASA renamed me to honor Eugene Shoemaker, a legendary geologist who revolutionized science by proving that craters on Earth, the Moon, and planets were carved by asteroid and comet impacts over billions of years!"

- **[ID: `en/near_resp_2c.mp3`]**  
  **Character:** NEAR Shoemaker (⭐ *Transmitting from the Surface*)  
  **Direction:** *[Triumphant, amazed]*  
  > "To the sheer amazement of engineers on Earth, I didn't break at all! I survived the touchdown intact, kept transmitting clear radio signals from the surface for over two weeks, and measured the asteroid's composition up close until my mission was complete!"

#### 🎯 Farewell:
- **[ID: `en/near_despedida.mp3`]**  
  **Character:** NEAR Shoemaker  
  **Direction:** *[Warm and spirited]*  
  > "We proved that with curiosity, courage, and clever engineering, humans can explore even the most unusual worlds. Never stop asking questions, Cyberpenguin!"

- **[ID: `en/cp_near_gracias.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Ecstatic]*  
  > "Thank you, daring NEAR! You are the sixth and final golden stamp in my passport!"

---

## 🚀 FINAL SCENE: THE SPACESHIP COCKPIT

### 🤖 Ship's AI Welcome:

- **[ID: `en/ia_nave_bienvenida.mp3`]**  
  **Character:** IA de la Nave  
  **Direction:** *[Crisp, futuristic, warm cockpit computer]*  
  > "Welcome aboard, Commander Cyberpenguin! All flight systems are operating at one hundred percent. Ion engines primed, navigation plotted, and your galactic discovery passport has been verified with highest honors!"

- **[ID: `en/cp_final_mirada.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Turning happily to the player]*  
  > "We did it, space explorer! Look at our passport! We traveled from the gray dust of the Moon, crossed the rusty sands of Mars, and floated beside legendary probes in deep space!"

#### 🎮 Final Reflection Choices:
- **[ID: `en/cp_final_opc_a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[The Inspired Scientist]*  
  > "I learned that every machine has a unique design created for its own mission!"

- **[ID: `en/cp_final_opc_b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[The Adventurous Engineer]*  
  > "The most thrilling part was seeing how they overcame impossible dangers!"

- **[ID: `en/cp_final_opc_c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[The Future Astronaut]*  
  > "I want to know where humanity will travel to next!"

#### 🗣️ Cyberpenguin Replies:
- **[ID: `en/cp_final_resp_a.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Passionate about science and teamwork]*  
  > "Exactly! Some spacecraft use cameras, others robotic backhoe arms, others insect-like suspensions, and others journey toward distant stars. Science doesn't have just one shape—it is made of thousands of brilliant ideas working together as a team!"

- **[ID: `en/cp_final_resp_b.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Heroic, encouraging resilience]*  
  > "I completely agree! Like when Eagle manually steered past the boulder crater with only forty seconds of fuel left, or when NEAR landed softly without even having landing legs! Great discoveries require bravery and never giving up when surprises happen!"

- **[ID: `en/cp_final_resp_c.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Looking forward to Artemis and Mars]*  
  > "The future is in our hands! NASA and space agencies are preparing the Artemis missions to return astronauts to the Moon, build lunar bases, and journey onward to Mars. Who knows? Maybe one of you will be the first human to leave footprints on the Red Planet!"

#### 🌠 Grand Farewell & Blast-off:
- **[ID: `en/cp_final_despegue.mp3`]**  
  **Character:** Cyberpenguin  
  **Direction:** *[Culminating, inspiring speech, building up to an exuberant blast-off roar]*  
  > "Always remember this great cosmic secret: Curiosity is the most powerful fuel of every great explorer! As long as there are questions to ask, stars to gaze at in the night sky, and curious minds like yours, the adventure will never end. See you in the next galaxy! Engines engaged in three... two... one... BLAST OFFFF!"

---

## 💻 4. JAVASCRIPT & AUTOMATION SCRIPT READY

All 114 IDs above match the generator script located in:  
`scripts/generate_elevenlabs_audio.cjs`

Run with language flag or output folder `audio/en/`:
```bash
ELEVENLABS_API_KEY="your_api_key" node scripts/generate_elevenlabs_audio.cjs --lang=en
```
