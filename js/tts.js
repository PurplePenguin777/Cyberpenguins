/**
 * Módulo de reproducción de diálogos para Cyberpenguins.
 * - Usa Web Speech API (speechSynthesis) para prototipo con texto.
 * - Si el dispositivo define `audioUrl`, reproduce directamente ese archivo de audio.
 * - Si `audioUrl` falla o aún no está disponible (ej. audios en producción), recurre fluidamente a Web Speech API con el idioma activo (es-ES / en-US).
 */
(function (global) {
  'use strict';

  let currentAudio = null;
  let currentVolume = 0.8;

  function stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if (
      typeof global.speechSynthesis !== 'undefined' &&
      (global.speechSynthesis.speaking || global.speechSynthesis.pending)
    ) {
      global.speechSynthesis.cancel();
    }
  }

  function setVolume(val) {
    currentVolume = Math.max(0, Math.min(1, typeof val === 'number' ? val : 0.8));
    if (currentAudio) {
      currentAudio.volume = currentVolume;
    }
  }

  function speak({ text, audioUrl, pitch, rate, lang, onStart, onEnd, onEmpty }) {
    stop();

    const cleanAudioUrl = (audioUrl || '').trim();
    const cleanText = (text || '').trim();
    const targetLang = lang || 'es-ES';

    const playWebSpeech = () => {
      if (!cleanText) {
        if (onEmpty) onEmpty();
        return false;
      }

      if (typeof global.speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
        if (onEmpty) {
          onEmpty();
        } else if (onEnd) {
          setTimeout(onEnd, 1400);
        }
        return false;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetLang;
      utterance.rate = typeof rate === 'number' ? rate : 0.96;
      utterance.pitch = typeof pitch === 'number' ? pitch : 1.05;
      utterance.volume = currentVolume;
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
    };

    if (cleanAudioUrl) {
      currentAudio = new Audio(cleanAudioUrl);
      currentAudio.volume = currentVolume;
      currentAudio.onplay = () => {
        if (onStart) onStart();
      };
      currentAudio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };
      currentAudio.onerror = () => {
        currentAudio = null;
        // Si el archivo de audio no existe (ej. voces en producción), respaldo a síntesis vocal
        playWebSpeech();
      };
      currentAudio.play().catch(() => {
        currentAudio = null;
        playWebSpeech();
      });
      return true;
    }

    return playWebSpeech();
  }

  global.CYBERPENGUINS_TTS = {
    speak,
    stop,
    setVolume
  };
})(typeof window !== 'undefined' ? window : globalThis);
