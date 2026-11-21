/**
 * Motor 3D de terrenos reales (Three.js + glTF 2.0 / .glb)
 * Renderiza topografía planetaria auténtica extraída de DTMs de la NASA/ESA
 * dentro de #stage-backdrop-layer, manteniendo el fallback SVG debajo.
 */
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/three/loaders/GLTFLoader.js';
import { OrbitControls } from '../vendor/three/controls/OrbitControls.js';

const SITE_CONFIGS = {
  'ares-vallis': {
    modelUrl: 'assets/models/ares-vallis-terrain.glb',
    titleEs: 'Ares Vallis · 19.09°N, 33.25°W · ESA/NASA Mars Express HRSC DTM (H3147_0000_DA4)',
    titleEn: 'Ares Vallis · 19.09°N, 33.25°W · ESA/NASA Mars Express HRSC DTM (H3147_0000_DA4)',
    hintEs: 'Arrastra para orbitar · Rueda/pellizco para zoom · Clic derecho para desplazar',
    hintEn: 'Drag to orbit · Scroll/pinch to zoom · Right-drag to pan',
    exploreCamPos: [-1.5, 2.55, 11.5],
    exploreCamTarget: [1.5, 0.45, -12.0],
    inspectCamPos: [18.5, 16.5, 23.0],
    inspectCamTarget: [2.5, -0.5, 2.0],
    landerPos: [0, 0.08, 0]
  }
};

function createSeededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function createRegolithBumpTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const img = ctx.createImageData(size, size);
  const data = img.data;
  const rand = createSeededRng(19970704);

  // Tileable base noise grid (32x32 bilinear + fine grain + pebbles)
  const gN = 32;
  const coarse = new Float32Array(gN * gN);
  for (let i = 0; i < coarse.length; i += 1) coarse[i] = rand();

  const sampleCoarse = (u, v) => {
    const gx = u * gN;
    const gy = v * gN;
    const x0 = Math.floor(gx) % gN;
    const y0 = Math.floor(gy) % gN;
    const x1 = (x0 + 1) % gN;
    const y1 = (y0 + 1) % gN;
    const fx = gx - Math.floor(gx);
    const fy = gy - Math.floor(gy);
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = coarse[y0 * gN + x0];
    const b = coarse[y0 * gN + x1];
    const c = coarse[y1 * gN + x0];
    const d = coarse[y1 * gN + x1];
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };

  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const n1 = sampleCoarse(u, v);
      const n2 = sampleCoarse((u * 3) % 1, (v * 3) % 1);
      const ripple = 0.5 + 0.5 * Math.sin((u * 6 + v * 2 + n1 * 0.4) * Math.PI * 2);
      const fine = rand();
      const val = Math.round((n1 * 0.42 + n2 * 0.25 + ripple * 0.13 + fine * 0.20) * 255);
      const idx = (y * size + x) * 4;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(34, 34);
  tex.needsUpdate = true;
  return tex;
}

