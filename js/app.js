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
  let activeInteractable = null;
  let pendingSampleToCollect = null;
  let activeBranchState = null;
  let thoughtBubbleTimer = null;
  let lastRenderedDir = null;

  const dom = {};

  function triggerHaptic(type) {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
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
    } catch (_) {}
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
      } catch (_e) {}
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

    const quizValidateBtn = document.getElementById('quiz-validate-btn');
    if (quizValidateBtn) quizValidateBtn.textContent = isEn ? 'Validate' : 'Validar';

    const quizTravelBtn = document.getElementById('quiz-travel-btn');
    if (quizTravelBtn) quizTravelBtn.textContent = isEn ? 'Travel' : 'Viajar';

    const pauseTitle = dom.pauseModal ? dom.pauseModal.querySelector('h2') : null;
    if (pauseTitle) pauseTitle.textContent = isEn ? 'Mission Paused' : 'Misión en Pausa';
    const pauseSub = dom.pauseModal ? dom.pauseModal.querySelector('p') : null;
    if (pauseSub) pauseSub.textContent = isEn ? 'Exploration temporarily on hold.' : 'Exploración detenida temporalmente.';
    const pauseResume = document.getElementById('pause-resume-btn');
    if (pauseResume) pauseResume.textContent = isEn ? '▶ Resume mission' : '▶ Continuar misión';
    const pauseSound = document.getElementById('pause-sound-btn');
    if (pauseSound) pauseSound.textContent = isEn ? '🔊 Toggle sound' : '🔊 Alternar sonido';
    const pauseHome = document.getElementById('pause-home-btn');
    if (pauseHome) pauseHome.textContent = isEn ? '✕ Return to main map' : '✕ Volver al mapa principal';

    // Textos de registro inicial de cadete
    if (dom.cadetIntroTitle) {
      dom.cadetIntroTitle.textContent = isEn ? 'Welcome to Cyberpenguin!' : '¡Bienvenido(a) a Cyberpenguin!';
    }
    if (dom.cadetIntroSubtitle) {
      dom.cadetIntroSubtitle.innerHTML = isEn
        ? '<span class="text-cyan-300 font-semibold block mb-0.5">The Explorers We Must Never Forget</span>What is your name, Space Cadet? Enter your name to prepare your flight log and official NASA diploma.'
        : '<span class="text-cyan-300 font-semibold block mb-0.5">The Explorers We Must Never Forget</span>¿Cómo te llamas, Cadete Espacial? Escribe tu nombre para preparar tu bitácora de vuelo y tu diploma oficial de la NASA.';
    }
    if (dom.cadetIntroLabel) {
      dom.cadetIntroLabel.textContent = isEn ? 'Astronaut Name:' : 'Nombre del Astronauta:';
    }
    if (dom.cadetFirstNameInput) {
      dom.cadetFirstNameInput.placeholder = isEn ? 'Enter your name or callsign...' : 'Escribe tu nombre aquí...';
    }
    if (dom.cadetStartBtnText) {
      dom.cadetStartBtnText.textContent = isEn ? 'Start Mission & Liftoff!' : '¡Comenzar Misión y Despegar!';
    }

    // Textos del modal de Certificado / Diploma de Honor
    if (dom.certModalTitle) {
      dom.certModalTitle.textContent = isEn ? 'Honorary Astronautical Diploma' : 'Diploma de Honor Astronáutico';
    }
    if (dom.certModalSubtitle) {
      dom.certModalSubtitle.textContent = isEn
        ? 'Cyberpenguin: The Explorers We Must Never Forget · NASA Space Archives'
        : 'Cyberpenguin: The Explorers We Must Never Forget · Archivos Espaciales de la NASA';
    }
    if (dom.certCadetLabel) {
      dom.certCadetLabel.textContent = isEn ? 'Astronaut Name on Diploma:' : 'Nombre del Astronauta en el Diploma:';
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
      dom.downloadPngText.textContent = isEn ? 'Download Diploma (PNG)' : 'Descargar Diploma (PNG)';
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
  }

  function init() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && window.location && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
      if (document.readyState === 'complete') {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
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
    if (FX && typeof FX.pause === 'function') {
      FX.pause();
    }
    if (state.launched) {
      dom.launchScreen.classList.add('hidden-screen', 'is-hidden');
      showHomeScreen();
    } else {
      if (dom.cadetIntroCard) {
        dom.cadetIntroCard.classList.remove('is-hidden');
        if (dom.cadetFirstNameInput) {
          dom.cadetFirstNameInput.value = state.cadetName || '';
          setTimeout(() => {
            try { dom.cadetFirstNameInput.focus(); } catch (_e) {}
          }, 400);
        }
      } else {
        startLaunchCinematic();
      }
    }
  }

  function cacheDom() {
    dom.orientationBanner = document.getElementById('orientation-banner');
    dom.dismissOrientationBtn = document.getElementById('dismiss-orientation-btn');

    dom.launchScreen = document.getElementById('launch-screen');
    dom.launchShipWrapper = document.getElementById('launch-ship-wrapper');
    dom.launchShipSvg = document.getElementById('launch-ship-svg');
    dom.launchBtn = document.getElementById('launch-btn');
    dom.cadetIntroCard = document.getElementById('cadet-intro-card');
    dom.cadetIntroTitle = document.getElementById('cadet-intro-title');
    dom.cadetIntroSubtitle = document.getElementById('cadet-intro-subtitle');
    dom.cadetIntroLabel = document.getElementById('cadet-intro-label');
    dom.cadetFirstNameInput = document.getElementById('cadet-first-name-input');
    dom.cadetStartBtn = document.getElementById('cadet-start-btn');
    dom.cadetStartBtnText = document.getElementById('cadet-start-btn-text');

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
    dom.soundToggleBtn = document.getElementById('sound-toggle-btn');
    dom.pauseBtn = document.getElementById('pause-btn');
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

    dom.sampleDiscoveryModal = document.getElementById('sample-discovery-modal');
    dom.sampleDiscoveryCrystal = document.getElementById('sample-discovery-crystal');
    dom.sampleDiscoveryTitle = document.getElementById('sample-discovery-title');
    dom.sampleDiscoveryType = document.getElementById('sample-discovery-type');
    dom.sampleDiscoverySite = document.getElementById('sample-discovery-site');
    dom.sampleDiscoveryDesc = document.getElementById('sample-discovery-desc');
    dom.sampleDiscoveryCollectBtn = document.getElementById('sample-discovery-collect-btn');

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

    dom.pauseModal = document.getElementById('pause-modal');
    dom.pauseResumeBtn = document.getElementById('pause-resume-btn');
    dom.pauseSoundBtn = document.getElementById('pause-sound-btn');
    dom.pauseHomeBtn = document.getElementById('pause-home-btn');
  }

  function bindEvents() {
    dom.dismissOrientationBtn.addEventListener('click', () => {
      dom.orientationBanner.classList.add('dismissed');
    });

    function submitCadetNameAndLaunch() {
      const inputVal = (dom.cadetFirstNameInput && dom.cadetFirstNameInput.value) ? dom.cadetFirstNameInput.value.trim() : '';
      const fallbackName = (state.currentLanguage === 'en') ? 'Junior Cosmic Explorer' : 'Joven Explorador(a) Cósmico(a)';
      state.cadetName = inputVal || state.cadetName || fallbackName;
      saveState();

      if (dom.cadetIntroCard) {
        dom.cadetIntroCard.classList.add('is-hidden');
      }
      playHarmony('launch');
      triggerHaptic('jump');
      startLaunchCinematic();
    }

    if (dom.cadetStartBtn) {
      dom.cadetStartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic('tap');
        submitCadetNameAndLaunch();
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
      if (dom.cadetIntroCard && !dom.cadetIntroCard.classList.contains('is-hidden')) {
        submitCadetNameAndLaunch();
        return;
      }
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
    dom.quizValidateBtn.addEventListener('click', validateActiveQuiz);
    dom.quizTravelBtn.addEventListener('click', travelFromQuiz);

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

    if (dom.pauseBtn) {
      dom.pauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePauseModal();
      });
    }

    if (dom.pauseResumeBtn) {
      dom.pauseResumeBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        closePauseModal();
      });
    }

    if (dom.pauseSoundBtn) {
      dom.pauseSoundBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        toggleSound();
      });
    }

    if (dom.pauseHomeBtn) {
      dom.pauseHomeBtn.addEventListener('click', () => {
        triggerHaptic('tap');
        closePauseModal();
        showHomeScreen();
      });
    }

    // Cerrar modales al hacer clic fuera del panel
    [
      { el: dom.quizModal, onClose: closeQuizModal },
      { el: dom.passportModal, onClose: () => hideModal(dom.passportModal) },
      { el: dom.badgesModal, onClose: () => hideModal(dom.badgesModal) },
      { el: dom.certificateModal, onClose: () => hideModal(dom.certificateModal) },
      { el: dom.sampleDiscoveryModal, onClose: () => hideModal(dom.sampleDiscoveryModal) },
      { el: dom.pauseModal, onClose: closePauseModal }
    ].forEach(({ el, onClose }) => {
      if (!el) return;
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
        event.target.closest('.pause-btn') ||
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

    // Teclado (Flechas / WASD para mover, Espacio para saltar, Escape para pausar o cerrar modales)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (isBlockingModalOpen()) {
          closeAllModals();
        } else if (!dom.gameScreen.classList.contains('is-hidden')) {
          togglePauseModal();
        }
        return;
      }

      if (isBlockingModalOpen() || dom.gameScreen.classList.contains('is-hidden')) {
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
    } catch (_e) {}
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
      } catch (_e) {}

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
    if (!isChapterUnlocked(targetId)) return;
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
        audioCtx.resume().catch(() => { });
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
      arrival: { freqs: [261.63, 392.0, 493.88, 659.25], gain: 0.038, stepMs: 75, duration: 0.85, wave: 'sine' },
      launch: { freqs: [65.41, 82.41, 110.0, 146.83, 220.0, 329.63], gain: 0.05, stepMs: 80, duration: 0.9, wave: 'triangle' }
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
    {
      quote: '«Las cosas difíciles son las que más vale la pena intentar»',
      name: 'Margaret Hamilton',
      role: 'Directora de Software Apolo · NASA'
    },
    {
      quote: '«El trabajo en equipo y la curiosidad convierten lo imposible en realidad»',
      name: 'Gene Kranz',
      role: 'Director de Vuelo Apolo 11 · NASA'
    },
    {
      quote: '«Apunta a las estrellas: con dedicación y ciencia no existen límites»',
      name: 'Katherine Johnson',
      role: 'Matemática e Ingeniera de la NASA'
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
            <p class="text-sm sm:text-base font-medium uppercase tracking-[0.2em] text-slate-200/90 text-center">${step.label || ''}</p>
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
    hideStageActionPrompt();
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
    const reqs = checkSiteRequirements(chapter);
    const hatchAriaLabel = isFirstStop && nextMachine
      ? `Escotilla · Viajar a ${nextMachine.name}`
      : 'Escotilla · Quiz y Viaje';

    // 1. Nave de Cyberpenguin (con escotilla lista cuando se completan las tareas)
    parts.push(`
      <div class="stage-entity ${inSpace ? 'space-float' : ''}" data-sort-y="${shipPos.y}" style="left: ${shipPos.x}%; top: ${shipPos.y}%;">
        <button id="ship-hatch-btn" type="button" class="stage-hotspot" aria-label="${hatchAriaLabel}">
          <div id="stage-ship-svg" class="entity-svg-wrap">
            ${MODELS.spaceship({
      hatchOpen: hatchOpen && reqs.canLeave,
      launching: false,
      penguinInHatch: false,
      inSpaceFlight: inSpace
    })}
          </div>
          <span class="entity-status-dot ${reqs.canLeave ? 'done' : ''}" aria-hidden="true"></span>
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
        const boardingPoint = resolveSurfacePoint(shipPos.x + 9.5, shipPos.y + 4.8, chapter);
        routeAndMove(boardingPoint.x, boardingPoint.y, () => {
          checkSurfaceProximity();
          const r = checkSiteRequirements(chapter);
          if (!r.canLeave) {
            showPendingTasksNotice(chapter, r.missing);
          }
        });
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
    triggerHaptic('jump');

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

    // Globo de pensamiento ambiental sobre Cyberpenguin al saltar en gravedad especial
    const allThoughts = DATA.getAmbientThoughts ? DATA.getAmbientThoughts(state.currentLanguage) : DATA.AMBIENT_THOUGHTS;
    if (allThoughts && allThoughts[chapter.id]) {
      const thoughts = allThoughts[chapter.id];
      const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
      showPenguinThought(thought);
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
      label = isEn ? 'Store in backpack' : 'Guardar en la mochila';
    } else if (type === 'machine') {
      label = isEn ? `Talk to ${target.name || 'spacecraft'}` : `Hablar con ${target.name || 'sonda'}`;
    } else if (type === 'ship-travel') {
      label = isEn ? 'Next stop' : 'Siguiente parada';
    } else if (type === 'ship-leave') {
      label = isEn ? 'Board spaceship' : 'Entrar a la nave';
    } else if (type === 'ship-locked') {
      label = isEn ? 'Complete previous mission to enter' : 'Completa la misión anterior para poder entrar';
    }

    if (dom.stageActionIcon) dom.stageActionIcon.textContent = '';
    if (dom.stageActionLabel) dom.stageActionLabel.textContent = label;

    // Ubicación sobre el objeto objetivo (no sobre el pingüino)
    let objX = penguinPos.x;
    let objY = penguinPos.y;
    let offsetY = -10;

    if (type === 'sample' && target && target.pos) {
      objX = target.pos.x;
      objY = target.pos.y;
      offsetY = -8;
    } else if (type === 'machine' && target && target.pos) {
      objX = target.pos.x;
      objY = target.pos.y;
      offsetY = -12;
    } else if (type.startsWith('ship')) {
      const chapter = getChapter(state.currentChapterId);
      const { activeMachine } = getActiveSite(chapter);
      const shipPos = activeMachine && activeMachine.shipPos ? activeMachine.shipPos : (chapter ? chapter.shipPos : penguinPos);
      objX = shipPos.x;
      objY = shipPos.y;
      offsetY = -12;
    }

    const px = Math.max(8, Math.min(92, objX));
    const py = Math.max(10, Math.min(88, objY + offsetY));
    dom.stageActionPrompt.style.left = `${px}%`;
    dom.stageActionPrompt.style.top = `${py}%`;
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

    // 1. Hablar con la sonda o máquina de la NASA en este sitio
    if (activeMachine && !state.inspectedMachines.includes(activeMachine.id)) {
      missing.push(`Hablar con ${activeMachine.name}`);
    }

    // 2. Recolectar todas las muestras geológicas del sitio
    if (chapter.hasSurface) {
      const siteSamples = getSiteSamples(chapter, activeMachine);
      const pendingSamples = siteSamples.filter((s) => !state.collectedSamples.includes(s.id));
      if (pendingSamples.length > 0) {
        missing.push(
          pendingSamples.length === 1
            ? 'Recoger la roca pendiente'
            : `Recoger las ${pendingSamples.length} rocas pendientes`
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
    const taskText = missing.join(' y ');
    const speechText = `¡Aún no podemos despegar! Necesitamos ${taskText}. ¡Vamos a completarlo antes de continuar el viaje!`;

    openDialogueModal({
      id: 'mission-checklist',
      name: 'Cyberpenguin',
      dialogue: [
        {
          speaker: 'Cyberpenguin',
          text: speechText
        }
      ]
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
      const distToMachine = getDist(penguinPos, activeMachine.pos);
      if (distToMachine > 18.5 && activeDialogueMachine && activeDialogueMachine.id === activeMachine.id) {
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
          const dist = getDist(penguinPos, sampleObj.pos);
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
      const dist = getDist(penguinPos, activeMachine.pos);
      if (dist <= 15.5) {
        candidates.push({
          type: 'machine',
          target: activeMachine,
          dist,
          onAction: () => openDialogueModal(activeMachine)
        });
      }
    }

    // 3. Escotilla de la nave espacial (solo permite despegar si se completaron las tareas)
    const distToShip = getDist(penguinPos, shipPos);
    if (distToShip <= 14.5) {
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
        ? (isEn ? 'Complete previous mission to unlock' : 'Completa la misión anterior para poder entrar')
        : completed
        ? (isEn ? 'Explore again' : 'Explorar de nuevo')
        : inProgress
        ? (isEn ? 'Continue' : 'Continuar')
        : (isEn ? 'Explore' : 'Explorar');

      return `
        <div class="home-chapter-card p-5 sm:p-6 flex flex-col items-center justify-between text-center gap-4 h-full ${isCardActive ? 'is-active' : ''
        } ${!unlocked ? 'opacity-65' : ''}">
          <div class="w-full flex items-center justify-center">
            <h3 class="text-xs sm:text-sm font-semibold tracking-wide text-slate-200 text-center">${chapter.name}</h3>
          </div>

          <div class="home-chapter-emblem relative w-full">
            ${sceneHtml}
          </div>

          <div class="flex flex-col items-center gap-3 w-full">
            <button type="button"
              class="squircle-btn rounded-full w-full inline-flex items-center justify-center text-center py-2.5 px-3 sm:px-4 font-medium transition-colors ${
                !unlocked
                  ? 'bg-white/[0.04] text-slate-300/85 border border-white/[0.06] cursor-not-allowed text-[11px] sm:text-xs leading-snug'
                  : isCardActive
                    ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20 shadow-sm text-xs sm:text-sm'
                    : 'bg-white/[0.06] hover:bg-white/[0.14] text-slate-200 border border-white/[0.08] text-xs sm:text-sm'
              }"
              ${!unlocked ? 'disabled' : ''}
              data-enter-chapter="${chapter.id}">
              ${btnLabel}
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

  function showPenguinThought(text) {
    if (!dom.stageThoughtBubble || !dom.thoughtBubbleText || !text) return;
    clearTimeout(thoughtBubbleTimer);

    dom.thoughtBubbleText.textContent = text;
    const clampedX = Math.max(18, Math.min(82, penguinPos.x));
    const targetY = Math.max(12, penguinPos.y - 12);
    dom.stageThoughtBubble.style.left = `${clampedX}%`;
    dom.stageThoughtBubble.style.top = `${targetY}%`;
    dom.stageThoughtBubble.classList.remove('is-hidden');

    thoughtBubbleTimer = setTimeout(() => {
      if (dom.stageThoughtBubble) {
        dom.stageThoughtBubble.classList.add('is-hidden');
      }
    }, 4200);
  }

  function showSpeechBubbleStep({ speaker, name, avatarSvg, text, audioUrl, anchorPos, choices, onNext, onChoice }) {
    if (!dom.stageSpeechBubble) return;
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
    const anchor = anchorPos || (isPenguin ? penguinPos : { x: 50, y: 50 });
    positionSpeechBubble(anchor.x, anchor.y);

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

  function fallbackLinearDialogue(machine) {
    const turns = getMachineDialogueTurns(machine);
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
        name: isPenguin ? 'Cyberpenguin' : (isShip ? 'Nave de Cyberpenguin' : machine.name),
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

    if (machine.id && machine.id !== 'final-scene' && !state.inspectedMachines.includes(machine.id)) {
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

    activeDialogueMachine = { id: 'final-scene', name: shipName };
    const shipSvg = MODELS.spaceship ? MODELS.spaceship({ hatchOpen: false, launching: false, inSpaceFlight: true }) : '';
    const penguinSvg = MODELS.cyberpenguin ? MODELS.cyberpenguin('right') : '';

    let finalStep = 'greeting';
    let chosenReflection = null;

    const renderFinal = () => {
      if (finalStep === 'greeting') {
        showSpeechBubbleStep({
          speaker: 'ship',
          name: 'Nave de Cyberpenguin',
          avatarSvg: shipSvg,
          text: finalTree.greeting.text,
          audioUrl: finalTree.greeting.audioUrl,
          anchorPos: shipPos,
          onNext: () => {
            finalStep = 'penguinIntro';
            renderFinal();
          }
        });
      } else if (finalStep === 'penguinIntro') {
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
      site: 'Misión Apolo 12 · Oceanus Procellarum',
      desc: 'Roca volcánica oscura rica en hierro y magnesio. Se formó hace 3,200 millones de años cuando inmensos ríos de lava líquida llenaron esta planicie de la Luna.'
    },
    'sample-moon-2': {
      title: 'Brecha de impacto lunar',
      site: 'Cráter Surveyor · La Luna',
      desc: 'Fragmentos de distintas rocas que se trituraron y soldaron juntas por el tremendo calor y la presión cuando un asteroide chocó contra la superficie lunar.'
    },
    'sample-moon-3': {
      title: 'Regolito lunar aglutinado',
      site: 'Llanura de Procellarum · La Luna',
      desc: 'Suelo fino formado por polvo y pequeños cristales triturados durante miles de millones de años por el bombardeo continuo de micrometeoritos en el vacío.'
    },
    'sample-moon-4': {
      title: 'Basalto ilmenítico (rico en titanio)',
      site: 'Misión Apolo 11 · Mare Tranquillitatis',
      desc: 'Muestra traída por Neil Armstrong. Es muy rica en ilmenita, un mineral de hierro y titanio del que los científicos pueden extraer oxígeno para respirar.'
    },
    'sample-moon-5': {
      title: 'Anortosita (Corteza primordial)',
      site: 'Tierras altas lunares · La Luna',
      desc: 'Un pedazo de la corteza original de la Luna de hace 4,400 millones de años. Flotó sobre un océano global de magma cuando la Luna recién se había formado.'
    },
    'sample-moon-6': {
      title: 'Esférula de vidrio volcánico',
      site: 'Misión Apolo 11 · Mare Tranquillitatis',
      desc: 'Diminuta canica de vidrio natural. Nació cuando fuentes de fuego volcánico lanzaron gotas de lava al frío del espacio, congelándose antes de caer.'
    },
    'sample-mars-1': {
      title: 'Basalto vesicular marciano',
      site: 'Misión Viking 1 · Chryse Planitia',
      desc: 'Piedra de lava volcánica llena de agujeros formados por gases calientes. Su tono rojizo proviene del polvo de óxido de hierro que cubre todo el planeta.'
    },
    'sample-mars-2': {
      title: 'Concreción de hematita («Arándano»)',
      site: 'Llanuras sedimentarias · Marte',
      desc: 'Pequeña esfera mineral de óxido de hierro. Solo puede crecer dentro de agua líquida subterránea, demostrando que Marte tuvo agua en su pasado remoto.'
    },
    'sample-mars-3': {
      title: 'Costra duricrust de sulfato',
      site: 'Misión Viking 1 · Chryse Planitia',
      desc: 'Capa endurecida de sales descubierta por el brazo del robot Viking 1. Quedó sobre el suelo cuando lagos marcianos minerales se evaporaron al secarse.'
    },
    'sample-mars-4': {
      title: 'Roca andesítica «Barnacle Bill»',
      site: 'Mars Pathfinder / Sojourner · Ares Vallis',
      desc: 'La primera roca alienígena analizada por el rover Sojourner en 1997. Su alto contenido de sílice demostró que Marte tuvo volcanes muy evolucionados.'
    },
    'sample-mars-5': {
      title: 'Megabloque basáltico «Yogi»',
      site: 'Mars Pathfinder / Sojourner · Ares Vallis',
      desc: 'Roca volcánica de 1.5 metros de alto arrastrada y pulida por una catástrofe de agua: una inundación gigante que recorrió este valle hace millones de años.'
    },
    'sample-mars-6': {
      title: 'Sedimento cementado «Scooby Doo»',
      site: 'Mars Pathfinder · Ares Vallis',
      desc: 'Capa de suelo mineral duro y resistente. Cuando el pequeño rover Sojourner intentó rasparla con sus ruedas de metal, la roca no sufrió ningún daño.'
    }
  };

  function openSampleDiscoveryModal(chapter, sampleObj) {
    if (!chapter || !sampleObj) return;
    pendingSampleToCollect = { chapter, sampleObj };
    const details = SAMPLE_DETAILS[sampleObj.id] || {
      title: sampleObj.label || 'Roca espacial',
      site: chapter.name,
      desc: 'Un fragmento de roca recogido en la superficie para guardar y analizar en tu pasaporte.'
    };

    if (dom.sampleDiscoveryTitle) {
      dom.sampleDiscoveryTitle.textContent = details.title || sampleObj.label || 'Roca espacial';
    }
    if (dom.sampleDiscoverySite) {
      dom.sampleDiscoverySite.textContent = details.site || chapter.name;
    }
    if (dom.sampleDiscoveryDesc) {
      dom.sampleDiscoveryDesc.textContent = details.desc;
    }
    if (dom.sampleDiscoveryType) {
      dom.sampleDiscoveryType.textContent = details.type || '';
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
    const allQuizzes = DATA.getQuizzes ? DATA.getQuizzes(state.currentLanguage) : DATA.QUIZZES;
    const quiz = allQuizzes[activeQuizChapterId] || allQuizzes.moon;
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
                class="quiz-option-btn px-3.5 py-2.5 flex items-center justify-center text-center gap-2.5 text-sm font-normal text-slate-100 ${selectedOpt === oIdx ? 'selected' : ''
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
      : (isEn ? 'Junior Cosmic Explorer' : 'Joven Explorador(a) Cósmico(a)');

    const escapedName = cadetName
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const rawPaw = (MODELS && typeof MODELS.penguinPawStamp === 'function')
      ? MODELS.penguinPawStamp(true, 68)
      : '';
    const innerPaw = rawPaw
      .replace(/^[\s\S]*?<svg[^>]*>/i, '')
      .replace(/<\/svg>[\s\S]*$/i, '');

    const today = new Date();
    const dateFormatted = isEn
      ? today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : today.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const txtAcademy = isEn
      ? 'SPACE EXPLORATION ACADEMY · CYBERPENGUIN: THE EXPLORERS WE MUST NEVER FORGET'
      : 'ACADEMIA DE EXPLORACIÓN ESPACIAL · CYBERPENGUIN: THE EXPLORERS WE MUST NEVER FORGET';
    const txtDiploma = isEn
      ? 'HONORARY ASTRONAUTICAL DIPLOMA'
      : 'DIPLOMA DE HONOR ASTRONÁUTICO';
    const txtConferred = isEn
      ? 'Conferred with official distinction and highest merit to:'
      : 'Conferido con distinción oficial y máximo mérito científico a:';
    const txtBody1 = isEn
      ? 'For outstanding bravery, scientific curiosity, and astrophysical dedication in completing'
      : 'Por su destacada valentía, curiosidad científica y dedicación astrofísica al completar';
    const txtBody2 = isEn
      ? 'the interplanetary expedition in Cyberpenguin: The Explorers We Must Never Forget,'
      : 'la gran expedición en Cyberpenguin: The Explorers We Must Never Forget,';
    const txtBody3 = isEn
      ? 'investigating humanity\'s 6 pioneer space probes and collecting cosmic planetary samples.'
      : 'investigando las 6 sondas pioneras de la humanidad y recolectando valiosas muestras cósmicas.';
    const txtMoon = isEn ? 'THE MOON · Surveyor 3 & Apollo 11' : 'LUNA · Surveyor 3 & Apollo 11';
    const txtMars = isEn ? 'MARS · Viking 1 & Sojourner' : 'MARTE · Viking 1 & Sojourner';
    const txtDeep = isEn ? 'DEEP SPACE · Pioneer 10 & NEAR' : 'ESPACIO PROFUNDO · Pioneer 10 & NEAR';
    const txtStars = isEn
      ? `★ ${totalStars}/15 COSMIC STARS · RANK: ${badge.name.toUpperCase()}`
      : `★ ${totalStars}/15 ESTRELLAS CÓSMICAS · RANGO: ${badge.name.toUpperCase()}`;
    const txtSignCommander = isEn ? 'Flight Commander' : 'Comandante de Vuelo';
    const txtSignCommanderRole = isEn ? 'Chief of Planetary Exploration' : 'Jefe de Expedición Planetaria';
    const txtSignAI = isEn ? "Ship's AI (Paulina)" : 'IA de la Nave (Paulina)';
    const txtSignAIRole = isEn ? 'Mission Control & Telemetry' : 'Control de Misión & Telemetría';
    const txtSeal = 'CYBERPENGUIN: THE EXPLORERS WE MUST NEVER FORGET';
    const txtMissionId = isEn ? 'MISSION CODE: NASA-CP-2026-X89' : 'CÓDIGO DE MISIÓN: NASA-CP-2026-X89';
    const txtDateLabel = isEn ? `DATE: ${dateFormatted}` : `FECHA: ${dateFormatted}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <linearGradient id="certBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050817" />
      <stop offset="45%" stop-color="#0c1638" />
      <stop offset="100%" stop-color="#040714" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0%" stop-color="#fef9c3" />
      <stop offset="25%" stop-color="#fde047" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="75%" stop-color="#ca8a04" />
      <stop offset="100%" stop-color="#fef08a" />
    </linearGradient>
    <linearGradient id="goldBorderGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="25%" stop-color="#eab308" />
      <stop offset="50%" stop-color="#fef9c3" />
      <stop offset="75%" stop-color="#ca8a04" />
      <stop offset="100%" stop-color="#fef08a" />
    </linearGradient>
    <linearGradient id="sealGoldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="35%" stop-color="#fde047" />
      <stop offset="70%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>
    <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#881337" />
    </linearGradient>
    <radialGradient id="nebulaCyan" cx="20%" cy="30%" r="50%">
      <stop offset="0%" stop-color="rgba(56,189,248,0.12)" />
      <stop offset="100%" stop-color="rgba(56,189,248,0)" />
    </radialGradient>
    <radialGradient id="nebulaGold" cx="80%" cy="75%" r="45%">
      <stop offset="0%" stop-color="rgba(251,191,36,0.1)" />
      <stop offset="100%" stop-color="rgba(251,191,36,0)" />
    </radialGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Fondo Cósmico Profundo con Nebulosas -->
  <rect width="1000" height="700" rx="32" fill="url(#certBg)" />
  <rect width="1000" height="700" rx="32" fill="url(#nebulaCyan)" />
  <rect width="1000" height="700" rx="32" fill="url(#nebulaGold)" />

  <!-- Constelaciones y Polvo Estelar Geométrico -->
  <g fill="#ffffff" opacity="0.45">
    <circle cx="85" cy="85" r="1.5" /><circle cx="160" cy="110" r="1.2" /><circle cx="210" cy="70" r="1.8" />
    <circle cx="915" cy="85" r="1.5" /><circle cx="840" cy="115" r="1.2" /><circle cx="790" cy="65" r="1.7" />
    <circle cx="90" cy="610" r="1.3" /><circle cx="140" cy="580" r="1.7" /><circle cx="195" cy="630" r="1.1" />
    <circle cx="910" cy="610" r="1.4" /><circle cx="860" cy="580" r="1.8" /><circle cx="805" cy="630" r="1.2" />
    <circle cx="500" cy="65" r="1.4" /><circle cx="340" cy="180" r="1.0" /><circle cx="660" cy="180" r="1.1" />
  </g>
  <g stroke="#38bdf8" stroke-width="0.7" opacity="0.25">
    <line x1="85" y1="85" x2="160" y2="110" /><line x1="160" y1="110" x2="210" y2="70" />
    <line x1="915" y1="85" x2="840" y2="115" /><line x1="840" y1="115" x2="790" y2="65" />
    <line x1="90" y1="610" x2="140" y2="580" /><line x1="140" y1="580" x2="195" y2="630" />
    <line x1="910" y1="610" x2="860" y2="580" /><line x1="860" y1="580" x2="805" y2="630" />
  </g>

  <!-- Marco de Honor: Doble Filete Metálico Dorado y Acento Cian -->
  <rect x="22" y="22" width="956" height="656" rx="24" fill="none" stroke="url(#goldBorderGrad)" stroke-width="2.6" filter="url(#goldGlow)" />
  <rect x="34" y="34" width="932" height="632" rx="18" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.45" stroke-dasharray="12 6" />

  <!-- Esquinas Astronómicas Art-Déco Doradas -->
  <g stroke="url(#goldBorderGrad)" stroke-width="1.8" fill="none">
    <path d="M 38 70 L 70 70 L 70 38" /><circle cx="70" cy="70" r="3" fill="#fde047" />
    <path d="M 962 70 L 930 70 L 930 38" /><circle cx="930" cy="70" r="3" fill="#fde047" />
    <path d="M 38 630 L 70 630 L 70 662" /><circle cx="70" cy="630" r="3" fill="#fde047" />
    <path d="M 962 630 L 930 630 L 930 662" /><circle cx="930" cy="630" r="3" fill="#fde047" />
  </g>

  <!-- Emblema Superior: Alas Cósmicas & Estrella Central -->
  <g transform="translate(500, 72)" text-anchor="middle">
    <path d="M -42 0 Q -20 -14 0 -4 Q 20 -14 42 0 Q 20 -6 0 -1 Q -20 -6 -42 0 Z" fill="url(#goldGrad)" opacity="0.9" />
    <polygon points="0,-12 4,-2 14,0 4,2 0,12 -4,2 -14,0 -4,-2" fill="#ffffff" />
  </g>

  <!-- Encabezado de la Academia -->
  <text x="500" y="108" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="11.5" font-weight="700" letter-spacing="3.5" fill="#7ee8fa" opacity="0.92">${txtAcademy}</text>

  <!-- Título Principal del Diploma -->
  <text x="500" y="152" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="34" font-weight="800" letter-spacing="1.2" fill="url(#goldGrad)" filter="url(#goldGlow)">${txtDiploma}</text>

  <!-- Divisor Ornamental Central -->
  <g transform="translate(500, 172)" stroke="url(#goldBorderGrad)" stroke-width="1.2">
    <line x1="-160" y1="0" x2="-20" y2="0" />
    <polygon points="0,-4 4,0 0,4 -4,0" fill="#fde047" stroke="none" />
    <line x1="20" y1="0" x2="160" y2="0" />
  </g>

  <!-- Texto de Concesión -->
  <text x="500" y="206" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="14.5" font-weight="500" fill="#94a3b8">${txtConferred}</text>

  <!-- Nombre del Cadete / Astronauta (Gran Protagonista) -->
  <text x="500" y="262" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="38" font-weight="800" letter-spacing="0.8" fill="#ffffff" filter="url(#goldGlow)">${escapedName}</text>
  <path d="M 320 278 Q 500 286 680 278" fill="none" stroke="url(#goldBorderGrad)" stroke-width="2" opacity="0.75" />

  <!-- Mérito Académico y Misiones (Narrativa Educativa NASA) -->
  <text x="500" y="312" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="400" fill="#cbd5e1" opacity="0.95">${txtBody1}</text>
  <text x="500" y="332" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="400" fill="#cbd5e1" opacity="0.95">${txtBody2}</text>
  <text x="500" y="352" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="400" fill="#cbd5e1" opacity="0.95">${txtBody3}</text>

  <!-- Tríptico de Mundos Explorados (Píldoras de Credenciales) -->
  <g transform="translate(140, 376)">
    <!-- Luna -->
    <rect x="0" y="0" width="225" height="34" rx="17" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.16)" stroke-width="1" />
    <text x="112" y="21.5" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#f8fafc">🌕 ${txtMoon}</text>
    <!-- Marte -->
    <rect x="247" y="0" width="225" height="34" rx="17" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.16)" stroke-width="1" />
    <text x="360" y="21.5" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#f8fafc">🔴 ${txtMars}</text>
    <!-- Espacio Profundo -->
    <rect x="495" y="0" width="225" height="34" rx="17" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.16)" stroke-width="1" />
    <text x="607" y="21.5" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#f8fafc">🌌 ${txtDeep}</text>
  </g>

  <!-- Píldora de Rango Oficial y Estrellas Obtenidas -->
  <g transform="translate(260, 428)">
    <rect x="0" y="0" width="480" height="32" rx="16" fill="rgba(234,179,8,0.12)" stroke="rgba(234,179,8,0.4)" stroke-width="1.2" />
    <text x="240" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="800" letter-spacing="1.2" fill="#fde047">${txtStars}</text>
  </g>

  <!-- SELLO DORADO HOLOGRÁFICO CON HUELLA OFICIAL (CENTRO) -->
  <g transform="translate(500, 555)">
    <!-- Cintas rojas inferiores del sello -->
    <path d="M -16 32 L -28 72 L -8 60 L 0 72 L 0 32 Z" fill="url(#ribbonGrad)" opacity="0.95" />
    <path d="M 16 32 L 28 72 L 8 60 L 0 72 L 0 32 Z" fill="url(#ribbonGrad)" opacity="0.95" />
    <path d="M -28 72 L -8 60 L 0 72 L 8 60 L 28 72" fill="none" stroke="#fde047" stroke-width="1.5" />

    <!-- Medallón Dorado Dentado -->
    <circle cx="0" cy="0" r="54" fill="url(#sealGoldGrad)" stroke="#fef08a" stroke-width="2.5" filter="url(#goldGlow)" />
    <circle cx="0" cy="0" r="47" fill="none" stroke="#78350f" stroke-width="1.2" stroke-dasharray="4 2" />
    <circle cx="0" cy="0" r="43" fill="#1e1b4b" stroke="#fde047" stroke-width="1.4" />

    <!-- Huella palmeada de Cyberpenguin en el centro del sello -->
    <g transform="translate(-34, -34)">
      ${innerPaw}
    </g>
  </g>
  <!-- Texto circular alrededor del sello -->
  <text x="500" y="632" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="800" letter-spacing="2" fill="#fef08a">${txtSeal}</text>

  <!-- FIRMA IZQUIERDA: COMANDANTE CYBERPENGUIN -->
  <g transform="translate(180, 525)">
    <!-- Firma manuscrita estilizada -->
    <path d="M 20 20 Q 40 -8 55 12 T 85 8 T 115 16 Q 135 4 150 18" fill="none" stroke="#7ee8fa" stroke-width="2.2" stroke-linecap="round" />
    <path d="M 65 6 Q 72 26 80 4" fill="none" stroke="#7ee8fa" stroke-width="1.8" />
    <circle cx="152" cy="18" r="2.2" fill="#ffbe76" />
    <line x1="0" y1="36" x2="190" y2="36" stroke="rgba(255,255,255,0.25)" stroke-width="1.2" />
    <text x="95" y="52" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#f8fafc">Cyberpenguin</text>
    <text x="95" y="66" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="500" fill="#94a3b8">${txtSignCommander}</text>
    <text x="95" y="78" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="8.5" font-weight="400" fill="#64748b">${txtSignCommanderRole}</text>
  </g>

  <!-- FIRMA DERECHA: IA DE LA NAVE (CONTROL DE MISIÓN) -->
  <g transform="translate(630, 525)">
    <!-- Forma de onda osciloscópica / cuántica -->
    <path d="M 10 20 L 40 20 L 50 2 L 60 38 L 70 8 L 80 30 L 90 20 L 120 20 L 130 10 L 140 28 L 150 20 L 180 20" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="0" y1="36" x2="190" y2="36" stroke="rgba(255,255,255,0.25)" stroke-width="1.2" />
    <text x="95" y="52" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#f8fafc">${txtSignAI}</text>
    <text x="95" y="66" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="500" fill="#94a3b8">${txtSignAIRole}</text>
    <text x="95" y="78" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="8.5" font-weight="400" fill="#64748b">NASA Deep Space Network</text>
  </g>

  <!-- Pie de Página: Código Único de Bitácora y Fecha de Emisión -->
  <text x="50" y="664" text-anchor="start" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="1.5" fill="#64748b">${txtMissionId}</text>
  <text x="950" y="664" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="1.5" fill="#64748b">${txtDateLabel}</text>
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
     Utilidades de Modales
     ======================================================================== */

  function showModal(el) {
    el.classList.remove('is-hidden');
  }

  function hideModal(el) {
    el.classList.add('is-hidden');
  }

  function isPauseModalOpen() {
    return Boolean(dom.pauseModal && !dom.pauseModal.classList.contains('is-hidden'));
  }

  function openPauseModal() {
    if (!dom.pauseModal) return;
    triggerHaptic('tap');
    if (FX && typeof FX.pause === 'function') {
      FX.pause();
    }
    TTS.stop();
    showModal(dom.pauseModal);
  }

  function closePauseModal() {
    if (!dom.pauseModal) return;
    hideModal(dom.pauseModal);
    if (dom.gameScreen && !dom.gameScreen.classList.contains('is-hidden')) {
      if (FX && typeof FX.resume === 'function') {
        FX.resume();
      }
    }
  }

  function togglePauseModal() {
    if (isPauseModalOpen()) {
      closePauseModal();
    } else {
      openPauseModal();
    }
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
      dom.pauseModal
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
      dom.pauseModal
    ].some((m) => m && !m.classList.contains('is-hidden'));
  }

  function closeAllModals() {
    closePauseModal();
    closeDialogueModal();
    closeQuizModal();
    hideModal(dom.passportModal);
    hideModal(dom.badgesModal);
    hideModal(dom.certificateModal);
    if (dom.sampleDiscoveryModal) hideModal(dom.sampleDiscoveryModal);
    hideStageActionPrompt();
  }
})(typeof window !== 'undefined' ? window : globalThis);
