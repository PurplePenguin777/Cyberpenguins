/**
 * CYBERPENGUINS - Motor de Música Procedural Espacial
 * - Menú Inicial: Música cinematográfica estilo Natalie Holt - TVA (From "Loki"):
 *     * Pulso rítmico de reloj cósmico (tick-tock cronométrico de precisión temporal).
 *     * Ostinato de bajo analógico sintetizado (estilo Buchla/Moog retro-futurista).
 *     * Capas armónicas orquestales oscuras y grandiosas (cuerdas/metales y sub-bajo).
 *     * Melodía solista enigmática estilo theremin / Ondes Martenot con glissando y vibrato.
 * - Escenas de Exploración (Luna, Marte, Espacio): Música cálida y acogedora estilo Animal Crossing & Ocarina de Zelda:
 *     * Melodía solista lírica de ocarina / flauta dulce de madera con respiración y vibrato.
 *     * Acompañamiento acústico de arpegios de marimba / guitarra de madera cálida.
 *     * Contrabajo caminante pizzicato suave y jovial.
 *     * Campanitas pentatónicas y shaker sutil tipo Animal Crossing.
 *     * Viento marciano de baja presión acústica de CO2 (NASA) integrado al explorar Ares Vallis.
 */
(function (global) {
  'use strict';

  let audioCtx = null;
  let masterGain = null;
  let duckGain = null;
  let limiter = null;
  let currentVolume = 0.8;
  let isMuted = false;
  let isDucked = false;
  let currentTrackName = null; // 'menu' | 'scene' | null
  let desiredTrackName = null;
  let schedulerTimer = null;
  let tvaFadeTimer = null;
  let acFadeTimer = null;
  let marsWindTimer = null;
  let marsWindGen = 0;
  let isPaused = false;
  let currentSiteId = '';

  // Lookahead timing configuration (Web Audio scheduler pattern)
  const LOOKAHEAD_MS = 60;
  const SCHEDULE_AHEAD_TIME = 0.22;

  /* ========================================================================
     TRACK 1: TVA / LOKI (Natalie Holt Style)
     ======================================================================== */
  const TVA = {
    bpm: 96,
    gainNode: null,
    nextNoteTime: 0,
    current16th: 0,
    currentBar: 0,
    active: false,

    // Progression: Dm -> Bbmaj7 -> Gm9 -> Asus4 / A7
    chords: [
      { root: 73.42, notes: [146.83, 220.00, 261.63, 349.23], sub: 36.71 }, // Dm (D1, D3, A3, C4, F4)
      { root: 58.27, notes: [116.54, 174.61, 233.08, 293.66], sub: 58.27 }, // Bbmaj7 (Bb1, Bb2, F3, Bb3, D4)
      { root: 49.00, notes: [98.00, 146.83, 220.00, 261.63], sub: 49.00 },  // Gm9 (G1, G2, D3, A3, C4)
      { root: 55.00, notes: [110.00, 164.81, 220.00, 277.18], sub: 55.00 }  // A7 (A1, A2, E3, A3, C#4)
    ],

    // 16th-note bass ostinato notes (relative to bar's chord root)
    bassPattern: [
      { semitones: 0, accent: 1.0 },   // Beat 1: Root
      { semitones: 0, accent: 0.6 },
      { semitones: 3, accent: 0.8 },   // Minor 3rd
      { semitones: 0, accent: 0.55 },
      { semitones: 5, accent: 0.9 },   // Beat 2: 4th
      { semitones: 0, accent: 0.5 },
      { semitones: 3, accent: 0.75 },
      { semitones: 2, accent: 0.65 },  // Major 2nd
      { semitones: 0, accent: 0.95 },  // Beat 3: Root
      { semitones: -2, accent: 0.7 },  // Flat 7th down
      { semitones: 0, accent: 0.6 },
      { semitones: 3, accent: 0.85 },
      { semitones: 7, accent: 1.0 },   // Beat 4: 5th
      { semitones: 5, accent: 0.65 },
      { semitones: 3, accent: 0.7 },
      { semitones: 2, accent: 0.75 }
    ],

    // Theremin melody: notes in 16th-count durations
    // [noteFreq, durationIn16ths]
    melodyPhrases: [
      // Phrase A (Enigmatic TVA theme opener)
      [
        { f: 293.66, d: 8, glideTo: 349.23 }, // D4
        { f: 349.23, d: 4, glideTo: 329.63 }, // F4
        { f: 329.63, d: 4, glideTo: 293.66 }, // E4
        { f: 293.66, d: 8, glideTo: 277.18 }, // D4
        { f: 277.18, d: 4, glideTo: 293.66 }, // C#4
        { f: 293.66, d: 12, glideTo: null },  // D4 sustain
        { f: 0, d: 8 }                        // Rest
      ],
      // Phrase B (Heroic & mysterious TVA ascent)
      [
        { f: 349.23, d: 6, glideTo: 440.00 }, // F4
        { f: 440.00, d: 6, glideTo: 392.00 }, // A4
        { f: 392.00, d: 4, glideTo: 466.16 }, // G4
        { f: 466.16, d: 8, glideTo: 440.00 }, // Bb4
        { f: 440.00, d: 6, glideTo: 349.23 }, // A4
        { f: 349.23, d: 4, glideTo: 329.63 }, // F4
        { f: 329.63, d: 8, glideTo: 293.66 }, // E4
        { f: 293.66, d: 12, glideTo: null },  // D4
        { f: 0, d: 10 }                       // Rest
      ],
      // Phrase C (High soaring dramatic climax)
      [
        { f: 587.33, d: 8, glideTo: 554.37 }, // D5
        { f: 554.37, d: 4, glideTo: 587.33 }, // C#5
        { f: 587.33, d: 8, glideTo: 440.00 }, // D5
        { f: 440.00, d: 8, glideTo: 349.23 }, // A4
        { f: 349.23, d: 4, glideTo: 392.00 }, // F4
        { f: 392.00, d: 4, glideTo: 329.63 }, // G4
        { f: 329.63, d: 8, glideTo: 293.66 }, // E4
        { f: 293.66, d: 16, glideTo: null },  // D4 resolution
        { f: 0, d: 8 }                        // Rest
      ]
    ],
    melodyPhraseIdx: 0,
    melodyNoteIdx: 0,
    nextMelody16th: 0,
    lastThereminFreq: 293.66
  };

  /* ========================================================================
     TRACK 2: ANIMAL CROSSING & OCARINA OF ZELDA
     ======================================================================== */
  const AC_ZELDA = {
    bpm: 84,
    gainNode: null,
    nextNoteTime: 0,
    current16th: 0,
    currentBar: 0,
    active: false,

    // Progression: Cmaj7 -> Am7 -> Dm9 -> G7sus4 | Fmaj7 -> Em7 -> Dm7 -> Cmaj7
    chords: [
      { root: 65.41, bassWalk: [65.41, 82.41, 98.00, 110.00], notes: [261.63, 329.63, 392.00, 493.88] }, // Cmaj7
      { root: 55.00, bassWalk: [55.00, 65.41, 82.41, 98.00], notes: [220.00, 261.63, 329.63, 392.00] },  // Am7
      { root: 73.42, bassWalk: [73.42, 87.31, 98.00, 110.00], notes: [293.66, 349.23, 440.00, 493.88] }, // Dm9
      { root: 49.00, bassWalk: [49.00, 65.41, 73.42, 87.31], notes: [261.63, 293.66, 392.00, 440.00] },  // G7sus4
      { root: 43.65, bassWalk: [43.65, 55.00, 65.41, 73.42], notes: [261.63, 329.63, 349.23, 440.00] }, // Fmaj7
      { root: 41.20, bassWalk: [41.20, 49.00, 61.74, 73.42], notes: [246.94, 329.63, 392.00, 493.88] }, // Em7
      { root: 73.42, bassWalk: [73.42, 82.41, 87.31, 98.00], notes: [261.63, 293.66, 349.23, 440.00] }, // Dm7
      { root: 65.41, bassWalk: [65.41, 98.00, 82.41, 73.42], notes: [261.63, 329.63, 392.00, 523.25] }  // Cmaj7
    ],

    // Ocarina melody phrases (Zelda exploratory wonder + Animal Crossing sweetness)
    // [noteFreq, durationIn16ths, isOrnament]
    melodyPhrases: [
      // Phrase 1 (Zelda adventure / Ocarina lilt)
      [
        { f: 392.00, d: 4 }, // G4
        { f: 493.88, d: 4 }, // B4
        { f: 587.33, d: 8 }, // D5
        { f: 523.25, d: 4 }, // C5
        { f: 493.88, d: 4 }, // B4
        { f: 392.00, d: 4 }, // G4
        { f: 440.00, d: 8 }, // A4
        { f: 392.00, d: 16 }, // G4 sustain
        { f: 0, d: 8 }
      ],
      // Phrase 2 (Animal Crossing cozy stroll)
      [
        { f: 329.63, d: 4 }, // E4
        { f: 392.00, d: 4 }, // G4
        { f: 440.00, d: 4 }, // A4
        { f: 523.25, d: 6 }, // C5
        { f: 493.88, d: 4 }, // B4
        { f: 392.00, d: 4 }, // G4
        { f: 329.63, d: 4 }, // E4
        { f: 293.66, d: 6 }, // D4
        { f: 261.63, d: 16 }, // C4
        { f: 0, d: 8 }
      ],
      // Phrase 3 (Sweet soaring discovery motif)
      [
        { f: 523.25, d: 6 }, // C5
        { f: 659.25, d: 6 }, // E5
        { f: 783.99, d: 8 }, // G5
        { f: 659.25, d: 4 }, // E5
        { f: 587.33, d: 6 }, // D5
        { f: 493.88, d: 4 }, // B4
        { f: 523.25, d: 4 }, // C5
        { f: 440.00, d: 6 }, // A4
        { f: 392.00, d: 16 }, // G4
        { f: 0, d: 8 }
      ],
      // Phrase 4 (Lullaby tenderness)
      [
        { f: 440.00, d: 6 }, // A4
        { f: 523.25, d: 6 }, // C5
        { f: 587.33, d: 8 }, // D5
        { f: 659.25, d: 4 }, // E5
        { f: 587.33, d: 4 }, // D5
        { f: 523.25, d: 4 }, // C5
        { f: 440.00, d: 6 }, // A4
        { f: 392.00, d: 6 }, // G4
        { f: 523.25, d: 16 }, // C5
        { f: 0, d: 8 }
      ]
    ],
    melodyPhraseIdx: 0,
    melodyNoteIdx: 0,
    nextMelody16th: 0,

    // Mars NASA low-pressure CO2 acoustic wind layer
    marsWind: {
      active: false,
      gain: null,
      source: null,
      filter: null,
      lfo: null
    }
  };

  function holdGainParam(param, now) {
    if (!param) return 0.0001;
    const current = Math.max(0.0001, Number(param.value) || 0.0001);
    try {
      param.cancelScheduledValues(now);
      param.setValueAtTime(current, now);
    } catch (_e) { }
    return current;
  }

  function isDesiredTrackPlaying() {
    if (!desiredTrackName || currentTrackName !== desiredTrackName) return false;
    return desiredTrackName === 'menu' ? TVA.active : (desiredTrackName === 'scene' && AC_ZELDA.active);
  }

  function handleContextStateChange() {
    if (!audioCtx || isPaused) return;
    if (audioCtx.state === 'running') {
      const target = desiredTrackName || currentTrackName;
      if (target) {
        const now = audioCtx.currentTime;
        if (TVA.active && TVA.nextNoteTime < now - 0.15) {
          TVA.nextNoteTime = now + 0.015;
        }
        if (AC_ZELDA.active && AC_ZELDA.nextNoteTime < now - 0.15) {
          AC_ZELDA.nextNoteTime = now + 0.015;
        }
        applyTrack(target, false);
      }
      return;
    }
    if ((audioCtx.state === 'interrupted' || audioCtx.state === 'suspended') && typeof audioCtx.resume === 'function') {
      audioCtx.resume().catch(() => {});
    }
  }

  /* ========================================================================
     AUDIO CONTEXT & MASTER CHAIN SETUP
     ======================================================================== */
  function getContext() {
    if (!audioCtx) {
      if (typeof global !== "undefined" && global.CYBERPENGUINS_AUDIO_CTX) {
        audioCtx = global.CYBERPENGUINS_AUDIO_CTX;
      } else {
        const Ctx = global.AudioContext || global.webkitAudioContext;
        if (Ctx) {
          audioCtx = new Ctx();
          global.CYBERPENGUINS_AUDIO_CTX = audioCtx;
        }
      }
      if (audioCtx) {
        audioCtx.onstatechange = handleContextStateChange;
      }
    }
    if (audioCtx && !masterGain) {
      setupMasterChain();
    }
    return audioCtx;
  }

  function setupMasterChain() {
    if (!audioCtx) return;

    // Safety limiter / soft compressor
    limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-4.0, audioCtx.currentTime);
    limiter.knee.setValueAtTime(6.0, audioCtx.currentTime);
    limiter.ratio.setValueAtTime(8.0, audioCtx.currentTime);
    limiter.attack.setValueAtTime(0.004, audioCtx.currentTime);
    limiter.release.setValueAtTime(0.18, audioCtx.currentTime);

    // Master volume & ducking gain
    masterGain = audioCtx.createGain();
    const effectiveVol = isMuted ? 0.0001 : Math.max(0.0001, currentVolume * 0.75);
    masterGain.gain.setValueAtTime(effectiveVol, audioCtx.currentTime);

    duckGain = audioCtx.createGain();
    duckGain.gain.setValueAtTime(isDucked ? 0.28 : 1.0, audioCtx.currentTime);

    duckGain.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // Sub-gains for track crossfade
    TVA.gainNode = audioCtx.createGain();
    TVA.gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    TVA.gainNode.connect(duckGain);

    AC_ZELDA.gainNode = audioCtx.createGain();
    AC_ZELDA.gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    AC_ZELDA.gainNode.connect(duckGain);
  }

  /* ========================================================================
     SYNTHESIS INSTRUMENTS - TRACK 1 (TVA / LOKI)
     ======================================================================== */

  /**
   * 1. Reloj Cósmico TVA (Tick-Tock)
   * Impulso cronométrico mecánico de tiempo cósmico, preciso y misterioso.
   */
  function scheduleTvaClock(time, isTock, accent) {
    if (!audioCtx || !TVA.gainNode) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Alternar tono sutil: Tick (~2250Hz) y Tock (~1720Hz)
      const freq = isTock ? 1720 : 2280;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, time);
      filter.Q.setValueAtTime(14.0, time);

      const peakGain = 0.08 * accent;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peakGain, time + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.028);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(TVA.gainNode);

      osc.start(time);
      osc.stop(time + 0.035);
    } catch (_e) { }
  }

  /**
   * 2. Bajo Ostinato Analógico TVA (Buchla/Moog Sequencer)
   * Secuencia en semicorcheas con filtro de escalera resonante descendente.
   */
  function scheduleTvaBass(time, freq, accent, duration) {
    if (!audioCtx || !TVA.gainNode) return;
    try {
      const osc = audioCtx.createOscillator();
      const subOsc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(freq * 0.5, time);

      // Filtro pasa-bajos analógico con resonancia agresiva (Q = 4.2)
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(3.8, time);
      const cutoffStart = Math.min(1800, freq * 8 * accent);
      filter.frequency.setValueAtTime(cutoffStart, time);
      filter.frequency.exponentialRampToValueAtTime(120, time + duration * 0.85);

      const peakGain = 0.28 * accent;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peakGain, time + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(TVA.gainNode);

      osc.start(time);
      subOsc.start(time);
      osc.stop(time + duration + 0.02);
      subOsc.stop(time + duration + 0.02);
    } catch (_e) { }
  }

  /**
   * 3. Capas Armónicas Orquestales Oscuras (Brass & Cinematic Strings)
   * Acordes solemnes con sub-bajo cinematográfico de 36Hz para peso masivo.
   */
  function scheduleTvaChords(time, chord, duration, isFirstBar) {
    if (!audioCtx || !TVA.gainNode) return;
    try {
      const attack = isFirstBar ? 0.18 : 0.65;
      // Sub-bajo de profundidad cinematográfica
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(chord.sub, time);

      subGain.gain.setValueAtTime(0.0001, time);
      subGain.gain.linearRampToValueAtTime(0.18, time + attack);
      subGain.gain.setValueAtTime(0.18, Math.max(time + attack + 0.02, time + duration - 0.7));
      subGain.gain.linearRampToValueAtTime(0.0001, time + duration);

      subOsc.connect(subGain);
      subGain.connect(TVA.gainNode);
      subOsc.start(time);
      subOsc.stop(time + duration + 0.1);

      // Capa orquestal de metales y cuerdas densas (múltiples voces ligeramente desafinadas)
      chord.notes.forEach((f, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(f, time);
        osc.detune.setValueAtTime((idx % 2 === 0 ? 3.5 : -3.5), time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(540, time);
        filter.frequency.linearRampToValueAtTime(880, time + duration * 0.45);
        filter.frequency.linearRampToValueAtTime(420, time + duration);

        const vGain = 0.065 / Math.sqrt(chord.notes.length);
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(vGain, time + attack);
        gain.gain.setValueAtTime(vGain, Math.max(time + attack + 0.02, time + duration - 0.75));
        gain.gain.linearRampToValueAtTime(0.0001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(TVA.gainNode);

        osc.start(time);
        osc.stop(time + duration + 0.1);
      });
    } catch (_e) { }
  }

  /**
   * 4. Melodía Solista Theremin / Ondes Martenot TVA (Natalie Holt Signature)
   * Onda pura y expresiva con glissando continuo y vibrato lírico tardío.
   */
  function scheduleTvaTheremin(time, freq, duration, glideToFreq) {
    if (!audioCtx || !TVA.gainNode || freq <= 0) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Vibrato LFO (5.4 Hz)
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(5.4, time);

      // El vibrato entra gradualmente después de 0.35s para dar emoción humana
      const vibStart = Math.min(time + 0.35, time + duration * 0.5);
      const vibEnd = Math.max(vibStart + 0.05, Math.min(time + 0.9, time + duration));
      lfoGain.gain.setValueAtTime(0.0, time);
      lfoGain.gain.setValueAtTime(0.0, vibStart);
      lfoGain.gain.linearRampToValueAtTime(freq * 0.016, vibEnd);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(time);

      const attackGlideEnd = Math.min(time + 0.14, time + duration * 0.6);
      osc.type = 'sine';
      // Portamento desde la nota anterior
      osc.frequency.setValueAtTime(TVA.lastThereminFreq, time);
      osc.frequency.exponentialRampToValueAtTime(freq, attackGlideEnd);
      TVA.lastThereminFreq = freq;

      if (glideToFreq && glideToFreq > 0 && duration > 0.25) {
        const glideStart = Math.max(attackGlideEnd + 0.01, time + duration - 0.18);
        osc.frequency.setValueAtTime(freq, glideStart);
        osc.frequency.exponentialRampToValueAtTime(glideToFreq, time + duration);
        TVA.lastThereminFreq = glideToFreq;
      }

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, time);

      const fadeInEnd = Math.min(time + 0.18, time + duration * 0.45);
      const fadeOutStart = Math.max(fadeInEnd + 0.01, time + duration - 0.15);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.24, fadeInEnd);
      gain.gain.setValueAtTime(0.24, fadeOutStart);
      gain.gain.linearRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(TVA.gainNode);

      osc.start(time);
      osc.stop(time + duration + 0.05);
      lfo.stop(time + duration + 0.05);
    } catch (_e) { }
  }

  /* ========================================================================
     SYNTHESIS INSTRUMENTS - TRACK 2 (ANIMAL CROSSING & OCARINA OF ZELDA)
     ======================================================================== */

  /**
   * 1. Melodía Solista de Ocarina / Flauta de Madera Zelda
   * Ocarina dulce y redonda con soplo suave de aire inicial y vibrato nostálgico.
   */
  function scheduleOcarinaNote(time, freq, duration) {
    if (!audioCtx || !AC_ZELDA.gainNode || freq <= 0) return;
    try {
      const osc = audioCtx.createOscillator();
      const oscHarmonic = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Vibrato suave (4.8 Hz, lírico y dulce)
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      const vibStart = Math.min(time + 0.22, time + duration * 0.45);
      const vibEnd = Math.max(vibStart + 0.05, Math.min(time + 0.65, time + duration));
      lfo.frequency.setValueAtTime(4.8, time);
      lfoGain.gain.setValueAtTime(0.0, time);
      lfoGain.gain.setValueAtTime(0.0, vibStart);
      lfoGain.gain.linearRampToValueAtTime(freq * 0.014, vibEnd);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfoGain.connect(oscHarmonic.frequency);
      lfo.start(time);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      // Armónico sutil tipo flauta de arcilla/madera
      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2.0, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.4, time);

      // Envolvente suave y respirada de ocarina
      const fadeInEnd = time + Math.min(0.06, duration * 0.2);
      const fadeOutStart = Math.max(fadeInEnd + 0.01, time + duration - 0.08);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.26, fadeInEnd);
      gain.gain.setValueAtTime(0.23, fadeOutStart);
      gain.gain.linearRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(gain);
      gain.connect(AC_ZELDA.gainNode);

      osc.start(time);
      oscHarmonic.start(time);
      osc.stop(time + duration + 0.05);
      oscHarmonic.stop(time + duration + 0.05);
      lfo.stop(time + duration + 0.05);

      // Soplo de aire sutil de boquilla (Breath noise attack)
      try {
        const noiseBuf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.06), audioCtx.sampleRate);
        const nData = noiseBuf.getChannelData(0);
        for (let i = 0; i < nData.length; i++) {
          nData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (nData.length * 0.35));
        }
        const nSrc = audioCtx.createBufferSource();
        nSrc.buffer = noiseBuf;
        const nFilt = audioCtx.createBiquadFilter();
        nFilt.type = 'bandpass';
        nFilt.frequency.setValueAtTime(freq * 1.5, time);
        nFilt.Q.setValueAtTime(2.0, time);
        const nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime(0.016, time);
        nGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);
        nSrc.connect(nFilt);
        nFilt.connect(nGain);
        nGain.connect(AC_ZELDA.gainNode);
        nSrc.start(time);
      } catch (_e) { }
    } catch (_e) { }
  }

  /**
   * 2. Arpegios de Marimba / Guitarra Acústica Cálida Animal Crossing
   * Plucks de madera cálidos y amables con decaimiento percusivo natural.
   */
  function scheduleAcousticPluck(time, freq, accent) {
    if (!audioCtx || !AC_ZELDA.gainNode) return;
    try {
      const osc = audioCtx.createOscillator();
      const oscBody = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      oscBody.type = 'sine';
      oscBody.frequency.setValueAtTime(freq * 0.5, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(2200, freq * 3.2), time);

      const pGain = 0.065 * accent;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(pGain, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.42);

      osc.connect(filter);
      oscBody.connect(filter);
      filter.connect(gain);
      gain.connect(AC_ZELDA.gainNode);

      osc.start(time);
      oscBody.start(time);
      osc.stop(time + 0.45);
      oscBody.stop(time + 0.45);
    } catch (_e) { }
  }

  /**
   * 3. Contrabajo Acústico Caminante (Upright Pizzicato)
   * Pasos joviales en beats 1 y 3 estilo Animal Crossing.
   */
  function scheduleWalkingBass(time, freq, duration) {
    if (!audioCtx || !AC_ZELDA.gainNode) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.26, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(AC_ZELDA.gainNode);

      osc.start(time);
      osc.stop(time + duration + 0.02);
    } catch (_e) { }
  }

  /**
   * 4. Campanitas y Destellos Pentatónicos Animal Crossing
   */
  function scheduleAcChime(time, freq) {
    if (!audioCtx || !AC_ZELDA.gainNode) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.045, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.1);

      osc.connect(gain);
      gain.connect(AC_ZELDA.gainNode);

      osc.start(time);
      osc.stop(time + 1.15);
    } catch (_e) { }
  }

  /**
   * 5. Viento Marciano de Baja Presión (CO2 Acústica NASA)
   */
  function startMarsWind() {
    clearTimeout(marsWindTimer);
    marsWindTimer = null;
    marsWindGen += 1;
    if (AC_ZELDA.marsWind.active || !audioCtx || !AC_ZELDA.gainNode) return;
    try {
      const now = audioCtx.currentTime;
      const bufferSize = Math.floor(audioCtx.sampleRate * 3.5);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.022 * white) / 1.022;
        data[i] = lastOut * 4.8;
      }

      const windSrc = audioCtx.createBufferSource();
      windSrc.buffer = buffer;
      windSrc.loop = true;

      const windFilt = audioCtx.createBiquadFilter();
      windFilt.type = 'bandpass';
      windFilt.frequency.setValueAtTime(140, now);
      windFilt.Q.setValueAtTime(2.2, now);

      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.12, now);
      lfoGain.gain.setValueAtTime(60, now);
      lfo.connect(lfoGain);
      lfoGain.connect(windFilt.frequency);
      lfo.start(now);

      const windGain = audioCtx.createGain();
      windGain.gain.setValueAtTime(0.0001, now);
      windGain.gain.linearRampToValueAtTime(0.16, now + 0.8);

      windSrc.connect(windFilt);
      windFilt.connect(windGain);
      windGain.connect(AC_ZELDA.gainNode);
      windSrc.start(now);

      AC_ZELDA.marsWind.active = true;
      AC_ZELDA.marsWind.source = windSrc;
      AC_ZELDA.marsWind.filter = windFilt;
      AC_ZELDA.marsWind.lfo = lfo;
      AC_ZELDA.marsWind.gain = windGain;
    } catch (_e) { }
  }

  function stopMarsWind() {
    clearTimeout(marsWindTimer);
    marsWindTimer = null;
    const gen = ++marsWindGen;
    if (!AC_ZELDA.marsWind.active) return;
    AC_ZELDA.marsWind.active = false;
    if (AC_ZELDA.marsWind.gain && audioCtx) {
      try {
        const now = audioCtx.currentTime;
        holdGainParam(AC_ZELDA.marsWind.gain.gain, now);
        AC_ZELDA.marsWind.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
        marsWindTimer = setTimeout(() => {
          if (gen !== marsWindGen) return;
          try {
            if (AC_ZELDA.marsWind.source) AC_ZELDA.marsWind.source.stop();
            if (AC_ZELDA.marsWind.lfo) AC_ZELDA.marsWind.lfo.stop();
          } catch (_e) { }
          AC_ZELDA.marsWind.source = null;
          AC_ZELDA.marsWind.lfo = null;
          AC_ZELDA.marsWind.filter = null;
          AC_ZELDA.marsWind.gain = null;
        }, 780);
      } catch (_e) { }
    }
  }

  /* ========================================================================
     MAIN SCHEDULER LOOP (Lookahead Scheduler Pattern)
     ======================================================================== */

  function tickScheduler() {
    if (!audioCtx || isPaused || audioCtx.state !== 'running') return;

    const currentTime = audioCtx.currentTime;

    // --- TRACK 1: TVA / LOKI ---
    if (TVA.active) {
      const secPer16th = (60 / TVA.bpm) / 4;
      if (TVA.nextNoteTime < currentTime - 0.15) {
        TVA.nextNoteTime = currentTime + 0.015;
      }

      while (TVA.nextNoteTime < currentTime + SCHEDULE_AHEAD_TIME) {
        const t = TVA.nextNoteTime;
        const stepInBar = TVA.current16th % 16;
        const currentChord = TVA.chords[TVA.currentBar % TVA.chords.length];

        // 1. Clockwork pulse (Tick on downbeats, Tock on upbeats)
        const isTock = stepInBar % 2 === 1;
        const clockAccent = (stepInBar === 0 || stepInBar === 8) ? 1.0 : (stepInBar % 4 === 0 ? 0.8 : 0.45);
        scheduleTvaClock(t, isTock, clockAccent);

        // 2. Bass ostinato on every 16th
        const bassStep = TVA.bassPattern[stepInBar];
        const semitoneMultiplier = Math.pow(2, bassStep.semitones / 12);
        const bassFreq = currentChord.root * semitoneMultiplier;
        scheduleTvaBass(t, bassFreq, bassStep.accent, secPer16th * 0.95);

        // 3. Cinematic Chords & Sub-bass on the first 16th of each bar (every 16 steps)
        if (stepInBar === 0) {
          const chordDuration = secPer16th * 16;
          scheduleTvaChords(t, currentChord, chordDuration, TVA.currentBar === 0);
          TVA.currentBar++;
        }

        // 4. Theremin melody
        if (TVA.current16th >= TVA.nextMelody16th) {
          const phrase = TVA.melodyPhrases[TVA.melodyPhraseIdx % TVA.melodyPhrases.length];
          const noteObj = phrase[TVA.melodyNoteIdx];
          if (noteObj) {
            const noteDurationSec = noteObj.d * secPer16th;
            if (noteObj.f > 0) {
              scheduleTvaTheremin(t, noteObj.f, noteDurationSec, noteObj.glideTo);
            }
            TVA.nextMelody16th = TVA.current16th + noteObj.d;
            TVA.melodyNoteIdx++;
            if (TVA.melodyNoteIdx >= phrase.length) {
              TVA.melodyNoteIdx = 0;
              TVA.melodyPhraseIdx++;
            }
          }
        }

        TVA.current16th++;
        TVA.nextNoteTime += secPer16th;
      }
    }

    // --- TRACK 2: ANIMAL CROSSING & OCARINA OF ZELDA ---
    if (AC_ZELDA.active) {
      const secPer16th = (60 / AC_ZELDA.bpm) / 4;
      if (AC_ZELDA.nextNoteTime < currentTime - 0.15) {
        AC_ZELDA.nextNoteTime = currentTime + 0.05;
      }

      while (AC_ZELDA.nextNoteTime < currentTime + SCHEDULE_AHEAD_TIME) {
        const t = AC_ZELDA.nextNoteTime;
        const stepInBar = AC_ZELDA.current16th % 16;
        const currentChord = AC_ZELDA.chords[AC_ZELDA.currentBar % AC_ZELDA.chords.length];

        // 1. Walking Bass en tiempos 1, 2, 3, 4 (cada 4 semicorcheas)
        if (stepInBar % 4 === 0) {
          const walkIdx = Math.floor(stepInBar / 4);
          const bassFreq = currentChord.bassWalk[walkIdx % currentChord.bassWalk.length];
          scheduleWalkingBass(t, bassFreq, secPer16th * 3.4);
        }

        // 2. Acordes arpegiados de marimba/guitarra acústica en contratiempos (estilo Animal Crossing)
        if (stepInBar === 2 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14) {
          const noteIdx = (stepInBar / 2) % currentChord.notes.length;
          const noteFreq = currentChord.notes[noteIdx];
          scheduleAcousticPluck(t, noteFreq, 1.0);
        }
        if (stepInBar === 3 || stepInBar === 7 || stepInBar === 11 || stepInBar === 15) {
          const upperNote = currentChord.notes[(currentChord.notes.length - 1)];
          scheduleAcousticPluck(t, upperNote, 0.65);
        }

        // 3. Bar transition
        if (stepInBar === 0) {
          AC_ZELDA.currentBar++;
          // Chime esporádico cada 2 compases
          if (AC_ZELDA.currentBar % 2 === 0) {
            const chimeNotes = [523.25, 659.25, 783.99, 880.00, 1046.50];
            const chFreq = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
            scheduleAcChime(t + secPer16th * 2, chFreq);
          }
        }

        // 4. Melodía Solista de Ocarina
        if (AC_ZELDA.current16th >= AC_ZELDA.nextMelody16th) {
          const phrase = AC_ZELDA.melodyPhrases[AC_ZELDA.melodyPhraseIdx % AC_ZELDA.melodyPhrases.length];
          const noteObj = phrase[AC_ZELDA.melodyNoteIdx];
          if (noteObj) {
            const noteDurationSec = noteObj.d * secPer16th;
            if (noteObj.f > 0) {
              scheduleOcarinaNote(t, noteObj.f, noteDurationSec);
            }
            AC_ZELDA.nextMelody16th = AC_ZELDA.current16th + noteObj.d;
            AC_ZELDA.melodyNoteIdx++;
            if (AC_ZELDA.melodyNoteIdx >= phrase.length) {
              AC_ZELDA.melodyNoteIdx = 0;
              AC_ZELDA.melodyPhraseIdx++;
            }
          }
        }

        AC_ZELDA.current16th++;
        AC_ZELDA.nextNoteTime += secPer16th;
      }
    }
  }

  /* ========================================================================
     PUBLIC CONTROLLER INTERFACE
     ======================================================================== */

  function startScheduler() {
    if (!schedulerTimer) {
      schedulerTimer = setInterval(tickScheduler, LOOKAHEAD_MS);
    }
  }

  function applyTrack(trackName, forceRestart) {
    const ctx = getContext();
    if (!ctx || !trackName) return;

    const alreadyActive =
      !forceRestart &&
      currentTrackName === trackName &&
      ((trackName === 'menu' && TVA.active) || (trackName === 'scene' && AC_ZELDA.active));

    const now = ctx.currentTime;

    if (trackName === 'menu') {
      clearTimeout(tvaFadeTimer);
      tvaFadeTimer = null;

      // 1. Corte inmediato de programación de ocarina/plucks y decaimiento exponencial natural
      if (AC_ZELDA.active) {
        AC_ZELDA.active = false;
        clearTimeout(acFadeTimer);
        stopMarsWind();
        if (AC_ZELDA.gainNode) {
          holdGainParam(AC_ZELDA.gainNode.gain, now);
          AC_ZELDA.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
        }
      }

      // 2. Entrada inmediata del pulso y bajo ostinato TVA
      if (!alreadyActive) {
        TVA.active = true;
        TVA.nextNoteTime = now + 0.012;
        TVA.current16th = 0;
        TVA.currentBar = 0;
        TVA.nextMelody16th = 0;
        TVA.melodyNoteIdx = 0;
        TVA.melodyPhraseIdx = 0;
        TVA.lastThereminFreq = 293.66;
      }

      if (TVA.gainNode) {
        holdGainParam(TVA.gainNode.gain, now);
        TVA.gainNode.gain.linearRampToValueAtTime(1.0, now + (alreadyActive ? 0.08 : 0.22));
      }

      currentTrackName = 'menu';
      startScheduler();
      tickScheduler();
    } else if (trackName === 'scene') {
      clearTimeout(acFadeTimer);
      acFadeTimer = null;

      // 1. Corte inmediato de notas TVA y liberación exponencial suave
      if (TVA.active) {
        TVA.active = false;
        clearTimeout(tvaFadeTimer);
        if (TVA.gainNode) {
          holdGainParam(TVA.gainNode.gain, now);
          TVA.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
        }
      }

      if (currentSiteId === 'ares-vallis') {
        startMarsWind();
      } else {
        stopMarsWind();
      }

      // 2. Entrada acogedora de arpegios acústicos y ocarina
      if (!alreadyActive) {
        AC_ZELDA.active = true;
        AC_ZELDA.nextNoteTime = now + 0.012;
        AC_ZELDA.current16th = 0;
        AC_ZELDA.currentBar = 0;
        AC_ZELDA.nextMelody16th = 0;
        AC_ZELDA.melodyNoteIdx = 0;
        AC_ZELDA.melodyPhraseIdx = 0;
      }

      if (AC_ZELDA.gainNode) {
        holdGainParam(AC_ZELDA.gainNode.gain, now);
        AC_ZELDA.gainNode.gain.linearRampToValueAtTime(1.0, now + (alreadyActive ? 0.08 : 0.25));
      }

      currentTrackName = 'scene';
      startScheduler();
      tickScheduler();
    }
  }

  function playTrack(trackName, forceRestart) {
    desiredTrackName = trackName;
    const ctx = getContext();
    if (!ctx) return;

    if (ctx.state !== 'running' && typeof ctx.resume === 'function') {
      ctx.resume().then(() => {
        if (ctx.state === 'running' && desiredTrackName && !isPaused) {
          applyTrack(desiredTrackName, Boolean(forceRestart));
        }
      }).catch(() => {});
      return;
    }

    if (ctx.state === 'running') {
      applyTrack(trackName, forceRestart);
    }
  }

  function stop() {
    desiredTrackName = null;
    clearTimeout(tvaFadeTimer);
    clearTimeout(acFadeTimer);
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (TVA.gainNode) {
      holdGainParam(TVA.gainNode.gain, now);
      TVA.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.5);
    }
    if (AC_ZELDA.gainNode) {
      holdGainParam(AC_ZELDA.gainNode.gain, now);
      AC_ZELDA.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.5);
    }
    stopMarsWind();
    tvaFadeTimer = setTimeout(() => {
      if (!desiredTrackName) {
        TVA.active = false;
        AC_ZELDA.active = false;
        currentTrackName = null;
      }
    }, 560);
  }

  function setVolume(vol) {
    currentVolume = Math.max(0, Math.min(1, typeof vol === 'number' ? vol : 0.8));
    isMuted = currentVolume <= 0;
    if (masterGain && audioCtx) {
      const now = audioCtx.currentTime;
      const targetGain = isMuted ? 0.0001 : Math.max(0.0001, currentVolume * 0.75);
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(targetGain, now, 0.06);
    }
  }

  function setDucking(ducked) {
    isDucked = Boolean(ducked);
    if (duckGain && audioCtx) {
      const now = audioCtx.currentTime;
      duckGain.gain.setTargetAtTime(isDucked ? 0.28 : 1.0, now, isDucked ? 0.18 : 0.35);
    }
  }

  function setSite(siteId) {
    currentSiteId = siteId || '';
    if (currentTrackName === 'scene') {
      if (currentSiteId === 'ares-vallis') {
        startMarsWind();
      } else {
        stopMarsWind();
      }
    }
  }

  function pause() {
    isPaused = true;
    if (audioCtx && typeof audioCtx.suspend === 'function') {
      audioCtx.suspend().catch(() => {});
    }
  }

  function resume() {
    isPaused = false;
    if (audioCtx && typeof audioCtx.resume === 'function') {
      audioCtx.resume().then(() => {
        const target = desiredTrackName || currentTrackName;
        if (target && audioCtx && audioCtx.state === 'running') {
          applyTrack(target, false);
        }
      }).catch(() => {});
    }
  }

  const UNLOCK_EVENTS = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];

  // Desbloqueo proactivo y recuperación continua ante interrupciones en fase de captura (Safari/iOS/macOS)
  function unlockOnUserGesture() {
    if (isPaused) return;
    const ctx = getContext();
    if (!ctx) return;

    const target = desiredTrackName || currentTrackName || 'menu';
    desiredTrackName = target;

    // Llamar síncronamente dentro del gesto de usuario para Safari/WebKit
    if (typeof ctx.resume === 'function' && ctx.state !== 'running') {
      ctx.resume().then(() => {
        if (ctx.state === 'running' && !isPaused) {
          applyTrack(desiredTrackName || target, true);
        }
      }).catch(() => {});
    }

    if (ctx.state === 'running') {
      if (!schedulerTimer || (!TVA.active && !AC_ZELDA.active)) {
        applyTrack(target, true);
      }
    }
  }

  if (typeof global.addEventListener === 'function') {
    UNLOCK_EVENTS.forEach((evt) => {
      global.addEventListener(evt, unlockOnUserGesture, { capture: true, passive: true });
    });
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pause();
      } else {
        resume();
      }
    });
  }

  global.CYBERPENGUINS_MUSIC = {
    init: getContext,
    playTrack,
    stop,
    setVolume,
    setDucking,
    setSite,
    pause,
    resume,
    unlock: unlockOnUserGesture,
    getCurrentTrack: () => currentTrackName
  };

})(typeof window !== 'undefined' ? window : this);
