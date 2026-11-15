(function (global) {
  'use strict';

  // Motor visual 2.5D en Canvas: polvo por gravedad, propulsores RCS en EVA, estrellas y luz dinámica.
  let boardEl = null;
  let canvasEl = null;
  let lightingEl = null;
  let ctx = null;
  let rafId = null;
  let isPaused = false;
  let currentChapter = 'moon';
  let currentSite = '';
  let lastTick = 0;

  let width = 1000;
  let height = 594;
  let dpr = 1;

  let ambientParticles = [];
  let burstParticles = [];
  let burstCount = 0;
  let lastBurstType = null;

  let targetCamX = 0;
  let targetCamY = 0;
  let camX = 0;
  let camY = 0;
  let lightTarget = { x: 30, y: 72 };

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    if (!boardEl || !canvasEl) return;
    const rect = typeof boardEl.getBoundingClientRect === 'function'
      ? boardEl.getBoundingClientRect()
      : { width: 1000, height: 594 };
    width = Math.max(320, Math.round(rect.width || 1000));
    height = Math.max(200, Math.round(rect.height || 594));
    dpr = Math.min(2, Number(global.devicePixelRatio) || 1);
    canvasEl.width = Math.round(width * dpr);
    canvasEl.height = Math.round(height * dpr);
    if (ctx && typeof ctx.setTransform === 'function') {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function applyLightingCss() {
    const targets = [boardEl, lightingEl].filter(Boolean);
    targets.forEach((el) => {
      if (el && el.style && typeof el.style.setProperty === 'function') {
        el.style.setProperty('--light-x', `${lightTarget.x}%`);
        el.style.setProperty('--light-y', `${lightTarget.y}%`);
        el.style.setProperty('--cam-x', `${camX.toFixed(2)}px`);
        el.style.setProperty('--cam-y', `${camY.toFixed(2)}px`);
      } else if (el && el.style) {
        el.style['--light-x'] = `${lightTarget.x}%`;
        el.style['--light-y'] = `${lightTarget.y}%`;
        el.style['--cam-x'] = `${camX.toFixed(2)}px`;
        el.style['--cam-y'] = `${camY.toFixed(2)}px`;
      }
    });
  }

  function seedAmbient(chapterId, siteId) {
    ambientParticles = [];
    if (chapterId === 'moon') {
      const starCount = 34;
      for (let i = 0; i < starCount; i += 1) {
        ambientParticles.push({
          kind: 'star',
          x: rand(0.02, 0.98),
          y: rand(0.03, 0.24),
          r: rand(0.6, 1.6),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.9, 2.0),
          depth: rand(0.2, 0.6),
          alpha: rand(0.32, 0.72),
          color: i % 5 === 0 ? '#dbeafe' : '#f1f5f9'
        });
      }
      return;
    }

    if (chapterId === 'mars') {
      const dustCount = siteId === 'ares-vallis' ? 38 : 30;
      const marsDustColors = ['#d9bea8', '#c4a3b5', '#e3cab8'];
      for (let i = 0; i < dustCount; i += 1) {
        ambientParticles.push({
          kind: 'mars-dust',
          x: rand(0, 1),
          y: rand(0.28, 0.94),
          r: rand(0.9, 2.2),
          vx: rand(0.01, 0.026),
          vy: rand(-0.003, 0.003),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.8, 1.6),
          depth: rand(0.35, 1.0),
          alpha: rand(0.08, 0.22),
          color: marsDustColors[i % marsDustColors.length]
        });
      }
      return;
    }

    // Espacio Profundo: campo estelar multicapa evitando la zona del asteroide 433 Eros
    const isEros = siteId === 'asteroid-eros';
    for (let i = 0; i < 62; i += 1) {
      let sx = rand(0.01, 0.99);
      let sy = rand(0.02, 0.96);
      if (isEros && sx >= 0.50 && sx <= 0.86 && sy >= 0.32 && sy <= 0.72) {
        sy = sy < 0.52 ? rand(0.03, 0.28) : rand(0.76, 0.96);
      }
      ambientParticles.push({
        kind: 'deep-star',
        x: sx,
        y: sy,
        r: rand(0.7, 2.0),
        vx: rand(-0.0025, -0.0005),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.9, 2.1),
        depth: rand(0.25, 1.0),
        color: i % 7 === 0 ? '#ffe4b8' : i % 3 === 0 ? '#cfe8fa' : '#eef4ff'
      });
    }
  }

  function spawnParticle(opts) {
    if (burstParticles.length > 180) {
      burstParticles.splice(0, burstParticles.length - 180);
    }
    burstParticles.push({
      x: opts.x,
      y: opts.y,
      vx: opts.vx,
      vy: opts.vy,
      grav: opts.grav || 0,
      drag: opts.drag || 0.985,
      r: opts.r || 2.2,
      life: 0,
      maxLife: opts.maxLife || 0.75,
      color: opts.color || '#ffffff',
      glow: Boolean(opts.glow)
    });
  }

  function emitBurst(pos, type, chapterId, siteId) {
    const ch = chapterId || currentChapter;
    const site = siteId || currentSite;
    const p = pos || lightTarget || { x: 50, y: 65 };
    burstCount += 1;
    lastBurstType = type || 'step';

    const originX = (Number(p.x) / 100) * width;
    const originY = (Number(p.y) / 100) * height;
    // Gravedades reales escaladas (Luna 1.62 m/s², Marte 3.71 m/s² = 2.29x Luna, 433 Eros 0.0059 m/s², Espacio 0 m/s²)
    const grav = ch === 'moon' ? 48 : ch === 'mars' ? 110 : (site === 'asteroid-eros' ? 2 : 0);

    if (type === 'rcs') {
      for (let i = 0; i < 14; i += 1) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(24, 82);
        spawnParticle({
          x: originX + rand(-6, 6),
          y: originY - 18 + rand(-6, 6),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.72,
          grav,
          drag: 0.96,
          r: rand(1.4, 2.8),
          maxLife: rand(0.45, 0.85),
          color: i % 3 === 0 ? '#cbd5e1' : '#e2e8f0',
          glow: false
        });
      }
      return;
    }

    if (type === 'sample') {
      const mineralColors = ch === 'mars'
        ? ['#8cb8a8', '#c7a08a', '#9e84a8']
        : ['#9ab4cc', '#c7a47e', '#b8c3db'];
      for (let i = 0; i < 20; i += 1) {
        const angle = rand(-Math.PI, 0);
        const speed = rand(36, 110);
        spawnParticle({
          x: originX + rand(-10, 10),
          y: originY - 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - rand(8, 36),
          grav,
          drag: 0.975,
          r: rand(1.6, 3.2),
          maxLife: ch === 'moon' ? rand(0.75, 1.15) : rand(0.42, 0.68),
          color: mineralColors[i % mineralColors.length],
          glow: false
        });
      }
      return;
    }

    const isJump = type === 'jump';
    const count = isJump ? 18 : 7;
    const palette = ch === 'mars'
      ? ['#d9bea8', '#b898aa', '#e3cab8']
      : ['#cfd6e6', '#9aa4bd', '#77819c'];

    for (let i = 0; i < count; i += 1) {
      const spreadX = isJump ? rand(-78, 78) : rand(-34, 34);
      const liftY = isJump ? rand(-96, -42) : rand(-42, -16);
      spawnParticle({
        x: originX + rand(-8, 8),
        y: originY - 2,
        vx: spreadX,
        vy: liftY,
        grav,
        drag: 0.98,
        r: rand(isJump ? 1.8 : 1.3, isJump ? 3.8 : 2.5),
        maxLife: ch === 'moon' ? rand(0.78, 1.18) : rand(0.42, 0.68),
        color: palette[i % palette.length],
        glow: false
      });
    }
  }

  function stepFrame(now) {
    if (isPaused) {
      rafId = null;
      return;
    }

    const dt = lastTick ? Math.min(0.05, Math.max(0.001, (now - lastTick) / 1000)) : 0.016;
    lastTick = now;
    const tSec = now * 0.001;

    // Suavizar cámara parallax
    camX += (targetCamX - camX) * 0.12;
    camY += (targetCamY - camY) * 0.12;
    applyLightingCss();

    if (ctx) {
      ctx.clearRect(0, 0, width, height);

      // 1. Partículas ambientales
      for (let i = 0; i < ambientParticles.length; i += 1) {
        const p = ambientParticles[i];
        if (p.vx) {
          p.x += p.vx * dt;
          if (p.x > 1.02) p.x = -0.02;
          if (p.x < -0.02) p.x = 1.02;
        }
        if (p.vy) {
          p.y += p.vy * dt;
          if (p.y > 0.98) p.y = 0.28;
          if (p.y < 0.26) p.y = 0.96;
        }

        if (p.kind === 'star' && p.y > 0.25) {
          continue;
        }
        if (currentSite === 'asteroid-eros' && p.x >= 0.50 && p.x <= 0.86 && p.y >= 0.32 && p.y <= 0.72) {
          continue;
        }

        const drawX = p.x * width + camX * (0.25 + p.depth * 0.45);
        const drawY = p.y * height + camY * (0.2 + p.depth * 0.35);
        const pulse = 0.52 + 0.48 * Math.sin(tSec * p.speed + p.phase);

        ctx.save();
        if (p.kind === 'mars-dust') {
          ctx.globalAlpha = (p.alpha || 0.14) * (0.85 + 0.15 * pulse);
        } else {
          ctx.globalAlpha = p.alpha !== undefined ? p.alpha * (0.65 + 0.35 * pulse) : 0.28 + 0.52 * pulse;
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Ráfagas físicas (polvo lunar/marciano, RCS EVA y cristales)
      for (let i = burstParticles.length - 1; i >= 0; i -= 1) {
        const b = burstParticles[i];
        b.life += dt;
        if (b.life >= b.maxLife) {
          burstParticles.splice(i, 1);
          continue;
        }
        b.vx *= Math.pow(b.drag, dt * 60);
        b.vy = b.vy * Math.pow(b.drag, dt * 60) + b.grav * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const alpha = Math.max(0, 1 - b.life / b.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha * 0.88;
        if (b.glow) {
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 8;
        }
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * (0.55 + alpha * 0.45), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (typeof global.requestAnimationFrame === 'function') {
      rafId = global.requestAnimationFrame(stepFrame);
    }
  }

  function startLoop() {
    if (isPaused || rafId || typeof global.requestAnimationFrame !== 'function') return;
    lastTick = 0;
    rafId = global.requestAnimationFrame(stepFrame);
  }

  function init(options = {}) {
    boardEl = options.boardEl || null;
    canvasEl = options.canvasEl || null;
    lightingEl = options.lightingEl || null;
    ctx = canvasEl && typeof canvasEl.getContext === 'function' ? canvasEl.getContext('2d') : null;

    resize();
    if (typeof global.addEventListener === 'function') {
      global.addEventListener('resize', resize);
    }
    seedAmbient(currentChapter, currentSite);
    applyLightingCss();
    startLoop();
  }

  function setScene(chapterId, siteId) {
    currentChapter = chapterId || 'moon';
    currentSite = siteId || '';
    burstParticles = [];
    seedAmbient(currentChapter, currentSite);
    applyLightingCss();
    startLoop();
  }

  function setPenguinTarget(pos) {
    if (!pos) return;
    lightTarget = { x: Number(pos.x) || 50, y: Number(pos.y) || 65 };
    applyLightingCss();
  }

  function setCameraParallax(normX, normY) {
    const cx = Math.max(-1, Math.min(1, Number(normX) || 0));
    const cy = Math.max(-1, Math.min(1, Number(normY) || 0));
    targetCamX = cx * 10;
    targetCamY = cy * 7;
    if (!ctx || typeof global.requestAnimationFrame !== 'function') {
      camX = targetCamX;
      camY = targetCamY;
      applyLightingCss();
    }
  }

  function pause() {
    isPaused = true;
    if (rafId && typeof global.cancelAnimationFrame === 'function') {
      global.cancelAnimationFrame(rafId);
    }
    rafId = null;
  }

  function resume() {
    if (!isPaused) return;
    isPaused = false;
    startLoop();
  }

  function getStats() {
    return {
      currentChapter,
      currentSite,
      ambientCount: ambientParticles.length,
      burstCount,
      lastBurstType,
      isPaused,
      lightTarget: { ...lightTarget }
    };
  }

  global.CYBERPENGUINS_FX = {
    init,
    resize,
    setScene,
    setPenguinTarget,
    setCameraParallax,
    emitBurst,
    pause,
    resume,
    getStats
  };
})(typeof window !== 'undefined' ? window : globalThis);
