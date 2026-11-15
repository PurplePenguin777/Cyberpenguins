/**
 * Controlador principal de Cyberpenguins.
 * Gestiona cinemática inicial, maqueta isométrica, movimiento de Cyberpenguin,
 * diálogos en plantilla + Web Speech API, pasaporte con patitas de pingüino,
 * 3 quizzes de 2 preguntas x 4 opciones en blanco, insignias, certificado y localStorage.
 */
(function (global) {
  'use strict';

  const DATA = global.CYBERPENGUINS_DATA;
  const MODELS = global.CYBERPENGUINS_MODELS;
  const TTS = global.CYBERPENGUINS_TTS;
  const FX = global.CYBERPENGUINS_FX;

  const DEFAULT_STATE = {
    launched: false,
    currentChapterId: 'moon',
    currentSiteByChapter: {
      moon: 0,
      mars: 0,
      'deep-space': 0
    },
    inspectedMachines: [],
    collectedSamples: [],
    completedChapters: [],
    chapterStars: {
      moon: 0,
      mars: 0,
      'deep-space': 0
    },
    quizAnswers: {
      moon: [null, null],
      mars: [null, null],
      'deep-space': [null, null]
    }
  };

  let state = loadState();
  let penguinPos = { x: 27, y: 71 };
  let penguinDir = 'right';
  let hatchOpen = true;
  let walkTimer = null;
  let walkSequenceTimers = [];
  let jumpTimer = null;
  let descendTimer = null;
  let evaRafId = null;
  let evaVisualPos = { x: 34, y: 62 };
  let evaFromPos = { x: 34, y: 62 };
  let evaAnimStart = 0;
  let evaAnimDuration = 680;
  let evaPhase = 0;
  let titleCardTimers = [];
  let dialogueAutoTimer = null;
  let leftShipArea = false;
  let proximityMachineId = null;
  let isJumping = false;
  let soundEnabled = true;
  let audioCtx = null;

  // Datos gravitacionales reales de la NASA por cuerpo celeste
  const GRAVITY_PROFILES = {
    moon: {
      label: '1.62 m/s² (0.165 g)',
      gravityClass: 'gravity-moon',
      jumpClass: 'jumping-moon',
      descendClass: 'descending-moon',
      descendDurationMs: 920,
      stepDurationMs: 600,
      jumpDurationMs: 1120,
      jumpAdvanceDist: 8.5,
      dustOnJump: true,
      isEva: false
    },
    mars: {
      label: '3.71 m/s² (0.379 g)',
      gravityClass: 'gravity-mars',
      jumpClass: 'jumping-mars',
      descendClass: 'descending-mars',
      descendDurationMs: 520,
      stepDurationMs: 410,
      jumpDurationMs: 520,
      jumpAdvanceDist: 3.8,
      dustOnJump: true,
      isEva: false
    },
    'asteroid-eros': {
      label: '0.0059 m/s² (0.0006 g) · EVA',
      gravityClass: 'gravity-eros',
      jumpClass: 'jumping-eros',
      descendClass: 'descending-eva',
      descendDurationMs: 1080,
      stepDurationMs: 800,
      jumpDurationMs: 1480,
      jumpAdvanceDist: 10.5,
      dustOnJump: false,
      isEva: true
    },
    'deep-space': {
      label: '0 m/s² (0 g) · EVA',
      gravityClass: 'gravity-deep',
      jumpClass: 'jumping-deep',
      descendClass: 'descending-eva',
      descendDurationMs: 1080,
      stepDurationMs: 740,
      jumpDurationMs: 1320,
      jumpAdvanceDist: 9.5,
      dustOnJump: false,
      isEva: true
    }
  };
  let launchTimers = [];
  let isOpeningLaunch = false;
  let cinematicTimer = null;
  let cinematicOnFinish = null;
  let activeDialogueMachine = null;
  let activeDialogueTurn = 0;
  let activeDialogueToken = 0;
  let activeQuizChapterId = state.currentChapterId;

  const dom = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheDom();
    if (FX && typeof FX.init === 'function') {
      FX.init({
        boardEl: dom.isoBoard,
        canvasEl: dom.stageFxCanvas,
        lightingEl: dom.stageLightingOverlay
      });
    }
    bindEvents();
    renderLaunchShip();
    updateHUD();
    loadChapterScene(state.currentChapterId, false);
    if (FX && typeof FX.pause === 'function') {
      FX.pause();
    }
    if (state.launched) {
      dom.launchScreen.classList.add('hidden-screen', 'is-hidden');
      showHomeScreen();
    } else {
      startLaunchCinematic();
    }
  }

  function cacheDom() {
    dom.orientationBanner = document.getElementById('orientation-banner');
    dom.dismissOrientationBtn = document.getElementById('dismiss-orientation-btn');

    dom.launchScreen = document.getElementById('launch-screen');
    dom.launchShipWrapper = document.getElementById('launch-ship-wrapper');
    dom.launchShipSvg = document.getElementById('launch-ship-svg');
    dom.launchBtn = document.getElementById('launch-btn');

    dom.travelCinematic = document.getElementById('travel-cinematic');
    dom.travelCinematicStage = document.getElementById('travel-cinematic-stage');
    dom.travelCinematicCaption = document.getElementById('travel-cinematic-caption');
    dom.travelCinematicDots = document.getElementById('travel-cinematic-dots');
    dom.travelSkipBtn = document.getElementById('travel-skip-btn');

    dom.homeScreen = document.getElementById('home-screen');
    dom.homeStartBtn = document.getElementById('home-start-btn');
    dom.homePassportSlots = document.getElementById('home-passport-slots');
    dom.homeTotalStars = document.getElementById('home-total-stars');
    dom.homeBadgesGrid = document.getElementById('home-badges-grid');
    dom.homeChaptersCompletedCount = document.getElementById('home-chapters-completed-count');
    dom.homeCertificateStatus = document.getElementById('home-certificate-status');
    dom.homeDownloadCertificateBtn = document.getElementById('home-download-certificate-btn');

    dom.gameScreen = document.getElementById('game-screen');
    dom.chapterNav = document.getElementById('chapter-nav');
    dom.hudPassportCount = document.getElementById('hud-passport-count');
    dom.hudBadgeName = document.getElementById('hud-badge-name');
    dom.backHomeBtn = document.getElementById('back-home-btn');

    dom.openPassportBtn = document.getElementById('open-passport-btn');
    dom.openBadgesBtn = document.getElementById('open-badges-btn');
    dom.openCertificateBtn = document.getElementById('open-certificate-btn');
    dom.resetProgressBtn = document.getElementById('reset-progress-btn');

    dom.isoBoard = document.getElementById('iso-board');
    dom.stageBackdropLayer = document.getElementById('stage-backdrop-layer');
    dom.stageFxCanvas = document.getElementById('stage-fx-canvas');
    dom.evaTetherLayer = document.getElementById('eva-tether-layer');
    dom.stageEntitiesLayer = document.getElementById('stage-entities-layer');
    dom.stageLightingOverlay = document.getElementById('stage-lighting-overlay');
    dom.stageLocationPill = document.getElementById('stage-location-pill');
    dom.soundToggleBtn = document.getElementById('sound-toggle-btn');
    dom.chapterTitleCard = document.getElementById('chapter-title-card');
    dom.chapterCardNumeral = document.getElementById('chapter-card-numeral');
    dom.chapterCardTitle = document.getElementById('chapter-card-title');
    dom.chapterCardSubtitle = document.getElementById('chapter-card-subtitle');
    dom.penguinActor = document.getElementById('penguin-actor');
    dom.penguinSprite = document.getElementById('penguin-sprite');

    // Cajón inferior automático de diálogo interactivo con TTS y selector de temas
    dom.dialogueModal = document.getElementById('dialogue-modal');
    dom.dialogueBox = document.getElementById('dialogue-box');
    dom.dialogueMachinePreview = document.getElementById('dialogue-machine-preview');
    dom.dialogueMachineName = document.getElementById('dialogue-machine-name');
    dom.dialogueBlankSlot = document.getElementById('dialogue-blank-slot');
    dom.dialogueTopicsContainer = document.getElementById('dialogue-topics-container');

    dom.quizModal = document.getElementById('quiz-modal');
    dom.quizStarsBadge = document.getElementById('quiz-stars-badge');
    dom.quizChapterTabs = document.getElementById('quiz-chapter-tabs');
    dom.quizQuestionsContainer = document.getElementById('quiz-questions-container');
    dom.quizValidateBtn = document.getElementById('quiz-validate-btn');
    dom.quizTravelBtn = document.getElementById('quiz-travel-btn');
    dom.quizCloseBtn = document.getElementById('quiz-close-btn');

    dom.passportModal = document.getElementById('passport-modal');
    dom.passportSlots = document.getElementById('passport-slots');
    dom.passportCloseBtn = document.getElementById('passport-close-btn');

    dom.badgesModal = document.getElementById('badges-modal');
    dom.badgesTotalStars = document.getElementById('badges-total-stars');
    dom.badgesGrid = document.getElementById('badges-grid');
    dom.badgesCloseBtn = document.getElementById('badges-close-btn');

    dom.certificateModal = document.getElementById('certificate-modal');
    dom.certificateLevel = document.getElementById('certificate-level');
    dom.certificatePaw = document.getElementById('certificate-paw');
    dom.downloadCertificateBtn = document.getElementById('download-certificate-btn');
    dom.certificateCloseBtn = document.getElementById('certificate-close-btn');
  }

  function bindEvents() {
    dom.dismissOrientationBtn.addEventListener('click', () => {
      dom.orientationBanner.classList.add('dismissed');
    });

    dom.launchBtn.addEventListener('click', () => {
      if (isOpeningLaunch) {
        finishOpeningLaunch();
      } else {
        startLaunchCinematic();
      }
    });
    dom.travelSkipBtn.addEventListener('click', skipTravelSequence);

    dom.homeStartBtn.addEventListener('click', () => enterChapterFromHome(state.currentChapterId));
    dom.backHomeBtn.addEventListener('click', showHomeScreen);
    if (dom.soundToggleBtn) {
      dom.soundToggleBtn.addEventListener('click', toggleSound);
    }

    dom.openPassportBtn.addEventListener('click', openPassportModal);
    dom.openBadgesBtn.addEventListener('click', openBadgesModal);
    dom.openCertificateBtn.addEventListener('click', openCertificateModal);
    dom.homeDownloadCertificateBtn.addEventListener('click', downloadCertificate);
    dom.downloadCertificateBtn.addEventListener('click', downloadCertificate);
    dom.resetProgressBtn.addEventListener('click', resetProgress);

    dom.quizCloseBtn.addEventListener('click', closeQuizModal);
    dom.quizValidateBtn.addEventListener('click', validateActiveQuiz);
    dom.quizTravelBtn.addEventListener('click', travelFromQuiz);

    dom.passportCloseBtn.addEventListener('click', () => hideModal(dom.passportModal));
    dom.badgesCloseBtn.addEventListener('click', () => hideModal(dom.badgesModal));
    dom.certificateCloseBtn.addEventListener('click', () => hideModal(dom.certificateModal));

    if (dom.dialogueBox) {
      dom.dialogueBox.addEventListener('click', (e) => {
        if (e.target.closest('.dialogue-topic-btn')) return;
        advanceDialogue();
      });
    }

    // Cerrar modales al hacer clic fuera del panel
    [
      { el: dom.quizModal, onClose: closeQuizModal },
      { el: dom.passportModal, onClose: () => hideModal(dom.passportModal) },
      { el: dom.badgesModal, onClose: () => hideModal(dom.badgesModal) },
      { el: dom.certificateModal, onClose: () => hideModal(dom.certificateModal) }
    ].forEach(({ el, onClose }) => {
      el.addEventListener('click', (event) => {
        if (event.target === el) onClose();
      });
    });

    // Paralaje sutil 2.5D con movimiento del cursor sobre el escenario
    dom.isoBoard.addEventListener('mousemove', (event) => {
      if (!FX || typeof FX.setCameraParallax !== 'function') return;
      const rect = dom.isoBoard.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      FX.setCameraParallax(nx, ny);
    });

    dom.isoBoard.addEventListener('mouseleave', () => {
      if (FX && typeof FX.setCameraParallax === 'function') {
        FX.setCameraParallax(0, 0);
      }
    });

    // Clic directo sobre Cyberpenguin para saltar según la gravedad del entorno
    if (dom.penguinActor) {
      dom.penguinActor.addEventListener('click', (event) => {
        event.stopPropagation();
        triggerGravityJump();
      });
    }

    // Clic en el escenario para caminar sobre la superficie o flotar en caminata EVA
    dom.isoBoard.addEventListener('click', (event) => {
      if (
        event.target.closest('.stage-hotspot') ||
        event.target.closest('#penguin-actor') ||
        event.target.closest('.back-home-btn') ||
        event.target.closest('.sound-toggle-btn')
      ) {
        return;
      }
      const rect = dom.isoBoard.getBoundingClientRect();
      const pctX = ((event.clientX - rect.left) / rect.width) * 100;
      const pctY = ((event.clientY - rect.top) / rect.height) * 100;
      const chapter = getChapter(state.currentChapterId);
      const safeTarget = resolveSurfacePoint(pctX, pctY, chapter, penguinPos);
      spawnRipple(safeTarget.x, safeTarget.y);
      routeAndMove(safeTarget.x, safeTarget.y, checkSurfaceProximity);
    });

    // Teclado (Flechas / WASD para mover, Espacio para saltar)
    document.addEventListener('keydown', (event) => {
      if (isBlockingModalOpen() || dom.gameScreen.classList.contains('is-hidden')) {
        if (event.key === 'Escape') {
          closeAllModals();
        }
        return;
      }

      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        triggerGravityJump();
        return;
      }

      const keyMap = {
        ArrowUp: 'up',
        w: 'up',
        W: 'up',
        ArrowDown: 'down',
        s: 'down',
        S: 'down',
        ArrowLeft: 'left',
        a: 'left',
        A: 'left',
        ArrowRight: 'right',
        d: 'right',
        D: 'right'
      };

      const dir = keyMap[event.key];
      if (dir) {
        event.preventDefault();
        stepPenguin(dir);
      }
    });
  }

  /* ========================================================================
     Persistencia en localStorage
     ======================================================================== */

  function loadState() {
    try {
      const raw = global.localStorage.getItem(DATA.STORAGE_KEY);
      if (!raw) return cloneDefaultState();
      const parsed = JSON.parse(raw);
      return {
        ...cloneDefaultState(),
        ...parsed,
        currentSiteByChapter: {
          ...DEFAULT_STATE.currentSiteByChapter,
          ...(parsed.currentSiteByChapter || {})
        },
        completedChapters: Array.isArray(parsed.completedChapters) ? parsed.completedChapters : [],
        chapterStars: { ...DEFAULT_STATE.chapterStars, ...(parsed.chapterStars || {}) },
        quizAnswers: { ...DEFAULT_STATE.quizAnswers, ...(parsed.quizAnswers || {}) }
      };
    } catch (_err) {
      return cloneDefaultState();
    }
  }

  function cloneDefaultState() {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function saveState() {
    try {
      global.localStorage.setItem(DATA.STORAGE_KEY, JSON.stringify(state));
    } catch (_err) {
      // Ignorar si almacenamiento privado bloquea escritura
    }
  }

  function isChapterCompleted(chapterId) {
    return (
      (Number(state.chapterStars && state.chapterStars[chapterId]) || 0) > 0 ||
      (Array.isArray(state.completedChapters) && state.completedChapters.includes(chapterId))
    );
  }

  function areAllChaptersCompleted() {
    return DATA.CHAPTERS.every((ch) => isChapterCompleted(ch.id));
  }

  function markChapterCompleted(chapterId) {
    if (!Array.isArray(state.completedChapters)) {
      state.completedChapters = [];
    }
    if (!state.completedChapters.includes(chapterId)) {
      state.completedChapters.push(chapterId);
    }
  }

  function showHomeScreen() {
    closeAllModals();
    clearWalkTimers();
    clearTitleCardTimers();
    TTS.stop();
    if (FX && typeof FX.pause === 'function') {
      FX.pause();
    }
    dom.gameScreen.classList.add('is-hidden');
    dom.launchScreen.classList.add('is-hidden');
    dom.homeScreen.classList.remove('is-hidden');
    updateHUD();
  }

  function enterChapterFromHome(chapterId) {
    const targetId = chapterId || state.currentChapterId || 'moon';
    closeAllModals();
    dom.homeScreen.classList.add('is-hidden');
    dom.launchScreen.classList.add('is-hidden');
    dom.gameScreen.classList.remove('is-hidden');
    if (FX && typeof FX.resume === 'function') {
      FX.resume();
    }
    loadChapterScene(targetId, true);
    if (dom.isoBoard && typeof dom.isoBoard.focus === 'function') {
      dom.isoBoard.focus({ preventScroll: true });
    }
  }

  function resetProgress() {
    clearWalkTimers();
    clearTitleCardTimers();
    clearLaunchTimers();
    clearTimeout(cinematicTimer);
    isOpeningLaunch = false;
    cinematicOnFinish = null;
    dom.travelCinematic.classList.add('is-hidden');
    TTS.stop();
    state = cloneDefaultState();
    state.launched = true;
    saveState();
    loadChapterScene(state.currentChapterId, false);
    showHomeScreen();
  }

  /* ========================================================================
     Paisaje Sonoro Generativo (Web Audio API · Escala Pentatónica)
     ======================================================================== */

  function getAudioContext() {
    if (!soundEnabled) return null;
    try {
      const Ctx = global.AudioContext || global.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtx) {
        audioCtx = new Ctx();
      }
      if (audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    } catch (_err) {
      return null;
    }
  }

  function playHarmony(type) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const presets = {
      step: { freqs: [523.25, 659.25], gain: 0.025, stepMs: 35, duration: 0.16, wave: 'sine' },
      jump: { freqs: [440.0, 587.33, 783.99], gain: 0.036, stepMs: 38, duration: 0.24, wave: 'sine' },
      rcs: { freqs: [880.0, 1174.66], gain: 0.018, stepMs: 28, duration: 0.14, wave: 'triangle' },
      sample: { freqs: [523.25, 659.25, 783.99, 1046.5], gain: 0.05, stepMs: 65, duration: 0.55, wave: 'sine' },
      arrival: { freqs: [261.63, 392.0, 493.88, 659.25], gain: 0.038, stepMs: 75, duration: 0.85, wave: 'sine' }
    };
    const preset = presets[type];
    if (!preset) return;

    try {
      const now = ctx.currentTime;
      preset.freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const start = now + (idx * preset.stepMs) / 1000;
        const stop = start + preset.duration;

        osc.type = preset.wave;
        osc.frequency.setValueAtTime(freq, start);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(preset.gain, start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, stop);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(start);
        osc.stop(stop + 0.02);
      });
    } catch (_err) {
      // Ignorar si el navegador restringe Web Audio antes de interacción
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (dom.soundToggleBtn) {
      dom.soundToggleBtn.classList.toggle('is-muted', !soundEnabled);
      dom.soundToggleBtn.setAttribute('aria-pressed', String(soundEnabled));
    }
    if (soundEnabled) {
      playHarmony('step');
    }
  }

  /* ========================================================================
     Cinemáticas de Lanzamiento desde la Tierra & Viajes Espaciales
     ======================================================================== */

  const ARRIVAL_STEPS = {
    moon: { key: 'moon-arrival', label: 'Surveyor 3', duration: 1350 },
    mars: { key: 'mars-arrival', label: 'Viking 1', duration: 1350 },
    'deep-space': {
      key: 'deep-space-arrival',
      label: 'Pioneer 10',
      duration: 1400
    }
  };

  const LIFTOFF_STEPS = {
    moon: { key: 'moon-liftoff', label: 'La Luna', duration: 1300 },
    mars: { key: 'mars-liftoff', label: 'Marte', duration: 1300 }
  };

  function renderLaunchShip() {
    dom.launchShipSvg.innerHTML = MODELS.spaceship({ hatchOpen: false, launching: false });
  }

  function clearLaunchTimers() {
    launchTimers.forEach((id) => clearTimeout(id));
    launchTimers = [];
  }

  function finishOpeningLaunch() {
    isOpeningLaunch = false;
    clearLaunchTimers();
    dom.launchScreen.classList.add('hidden-screen');
    dom.launchScreen.classList.add('is-hidden');
    showHomeScreen();
  }

  const NASA_INSPIRATIONAL_QUOTES = [
    { quote: '«Las cosas difíciles son las que más vale la pena intentar.»', author: 'Margaret Hamilton · Directora de Software Apolo, NASA' },
    { quote: '«El trabajo en equipo y la curiosidad convierten lo imposible en realidad.»', author: 'Gene Kranz · Director de Vuelo Apolo 11' },
    { quote: '«Apunta a las estrellas: con dedicación y ciencia no existen límites.»', author: 'Katherine Johnson · Matemática e Ingeniera de la NASA' }
  ];

  function startLaunchCinematic() {
    clearLaunchTimers();
    isOpeningLaunch = true;
    dom.homeScreen.classList.add('is-hidden');
    dom.gameScreen.classList.add('is-hidden');
    dom.launchScreen.classList.remove('hidden-screen', 'is-hidden', 'igniting-pad');
    dom.launchShipWrapper.classList.remove('igniting', 'blasting-off');

    const quoteEl = document.getElementById('launch-quote-text');
    const authorEl = document.getElementById('launch-quote-author');
    if (quoteEl && authorEl) {
      quoteEl.textContent = NASA_INSPIRATIONAL_QUOTES[0].quote;
      authorEl.textContent = NASA_INSPIRATIONAL_QUOTES[0].author;
    }

    dom.launchScreen.classList.add('igniting-pad');
    dom.launchShipWrapper.classList.add('igniting');

    const t1 = setTimeout(() => {
      dom.launchShipWrapper.classList.remove('igniting');
      dom.launchShipWrapper.classList.add('blasting-off');
    }, 650);

    const t2 = setTimeout(() => {
      if (!isOpeningLaunch) return;
      state.launched = true;
      saveState();
      dom.launchScreen.classList.add('hidden-screen', 'is-hidden');

      playTravelSequence([
        { key: 'earth-liftoff', label: NASA_INSPIRATIONAL_QUOTES[0].quote, duration: 1750 },
        { key: 'atmosphere-exit', label: NASA_INSPIRATIONAL_QUOTES[1].quote, duration: 1750 },
        { key: 'moon-arrival', label: NASA_INSPIRATIONAL_QUOTES[2].quote, duration: 1750 }
      ], () => {
        finishOpeningLaunch();
      });
    }, 1550);

    launchTimers.push(t1, t2);
  }

  function playTravelSequence(steps, onComplete) {
    clearTimeout(cinematicTimer);
    cinematicOnFinish = onComplete || null;

    if (!steps || steps.length === 0) {
      dom.travelCinematic.classList.add('is-hidden');
      if (dom.travelCinematicCaption) dom.travelCinematicCaption.textContent = '';
      if (dom.travelCinematicDots) dom.travelCinematicDots.innerHTML = '';
      if (cinematicOnFinish) {
        const cb = cinematicOnFinish;
        cinematicOnFinish = null;
        cb();
      }
      return;
    }

    dom.travelCinematic.classList.remove('is-hidden');
    if (dom.travelCinematicDots) {
      dom.travelCinematicDots.innerHTML = steps
        .map(() => '<span class="travel-dot"></span>')
        .join('');
    }
    let idx = 0;

    function runStep() {
      if (idx >= steps.length) {
        skipTravelSequence();
        return;
      }
      const step = steps[idx];
      dom.travelCinematicStage.innerHTML = MODELS.travelCinematicSvg(step.key);
      if (dom.travelCinematicCaption) {
        dom.travelCinematicCaption.textContent = step.label || '';
      }
      if (dom.travelCinematicDots) {
        dom.travelCinematicDots.querySelectorAll('.travel-dot').forEach((dot, dIdx) => {
          dot.classList.toggle('is-active', dIdx === idx);
          dot.classList.toggle('is-done', dIdx < idx);
        });
      }
      idx += 1;
      cinematicTimer = setTimeout(runStep, step.duration);
    }

    runStep();
  }

  function skipTravelSequence() {
    clearTimeout(cinematicTimer);
    dom.travelCinematic.classList.add('is-hidden');
    dom.travelCinematicStage.innerHTML = '';
    if (dom.travelCinematicCaption) dom.travelCinematicCaption.textContent = '';
    if (dom.travelCinematicDots) dom.travelCinematicDots.innerHTML = '';
    if (isOpeningLaunch) {
      finishOpeningLaunch();
      cinematicOnFinish = null;
      return;
    }
    if (cinematicOnFinish) {
      const cb = cinematicOnFinish;
      cinematicOnFinish = null;
      cb();
    }
  }

  function travelBetweenChapters(fromChapterId, toChapterId) {
    if (!state.currentSiteByChapter) {
      state.currentSiteByChapter = { ...DEFAULT_STATE.currentSiteByChapter };
    }
    state.currentSiteByChapter[toChapterId] = 0;
    saveState();

    const steps = [];
    if (LIFTOFF_STEPS[fromChapterId]) {
      steps.push(LIFTOFF_STEPS[fromChapterId]);
    }
    if (ARRIVAL_STEPS[toChapterId]) {
      steps.push(ARRIVAL_STEPS[toChapterId]);
    }

    playTravelSequence(steps, () => {
      state.currentSiteByChapter[toChapterId] = 0;
      loadChapterScene(toChapterId, true);
    });
  }

  function travelBetweenSites(chapterId, fromSiteIdx, toSiteIdx) {
    const chapter = getChapter(chapterId);
    const fromMachine = chapter.machines[fromSiteIdx] || chapter.machines[0];
    const toMachine = chapter.machines[toSiteIdx] || chapter.machines[0];
    if (!fromMachine || !toMachine) return;

    closeDialogueModal();
    clearWalkTimers();
    dom.penguinActor.classList.remove('walking');
    if (FX && typeof FX.pause === 'function') {
      FX.pause();
    }
    if (dom.evaTetherLayer) {
      dom.evaTetherLayer.classList.add('is-hidden');
      dom.evaTetherLayer.innerHTML = '';
    }
    hatchOpen = false;
    const shipSvg = document.getElementById('stage-ship-svg');
    if (shipSvg) {
      shipSvg.innerHTML = MODELS.spaceship({
        hatchOpen: false,
        launching: true,
        penguinInHatch: false,
        inSpaceFlight: !chapter.hasSurface
      });
    }

    const steps = [];
    if (chapter.id === 'moon') {
      steps.push(
        { key: 'moon-liftoff', label: fromMachine.name, duration: 1150 },
        { key: 'moon-suborbital', label: toMachine.name, duration: 1350 },
        { key: 'moon-arrival', label: toMachine.name, duration: 1150 }
      );
    } else if (chapter.id === 'mars') {
      steps.push(
        { key: 'mars-liftoff', label: fromMachine.name, duration: 1150 },
        { key: 'mars-suborbital', label: toMachine.name, duration: 1350 },
        { key: 'mars-arrival', label: toMachine.name, duration: 1150 }
      );
    } else {
      steps.push(
        {
          key: 'deep-space-eros-transit',
          label: toMachine.name,
          duration: 1350
        },
        { key: 'deep-space-arrival', label: toMachine.name, duration: 1150 }
      );
    }

    playTravelSequence(steps, () => {
      if (!state.currentSiteByChapter) {
        state.currentSiteByChapter = { ...DEFAULT_STATE.currentSiteByChapter };
      }
      state.currentSiteByChapter[chapterId] = toSiteIdx;
      saveState();
      loadChapterScene(chapterId, true);
    });
  }

  /* ========================================================================
     Escenario Espacial & Movimiento de Cyberpenguin
     ======================================================================== */

  function getChapter(chapterId) {
    return DATA.CHAPTERS.find((c) => c.id === chapterId) || DATA.CHAPTERS[0];
  }

  function getActiveSite(chapter) {
    const rawIdx = state.currentSiteByChapter ? Number(state.currentSiteByChapter[chapter.id]) : 0;
    const siteIdx = Number.isInteger(rawIdx) && rawIdx >= 0 && rawIdx < chapter.machines.length ? rawIdx : 0;
    const activeMachine = chapter.machines[siteIdx] || chapter.machines[0] || null;
    return { siteIdx, activeMachine };
  }

  function clearTitleCardTimers() {
    titleCardTimers.forEach((id) => clearTimeout(id));
    titleCardTimers = [];
    if (dom.chapterTitleCard) {
      dom.chapterTitleCard.classList.remove('is-visible');
      dom.chapterTitleCard.classList.add('is-hidden');
    }
  }

  function showChapterTitleCard(chapter, activeMachine) {
    if (!dom.chapterTitleCard) return;
    clearTitleCardTimers();
    if (dom.chapterCardNumeral) {
      dom.chapterCardNumeral.textContent = '';
    }
    if (dom.chapterCardTitle) {
      dom.chapterCardTitle.textContent = activeMachine ? activeMachine.name : chapter.name;
    }
    if (dom.chapterCardSubtitle) {
      dom.chapterCardSubtitle.textContent = chapter.name;
    }
    dom.chapterTitleCard.classList.remove('is-hidden');
    void dom.chapterTitleCard.offsetWidth;
    dom.chapterTitleCard.classList.add('is-visible');

    const t1 = setTimeout(() => {
      if (dom.chapterTitleCard) {
        dom.chapterTitleCard.classList.remove('is-visible');
      }
    }, 1850);
    const t2 = setTimeout(() => {
      if (dom.chapterTitleCard) {
        dom.chapterTitleCard.classList.add('is-hidden');
      }
    }, 2500);
    titleCardTimers.push(t1, t2);
  }

  function getGravityProfile(chapterId, siteId) {
    const chId = chapterId || state.currentChapterId || 'moon';
    let resolvedSiteId = siteId;
    if (!resolvedSiteId) {
      const chapter = getChapter(chId);
      const { activeMachine } = getActiveSite(chapter);
      resolvedSiteId = activeMachine ? activeMachine.siteId : '';
    }
    if (chId === 'deep-space' && resolvedSiteId === 'asteroid-eros') {
      return GRAVITY_PROFILES['asteroid-eros'];
    }
    return GRAVITY_PROFILES[chId] || GRAVITY_PROFILES.moon;
  }

  function getChapterSamples(chapter) {
    if (!chapter || !chapter.hasSurface) return [];
    if (Array.isArray(chapter.samples)) return chapter.samples;
    return chapter.sample ? [chapter.sample] : [];
  }

  function getSiteSamples(chapter, activeMachine) {
    const allSamples = getChapterSamples(chapter);
    if (!activeMachine || !activeMachine.siteId) return allSamples;
    return allSamples.filter((s) => !s.siteId || s.siteId === activeMachine.siteId);
  }

  function updateLocationPill(chapter, activeMachine) {
    if (!dom.stageLocationPill || !chapter) return;
    dom.stageLocationPill.textContent = activeMachine ? activeMachine.name : chapter.name;
  }

  function loadChapterScene(chapterId, animateDescend) {
    const chapter = getChapter(chapterId);
    const { activeMachine } = getActiveSite(chapter);
    const siteId = activeMachine ? activeMachine.siteId : '';
    const profile = getGravityProfile(chapter.id, siteId);
    clearWalkTimers();
    clearTitleCardTimers();
    state.currentChapterId = chapter.id;
    hatchOpen = true;
    leftShipArea = false;
    proximityMachineId = null;
    isJumping = false;
    closeDialogueModal();
    saveState();

    updateLocationPill(chapter, activeMachine);

    dom.stageBackdropLayer.innerHTML = MODELS.stageBackdrop(chapter.id, siteId || undefined);
    if (FX && typeof FX.setScene === 'function') {
      FX.setScene(chapter.id, siteId);
      if (dom.gameScreen && !dom.gameScreen.classList.contains('is-hidden') && typeof FX.resume === 'function') {
        FX.resume();
      }
      if (typeof FX.resize === 'function') {
        FX.resize();
      }
    }
    renderStageEntities(chapter);
    renderChapterNav();

    dom.isoBoard.classList.remove('no-walk');
    dom.penguinActor.classList.remove(
      'is-hidden',
      'gravity-moon',
      'gravity-mars',
      'gravity-eros',
      'gravity-deep'
    );
    dom.penguinActor.classList.add(profile.gravityClass);
    dom.penguinActor.style.transitionDuration = `${profile.stepDurationMs}ms`;

    if (chapter.hasSurface) {
      const spawn = (activeMachine && activeMachine.spawnPos) || chapter.spawnPos;
      penguinPos = resolveSurfacePoint(spawn.x, spawn.y, chapter);
      if (dom.evaTetherLayer) {
        dom.evaTetherLayer.classList.add('is-hidden');
        dom.evaTetherLayer.innerHTML = '';
      }
    } else {
      // En Espacio Profundo Cyberpenguin realiza caminata espacial (EVA) sujeto por umbilical a la escotilla
      const shipPos = (activeMachine && activeMachine.shipPos) || chapter.shipPos;
      penguinPos = resolveSurfacePoint(shipPos.x + 12, shipPos.y + 4, chapter);
      const hatchAnchor = getHatchAnchor(chapter);
      evaFromPos = animateDescend ? { ...hatchAnchor } : { ...penguinPos };
      evaVisualPos = animateDescend ? { ...hatchAnchor } : { ...penguinPos };
      evaPhase = 0;
      updateEvaTether(evaVisualPos);
    }

    penguinDir = 'right';
    renderPenguin(animateDescend);

    if (animateDescend) {
      showChapterTitleCard(chapter, activeMachine);
      playHarmony('arrival');
    }
  }

  function getObstacleFootprints(chapter) {
    if (!chapter) return [];
    const { activeMachine } = getActiveSite(chapter);
    const shipPos = (activeMachine && activeMachine.shipPos) || chapter.shipPos;
    const obstacles = [
      { id: 'ship', cx: shipPos.x, cy: shipPos.y - 1.5, rx: 8.5, ry: 5.2 }
    ];
    if (activeMachine && activeMachine.pos) {
      obstacles.push({
        id: activeMachine.id,
        cx: activeMachine.pos.x,
        cy: activeMachine.pos.y - 1.5,
        rx: 8.2,
        ry: 5.2
      });
    }
    return obstacles;
  }

  function resolveSurfacePoint(x, y, chapterOverride, fallbackPos) {
    const chapter = chapterOverride || getChapter(state.currentChapterId);
    let pt = clampToSurface(x, y, chapter);
    const obstacles = getObstacleFootprints(chapter);

    for (let pass = 0; pass < 2; pass += 1) {
      obstacles.forEach((obs) => {
        const dx = pt.x - obs.cx;
        const dy = pt.y - obs.cy;
        const nx = dx / obs.rx;
        const ny = dy / obs.ry;
        const norm = Math.hypot(nx, ny);
        if (norm < 1) {
          if (norm < 0.05) {
            pt = clampToSurface(obs.cx, obs.cy + obs.ry + 1.5, chapter);
          } else {
            const scale = 1.05 / norm;
            pt = clampToSurface(obs.cx + nx * obs.rx * scale, obs.cy + ny * obs.ry * scale, chapter);
          }
        }
      });
    }

    if (fallbackPos && getDist(pt, fallbackPos) < 0.4) {
      return { x: Number(fallbackPos.x.toFixed(1)), y: Number(fallbackPos.y.toFixed(1)) };
    }
    return pt;
  }

  function segmentIntersectsObstacle(a, b, obs) {
    const ax = (a.x - obs.cx) / obs.rx;
    const ay = (a.y - obs.cy) / obs.ry;
    const bx = (b.x - obs.cx) / obs.rx;
    const by = (b.y - obs.cy) / obs.ry;
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-6) return false;
    const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lenSq));
    const px = ax + t * dx;
    const py = ay + t * dy;
    return px * px + py * py < 0.96;
  }

  function buildAvoidanceRoute(fromPos, toPos, chapterOverride) {
    const chapter = chapterOverride || getChapter(state.currentChapterId);
    const target = resolveSurfacePoint(toPos.x, toPos.y, chapter);
    const obstacles = getObstacleFootprints(chapter).sort(
      (a, b) => getDist(fromPos, { x: a.cx, y: a.cy }) - getDist(fromPos, { x: b.cx, y: b.cy })
    );

    const waypoints = [];
    let cursor = { x: fromPos.x, y: fromPos.y };

    obstacles.forEach((obs) => {
      if (!segmentIntersectsObstacle(cursor, target, obs)) return;

      const avgY = (cursor.y + target.y) / 2;
      const frontCandidate = resolveSurfacePoint(obs.cx, obs.cy + obs.ry + 3.2, chapter);
      const backCandidate = resolveSurfacePoint(obs.cx, obs.cy - obs.ry - 3.0, chapter);
      const backFitsBehind = backCandidate.y <= obs.cy - obs.ry * 0.85;

      let detour = frontCandidate;
      if (backFitsBehind && avgY < obs.cy - 1.5) {
        detour = backCandidate;
      }
      if (getDist(cursor, detour) > 3 && getDist(detour, target) > 3) {
        waypoints.push(detour);
        cursor = detour;
      }
    });

    waypoints.push(target);
    return waypoints;
  }

  function updateDepthSorting() {
    if (dom.stageEntitiesLayer) {
      dom.stageEntitiesLayer.querySelectorAll('.stage-entity').forEach((el) => {
        const rawTop = el.style && el.style.top ? String(el.style.top).replace('%', '') : '';
        const entityY = Number(el.dataset.sortY || rawTop) || 60;
        el.style.zIndex = String(Math.max(18, Math.min(89, Math.round(entityY))));
      });
    }
    if (dom.penguinActor) {
      dom.penguinActor.style.zIndex = String(Math.max(18, Math.min(90, Math.round(penguinPos.y))));
    }
    if (dom.evaTetherLayer) {
      const chapter = getChapter(state.currentChapterId);
      const { activeMachine } = getActiveSite(chapter);
      const shipPos = (activeMachine && activeMachine.shipPos) || chapter.shipPos;
      dom.evaTetherLayer.style.zIndex = String(Math.max(17, Math.round(Math.min(shipPos.y, penguinPos.y)) - 1));
    }
  }

  function getHatchAnchor(chapter) {
    const { activeMachine } = getActiveSite(chapter);
    const shipPos = (activeMachine && activeMachine.shipPos) || chapter.shipPos;
    return { x: shipPos.x + 1.2, y: shipPos.y + 0.6 };
  }

  function getLiveEvaPositions(chapter, posOverride) {
    const fallbackHatch = getHatchAnchor(chapter);
    const fallbackTarget = posOverride || evaVisualPos || penguinPos;
    let computedTarget = { x: fallbackTarget.x, y: fallbackTarget.y };

    if (isJumping && evaAnimDuration > 0) {
      const elapsed = Date.now() - evaAnimStart;
      const t = Math.min(1, Math.max(0, elapsed / evaAnimDuration));
      const { activeMachine } = getActiveSite(chapter);
      const siteId = activeMachine ? activeMachine.siteId : '';
      const jumpArcPct = (siteId === 'asteroid-eros' ? 9.5 : 5.8) * Math.sin(t * Math.PI);
      computedTarget = {
        x: computedTarget.x,
        y: computedTarget.y - jumpArcPct
      };
    }

    if (
      dom.evaTetherLayer &&
      dom.penguinSprite &&
      typeof dom.evaTetherLayer.getBoundingClientRect === 'function' &&
      typeof dom.penguinSprite.getBoundingClientRect === 'function'
    ) {
      const tetherRect = dom.evaTetherLayer.getBoundingClientRect();
      const spriteRect = dom.penguinSprite.getBoundingClientRect();
      if (
        tetherRect &&
        spriteRect &&
        tetherRect.width > 100 &&
        spriteRect.width > 10 &&
        spriteRect.width < tetherRect.width * 0.4
      ) {
        const spriteCenterX = spriteRect.left + spriteRect.width * 0.5;
        const spriteCenterY = spriteRect.top + spriteRect.height * 0.56;
        const liveX = ((spriteCenterX - tetherRect.left) / tetherRect.width) * 100;
        const liveY = (((spriteCenterY - tetherRect.top) / tetherRect.height) * 594 + 22) / 5.94;
        computedTarget = { x: liveX, y: liveY };

        let liveHatch = fallbackHatch;
        const shipEl = document.getElementById('stage-ship-svg');
        if (shipEl && typeof shipEl.getBoundingClientRect === 'function') {
          const shipRect = shipEl.getBoundingClientRect();
          if (shipRect && shipRect.width > 10 && shipRect.width < tetherRect.width * 0.4) {
            const hatchPxX = shipRect.left + shipRect.width * 0.5;
            const hatchPxY = shipRect.top + shipRect.height * 0.58;
            liveHatch = {
              x: ((hatchPxX - tetherRect.left) / tetherRect.width) * 100,
              y: ((hatchPxY - tetherRect.top) / tetherRect.height) * 100
            };
          }
        }
        return { hatchAnchor: liveHatch, targetPos: computedTarget };
      }
    }

    return { hatchAnchor: fallbackHatch, targetPos: computedTarget };
  }

  function updateEvaTether(posOverride) {
    if (!dom.evaTetherLayer) return;
    const chapter = getChapter(state.currentChapterId);
    if (!chapter || chapter.hasSurface) {
      dom.evaTetherLayer.classList.add('is-hidden');
      dom.evaTetherLayer.innerHTML = '';
      return;
    }
    dom.evaTetherLayer.classList.remove('is-hidden');
    const { hatchAnchor, targetPos } = getLiveEvaPositions(chapter, posOverride);
    dom.evaTetherLayer.innerHTML = MODELS.evaTether(hatchAnchor, targetPos, evaPhase, penguinDir);
  }

  function stopEvaTetherLoop() {
    if (evaRafId && typeof global.cancelAnimationFrame === 'function') {
      global.cancelAnimationFrame(evaRafId);
    }
    evaRafId = null;
  }

  function startEvaTetherLoop(_durationMs = 800) {
    stopEvaTetherLoop();
    const chapter = getChapter(state.currentChapterId);
    if (!chapter || chapter.hasSurface) return;

    if (typeof global.requestAnimationFrame !== 'function') {
      evaVisualPos = { ...penguinPos };
      updateEvaTether(evaVisualPos);
      return;
    }

    const tick = () => {
      const activeChapter = getChapter(state.currentChapterId);
      const gameHidden = dom.gameScreen && dom.gameScreen.classList.contains('is-hidden');
      if (!activeChapter || activeChapter.hasSurface || gameHidden) {
        evaRafId = null;
        return;
      }

      const now = Date.now();
      const elapsed = now - evaAnimStart;
      const t = evaAnimDuration > 0 ? Math.min(1, Math.max(0, elapsed / evaAnimDuration)) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      evaVisualPos = {
        x: evaFromPos.x + (penguinPos.x - evaFromPos.x) * eased,
        y: evaFromPos.y + (penguinPos.y - evaFromPos.y) * eased
      };
      evaPhase += 0.085;
      updateEvaTether(evaVisualPos);

      evaRafId = global.requestAnimationFrame(tick);
    };

    evaRafId = global.requestAnimationFrame(tick);
  }

  function renderStageEntities(chapter) {
    const parts = [];
    const inSpace = !chapter.hasSurface;
    const { siteIdx, activeMachine } = getActiveSite(chapter);
    const shipPos = (activeMachine && activeMachine.shipPos) || chapter.shipPos;
    const isFirstStop = siteIdx === 0 && chapter.machines.length > 1;
    const nextMachine = isFirstStop ? chapter.machines[1] : null;
    const hatchAriaLabel = isFirstStop && nextMachine
      ? `Escotilla · Viajar a ${nextMachine.name}`
      : 'Escotilla · Quiz y Viaje';

    // 1. Nave de Cyberpenguin (con escotilla abierta para descenso o EVA)
    parts.push(`
      <div class="stage-entity ${inSpace ? 'space-float' : ''}" data-sort-y="${shipPos.y}" style="left: ${shipPos.x}%; top: ${shipPos.y}%;">
        <button id="ship-hatch-btn" type="button" class="stage-hotspot" aria-label="${hatchAriaLabel}">
          <div id="stage-ship-svg" class="entity-svg-wrap">
            ${MODELS.spaceship({
              hatchOpen,
              launching: false,
              penguinInHatch: false,
              inSpaceFlight: inSpace
            })}
          </div>
          <span class="entity-status-dot ${state.chapterStars[chapter.id] > 0 ? 'done' : ''}" aria-hidden="true"></span>
        </button>
      </div>
    `);

    // 2. Únicamente la máquina de la ubicación activa (sin etiqueta flotante)
    if (activeMachine) {
      const inspected = state.inspectedMachines.includes(activeMachine.id);
      const modelSvg = MODELS[activeMachine.modelKey] ? MODELS[activeMachine.modelKey]() : '';
      const floatClass = activeMachine.id === 'pioneer-10' ? 'space-float' : '';
      parts.push(`
        <div class="stage-entity ${floatClass}" data-sort-y="${activeMachine.pos.y}" style="left: ${activeMachine.pos.x}%; top: ${activeMachine.pos.y}%;">
          <button type="button" class="stage-hotspot machine-hotspot" data-machine-id="${activeMachine.id}" aria-label="${activeMachine.name}">
            <div class="entity-svg-wrap">${modelSvg}</div>
            <span class="entity-status-dot ${inspected ? 'done' : ''}" aria-hidden="true"></span>
          </button>
        </div>
      `);
    }

    // 3. Muestras geológicas semienterradas de la parada activa (solo en cuerpos con superficie)
    const siteSamples = getSiteSamples(chapter, activeMachine);
    const pendingSamples = siteSamples.filter((s) => !state.collectedSamples.includes(s.id));
    pendingSamples.forEach((sampleObj, idx) => {
      const btnIdAttr = idx === 0 ? 'id="stage-sample-btn" ' : '';
      parts.push(`
        <div class="stage-entity" data-sort-y="${sampleObj.pos.y}" style="left: ${sampleObj.pos.x}%; top: ${sampleObj.pos.y}%;">
          <button ${btnIdAttr}type="button" class="stage-hotspot sample-hotspot" data-sample-id="${sampleObj.id}" aria-label="${sampleObj.label}">
            <div class="entity-svg-wrap">${MODELS.sampleCrystal(chapter.id, sampleObj.variant || 0)}</div>
            <span class="entity-status-dot" aria-hidden="true"></span>
          </button>
        </div>
      `);
    });

    dom.stageEntitiesLayer.innerHTML = parts.join('');
    updateDepthSorting();

    // Listeners de entidades recién creadas
    const hatchBtn = document.getElementById('ship-hatch-btn');
    if (hatchBtn) {
      hatchBtn.addEventListener('click', () => {
        const triggerHatchAction = () => {
          if (isFirstStop) {
            travelBetweenSites(chapter.id, 0, 1);
          } else {
            closeHatchAndOpenQuiz(chapter);
          }
        };

        const boardingPoint = resolveSurfacePoint(shipPos.x + 9.5, shipPos.y + 4.8, chapter);
        routeAndMove(boardingPoint.x, boardingPoint.y, triggerHatchAction);
      });
    }

    document.querySelectorAll('.machine-hotspot').forEach((btn) => {
      btn.addEventListener('click', () => {
        const machine = chapter.machines.find((m) => m.id === btn.dataset.machineId);
        if (!machine) return;
        const offsetX = machine.pos.x > penguinPos.x ? -9.5 : 9.5;
        const approachY = chapter.hasSurface ? machine.pos.y + 5.5 : machine.pos.y + 4.8;
        const target = resolveSurfacePoint(machine.pos.x + offsetX, approachY, chapter);
        routeAndMove(target.x, target.y, () => {
          openDialogueModal(machine);
        });
      });
    });

    document.querySelectorAll('.sample-hotspot').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sampleObj = siteSamples.find((s) => s.id === btn.dataset.sampleId);
        if (!sampleObj) return;
        const sampleTarget = resolveSurfacePoint(sampleObj.pos.x, sampleObj.pos.y, chapter);
        routeAndMove(sampleTarget.x, sampleTarget.y, () => {
          collectSample(chapter, sampleObj);
        });
      });
    });
  }

  function renderPenguin(animateDescend) {
    dom.penguinActor.style.left = `${penguinPos.x}%`;
    dom.penguinActor.style.top = `${penguinPos.y}%`;
    dom.penguinSprite.innerHTML = MODELS.cyberpenguin(penguinDir);
    updateDepthSorting();
    if (FX && typeof FX.setPenguinTarget === 'function') {
      FX.setPenguinTarget(penguinPos);
    }

    if (animateDescend) {
      const chapter = getChapter(state.currentChapterId);
      const { activeMachine } = getActiveSite(chapter);
      const siteId = activeMachine ? activeMachine.siteId : '';
      const profile = getGravityProfile(chapter.id, siteId);

      clearTimeout(descendTimer);
      dom.penguinActor.classList.remove('descending', 'descending-moon', 'descending-mars', 'descending-eva');
      void dom.penguinActor.offsetWidth;
      dom.penguinActor.classList.add(profile.descendClass);

      if (!chapter.hasSurface) {
        evaAnimStart = Date.now();
        evaAnimDuration = profile.descendDurationMs;
        startEvaTetherLoop(profile.descendDurationMs + 80);
        if (FX && typeof FX.emitBurst === 'function') {
          FX.emitBurst(penguinPos, 'rcs', chapter.id, siteId);
        }
      }

      descendTimer = setTimeout(() => {
        if (dom.penguinActor) {
          dom.penguinActor.classList.remove(profile.descendClass);
        }
        if (chapter.hasSurface) {
          spawnDustPuff(penguinPos.x, penguinPos.y);
          if (FX && typeof FX.emitBurst === 'function') {
            FX.emitBurst(penguinPos, 'step', chapter.id, siteId);
          }
        }
      }, profile.descendDurationMs);
    }
  }

  function clearWalkTimers() {
    clearTimeout(walkTimer);
    walkTimer = null;
    clearTimeout(jumpTimer);
    jumpTimer = null;
    clearTimeout(descendTimer);
    descendTimer = null;
    isJumping = false;
    walkSequenceTimers.forEach((id) => clearTimeout(id));
    walkSequenceTimers = [];
    stopEvaTetherLoop();
    if (dom.penguinActor) {
      dom.penguinActor.classList.remove(
        'walking',
        'jumping-moon',
        'jumping-mars',
        'jumping-eros',
        'jumping-deep',
        'descending',
        'descending-moon',
        'descending-mars',
        'descending-eva'
      );
    }
  }

  function routeAndMove(targetX, targetY, onArrive) {
    const chapter = getChapter(state.currentChapterId);
    const route = buildAvoidanceRoute(penguinPos, { x: targetX, y: targetY }, chapter);

    if (route.length <= 1) {
      const dest = route[0] || resolveSurfacePoint(targetX, targetY, chapter, penguinPos);
      moveTo(dest.x, dest.y, onArrive);
      return;
    }

    clearWalkTimers();
    const profile = getGravityProfile(chapter.id);
    const legMs = Math.max(240, Math.round(profile.stepDurationMs * 0.72));

    const runStep = (idx) => {
      if (idx >= route.length) {
        if (dom.penguinActor) {
          dom.penguinActor.classList.remove('walking');
          dom.penguinActor.style.transitionDuration = `${profile.stepDurationMs}ms`;
        }
        if (onArrive) onArrive();
        return;
      }

      const pt = route[idx];
      if (pt.x < penguinPos.x - 1) penguinDir = 'left';
      if (pt.x > penguinPos.x + 1) penguinDir = 'right';

      evaFromPos = { ...evaVisualPos };
      evaAnimStart = Date.now();
      evaAnimDuration = legMs;

      penguinPos = { x: pt.x, y: pt.y };
      if (dom.penguinActor) {
        dom.penguinActor.style.transitionDuration = `${legMs}ms`;
        dom.penguinActor.classList.add('walking');
      }
      renderPenguin(false);
      playHarmony(chapter.hasSurface ? 'step' : 'rcs');
      if (FX && typeof FX.emitBurst === 'function') {
        FX.emitBurst(penguinPos, chapter.hasSurface ? 'step' : 'rcs', chapter.id);
      }

      if (!chapter.hasSurface) {
        startEvaTetherLoop(legMs + 80);
      }

      const t = setTimeout(() => runStep(idx + 1), legMs);
      walkSequenceTimers.push(t);
    };

    runStep(0);
  }

  function moveTo(targetX, targetY, onArrive, durationOverrideMs) {
    const chapter = getChapter(state.currentChapterId);
    const profile = getGravityProfile(chapter.id);
    const durationMs = durationOverrideMs || profile.stepDurationMs;

    clearWalkTimers();
    if (targetX < penguinPos.x - 1) penguinDir = 'left';
    if (targetX > penguinPos.x + 1) penguinDir = 'right';

    evaFromPos = { ...evaVisualPos };
    evaAnimStart = Date.now();
    evaAnimDuration = durationMs;

    penguinPos = { x: targetX, y: targetY };
    if (dom.penguinActor) {
      dom.penguinActor.style.transitionDuration = `${durationMs}ms`;
      dom.penguinActor.classList.add('walking');
    }
    renderPenguin(false);
    playHarmony(chapter.hasSurface ? 'step' : 'rcs');
    if (FX && typeof FX.emitBurst === 'function') {
      FX.emitBurst(penguinPos, chapter.hasSurface ? 'step' : 'rcs', chapter.id);
    }

    if (!chapter.hasSurface) {
      startEvaTetherLoop(durationMs + 160);
    }

    walkTimer = setTimeout(() => {
      if (dom.penguinActor) {
        dom.penguinActor.classList.remove('walking');
      }
      if (onArrive) onArrive();
    }, durationMs + 10);
  }

  function stepPenguin(dir) {
    const chapter = getChapter(state.currentChapterId);
    const stepSize = chapter.hasSurface ? 6 : 7;
    const deltas = {
      up: { dx: 0, dy: -stepSize },
      down: { dx: 0, dy: stepSize },
      left: { dx: -stepSize, dy: 0 },
      right: { dx: stepSize, dy: 0 }
    };
    const d = deltas[dir];
    if (!d) return;

    const target = resolveSurfacePoint(penguinPos.x + d.dx, penguinPos.y + d.dy, chapter, penguinPos);
    const stepMs = Math.max(220, Math.round(getGravityProfile(chapter.id).stepDurationMs * 0.68));
    moveTo(target.x, target.y, checkSurfaceProximity, stepMs);
  }

  function triggerGravityJump() {
    const chapter = getChapter(state.currentChapterId);
    if (!chapter || dom.gameScreen.classList.contains('is-hidden') || isBlockingModalOpen()) return;
    if (isJumping || !dom.penguinActor) return;

    const { activeMachine } = getActiveSite(chapter);
    const siteId = activeMachine ? activeMachine.siteId : '';
    const profile = getGravityProfile(chapter.id, siteId);
    isJumping = true;
    clearTimeout(jumpTimer);

    const dirSign = penguinDir === 'left' ? -1 : 1;
    let hopTarget = resolveSurfacePoint(
      penguinPos.x + dirSign * (profile.jumpAdvanceDist || 5),
      penguinPos.y + (chapter.hasSurface ? 0 : -1.5),
      chapter,
      penguinPos
    );
    if (getDist(hopTarget, penguinPos) < 1.2) {
      hopTarget = resolveSurfacePoint(
        penguinPos.x - dirSign * (profile.jumpAdvanceDist || 5),
        penguinPos.y + (chapter.hasSurface ? 0 : 1.5),
        chapter,
        penguinPos
      );
      if (hopTarget.x < penguinPos.x - 0.5) penguinDir = 'left';
      if (hopTarget.x > penguinPos.x + 0.5) penguinDir = 'right';
    }

    dom.penguinActor.classList.remove('jumping-moon', 'jumping-mars', 'jumping-eros', 'jumping-deep');
    void dom.penguinActor.offsetWidth;
    dom.penguinActor.style.transitionDuration = `${profile.jumpDurationMs}ms`;
    dom.penguinActor.classList.add(profile.jumpClass);

    evaFromPos = { ...evaVisualPos };
    evaAnimStart = Date.now();
    evaAnimDuration = profile.jumpDurationMs;

    penguinPos = { x: hopTarget.x, y: hopTarget.y };
    dom.penguinActor.style.left = `${penguinPos.x}%`;
    dom.penguinActor.style.top = `${penguinPos.y}%`;
    dom.penguinSprite.innerHTML = MODELS.cyberpenguin(penguinDir);
    updateDepthSorting();
    if (FX && typeof FX.setPenguinTarget === 'function') {
      FX.setPenguinTarget(penguinPos);
    }

    if (profile.dustOnJump) {
      spawnDustPuff(penguinPos.x, penguinPos.y);
    }
    playHarmony(chapter.hasSurface ? 'jump' : 'rcs');
    if (FX && typeof FX.emitBurst === 'function') {
      FX.emitBurst(penguinPos, chapter.hasSurface ? 'jump' : 'rcs', chapter.id, siteId);
    }

    if (!chapter.hasSurface) {
      startEvaTetherLoop(profile.jumpDurationMs + 120);
    }

    jumpTimer = setTimeout(() => {
      if (dom.penguinActor) {
        dom.penguinActor.classList.remove(profile.jumpClass);
        dom.penguinActor.style.transitionDuration = `${profile.stepDurationMs}ms`;
      }
      if (profile.dustOnJump) {
        spawnDustPuff(penguinPos.x, penguinPos.y);
      }
      isJumping = false;
    }, profile.jumpDurationMs);
  }

  function getDist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function checkSurfaceProximity() {
    const chapter = getChapter(state.currentChapterId);
    if (!chapter) return;
    if (dom.gameScreen.classList.contains('is-hidden') || isBlockingModalOpen()) return;

    const { siteIdx, activeMachine } = getActiveSite(chapter);
    const shipPos = (activeMachine && activeMachine.shipPos) || chapter.shipPos;
    const isFirstStop = siteIdx === 0 && chapter.machines.length > 1;

    const distToShip = getDist(penguinPos, shipPos);
    if (distToShip > 16.5) {
      leftShipArea = true;
    } else if (leftShipArea && distToShip <= 12.2) {
      leftShipArea = false;
      if (isFirstStop) {
        travelBetweenSites(chapter.id, 0, 1);
      } else {
        closeHatchAndOpenQuiz(chapter);
      }
      return;
    }

    if (chapter.hasSurface) {
      getSiteSamples(chapter, activeMachine).forEach((sampleObj) => {
        if (!state.collectedSamples.includes(sampleObj.id) && getDist(penguinPos, sampleObj.pos) <= 10.5) {
          collectSample(chapter, sampleObj);
        }
      });
    }

    if (activeMachine) {
      const distToMachine = getDist(penguinPos, activeMachine.pos);
      if (distToMachine > 16.5) {
        proximityMachineId = null;
        if (activeDialogueMachine && activeDialogueMachine.id === activeMachine.id) {
          closeDialogueModal();
        }
      } else if (distToMachine <= 12.5 && proximityMachineId !== activeMachine.id) {
        proximityMachineId = activeMachine.id;
        openDialogueModal(activeMachine);
      }
    }
  }

  function clampToSurface(x, y, chapterOverride) {
    const chapter = chapterOverride || getChapter(state.currentChapterId);
    if (chapter && !chapter.hasSurface) {
      const clampedX = Math.max(16, Math.min(84, x));
      const clampedY = Math.max(28, Math.min(84, y));
      return {
        x: Number(clampedX.toFixed(1)),
        y: Number(clampedY.toFixed(1))
      };
    }
    // Mantiene a Cyberpenguin sobre la superficie continua bajo el horizonte curvo del cuerpo celeste
    const clampedX = Math.max(8, Math.min(92, x));
    const minSurfaceY = Math.max(45, 42 + 0.0028 * Math.pow(clampedX - 50, 2));
    const clampedY = Math.max(minSurfaceY, Math.min(88, y));
    return {
      x: Number(clampedX.toFixed(1)),
      y: Number(clampedY.toFixed(1))
    };
  }

  function spawnRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'walk-ripple';
    ripple.style.left = `${x}%`;
    ripple.style.top = `${y}%`;
    dom.isoBoard.appendChild(ripple);
    setTimeout(() => ripple.remove(), 670);
  }

  function spawnDustPuff(x, y) {
    if (!dom.isoBoard) return;
    const puff = document.createElement('div');
    puff.className = 'surface-dust-puff';
    puff.style.left = `${x}%`;
    puff.style.top = `${y}%`;
    dom.isoBoard.appendChild(puff);
    setTimeout(() => puff.remove(), 580);
  }

  /* ========================================================================
     HUD & Sistema de Insignias / Estrellas
     ======================================================================== */

  function getTotalStars() {
    return Object.values(state.chapterStars).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  function getCurrentBadge() {
    const total = getTotalStars();
    let current = DATA.BADGES[0];
    DATA.BADGES.forEach((badge) => {
      if (total >= badge.minStars) current = badge;
    });
    return current;
  }

  function hasChapterPassportStamp(chapter) {
    if (!chapter) return false;
    const samples = getChapterSamples(chapter);
    if (samples.length > 0) {
      return samples.some((s) => state.collectedSamples.includes(s.id));
    }
    return isChapterCompleted(chapter.id) || chapter.machines.some((m) => state.inspectedMachines.includes(m.id));
  }

  function isometricPedestalSvg(chapterId) {
    if (chapterId === 'moon') {
      return `
        <svg class="mv-pedestal-svg" viewBox="0 0 210 76" width="204" height="74" aria-hidden="true">
          <defs>
            <linearGradient id="moonCurvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#e2e8f0" />
              <stop offset="70%" stop-color="#94a3b8" />
              <stop offset="100%" stop-color="#64748b" />
            </linearGradient>
            <linearGradient id="moonDepthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#64748b" />
              <stop offset="100%" stop-color="#1e293b" />
            </linearGradient>
          </defs>
          <!-- Grosor y curvatura de la corteza lunar -->
          <path d="M 18,34 C 18,52 192,52 192,34 L 192,44 C 192,64 18,64 18,44 Z" fill="url(#moonDepthGrad)" />
          <!-- Superficie circular y curvada de la Luna -->
          <ellipse cx="105" cy="34" rx="87" ry="20" fill="url(#moonCurvedGrad)" stroke="rgba(226, 232, 240, 0.45)" stroke-width="1.2" />
          <!-- Cráteres lunares circulares -->
          <ellipse cx="72" cy="33" rx="18" ry="7.5" fill="#64748b" />
          <ellipse cx="73" cy="33.5" rx="14" ry="5.5" fill="#334155" />
          <ellipse cx="71" cy="32" rx="13" ry="5" fill="#1e293b" opacity="0.6" />
          <ellipse cx="140" cy="36" rx="13" ry="5.5" fill="#64748b" />
          <ellipse cx="140" cy="36.5" rx="10" ry="4" fill="#334155" />
          <ellipse cx="108" cy="24" rx="7" ry="3" fill="#475569" />
          <!-- Resplandor tenue en el limbo curvo lunar -->
          <path d="M 22,34 C 55,22 155,22 188,34" fill="none" stroke="#f8fafc" stroke-width="1.2" opacity="0.6" />
        </svg>
      `;
    }
    if (chapterId === 'mars') {
      return `
        <svg class="mv-pedestal-svg" viewBox="0 0 210 76" width="204" height="74" aria-hidden="true">
          <defs>
            <linearGradient id="marsCurvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fb923c" />
              <stop offset="65%" stop-color="#c2410c" />
              <stop offset="100%" stop-color="#9a3412" />
            </linearGradient>
            <linearGradient id="marsDepthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#9a3412" />
              <stop offset="100%" stop-color="#431407" />
            </linearGradient>
          </defs>
          <!-- Grosor y curvatura de la corteza marciana -->
          <path d="M 18,34 C 18,52 192,52 192,34 L 192,44 C 192,64 18,64 18,44 Z" fill="url(#marsDepthGrad)" />
          <!-- Superficie circular y curvada de Marte -->
          <ellipse cx="105" cy="34" rx="87" ry="20" fill="url(#marsCurvedGrad)" stroke="rgba(254, 215, 170, 0.45)" stroke-width="1.2" />
          <!-- Ondulaciones curvas de dunas marcianas -->
          <path d="M 32,32 C 60,38 90,30 120,35 C 145,39 170,33 182,31" fill="none" stroke="#ea580c" stroke-width="2.2" opacity="0.75" />
          <path d="M 45,38 C 75,44 110,38 145,42 C 160,43 170,41 176,38" fill="none" stroke="#7c2d12" stroke-width="1.8" opacity="0.65" />
          <!-- Cráter circular marciano -->
          <ellipse cx="138" cy="32" rx="14" ry="6" fill="#7c2d12" />
          <ellipse cx="138" cy="32.5" rx="10.5" ry="4.2" fill="#431407" />
          <!-- Resplandor en el limbo curvo de Marte -->
          <path d="M 22,34 C 55,22 155,22 188,34" fill="none" stroke="#ffedd5" stroke-width="1.2" opacity="0.7" />
        </svg>
      `;
    }
    return `
      <svg class="mv-pedestal-svg" viewBox="0 0 210 76" width="204" height="74" aria-hidden="true">
        <defs>
          <linearGradient id="deepCurvedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="60%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#050814" />
          </linearGradient>
          <linearGradient id="deepDepthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
        </defs>
        <!-- Estrellas a la lejanía en el vacío cósmico de la Frontera Espacial -->
        <g fill="#f8fafc">
          <circle cx="24" cy="14" r="1.1" opacity="0.75" />
          <circle cx="48" cy="8" r="0.8" opacity="0.6" />
          <circle cx="78" cy="16" r="1.3" fill="#7ee8fa" opacity="0.85" />
          <circle cx="105" cy="6" r="0.9" opacity="0.55" />
          <circle cx="136" cy="12" r="1.2" opacity="0.8" />
          <circle cx="168" cy="8" r="1" fill="#fed7aa" opacity="0.75" />
          <circle cx="188" cy="18" r="0.8" opacity="0.65" />
          <circle cx="16" cy="52" r="0.9" opacity="0.5" />
          <circle cx="38" cy="64" r="1.1" fill="#7ee8fa" opacity="0.7" />
          <circle cx="174" cy="62" r="1.2" opacity="0.75" />
          <circle cx="194" cy="50" r="0.8" fill="#bae6fd" opacity="0.6" />
        </g>
        <!-- Base de asteroide 433 Eros en el vacío -->
        <path d="M 18,34 C 18,52 192,52 192,34 L 192,44 C 192,64 18,64 18,44 Z" fill="url(#deepDepthGrad)" />
        <!-- Superficie de asteroide con borde de resplandor cósmico -->
        <ellipse cx="105" cy="34" rx="87" ry="20" fill="url(#deepCurvedGrad)" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.2" />
        <!-- Facetas de roca del asteroide -->
        <polygon points="56,32 76,28 92,34 72,38" fill="#334155" opacity="0.7" />
        <polygon points="118,34 140,29 158,35 136,39" fill="#1e293b" opacity="0.9" />
        <polygon points="86,34 116,31 126,37 98,40" fill="#38bdf8" opacity="0.18" />
        <!-- Resplandor tenue en el borde cósmico -->
        <path d="M 22,34 C 55,22 155,22 188,34" fill="none" stroke="#38bdf8" stroke-width="1.2" opacity="0.65" />
      </svg>
    `;
  }

  function hasChapterProgress(chapterId) {
    const chapter = getChapter(chapterId);
    if (!chapter) return false;
    const hasInspected = chapter.machines.some((m) => state.inspectedMachines.includes(m.id));
    const samples = getChapterSamples(chapter);
    const hasSample = samples.some((s) => state.collectedSamples.includes(s.id));
    const hasStars = (state.chapterStars && (state.chapterStars[chapterId] || 0) > 0);
    const hasQuiz = Boolean(state.quizAnswers && state.quizAnswers[chapterId] && state.quizAnswers[chapterId].some((a) => a !== null));
    const siteIdx = (state.currentSiteByChapter && state.currentSiteByChapter[chapterId]) || 0;
    return hasInspected || hasSample || hasStars || hasQuiz || siteIdx > 0;
  }

  function renderChapterNav() {
    dom.chapterNav.innerHTML = DATA.CHAPTERS.map((chapter) => {
      const completed = isChapterCompleted(chapter.id);
      const inProgress = !completed && hasChapterProgress(chapter.id);
      const isCardActive = inProgress && chapter.id === state.currentChapterId;
      const firstMachine = chapter.machines[0];
      const singleMachineSvg = firstMachine && typeof MODELS[firstMachine.modelKey] === 'function'
        ? MODELS[firstMachine.modelKey]()
        : '';
      const machinePreview = `
        <div class="w-20 h-20 flex items-center justify-center drop-shadow-[0_12px_18px_rgba(2,6,23,0.7)] [&_svg]:w-full [&_svg]:h-full">
          ${singleMachineSvg}
        </div>
      `;

      return `
        <div class="home-chapter-card p-6 flex flex-col items-center justify-between text-center gap-4 h-full ${
          isCardActive ? 'is-active' : ''
        }">
          <div class="w-full flex items-center justify-center">
            <span class="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 text-center">${chapter.name}</span>
          </div>

          <div class="home-chapter-emblem relative flex flex-col items-center justify-end w-full pt-2">
            <div class="relative z-10 flex items-end justify-center -mb-5">${machinePreview}</div>
            ${isometricPedestalSvg(chapter.id)}
          </div>

          <div class="flex flex-col items-center gap-3 w-full">
            <button type="button"
              class="squircle-btn rounded-full w-full inline-flex items-center justify-center text-center py-2.5 text-xs sm:text-sm font-medium ${
                isCardActive
                  ? 'bg-white text-slate-950 hover:bg-cyan-50'
                  : 'bg-white/[0.06] hover:bg-white/[0.14] text-slate-100'
              }"
              data-enter-chapter="${chapter.id}">
              ${completed ? 'Explorar de nuevo' : inProgress ? 'Continuar' : 'Explorar'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    dom.chapterNav.querySelectorAll('[data-enter-chapter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        enterChapterFromHome(btn.dataset.enterChapter);
      });
    });
  }

  function updateHUD() {
    const totalStars = getTotalStars();
    const badge = getCurrentBadge();
    const completedCount = DATA.CHAPTERS.filter((ch) => isChapterCompleted(ch.id)).length;
    const allCompleted = areAllChaptersCompleted();

    const passportCount = DATA.CHAPTERS.filter(hasChapterPassportStamp).length;
    dom.hudPassportCount.textContent = `${passportCount}/${DATA.CHAPTERS.length}`;
    dom.hudBadgeName.textContent = badge.name;

    if (dom.homeTotalStars) {
      dom.homeTotalStars.textContent = `★ ${totalStars}/15`;
    }
    if (dom.homeChaptersCompletedCount) {
      dom.homeChaptersCompletedCount.textContent = `${completedCount}/${DATA.CHAPTERS.length}`;
    }
    if (dom.homePassportSlots) {
      dom.homePassportSlots.innerHTML = DATA.CHAPTERS.map((chapter) => {
        const stamped = hasChapterPassportStamp(chapter);
        return `
          <div class="rounded-xl bg-white/[0.03] border border-white/[0.06] min-h-[54px] px-1.5 py-1.5 flex flex-col items-center justify-center gap-1 text-center">
            <div class="flex items-center justify-center">${MODELS.penguinPawStamp(stamped, 24)}</div>
            <span class="text-[10px] font-normal text-slate-300 text-center leading-tight">${chapter.name}</span>
          </div>
        `;
      }).join('');
    }
    if (dom.homeBadgesGrid) {
      dom.homeBadgesGrid.innerHTML = DATA.BADGES.map((item) => {
        const unlocked = totalStars >= item.minStars;
        return `
          <div class="rounded-xl bg-white/[0.03] border border-white/[0.06] min-h-[54px] px-0.5 py-1.5 flex flex-col items-center justify-center gap-1 text-center ${
            unlocked ? '' : 'opacity-40'
          }" title="${item.name}">
            <div class="w-6 h-6 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6">${MODELS.badgeIcon(item.id, unlocked)}</div>
            <span class="text-[9px] font-normal text-slate-300 text-center leading-tight">${item.name}</span>
          </div>
        `;
      }).join('');
    }
    const certPreview = document.getElementById('home-certificate-preview');
    if (certPreview) {
      certPreview.classList.toggle('is-unlocked', allCompleted);
      certPreview.innerHTML = `
        <div class="flex items-center justify-center">${MODELS.penguinPawStamp(allCompleted, 26)}</div>
      `;
    }
    const certActions = document.getElementById('home-certificate-actions');
    if (dom.homeCertificateStatus) {
      dom.homeCertificateStatus.textContent = allCompleted ? '' : 'Disponible al completar todos los capítulos';
      dom.homeCertificateStatus.classList.toggle('hidden', allCompleted);
    }
    if (certActions) {
      certActions.classList.toggle('hidden', !allCompleted);
    }
    if (dom.openCertificateBtn) {
      dom.openCertificateBtn.disabled = !allCompleted;
    }
    if (dom.homeDownloadCertificateBtn) {
      dom.homeDownloadCertificateBtn.disabled = !allCompleted;
    }
    if (dom.downloadCertificateBtn) {
      dom.downloadCertificateBtn.disabled = !allCompleted;
    }

    renderChapterNav();
  }

  /* ========================================================================
     Diálogo Interactivo con TTS y Diálogos Adaptados para 8-12 Años
     ======================================================================== */

  function getMachineDialogueTurns(machine) {
    if (!machine) return [];
    if (Array.isArray(machine.dialogue) && machine.dialogue.length > 0) {
      return machine.dialogue;
    }
    const turns = [];
    if (machine.penguinText) {
      turns.push({ speaker: 'penguin', text: machine.penguinText, audioUrl: machine.penguinAudioUrl || '' });
    }
    if (machine.dialogueText) {
      turns.push({ speaker: 'machine', text: machine.dialogueText, audioUrl: machine.audioUrl || '' });
    }
    return turns;
  }

  function openDialogueModal(machine) {
    activeDialogueMachine = machine;
    activeDialogueTurn = 0;
    proximityMachineId = machine.id;

    if (machine.id && machine.id !== 'final-scene' && !state.inspectedMachines.includes(machine.id)) {
      state.inspectedMachines.push(machine.id);
      saveState();
      renderStageEntities(getChapter(state.currentChapterId));
    }

    showModal(dom.dialogueModal);
    renderAndPlayDialogueTurn();
  }

  function openFinalDialogueModal() {
    const finalMachine = {
      id: 'final-scene',
      name: 'Nave de Cyberpenguin',
      dialogue: DATA.FINAL_DIALOGUE || []
    };
    activeDialogueMachine = finalMachine;
    activeDialogueTurn = 0;
    showModal(dom.dialogueModal);
    renderAndPlayDialogueTurn();
  }

  function advanceDialogue() {
    if (!activeDialogueMachine) return;
    const turns = getMachineDialogueTurns(activeDialogueMachine);
    if (activeDialogueTurn + 1 < turns.length) {
      activeDialogueTurn++;
      renderAndPlayDialogueTurn();
    } else {
      closeDialogueModal();
    }
  }

  function renderAndPlayDialogueTurn() {
    if (!activeDialogueMachine) return;
    const machine = activeDialogueMachine;
    const turnToken = ++activeDialogueToken;
    clearTimeout(dialogueAutoTimer);

    TTS.stop();

    const turns = getMachineDialogueTurns(machine);
    if (!turns || turns.length === 0 || activeDialogueTurn >= turns.length) {
      closeDialogueModal();
      return;
    }

    const currentTurn = turns[activeDialogueTurn];
    const isPenguin = currentTurn.speaker === 'penguin';
    const isShip = currentTurn.speaker === 'ship';
    const speakerText = currentTurn.text || '';
    const speakerAudio = currentTurn.audioUrl || '';

    let speakerName = machine.name;
    let previewSvg = '';
    let pitch = 0.95;
    let rate = 0.98;

    if (isPenguin) {
      speakerName = 'Cyberpenguin';
      previewSvg = MODELS.cyberpenguin('right');
      pitch = 1.22;
      rate = 1.0;
    } else if (isShip) {
      speakerName = 'Nave de Cyberpenguin';
      previewSvg = typeof MODELS.spaceship === 'function' ? MODELS.spaceship({ hatchOpen: false, launching: false, inSpaceFlight: true }) : '';
      pitch = 0.92;
      rate = 0.96;
    } else {
      speakerName = machine.name;
      previewSvg = MODELS[machine.modelKey] ? MODELS[machine.modelKey]() : '';
      pitch = 0.96;
      rate = 0.98;
    }

    if (dom.dialogueMachineName) {
      dom.dialogueMachineName.textContent = speakerName;
      dom.dialogueMachineName.classList.toggle('dialogue-speaker-penguin', isPenguin);
      dom.dialogueMachineName.classList.toggle('dialogue-speaker-machine', !isPenguin);
    }

    if (dom.dialogueMachinePreview) {
      dom.dialogueMachinePreview.innerHTML = previewSvg;
    }

    if (dom.dialogueBlankSlot) {
      dom.dialogueBlankSlot.textContent = speakerText;
    }

    let promptBtn = null;
    if (dom.dialogueTopicsContainer) {
      dom.dialogueTopicsContainer.innerHTML = '';
      if (currentTurn.nextPrompt) {
        promptBtn = document.createElement('button');
        promptBtn.type = 'button';
        promptBtn.className = 'dialogue-topic-btn';
        promptBtn.textContent = currentTurn.nextPrompt;
        promptBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          advanceDialogue();
        });
        dom.dialogueTopicsContainer.appendChild(promptBtn);
      }
    }

    const handleTurnComplete = () => {
      if (turnToken !== activeDialogueToken || activeDialogueMachine !== machine) return;
      if (currentTurn.nextPrompt) {
        if (promptBtn) {
          promptBtn.classList.add('is-ready');
        }
        return;
      }
      if (activeDialogueTurn + 1 < turns.length) {
        activeDialogueTurn++;
        renderAndPlayDialogueTurn();
      } else {
        closeDialogueModal();
      }
    };

    TTS.speak({
      text: speakerText,
      audioUrl: speakerAudio,
      pitch,
      rate,
      onEnd: handleTurnComplete,
      onEmpty: () => {
        const readingMs = Math.max(2600, Math.min(6500, speakerText.length * 60));
        dialogueAutoTimer = setTimeout(handleTurnComplete, readingMs);
      }
    });
  }

  function closeDialogueModal() {
    activeDialogueToken++;
    clearTimeout(dialogueAutoTimer);
    TTS.stop();
    activeDialogueMachine = null;
    activeDialogueTurn = 0;
    if (dom.dialogueTopicsContainer) {
      dom.dialogueTopicsContainer.innerHTML = '';
    }
    hideModal(dom.dialogueModal);
  }

  /* ========================================================================
     Muestras & Pasaporte de Explorador (Patitas de Pingüino)
     ======================================================================== */

  function collectSample(chapter, sampleObj) {
    const targetSample = sampleObj || (chapter && chapter.sample);
    if (!chapter || !chapter.hasSurface || !targetSample) return;
    if (!state.collectedSamples.includes(targetSample.id)) {
      state.collectedSamples.push(targetSample.id);
      saveState();
      updateHUD();
      const { activeMachine } = getActiveSite(chapter);
      updateLocationPill(chapter, activeMachine);
      renderStageEntities(chapter);
      playHarmony('sample');
      if (FX && typeof FX.emitBurst === 'function') {
        FX.emitBurst(targetSample.pos, 'sample', chapter.id);
      }
    }
  }

  function openPassportModal() {
    dom.passportSlots.innerHTML = DATA.CHAPTERS.map((chapter) => {
      const stamped = hasChapterPassportStamp(chapter);
      return `
        <div class="squircle-card p-4 flex flex-col items-center justify-center gap-2 text-center">
          <div>${MODELS.penguinPawStamp(stamped, 56)}</div>
          <span class="text-xs font-medium text-slate-100">${chapter.name}</span>
        </div>
      `;
    }).join('');
    showModal(dom.passportModal);
  }

  /* ========================================================================
     Escotilla de Nave & 3 Espacios de Quiz (2 preguntas x 4 opciones en blanco)
     ======================================================================== */

  function closeHatchAndOpenQuiz(chapter) {
    closeDialogueModal();
    hatchOpen = false;
    const inSpace = !chapter.hasSurface;
    const shipSvg = document.getElementById('stage-ship-svg');
    if (shipSvg) {
      shipSvg.innerHTML = MODELS.spaceship({
        hatchOpen: false,
        launching: false,
        penguinInHatch: false,
        inSpaceFlight: inSpace
      });
    }
    activeQuizChapterId = chapter.id;
    renderQuizModal();
    showModal(dom.quizModal);
  }

  function closeQuizModal() {
    hatchOpen = true;
    const chapter = getChapter(state.currentChapterId);
    const inSpace = !chapter.hasSurface;
    const shipSvg = document.getElementById('stage-ship-svg');
    if (shipSvg) {
      shipSvg.innerHTML = MODELS.spaceship({
        hatchOpen: true,
        launching: false,
        penguinInHatch: inSpace,
        inSpaceFlight: inSpace
      });
    }
    hideModal(dom.quizModal);
  }

  function renderQuizModal() {
    const quiz = DATA.QUIZZES[activeQuizChapterId] || DATA.QUIZZES.moon;
    const chapter = getChapter(quiz.chapterId);
    const stars = state.chapterStars[quiz.chapterId] || 0;
    const savedAnswers = state.quizAnswers[quiz.chapterId] || [null, null];
    const { siteIdx } = getActiveSite(chapter);

    dom.quizStarsBadge.textContent = `★ ${stars}/5`;

    // Etiquetas de lugares del capítulo + regreso en vuelo al primer lugar
    const stopPills = chapter.machines.map((machine) => {
      const inspected = state.inspectedMachines.includes(machine.id);
      return `
        <span class="squircle-pill px-3 py-1 text-xs font-medium inline-flex items-center justify-center text-center gap-1.5 bg-white/[0.07] text-slate-200 border border-white/10">
          <span class="entity-dot ${inspected ? 'done' : ''}"></span>
          <span class="text-center">${machine.name}</span>
        </span>
      `;
    }).join('');

    const returnFlightBtn =
      chapter.id === state.currentChapterId && siteIdx === 1 && chapter.machines.length > 1
        ? `
          <button id="quiz-return-stop1-btn" type="button"
            class="squircle-btn inline-flex items-center justify-center text-center px-3 py-1 text-xs font-medium bg-cyan-300/15 hover:bg-cyan-300/25 border border-cyan-300/30 text-cyan-200">
            ✈ ${chapter.machines[0].name}
          </button>
        `
        : '';

    dom.quizChapterTabs.innerHTML = stopPills + returnFlightBtn;

    const returnBtn = document.getElementById('quiz-return-stop1-btn');
    if (returnBtn) {
      returnBtn.addEventListener('click', () => {
        hideModal(dom.quizModal);
        travelBetweenSites(chapter.id, 1, 0);
      });
    }

    // 2 Preguntas de opción múltiple con 4 posibles respuestas en blanco
    const letters = ['A', 'B', 'C', 'D'];
    dom.quizQuestionsContainer.innerHTML = quiz.questions.map((q, qIdx) => {
      const selectedOpt = savedAnswers[qIdx];
      return `
        <div class="squircle-card p-4 flex flex-col items-center justify-center text-center gap-3">
          <div class="w-full flex items-center justify-center gap-2 text-center">
            <span class="text-xs font-medium text-cyan-200 text-center">${q.hardwareName}</span>
            <span class="text-xs font-medium text-slate-400 text-center">${qIdx + 1}/2</span>
          </div>
          <!-- Espacio en blanco para la pregunta -->
          <div class="blank-template-slot w-full min-h-[54px] px-3.5 py-2.5 text-sm font-medium text-slate-100 flex items-center justify-center text-center">
            ${q.question || ''}
          </div>
          <!-- 4 posibles respuestas en blanco -->
          <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${q.options.map((optText, oIdx) => `
              <button type="button"
                class="quiz-option-btn px-3.5 py-2.5 flex items-center justify-center text-center gap-2.5 text-sm font-normal text-slate-100 ${
                  selectedOpt === oIdx ? 'selected' : ''
                }"
                data-q-idx="${qIdx}"
                data-o-idx="${oIdx}">
                <span class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-medium text-amber-200 shrink-0">
                  ${letters[oIdx]}
                </span>
                <span class="text-center empty:hidden">${optText || ''}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    dom.quizQuestionsContainer.querySelectorAll('.quiz-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qIdx = Number(btn.dataset.qIdx);
        const oIdx = Number(btn.dataset.oIdx);
        if (!Array.isArray(state.quizAnswers[activeQuizChapterId])) {
          state.quizAnswers[activeQuizChapterId] = [null, null];
        }
        state.quizAnswers[activeQuizChapterId][qIdx] = oIdx;
        saveState();
        renderQuizModal();
      });
    });
  }

  function validateActiveQuiz() {
    const quiz = DATA.QUIZZES[activeQuizChapterId];
    const answers = state.quizAnswers[activeQuizChapterId] || [null, null];
    let scoreCount = 0;

    quiz.questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected === null || selected === undefined) return;

      const isBlankTemplate = !q.question.trim() && q.options.every((o) => !o.trim());
      if (isBlankTemplate || selected === q.correctIndex) {
        scoreCount += 1;
      }
    });

    const starsEarned = scoreCount === 2 ? 5 : scoreCount === 1 ? 3 : 0;
    state.chapterStars[activeQuizChapterId] = Math.max(
      state.chapterStars[activeQuizChapterId] || 0,
      starsEarned
    );
    if (starsEarned > 0 || answers.some((a) => a !== null && a !== undefined)) {
      markChapterCompleted(activeQuizChapterId);
    }
    saveState();
    updateHUD();
    renderQuizModal();
  }

  function travelFromQuiz() {
    const currentId = state.currentChapterId;
    const answers = state.quizAnswers[activeQuizChapterId] || [null, null];
    if (!isChapterCompleted(activeQuizChapterId)) {
      if (answers.some((a) => a !== null && a !== undefined)) {
        validateActiveQuiz();
      } else {
        markChapterCompleted(activeQuizChapterId);
        saveState();
        updateHUD();
      }
    }

    hideModal(dom.quizModal);

    if (areAllChaptersCompleted()) {
      const liftoff = LIFTOFF_STEPS[currentId] ? [LIFTOFF_STEPS[currentId]] : [];
      playTravelSequence(liftoff, () => {
        showHomeScreen();
        setTimeout(() => {
          openFinalDialogueModal();
        }, 700);
      });
      return;
    }

    const refIndex = DATA.CHAPTERS.findIndex((c) => c.id === activeQuizChapterId);
    let nextChapter = DATA.CHAPTERS[(refIndex + 1) % DATA.CHAPTERS.length];
    if (nextChapter.id === currentId) {
      const curIdx = DATA.CHAPTERS.findIndex((c) => c.id === currentId);
      nextChapter = DATA.CHAPTERS[(curIdx + 1) % DATA.CHAPTERS.length];
    }
    travelBetweenChapters(currentId, nextChapter.id);
  }

  /* ========================================================================
     Insignias & Certificado Minimalista
     ======================================================================== */

  function openBadgesModal() {
    const totalStars = getTotalStars();
    dom.badgesTotalStars.textContent = `★ ${totalStars}/15`;

    dom.badgesGrid.innerHTML = DATA.BADGES.map((badge) => {
      const unlocked = totalStars >= badge.minStars;
      return `
        <div class="squircle-card p-3 flex flex-col items-center justify-center gap-1.5 text-center ${
          unlocked ? 'border-amber-300/45' : 'opacity-55'
        }">
          <div>${MODELS.badgeIcon(badge.id, unlocked)}</div>
          <span class="text-xs font-medium text-slate-100">${badge.name}</span>
          <span class="text-[11px] font-medium text-amber-300">★ ${badge.minStars}</span>
        </div>
      `;
    }).join('');

    showModal(dom.badgesModal);
  }

  function openCertificateModal() {
    if (!areAllChaptersCompleted()) return;
    const badge = getCurrentBadge();
    dom.certificateLevel.textContent = badge.name;
    dom.certificatePaw.innerHTML = MODELS.penguinPawStamp(true, 76);
    if (dom.downloadCertificateBtn) {
      dom.downloadCertificateBtn.disabled = false;
    }
    showModal(dom.certificateModal);
  }

  function buildCertificateSvg() {
    const badge = getCurrentBadge();
    const rawPaw = MODELS.penguinPawStamp(true, 96);
    const innerPaw = rawPaw
      .replace(/^[\s\S]*?<svg[^>]*>/i, '')
      .replace(/<\/svg>[\s\S]*$/i, '');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" width="800" height="560">
  <defs>
    <linearGradient id="certBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141c3d" />
      <stop offset="100%" stop-color="#090d1f" />
    </linearGradient>
  </defs>
  <rect width="800" height="560" rx="36" fill="url(#certBg)" />
  <rect x="24" y="24" width="752" height="512" rx="28" fill="none" stroke="#ffbe76" stroke-width="1.5" stroke-opacity="0.45" />
  <text x="400" y="108" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="40" font-weight="600" letter-spacing="-0.8" fill="#fde68a">Certificado</text>
  <text x="400" y="156" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="20" font-weight="500" fill="#a5f3fc">${badge.name}</text>
  <g transform="translate(352, 195)">${innerPaw}</g>
  <rect x="120" y="340" width="560" height="130" rx="18" fill="rgba(255, 255, 255, 0.035)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
</svg>`;
  }

  function downloadCertificate() {
    if (!areAllChaptersCompleted()) return null;
    const svgMarkup = buildCertificateSvg();
    const filename = 'certificado-cyberpenguins.svg';

    if (typeof global.Blob === 'function' && global.URL && typeof global.URL.createObjectURL === 'function') {
      const blob = new global.Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = global.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      if (document.body && typeof document.body.appendChild === 'function') {
        document.body.appendChild(link);
      }
      if (typeof link.click === 'function') {
        link.click();
      }
      if (typeof link.remove === 'function') {
        link.remove();
      }
      setTimeout(() => global.URL.revokeObjectURL(url), 1000);
      return svgMarkup;
    }

    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.setAttribute('download', filename);
    if (typeof link.click === 'function') {
      link.click();
    }
    return svgMarkup;
  }

  /* ========================================================================
     Utilidades de Modales
     ======================================================================== */

  function showModal(el) {
    el.classList.remove('is-hidden');
  }

  function hideModal(el) {
    el.classList.add('is-hidden');
  }

  function isAnyModalOpen() {
    return [
      dom.dialogueModal,
      dom.quizModal,
      dom.passportModal,
      dom.badgesModal,
      dom.certificateModal
    ].some((m) => !m.classList.contains('is-hidden'));
  }

  function isBlockingModalOpen() {
    return [
      dom.quizModal,
      dom.passportModal,
      dom.badgesModal,
      dom.certificateModal
    ].some((m) => !m.classList.contains('is-hidden'));
  }

  function closeAllModals() {
    closeDialogueModal();
    closeQuizModal();
    hideModal(dom.passportModal);
    hideModal(dom.badgesModal);
    hideModal(dom.certificateModal);
  }
})(typeof window !== 'undefined' ? window : globalThis);