function createMarsSkyDome(sunDir) {
  const geo = new THREE.SphereGeometry(180, 32, 24);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uSunDir: { value: sunDir.clone().normalize() },
      uZenith: { value: new THREE.Color('#3b2e3f') },
      uMid: { value: new THREE.Color('#8e6056') },
      uHorizon: { value: new THREE.Color('#dca67e') },
      uGround: { value: new THREE.Color('#6f3a24') },
      uSunColor: { value: new THREE.Color('#fff1dc') }
    },
    vertexShader: `
      varying vec3 vWorldDir;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uSunDir;
      uniform vec3 uZenith;
      uniform vec3 uMid;
      uniform vec3 uHorizon;
      uniform vec3 uGround;
      uniform vec3 uSunColor;
      varying vec3 vWorldDir;

      void main() {
        vec3 dir = normalize(vWorldDir);
        float h = dir.y;
        vec3 sky;
        if (h >= 0.0) {
          float t1 = smoothstep(0.0, 0.28, h);
          float t2 = smoothstep(0.24, 0.85, h);
          sky = mix(uHorizon, uMid, t1);
          sky = mix(sky, uZenith, t2);
        } else {
          sky = mix(uHorizon, uGround, smoothstep(0.0, -0.25, h));
        }
        float sunCos = max(dot(dir, normalize(uSunDir)), 0.0);
        float halo = pow(sunCos, 16.0) * 0.24 + pow(sunCos, 96.0) * 0.35;
        float disc = smoothstep(0.9988, 0.9994, sunCos) * 0.85;
        vec3 col = sky + uSunColor * (halo + disc);
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  return new THREE.Mesh(geo, mat);
}

function createPhobosMesh() {
  const geo = new THREE.IcosahedronGeometry(1.15, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const bump =
      1.0 +
      0.16 * Math.sin(vx * 2.1 + vy * 1.4) +
      0.08 * Math.cos(vz * 3.1 - vy * 2.2);
    pos.setXYZ(i, vx * 1.28 * bump, vy * 0.88 * bump, vz * 0.96 * bump);
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#9e958e'),
    roughness: 0.95,
    metalness: 0.05
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(24, 24, -46);
  mesh.rotation.set(0.3, 0.6, -0.25);
  return mesh;
}

function createLandingMarker(landerPos) {
  const group = new THREE.Group();
  group.position.set(landerPos[0], landerPos[1], landerPos[2]);

  const ringGeo = new THREE.RingGeometry(0.55, 0.82, 48);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  group.add(ring);

  const outerGeo = new THREE.RingGeometry(1.15, 1.26, 48);
  outerGeo.rotateX(-Math.PI / 2);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const outer = new THREE.Mesh(outerGeo, outerMat);
  group.add(outer);

  const beaconGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.2, 12);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.72
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 1.1;
  group.add(beacon);

  const capGeo = new THREE.SphereGeometry(0.16, 16, 12);
  const capMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 2.25;
  group.add(cap);

  group.visible = false;
  return { group, ring, outer };
}

class Terrain3DController {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.skyDome = null;
    this.marker = null;
    this.resizeObserver = null;
    this.boundWindowResize = null;
    this.loader = new GLTFLoader();
    this.modelCache = new Map();
    this.bumpTexture = null;

    this.activeSiteId = null;
    this.siteGroup = null;
    this.inspectMode = false;
    this.isPaused = false;
    this.rafId = null;
    this.webglFailed = false;

    this.targetParallax = { x: 0, y: 0 };
    this.currentParallax = { x: 0, y: 0 };

    this.camTransition = null;
    this.baseExplorePos = new THREE.Vector3();
    this.baseExploreTarget = new THREE.Vector3();
    this.baseInspectPos = new THREE.Vector3();
    this.baseInspectTarget = new THREE.Vector3();
    this.mountToken = 0;
  }

  hasSite(siteId) {
    return Boolean(siteId && SITE_CONFIGS[siteId]);
  }

  getSiteMeta(siteId) {
    return SITE_CONFIGS[siteId] || null;
  }

  isInspectMode() {
    return this.inspectMode;
  }

  ensureRenderer(container) {
    if (this.webglFailed) return false;
    if (!this.renderer) {
      try {
        const canvas = document.createElement('canvas');
        canvas.className = 'terrain-3d-canvas';
        canvas.setAttribute('aria-hidden', 'true');

        canvas.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          this.stopLoop();
          if (this.canvas) this.canvas.classList.remove('is-ready');
          if (this.container) this.container.classList.remove('has-3d-canvas');
        });

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.06;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xd69d76, 0.0165);

        const sunDir = new THREE.Vector3(-0.56, 0.36, -0.74).normalize();
        const skyDome = createMarsSkyDome(sunDir);
        scene.add(skyDome);
        scene.add(createPhobosMesh());
        this.skyDome = skyDome;

        const hemi = new THREE.HemisphereLight(0xd19f8c, 0x5c2d1b, 0.88);
        scene.add(hemi);

        const sunLight = new THREE.DirectionalLight(0xffe7cf, 2.3);
        sunLight.position.copy(sunDir).multiplyScalar(80);
        scene.add(sunLight);

        const fillAmb = new THREE.AmbientLight(0x8c5540, 0.24);
        scene.add(fillAmb);

        const camera = new THREE.PerspectiveCamera(44, 1000 / 594, 0.25, 320);

        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.maxPolarAngle = Math.PI * 0.468;
        controls.minPolarAngle = 0.14;
        controls.minDistance = 6;
        controls.maxDistance = 58;
        controls.enablePan = true;
        controls.enabled = false;

        this.canvas = canvas;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
      } catch (_err) {
        this.webglFailed = true;
        return false;
      }
    }

    if (this.container !== container || !container.contains(this.canvas)) {
      this.container = container;
      container.appendChild(this.canvas);
    }

    this.attachResizeListeners(container);
    this.resize();
    return true;
  }

  attachResizeListeners(container) {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (typeof ResizeObserver === 'function') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(container);
    }
    if (!this.boundWindowResize) {
      this.boundWindowResize = () => this.resize();
      window.addEventListener('resize', this.boundWindowResize);
    }
  }

  resize() {
    if (!this.renderer || !this.camera || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(240, Math.round(rect.width || 1000));
    const h = Math.max(160, Math.round(rect.height || 594));
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  loadSiteModel(siteId) {
    const cfg = SITE_CONFIGS[siteId];
    if (!cfg) return Promise.reject(new Error(`Unknown 3D site: ${siteId}`));
    if (this.modelCache.has(siteId)) {
      return this.modelCache.get(siteId);
    }

    if (!this.bumpTexture) {
      this.bumpTexture = createRegolithBumpTexture(256);
    }

    const promise = new Promise((resolve, reject) => {
      this.loader.load(
        cfg.modelUrl,
        (gltf) => {
          const root = gltf.scene || new THREE.Group();
          root.traverse((obj) => {
            if (obj.isMesh && obj.material) {
              const oldMat = obj.material;
              obj.material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                vertexColors: Boolean(obj.geometry && obj.geometry.attributes && obj.geometry.attributes.color),
                roughness: 0.95,
                metalness: oldMat.metalness !== undefined ? oldMat.metalness : 0.02,
                bumpMap: this.bumpTexture || null,
                bumpScale: this.bumpTexture ? 0.055 : 0
              });
              if (oldMat && typeof oldMat.dispose === 'function') {
                oldMat.dispose();
              }
            }
          });
          resolve(root);
        },
        undefined,
        (err) => {
          this.modelCache.delete(siteId);
          reject(err);
        }
      );
    });

    this.modelCache.set(siteId, promise);
    return promise;
  }

  async mount(containerEl, siteId, callbacks = {}) {
    if (!containerEl || !this.hasSite(siteId)) {
      this.unmount();
      return false;
    }

    const token = ++this.mountToken;
    if (!this.ensureRenderer(containerEl)) {
      return false;
    }

    const cfg = SITE_CONFIGS[siteId];
    this.activeSiteId = siteId;
    this.inspectMode = false;
    this.controls.enabled = false;
    this.camTransition = null;
    this.targetParallax = { x: 0, y: 0 };
    this.currentParallax = { x: 0, y: 0 };

    this.baseExplorePos.set(...cfg.exploreCamPos);
    this.baseExploreTarget.set(...cfg.exploreCamTarget);
    this.baseInspectPos.set(...cfg.inspectCamPos);
    this.baseInspectTarget.set(...cfg.inspectCamTarget);

    this.camera.position.copy(this.baseExplorePos);
    this.controls.target.copy(this.baseExploreTarget);
    this.camera.lookAt(this.baseExploreTarget);

    try {
      const modelRoot = await this.loadSiteModel(siteId);
      if (token !== this.mountToken || this.activeSiteId !== siteId) {
        return false;
      }

      if (this.siteGroup) {
        this.scene.remove(this.siteGroup);
        this.siteGroup = null;
      }

      const wrapper = new THREE.Group();
      wrapper.add(modelRoot);

      this.marker = createLandingMarker(cfg.landerPos || [0, 0.08, 0]);
      wrapper.add(this.marker.group);

      this.scene.add(wrapper);
      this.siteGroup = wrapper;

      containerEl.classList.add('has-3d-canvas');
      if (this.canvas) {
        this.canvas.classList.add('is-ready');
      }

      this.isPaused = false;
      this.renderOnce();
      this.startLoop();

      if (typeof callbacks.onReady === 'function') {
        callbacks.onReady(this.getSiteMeta(siteId));
      }
      return true;
    } catch (_err) {
      if (typeof callbacks.onError === 'function') {
        callbacks.onError(_err);
      }
      this.unmount();
      return false;
    }
  }

  unmount() {
    this.mountToken += 1;
    this.activeSiteId = null;
    this.inspectMode = false;
    this.camTransition = null;
    this.stopLoop();

    if (this.controls) {
      this.controls.enabled = false;
    }
    if (this.siteGroup && this.scene) {
      this.scene.remove(this.siteGroup);
      this.siteGroup = null;
    }
    if (this.canvas) {
      this.canvas.classList.remove('is-ready');
      if (this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
    if (this.container) {
      this.container.classList.remove('has-3d-canvas');
    }
  }

  pause() {
    this.isPaused = true;
    this.stopLoop();
  }

  resume() {
    if (!this.activeSiteId || !this.canvas || !this.container) return;
    this.isPaused = false;
    this.startLoop();
  }

  setParallax(nx, ny) {
    this.targetParallax.x = Math.max(-1, Math.min(1, Number(nx) || 0));
    this.targetParallax.y = Math.max(-1, Math.min(1, Number(ny) || 0));
  }

  setInspectMode(enabled) {
    const next = Boolean(enabled) && Boolean(this.activeSiteId);
    if (this.inspectMode === next) return this.inspectMode;

    this.inspectMode = next;
    if (this.marker && this.marker.group) {
      this.marker.group.visible = next;
    }

    if (next) {
      this.camTransition = {
        startTime: performance.now(),
        duration: 720,
        fromPos: this.camera.position.clone(),
        fromTarget: this.controls.target.clone(),
        toPos: this.baseInspectPos.clone(),
        toTarget: this.baseInspectTarget.clone(),
        enableControlsOnEnd: true
      };
      this.controls.enabled = false;
    } else {
      this.controls.enabled = false;
      this.camTransition = {
        startTime: performance.now(),
        duration: 620,
        fromPos: this.camera.position.clone(),
        fromTarget: this.controls.target.clone(),
        toPos: this.baseExplorePos.clone(),
        toTarget: this.baseExploreTarget.clone(),
        enableControlsOnEnd: false
      };
    }
    return this.inspectMode;
  }

  startLoop() {
    if (this.isPaused || this.rafId || !this.renderer) return;
    const tick = (now) => {
      if (this.isPaused || !this.activeSiteId) {
        this.rafId = null;
        return;
      }
      this.step(now);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  renderOnce() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  step(now) {
    if (!this.renderer || !this.scene || !this.camera) return;

    if (this.camTransition) {
      const elapsed = now - this.camTransition.startTime;
      const t = Math.min(1, Math.max(0, elapsed / this.camTransition.duration));
      const ease = 1 - Math.pow(1 - t, 3);
      this.camera.position.lerpVectors(this.camTransition.fromPos, this.camTransition.toPos, ease);
      this.controls.target.lerpVectors(this.camTransition.fromTarget, this.camTransition.toTarget, ease);
      this.camera.lookAt(this.controls.target);
      if (t >= 1) {
        const enableCtrl = this.camTransition.enableControlsOnEnd;
        this.camTransition = null;
        if (enableCtrl && this.inspectMode) {
          this.controls.enabled = true;
          this.controls.update();
        }
      }
    } else if (this.inspectMode) {
      if (this.controls.enabled) {
        this.controls.update();
      }
      if (this.marker && this.marker.group && this.marker.group.visible) {
        const pulse = 1 + 0.12 * Math.sin(now * 0.004);
        this.marker.outer.scale.set(pulse, pulse, 1);
      }
    } else {
      this.currentParallax.x += (this.targetParallax.x - this.currentParallax.x) * 0.08;
      this.currentParallax.y += (this.targetParallax.y - this.currentParallax.y) * 0.08;
      const px = this.currentParallax.x;
      const py = this.currentParallax.y;

      this.camera.position.set(
        this.baseExplorePos.x + px * 0.72,
        this.baseExplorePos.y - py * 0.16,
        this.baseExplorePos.z + py * 0.22
      );
      this.controls.target.set(
        this.baseExploreTarget.x + px * 1.1,
        this.baseExploreTarget.y - py * 0.35,
        this.baseExploreTarget.z
      );
      this.camera.lookAt(this.controls.target);
    }

    if (this.skyDome) {
      this.skyDome.position.copy(this.camera.position);
    }

    this.renderer.render(this.scene, this.camera);
  }

  getStats() {
    return {
      activeSiteId: this.activeSiteId,
      inspectMode: this.inspectMode,
      isPaused: this.isPaused,
      hasCanvas: Boolean(this.canvas && this.container && this.container.contains(this.canvas)),
      webglFailed: this.webglFailed
    };
  }
}

const instance = new Terrain3DController();
window.CYBERPENGUINS_TERRAIN_3D = instance;
window.dispatchEvent(new CustomEvent('cyberpenguins:terrain3d-ready'));
