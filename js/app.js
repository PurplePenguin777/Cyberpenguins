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
  const getTerrain3D = () => global.CYBERPENGUINS_TERRAIN_3D || null;

  const DEFAULT_STATE = {
    launched: false,
    cadetName: '',
    currentLanguage: 'en', // Predeterminada en inglés si no se detecta español
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
  let soundVolume = 0.8;
  let previousVolume = 0.8;
  let quizSubmitted = false;
  let audioCtx = null;
  let is3dInspectMode = false;
  let currentActiveSiteId = '';
  const world3d = {
    active: false,
    siteId: '',
    penguinRefDist: 11.5,
    ship: null,
    machine: null,
    samples: {},
    penguin: null,
    walkAnim: null,
    jumpAnim: null
  };
  let activeSpeechAnchorKind = 'penguin';

  // Datos gravitacionales reales por cuerpo celeste
  const GRAVITY_PROFILES = {
    moon: {
      label: '1.62 m/s² (0.165 g)',
      gravityClass: 'gravity-moon',
      jumpClass: 'jumping-moon',
      descendClass: 'descending-moon',
      descendDurationMs: 980,
      stepDurationMs: 760,
      jumpDurationMs: 1320,
      jumpAdvanceDist: 9.5,
      dustOnJump: true,
      isEva: false
    },
    mars: {
      label: '3.71 m/s² (0.379 g)',
      gravityClass: 'gravity-mars',
      jumpClass: 'jumping-mars',
      descendClass: 'descending-mars',
      descendDurationMs: 520,
      stepDurationMs: 680,
      jumpDurationMs: 540,
      jumpAdvanceDist: 3.2,
      dustOnJump: true,
      isEva: false
    },
    'asteroid-eros': {
      label: '0.0059 m/s² (0.0006 g) · EVA',
      gravityClass: 'gravity-eros',
      jumpClass: 'jumping-eros',
      descendClass: 'descending-eva',
      descendDurationMs: 1400,
      stepDurationMs: 950,
      jumpDurationMs: 2500,
      jumpAdvanceDist: 14.0,
      dustOnJump: false,
      isEva: true
    },
    'deep-space': {
      label: '0 m/s² (0 g) · EVA',
      gravityClass: 'gravity-deep',
      jumpClass: 'jumping-deep',
      descendClass: 'descending-eva',
      descendDurationMs: 1400,
      stepDurationMs: 850,
      jumpDurationMs: 2100,
      jumpAdvanceDist: 12.0,
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
  let activeInteractable = null;
  let pendingSampleToCollect = null;
  let activeBranchState = null;
  let thoughtBubbleTimer = null;
  let activeAmbientThought = null;
  let thoughtTrackingRaf = null;
  let lastRenderedDir = null;

  const dom = {};

  function triggerHaptic(type) {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    try {
      if (type === 'tap') {
        navigator.vibrate(15);
      } else if (type === 'jump') {
        navigator.vibrate(25);
      } else if (type === 'collect') {
        navigator.vibrate([30, 40, 50]);
      } else if (type === 'success') {
        navigator.vibrate([40, 60, 40, 60, 80]);
      } else {
        navigator.vibrate(20);
      }
    } catch (_) { }
  }

  document.addEventListener('DOMContentLoaded', init);


  /* ========================================================================
     Soporte Bilingüe e Internacionalización (ES / EN)
     ======================================================================== */

  function toggleLanguage() {
    const nextLang = (state.currentLanguage === 'en') ? 'es' : 'en';
    setLanguage(nextLang, true);
  }

  function setLanguage(lang, isManual = true) {
    if (lang !== 'es' && lang !== 'en') lang = 'en';
    state.currentLanguage = lang;
    if (isManual) {
      try {
        global.localStorage.setItem('cyberpenguins_lang_manual', 'true');
      } catch (_e) { }
    }
    if (TTS && typeof TTS.stop === 'function') {
      TTS.stop();
    }
    saveState();
    updateLanguageUI();
  }

  function updateLanguageUI() {
    const isEn = (state.currentLanguage === 'en');

    // Sincronizar selectores de idioma izquierda/derecha (Home y Stage)
    const langBtns = document.querySelectorAll('.lang-selector-btn');
    langBtns.forEach((btn) => {
      const btnLang = btn.getAttribute('data-lang');
      const isActive = (btnLang === state.currentLanguage);
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      if (btnLang === 'es') {
        btn.title = isActive
          ? (isEn ? 'Current language: Spanish' : 'Idioma actual: Español')
          : (isEn ? 'Switch to Spanish' : 'Cambiar a Español');
        btn.setAttribute('aria-label', btn.title);
      } else if (btnLang === 'en') {
        btn.title = isActive
          ? (isEn ? 'Current language: English' : 'Idioma actual: Inglés')
          : (isEn ? 'Switch to English' : 'Cambiar a English');
        btn.setAttribute('aria-label', btn.title);
      }
    });

    if (document.documentElement) {
      document.documentElement.lang = state.currentLanguage;
    }

    // Actualizar títulos del dock inferior en pantalla principal
    const segments = document.querySelectorAll('.home-dock-segment');
    if (segments.length >= 3) {
      const pTitle = segments[0].querySelector('span.font-medium');
      if (pTitle) pTitle.textContent = isEn ? 'Passport' : 'Pasaporte';
      const bTitle = segments[1].querySelector('span.font-medium');
      if (bTitle) bTitle.textContent = isEn ? 'Badges' : 'Insignias';
      const cTitle = segments[2].querySelector('span.font-medium');
      if (cTitle) cTitle.textContent = isEn ? 'Certificate' : 'Certificado';
    }

    const certStatusEl = document.getElementById('home-certificate-status');
    if (certStatusEl) {
      const allDone = areAllChaptersCompleted();
      certStatusEl.textContent = allDone
        ? (isEn ? 'Completed! Certificate ready' : '¡Completado! Certificado listo')
        : (isEn ? 'Available upon completing all chapters' : 'Disponible al completar todos los capítulos');
    }

    const certViewBtn = document.getElementById('open-certificate-btn');
    if (certViewBtn) certViewBtn.textContent = isEn ? 'View' : 'Ver';

    const certDownloadBtn = document.getElementById('home-download-certificate-btn');
    if (certDownloadBtn) certDownloadBtn.textContent = isEn ? 'Download' : 'Descargar';

    const quizModalTitle = document.getElementById('quiz-modal-title');
    if (quizModalTitle) quizModalTitle.textContent = isEn ? 'Quiz' : 'Cuestionario';

    const quizSubmitBtn = document.getElementById('quiz-submit-btn');
    if (quizSubmitBtn) quizSubmitBtn.textContent = isEn ? 'Submit' : 'Enviar';

    const quizRetryBtn = document.getElementById('quiz-retry-btn');
    if (quizRetryBtn) quizRetryBtn.textContent = isEn ? 'Retry' : 'Reintentar';

    const quizContinueBtn = document.getElementById('quiz-continue-btn');
    if (quizContinueBtn) quizContinueBtn.textContent = isEn ? 'Continue journey ▶' : 'Continuar viaje ▶';

    // Opciones del menú inicial: Cómo se juega y Acerca del proyecto
    if (dom.homeHowToPlayLabel) {
      dom.homeHowToPlayLabel.textContent = isEn ? 'How to play' : 'Cómo se juega';
    }
    if (dom.homeHowToPlayBtn) {
      dom.homeHowToPlayBtn.setAttribute('aria-label', isEn ? 'How to play' : 'Cómo se juega');
    }
    if (dom.homeAboutLabel) {
      dom.homeAboutLabel.textContent = isEn ? 'About project' : 'Acerca del proyecto';
    }
    if (dom.homeAboutBtn) {
      dom.homeAboutBtn.setAttribute('aria-label', isEn ? 'About project' : 'Acerca del proyecto');
    }
    if (dom.howToPlayModal && !dom.howToPlayModal.classList.contains('is-hidden')) {
      renderHowToPlayModal();
    }
    if (dom.aboutProjectModal && !dom.aboutProjectModal.classList.contains('is-hidden')) {
      renderAboutProjectModal();
    }

    // Textos de registro inicial de cadete (minimalista en sentence case)
    if (dom.cadetIntroTitle) {
      dom.cadetIntroTitle.textContent = isEn ? 'Welcome to Cyberpenguin' : 'Bienvenido a Cyberpenguin';
    }
    if (dom.cadetIntroSubtitle) {
      dom.cadetIntroSubtitle.textContent = isEn ? 'What is your name?' : '¿Cómo te llamas?';
    }
    if (dom.cadetIntroLabel) {
      dom.cadetIntroLabel.textContent = isEn ? 'Explorer name' : 'Nombre del explorador';
    }
    if (dom.cadetFirstNameInput) {
      dom.cadetFirstNameInput.placeholder = isEn ? 'Your name...' : 'Tu nombre...';
    }
    if (dom.cadetSkipBtnText) {
      dom.cadetSkipBtnText.textContent = isEn ? 'Skip cinematic' : 'Saltar cinemática';
    }
    if (dom.cadetStartBtnText) {
      dom.cadetStartBtnText.textContent = isEn ? 'Start' : 'Comenzar';
    }
    if (dom.launchBtnText) {
      dom.launchBtnText.textContent = isEn ? 'Skip cinematic' : 'Saltar cinemática';
    }
    if (dom.launchBtn) {
      dom.launchBtn.title = isEn ? 'Skip cinematic' : 'Saltar cinemática';
      dom.launchBtn.setAttribute('aria-label', dom.launchBtn.title);
    }

    // Textos del modal de Certificado / Diploma de Honor
    if (dom.certModalTitle) {
      dom.certModalTitle.textContent = isEn ? 'Honorary astronautical diploma' : 'Diploma de honor astronáutico';
    }
    if (dom.certModalSubtitle) {
      dom.certModalSubtitle.textContent = 'Cyberpenguin: The Explorers We Must Never Forget';
    }
    if (dom.certCadetLabel) {
      dom.certCadetLabel.textContent = isEn ? 'Astronaut name on diploma:' : 'Nombre del astronauta en el diploma:';
    }
    if (dom.certificateCadetInput) {
      dom.certificateCadetInput.placeholder = isEn ? 'Your name...' : 'Tu nombre...';
    }
    if (dom.printCertText) {
      dom.printCertText.textContent = isEn ? 'Print' : 'Imprimir';
    }
    if (dom.downloadSvgText) {
      dom.downloadSvgText.textContent = isEn ? 'Download SVG' : 'Descargar SVG';
    }
    if (dom.downloadPngText) {
      dom.downloadPngText.textContent = isEn ? 'Download diploma (PNG)' : 'Descargar diploma (PNG)';
    }

    if (dom.certificateModal && !dom.certificateModal.classList.contains('is-hidden')) {
      renderCertificateSvgPreview();
    }

    // Re-renderizar elementos de la interfaz según pantalla activa
    renderChapterNav();
    updateHUD();

    if (dom.gameScreen && !dom.gameScreen.classList.contains('is-hidden')) {
      const chapter = getChapter(state.currentChapterId);
      const { activeMachine } = getActiveSite(chapter);
      updateLocationPill(chapter, activeMachine);
      renderStageEntities(chapter);

      if (dom.speechBubbleNextBtn) {
        dom.speechBubbleNextBtn.textContent = isEn ? 'Continue ▶' : 'Continuar ▶';
      }

      // Actualizar globo de pensamiento si está activo
      if (dom.stageThoughtBubble && !dom.stageThoughtBubble.classList.contains('is-hidden') && activeAmbientThought) {
        const allThoughts = DATA.getAmbientThoughts ? DATA.getAmbientThoughts(state.currentLanguage) : DATA.AMBIENT_THOUGHTS;
        if (allThoughts && allThoughts[activeAmbientThought.chapterId] && allThoughts[activeAmbientThought.chapterId][activeAmbientThought.index]) {
          dom.thoughtBubbleText.textContent = allThoughts[activeAmbientThought.chapterId][activeAmbientThought.index];
        }
      }

      // Actualizar prompt de interacción contextual ("Guardar en la mochila" / "Store in backpack")
      if (activeInteractable && dom.stageActionPrompt && !dom.stageActionPrompt.classList.contains('is-hidden')) {
        showStageActionPrompt(activeInteractable.type, activeInteractable.target, activeInteractable.onAction);
      }

      // Actualizar botón flotante de salto
      if (dom.stageJumpLabel) {
        dom.stageJumpLabel.textContent = isEn ? 'Jump' : 'Saltar';
      }
      if (dom.stageJumpBtn) {
        dom.stageJumpBtn.setAttribute('aria-label', isEn ? 'Jump according to gravity' : 'Saltar según la gravedad');
      }
      sync3dLabels(currentActiveSiteId);

      // Si hay un globo de diálogo abierto, actualizar al nuevo idioma
      if (activeBranchState && activeBranchState.machine) {
        const currentMachineId = activeBranchState.machine.id;
        if (currentMachineId === 'final-scene') {
          openFinalDialogueModal();
        } else {
          const freshMachine = chapter.machines.find((m) => m.id === currentMachineId) || activeBranchState.machine;
          activeBranchState.machine = freshMachine;
          if (activeBranchState.choice1 && freshMachine.branchingDialogue && freshMachine.branchingDialogue.decision1) {
            const freshC1 = freshMachine.branchingDialogue.decision1.choices.find((c) => c.id === activeBranchState.choice1.id);
            if (freshC1) activeBranchState.choice1 = freshC1;
          }
          if (activeBranchState.choice2 && freshMachine.branchingDialogue && freshMachine.branchingDialogue.decision2) {
            const freshC2 = freshMachine.branchingDialogue.decision2.choices.find((c) => c.id === activeBranchState.choice2.id);
            if (freshC2) activeBranchState.choice2 = freshC2;
          }
          renderBranchStep();
        }
      }
    }

    if (dom.quizModal && !dom.quizModal.classList.contains('is-hidden')) {
      renderQuizModal();
    }

    if (dom.sampleDiscoveryModal && !dom.sampleDiscoveryModal.classList.contains('is-hidden') && pendingSampleToCollect) {
      openSampleDiscoveryModal(pendingSampleToCollect.chapter, pendingSampleToCollect.sampleObj);
    }
  }

  function init() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && window.location && window.location.protocol.startsWith('http')) {
      const registerSW = () => {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
          if (reg && typeof reg.update === 'function') reg.update();
        }).catch(() => { });
      };
      window.addEventListener('load', registerSW);
      if (document.readyState === 'complete') {
        registerSW();
      }
    }

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
    updateLanguageUI();
    updateSoundUI();
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
    dom.launchBtnText = document.getElementById('launch-btn-text');
    dom.cadetIntroCard = document.getElementById('cadet-intro-card');
    dom.cadetIntroTitle = document.getElementById('cadet-intro-title');
    dom.cadetIntroSubtitle = document.getElementById('cadet-intro-subtitle');
    dom.cadetIntroLabel = document.getElementById('cadet-intro-label');
    dom.cadetFirstNameInput = document.getElementById('cadet-first-name-input');
    dom.cadetStartBtn = document.getElementById('cadet-start-btn');
    dom.cadetStartBtnText = document.getElementById('cadet-start-btn-text');
    dom.cadetSkipBtn = document.getElementById('cadet-skip-btn');
    dom.cadetSkipBtnText = document.getElementById('cadet-skip-btn-text');

    dom.travelCinematic = document.getElementById('travel-cinematic');
    dom.travelCinematicStage = document.getElementById('travel-cinematic-stage');
    dom.travelCinematicCaption = document.getElementById('travel-cinematic-caption');
    dom.travelCinematicDots = document.getElementById('travel-cinematic-dots');
    dom.travelSkipBtn = document.getElementById('travel-skip-btn');

    dom.homeScreen = document.getElementById('home-screen');
    dom.homeBgLandscape = document.getElementById('home-bg-landscape');
    dom.homeBgPortrait = document.getElementById('home-bg-portrait');
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
    dom.soundControlGroup = document.getElementById('sound-control-group');
    dom.soundToggleBtn = document.getElementById('sound-toggle-btn');
    dom.soundVolumeSlider = document.getElementById('sound-volume-slider');
    dom.homeLangSelector = document.getElementById('home-lang-selector');
    dom.stageLangSelector = document.getElementById('stage-lang-selector');
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

    // Globos de diálogo sobre personajes (Estilo Animal Crossing)
    dom.stageSpeechBubble = document.getElementById('stage-speech-bubble');
    dom.speechBubbleAvatar = document.getElementById('speech-bubble-avatar');
    dom.speechBubbleName = document.getElementById('speech-bubble-name');
    dom.speechBubbleText = document.getElementById('speech-bubble-text');
    dom.speechBubbleOptions = document.getElementById('speech-bubble-options');
    dom.speechBubbleNextBtn = document.getElementById('speech-bubble-next-btn');
    dom.speechBubbleCloseBtn = document.getElementById('speech-bubble-close-btn');
    dom.speechBubbleActionRow = document.getElementById('speech-bubble-action-row');

    // Globo de pensamiento de Cyberpenguin (💭)
    dom.stageThoughtBubble = document.getElementById('stage-thought-bubble');
    dom.thoughtBubbleText = document.getElementById('thought-bubble-text');

    dom.stageActionPrompt = document.getElementById('stage-action-prompt');
    dom.stageActionBtn = document.getElementById('stage-action-btn');
    dom.stageActionIcon = document.getElementById('stage-action-icon');
    dom.stageActionLabel = document.getElementById('stage-action-label');
    dom.stageJumpBtn = document.getElementById('stage-jump-btn');
    dom.stageJumpLabel = document.getElementById('stage-jump-label');
    dom.stage3dToggleBtn = document.getElementById('stage-3d-toggle-btn');
    dom.stage3dToggleLabel = document.getElementById('stage-3d-toggle-label');
    dom.stageResetSiteBtn = document.getElementById('stage-reset-site-btn');
    dom.stageResetSiteLabel = document.getElementById('stage-reset-site-label');
    dom.stage3dCaption = document.getElementById('stage-3d-caption');
    dom.stage3dCaptionTitle = document.getElementById('stage-3d-caption-title');
    dom.stage3dCaptionHint = document.getElementById('stage-3d-caption-hint');

    dom.sampleDiscoveryModal = document.getElementById('sample-discovery-modal');
    dom.sampleDiscoveryCrystal = document.getElementById('sample-discovery-crystal');
    dom.sampleDiscoveryTitle = document.getElementById('sample-discovery-title');
    dom.sampleDiscoveryType = document.getElementById('sample-discovery-type');
    dom.sampleDiscoverySite = document.getElementById('sample-discovery-site');
    dom.sampleDiscoveryDesc = document.getElementById('sample-discovery-desc');
    dom.sampleDiscoveryCollectBtn = document.getElementById('sample-discovery-collect-btn');

    dom.quizModal = document.getElementById('quiz-modal');
    dom.quizModalTitle = document.getElementById('quiz-modal-title');
    dom.quizQuestionsContainer = document.getElementById('quiz-questions-container');
    dom.quizSubmitBtn = document.getElementById('quiz-submit-btn');
    dom.quizRetryBtn = document.getElementById('quiz-retry-btn');
    dom.quizScoreContainer = document.getElementById('quiz-score-container');
    dom.quizScoreText = document.getElementById('quiz-score-text');
    dom.quizContinueBtn = document.getElementById('quiz-continue-btn');
    dom.quizCloseBtn = document.getElementById('quiz-close-btn');

    dom.passportModal = document.getElementById('passport-modal');
    dom.passportSlots = document.getElementById('passport-slots');
    dom.passportCloseBtn = document.getElementById('passport-close-btn');

    dom.badgesModal = document.getElementById('badges-modal');
    dom.badgesTotalStars = document.getElementById('badges-total-stars');
    dom.badgesGrid = document.getElementById('badges-grid');
    dom.badgesCloseBtn = document.getElementById('badges-close-btn');

    dom.certificateModal = document.getElementById('certificate-modal');
    dom.certModalTitle = document.getElementById('cert-modal-title');
    dom.certModalSubtitle = document.getElementById('cert-modal-subtitle');
    dom.certCadetLabel = document.getElementById('cert-cadet-label');
    dom.certificateCadetInput = document.getElementById('certificate-cadet-input');
    dom.certificateSvgWrapper = document.getElementById('certificate-svg-wrapper');
    dom.downloadCertificateBtn = document.getElementById('download-certificate-btn');
    dom.downloadSvgCertificateBtn = document.getElementById('download-svg-certificate-btn');
    dom.printCertificateBtn = document.getElementById('print-certificate-btn');
    dom.certificateCloseBtn = document.getElementById('certificate-close-btn');
    dom.printCertText = document.getElementById('print-cert-text');
    dom.downloadSvgText = document.getElementById('download-svg-text');
    dom.downloadPngText = document.getElementById('download-png-text');

    // Navegación informativa en el menú inicial
    dom.homeHowToPlayBtn = document.getElementById('home-how-to-play-btn');
    dom.homeHowToPlayLabel = document.getElementById('home-how-to-play-label');
    dom.homeAboutBtn = document.getElementById('home-about-btn');
    dom.homeAboutLabel = document.getElementById('home-about-label');

    // Modales informativos: Cómo se juega y Acerca del proyecto
    dom.howToPlayModal = document.getElementById('how-to-play-modal');
    dom.howToPlayTitle = document.getElementById('how-to-play-title');
    dom.howToPlaySubtitle = document.getElementById('how-to-play-subtitle');
    dom.howToPlayContent = document.getElementById('how-to-play-content');
    dom.howToPlayCloseBtn = document.getElementById('how-to-play-close-btn');

    dom.aboutProjectModal = document.getElementById('about-project-modal');
    dom.aboutProjectTitle = document.getElementById('about-project-title');
    dom.aboutProjectSubtitle = document.getElementById('about-project-subtitle');
    dom.aboutProjectContent = document.getElementById('about-project-content');
    dom.aboutProjectCloseBtn = document.getElementById('about-project-close-btn');
  }

  function bindEvents() {
    dom.dismissOrientationBtn.addEventListener('click', () => {
      dom.orientationBanner.classList.add('dismissed');
    });

    function submitCadetNameAndLaunch() {
      const inputVal = (dom.cadetFirstNameInput && dom.cadetFirstNameInput.value) ? dom.cadetFirstNameInput.value.trim() : '';
      const fallbackName = (state.currentLanguage === 'en') ? 'Cosmic explorer' : 'Explorador cósmico';
      state.cadetName = inputVal || state.cadetName || fallbackName;
      state.launched = true;
      saveState();

      if (dom.cadetIntroCard) {
        dom.cadetIntroCard.classList.add('is-hidden');
      }
      playHarmony('launch');
      triggerHaptic('jump');
      startLaunchCinematic();
    }

    function skipOpeningLaunch() {
      triggerHaptic('tap');
      const inputVal = (dom.cadetFirstNameInput && dom.cadetFirstNameInput.value) ? dom.cadetFirstNameInput.value.trim() : '';
      const fallbackName = (state.currentLanguage === 'en') ? 'Cosmic explorer' : 'Explorador cósmico';
      state.cadetName = inputVal || state.cadetName || fallbackName;
      state.launched = true;
      saveState();

      if (dom.cadetIntroCard) {
        dom.cadetIntroCard.classList.add('is-hidden');
      }
      finishOpeningLaunch();
    }

    if (dom.cadetStartBtn) {
      dom.cadetStartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic('tap');
        submitCadetNameAndLaunch();
      });
    }

    if (dom.cadetSkipBtn) {
      dom.cadetSkipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        skipOpeningLaunch();
      });
    }

    if (dom.cadetFirstNameInput) {
      dom.cadetFirstNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitCadetNameAndLaunch();
        }
      });
    }

    dom.launchBtn.addEventListener('click', () => {
      skipOpeningLaunch();
    });
    dom.travelSkipBtn.addEventListener('click', skipTravelSequence);

    dom.homeStartBtn.addEventListener('click', () => enterChapterFromHome(state.currentChapterId));
    dom.backHomeBtn.addEventListener('click', showHomeScreen);
    if (dom.soundToggleBtn) {
      dom.soundToggleBtn.addEventListener('click', toggleSound);
    }
    const langSelectorButtons = document.querySelectorAll('.lang-selector-btn');
    langSelectorButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetLang = btn.getAttribute('data-lang');
        if (targetLang && targetLang !== state.currentLanguage) {
          triggerHaptic('tap');
          setLanguage(targetLang, true);
        }
      });
    });

    dom.openPassportBtn.addEventListener('click', openPassportModal);
    dom.openBadgesBtn.addEventListener('click', openBadgesModal);
    dom.openCertificateBtn.addEventListener('click', openCertificateModal);

    // Modales informativos: Cómo se juega y Acerca del proyecto
    if (dom.homeHowToPlayBtn) {
      dom.homeHowToPlayBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        openHowToPlayModal();
      });
    }
    if (dom.homeAboutBtn) {
      dom.homeAboutBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        openAboutProjectModal();
      });
    }
    if (dom.howToPlayCloseBtn) {
      dom.howToPlayCloseBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        closeHowToPlayModal();
      });
    }
    if (dom.howToPlayModal) {
      dom.howToPlayModal.addEventListener('click', (e) => {
        if (e.target === dom.howToPlayModal) closeHowToPlayModal();
      });
    }
    if (dom.aboutProjectCloseBtn) {
      dom.aboutProjectCloseBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        closeAboutProjectModal();
      });
    }
    if (dom.aboutProjectModal) {
      dom.aboutProjectModal.addEventListener('click', (e) => {
        if (e.target === dom.aboutProjectModal) closeAboutProjectModal();
      });
    }

    const homeCertCard = document.getElementById('home-certificate-preview');
    if (homeCertCard) {
      homeCertCard.addEventListener('click', () => {
        if (!areAllChaptersCompleted()) return;
        triggerHaptic('tap');
        openCertificateModal();
      });
    }

    if (dom.certificateCadetInput) {
      dom.certificateCadetInput.addEventListener('input', (e) => {
        state.cadetName = e.target.value;
        saveState();
        renderCertificateSvgPreview();
      });
    }
    if (dom.downloadCertificateBtn) {
      dom.downloadCertificateBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        downloadCertificate('png');
      });
    }
    if (dom.homeDownloadCertificateBtn) {
      dom.homeDownloadCertificateBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        downloadCertificate('png');
      });
    }
    if (dom.downloadSvgCertificateBtn) {
      dom.downloadSvgCertificateBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        downloadCertificate('svg');
      });
    }
    if (dom.printCertificateBtn) {
      dom.printCertificateBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        printCertificate();
      });
    }
    if (dom.resetProgressBtn) {
      dom.resetProgressBtn.addEventListener('click', resetProgress);
    }

    if (dom.stageActionBtn) {
      dom.stageActionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeInteractable && typeof activeInteractable.onAction === 'function') {
          const action = activeInteractable.onAction;
          hideStageActionPrompt();
          action();
        }
      });
    }

    if (dom.sampleDiscoveryCollectBtn) {
      dom.sampleDiscoveryCollectBtn.addEventListener('click', () => {
        if (pendingSampleToCollect) {
          const { chapter, sampleObj } = pendingSampleToCollect;
          pendingSampleToCollect = null;
          hideModal(dom.sampleDiscoveryModal);
          collectSample(chapter, sampleObj);
        }
      });
    }
    renderHomeBackground();

    dom.quizCloseBtn.addEventListener('click', closeQuizModal);
    if (dom.quizSubmitBtn) {
      dom.quizSubmitBtn.addEventListener('click', () => {
        validateActiveQuiz();
      });
    }
    if (dom.quizRetryBtn) {
      dom.quizRetryBtn.addEventListener('click', () => {
        retryActiveQuiz();
      });
    }
    if (dom.quizContinueBtn) {
      dom.quizContinueBtn.addEventListener('click', () => {
        travelFromQuiz();
      });
    }

    dom.passportCloseBtn.addEventListener('click', () => hideModal(dom.passportModal));
    dom.badgesCloseBtn.addEventListener('click', () => hideModal(dom.badgesModal));
    dom.certificateCloseBtn.addEventListener('click', () => hideModal(dom.certificateModal));

    if (dom.speechBubbleCloseBtn) {
      dom.speechBubbleCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDialogueModal();
      });
    }

    if (dom.dialogueBox) {
      dom.dialogueBox.addEventListener('click', (e) => {
        if (e.target.closest('.dialogue-topic-btn')) return;
        advanceDialogue();
      });
    }

    if (dom.soundVolumeSlider) {
      dom.soundVolumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        setSoundVolume(val);
      });
    }

    // Cerrar modales al hacer clic fuera del panel
    [
      { el: dom.quizModal, onClose: closeQuizModal },
      { el: dom.passportModal, onClose: () => hideModal(dom.passportModal) },
      { el: dom.badgesModal, onClose: () => hideModal(dom.badgesModal) },
      { el: dom.certificateModal, onClose: () => hideModal(dom.certificateModal) },
      { el: dom.sampleDiscoveryModal, onClose: () => hideModal(dom.sampleDiscoveryModal) }
    ].forEach(({ el, onClose }) => {
      if (!el) return;
      el.addEventListener('click', (event) => {
        if (event.target === el) onClose();
      });
    });

    // Paralaje sutil 2.5D con movimiento del cursor sobre el escenario
    dom.isoBoard.addEventListener('mousemove', (event) => {
      const rect = dom.isoBoard.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (FX && typeof FX.setCameraParallax === 'function') {
        FX.setCameraParallax(nx, ny);
      }
      const t3d = getTerrain3D();
      if (t3d && typeof t3d.setParallax === 'function') {
        t3d.setParallax(nx, ny);
      }
    });

    dom.isoBoard.addEventListener('mouseleave', () => {
      if (FX && typeof FX.setCameraParallax === 'function') {
        FX.setCameraParallax(0, 0);
      }
      const t3d = getTerrain3D();
      if (t3d && typeof t3d.setParallax === 'function') {
        t3d.setParallax(0, 0);
      }
    });

    if (dom.stage3dToggleBtn) {
      dom.stage3dToggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        triggerHaptic('tap');
        set3dInspectMode(!is3dInspectMode);
      });
    }

    global.addEventListener('cyberpenguins:terrain3d-ready', () => {
      if (currentActiveSiteId) {
        syncStage3dMount(currentActiveSiteId);
      }
    });

    // Botón flotante Liquid Glass de salto (especialmente táctil / móviles)
    if (dom.stageJumpBtn) {
      const handleJumpButton = (event) => {
        event.preventDefault();
        event.stopPropagation();
        suppressBoardClickUntil = Date.now() + 450;
        triggerGravityJump();
      };
      dom.stageJumpBtn.addEventListener('click', handleJumpButton);
      dom.stageJumpBtn.addEventListener('touchend', handleJumpButton);
    }

    // Clic / toque directo sobre Cyberpenguin para saltar según la gravedad del entorno
    if (dom.penguinActor) {
      const handlePenguinJump = (event) => {
        if (is3dInspectMode) return;
        event.stopPropagation();
        suppressBoardClickUntil = Date.now() + 450;
        triggerGravityJump();
      };
      dom.penguinActor.addEventListener('click', handlePenguinJump);
      dom.penguinActor.addEventListener('touchend', (event) => {
        event.preventDefault();
        handlePenguinJump(event);
      });
    }

    // Gestos táctiles en móviles y pantallas táctiles (Swipe hacia arriba para saltar, doble tap)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTapTime = 0;
    let suppressBoardClickUntil = 0;

    dom.isoBoard.addEventListener('touchstart', (event) => {
      if (is3dInspectMode) return;
      if (event.touches && event.touches.length === 1) {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    dom.isoBoard.addEventListener('touchend', (event) => {
      if (is3dInspectMode) return;
      if (event.changedTouches && event.changedTouches.length === 1) {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const elapsed = Date.now() - touchStartTime;
        const dist = Math.hypot(deltaX, deltaY);

        // Gesto 1: Swipe vertical hacia arriba para saltar según la gravedad
        if (deltaY < -35 && Math.abs(deltaY) > Math.abs(deltaX) * 1.15 && elapsed < 380) {
          suppressBoardClickUntil = Date.now() + 500;
          triggerGravityJump();
          return;
        }

        // Gesto 2: Doble toque rápido para saltar
        const now = Date.now();
        if (dist < 20 && (now - lastTapTime) < 300) {
          suppressBoardClickUntil = Date.now() + 500;
          lastTapTime = 0;
          triggerGravityJump();
          return;
        }
        lastTapTime = now;
      }
    }, { passive: true });

    // Clic / toque en el escenario para caminar sobre la superficie o flotar en caminata EVA
    dom.isoBoard.addEventListener('click', (event) => {
      if (is3dInspectMode || Date.now() < suppressBoardClickUntil) {
        return;
      }
      if (
        event.target.closest('.stage-hotspot') ||
        event.target.closest('#penguin-actor') ||
        event.target.closest('#stage-jump-btn') ||
        event.target.closest('#stage-3d-toggle-btn') ||
        event.target.closest('#stage-reset-site-btn') ||
        event.target.closest('.back-home-btn') ||
        event.target.closest('.sound-control-group') ||
        event.target.closest('.stage-lang-selector') ||
        event.target.closest('#stage-speech-bubble') ||
        event.target.closest('#stage-action-prompt')
      ) {
        return;
      }
      if (isJumping) {
        return;
      }
      const rect = dom.isoBoard.getBoundingClientRect();
      const pctX = ((event.clientX - rect.left) / rect.width) * 100;
      const pctY = ((event.clientY - rect.top) / rect.height) * 100;
      const t3d = getTerrain3D();
      if (world3d.active && t3d) {
        const rawW = t3d.screenPctToWorld(pctX, pctY, { clampWalkable: true });
        const safeW = resolveWorld3dPoint(rawW.x, rawW.z);
        const proj = t3d.projectWorldToScreen(safeW.x, safeW.y, safeW.z);
        triggerHaptic('tap');
        spawnRipple(proj.pctX, proj.pctY);
        walkPenguin3dTo(safeW.x, safeW.z, checkSurfaceProximity);
        return;
      }
      const chapter = getChapter(state.currentChapterId);
      const safeTarget = resolveSurfacePoint(pctX, pctY, chapter, penguinPos);
      triggerHaptic('tap');
      spawnRipple(safeTarget.x, safeTarget.y);
      routeAndMove(safeTarget.x, safeTarget.y, checkSurfaceProximity);
    });

    if (dom.stageResetSiteBtn) {
      dom.stageResetSiteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic('tap');
        const chapter = getChapter(state.currentChapterId);
        if (!chapter) return;
        const { activeMachine } = getActiveSite(chapter);
        const siteSamples = getSiteSamples(chapter, activeMachine);
        const sampleIds = new Set(siteSamples.map((s) => s.id));
        state.collectedSamples = state.collectedSamples.filter((id) => !sampleIds.has(id));
        if (activeMachine) {
          state.inspectedMachines = state.inspectedMachines.filter((id) => id !== activeMachine.id);
        }
        saveState();
        updateHUD();
        loadChapterScene(chapter.id, false);
      });
    }

    // Teclado (Flechas / WASD para mover, Espacio para saltar, Escape para volver o cerrar modales)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (isBlockingModalOpen()) {
          closeAllModals();
        } else if (is3dInspectMode) {
          set3dInspectMode(false);
        } else if (!dom.gameScreen.classList.contains('is-hidden')) {
          showHomeScreen();
        }
        return;
      }

      if (is3dInspectMode || isBlockingModalOpen() || dom.gameScreen.classList.contains('is-hidden')) {
        return;
      }

      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        triggerGravityJump();
        return;
      }

      if ((event.key === 'e' || event.key === 'E' || event.key === 'Enter') && activeInteractable && typeof activeInteractable.onAction === 'function') {
        event.preventDefault();
        const action = activeInteractable.onAction;
        hideStageActionPrompt();
        action();
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
     Persistencia en localStorage y Detección de Idioma
     ======================================================================== */

  function detectDeviceLanguage() {
    try {
      const nav = (typeof window !== 'undefined' && window.navigator)
        ? window.navigator
        : (typeof navigator !== 'undefined' ? navigator : null);
      if (!nav) return 'en';

      const rawLangs = (Array.isArray(nav.languages) && nav.languages.length > 0)
        ? nav.languages
        : [nav.language || nav.userLanguage || nav.browserLanguage];

      for (const item of rawLangs) {
        if (typeof item === 'string') {
          const code = item.trim().toLowerCase();
          if (code.startsWith('es')) return 'es';
          if (code.startsWith('en')) return 'en';
        }
      }
    } catch (_e) { }
    // Si no es detectable o es otro idioma: predeterminada en inglés
    return 'en';
  }

  function loadState() {
    try {
      let isManualChoice = false;
      let manualLang = null;
      try {
        isManualChoice = global.localStorage.getItem('cyberpenguins_lang_manual') === 'true';
        manualLang = global.localStorage.getItem('cyberpenguins_lang');
      } catch (_e) { }

      const detectedLang = detectDeviceLanguage();
      const resolvedLang = (isManualChoice && (manualLang === 'es' || manualLang === 'en'))
        ? manualLang
        : detectedLang;

      const raw = global.localStorage.getItem(DATA.STORAGE_KEY);
      if (!raw) {
        const def = cloneDefaultState();
        def.currentLanguage = resolvedLang;
        return def;
      }
      const parsed = JSON.parse(raw);
      return {
        ...cloneDefaultState(),
        ...parsed,
        cadetName: parsed.cadetName || global.localStorage.getItem('cyberpenguins_cadet_name') || '',
        currentLanguage: (isManualChoice && (parsed.currentLanguage === 'es' || parsed.currentLanguage === 'en'))
          ? parsed.currentLanguage
          : resolvedLang,
        currentSiteByChapter: {
          ...DEFAULT_STATE.currentSiteByChapter,
          ...(parsed.currentSiteByChapter || {})
        },
        completedChapters: Array.isArray(parsed.completedChapters) ? parsed.completedChapters : [],
        chapterStars: { ...DEFAULT_STATE.chapterStars, ...(parsed.chapterStars || {}) },
        quizAnswers: { ...DEFAULT_STATE.quizAnswers, ...(parsed.quizAnswers || {}) }
      };
    } catch (_err) {
      const def = cloneDefaultState();
      def.currentLanguage = detectDeviceLanguage();
      return def;
    }
  }

  function cloneDefaultState() {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function saveState() {
    try {
      global.localStorage.setItem(DATA.STORAGE_KEY, JSON.stringify(state));
      global.localStorage.setItem('cyberpenguins_lang', state.currentLanguage || 'en');
      global.localStorage.setItem('cyberpenguins_cadet_name', state.cadetName || '');
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
    set3dInspectMode(false);
    TTS.stop();
    if (FX && typeof FX.pause === 'function') {
      FX.pause();
    }
    const t3d = getTerrain3D();
    if (t3d && typeof t3d.pause === 'function') {
      t3d.pause();
    }
    saveState();
    dom.gameScreen.classList.add('is-hidden');
    dom.launchScreen.classList.add('is-hidden');
    dom.homeScreen.classList.remove('is-hidden');
    renderChapterNav();
    updateHUD();
  }

  function enterChapterFromHome(chapterId) {
    const targetId = chapterId || state.currentChapterId || 'moon';
    if (!isChapterUnlocked(targetId)) return;
    closeAllModals();
    dom.homeScreen.classList.add('is-hidden');
    dom.launchScreen.classList.add('is-hidden');
    dom.gameScreen.classList.remove('is-hidden');
    if (FX && typeof FX.resume === 'function') {
      FX.resume();
    }
    loadChapterScene(targetId, true);
    const t3d = getTerrain3D();
    if (t3d && typeof t3d.resume === 'function') {
      t3d.resume();
    }
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
        audioCtx.resume().catch(() => { });
      }
      return audioCtx;
    } catch (_err) {
      return null;
    }
  }

  function playHarmony(type) {
    if (!soundEnabled || soundVolume <= 0) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const presets = {
      step: { freqs: [523.25, 659.25], gain: 0.025, stepMs: 35, duration: 0.16, wave: 'sine' },
      jump: { freqs: [440.0, 587.33, 783.99], gain: 0.036, stepMs: 38, duration: 0.24, wave: 'sine' },
      jumpMars: { freqs: [329.63, 440.0, 523.25], gain: 0.038, stepMs: 28, duration: 0.18, wave: 'sine' },
      jumpMoon: { freqs: [523.25, 659.25, 880.0, 1046.5], gain: 0.034, stepMs: 52, duration: 0.36, wave: 'sine' },
      rcs: { freqs: [880.0, 1174.66], gain: 0.018, stepMs: 28, duration: 0.14, wave: 'triangle' },
      sample: { freqs: [523.25, 659.25, 783.99, 1046.5], gain: 0.05, stepMs: 65, duration: 0.55, wave: 'sine' },
      arrival: { freqs: [261.63, 392.0, 493.88, 659.25], gain: 0.038, stepMs: 75, duration: 0.85, wave: 'sine' },
      launch: { freqs: [65.41, 82.41, 110.0, 146.83, 220.0, 329.63], gain: 0.05, stepMs: 80, duration: 0.9, wave: 'triangle' }
    };
    const preset = presets[type];
    if (!preset) return;

    try {
      const now = ctx.currentTime;
      const targetGain = Math.max(0.0001, preset.gain * (soundVolume / 0.8));
      preset.freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const start = now + (idx * preset.stepMs) / 1000;
        const stop = start + preset.duration;

        osc.type = preset.wave;
        osc.frequency.setValueAtTime(freq, start);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(targetGain, start + 0.02);
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

  function updateSoundUI() {
    if (!dom.soundToggleBtn) return;
    const isMuted = !soundEnabled || soundVolume <= 0;
    dom.soundToggleBtn.classList.toggle('is-muted', isMuted);
    dom.soundToggleBtn.setAttribute('aria-pressed', String(!isMuted));
    dom.soundToggleBtn.setAttribute('aria-label', isMuted ? 'Activar sonido' : 'Silenciar sonido');

    if (dom.soundVolumeSlider) {
      dom.soundVolumeSlider.value = String(Math.round(soundVolume * 100));
      const pct = Math.round(soundVolume * 100);
      dom.soundVolumeSlider.style.background = `linear-gradient(to right, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.7) ${pct}%, rgba(255, 255, 255, 0.18) ${pct}%, rgba(255, 255, 255, 0.18) 100%)`;
    }

    const svg = document.getElementById('sound-icon-svg');
    if (svg) {
      if (isMuted) {
        svg.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        `;
      } else if (soundVolume < 0.5) {
        svg.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path class="sound-wave-1" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        `;
      } else {
        svg.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path class="sound-wave-1" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path class="sound-wave-2" d="M18.7 5.3a9.5 9.5 0 0 1 0 13.4" />
        `;
      }
    }
  }

  function setSoundVolume(val) {
    soundVolume = Math.max(0, Math.min(1, typeof val === 'number' ? val : 0.8));
    soundEnabled = soundVolume > 0;
    if (typeof CYBERPENGUINS_TTS !== 'undefined' && typeof CYBERPENGUINS_TTS.setVolume === 'function') {
      CYBERPENGUINS_TTS.setVolume(soundVolume);
    }
    updateSoundUI();
  }

  function toggleSound() {
    if (soundVolume > 0) {
      previousVolume = soundVolume;
      setSoundVolume(0);
    } else {
      setSoundVolume(previousVolume > 0 ? previousVolume : 0.8);
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
    state.launched = true;
    saveState();
    dom.launchScreen.classList.add('hidden-screen');
    dom.launchScreen.classList.add('is-hidden');
    showHomeScreen();
  }

  const NASA_INSPIRATIONAL_QUOTES = [
    {
      quote: '«Las cosas difíciles son las que más vale la pena intentar»',
      name: 'Margaret Hamilton',
      role: 'Directora de software Apolo · NASA'
    },
    {
      quote: '«El trabajo en equipo y la curiosidad convierten lo imposible en realidad»',
      name: 'Gene Kranz',
      role: 'Director de vuelo Apolo 11 · NASA'
    },
    {
      quote: '«Apunta a las estrellas: con dedicación y ciencia no existen límites»',
      name: 'Katherine Johnson',
      role: 'Matemática e ingeniera de la NASA'
    }
  ];

  function startLaunchCinematic() {
    clearLaunchTimers();
    isOpeningLaunch = true;
    dom.homeScreen.classList.add('is-hidden');
    dom.gameScreen.classList.add('is-hidden');
    dom.launchScreen.classList.remove('hidden-screen', 'is-hidden', 'igniting-pad');
    dom.launchShipWrapper.classList.remove('igniting', 'blasting-off');

    const quoteEl = document.getElementById('launch-quote-text');
    const nameEl = document.getElementById('launch-quote-name');
    const roleEl = document.getElementById('launch-quote-role');
    if (quoteEl && nameEl && roleEl) {
      quoteEl.textContent = NASA_INSPIRATIONAL_QUOTES[0].quote;
      nameEl.textContent = NASA_INSPIRATIONAL_QUOTES[0].name;
      roleEl.textContent = NASA_INSPIRATIONAL_QUOTES[0].role;
    }

    dom.launchScreen.classList.add('igniting-pad');
    dom.launchShipWrapper.classList.add('igniting');
    playHarmony('launch');
    triggerHaptic('jump');

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
        {
          key: 'earth-liftoff',
          quoteData: NASA_INSPIRATIONAL_QUOTES[0],
          duration: 2300
        },
        {
          key: 'atmosphere-exit',
          quoteData: NASA_INSPIRATIONAL_QUOTES[1],
          duration: 2300
        },
        {
          key: 'moon-arrival',
          quoteData: NASA_INSPIRATIONAL_QUOTES[2],
          duration: 2300
        }
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
        if (step.quoteData) {
          dom.travelCinematicCaption.innerHTML = `
            <p class="text-lg sm:text-2xl md:text-3xl font-semibold tracking-tight text-white leading-snug drop-shadow-xl text-center text-balance max-w-2xl mx-auto">${step.quoteData.quote}</p>
            <p class="text-base sm:text-xl font-bold text-cyan-300 pt-1 text-center drop-shadow-md">${step.quoteData.name}</p>
            <p class="text-xs sm:text-sm md:text-base font-medium text-slate-300/90 tracking-wide text-center">${step.quoteData.role}</p>
          `;
        } else {
          dom.travelCinematicCaption.innerHTML = `
            <p class="text-sm sm:text-base font-medium tracking-wide text-slate-200/90 text-center">${step.label || ''}</p>
          `;
        }
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
    hideStageActionPrompt();
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

  function getChaptersList() {
    return DATA.getChapters ? DATA.getChapters(state.currentLanguage) : DATA.CHAPTERS;
  }

  function getChapter(chapterId) {
    const list = getChaptersList();
    return list.find((c) => c.id === chapterId) || list[0];
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

  function sync3dLabels(siteId) {
    const isEn = (state.currentLanguage === 'en');
    const t3d = getTerrain3D();
    const meta = (t3d && typeof t3d.getSiteMeta === 'function') ? t3d.getSiteMeta(siteId || currentActiveSiteId) : null;
    if (dom.stage3dToggleLabel) {
      dom.stage3dToggleLabel.textContent = is3dInspectMode
        ? (isEn ? 'Back to explore' : 'Volver a explorar')
        : (isEn ? '3D View' : 'Vista 3D');
    }
    if (dom.stage3dToggleBtn) {
      dom.stage3dToggleBtn.setAttribute('aria-pressed', is3dInspectMode ? 'true' : 'false');
      dom.stage3dToggleBtn.setAttribute(
        'aria-label',
        is3dInspectMode
          ? (isEn ? 'Return to surface exploration' : 'Volver a explorar la superficie')
          : (isEn ? 'Inspect real 3D NASA terrain' : 'Inspeccionar terreno 3D real de la NASA')
      );
      dom.stage3dToggleBtn.classList.toggle('is-active', is3dInspectMode);
    }
    if (meta && dom.stage3dCaptionTitle) {
      dom.stage3dCaptionTitle.textContent = isEn ? meta.titleEn : meta.titleEs;
      if (dom.stage3dCaptionHint) {
        dom.stage3dCaptionHint.textContent = '';
        dom.stage3dCaptionHint.classList.add('hidden');
      }
    }
  }

  function set3dInspectMode(enabled) {
    const t3d = getTerrain3D();
    const canInspect = Boolean(enabled) && Boolean(t3d && currentActiveSiteId && t3d.hasSite(currentActiveSiteId));
    is3dInspectMode = canInspect;

    if (dom.isoBoard) {
      dom.isoBoard.classList.toggle('is-3d-inspect', canInspect);
    }
    if (canInspect) {
      clearWalkTimers();
      closeDialogueModal();
      hideStageActionPrompt();
      hideThoughtBubble();
    }
    if (t3d && typeof t3d.setInspectMode === 'function') {
      t3d.setInspectMode(canInspect);
    }
    if (dom.stage3dCaption) {
      dom.stage3dCaption.classList.toggle('is-hidden', !canInspect);
    }
    sync3dLabels(currentActiveSiteId);
  }

  function resetWorld3d(keepUiClasses) {
    world3d.active = false;
    world3d.siteId = '';
    world3d.ship = null;
    world3d.machine = null;
    world3d.samples = {};
    world3d.penguin = null;
    world3d.walkAnim = null;
    world3d.jumpAnim = null;
    world3d.domEntityNodes = null;
    world3d.lastCamSig = '';
    world3d.lastPenguinSig = '';
    world3d.forceDomSync = true;
    const t3d = getTerrain3D();
    if (t3d && typeof t3d.setOnFrameCallback === 'function') {
      t3d.setOnFrameCallback(null);
    }
    if (!keepUiClasses) {
      if (dom.isoBoard) {
        dom.isoBoard.classList.remove('has-3d-terrain', 'has-3d-actor', 'has-3d-machine', 'has-3d-ship', 'has-3d-samples');
      }
      if (dom.penguinActor) {
        dom.penguinActor.style.transform = '';
        dom.penguinActor.style.visibility = '';
      }
      if (dom.stageEntitiesLayer) {
        dom.stageEntitiesLayer.querySelectorAll('.stage-entity').forEach((el) => {
          el.style.transform = '';
          el.style.visibility = '';
        });
      }
    }
  }

  function getWorld3dShipRampFoot() {
    if (!world3d.ship) return { x: 0, z: 0, shipYaw: 0.36 };
    const shipYaw = 0.36;
    const shipScale = 1.82;
    const rampLocalX = 1.24 * shipScale;
    const rampLocalZ = -0.04 * shipScale;
    return {
      x: world3d.ship.x + rampLocalX * Math.cos(shipYaw) + rampLocalZ * Math.sin(shipYaw),
      z: world3d.ship.z - rampLocalX * Math.sin(shipYaw) + rampLocalZ * Math.cos(shipYaw),
      shipYaw
    };
  }

  function getWorld3dObstacles() {
    const obs = [];
    if (world3d.ship) {
      obs.push({ id: 'ship', cx: world3d.ship.x, cz: world3d.ship.z, r: 1.55 });
    }
    if (world3d.machine) {
      const rMap = { sojourner: 0.64 };
      obs.push({
        id: world3d.machine.id,
        cx: world3d.machine.x,
        cz: world3d.machine.z,
        r: rMap[world3d.machine.id] || 1.15
      });
    }
    Object.values(world3d.samples || {}).forEach((s) => {
      if (!s || state.collectedSamples.includes(s.id)) return;
      if (s.id === 'sample-mars-5') {
        obs.push({ id: s.id, cx: s.x, cz: s.z, r: 0.72 }); // Yogi (bloque grande)
      } else if (s.id === 'sample-mars-4') {
        obs.push({ id: s.id, cx: s.x, cz: s.z, r: 0.52 }); // Barnacle Bill
      }
    });
    return obs;
  }

  function resolveWorld3dPoint(wx, wz) {
    const t3d = getTerrain3D();
    if (!t3d) return { x: wx, y: 0, z: wz };
    const clamped = t3d.clampWalkableWorld(wx, wz);
    if (typeof t3d.resolvePhysicalPosition === 'function') {
      const phys = t3d.resolvePhysicalPosition(clamped.x, clamped.z, 0.21);
      return t3d.clampWalkableWorld(phys.x, phys.z);
    }
    return clamped;
  }

  function segHitsCircle2D(ax, az, bx, bz, cx, cz, r) {
    const dx = bx - ax;
    const dz = bz - az;
    const lenSq = dx * dx + dz * dz;
    if (lenSq < 1e-6) return false;
    const t = Math.max(0, Math.min(1, ((cx - ax) * dx + (cz - az) * dz) / lenSq));
    const px = ax + t * dx;
    const pz = az + t * dz;
    return Math.hypot(px - cx, pz - cz) < r * 0.96;
  }

  function buildWorld3dRoute(fromW, toW) {
    const t3d = getTerrain3D();
    const target = resolveWorld3dPoint(toW.x, toW.z);
    if (!t3d) return [target];
    const obsList = getWorld3dObstacles().sort(
      (a, b) => Math.hypot(fromW.x - a.cx, fromW.z - a.cz) - Math.hypot(fromW.x - b.cx, fromW.z - b.cz)
    );
    const waypoints = [];
    let cur = { x: fromW.x, z: fromW.z };
    obsList.forEach((o) => {
      if (!segHitsCircle2D(cur.x, cur.z, target.x, target.z, o.cx, o.cz, o.r)) return;
      const front = resolveWorld3dPoint(o.cx, o.cz + o.r * 1.35);
      const back = resolveWorld3dPoint(o.cx, o.cz - o.r * 1.35);
      const avgZ = (cur.z + target.z) * 0.5;
      const detour = (avgZ < o.cz - 0.3 && Math.hypot(back.x - o.cx, back.z - o.cz) >= o.r * 1.02)
        ? back
        : front;
      if (Math.hypot(detour.x - cur.x, detour.z - cur.z) > 0.45 && Math.hypot(detour.x - target.x, detour.z - target.z) > 0.45) {
        waypoints.push(detour);
        cur = detour;
      }
    });
    waypoints.push(target);
    return waypoints;
  }

  function projectAnchorScreen(anchor, t3d, minScale, maxScale) {
    const proj = t3d.projectWorldToScreen(anchor.x, anchor.y, anchor.z);
    const refDist = anchor.initDist || 12.0;
    const mul = anchor.baseMul || 1.0;
    const scale = Math.max(minScale, Math.min(maxScale, (refDist / Math.max(2.5, proj.dist)) * mul));
    anchor.screenX = proj.pctX;
    anchor.screenY = proj.pctY;
    return { proj, scale };
  }

  function computeWalkDuration3d(fromPt, toPt) {
    const segDist = Math.hypot(toPt.x - fromPt.x, toPt.z - fromPt.z);
    const uphill = Math.max(0, (toPt.y || 0) - (fromPt.y || 0));
    // Velocidad pausada y realista de polluelo de pingüino emperador (~2.15 u/s, más lento cuesta arriba)
    const rawMs = (segDist / 2.15) * 1000 * (1 + uphill * 0.45);
    return Math.max(540, Math.min(3800, Math.round(rawMs)));
  }

  function syncDomEntitiesToWorld3d(t3d) {
    if (!t3d || !world3d.active) return;

    const has3dPenguin = Boolean(typeof t3d.hasPenguinActor === 'function' && t3d.hasPenguinActor());
    const has3dMachine = Boolean(typeof t3d.hasMachineActor === 'function' && t3d.hasMachineActor());
    const has3dShip = Boolean(typeof t3d.hasShipActor === 'function' && t3d.hasShipActor());
    const has3dSamples = Boolean(typeof t3d.hasSampleActors === 'function' && t3d.hasSampleActors());
    if (dom.isoBoard) {
      dom.isoBoard.classList.toggle('has-3d-actor', has3dPenguin);
      dom.isoBoard.classList.toggle('has-3d-machine', has3dMachine);
      dom.isoBoard.classList.toggle('has-3d-ship', has3dShip);
      dom.isoBoard.classList.toggle('has-3d-samples', has3dSamples);
    }

    if (typeof t3d.syncSampleActors === 'function') {
      t3d.syncSampleActors(world3d.samples, state.collectedSamples);
    }

    if (world3d.ship && typeof t3d.setShipPose === 'function') {
      t3d.setShipPose({
        x: world3d.ship.x,
        y: world3d.ship.y,
        z: world3d.ship.z
      });
    }

    if (world3d.machine && typeof t3d.setMachinePose === 'function') {
      t3d.setMachinePose({
        x: world3d.machine.x,
        y: world3d.machine.y,
        z: world3d.machine.z
      });
    }

    const cam = t3d.camera;
    const camSig = cam
      ? `${cam.position.x.toFixed(3)},${cam.position.y.toFixed(3)},${cam.position.z.toFixed(3)},${cam.quaternion.x.toFixed(4)},${cam.quaternion.y.toFixed(4)},${cam.quaternion.z.toFixed(4)}`
      : '';
    const camChanged = world3d.forceDomSync || camSig !== world3d.lastCamSig;
    if (camChanged) {
      world3d.lastCamSig = camSig;
    }

    let penguinMoved = false;
    let pProj = null;
    if (world3d.penguin && dom.penguinActor) {
      if (typeof t3d.setPenguinPose === 'function') {
        t3d.setPenguinPose(world3d.penguin);
      }
      const jh = world3d.penguin.jumpHeight || 0;
      const pSig = `${world3d.penguin.x.toFixed(3)},${world3d.penguin.y.toFixed(3)},${world3d.penguin.z.toFixed(3)},${jh.toFixed(3)}`;
      penguinMoved = camChanged || pSig !== world3d.lastPenguinSig;
      if (penguinMoved) {
        world3d.lastPenguinSig = pSig;
        pProj = t3d.projectWorldToScreen(world3d.penguin.x, world3d.penguin.y + jh, world3d.penguin.z);
        const pScale = Math.max(0.48, Math.min(1.45, world3d.penguinRefDist / Math.max(2.5, pProj.dist)));
        dom.penguinActor.style.visibility = pProj.visible ? '' : 'hidden';
        dom.penguinActor.style.left = `${pProj.pctX.toFixed(2)}%`;
        dom.penguinActor.style.top = `${pProj.pctY.toFixed(2)}%`;
        dom.penguinActor.style.transform = `translate3d(-50%, -80%, 0) scale(${pScale.toFixed(3)})`;
        dom.penguinActor.style.zIndex = String(Math.max(18, Math.min(90, Math.round(92 - pProj.dist * 2.2))));
        penguinPos.x = Number(pProj.pctX.toFixed(2));
        penguinPos.y = Number(pProj.pctY.toFixed(2));
        if (FX && typeof FX.setPenguinTarget === 'function') {
          FX.setPenguinTarget(penguinPos);
        }
      } else if (world3d.penguin && t3d.camera) {
        pProj = t3d.projectWorldToScreen(world3d.penguin.x, world3d.penguin.y + jh, world3d.penguin.z);
      }
    }

    if (dom.stageEntitiesLayer && (camChanged || penguinMoved)) {
      if (!world3d.domEntityNodes) {
        world3d.domEntityNodes = Array.from(dom.stageEntitiesLayer.querySelectorAll('.stage-entity'));
      }
      world3d.domEntityNodes.forEach((el) => {
        const kind = el.dataset.entityKind;
        const id = el.dataset.entityId;
        let anchor = null;
        if (kind === 'ship') anchor = world3d.ship;
        else if (kind === 'machine') anchor = world3d.machine;
        else if (kind === 'sample' && id) anchor = world3d.samples[id];
        if (!anchor) return;

        const { proj, scale } = projectAnchorScreen(anchor, t3d, 0.44, 1.55);
        el.style.visibility = proj.visible ? '' : 'hidden';
        el.style.left = `${proj.pctX.toFixed(2)}%`;
        el.style.top = `${proj.pctY.toFixed(2)}%`;
        el.style.transform = `translate3d(-50%, -72%, 0) scale(${scale.toFixed(3)})`;
        el.style.zIndex = String(Math.max(18, Math.min(89, Math.round(92 - proj.dist * 2.2))));

        // Oclusión / atenuación dinámica de la baliza:
        // Se desactiva cuando el pingüino está cerca para interactuar, cuando pasa por delante
        // (la roca queda detrás del pingüino y se solapan en pantalla) o cuando el prompt está activo
        const beacon = el.querySelector('.sample-beacon');
        if (beacon) {
          if (world3d.penguin && pProj) {
            const dist3d = Math.hypot(world3d.penguin.x - anchor.x, world3d.penguin.z - anchor.z);
            const screenDx = Math.abs(proj.pctX - pProj.pctX);
            const screenDy = Math.abs(proj.pctY - pProj.pctY);
            const nearThresh = kind === 'ship' ? 3.6 : (kind === 'machine' ? 2.6 : 2.25);
            const isNear = dist3d <= nearThresh;
            const isPenguinInFront = (proj.dist > pProj.dist - 0.25) && (screenDx < 8.5 && screenDy < 14.5);
            const isPromptTarget = Boolean(activeInteractable && activeInteractable.target && (activeInteractable.target.id === id || activeInteractable.type === kind));
            beacon.classList.toggle('is-occluded', isNear || isPenguinInFront || isPromptTarget);
          } else {
            beacon.classList.remove('is-occluded');
          }
        }
      });
    }
    world3d.forceDomSync = false;

    if (dom.stageActionPrompt && !dom.stageActionPrompt.classList.contains('is-hidden') && activeInteractable) {
      let ax = penguinPos.x;
      let ay = penguinPos.y;
      let offsetY = -10;
      if (activeInteractable.type === 'sample' && activeInteractable.target && world3d.samples[activeInteractable.target.id]) {
        const sA = world3d.samples[activeInteractable.target.id];
        ax = sA.screenX;
        ay = sA.screenY;
        offsetY = -2.5;
      } else if (activeInteractable.type === 'machine' && world3d.machine) {
        ax = world3d.machine.screenX;
        ay = world3d.machine.screenY;
        offsetY = -12;
      } else if (activeInteractable.type.startsWith('ship') && world3d.ship) {
        ax = world3d.ship.screenX;
        ay = world3d.ship.screenY;
        offsetY = -12;
      }
      dom.stageActionPrompt.style.left = `${Math.max(8, Math.min(92, ax)).toFixed(2)}%`;
      dom.stageActionPrompt.style.top = `${Math.max(10, Math.min(88, ay + offsetY)).toFixed(2)}%`;
    }

    if (dom.stageSpeechBubble && !dom.stageSpeechBubble.classList.contains('is-hidden')) {
      if (activeSpeechAnchorKind === 'ship' && world3d.ship) {
        positionSpeechBubble(world3d.ship.screenX, world3d.ship.screenY);
      } else if (activeSpeechAnchorKind === 'machine' && world3d.machine) {
        positionSpeechBubble(world3d.machine.screenX, world3d.machine.screenY);
      } else {
        positionSpeechBubble(penguinPos.x, penguinPos.y);
      }
    }
  }

  function stepWorld3dFrame(now) {
    if (!world3d.active) return;
    const t3d = getTerrain3D();
    if (!t3d) return;

    if (world3d.walkAnim && world3d.penguin) {
      const wa = world3d.walkAnim;
      const segTo = wa.waypoints[wa.idx];
      if (!segTo) {
        world3d.walkAnim = null;
        world3d.penguin.isWalking = false;
        if (dom.penguinActor) dom.penguinActor.classList.remove('walking');
        syncDomEntitiesToWorld3d(t3d);
        const cb = wa.onArrive;
        if (cb) cb();
      } else {
        const dt = wa.lastFrameAt ? Math.min(0.05, Math.max(0.004, (now - wa.lastFrameAt) * 0.001)) : 0.016;
        wa.lastFrameAt = now;

        const curX = world3d.penguin.x;
        const curZ = world3d.penguin.z;
        const remDist = Math.hypot(segTo.x - curX, segTo.z - curZ);

        // Aceleración y frenado suaves manteniendo velocidad pausada y constante al rodear obstáculos
        const accelFactor = Math.min(1, (now - wa.startTime) / 240);
        const decelFactor = wa.idx === wa.waypoints.length - 1 ? Math.min(1, Math.max(0.32, remDist / 0.65)) : 1;
        const speed = 2.05 * (0.35 + 0.65 * accelFactor) * decelFactor;
        const stepDist = speed * dt;

        const phys = typeof t3d.computeSteeredStep === 'function'
          ? t3d.computeSteeredStep(curX, curZ, segTo.x, segTo.z, stepDist, 0.21, wa.steerDir || null)
          : t3d.resolvePhysicalPosition(curX + ((segTo.x - curX) / Math.max(1e-4, remDist)) * stepDist, curZ + ((segTo.z - curZ) / Math.max(1e-4, remDist)) * stepDist, 0.21);

        if (typeof phys.dirX === 'number' && typeof phys.dirZ === 'number') {
          wa.steerDir = { x: phys.dirX, z: phys.dirZ };
        }

        const moveDx = phys.x - curX;
        const moveDz = phys.z - curZ;
        const moved = Math.hypot(moveDx, moveDz);
        const segHeading = moved > 0.004
          ? Math.atan2(moveDx, moveDz)
          : world3d.penguin.yaw;

        if (moveDx < -0.003) penguinDir = 'left';
        else if (moveDx > 0.003) penguinDir = 'right';

        world3d.penguin = {
          x: phys.x,
          y: phys.y,
          z: phys.z,
          yaw: segHeading,
          isWalking: true,
          jumpHeight: 0
        };

        if (now - wa.lastDustAt >= 430) {
          wa.lastDustAt = now;
          const pNow = t3d.projectWorldToScreen(world3d.penguin.x, world3d.penguin.y, world3d.penguin.z);
          if (FX && typeof FX.emitBurst === 'function') {
            FX.emitBurst({ x: pNow.pctX, y: pNow.pctY }, 'step', state.currentChapterId, world3d.siteId);
          }
        }

        // Evaluar proximidad continuamente para activar el texto al acercarse y desactivarlo al alejarse
        if (!world3d.lastProxCheckAt || now - world3d.lastProxCheckAt >= 50) {
          world3d.lastProxCheckAt = now;
          checkSurfaceProximity();
        }

        const newRem = Math.hypot(segTo.x - phys.x, segTo.z - phys.z);
        if (moved < stepDist * 0.22 || newRem >= remDist - 0.001) {
          wa.stallMs = (wa.stallMs || 0) + dt * 1000;
        } else {
          wa.stallMs = 0;
        }

        if (newRem <= 0.16 || (wa.stallMs || 0) > 160) {
          wa.idx += 1;
          wa.stallMs = 0;
          wa.steerDir = null;
          if (wa.idx >= wa.waypoints.length) {
            world3d.walkAnim = null;
            world3d.penguin.isWalking = false;
            const restSign = Math.sin(world3d.penguin.yaw) >= 0 ? 1 : -1;
            if (Math.cos(world3d.penguin.yaw) < -0.25) {
              world3d.penguin.yaw = restSign * 0.65;
            }
            if (dom.penguinActor) dom.penguinActor.classList.remove('walking');
            syncDomEntitiesToWorld3d(t3d);
            if (wa.onArrive) wa.onArrive();
          } else {
            const nextPt = wa.waypoints[wa.idx];
            if (nextPt.x < phys.x - 0.15) penguinDir = 'left';
            else if (nextPt.x > phys.x + 0.15) penguinDir = 'right';
            if (penguinDir !== lastRenderedDir && dom.penguinSprite) {
              dom.penguinSprite.innerHTML = MODELS.cyberpenguin(penguinDir);
              lastRenderedDir = penguinDir;
            }
            playHarmony('step');
          }
        }
      }
    } else if (world3d.jumpAnim && world3d.penguin) {
      const ja = world3d.jumpAnim;
      const t = Math.min(1, Math.max(0, (now - ja.startTime) / Math.max(1, ja.durationMs)));
      const nx = ja.from.x + (ja.to.x - ja.from.x) * t;
      const nz = ja.from.z + (ja.to.z - ja.from.z) * t;
      const jh = 4 * t * (1 - t) * (ja.peakHeight || 0.55);
      world3d.penguin = {
        x: nx,
        y: t3d.getGroundHeightAt(nx, nz),
        z: nz,
        yaw: ja.yaw,
        isWalking: false,
        jumpHeight: jh
      };
      if (t >= 1) {
        world3d.penguin.jumpHeight = 0;
        world3d.jumpAnim = null;
      }
      if (!world3d.lastProxCheckAt || now - world3d.lastProxCheckAt >= 50) {
        world3d.lastProxCheckAt = now;
        checkSurfaceProximity();
      }
    }

    syncDomEntitiesToWorld3d(t3d);
  }

  function walkPenguin3dTo(destX, destZ, onArrive) {
    if (isJumping || !world3d.active || !world3d.penguin) return;
    clearWalkTimers();
    const route = buildWorld3dRoute(world3d.penguin, { x: destX, z: destZ });
    const firstPt = route[0];
    if (!firstPt) return;

    const segDist = Math.hypot(firstPt.x - world3d.penguin.x, firstPt.z - world3d.penguin.z);
    if (segDist < 0.08 && route.length === 1) {
      world3d.penguin.isWalking = false;
      if (onArrive) onArrive();
      return;
    }

    if (firstPt.x < world3d.penguin.x - 0.15) penguinDir = 'left';
    else if (firstPt.x > world3d.penguin.x + 0.15) penguinDir = 'right';
    if (penguinDir !== lastRenderedDir && dom.penguinSprite) {
      dom.penguinSprite.innerHTML = MODELS.cyberpenguin(penguinDir);
      lastRenderedDir = penguinDir;
    }

    const dur = computeWalkDuration3d(world3d.penguin, firstPt);
    const heading = Math.atan2(firstPt.x - world3d.penguin.x, firstPt.z - world3d.penguin.z);
    world3d.penguin.yaw = heading;
    world3d.penguin.isWalking = true;
    world3d.walkAnim = {
      waypoints: route,
      idx: 0,
      from: { ...world3d.penguin },
      startTime: performance.now(),
      durationMs: dur,
      onArrive,
      lastDustAt: performance.now() - 430
    };
    if (dom.penguinActor) {
      dom.penguinActor.classList.add('walking');
    }
    playHarmony('step');
  }

  function initWorld3dAnchors(chapter, siteId) {
    const t3d = getTerrain3D();
    if (!t3d || !chapter || !siteId || !t3d.hasSite(siteId)) return;

    const { activeMachine } = getActiveSite(chapter);
    const shipPos = (activeMachine && activeMachine.shipPos) || chapter.shipPos;
    const preservePenguin = world3d.active && world3d.siteId === siteId && world3d.penguin;

    const shipHit = t3d.screenPctToWorld(shipPos.x, shipPos.y, { useBaseExploreCamera: true });
    world3d.ship = {
      x: shipHit.x,
      y: shipHit.y,
      z: shipHit.z,
      initDist: t3d.getBaseExploreDistance(shipHit.x, shipHit.y, shipHit.z),
      baseMul: 1.22,
      screenX: shipPos.x,
      screenY: shipPos.y
    };

    if (activeMachine) {
      const mHit = t3d.screenPctToWorld(activeMachine.pos.x, activeMachine.pos.y, { useBaseExploreCamera: true });
      const machineBaseScale = {
        'sojourner': 1.0,
        'apollo-11-eagle': 1.25,
        'viking-1': 1.05,
        'surveyor-3': 0.95
      };
      world3d.machine = {
        id: activeMachine.id,
        x: mHit.x,
        y: mHit.y,
        z: mHit.z,
        initDist: t3d.getBaseExploreDistance(mHit.x, mHit.y, mHit.z),
        baseMul: machineBaseScale[activeMachine.id] || 1.0,
        screenX: activeMachine.pos.x,
        screenY: activeMachine.pos.y
      };
    } else {
      world3d.machine = null;
    }

    const sampleBaseScale = {
      'sample-mars-2': 0.64, // Barnacle Bill (~25-30 cm)
      'sample-mars-3': 0.98, // Yogi (~1.1 m boulder)
      'sample-mars-4': 0.74  // Scooby Doo (~40 cm flat rock)
    };
    world3d.samples = {};
    const siteSamples = getSiteSamples(chapter, activeMachine);
    siteSamples.forEach((sampleObj) => {
      const sHit = t3d.screenPctToWorld(sampleObj.pos.x, sampleObj.pos.y, { useBaseExploreCamera: true });
      world3d.samples[sampleObj.id] = {
        id: sampleObj.id,
        x: sHit.x,
        y: sHit.y,
        z: sHit.z,
        initDist: t3d.getBaseExploreDistance(sHit.x, sHit.y, sHit.z),
        baseMul: sampleBaseScale[sampleObj.id] || 0.82,
        screenX: sampleObj.pos.x,
        screenY: sampleObj.pos.y
      };
    });

    if (!preservePenguin) {
      const spawn = (activeMachine && activeMachine.spawnPos) || chapter.spawnPos;
      const pRaw = t3d.screenPctToWorld(spawn.x, spawn.y, { useBaseExploreCamera: true, clampWalkable: true });
      const resolvedP = resolveWorld3dPoint(pRaw.x, pRaw.z);
      world3d.penguin = {
        x: resolvedP.x,
        y: resolvedP.y,
        z: resolvedP.z,
        yaw: 0.42,
        isWalking: false,
        jumpHeight: 0
      };
      world3d.penguinRefDist = t3d.getBaseExploreDistance(world3d.penguin.x, world3d.penguin.y, world3d.penguin.z);
    }

    world3d.active = true;
    world3d.siteId = siteId;
    if (dom.isoBoard) {
      dom.isoBoard.classList.add('has-3d-terrain');
    }
    t3d.setOnFrameCallback(stepWorld3dFrame);
    syncDomEntitiesToWorld3d(t3d);
  }

  function syncStage3dMount(siteId) {
    const t3d = getTerrain3D();
    const has3d = Boolean(t3d && siteId && t3d.hasSite(siteId));

    if (dom.stage3dToggleBtn) {
      dom.stage3dToggleBtn.classList.toggle('is-hidden', !has3d);
    }
    if (!has3d) {
      resetWorld3d();
      set3dInspectMode(false);
      if (t3d && typeof t3d.unmount === 'function') {
        t3d.unmount();
      }
      return;
    }

    sync3dLabels(siteId);
    t3d.mount(dom.stageBackdropLayer, siteId, {
      onReady: () => {
        if (currentActiveSiteId !== siteId) return;
        initWorld3dAnchors(getChapter(state.currentChapterId), siteId);
        sync3dLabels(siteId);
        if (dom.gameScreen && dom.gameScreen.classList.contains('is-hidden')) {
          t3d.pause();
        }
      },
      onError: () => {
        resetWorld3d();
        if (dom.stage3dToggleBtn) {
          dom.stage3dToggleBtn.classList.add('is-hidden');
        }
        set3dInspectMode(false);
      }
    });
    if (dom.gameScreen && dom.gameScreen.classList.contains('is-hidden')) {
      t3d.pause();
    }
  }

  function loadChapterScene(chapterId, animateDescend) {
    const chapter = getChapter(chapterId);
    const { activeMachine } = getActiveSite(chapter);
    const siteId = activeMachine ? activeMachine.siteId : '';
    const profile = getGravityProfile(chapter.id, siteId);
    clearWalkTimers();
    clearTitleCardTimers();
    resetWorld3d();
    currentActiveSiteId = siteId;
    set3dInspectMode(false);
    state.currentChapterId = chapter.id;
    hatchOpen = true;
    leftShipArea = false;
    proximityMachineId = null;
    isJumping = false;
    closeDialogueModal();
    hideStageActionPrompt();
    hideThoughtBubble();
    saveState();

    updateLocationPill(chapter, activeMachine);

    dom.stageBackdropLayer.innerHTML = MODELS.stageBackdrop(chapter.id, siteId || undefined);
    syncStage3dMount(siteId);
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
    // 1. Huella completa del fuselaje de la nave de Cyberpenguin (evita caminar sobre cabina o cono)
    const obstacles = [
      { id: 'ship', cx: shipPos.x, cy: shipPos.y - 6.5, rx: 9.6, ry: 11.0 }
    ];
    // 2. Huellas físicas calibradas según las dimensiones reales de cada máquina espacial
    if (activeMachine && activeMachine.pos) {
      const machineProfiles = {
        'apollo-11-eagle': { offsetY: -5.0, rx: 11.5, ry: 9.5 }, // Módulo lunar grande (190px alto, cabina y patas)
        'surveyor-3':      { offsetY: -4.0, rx: 8.8,  ry: 7.5 }, // Mástil solar y cámara de TV
        'viking-1':        { offsetY: -4.5, rx: 9.2,  ry: 8.0 }, // Aterrizador marciano con antena y mástiles
        'sojourner':       { offsetY: -0.5, rx: 4.8,  ry: 3.5 }, // Pequeño rover de 6 ruedas
        'pioneer-10':      { offsetY: -1.0, rx: 10.5, ry: 8.5 }, // Gran antena parabólica de 3m y mástiles RTG
        'near-shoemaker':  { offsetY: -3.5, rx: 10.5, ry: 8.0 }  // Paneles solares anchos y cuerpo sobre Eros
      };
      const prof = machineProfiles[activeMachine.id] || { offsetY: -2.0, rx: 8.2, ry: 5.5 };
      obstacles.push({
        id: activeMachine.id,
        cx: activeMachine.pos.x,
        cy: activeMachine.pos.y + prof.offsetY,
        rx: prof.rx,
        ry: prof.ry
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
    if (world3d.active) return;
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
      const jumpArcPct = (siteId === 'asteroid-eros' ? 16.5 : (chapter.id === 'moon' ? 8.5 : 3.5)) * Math.sin(t * Math.PI);
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
    const reqs = checkSiteRequirements(chapter);
    const hatchAriaLabel = isFirstStop && nextMachine
      ? `Escotilla · Viajar a ${nextMachine.name}`
      : 'Escotilla · Quiz y Viaje';

    // 1. Nave de Cyberpenguin (con escotilla lista cuando se completan las tareas)
    parts.push(`
      <div class="stage-entity ${inSpace ? 'space-float' : ''}" data-entity-kind="ship" data-sort-y="${shipPos.y}" style="left: ${shipPos.x}%; top: ${shipPos.y}%;">
        <button id="ship-hatch-btn" type="button" class="stage-hotspot ship-hotspot" aria-label="${hatchAriaLabel}">
          <div class="sample-beacon ship-beacon ${reqs.canLeave ? 'ready' : ''}" aria-hidden="true">
            <span class="sample-beacon-star">✦</span>
            <span class="sample-beacon-ring"></span>
          </div>
          <div id="stage-ship-svg" class="entity-svg-wrap">
            ${MODELS.spaceship({
      hatchOpen: hatchOpen && reqs.canLeave,
      launching: false,
      penguinInHatch: false,
      inSpaceFlight: inSpace
    })}
          </div>
        </button>
      </div>
    `);

    // 2. Únicamente la máquina de la ubicación activa (sin etiqueta flotante)
    if (activeMachine) {
      const inspected = state.inspectedMachines.includes(activeMachine.id);
      const modelSvg = MODELS[activeMachine.modelKey] ? MODELS[activeMachine.modelKey]() : '';
      const floatClass = activeMachine.id === 'pioneer-10' ? 'space-float' : '';
      parts.push(`
        <div class="stage-entity ${floatClass}" data-entity-kind="machine" data-entity-id="${activeMachine.id}" data-sort-y="${activeMachine.pos.y}" style="left: ${activeMachine.pos.x}%; top: ${activeMachine.pos.y}%;">
          <button type="button" class="stage-hotspot machine-hotspot" data-machine-id="${activeMachine.id}" aria-label="${activeMachine.name}">
            <div class="sample-beacon machine-beacon ${inspected ? 'inspected' : ''}" aria-hidden="true">
              <span class="sample-beacon-star">✦</span>
              <span class="sample-beacon-ring"></span>
            </div>
            <div class="entity-svg-wrap">${modelSvg}</div>
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
        <div class="stage-entity" data-entity-kind="sample" data-entity-id="${sampleObj.id}" data-sort-y="${sampleObj.pos.y}" style="left: ${sampleObj.pos.x}%; top: ${sampleObj.pos.y}%;">
          <button ${btnIdAttr}type="button" class="stage-hotspot sample-hotspot" data-sample-id="${sampleObj.id}" aria-label="${sampleObj.label}">
            <div class="sample-beacon" aria-hidden="true">
              <span class="sample-beacon-star">✦</span>
              <span class="sample-beacon-ring"></span>
            </div>
            <div class="entity-svg-wrap">${MODELS.sampleCrystal(chapter.id, sampleObj.variant || 0)}</div>
          </button>
        </div>
      `);
    });

    dom.stageEntitiesLayer.innerHTML = parts.join('');
    world3d.domEntityNodes = Array.from(dom.stageEntitiesLayer.querySelectorAll('.stage-entity'));
    world3d.forceDomSync = true;
    updateDepthSorting();
    if (world3d.active) {
      syncDomEntitiesToWorld3d(getTerrain3D());
    }

    // Listeners de entidades recién creadas
    const hatchBtn = document.getElementById('ship-hatch-btn');
    if (hatchBtn) {
      hatchBtn.addEventListener('click', () => {
        if (is3dInspectMode) return;
        const finishHatch = () => {
          checkSurfaceProximity();
          const r = checkSiteRequirements(chapter);
          if (!r.canLeave) {
            showPendingTasksNotice(chapter, r.missing);
          }
        };
        if (world3d.active && world3d.ship) {
          const rampFoot = getWorld3dShipRampFoot();
          const destW = resolveWorld3dPoint(rampFoot.x, rampFoot.z);
          walkPenguin3dTo(destW.x, destW.z, () => {
            if (world3d.penguin && world3d.ship) {
              // Mirar directamente hacia arriba por la escalera/esclusa lateral de la nave
              world3d.penguin.yaw = rampFoot.shipYaw - Math.PI * 0.5;
            }
            finishHatch();
          });
          return;
        }
        const boardingPoint = resolveSurfacePoint(shipPos.x + 9.5, shipPos.y + 4.8, chapter);
        routeAndMove(boardingPoint.x, boardingPoint.y, finishHatch);
      });
    }

    document.querySelectorAll('.machine-hotspot').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (is3dInspectMode) return;
        const machine = chapter.machines.find((m) => m.id === btn.dataset.machineId);
        if (!machine) return;
        if (world3d.active && world3d.machine && world3d.penguin) {
          const sideSign = world3d.penguin.x < world3d.machine.x ? -1 : 1;
          const destW = resolveWorld3dPoint(world3d.machine.x + sideSign * 0.72, world3d.machine.z + 0.42);
          walkPenguin3dTo(destW.x, destW.z, () => {
            if (world3d.penguin && world3d.machine) {
              world3d.penguin.yaw = Math.atan2(world3d.machine.x - world3d.penguin.x, world3d.machine.z - world3d.penguin.z);
            }
            openDialogueModal(machine);
          });
          return;
        }
        const approachOffsets = {
          'apollo-11-eagle': { x: 12.5, y: 6.0 },
          'sojourner':       { x: 6.2,  y: 4.2 },
          'near-shoemaker':  { x: 11.5, y: 5.5 }
        };
        const off = approachOffsets[machine.id] || { x: 9.5, y: chapter.hasSurface ? 5.5 : 4.8 };
        const offsetX = machine.pos.x > penguinPos.x ? -off.x : off.x;
        const approachY = machine.pos.y + off.y;
        const target = resolveSurfacePoint(machine.pos.x + offsetX, approachY, chapter);
        routeAndMove(target.x, target.y, () => {
          openDialogueModal(machine);
        });
      });
    });

    document.querySelectorAll('.sample-hotspot').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (is3dInspectMode) return;
        const sampleObj = siteSamples.find((s) => s.id === btn.dataset.sampleId);
        if (!sampleObj) return;
        if (world3d.active && world3d.samples[sampleObj.id]) {
          const sW = world3d.samples[sampleObj.id];
          let destX = sW.x;
          let destZ = sW.z;
          // Detenerse justo al borde físico de la roca (en vez de caminar dentro de ella)
          if (world3d.penguin) {
            const dx = world3d.penguin.x - sW.x;
            const dz = world3d.penguin.z - sW.z;
            const d = Math.hypot(dx, dz) || 1;
            const standoff = sampleObj.id === 'sample-mars-5' ? 0.78 : (sampleObj.id === 'sample-mars-4' ? 0.58 : 0.46);
            destX = sW.x + (dx / d) * standoff;
            destZ = sW.z + (dz / d) * standoff;
          }
          const destW = resolveWorld3dPoint(destX, destZ);
          walkPenguin3dTo(destW.x, destW.z, () => {
            if (world3d.penguin) {
              world3d.penguin.yaw = Math.atan2(sW.x - world3d.penguin.x, sW.z - world3d.penguin.z);
            }
            openSampleDiscoveryModal(chapter, sampleObj);
          });
          return;
        }
        const sampleTarget = resolveSurfacePoint(sampleObj.pos.x, sampleObj.pos.y, chapter);
        routeAndMove(sampleTarget.x, sampleTarget.y, () => {
          openSampleDiscoveryModal(chapter, sampleObj);
        });
      });
    });
  }

  function renderPenguin(animateDescend) {
    dom.penguinActor.style.left = `${penguinPos.x}%`;
    dom.penguinActor.style.top = `${penguinPos.y}%`;
    if (penguinDir !== lastRenderedDir || !dom.penguinSprite.firstElementChild) {
      dom.penguinSprite.innerHTML = MODELS.cyberpenguin(penguinDir);
      lastRenderedDir = penguinDir;
    }
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
    world3d.walkAnim = null;
    world3d.jumpAnim = null;
    world3d.domEntityNodes = null;
    world3d.lastCamSig = '';
    world3d.lastPenguinSig = '';
    world3d.forceDomSync = true;
    if (world3d.penguin) {
      world3d.penguin.isWalking = false;
      world3d.penguin.jumpHeight = 0;
    }
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
    if (isJumping) return;
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
      checkSurfaceProximity();
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
    if (isJumping) return;
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
    checkSurfaceProximity();
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
    if (isJumping) return;
    if (world3d.active && world3d.penguin) {
      const dMap = {
        up: { dx: 0, dz: -1.35 },
        down: { dx: 0, dz: 1.35 },
        left: { dx: -1.35, dz: 0 },
        right: { dx: 1.35, dz: 0 }
      };
      const delta = dMap[dir];
      if (!delta) return;
      const destW = resolveWorld3dPoint(world3d.penguin.x + delta.dx, world3d.penguin.z + delta.dz);
      walkPenguin3dTo(destW.x, destW.z, checkSurfaceProximity);
      return;
    }
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
    clearWalkTimers();
    triggerHaptic('jump');

    const { activeMachine } = getActiveSite(chapter);
    const siteId = activeMachine ? activeMachine.siteId : '';
    const profile = getGravityProfile(chapter.id, siteId);
    isJumping = true;
    clearTimeout(jumpTimer);

    const dirSign = penguinDir === 'left' ? -1 : 1;
    let jumpOrigin = { x: penguinPos.x, y: penguinPos.y };
    let jumpTarget = { x: penguinPos.x, y: penguinPos.y };

    const t3d = getTerrain3D();
    if (world3d.active && world3d.penguin && t3d) {
      const orig = { ...world3d.penguin };
      let destW = resolveWorld3dPoint(orig.x + dirSign * 1.15, orig.z);
      if (Math.hypot(destW.x - orig.x, destW.z - orig.z) < 0.35) {
        destW = resolveWorld3dPoint(orig.x - dirSign * 1.15, orig.z);
        if (destW.x < orig.x - 0.15) penguinDir = 'left';
        if (destW.x > orig.x + 0.15) penguinDir = 'right';
      }
      const jumpYaw = Math.atan2(destW.x - orig.x, destW.z - orig.z + 0.35);
      const peakH = siteId === 'asteroid-eros' ? 1.45 : (chapter.id === 'moon' ? 0.92 : 0.48);
      const pOrig = t3d.projectWorldToScreen(orig.x, orig.y, orig.z);
      const pTgt = t3d.projectWorldToScreen(destW.x, destW.y, destW.z);
      jumpOrigin = { x: pOrig.pctX, y: pOrig.pctY };
      jumpTarget = { x: pTgt.pctX, y: pTgt.pctY };
      world3d.penguin.yaw = jumpYaw;
      world3d.jumpAnim = {
        from: { x: orig.x, z: orig.z },
        to: { x: destW.x, z: destW.z },
        yaw: jumpYaw,
        peakHeight: peakH,
        startTime: performance.now(),
        durationMs: profile.jumpDurationMs
      };
    } else {
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
      jumpOrigin = { x: penguinPos.x, y: penguinPos.y };
      jumpTarget = { x: hopTarget.x, y: hopTarget.y };
      penguinPos = { x: hopTarget.x, y: hopTarget.y };
      dom.penguinActor.style.left = `${penguinPos.x}%`;
      dom.penguinActor.style.top = `${penguinPos.y}%`;
    }

    dom.penguinActor.classList.remove('jumping-moon', 'jumping-mars', 'jumping-eros', 'jumping-deep');
    void dom.penguinActor.offsetWidth;
    dom.penguinActor.style.transitionDuration = `${profile.jumpDurationMs}ms`;
    dom.penguinActor.classList.add(profile.jumpClass);

    evaFromPos = { ...evaVisualPos };
    evaAnimStart = Date.now();
    evaAnimDuration = profile.jumpDurationMs;

    dom.penguinSprite.innerHTML = MODELS.cyberpenguin(penguinDir);
    lastRenderedDir = penguinDir;
    updateDepthSorting();
    if (FX && typeof FX.setPenguinTarget === 'function') {
      FX.setPenguinTarget(penguinPos);
    }

    if (profile.dustOnJump) {
      spawnDustPuff(penguinPos.x, penguinPos.y);
    }
    const jumpSound = (siteId === 'asteroid-eros' || !chapter.hasSurface)
      ? 'rcs'
      : (chapter.id === 'mars' ? 'jumpMars' : 'jumpMoon');
    playHarmony(jumpSound);
    if (FX && typeof FX.emitBurst === 'function') {
      FX.emitBurst(penguinPos, (siteId === 'asteroid-eros' || !chapter.hasSurface) ? 'rcs' : 'jump', chapter.id, siteId);
    }

    // Globo de pensamiento ambiental sobre Cyberpenguin al saltar en gravedad especial
    const allThoughts = DATA.getAmbientThoughts ? DATA.getAmbientThoughts(state.currentLanguage) : DATA.AMBIENT_THOUGHTS;
    if (allThoughts && allThoughts[chapter.id]) {
      const thoughts = allThoughts[chapter.id];
      const randomIndex = Math.floor(Math.random() * thoughts.length);
      activeAmbientThought = { chapterId: chapter.id, index: randomIndex };
      const jumpArcPct = (siteId === 'asteroid-eros' ? 16.5 : (chapter.id === 'moon' ? 8.5 : 3.5));
      showPenguinThought(thoughts[randomIndex], {
        origin: jumpOrigin,
        target: jumpTarget,
        durationMs: profile.jumpDurationMs,
        arcPct: jumpArcPct
      });
    }

    if (!chapter.hasSurface) {
      startEvaTetherLoop(profile.jumpDurationMs + 120);
    }

    jumpTimer = setTimeout(() => {
      if (dom.penguinActor) {
        dom.penguinActor.classList.remove(profile.jumpClass);
        dom.penguinActor.style.transitionDuration = `${profile.stepDurationMs}ms`;
      }
      if (world3d.active && world3d.jumpAnim) {
        const ja = world3d.jumpAnim;
        const t3 = getTerrain3D();
        world3d.penguin = {
          x: ja.to.x,
          y: t3 ? t3.getGroundHeightAt(ja.to.x, ja.to.z) : 0,
          z: ja.to.z,
          yaw: ja.yaw || (world3d.penguin ? world3d.penguin.yaw : 0.42),
          isWalking: false,
          jumpHeight: 0
        };
        world3d.jumpAnim = null;
        syncDomEntitiesToWorld3d(t3);
      }
      if (profile.dustOnJump) {
        spawnDustPuff(penguinPos.x, penguinPos.y);
      }
      isJumping = false;
      checkSurfaceProximity();
    }, profile.jumpDurationMs);
  }

  function getDist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function showStageActionPrompt(type, target, onAction) {
    if (!dom.stageActionPrompt || !dom.stageActionBtn) return;
    activeInteractable = { type, target, onAction };

    const isEn = (state.currentLanguage === 'en');
    let label = isEn ? 'Interact' : 'Interactuar';
    if (type === 'sample') {
      label = isEn ? 'Collect' : 'Recoger';
    } else if (type === 'machine') {
      label = isEn ? `Talk to ${target.name || 'spacecraft'}` : `Hablar con ${target.name || 'sonda'}`;
    } else if (type === 'ship-travel') {
      label = isEn ? 'Next stop' : 'Siguiente parada';
    } else if (type === 'ship-leave') {
      label = isEn ? 'Board spaceship' : 'Entrar a la nave';
    } else if (type === 'ship-locked') {
      label = isEn
        ? 'Complete all mission tasks to explore more places'
        : 'Termina todas las tareas de la misión para explorar más lugares';
    }

    if (dom.stageActionIcon) dom.stageActionIcon.textContent = '';
    if (dom.stageActionLabel) dom.stageActionLabel.textContent = label;

    // Ubicación sobre el objeto objetivo (no sobre el pingüino)
    let objX = penguinPos.x;
    let objY = penguinPos.y;
    let offsetY = -10;

    if (type === 'sample' && target && target.pos) {
      const sA = world3d.active && world3d.samples[target.id];
      objX = sA ? sA.screenX : target.pos.x;
      objY = sA ? sA.screenY : target.pos.y;
      offsetY = -2.5; // Directamente encima de la roca (cerca de la roca, no sobre el pingüino)
    } else if (type === 'machine' && target && target.pos) {
      const mA = world3d.active && world3d.machine;
      objX = mA ? mA.screenX : target.pos.x;
      objY = mA ? mA.screenY : target.pos.y;
      offsetY = -12;
    } else if (type.startsWith('ship')) {
      const chapter = getChapter(state.currentChapterId);
      const { activeMachine } = getActiveSite(chapter);
      const shipPos = activeMachine && activeMachine.shipPos ? activeMachine.shipPos : (chapter ? chapter.shipPos : penguinPos);
      objX = (world3d.active && world3d.ship) ? world3d.ship.screenX : shipPos.x;
      objY = (world3d.active && world3d.ship) ? world3d.ship.screenY : shipPos.y;
      offsetY = -12;
    }

    const px = Math.max(8, Math.min(92, objX));
    const py = Math.max(10, Math.min(88, objY + offsetY));
    dom.stageActionPrompt.style.left = `${px}%`;
    dom.stageActionPrompt.style.top = `${py}%`;
    dom.stageActionPrompt.classList.toggle('prompt-for-sample', type === 'sample');
    dom.stageActionPrompt.classList.remove('is-hidden');
  }

  function hideStageActionPrompt() {
    activeInteractable = null;
    if (dom.stageActionPrompt) {
      dom.stageActionPrompt.classList.add('is-hidden');
    }
  }

  function checkSiteRequirements(chapter) {
    if (!chapter) return { canLeave: true, missing: [] };
    const { activeMachine } = getActiveSite(chapter);
    const missing = [];
    const isEn = (state.currentLanguage === 'en');

    // 1. Hablar con la sonda o máquina histórica en este sitio
    if (activeMachine && !state.inspectedMachines.includes(activeMachine.id)) {
      missing.push(isEn ? `Talk to ${activeMachine.name}` : `Hablar con ${activeMachine.name}`);
    }

    // 2. Recolectar todas las muestras geológicas del sitio
    if (chapter.hasSurface) {
      const siteSamples = getSiteSamples(chapter, activeMachine);
      const pendingSamples = siteSamples.filter((s) => !state.collectedSamples.includes(s.id));
      if (pendingSamples.length > 0) {
        missing.push(
          pendingSamples.length === 1
            ? (isEn ? 'Collect the pending rock sample' : 'Recoger la roca pendiente')
            : (isEn ? `Collect all ${pendingSamples.length} pending rock samples` : `Recoger las ${pendingSamples.length} rocas pendientes`)
        );
      }
    }

    return {
      canLeave: missing.length === 0,
      missing
    };
  }

  function showPendingTasksNotice(chapter, missing) {
    if (!missing || missing.length === 0) return;
    triggerHaptic('tap');
    showStageActionPrompt('ship-locked', { missing }, () => {
      triggerHaptic('tap');
    });
  }

  function checkSurfaceProximity() {
    const chapter = getChapter(state.currentChapterId);
    if (!chapter) return;
    if (dom.gameScreen.classList.contains('is-hidden') || isBlockingModalOpen()) {
      hideStageActionPrompt();
      return;
    }

    const { siteIdx, activeMachine } = getActiveSite(chapter);
    const shipPos = (activeMachine && activeMachine.shipPos) || chapter.shipPos;
    const isFirstStop = siteIdx === 0 && chapter.machines.length > 1;

    // Si nos alejamos de la máquina activa mientras habla, cerrar diálogo
    if (activeMachine) {
      const distToMachine = (world3d.active && world3d.penguin && world3d.machine)
        ? Math.hypot(world3d.penguin.x - world3d.machine.x, world3d.penguin.z - world3d.machine.z)
        : getDist(penguinPos, activeMachine.pos);
      const closeLimit = (world3d.active && world3d.machine) ? 3.6 : 18.5;
      if (distToMachine > closeLimit && activeDialogueMachine && activeDialogueMachine.id === activeMachine.id) {
        closeDialogueModal();
      }
    }

    // Evaluar interactuables dentro de rango
    const candidates = [];

    // 1. Muestras geológicas no recogidas (prioridad de exploración)
    if (chapter.hasSurface) {
      const siteSamples = getSiteSamples(chapter, activeMachine);
      siteSamples.forEach((sampleObj) => {
        if (!state.collectedSamples.includes(sampleObj.id)) {
          const sA = world3d.active && world3d.penguin && world3d.samples[sampleObj.id];
          const dist = sA
            ? Math.hypot(world3d.penguin.x - sA.x, world3d.penguin.z - sA.z) * 6.0
            : getDist(penguinPos, sampleObj.pos);
          if (dist <= 13.5) {
            candidates.push({
              type: 'sample',
              target: sampleObj,
              dist,
              onAction: () => openSampleDiscoveryModal(chapter, sampleObj)
            });
          }
        }
      });
    }

    // 2. Máquina o sonda histórica
    if (activeMachine) {
      const machineThresholds = {
        'apollo-11-eagle': 17.5,
        'sojourner':       12.0,
        'near-shoemaker':  16.5
      };
      const thresh = machineThresholds[activeMachine.id] || 15.5;
      const dist = (world3d.active && world3d.penguin && world3d.machine)
        ? Math.hypot(world3d.penguin.x - world3d.machine.x, world3d.penguin.z - world3d.machine.z) * 5.2
        : getDist(penguinPos, activeMachine.pos);
      if (dist <= thresh) {
        candidates.push({
          type: 'machine',
          target: activeMachine,
          dist,
          onAction: () => openDialogueModal(activeMachine)
        });
      }
    }

    // 3. Escotilla de la nave espacial (solo permite despegar si se completaron las tareas)
    const hatchPoint = getHatchAnchor(chapter);
    const rampFoot3d = (world3d.active && world3d.ship) ? getWorld3dShipRampFoot() : null;
    const distToShip = (world3d.active && world3d.penguin && rampFoot3d)
      ? Math.hypot(world3d.penguin.x - rampFoot3d.x, world3d.penguin.z - rampFoot3d.z) * 5.5
      : getDist(penguinPos, hatchPoint);
    if (distToShip <= 13.0) {
      const reqs = checkSiteRequirements(chapter);
      if (reqs.canLeave) {
        if (isFirstStop) {
          candidates.push({
            type: 'ship-travel',
            target: null,
            dist: distToShip,
            onAction: () => travelBetweenSites(chapter.id, 0, 1)
          });
        } else {
          candidates.push({
            type: 'ship-leave',
            target: null,
            dist: distToShip,
            onAction: () => closeHatchAndOpenQuiz(chapter)
          });
        }
      } else {
        candidates.push({
          type: 'ship-locked',
          target: { missing: reqs.missing },
          dist: distToShip,
          onAction: () => showPendingTasksNotice(chapter, reqs.missing)
        });
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.dist - b.dist);
      const nearest = candidates[0];
      showStageActionPrompt(nearest.type, nearest.target, nearest.onAction);
    } else {
      hideStageActionPrompt();
    }
  }

  function clampToSurface(x, y, chapterOverride) {
    const chapter = chapterOverride || getChapter(state.currentChapterId);
    if (chapter && !chapter.hasSurface) {
      const { activeMachine } = getActiveSite(chapter);
      const isEros = activeMachine && activeMachine.siteId === 'asteroid-eros';
      const clampedX = Math.max(16, Math.min(84, x));
      // En el asteroide Eros la superficie reposa en la mitad inferior (53-86%), mientras que en Pioneer 10 es vacío abierto (28-84%)
      const minY = isEros ? 53 : 28;
      const clampedY = Math.max(minY, Math.min(86, y));
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
    const badges = DATA.getBadges ? DATA.getBadges(state.currentLanguage) : DATA.BADGES;
    let current = badges[0];
    badges.forEach((badge) => {
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

  function renderHomeBackground() {
    if (typeof MODELS.homeBackdrop !== 'function') return;
    if (dom.homeBgLandscape) dom.homeBgLandscape.innerHTML = MODELS.homeBackdrop('landscape');
    if (dom.homeBgPortrait) dom.homeBgPortrait.innerHTML = MODELS.homeBackdrop('portrait');
  }

  function isChapterUnlocked(chapterId) {
    const idx = DATA.CHAPTERS.findIndex((c) => c.id === chapterId);
    if (idx <= 0) return true;
    const prevChapter = DATA.CHAPTERS[idx - 1];
    return isChapterCompleted(prevChapter.id);
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
    const isEn = (state.currentLanguage === 'en');
    dom.chapterNav.innerHTML = getChaptersList().map((chapter) => {
      const completed = isChapterCompleted(chapter.id);
      const unlocked = isChapterUnlocked(chapter.id);
      const inProgress = !completed && hasChapterProgress(chapter.id);
      const isCardActive = inProgress && chapter.id === state.currentChapterId;
      const firstMachine = chapter.machines[0];
      const singleMachineSvg = firstMachine && typeof MODELS[firstMachine.modelKey] === 'function'
        ? MODELS[firstMachine.modelKey]()
        : '';
      const sceneHtml = MODELS.chapterScene(chapter.id, singleMachineSvg);

      const btnLabel = !unlocked
        ? (isEn ? 'Complete previous mission to unlock' : 'Completa la misión anterior para desbloquear')
        : completed
          ? (isEn ? 'Explore again' : 'Explorar de nuevo')
          : inProgress
            ? (isEn ? 'Continue' : 'Continuar')
            : (isEn ? 'Explore' : 'Explorar');

      return `
        <div class="home-chapter-card p-5 sm:p-6 flex flex-col items-center justify-between text-center gap-4 h-full ${isCardActive ? 'is-active' : ''
        } ${!unlocked ? 'is-locked' : ''}">
          <div class="w-full flex items-center justify-center">
            <h3 class="text-xs sm:text-sm font-semibold tracking-wide text-slate-200 text-center">${chapter.name}</h3>
          </div>

          <div class="home-chapter-emblem relative w-full ${!unlocked ? 'opacity-55' : ''}">
            ${sceneHtml}
          </div>

          <div class="flex flex-col items-center gap-3 w-full">
            <button type="button"
              class="squircle-btn rounded-full w-full inline-flex items-center justify-center text-center py-2.5 px-3 sm:px-4 font-medium transition-colors ${!unlocked
          ? 'home-chapter-btn-locked'
          : isCardActive
            ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20 shadow-sm text-xs sm:text-sm'
            : 'bg-white/[0.06] hover:bg-white/[0.14] text-slate-200 border border-white/[0.08] text-xs sm:text-sm'
        }"
              ${!unlocked ? 'disabled' : ''}
              data-enter-chapter="${chapter.id}">
              ${!unlocked ? `
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5 opacity-90 inline-block flex-shrink-0" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              ` : ''}
              <span>${btnLabel}</span>
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
    const isEn = (state.currentLanguage === 'en');
    const totalStars = getTotalStars();
    const badge = getCurrentBadge();
    const chaptersList = getChaptersList();
    const badgesList = DATA.getBadges ? DATA.getBadges(state.currentLanguage) : DATA.BADGES;
    const completedCount = chaptersList.filter((ch) => isChapterCompleted(ch.id)).length;
    const allCompleted = areAllChaptersCompleted();

    const passportCount = chaptersList.filter(hasChapterPassportStamp).length;
    dom.hudPassportCount.textContent = `${passportCount}/${chaptersList.length}`;
    dom.hudBadgeName.textContent = badge.name;

    if (dom.homeTotalStars) {
      dom.homeTotalStars.textContent = `★ ${totalStars}/15`;
    }
    if (dom.homeChaptersCompletedCount) {
      dom.homeChaptersCompletedCount.textContent = `${completedCount}/${chaptersList.length}`;
    }
    if (dom.homePassportSlots) {
      dom.homePassportSlots.innerHTML = chaptersList.map((chapter) => {
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
      dom.homeBadgesGrid.innerHTML = badgesList.map((item) => {
        const unlocked = totalStars >= item.minStars;
        return `
          <div class="rounded-xl bg-white/[0.03] border border-white/[0.06] min-h-[54px] px-0.5 py-1.5 flex flex-col items-center justify-center gap-1 text-center ${unlocked ? '' : 'opacity-40'
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
      certPreview.title = allCompleted
        ? (isEn ? 'Tap to view diploma' : 'Toca para ver el diploma')
        : (isEn ? 'Available upon completing all chapters' : 'Disponible al completar todos los capítulos');
      certPreview.innerHTML = `
        <div class="flex items-center justify-center">${MODELS.penguinPawStamp(allCompleted, 26)}</div>
      `;
    }
    const certActions = document.getElementById('home-certificate-actions');
    if (dom.homeCertificateStatus) {
      dom.homeCertificateStatus.textContent = allCompleted
        ? (isEn ? 'Completed! Diploma ready' : '¡Completado! Diploma listo')
        : (isEn ? 'Available upon completing all chapters' : 'Disponible al completar todos los capítulos');
      dom.homeCertificateStatus.classList.remove('hidden');
    }
    if (certActions) {
      certActions.classList.toggle('hidden', !allCompleted);
    }
    if (dom.openCertificateBtn) {
      dom.openCertificateBtn.disabled = !allCompleted;
      dom.openCertificateBtn.textContent = isEn ? 'View diploma' : 'Ver diploma';
    }
    if (dom.homeDownloadCertificateBtn) {
      dom.homeDownloadCertificateBtn.disabled = !allCompleted;
      dom.homeDownloadCertificateBtn.textContent = isEn ? 'Download' : 'Descargar';
    }
    if (dom.downloadCertificateBtn) {
      dom.downloadCertificateBtn.disabled = !allCompleted;
    }

    renderChapterNav();
  }

  /* ========================================================================
     Globos de Diálogo Encima de los Personajes (Estilo Animal Crossing)
     ======================================================================== */

  function positionSpeechBubble(x, y) {
    if (!dom.stageSpeechBubble) return;
    const clampedX = Math.max(22, Math.min(78, x));
    const isFlipped = y < 30;
    dom.stageSpeechBubble.classList.toggle('bubble-flipped', isFlipped);
    dom.stageSpeechBubble.style.left = `${clampedX}%`;
    const targetY = isFlipped ? Math.min(78, y + 8) : Math.max(15, y - 8);
    dom.stageSpeechBubble.style.top = `${targetY}%`;
  }

  function hideSpeechBubble() {
    if (dom.stageSpeechBubble) {
      dom.stageSpeechBubble.classList.add('is-hidden');
    }
    clearTimeout(dialogueAutoTimer);
    TTS.stop();
  }

  let thoughtJumpParams = null;

  function stopThoughtTracking() {
    if (thoughtTrackingRaf && typeof global.cancelAnimationFrame === 'function') {
      global.cancelAnimationFrame(thoughtTrackingRaf);
    }
    thoughtTrackingRaf = null;
    thoughtJumpParams = null;
    if (dom.stageThoughtBubble) {
      dom.stageThoughtBubble.classList.remove('is-tracking');
    }
  }

  function hideThoughtBubble() {
    clearTimeout(thoughtBubbleTimer);
    stopThoughtTracking();
    if (dom.stageThoughtBubble) {
      dom.stageThoughtBubble.classList.add('is-hidden');
    }
    activeAmbientThought = null;
  }

  function applyThoughtBubblePosition(x, y) {
    if (!dom.stageThoughtBubble) return;
    const clampedX = Math.max(16, Math.min(84, x));
    // Clamping superior en 22% para que el globo nunca toque el borde superior ni se corte
    const safeY = Math.max(22, y - 14);
    dom.stageThoughtBubble.style.left = `${clampedX.toFixed(2)}%`;
    dom.stageThoughtBubble.style.top = `${safeY.toFixed(2)}%`;
  }

  function startThoughtTrackingJump(jumpData) {
    stopThoughtTracking();
    if (!dom.stageThoughtBubble || dom.stageThoughtBubble.classList.contains('is-hidden') || !jumpData) return;

    thoughtJumpParams = {
      origin: jumpData.origin,
      target: jumpData.target,
      durationMs: jumpData.durationMs || 1000,
      arcPct: jumpData.arcPct || 0,
      startTime: Date.now()
    };

    dom.stageThoughtBubble.classList.add('is-tracking');
    applyThoughtBubblePosition(thoughtJumpParams.origin.x, thoughtJumpParams.origin.y);

    if (typeof global.requestAnimationFrame !== 'function') return;

    const tick = () => {
      if (!dom.stageThoughtBubble || dom.stageThoughtBubble.classList.contains('is-hidden') || !thoughtJumpParams) {
        stopThoughtTracking();
        return;
      }

      const elapsed = Date.now() - thoughtJumpParams.startTime;
      const t = Math.min(1, Math.max(0, elapsed / thoughtJumpParams.durationMs));
      const arc = thoughtJumpParams.arcPct * Math.sin(t * Math.PI);
      const curX = thoughtJumpParams.origin.x + (thoughtJumpParams.target.x - thoughtJumpParams.origin.x) * t;
      const curY = thoughtJumpParams.origin.y + (thoughtJumpParams.target.y - thoughtJumpParams.origin.y) * t - arc;

      applyThoughtBubblePosition(curX, curY);

      if (t < 1) {
        thoughtTrackingRaf = global.requestAnimationFrame(tick);
      } else {
        const finalTarget = thoughtJumpParams.target;
        stopThoughtTracking();
        if (finalTarget) {
          applyThoughtBubblePosition(finalTarget.x, finalTarget.y);
        }
      }
    };

    thoughtTrackingRaf = global.requestAnimationFrame(tick);
  }

  function showPenguinThought(text, jumpData) {
    if (!dom.stageThoughtBubble || !dom.thoughtBubbleText || !text) return;
    clearTimeout(thoughtBubbleTimer);

    dom.thoughtBubbleText.textContent = text;
    dom.stageThoughtBubble.classList.remove('is-hidden');

    if (jumpData) {
      startThoughtTrackingJump(jumpData);
    } else {
      stopThoughtTracking();
      applyThoughtBubblePosition(penguinPos.x, penguinPos.y);
    }

    thoughtBubbleTimer = setTimeout(() => {
      hideThoughtBubble();
    }, 4800);
  }

  function showSpeechBubbleStep({ speaker, name, avatarSvg, text, audioUrl, anchorPos, choices, onNext, onChoice }) {
    if (!dom.stageSpeechBubble) return;
    hideThoughtBubble();
    const turnToken = ++activeDialogueToken;
    clearTimeout(dialogueAutoTimer);
    TTS.stop();

    const isPenguin = speaker === 'penguin';
    const isShip = speaker === 'ship';

    dom.stageSpeechBubble.classList.remove('speaker-is-penguin', 'speaker-is-machine', 'speaker-is-ship');
    if (isPenguin) dom.stageSpeechBubble.classList.add('speaker-is-penguin');
    else if (isShip) dom.stageSpeechBubble.classList.add('speaker-is-ship');
    else dom.stageSpeechBubble.classList.add('speaker-is-machine');

    const isEnglish = (state.currentLanguage === 'en');

    if (dom.speechBubbleAvatar) {
      dom.speechBubbleAvatar.innerHTML = avatarSvg || '';
    }
    if (dom.speechBubbleName) {
      const defaultName = isPenguin
        ? 'Cyberpenguin'
        : isShip
          ? (isEnglish ? "Cyberpenguin's Ship" : 'Nave de Cyberpenguin')
          : (isEnglish ? 'Spacecraft' : 'Máquina');
      dom.speechBubbleName.textContent = name || defaultName;
    }
    if (dom.speechBubbleText) {
      const cleanText = (text || '').trim();
      if (cleanText) {
        dom.speechBubbleText.textContent = cleanText;
        dom.speechBubbleText.style.display = 'block';
      } else {
        dom.speechBubbleText.textContent = '';
        dom.speechBubbleText.style.display = 'none';
      }
    }

    // Ubicar el globo justo encima del personaje que habla
    activeSpeechAnchorKind = isPenguin ? 'penguin' : isShip ? 'ship' : 'machine';
    let resolvedAnchor = anchorPos || (isPenguin ? penguinPos : { x: 50, y: 50 });
    if (world3d.active) {
      if (isPenguin) resolvedAnchor = penguinPos;
      else if (isShip && world3d.ship) resolvedAnchor = { x: world3d.ship.screenX, y: world3d.ship.screenY };
      else if (world3d.machine) resolvedAnchor = { x: world3d.machine.screenX, y: world3d.machine.screenY };
    }
    positionSpeechBubble(resolvedAnchor.x, resolvedAnchor.y);

    // Renderizar opciones interactivas de respuesta estilo Animal Crossing
    if (dom.speechBubbleOptions) {
      dom.speechBubbleOptions.innerHTML = '';
      if (Array.isArray(choices) && choices.length > 0) {
        choices.forEach((c) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'speech-choice-btn';
          btn.textContent = c.label || c.text;
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic('tap');
            playHarmony('step');
            if (onChoice) onChoice(c);
          });
          dom.speechBubbleOptions.appendChild(btn);
        });
      }
    }

    // Botón de continuar cuando no hay opciones múltiples
    if (dom.speechBubbleActionRow && dom.speechBubbleNextBtn) {
      dom.speechBubbleNextBtn.textContent = (state.currentLanguage === 'en') ? 'Continue ▶' : 'Continuar ▶';
      if (Array.isArray(choices) && choices.length > 0) {
        dom.speechBubbleActionRow.style.display = 'none';
      } else {
        dom.speechBubbleActionRow.style.display = 'flex';
        dom.speechBubbleNextBtn.onclick = (e) => {
          e.stopPropagation();
          triggerHaptic('tap');
          if (onNext) onNext();
        };
      }
    }

    dom.stageSpeechBubble.classList.remove('is-hidden');

    const pitch = isPenguin ? 1.22 : isShip ? 0.92 : 0.98;
    const rate = isPenguin ? 1.0 : 0.98;

    if (text && text.trim()) {
      TTS.speak({
        text,
        audioUrl: audioUrl || '',
        pitch,
        rate,
        lang: (state.currentLanguage === 'en') ? 'en-US' : 'es-ES',
        onEnd: () => {
          // En diálogos con botón siguiente, el usuario pulsa para avanzar
        },
        onEmpty: () => {
          // Fallback
        }
      });
    }
  }

  function startBranchingDialogue(machine) {
    activeDialogueMachine = machine;
    const branch = machine.branchingDialogue;
    if (!branch) {
      fallbackLinearDialogue(machine);
      return;
    }

    activeBranchState = {
      machine,
      step: 'greeting',
      choice1: null,
      choice2: null
    };

    renderBranchStep();
  }

  function renderBranchStep() {
    if (!activeBranchState || !activeBranchState.machine) return;
    const { machine, step, choice1, choice2 } = activeBranchState;
    const branch = machine.branchingDialogue;
    const machineSvg = MODELS[machine.modelKey] ? MODELS[machine.modelKey]() : '';
    const penguinSvg = MODELS.cyberpenguin ? MODELS.cyberpenguin('right') : '';

    if (step === 'greeting') {
      showSpeechBubbleStep({
        speaker: 'machine',
        name: machine.name,
        avatarSvg: machineSvg,
        text: branch.greeting.text,
        audioUrl: branch.greeting.audioUrl,
        anchorPos: machine.pos,
        onNext: () => {
          activeBranchState.step = 'decision1';
          renderBranchStep();
        }
      });
    } else if (step === 'decision1') {
      showSpeechBubbleStep({
        speaker: 'penguin',
        name: 'Cyberpenguin',
        avatarSvg: penguinSvg,
        text: '',
        anchorPos: penguinPos,
        choices: branch.decision1.choices,
        onChoice: (chosen) => {
          activeBranchState.choice1 = chosen;
          activeBranchState.step = 'decision1_spoken';
          renderBranchStep();
        }
      });
    } else if (step === 'decision1_spoken') {
      showSpeechBubbleStep({
        speaker: 'penguin',
        name: 'Cyberpenguin',
        avatarSvg: penguinSvg,
        text: choice1.penguinText || choice1.label,
        audioUrl: choice1.audioPenguin,
        anchorPos: penguinPos,
        onNext: () => {
          activeBranchState.step = 'reply1';
          renderBranchStep();
        }
      });
    } else if (step === 'reply1') {
      showSpeechBubbleStep({
        speaker: 'machine',
        name: machine.name,
        avatarSvg: machineSvg,
        text: choice1.reply,
        audioUrl: choice1.audioReply,
        anchorPos: machine.pos,
        onNext: () => {
          activeBranchState.step = 'commonBridge';
          renderBranchStep();
        }
      });
    } else if (step === 'commonBridge') {
      showSpeechBubbleStep({
        speaker: 'machine',
        name: machine.name,
        avatarSvg: machineSvg,
        text: branch.commonBridge.text,
        audioUrl: branch.commonBridge.audioUrl,
        anchorPos: machine.pos,
        onNext: () => {
          activeBranchState.step = 'decision2';
          renderBranchStep();
        }
      });
    } else if (step === 'decision2') {
      showSpeechBubbleStep({
        speaker: 'penguin',
        name: 'Cyberpenguin',
        avatarSvg: penguinSvg,
        text: '',
        anchorPos: penguinPos,
        choices: branch.decision2.choices,
        onChoice: (chosen) => {
          activeBranchState.choice2 = chosen;
          activeBranchState.step = 'decision2_spoken';
          renderBranchStep();
        }
      });
    } else if (step === 'decision2_spoken') {
      showSpeechBubbleStep({
        speaker: 'penguin',
        name: 'Cyberpenguin',
        avatarSvg: penguinSvg,
        text: choice2.penguinText || choice2.label,
        audioUrl: choice2.audioPenguin,
        anchorPos: penguinPos,
        onNext: () => {
          activeBranchState.step = 'reply2';
          renderBranchStep();
        }
      });
    } else if (step === 'reply2') {
      showSpeechBubbleStep({
        speaker: 'machine',
        name: machine.name,
        avatarSvg: machineSvg,
        text: choice2.reply,
        audioUrl: choice2.audioReply,
        anchorPos: machine.pos,
        onNext: () => {
          activeBranchState.step = 'closing';
          renderBranchStep();
        }
      });
    } else if (step === 'closing') {
      showSpeechBubbleStep({
        speaker: 'machine',
        name: machine.name,
        avatarSvg: machineSvg,
        text: branch.closing.text,
        audioUrl: branch.closing.audioUrl,
        anchorPos: machine.pos,
        onNext: () => {
          activeBranchState.step = 'farewellPenguin';
          renderBranchStep();
        }
      });
    } else if (step === 'farewellPenguin') {
      showSpeechBubbleStep({
        speaker: 'penguin',
        name: 'Cyberpenguin',
        avatarSvg: penguinSvg,
        text: branch.farewellPenguin.text,
        audioUrl: branch.farewellPenguin.audioUrl,
        anchorPos: penguinPos,
        onNext: () => {
          closeDialogueModal();
        }
      });
    }
  }

  function getMachineDialogueTurns(machine) {
    if (!machine) return [];
    const raw = Array.isArray(machine.dialogue) ? machine.dialogue : [];
    return raw
      .filter((item) => item && (typeof item === 'string' || typeof item.text === 'string'))
      .map((item) => {
        if (typeof item === 'string') {
          return { speaker: 'machine', text: item, audioUrl: '' };
        }
        const rawSpeaker = String(item.speaker || '').toLowerCase();
        const speaker = (rawSpeaker === 'penguin' || rawSpeaker === 'cyberpenguin')
          ? 'penguin'
          : (rawSpeaker === 'ship' || rawSpeaker === 'nave')
            ? 'ship'
            : 'machine';
        return {
          speaker,
          text: item.text || '',
          audioUrl: item.audioUrl || ''
        };
      });
  }

  function fallbackLinearDialogue(machine) {
    const turns = getMachineDialogueTurns(machine);
    const shipLabel = (state.currentLanguage === 'en') ? "Cyberpenguin's Ship" : 'Nave de Cyberpenguin';
    let turnIdx = 0;

    const renderTurn = () => {
      if (turnIdx >= turns.length) {
        closeDialogueModal();
        return;
      }
      const t = turns[turnIdx];
      const isPenguin = t.speaker === 'penguin';
      const isShip = t.speaker === 'ship';
      const anchor = isPenguin ? penguinPos : (machine.pos || { x: 50, y: 50 });
      const avatar = isPenguin
        ? MODELS.cyberpenguin('right')
        : isShip
          ? MODELS.spaceship({ hatchOpen: false, launching: false, inSpaceFlight: true })
          : (MODELS[machine.modelKey] ? MODELS[machine.modelKey]() : '');

      showSpeechBubbleStep({
        speaker: t.speaker,
        name: isPenguin ? 'Cyberpenguin' : (isShip ? shipLabel : machine.name),
        avatarSvg: avatar,
        text: t.text,
        audioUrl: t.audioUrl,
        anchorPos: anchor,
        onNext: () => {
          turnIdx++;
          renderTurn();
        }
      });
    };

    renderTurn();
  }

  function openDialogueModal(machine) {
    activeDialogueMachine = machine;
    proximityMachineId = machine.id;

    if (machine.id && machine.id !== 'final-scene' && machine.id !== 'mission-checklist' && !state.inspectedMachines.includes(machine.id)) {
      state.inspectedMachines.push(machine.id);
      saveState();
      renderStageEntities(getChapter(state.currentChapterId));
      checkSurfaceProximity();
    }

    startBranchingDialogue(machine);
  }

  function openFinalDialogueModal() {
    const chapter = getChapter(state.currentChapterId);
    const shipPos = (chapter && chapter.shipPos) || { x: 22, y: 58 };
    const isEn = (state.currentLanguage === 'en');
    const finalTree = DATA.getFinalDialogue ? DATA.getFinalDialogue(state.currentLanguage) : DATA.FINAL_BRANCHING_DIALOGUE;
    const fallbackList = (state.currentLanguage === 'en' && DATA.FINAL_DIALOGUE_EN) ? DATA.FINAL_DIALOGUE_EN : (DATA.FINAL_DIALOGUE || []);
    const shipName = isEn ? "Cyberpenguin's Ship" : 'Nave de Cyberpenguin';

    if (!finalTree) {
      fallbackLinearDialogue({
        id: 'final-scene',
        name: shipName,
        dialogue: fallbackList
      });
      return;
    }

    activeDialogueMachine = { id: 'final-scene', name: 'Cyberpenguin' };
    const penguinSvg = MODELS.cyberpenguin ? MODELS.cyberpenguin('right') : '';

    let finalStep = 'penguinIntro';
    let chosenReflection = null;

    const renderFinal = () => {
      if (finalStep === 'penguinIntro') {
        showSpeechBubbleStep({
          speaker: 'penguin',
          name: 'Cyberpenguin',
          avatarSvg: penguinSvg,
          text: finalTree.penguinIntro.text,
          audioUrl: finalTree.penguinIntro.audioUrl,
          anchorPos: shipPos,
          onNext: () => {
            finalStep = 'decision';
            renderFinal();
          }
        });
      } else if (finalStep === 'decision') {
        showSpeechBubbleStep({
          speaker: 'penguin',
          name: 'Cyberpenguin',
          avatarSvg: penguinSvg,
          text: '',
          anchorPos: shipPos,
          choices: finalTree.decision.choices,
          onChoice: (chosen) => {
            chosenReflection = chosen;
            finalStep = 'decision_spoken';
            renderFinal();
          }
        });
      } else if (finalStep === 'decision_spoken') {
        showSpeechBubbleStep({
          speaker: 'penguin',
          name: 'Cyberpenguin',
          avatarSvg: penguinSvg,
          text: chosenReflection.penguinText,
          audioUrl: chosenReflection.audioPenguin,
          anchorPos: shipPos,
          onNext: () => {
            finalStep = 'reply';
            renderFinal();
          }
        });
      } else if (finalStep === 'reply') {
        showSpeechBubbleStep({
          speaker: 'penguin',
          name: 'Cyberpenguin',
          avatarSvg: penguinSvg,
          text: chosenReflection.reply,
          audioUrl: chosenReflection.audioReply,
          anchorPos: shipPos,
          onNext: () => {
            finalStep = 'closing';
            renderFinal();
          }
        });
      } else if (finalStep === 'closing') {
        showSpeechBubbleStep({
          speaker: 'penguin',
          name: 'Cyberpenguin',
          avatarSvg: penguinSvg,
          text: finalTree.closing.text,
          audioUrl: finalTree.closing.audioUrl,
          anchorPos: shipPos,
          onNext: () => {
            closeDialogueModal();
            playHarmony('victory');
            if (dom.certificateModal) {
              showModal(dom.certificateModal);
            }
          }
        });
      }
    };

    renderFinal();
  }

  function advanceDialogue() {
    if (dom.speechBubbleNextBtn && dom.speechBubbleActionRow && dom.speechBubbleActionRow.style.display !== 'none') {
      dom.speechBubbleNextBtn.click();
    }
  }

  function closeDialogueModal() {
    activeDialogueToken++;
    clearTimeout(dialogueAutoTimer);
    TTS.stop();
    activeDialogueMachine = null;
    activeBranchState = null;
    hideSpeechBubble();
  }

  /* ========================================================================
     Muestras & Pasaporte de Explorador (Patitas de Pingüino)
     ======================================================================== */

  const SAMPLE_DETAILS = {
    'sample-moon-1': {
      title: 'Basalto lunar de olivino',
      site: 'Encontrado en: Oceanus Procellarum (en la Luna)',
      desc: 'Roca volcánica oscura rica en hierro y magnesio. Se formó hace 3,200 millones de años cuando inmensos ríos de lava líquida llenaron esta planicie de la Luna.'
    },
    'sample-moon-2': {
      title: 'Brecha de impacto lunar',
      site: 'Encontrado en: cráter Surveyor (en la Luna)',
      desc: 'Fragmentos de distintas rocas que se trituraron y soldaron juntas por el tremendo calor y la presión cuando un asteroide chocó contra la superficie lunar.'
    },
    'sample-moon-3': {
      title: 'Regolito lunar aglutinado',
      site: 'Encontrado en: llanura de Procellarum (en la Luna)',
      desc: 'Suelo fino formado por polvo y pequeños cristales triturados durante miles de millones de años por el bombardeo continuo de micrometeoritos en el vacío.'
    },
    'sample-moon-4': {
      title: 'Basalto ilmenítico (rico en titanio)',
      site: 'Encontrado en: Mare Tranquillitatis (en la Luna)',
      desc: 'Muestra traída por Neil Armstrong. Es muy rica en ilmenita, un mineral de hierro y titanio del que los científicos pueden extraer oxígeno para respirar.'
    },
    'sample-moon-5': {
      title: 'Anortosita (corteza primordial)',
      site: 'Encontrado en: tierras altas lunares (en la Luna)',
      desc: 'Un pedazo de la corteza original de la Luna de hace 4,400 millones de años. Flotó sobre un océano global de magma cuando la Luna recién se había formado.'
    },
    'sample-moon-6': {
      title: 'Esférula de vidrio volcánico',
      site: 'Encontrado en: Mare Tranquillitatis (en la Luna)',
      desc: 'Diminuta canica de vidrio natural. Nació cuando fuentes de fuego volcánico lanzaron gotas de lava al frío del espacio, congelándose antes de caer.'
    },
    'sample-mars-1': {
      title: 'Basalto vesicular marciano',
      site: 'Encontrado en: llanura de Chryse Planitia (en Marte)',
      desc: 'Piedra de lava volcánica llena de agujeros formados por gases calientes. Su tono rojizo proviene del polvo de óxido de hierro que cubre todo el planeta.'
    },
    'sample-mars-2': {
      title: 'Concreción de hematita («arándano»)',
      site: 'Encontrado en: llanuras sedimentarias (en Marte)',
      desc: 'Pequeña esfera mineral de óxido de hierro. Solo puede crecer dentro de agua líquida subterránea, demostrando que Marte tuvo agua en su pasado remoto.'
    },
    'sample-mars-3': {
      title: 'Costra duricrust de sulfato',
      site: 'Encontrado en: llanura de Chryse Planitia (en Marte)',
      desc: 'Capa endurecida de sales descubierta por el brazo del robot Viking 1. Quedó sobre el suelo cuando lagos marcianos minerales se evaporaron al secarse.'
    },
    'sample-mars-4': {
      title: 'Roca andesítica «Barnacle Bill»',
      site: 'Encontrado en: valle de Ares Vallis (en Marte)',
      desc: 'La primera roca alienígena analizada por el rover Sojourner en 1997. Su alto contenido de sílice demostró que Marte tuvo volcanes muy evolucionados.'
    },
    'sample-mars-5': {
      title: 'Megabloque basáltico «Yogi»',
      site: 'Encontrado en: valle de Ares Vallis (en Marte)',
      desc: 'Roca volcánica de 1.5 metros de alto arrastrada y pulida por una catástrofe de agua: una inundación gigante que recorrió este valle hace millones de años.'
    },
    'sample-mars-6': {
      title: 'Sedimento cementado «Scooby Doo»',
      site: 'Encontrado en: valle de Ares Vallis (en Marte)',
      desc: 'Capa de suelo mineral duro y resistente. Cuando el pequeño rover Sojourner intentó rasparla con sus ruedas de metal, la roca no sufrió ningún daño.'
    }
  };

  const SAMPLE_DETAILS_EN = {
    'sample-moon-1': {
      title: 'Olivine lunar basalt',
      site: 'Found in: Oceanus Procellarum (on the Moon)',
      desc: 'Dark volcanic rock rich in iron and magnesium. Formed 3.2 billion years ago when massive rivers of liquid lava flooded this lunar plain.'
    },
    'sample-moon-2': {
      title: 'Lunar impact breccia',
      site: 'Found in: Surveyor Crater (on the Moon)',
      desc: 'Fragments of varied rocks pulverized and fused together by immense heat and pressure when an asteroid struck the lunar surface.'
    },
    'sample-moon-3': {
      title: 'Agglutinate lunar regolith',
      site: 'Found in: Procellarum plains (on the Moon)',
      desc: 'Fine soil composed of pulverized dust and tiny crystals created over billions of years by micrometeorite impacts in the vacuum of space.'
    },
    'sample-moon-4': {
      title: 'Ilmenite basalt (titanium-rich)',
      site: 'Found in: Mare Tranquillitatis (on the Moon)',
      desc: 'Sample retrieved by Neil Armstrong. Abundant in ilmenite, an iron-titanium mineral from which future explorers can extract breathable oxygen.'
    },
    'sample-moon-5': {
      title: 'Anorthosite (primordial crust)',
      site: 'Found in: lunar highlands (on the Moon)',
      desc: 'A piece of the Moon\'s original crust dating back 4.4 billion years. It floated atop a global magma ocean when the Moon was newly formed.'
    },
    'sample-moon-6': {
      title: 'Volcanic glass spherule',
      site: 'Found in: Mare Tranquillitatis (on the Moon)',
      desc: 'Tiny natural glass bead. Created when ancient lunar fire fountains sprayed molten droplets into the freeze of space, chilling before hitting the ground.'
    },
    'sample-mars-1': {
      title: 'Martian vesicular basalt',
      site: 'Found in: Chryse Planitia plains (on Mars)',
      desc: 'Volcanic lava rock dotted with gas bubbles. Its rusty tone comes from iron oxide dust covering the entire planet.'
    },
    'sample-mars-2': {
      title: 'Hematite concretion («blueberry»)',
      site: 'Found in: sedimentary plains (on Mars)',
      desc: 'Small spherical iron oxide mineral. Only forms in the presence of liquid groundwater, proving that Mars was once a watery world.'
    },
    'sample-mars-3': {
      title: 'Duricrust sulfate crust',
      site: 'Found in: Chryse Planitia plains (on Mars)',
      desc: 'Hardened salt crust uncovered by Viking 1\'s robotic arm. Left behind as ancient mineral-rich Martian lakes evaporated.'
    },
    'sample-mars-4': {
      title: 'Andesite rock «Barnacle Bill»',
      site: 'Found in: Ares Vallis (on Mars)',
      desc: 'The very first extraterrestrial rock analyzed by Sojourner in 1997. High silica content revealed complex volcanic evolution on Mars.'
    },
    'sample-mars-5': {
      title: 'Basaltic megaboulder «Yogi»',
      site: 'Found in: Ares Vallis (on Mars)',
      desc: 'A 1.5-meter-high volcanic boulder smoothed and dragged by a catastrophic ancient flood that surged through Ares Vallis millions of years ago.'
    },
    'sample-mars-6': {
      title: 'Cemented sediment «Scooby Doo»',
      site: 'Found in: Ares Vallis (on Mars)',
      desc: 'Tough, hard mineral crust. When Sojourner attempted to scrape it with its metal wheels, the rock stood firm without a scratch.'
    }
  };

  function openSampleDiscoveryModal(chapter, sampleObj) {
    if (!chapter || !sampleObj) return;
    pendingSampleToCollect = { chapter, sampleObj };
    const isEn = (state.currentLanguage === 'en');
    const detailsMap = isEn ? SAMPLE_DETAILS_EN : SAMPLE_DETAILS;
    const fallbackSite = isEn
      ? `Found in: ${chapter.name}`
      : `Encontrado en: ${chapter.name}`;
    const details = detailsMap[sampleObj.id] || {
      title: sampleObj.label || (isEn ? 'Space rock' : 'Roca espacial'),
      site: fallbackSite,
      desc: isEn
        ? 'A rock fragment gathered on the surface to keep and analyze in your passport.'
        : 'Un fragmento de roca recogido en la superficie para guardar y analizar en tu pasaporte.'
    };

    if (dom.sampleDiscoveryTitle) {
      dom.sampleDiscoveryTitle.textContent = details.title || sampleObj.label || (isEn ? 'Space rock' : 'Roca espacial');
    }
    if (dom.sampleDiscoverySite) {
      dom.sampleDiscoverySite.textContent = details.site || fallbackSite;
    }
    if (dom.sampleDiscoveryDesc) {
      dom.sampleDiscoveryDesc.textContent = details.desc;
    }
    if (dom.sampleDiscoveryType) {
      dom.sampleDiscoveryType.textContent = isEn ? 'Rock sample' : 'Muestra de roca';
    }
    if (dom.sampleDiscoveryCollectBtn) {
      dom.sampleDiscoveryCollectBtn.textContent = isEn ? 'Store in backpack' : 'Guardar en la mochila';
    }
    if (dom.sampleDiscoveryCrystal) {
      const variant = typeof sampleObj.variant === 'number' ? sampleObj.variant : 0;
      dom.sampleDiscoveryCrystal.innerHTML = MODELS.sampleCrystal(chapter.id, variant);
    }

    hideStageActionPrompt();
    showModal(dom.sampleDiscoveryModal);
    playHarmony('dialogue');
  }

  function collectSample(chapter, sampleObj) {
    const targetSample = sampleObj || (chapter && chapter.sample);
    if (!chapter || !chapter.hasSurface || !targetSample) return;
    triggerHaptic('collect');
    if (!state.collectedSamples.includes(targetSample.id)) {
      state.collectedSamples.push(targetSample.id);
      saveState();
      updateHUD();
      const { activeMachine } = getActiveSite(chapter);
      updateLocationPill(chapter, activeMachine);
      renderStageEntities(chapter);
      const reqs = checkSiteRequirements(chapter);
      if (reqs.canLeave) {
        playHarmony('star');
      } else {
        playHarmony('sample');
      }
      checkSurfaceProximity();
      if (FX && typeof FX.emitBurst === 'function') {
        const sA = world3d.active && world3d.samples[targetSample.id];
        const burstPos = sA ? { x: sA.screenX, y: sA.screenY } : targetSample.pos;
        FX.emitBurst(burstPos, 'sample', chapter.id);
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
     Escotilla de Nave & Cuestionario Minimalista
     ======================================================================== */

  function closeHatchAndOpenQuiz(chapter) {
    closeDialogueModal();
    hatchOpen = false;
    quizSubmitted = false;
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

  function retryActiveQuiz() {
    triggerHaptic('tap');
    state.quizAnswers[activeQuizChapterId] = [null, null];
    quizSubmitted = false;
    saveState();
    renderQuizModal();
  }

  function renderQuizModal() {
    const allQuizzes = DATA.getQuizzes ? DATA.getQuizzes(state.currentLanguage) : DATA.QUIZZES;
    const quiz = allQuizzes[activeQuizChapterId] || allQuizzes.moon;
    const isEn = (state.currentLanguage === 'en');
    const savedAnswers = state.quizAnswers[quiz.chapterId] || [null, null];

    // Contenedor minimalista: solo preguntas numeradas y sus opciones centradas
    const letters = ['A', 'B', 'C', 'D'];
    dom.quizQuestionsContainer.innerHTML = quiz.questions.map((q, qIdx) => {
      const selectedOpt = savedAnswers[qIdx];
      return `
        <div class="quiz-question-card flex flex-col items-center justify-center text-center gap-2.5 p-3 sm:p-3.5 rounded-2xl">
          <p class="quiz-question-text text-xs sm:text-sm font-semibold text-slate-100 text-center">
            <span class="text-cyan-300 mr-1.5 font-bold">${qIdx + 1}.</span>${q.question || ''}
          </p>
          <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
            ${q.options.map((optText, oIdx) => {
              const isSelected = (selectedOpt === oIdx);
              let optionClass = isSelected ? 'selected' : '';
              if (quizSubmitted && isSelected) {
                const isCorrect = (oIdx === q.correctIndex);
                optionClass += isCorrect ? ' correct' : ' incorrect';
              }
              return `
                <button type="button"
                  class="quiz-option-btn px-2.5 py-2 flex items-center justify-center text-center gap-2 text-xs font-normal text-slate-200 transition-all ${optionClass}"
                  data-q-idx="${qIdx}"
                  data-o-idx="${oIdx}">
                  <span class="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold text-amber-200 shrink-0">
                    ${letters[oIdx]}
                  </span>
                  <span class="quiz-option-text text-center leading-snug empty:hidden">${optText || ''}</span>
                </button>
              `;
            }).join('')}
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
        quizSubmitted = false;
        saveState();
        renderQuizModal();
      });
    });

    // Al darle a enviar se muestra el puntaje debajo
    if (dom.quizScoreContainer) {
      if (quizSubmitted) {
        let scoreCount = 0;
        quiz.questions.forEach((q, idx) => {
          const selected = savedAnswers[idx];
          if (selected === q.correctIndex) scoreCount += 1;
        });

        const scoreMsg = isEn
          ? `Score: ${scoreCount}/${quiz.questions.length} correct`
          : `Puntaje: ${scoreCount} de ${quiz.questions.length} aciertos`;

        if (dom.quizScoreText) {
          dom.quizScoreText.textContent = scoreMsg;
          dom.quizScoreText.className = scoreCount === quiz.questions.length
            ? 'text-xs sm:text-sm font-semibold text-emerald-300'
            : (scoreCount > 0
              ? 'text-xs sm:text-sm font-semibold text-amber-300'
              : 'text-xs sm:text-sm font-semibold text-slate-300');
        }
        dom.quizScoreContainer.classList.remove('is-hidden');
      } else {
        dom.quizScoreContainer.classList.add('is-hidden');
      }
    }
  }

  function validateActiveQuiz() {
    const allQuizzes = DATA.getQuizzes ? DATA.getQuizzes(state.currentLanguage) : DATA.QUIZZES;
    const quiz = allQuizzes[activeQuizChapterId] || allQuizzes.moon;
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

    quizSubmitted = true;
    const starsEarned = scoreCount === 2 ? 5 : scoreCount === 1 ? 3 : 0;
    if (starsEarned > 0) {
      triggerHaptic('success');
    } else {
      triggerHaptic('tap');
    }
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
    const badgesList = DATA.getBadges ? DATA.getBadges(state.currentLanguage) : DATA.BADGES;

    dom.badgesGrid.innerHTML = badgesList.map((badge) => {
      const unlocked = totalStars >= badge.minStars;
      return `
        <div class="squircle-card p-3 flex flex-col items-center justify-center gap-1.5 text-center ${unlocked ? 'border-amber-300/45' : 'opacity-55'
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
    if (dom.certificateCadetInput) {
      dom.certificateCadetInput.value = state.cadetName || '';
    }
    renderCertificateSvgPreview();
    showModal(dom.certificateModal);
  }

  function renderCertificateSvgPreview() {
    if (!dom.certificateSvgWrapper) return;
    dom.certificateSvgWrapper.innerHTML = buildCertificateSvg();
  }

  function buildCertificateSvg() {
    const isEn = (state.currentLanguage === 'en');
    const badge = getCurrentBadge();
    const totalStars = getTotalStars();
    const cadetName = (state.cadetName && state.cadetName.trim())
      ? state.cadetName.trim()
      : (isEn ? 'Cosmic explorer' : 'Explorador cósmico');

    const escapedName = cadetName
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const rawPaw = (MODELS && typeof MODELS.penguinPawStamp === 'function')
      ? MODELS.penguinPawStamp(true, 62)
      : '';
    const innerPaw = rawPaw
      .replace(/^[\s\S]*?<svg[^>]*>/i, '')
      .replace(/<\/svg>[\s\S]*$/i, '');

    const today = new Date();
    const dateFormatted = isEn
      ? today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : today.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const txtOverline = 'Cyberpenguin: The Explorers We Must Never Forget';
    const txtDiploma = isEn
      ? 'Honorary astronautical diploma'
      : 'Diploma de honor astronáutico';
    const txtConferred = isEn
      ? 'Awarded to:'
      : 'Otorgado a:';
    const txtBody = isEn
      ? 'For successfully completing the cosmic expedition and exploring the 6 pioneer space probes.'
      : 'Por completar con éxito la expedición cósmica y explorar las 6 sondas espaciales pioneras.';
    const txtStars = isEn
      ? `★ ${totalStars}/15 cosmic stars · Rank: ${badge.name}`
      : `★ ${totalStars}/15 estrellas cósmicas · Rango: ${badge.name}`;
    const txtDateLabel = isEn ? `Date: ${dateFormatted}` : `Fecha: ${dateFormatted}`;

    let certBackdrop = '';
    if (MODELS && typeof MODELS.homeBackdrop === 'function') {
      certBackdrop = MODELS.homeBackdrop('landscape')
        .replace(/bgCosmosGrad-l/g, 'bgCosmosGrad-cert')
        .replace(/bgmoonl/g, 'bgmooncert')
        .replace(/bgearthl/g, 'bgearthcert')
        .replace(/bgerosl/g, 'bgeroscert')
        .replace(/bgmarsl/g, 'bgmarscert');
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <clipPath id="certCardClip">
      <rect width="1000" height="700" rx="32" />
    </clipPath>
    <linearGradient id="certFallbackGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050814" />
      <stop offset="42%" stop-color="#070c1d" />
      <stop offset="85%" stop-color="#091228" />
      <stop offset="100%" stop-color="#0d1834" />
    </linearGradient>
    <radialGradient id="certVignette" cx="50%" cy="45%" r="62%">
      <stop offset="0%" stop-color="#060a1a" stop-opacity="0.82" />
      <stop offset="60%" stop-color="#060a1a" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#060a1a" stop-opacity="0.25" />
    </radialGradient>
  </defs>

  <!-- Fondo de la Pantalla de Menú Inicial del Juego (Cosmos, Planetas y Órbitas) -->
  <g clip-path="url(#certCardClip)">
    ${certBackdrop ? `
    <svg x="0" y="0" width="1000" height="700" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
      ${certBackdrop}
    </svg>` : `
    <rect width="1000" height="700" fill="url(#certFallbackGrad)" />`}
    <!-- Velo de contraste y lectura centrado -->
    <rect width="1000" height="700" fill="url(#certVignette)" />
  </g>

  <!-- Marco Squircle Fino y Sofisticado -->
  <rect x="28" y="28" width="944" height="644" rx="24" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.2" />
  <rect x="36" y="36" width="928" height="628" rx="18" fill="none" stroke="rgba(56,189,248,0.25)" stroke-width="0.8" />

  <!-- Puntos astronómicos en las 4 esquinas -->
  <circle cx="56" cy="56" r="2.5" fill="#38bdf8" opacity="0.75" />
  <circle cx="944" cy="56" r="2.5" fill="#38bdf8" opacity="0.75" />
  <circle cx="56" cy="644" r="2.5" fill="#38bdf8" opacity="0.75" />
  <circle cx="944" cy="644" r="2.5" fill="#38bdf8" opacity="0.75" />

  <!-- Cabecera Oficial del Juego -->
  <circle cx="500" cy="80" r="3.5" fill="#38bdf8" />
  <text x="500" y="108" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="12.5" font-weight="600" letter-spacing="1.2" fill="#7ee8fa">${txtOverline}</text>

  <!-- Título del Diploma -->
  <text x="500" y="162" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="34" font-weight="700" letter-spacing="0.4" fill="#ffffff">${txtDiploma}</text>
  <line x1="430" y1="184" x2="570" y2="184" stroke="rgba(255,255,255,0.22)" stroke-width="1" />

  <!-- Concesión -->
  <text x="500" y="232" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="400" fill="#94a3b8">${txtConferred}</text>

  <!-- Nombre del Cadete -->
  <text x="500" y="292" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="38" font-weight="800" fill="#ffffff">${escapedName}</text>

  <!-- Mérito Educativo -->
  <text x="500" y="344" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="400" fill="#cbd5e1">${txtBody}</text>

  <!-- Píldora de Rango y Estrellas -->
  <g transform="translate(340, 380)">
    <rect x="0" y="0" width="320" height="34" rx="17" fill="rgba(12, 18, 36, 0.65)" stroke="rgba(255,255,255,0.14)" stroke-width="1" />
    <text x="160" y="21.5" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="600" fill="#fde047">${txtStars}</text>
  </g>

  <!-- Firma Auténtica: Huella de Cyberpengüin sobre su línea y nombre -->
  <g transform="translate(500, 520)">
    <!-- Patita del pingüino (sin círculo) -->
    <g transform="translate(-31, -66)">
      ${innerPaw}
    </g>
    <!-- Línea de firma -->
    <line x1="-90" y1="0" x2="90" y2="0" stroke="rgba(255,255,255,0.25)" stroke-width="1.2" />
    <!-- Nombre Cyberpengüin -->
    <text x="0" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="600" letter-spacing="0.5" fill="#f8fafc">Cyberpengüin</text>
  </g>

  <!-- Pie de Página: Fecha Centrada y Limpia -->
  <text x="500" y="626" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="500" fill="#94a3b8">${txtDateLabel}</text>
</svg>`;
  }

  function downloadCertificate(format = 'png') {
    if (!areAllChaptersCompleted()) return null;
    const svgMarkup = buildCertificateSvg();

    if (format === 'svg') {
      const filename = `diploma-cyberpenguins-${Date.now()}.svg`;
      const blob = new global.Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      triggerBlobDownload(blob, filename);
      return svgMarkup;
    }

    // Exportar PNG en alta resolución (2000 x 1400 px, 300 DPI nítido)
    try {
      const img = new Image();
      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = global.URL || global.webkitURL || window.URL;
      const url = URLObj.createObjectURL(svgBlob);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 2000;
          canvas.height = 1400;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#050817';
          ctx.fillRect(0, 0, 2000, 1400);
          ctx.drawImage(img, 0, 0, 2000, 1400);
          URLObj.revokeObjectURL(url);

          canvas.toBlob((blob) => {
            if (blob) {
              triggerBlobDownload(blob, `diploma-cyberpenguin-${Date.now()}.png`);
            } else {
              downloadCertificate('svg');
            }
          }, 'image/png');
        } catch (_err) {
          URLObj.revokeObjectURL(url);
          downloadCertificate('svg');
        }
      };
      img.onerror = () => {
        URLObj.revokeObjectURL(url);
        downloadCertificate('svg');
      };
      img.src = url;
    } catch (_e) {
      downloadCertificate('svg');
    }
    return svgMarkup;
  }

  function triggerBlobDownload(blob, filename) {
    if (global.URL && typeof global.URL.createObjectURL === 'function') {
      const blobUrl = global.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        global.URL.revokeObjectURL(blobUrl);
      }, 1000);
    }
  }

  function printCertificate() {
    const svgMarkup = buildCertificateSvg();
    const printWin = window.open('', '_blank');
    if (!printWin) {
      window.print();
      return;
    }
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Diploma Cyberpenguin: The Explorers We Must Never Forget</title>
        <style>
          @page { size: landscape; margin: 0; }
          body {
            margin: 0;
            padding: 0;
            background: #050817;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
          }
          svg {
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            display: block;
          }
        </style>
      </head>
      <body>
        ${svgMarkup}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 350);
          };
        <\/script>
      </body>
      </html>
    `);
    printWin.document.close();
  }

  /* ========================================================================
     Modales Informativos: Cómo se juega y Acerca del proyecto
     ======================================================================== */

  function renderHowToPlayModal() {
    if (!dom.howToPlayContent) return;
    const isEn = (state.currentLanguage === 'en');
    if (dom.howToPlayTitle) {
      dom.howToPlayTitle.textContent = isEn ? 'How to play' : 'Cómo se juega';
    }
    if (dom.howToPlaySubtitle) {
      dom.howToPlaySubtitle.textContent = isEn ? 'Interactive exploration and space physics' : 'Exploración interactiva y física espacial';
    }
    if (dom.howToPlayCloseBtn) {
      dom.howToPlayCloseBtn.textContent = isEn ? 'Got it' : 'Entendido';
    }

    const items = isEn ? [
      {
        title: 'Walk and move',
        desc: 'Click or tap anywhere on the terrain.<br>Cyberpenguin avoids obstacles automatically.'
      },
      {
        title: 'Gravity jumps',
        desc: 'Use the jump button, spacebar, swipe up or double-tap.<br>Height and hang time match the real physics of each world.'
      },
      {
        title: 'Talk to historical spacecraft',
        desc: 'Approach robotic explorers like Surveyor 3 or Viking 1<br>to discover authentic mission history and data.'
      },
      {
        title: 'Geological rock samples',
        desc: 'Find and collect authentic extraterrestrial rock samples<br>to store them in your astronaut backpack.'
      },
      {
        title: 'Quiz and takeoff',
        desc: 'Return to the ship to answer the mission quiz,<br>earn stars and travel to the next cosmic destination.'
      }
    ] : [
      {
        title: 'Caminar y explorar',
        desc: 'Toca o haz clic en cualquier lugar del terreno.<br>Cyberpenguin esquivará los obstáculos automáticamente.'
      },
      {
        title: 'Saltos con gravedad auténtica',
        desc: 'Usa el botón saltar, espacio, desliza hacia arriba o doble toque.<br>La altura y flotabilidad reflejan la física real de cada mundo.'
      },
      {
        title: 'Hablar con sondas históricas',
        desc: 'Acércate a los robots exploradores como Surveyor 3 o Viking 1<br>para conocer su historia y datos verificados de sus misiones.'
      },
      {
        title: 'Muestras geológicas',
        desc: 'Encuentra y recoge fragmentos de rocas extraterrestres auténticas<br>para guardarlas en tu mochila de exploración.'
      },
      {
        title: 'Cuestionario y despegue',
        desc: 'Vuelve a la nave para responder el cuestionario estelar,<br>ganar estrellas y viajar al siguiente destino cósmico.'
      }
    ];

    dom.howToPlayContent.innerHTML = items.map((it) => `
      <div class="info-item-card">
        <span class="info-item-title">${it.title}</span>
        <p class="info-item-desc">${it.desc}</p>
      </div>
    `).join('');
  }

  function openHowToPlayModal() {
    renderHowToPlayModal();
    if (dom.howToPlayModal) {
      dom.howToPlayModal.classList.remove('is-hidden');
    }
  }

  function closeHowToPlayModal() {
    if (dom.howToPlayModal) {
      dom.howToPlayModal.classList.add('is-hidden');
    }
  }

  function renderAboutProjectModal() {
    if (!dom.aboutProjectContent) return;
    const isEn = (state.currentLanguage === 'en');
    if (dom.aboutProjectTitle) {
      dom.aboutProjectTitle.textContent = isEn ? 'About project' : 'Acerca del proyecto';
    }
    if (dom.aboutProjectSubtitle) {
      dom.aboutProjectSubtitle.textContent = 'Cyberpenguin: The Explorers We Must Never Forget';
    }
    if (dom.aboutProjectCloseBtn) {
      dom.aboutProjectCloseBtn.textContent = isEn ? 'Close' : 'Cerrar';
    }

    const message = isEn
      ? 'Created with love by team Cyberpenguins<br>for the NASA Space Apps Challenge 2026'
      : 'Creado con cariño por el team Cyberpenguins<br>para el NASA Space Apps Challenge 2026';

    dom.aboutProjectContent.innerHTML = `
      <div class="info-about-card">
        <p class="info-about-text">${message}</p>
      </div>
    `;
  }

  function openAboutProjectModal() {
    renderAboutProjectModal();
    if (dom.aboutProjectModal) {
      dom.aboutProjectModal.classList.remove('is-hidden');
    }
  }

  function closeAboutProjectModal() {
    if (dom.aboutProjectModal) {
      dom.aboutProjectModal.classList.add('is-hidden');
    }
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
    if (dom.stageSpeechBubble && !dom.stageSpeechBubble.classList.contains('is-hidden')) {
      return true;
    }
    return [
      dom.dialogueModal,
      dom.quizModal,
      dom.passportModal,
      dom.badgesModal,
      dom.certificateModal,
      dom.sampleDiscoveryModal,
      dom.howToPlayModal,
      dom.aboutProjectModal
    ].some((m) => m && !m.classList.contains('is-hidden'));
  }

  function isBlockingModalOpen() {
    if (dom.stageSpeechBubble && !dom.stageSpeechBubble.classList.contains('is-hidden')) {
      return true;
    }
    return [
      dom.quizModal,
      dom.passportModal,
      dom.badgesModal,
      dom.certificateModal,
      dom.sampleDiscoveryModal,
      dom.howToPlayModal,
      dom.aboutProjectModal
    ].some((m) => m && !m.classList.contains('is-hidden'));
  }

  function closeAllModals() {
    closeDialogueModal();
    closeQuizModal();
    hideModal(dom.passportModal);
    hideModal(dom.badgesModal);
    hideModal(dom.certificateModal);
    if (dom.sampleDiscoveryModal) hideModal(dom.sampleDiscoveryModal);
    if (dom.howToPlayModal) closeHowToPlayModal();
    if (dom.aboutProjectModal) closeAboutProjectModal();
    hideStageActionPrompt();
  }
})(typeof window !== 'undefined' ? window : globalThis);
