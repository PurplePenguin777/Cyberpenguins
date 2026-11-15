/**
 * Módulo de reproducción de diálogos para Cyberpenguins.
 * - Usa Web Speech API (speechSynthesis) para prototipo con texto.
 * - Si el dispositivo define `audioUrl`, reproduce directamente ese archivo de audio.
 */
(function (global) {
  'use strict';

  let currentAudio = null;

  function stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if (typeof global.speechSynthesis !== 'undefined') {
      global.speechSynthesis.cancel();
    }
  }

  function speak({ text, audioUrl, onStart, onEnd, onEmpty }) {
    stop();

    const cleanAudioUrl = (audioUrl || '').trim();
    const cleanText = (text || '').trim();

    if (cleanAudioUrl) {
      currentAudio = new Audio(cleanAudioUrl);
      currentAudio.onplay = () => {
        if (onStart) onStart();
      };
      currentAudio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };
      currentAudio.onerror = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };
      currentAudio.play().catch(() => {
        if (onEnd) onEnd();
      });
      return true;
    }

    if (!cleanText) {
      if (onEmpty) onEmpty();
      return false;
    }

    if (typeof global.speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
      if (onEnd) onEnd();
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.96;
    utterance.pitch = 1.05;
    utterance.onstart = () => {
      if (onStart) onStart();
    };
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    global.speechSynthesis.speak(utterance);
    return true;
  }

  global.CYBERPENGUINS_TTS = {
    speak,
    stop
  };
})(typeof window !== 'undefined' ? window : globalThis);
