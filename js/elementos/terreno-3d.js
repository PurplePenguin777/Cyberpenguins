/**
 * Motor 3D de terrenos reales (Three.js + glTF 2.0 / .glb)
 * Renderiza topografía planetaria auténtica extraída de DTMs de la NASA/ESA
 * dentro de #stage-backdrop-layer, exponiendo Raycasting y proyección 3D->pantalla
 * para anclar y mover Cyberpenguin y las entidades sobre el relieve real.
 */
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/three/loaders/GLTFLoader.js';
import { KTX2Loader } from '../vendor/three/loaders/KTX2Loader.js';
import { OrbitControls } from '../vendor/three/controls/OrbitControls.js';
import { MeshoptDecoder } from '../vendor/three/libs/meshopt_decoder.module.js';

const PENGUIN_MODEL_URL = 'assets/models/cyberpenguin.glb?v=20261121w';
const SOJOURNER_MODEL_URL = 'assets/models/sojourner.glb?v=20261121w';
const SHIP_MODEL_URL = 'assets/models/nave-pinguino.glb?v=20261121w';
const PHOBOS_MODEL_URL = 'assets/models/phobos.glb?v=20261121w';
const DEIMOS_MODEL_URL = 'assets/models/deimos.glb?v=20261121w';

const SITE_CONFIGS = {
  'ares-vallis': {
    modelUrl: 'assets/models/ares-vallis-terrain.glb',
    machineModelUrl: SOJOURNER_MODEL_URL,
    machineScale: 1.18,
    machineDefaultYaw: -0.72,
    shipModelUrl: SHIP_MODEL_URL,
    shipScale: 1.82,
    shipDefaultYaw: 0.36,
    titleEs: 'Ares Vallis',
    titleEn: 'Ares Vallis',
    exploreFov: 37,
    inspectFov: 44,
    exploreCamPos: [-1.15, 1.96, 10.6],
    exploreCamTarget: [1.35, 0.72, -12.0],
    inspectCamPos: [21.0, 18.0, 28.5],
    inspectCamTarget: [2.5, -0.8, 4.0],
    landerPos: [0, 0.08, 0],
    penguinScale: 0.82,
    walkBounds: { minZ: -8.8, maxZ: 6.4, maxRadius: 21.0 }
  }
};

function clampVal(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function createSeededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function createRegolithTextures(size = 256) {
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext('2d');

  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const albedoCtx = albedoCanvas.getContext('2d');

  if (!bumpCtx || !albedoCtx) return { bumpMap: null, albedoMap: null };

  const bumpImg = bumpCtx.createImageData(size, size);
  const albImg = albedoCtx.createImageData(size, size);
  const bData = bumpImg.data;
  const aData = albImg.data;
  const rand = createSeededRng(19970704);

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
      const speck = fine > 0.965 ? 1.0 : 0.0;
      const darkPebble = fine < 0.04 ? 1.0 : 0.0;

      const bumpNorm = clampVal(n1 * 0.40 + n2 * 0.24 + ripple * 0.14 + fine * 0.22 + speck * 0.15, 0, 1);
      const bVal = Math.round(bumpNorm * 255);

      const tone = n1 * 0.45 + n2 * 0.30 + fine * 0.25;
      const mul = clampVal(0.88 + tone * 0.14 - darkPebble * 0.08 + speck * 0.03, 0.80, 1.0);
      const idx = (y * size + x) * 4;

      bData[idx] = bVal;
      bData[idx + 1] = bVal;
      bData[idx + 2] = bVal;
      bData[idx + 3] = 255;

      aData[idx] = Math.round(clampVal(mul * 255, 0, 255));
      aData[idx + 1] = Math.round(clampVal(mul * 251, 0, 255));
      aData[idx + 2] = Math.round(clampVal(mul * 246, 0, 255));
      aData[idx + 3] = 255;
    }
  }
  bumpCtx.putImageData(bumpImg, 0, 0);
  albedoCtx.putImageData(albImg, 0, 0);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(36, 36);
  bumpMap.needsUpdate = true;

  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.wrapS = THREE.RepeatWrapping;
  albedoMap.wrapT = THREE.RepeatWrapping;
  albedoMap.repeat.set(36, 36);
  albedoMap.needsUpdate = true;

  return { bumpMap, albedoMap };
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
      uMid: { value: new THREE.Color('#956358') },
      uHorizon: { value: new THREE.Color('#d69d76') },
      uGround: { value: new THREE.Color('#d69d76') },
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
          sky = mix(uHorizon, uGround, smoothstep(0.0, -0.35, h));
        }
        float sunCos = max(dot(dir, normalize(uSunDir)), 0.0);
        float halo = pow(sunCos, 16.0) * 0.22 + pow(sunCos, 96.0) * 0.30;
        float disc = smoothstep(0.9988, 0.9994, sunCos) * 0.80;
        float horizonMask = smoothstep(-0.08, 0.06, h);
        vec3 col = sky + uSunColor * (halo + disc) * horizonMask;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `
  });
  return new THREE.Mesh(geo, mat);
}

function createFacetedRockGeometry(detail = 1, seed = 42) {
  const geo = new THREE.IcosahedronGeometry(1.0, detail);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const n1 = Math.sin(vx * 2.7 + seed) * Math.cos(vy * 3.1 - seed * 0.5);
    const n2 = Math.cos(vz * 4.3 + vx * 2.1 + seed * 0.7);
    const facet = 0.84 + 0.18 * n1 + 0.08 * n2;
    const flatBottom = vy < -0.25 ? 0.62 : 1.0;
    pos.setXYZ(i, vx * 1.18 * facet, vy * 0.74 * facet * flatBottom, vz * 0.96 * facet);
  }
  geo.computeVertexNormals();
  return geo;
}

function createInstancedMarsRocks(getHeightFn, regolithTextures) {
  const group = new THREE.Group();
  group.name = 'InstancedMarsRockField';
  const rand = createSeededRng(199707042);

  // Zonas despejadas: nave Ranger, spawn de Cyberpenguin, Sojourner y zona central de muestras
  const clearZones = [
    { x: -4.6, z: 1.4, r: 3.4 },  // Ranger VTOL
    { x: -2.2, z: 1.8, r: 2.1 },  // Spawn Cyberpenguin
    { x: 2.35, z: 0.45, r: 2.0 }, // Sojourner
    { x: 0.0, z: 0.0, r: 1.6 }    // Centro de aterrizaje
  ];
  const isClear = (x, z) => {
    for (let i = 0; i < clearZones.length; i += 1) {
      const c = clearZones[i];
      if (Math.hypot(x - c.x, z - c.z) < c.r) return false;
    }
    return true;
  };

  const palette = [
    new THREE.Color('#9c5a3e'), // Oxido de hierro polvoriento
    new THREE.Color('#6a4e40'), // Basalto marciano oscuro
    new THREE.Color('#b67350'), // Costra ocre
    new THREE.Color('#7d6153'), // Andesita gris-marrón
    new THREE.Color('#543f36')  // Roca volcánica sombreada
  ];

  const dummy = new THREE.Object3D();

  // Nivel LOD 0 (Primer plano: 180 rocas angulosas detalladas en 1 sola draw call)
  const nearGeo = createFacetedRockGeometry(2, 11.3);
  const nearMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.93,
    metalness: 0.04,
    bumpMap: regolithTextures ? regolithTextures.bumpMap : null,
    bumpScale: regolithTextures && regolithTextures.bumpMap ? 0.04 : 0
  });
  const nearCount = 180;
  const nearInst = new THREE.InstancedMesh(nearGeo, nearMat, nearCount);
  let placedNear = 0;
  let attempts = 0;
  while (placedNear < nearCount && attempts < 1400) {
    attempts += 1;
    const ang = rand() * Math.PI * 2;
    const dist = 2.4 + Math.pow(rand(), 0.78) * 16.5;
    const rx = Math.cos(ang) * dist;
    const rz = Math.sin(ang) * dist - 1.5;
    if (!isClear(rx, rz)) continue;

    const s = 0.065 + Math.pow(rand(), 2.4) * 0.34;
    const ry = getHeightFn(rx, rz);
    dummy.position.set(rx, ry - s * 0.18, rz);
    dummy.rotation.set((rand() - 0.5) * 0.5, rand() * Math.PI * 2, (rand() - 0.5) * 0.5);
    dummy.scale.set(s * (0.85 + rand() * 0.45), s * (0.65 + rand() * 0.45), s * (0.85 + rand() * 0.45));
    dummy.updateMatrix();
    nearInst.setMatrixAt(placedNear, dummy.matrix);
    nearInst.setColorAt(placedNear, palette[Math.floor(rand() * palette.length)]);
    placedNear += 1;
  }
  nearInst.count = placedNear;
  nearInst.instanceMatrix.needsUpdate = true;
  if (nearInst.instanceColor) nearInst.instanceColor.needsUpdate = true;
  nearInst.frustumCulled = true;
  group.add(nearInst);

  // Nivel LOD 1 (Plano medio/lejano: 280 rocas y cantos de la inundación de Ares Vallis en 1 sola draw call)
  const farGeo = createFacetedRockGeometry(1, 29.7);
  const farMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.96,
    metalness: 0.02
  });
  const farCount = 280;
  const farInst = new THREE.InstancedMesh(farGeo, farMat, farCount);
  let placedFar = 0;
  attempts = 0;
  while (placedFar < farCount && attempts < 1800) {
    attempts += 1;
    const ang = rand() * Math.PI * 2;
    const dist = 11.5 + Math.pow(rand(), 0.72) * 24.0;
    const rx = Math.cos(ang) * dist;
    const rz = Math.sin(ang) * dist - 4.0;
    if (!isClear(rx, rz)) continue;

    const s = 0.16 + Math.pow(rand(), 2.1) * 0.68;
    const ry = getHeightFn(rx, rz);
    dummy.position.set(rx, ry - s * 0.22, rz);
    dummy.rotation.set((rand() - 0.5) * 0.6, rand() * Math.PI * 2, (rand() - 0.5) * 0.6);
    dummy.scale.set(s * (0.8 + rand() * 0.55), s * (0.6 + rand() * 0.5), s * (0.8 + rand() * 0.55));
    dummy.updateMatrix();
    farInst.setMatrixAt(placedFar, dummy.matrix);
    farInst.setColorAt(placedFar, palette[Math.floor(rand() * palette.length)]);
    placedFar += 1;
  }
  farInst.count = placedFar;
  farInst.instanceMatrix.needsUpdate = true;
  if (farInst.instanceColor) farInst.instanceColor.needsUpdate = true;
  farInst.frustumCulled = true;
  group.add(farInst);

  return { group, totalRocks: placedNear + placedFar };
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
    color: new THREE.Color('#a69d96'),
    roughness: 0.94,
    metalness: 0.05,
    fog: false
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(17.2, 9.8, -50.0);
  mesh.scale.setScalar(0.95);
  mesh.rotation.set(0.3, 0.6, -0.25);
  return mesh;
}

function createPenguinContactShadow() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(size * 0.5, size * 0.5, 2, size * 0.5, size * 0.5, size * 0.48);
    grad.addColorStop(0, 'rgba(18, 8, 4, 0.58)');
    grad.addColorStop(0.55, 'rgba(24, 10, 5, 0.26)');
    grad.addColorStop(1, 'rgba(24, 10, 5, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(0.68, 0.58);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
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
    this.baseCamera = null;
    this.controls = null;
    this.skyDome = null;
    this.marker = null;
    this.resizeObserver = null;
    this.boundWindowResize = null;
    this.loader = new GLTFLoader();
    this.ktx2Loader = null;
    if (MeshoptDecoder && typeof this.loader.setMeshoptDecoder === 'function') {
      this.loader.setMeshoptDecoder(MeshoptDecoder);
    }
    this.modelCache = new Map();
    this.machineModelCache = new Map();
    this.shipModelCache = new Map();
    this.terrainHeightGrid = null;
    this.perfState = {
      currentPixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
      maxPixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
      minPixelRatio: 0.85,
      lastFrameAt: 0,
      accumMs: 0,
      frameCount: 0
    };
    this.penguinModelPromise = null;
    this.penguinActor = null;
    this.machineActor = null;
    this.shipActor = null;
    this.shipState = {
      x: -4.6,
      y: 0,
      z: 1.4,
      yaw: 0.62,
      pitch: 0,
      roll: 0,
      slopeSampled: false
    };
    this.machineState = {
      x: 2.35,
      y: 0,
      z: 0.45,
      yaw: -0.72,
      pitch: 0,
      roll: 0,
      slopeSampled: false
    };
    this.penguinState = {
      x: -2.2,
      y: 0,
      z: 1.0,
      targetYaw: 0.38,
      currentYaw: 0.38,
      isWalking: false,
      walkBlend: 0,
      walkPhase: 0,
      lastAnimTime: 0,
      jumpHeight: 0
    };
    this.regolithTextures = null;

    this.activeSiteId = null;
    this.siteGroup = null;
    this.terrainMeshes = [];
    this.inspectMode = false;
    this.isPaused = false;
    this.rafId = null;
    this.webglFailed = false;
    this.onFrameCallback = null;

    this.targetParallax = { x: 0, y: 0 };
    this.currentParallax = { x: 0, y: 0 };
    this.targetFocus = { x: 0, z: 0 };
    this.currentFocus = { x: 0, z: 0 };

    this.camTransition = null;
    this.baseExplorePos = new THREE.Vector3();
    this.baseExploreTarget = new THREE.Vector3();
    this.baseInspectPos = new THREE.Vector3();
    this.baseInspectTarget = new THREE.Vector3();

    this.raycaster = new THREE.Raycaster();
    this.downDir = new THREE.Vector3(0, -1, 0);
    this.rayOrigin = new THREE.Vector3();
    this.horizPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.tmpVec = new THREE.Vector3();
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

  setOnFrameCallback(fn) {
    this.onFrameCallback = typeof fn === 'function' ? fn : null;
  }

  updateBaseExploreCamera() {
    if (!this.camera || !this.baseCamera) return;
    this.baseCamera.fov = this.camera.fov;
    this.baseCamera.aspect = this.camera.aspect;
    this.baseCamera.near = this.camera.near;
    this.baseCamera.far = this.camera.far;
    this.baseCamera.updateProjectionMatrix();
    this.baseCamera.position.copy(this.baseExplorePos);
    this.baseCamera.lookAt(this.baseExploreTarget);
    this.baseCamera.updateMatrixWorld(true);
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
        this.perfState.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        this.perfState.currentPixelRatio = this.perfState.maxPixelRatio;
        renderer.setPixelRatio(this.perfState.currentPixelRatio);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;

        // Configurar KTX2Loader (Basis Universal GPU textures) con transcodificador WASM local
        try {
          if (typeof KTX2Loader === 'function') {
            this.ktx2Loader = new KTX2Loader()
              .setTranscoderPath('js/vendor/three/libs/basis/')
              .detectSupport(renderer);
            this.loader.setKTX2Loader(this.ktx2Loader);
          }
        } catch (_ktxErr) {
          // Continuar sin KTX2 si el entorno no soporta WebGL compressed textures
        }

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xd69d76, 0.0175);

        const sunDir = new THREE.Vector3(-0.56, 0.36, -0.74).normalize();
        const skyDome = createMarsSkyDome(sunDir);
        scene.add(skyDome);
        this.skyDome = skyDome;

        // Luna marciana Fobos en el cielo con THREE.LOD:
        // Nivel 0: Modelo 3D oficial de la NASA (KTX2 + Meshopt); Nivel 1 (>68 u): proxy ligero
        this.phobosGroup = new THREE.LOD();
        this.phobosGroup.position.set(18.5, 11.4, -52.0);
        this.phobosGroup.rotation.set(0.22, -0.45, -0.16);
        const phobosLowProxy = createPhobosMesh();
        phobosLowProxy.position.set(0, 0, 0);
        phobosLowProxy.scale.setScalar(0.65);
        this.phobosGroup.addLevel(phobosLowProxy, 68);
        scene.add(this.phobosGroup);
        this.loader.load(
          PHOBOS_MODEL_URL,
          (gltf) => {
            const pRoot = gltf.scene || new THREE.Group();
            const box = new THREE.Box3().setFromObject(pRoot);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z, 0.001);
            pRoot.scale.setScalar(1.56 / maxDim);
            pRoot.traverse((obj) => {
              if (!obj.isMesh || !obj.material) return;
              obj.material.fog = false;
              obj.material.roughness = 0.96;
              obj.material.metalness = 0.02;
              if (obj.material.color) {
                obj.material.color.set('#e8cfc0');
              }
              if (obj.material.emissive) {
                obj.material.emissive.set('#7a5346');
                obj.material.emissiveIntensity = 0.42;
              }
              obj.material.needsUpdate = true;
            });
            this.phobosGroup.addLevel(pRoot, 0);
          }
        );

        // Deimos (segunda luna de Marte) con THREE.LOD:
        // Nivel 0: Modelo 3D oficial de la NASA (KTX2 + Meshopt); Nivel 1 (>74 u): punto estelar ligero
        this.deimosGroup = new THREE.LOD();
        this.deimosGroup.position.set(-15.5, 13.8, -58.0);
        this.deimosGroup.rotation.set(0.15, 0.55, 0.12);
        const deimosLowProxy = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 8, 6),
          new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffeed8'), fog: false })
        );
        this.deimosGroup.addLevel(deimosLowProxy, 74);
        scene.add(this.deimosGroup);
        this.loader.load(
          DEIMOS_MODEL_URL,
          (gltf) => {
            const dRoot = gltf.scene || new THREE.Group();
            const box = new THREE.Box3().setFromObject(dRoot);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z, 0.001);
            dRoot.scale.setScalar(0.46 / maxDim);
            dRoot.traverse((obj) => {
              if (!obj.isMesh || !obj.material) return;
              obj.material.fog = false;
              obj.material.roughness = 0.96;
              obj.material.metalness = 0.02;
              if (obj.material.color) {
                obj.material.color.set('#f2ddd0');
              }
              if (obj.material.emissive) {
                obj.material.emissive.set('#8f6454');
                obj.material.emissiveIntensity = 0.52;
              }
              obj.material.needsUpdate = true;
            });
            this.deimosGroup.addLevel(dRoot, 0);
          }
        );

        const hemi = new THREE.HemisphereLight(0xf6dfd0, 0x7a3e26, 1.05);
        scene.add(hemi);

        const sunLight = new THREE.DirectionalLight(0xffe7cf, 2.25);
        sunLight.position.copy(sunDir).multiplyScalar(80);
        scene.add(sunLight);

        const frontFill = new THREE.DirectionalLight(0xfff5e8, 1.25);
        frontFill.position.set(12, 26, 44);
        scene.add(frontFill);

        const fillAmb = new THREE.AmbientLight(0x9e654e, 0.34);
        scene.add(fillAmb);

        const camera = new THREE.PerspectiveCamera(37, 1000 / 594, 0.25, 320);
        const baseCamera = new THREE.PerspectiveCamera(37, 1000 / 594, 0.25, 320);

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
        this.baseCamera = baseCamera;
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
    this.updateBaseExploreCamera();
    if (this.activeSiteId && typeof this.onFrameCallback === 'function') {
      this.camera.updateMatrixWorld();
      this.onFrameCallback(performance.now());
      this.renderOnce();
    }
  }

  loadSiteModel(siteId) {
    const cfg = SITE_CONFIGS[siteId];
    if (!cfg) return Promise.reject(new Error(`Unknown 3D site: ${siteId}`));
    if (this.modelCache.has(siteId)) {
      return this.modelCache.get(siteId);
    }

    if (!this.regolithTextures) {
      this.regolithTextures = createRegolithTextures(256);
    }
    const { bumpMap, albedoMap } = this.regolithTextures;

    const promise = new Promise((resolve, reject) => {
      this.loader.load(
        cfg.modelUrl,
        (gltf) => {
          const root = gltf.scene || new THREE.Group();
          const meshes = [];
          root.traverse((obj) => {
            if (obj.isMesh && obj.material) {
              const oldMat = obj.material;
              const mat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                map: albedoMap || null,
                vertexColors: Boolean(obj.geometry && obj.geometry.attributes && obj.geometry.attributes.color),
                roughness: 0.95,
                metalness: oldMat.metalness !== undefined ? oldMat.metalness : 0.02,
                bumpMap: bumpMap || null,
                bumpScale: bumpMap ? 0.095 : 0
              });
              // Disolver suavemente el borde exterior del parche 9x9 km hacia el color exacto de niebla
              mat.onBeforeCompile = (shader) => {
                shader.vertexShader = shader.vertexShader
                  .replace(
                    '#include <common>',
                    '#include <common>\nvarying vec2 vTerrainXZ;'
                  )
                  .replace(
                    '#include <begin_vertex>',
                    'vTerrainXZ = position.xz;\n#include <begin_vertex>'
                  );
                shader.fragmentShader = shader.fragmentShader
                  .replace(
                    '#include <common>',
                    '#include <common>\nvarying vec2 vTerrainXZ;'
                  )
                  .replace(
                    '#include <fog_fragment>',
                    '#include <fog_fragment>\n#ifdef USE_FOG\nfloat edgeR = length(vTerrainXZ) / 43.5;\nfloat edgeBlend = smoothstep(0.74, 0.97, edgeR);\ngl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, edgeBlend);\n#endif'
                  );
              };
              mat.customProgramCacheKey = () => 'ares-radial-fog-v1';
              obj.material = mat;
              meshes.push(obj);
              if (oldMat && typeof oldMat.dispose === 'function') {
                oldMat.dispose();
              }
            }
          });
          root.userData.terrainMeshes = meshes;
          root.userData.heightGrid = this.buildTerrainHeightGrid(meshes);
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

  loadPenguinActorModel() {
    if (this.penguinModelPromise) {
      return this.penguinModelPromise;
    }
    this.penguinModelPromise = new Promise((resolve, reject) => {
      this.loader.load(
        PENGUIN_MODEL_URL,
        (gltf) => {
          const modelRoot = gltf.scene || new THREE.Group();
          modelRoot.traverse((obj) => {
            if (!obj.isMesh || !obj.material) return;
            const matName = obj.material.name || '';
            if (matName === 'HelmetPolycarbonateDome' || obj.name.includes('HelmetGlass')) {
              obj.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color('#dff4ff'),
                transparent: true,
                opacity: 0.22,
                roughness: 0.05,
                metalness: 0.04,
                clearcoat: 1.0,
                clearcoatRoughness: 0.04,
                depthWrite: false,
                side: THREE.FrontSide
              });
              obj.renderOrder = 3;
            } else {
              // Conservar los materiales PBR, texturas PNG y baseColorFactor del .glb
              obj.material.side = THREE.FrontSide;
              if (typeof obj.material.metalness === 'number') {
                obj.material.metalness = Math.min(obj.material.metalness, 0.30);
              }
              obj.material.needsUpdate = true;
            }
          });
          resolve(modelRoot);
        },
        undefined,
        (err) => {
          this.penguinModelPromise = null;
          reject(err);
        }
      );
    });
    return this.penguinModelPromise;
  }

  createPenguinInstance(templateRoot, scale = 0.82) {
    const root = templateRoot.clone(true);
    const rigRoot = root.getObjectByName('PenguinRoot') || root;
    rigRoot.scale.setScalar(scale);

    const eyesOpen = root.getObjectByName('EyesOpen');
    const eyesHalf = root.getObjectByName('EyesHalf');
    const eyesClosed = root.getObjectByName('EyesClosed');
    if (eyesOpen) {
      eyesOpen.scale.set(1, 1, 1);
      eyesOpen.visible = true;
    }
    if (eyesHalf) {
      eyesHalf.scale.set(1, 1, 1);
      eyesHalf.visible = false;
    }
    if (eyesClosed) {
      eyesClosed.scale.set(1, 1, 1);
      eyesClosed.visible = false;
    }

    const shadow = createPenguinContactShadow();
    shadow.scale.setScalar(scale * 1.15);

    const group = new THREE.Group();
    group.name = 'CyberpenguinActorGroup';
    group.add(shadow);
    group.add(root);

    return {
      group,
      rigRoot,
      shadow,
      torso: root.getObjectByName('Torso'),
      head: root.getObjectByName('Head'),
      helmetGlass: root.getObjectByName('HelmetGlass'),
      eyesOpen,
      eyesHalf,
      eyesClosed,
      flipperL: root.getObjectByName('FlipperL'),
      flipperR: root.getObjectByName('FlipperR'),
      footL: root.getObjectByName('FootL'),
      footR: root.getObjectByName('FootR'),
      scale
    };
  }

  hasPenguinActor() {
    return Boolean(this.penguinActor && this.penguinActor.group);
  }

  hasMachineActor() {
    return Boolean(this.machineActor && this.machineActor.group);
  }

  hasShipActor() {
    return Boolean(this.shipActor && this.shipActor.group);
  }

  loadShipActorModel(modelUrl) {
    if (!modelUrl) return Promise.resolve(null);
    if (this.shipModelCache.has(modelUrl)) {
      return this.shipModelCache.get(modelUrl);
    }
    const promise = new Promise((resolve, reject) => {
      this.loader.load(
        modelUrl,
        (gltf) => {
          const modelRoot = gltf.scene || new THREE.Group();
          modelRoot.traverse((obj) => {
            if (!obj.isMesh || !obj.material) return;
            obj.material.side = THREE.FrontSide;
            if (typeof obj.material.metalness === 'number') {
              obj.material.metalness = Math.min(obj.material.metalness, 0.22);
            }
            if (typeof obj.material.roughness === 'number') {
              obj.material.roughness = Math.max(obj.material.roughness, 0.16);
            }
            obj.material.needsUpdate = true;
          });
          resolve(modelRoot);
        },
        undefined,
        (err) => {
          this.shipModelCache.delete(modelUrl);
          reject(err);
        }
      );
    });
    this.shipModelCache.set(modelUrl, promise);
    return promise;
  }

  createShipInstance(templateRoot, scale = 1.05) {
    const root = templateRoot.clone(true);
    const rigRoot = root.getObjectByName('RangerRoot') || root;
    rigRoot.scale.setScalar(scale);

    const shadow = createPenguinContactShadow();
    shadow.scale.set(scale * 2.75, 1, scale * 3.45);

    const group = new THREE.Group();
    group.name = 'ShipActorGroup';
    group.add(shadow);
    group.add(root);

    return {
      group,
      rigRoot,
      shadow,
      hull: root.getObjectByName('Hull'),
      canopyGlass: root.getObjectByName('CanopyGlass'),
      landingGear: root.getObjectByName('LandingGear'),
      hatchRamp: root.getObjectByName('HatchRamp'),
      scale
    };
  }

  setShipPose(pose = {}) {
    const sst = this.shipState;
    let moved = false;
    if (typeof pose.x === 'number' && Math.abs(pose.x - sst.x) > 1e-4) {
      sst.x = pose.x;
      moved = true;
    }
    if (typeof pose.y === 'number') sst.y = pose.y;
    if (typeof pose.z === 'number' && Math.abs(pose.z - sst.z) > 1e-4) {
      sst.z = pose.z;
      moved = true;
    }
    if (typeof pose.yaw === 'number') sst.yaw = pose.yaw;

    if ((moved || !sst.slopeSampled) && this.terrainMeshes.length > 0) {
      const d = 0.68;
      const sinY = Math.sin(sst.yaw);
      const cosY = Math.cos(sst.yaw);
      const hFront = this.getGroundHeightAt(sst.x + sinY * d, sst.z + cosY * d);
      const hBack = this.getGroundHeightAt(sst.x - sinY * d, sst.z - cosY * d);
      const hLeft = this.getGroundHeightAt(sst.x + cosY * d, sst.z - sinY * d);
      const hRight = this.getGroundHeightAt(sst.x - cosY * d, sst.z + sinY * d);
      sst.pitch = clampVal(Math.atan2(hBack - hFront, d * 2) * 0.52, -0.18, 0.18);
      sst.roll = clampVal(Math.atan2(hRight - hLeft, d * 2) * 0.52, -0.18, 0.18);
      sst.y = Math.min(sst.y, (hFront + hBack + hLeft + hRight) * 0.25);
      sst.slopeSampled = true;
    }
  }

  animateShipActor(_now) {
    if (!this.shipActor) return;
    const actor = this.shipActor;
    const sst = this.shipState;

    actor.rigRoot.position.set(sst.x, sst.y, sst.z);
    actor.rigRoot.rotation.set(sst.pitch, sst.yaw, sst.roll);

    if (actor.shadow) {
      actor.shadow.position.set(sst.x, sst.y + 0.018, sst.z);
      actor.shadow.rotation.set(0, sst.yaw, 0);
    }
  }

  loadMachineActorModel(modelUrl) {
    if (!modelUrl) return Promise.resolve(null);
    if (this.machineModelCache.has(modelUrl)) {
      return this.machineModelCache.get(modelUrl);
    }
    const promise = new Promise((resolve, reject) => {
      this.loader.load(
        modelUrl,
        (gltf) => {
          const modelRoot = gltf.scene || new THREE.Group();
          modelRoot.traverse((obj) => {
            if (!obj.isMesh || !obj.material) return;
            obj.material.side = THREE.FrontSide;
            if (typeof obj.material.metalness === 'number') {
              obj.material.metalness = Math.min(obj.material.metalness, 0.22);
            }
            if (typeof obj.material.roughness === 'number') {
              obj.material.roughness = Math.max(obj.material.roughness, 0.24);
            }
            obj.material.needsUpdate = true;
          });
          resolve(modelRoot);
        },
        undefined,
        (err) => {
          this.machineModelCache.delete(modelUrl);
          reject(err);
        }
      );
    });
    this.machineModelCache.set(modelUrl, promise);
    return promise;
  }

  createMachineInstance(templateRoot, scale = 1.18) {
    const root = templateRoot.clone(true);
    const rigRoot = root.getObjectByName('SojournerRoot') || root;
    rigRoot.scale.setScalar(scale);

    const shadow = createPenguinContactShadow();
    shadow.scale.set(scale * 1.12, 1, scale * 1.38);

    const group = new THREE.Group();
    group.name = 'MachineActorGroup';
    group.add(shadow);
    group.add(root);

    return {
      group,
      rigRoot,
      shadow,
      chassis: root.getObjectByName('Chassis'),
      wheelFL: root.getObjectByName('WheelFL'),
      wheelML: root.getObjectByName('WheelML'),
      wheelRL: root.getObjectByName('WheelRL'),
      wheelFR: root.getObjectByName('WheelFR'),
      wheelMR: root.getObjectByName('WheelMR'),
      wheelRR: root.getObjectByName('WheelRR'),
      apxsArm: root.getObjectByName('APXSArm'),
      antenna: root.getObjectByName('Antenna'),
      scale
    };
  }

  setMachinePose(pose = {}) {
    const mst = this.machineState;
    let moved = false;
    if (typeof pose.x === 'number' && Math.abs(pose.x - mst.x) > 1e-4) {
      mst.x = pose.x;
      moved = true;
    }
    if (typeof pose.y === 'number') mst.y = pose.y;
    if (typeof pose.z === 'number' && Math.abs(pose.z - mst.z) > 1e-4) {
      mst.z = pose.z;
      moved = true;
    }
    if (typeof pose.yaw === 'number') mst.yaw = pose.yaw;

    if ((moved || !mst.slopeSampled) && this.terrainMeshes.length > 0) {
      const d = 0.24;
      const sinY = Math.sin(mst.yaw);
      const cosY = Math.cos(mst.yaw);
      const hFront = this.getGroundHeightAt(mst.x + sinY * d, mst.z + cosY * d);
      const hBack = this.getGroundHeightAt(mst.x - sinY * d, mst.z - cosY * d);
      const hLeft = this.getGroundHeightAt(mst.x + cosY * d, mst.z - sinY * d);
      const hRight = this.getGroundHeightAt(mst.x - cosY * d, mst.z + sinY * d);
      mst.pitch = clampVal(Math.atan2(hBack - hFront, d * 2) * 0.65, -0.22, 0.22);
      mst.roll = clampVal(Math.atan2(hRight - hLeft, d * 2) * 0.65, -0.22, 0.22);
      mst.y = Math.min(mst.y, (hFront + hBack + hLeft + hRight) * 0.25);
      mst.slopeSampled = true;
    }
  }

  animateMachineActor(now) {
    if (!this.machineActor) return;
    const actor = this.machineActor;
    const mst = this.machineState;

    actor.rigRoot.position.set(mst.x, mst.y, mst.z);
    actor.rigRoot.rotation.set(mst.pitch, mst.yaw, mst.roll);

    if (actor.shadow) {
      actor.shadow.position.set(mst.x, mst.y + 0.014, mst.z);
      actor.shadow.rotation.set(0, mst.yaw, 0);
    }

    // Vibración suave de la antena látigo UHF en la brisa marciana
    if (actor.antenna) {
      actor.antenna.rotation.z = Math.sin(now * 0.0042) * 0.035;
      actor.antenna.rotation.x = Math.cos(now * 0.0031) * 0.025;
    }

    // Micro-escaneo periódico de las ruedas direccionales delanteras y del brazo APXS
    const steerAngle = Math.sin(now * 0.0011) * 0.14;
    if (actor.wheelFL) actor.wheelFL.rotation.y = steerAngle;
    if (actor.wheelFR) actor.wheelFR.rotation.y = steerAngle;
    if (actor.wheelRL) actor.wheelRL.rotation.y = -steerAngle * 0.6;
    if (actor.wheelRR) actor.wheelRR.rotation.y = -steerAngle * 0.6;

    if (actor.apxsArm) {
      actor.apxsArm.rotation.x = Math.sin(now * 0.0018) * 0.045;
    }
  }

  setPenguinPose(pose = {}) {
    const st = this.penguinState;
    if (typeof pose.x === 'number') st.x = pose.x;
    if (typeof pose.y === 'number') st.y = pose.y;
    if (typeof pose.z === 'number') st.z = pose.z;
    if (typeof pose.yaw === 'number') st.targetYaw = pose.yaw;
    if (typeof pose.isWalking === 'boolean') st.isWalking = pose.isWalking;
    if (typeof pose.jumpHeight === 'number') st.jumpHeight = pose.jumpHeight;

    // Seguimiento suave de cámara acorde al desplazamiento de Cyberpenguin por el valle
    this.targetFocus.x = clampVal((st.x - (-2.0)) * 0.16, -1.1, 1.45);
    this.targetFocus.z = clampVal((st.z - 1.2) * 0.12, -0.95, 0.75);
  }

  animatePenguinActor(now) {
    if (!this.penguinActor) return;
    const actor = this.penguinActor;
    const st = this.penguinState;
    const dt = st.lastAnimTime > 0 ? Math.min(0.08, Math.max(0.001, (now - st.lastAnimTime) * 0.001)) : 0.016;
    st.lastAnimTime = now;

    // Giro suave en 360 grados por el arco angular más corto
    let yawDiff = st.targetYaw - st.currentYaw;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    st.currentYaw += yawDiff * Math.min(1, dt * 8.5);

    // Transición suave entre reposo y bamboleo lento de pingüino emperador bebé
    const targetBlend = st.isWalking ? 1 : 0;
    st.walkBlend += (targetBlend - st.walkBlend) * Math.min(1, dt * 7.5);
    const wb = st.walkBlend;

    // Cadencia pausada de polluelo de pingüino emperador (~1.58 ciclos/s)
    if (wb > 0.01) {
      st.walkPhase += dt * 9.9;
    }
    const p = st.walkPhase;
    const sinP = Math.sin(p);
    const cosP = Math.cos(p);

    const jh = Math.max(0, st.jumpHeight || 0);
    actor.rigRoot.position.set(st.x, st.y + jh, st.z);
    actor.rigRoot.rotation.set(0, st.currentYaw, 0);

    if (actor.shadow) {
      actor.shadow.position.set(st.x, st.y + 0.016, st.z);
      const sScale = actor.scale * 1.15 * Math.max(0.45, 1 - jh * 0.42);
      actor.shadow.scale.set(sScale, 1, sScale);
      if (actor.shadow.material) {
        actor.shadow.material.opacity = Math.max(0.22, 1 - jh * 0.55);
      }
    }

    const breath = Math.sin(now * 0.0023) * 0.004;
    if (actor.torso) {
      // Bamboleo lateral auténtico (péndulo invertido: inclinación lateral + desplazamiento de cadera + torsión suave)
      actor.torso.rotation.z = sinP * 0.165 * wb;
      actor.torso.rotation.y = cosP * 0.085 * wb;
      actor.torso.rotation.x = 0.065 * wb - Math.min(0.18, jh * 0.16);
      actor.torso.position.x = -sinP * 0.032 * wb;
      actor.torso.position.y = 0.20 + Math.abs(sinP) * 0.020 * wb + breath;
    }

    if (actor.head) {
      // Estabilización de cabeza al caminar + ladeo curioso de bebé pingüino (head-tilt kawaii) en reposo
      const idleLookY = Math.sin(now * 0.0012) * 0.11 * (1 - wb);
      const curiousWave = Math.sin(now * 0.0017);
      const idleTiltZ = Math.sign(curiousWave) * Math.pow(Math.abs(curiousWave), 1.6) * 0.095 * (1 - wb);
      actor.head.rotation.z = -sinP * 0.095 * wb + idleTiltZ;
      actor.head.rotation.y = -cosP * 0.04 * wb + idleLookY;
      actor.head.rotation.x = -0.03 * wb + Math.sin(now * 0.0023) * 0.025 * (1 - wb);
      if (actor.helmetGlass) {
        actor.helmetGlass.rotation.copy(actor.head.rotation);
      }
    }

    // Parpadeo Kawaii en 3 estados (Abiertos -> Entrecerrados -> Cerrados ^ ^ -> Entrecerrados -> Abiertos)
    if (actor.eyesOpen && actor.eyesHalf && actor.eyesClosed) {
      let eyeMode = 'open';
      if (jh > 0.03) {
        // Al saltar en gravedad baja muestra sus ojitos felices cerrados (^ ^)
        eyeMode = 'closed';
      } else {
        // Ciclo natural de parpadeo cada 3.6 s (con parpadeo doble ocasional cada 10.8 s)
        const cycle = now % 3600;
        const isDoubleCycle = (now % 10800) > 7200;
        if (cycle < 52 || (cycle >= 135 && cycle < 190)) {
          eyeMode = 'half';
        } else if (cycle >= 52 && cycle < 135) {
          eyeMode = 'closed';
        } else if (isDoubleCycle && (cycle >= 250 && cycle < 295 || (cycle >= 365 && cycle < 410))) {
          eyeMode = 'half';
        } else if (isDoubleCycle && cycle >= 295 && cycle < 365) {
          eyeMode = 'closed';
        }
      }
      actor.eyesOpen.visible = eyeMode === 'open';
      actor.eyesHalf.visible = eyeMode === 'half';
      actor.eyesClosed.visible = eyeMode === 'closed';
    }

    const jumpFlutter = jh > 0.02 ? Math.sin(now * 0.032) * 0.14 : 0;
    const jumpFlap = Math.min(0.42, jh * 0.56) + jumpFlutter;
    if (actor.flipperL) {
      // Aletas ligeramente abiertas desde el hombro + pequeño aleteo feliz en el aire
      actor.flipperL.rotation.z = 0.04 + 0.09 * wb + Math.max(0, sinP) * 0.075 * wb + jumpFlap;
      actor.flipperL.rotation.x = -sinP * 0.14 * wb;
    }
    if (actor.flipperR) {
      actor.flipperR.rotation.z = -(0.04 + 0.09 * wb + Math.max(0, -sinP) * 0.075 * wb + jumpFlap);
      actor.flipperR.rotation.x = sinP * 0.14 * wb;
    }

    if (actor.footL) {
      // Pasitos cortos alternados de patitas palmeadas
      actor.footL.rotation.x = -sinP * 0.26 * wb + (jh > 0.02 ? 0.25 : 0);
      actor.footL.position.y = 0.18 + Math.max(0, sinP) * 0.034 * wb;
      actor.footL.position.z = 0.01 + sinP * 0.032 * wb;
    }
    if (actor.footR) {
      actor.footR.rotation.x = sinP * 0.26 * wb + (jh > 0.02 ? -0.18 : 0);
      actor.footR.position.y = 0.18 + Math.max(0, -sinP) * 0.034 * wb;
      actor.footR.position.z = 0.01 - sinP * 0.032 * wb;
    }
  }

  buildTerrainHeightGrid(meshes) {
    if (!meshes || !meshes.length) return null;
    const primary = meshes[0];
    const pos = primary && primary.geometry && primary.geometry.attributes && primary.geometry.attributes.position;
    if (!pos || pos.count < 100) return null;

    const side = Math.round(Math.sqrt(pos.count));
    if (Math.abs(side * side - pos.count) > side * 0.15) return null;

    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    const spanX = maxX - minX;
    const spanZ = maxZ - minZ;
    if (spanX < 1e-3 || spanZ < 1e-3) return null;

    const cols = side;
    const rows = side;
    const data = new Float32Array(cols * rows);
    const counts = new Uint8Array(cols * rows);
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const ix = clampVal(Math.round(((x - minX) / spanX) * (cols - 1)), 0, cols - 1);
      const iz = clampVal(Math.round(((z - minZ) / spanZ) * (rows - 1)), 0, rows - 1);
      const idx = iz * cols + ix;
      data[idx] += y;
      counts[idx] += 1;
    }
    for (let i = 0; i < data.length; i += 1) {
      if (counts[i] > 1) {
        data[i] /= counts[i];
      }
    }
    return { cols, rows, minX, maxX, minZ, maxZ, spanX, spanZ, data };
  }

  getGroundHeightAt(wx, wz) {
    const hg = this.terrainHeightGrid;
    if (hg) {
      const fx = ((wx - hg.minX) / hg.spanX) * (hg.cols - 1);
      const fz = ((wz - hg.minZ) / hg.spanZ) * (hg.rows - 1);
      if (fx >= 0 && fx <= hg.cols - 1 && fz >= 0 && fz <= hg.rows - 1) {
        const x0 = Math.floor(fx);
        const z0 = Math.floor(fz);
        const x1 = Math.min(hg.cols - 1, x0 + 1);
        const z1 = Math.min(hg.rows - 1, z0 + 1);
        const tx = fx - x0;
        const tz = fz - z0;
        const h00 = hg.data[z0 * hg.cols + x0];
        const h10 = hg.data[z0 * hg.cols + x1];
        const h01 = hg.data[z1 * hg.cols + x0];
        const h11 = hg.data[z1 * hg.cols + x1];
        const h0 = h00 + (h10 - h00) * tx;
        const h1 = h01 + (h11 - h01) * tx;
        return h0 + (h1 - h0) * tz;
      }
    }
    if (!this.terrainMeshes.length) return 0;
    this.rayOrigin.set(wx, 50, wz);
    this.raycaster.set(this.rayOrigin, this.downDir);
    const hits = this.raycaster.intersectObjects(this.terrainMeshes, false);
    if (hits.length > 0) {
      return hits[0].point.y;
    }
    return 0;
  }

  clampWalkableWorld(wx, wz) {
    const cfg = SITE_CONFIGS[this.activeSiteId];
    const bounds = (cfg && cfg.walkBounds) || { minZ: -9.5, maxZ: 6.8, maxRadius: 22.0 };
    const z = clampVal(wz, bounds.minZ, bounds.maxZ);

    const bPos = this.baseExplorePos;
    const bTgt = this.baseExploreTarget;
    const zSpan = bPos.z - bTgt.z || 23.5;
    const tZ = (bPos.z - z) / zSpan;
    const axisX = bPos.x + (bTgt.x - bPos.x) * tZ;
    const distZ = Math.max(2.5, bPos.z - z);
    const aspect = this.baseCamera ? this.baseCamera.aspect : 1000 / 594;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad((this.baseCamera ? this.baseCamera.fov : 44) * 0.5));
    const halfW = distZ * tanHalf * aspect * 0.86;
    let x = clampVal(wx, axisX - halfW, axisX + halfW);

    const rad = Math.hypot(x, z);
    if (bounds.maxRadius && rad > bounds.maxRadius) {
      const s = bounds.maxRadius / rad;
      x *= s;
    }

    return { x, y: this.getGroundHeightAt(x, z), z };
  }

  screenPctToWorld(pctX, pctY, opts = {}) {
    const useBase = Boolean(opts.useBaseExploreCamera);
    const cam = useBase && this.baseCamera ? this.baseCamera : this.camera;
    if (!cam) return { x: 0, y: 0, z: 0, hit: false };

    if (useBase) {
      this.updateBaseExploreCamera();
    } else {
      cam.updateMatrixWorld(true);
    }

    const tryScreenPct = (sx, sy) => {
      const ndc = { x: (sx / 100) * 2 - 1, y: -(sy / 100) * 2 + 1 };
      this.raycaster.setFromCamera(ndc, cam);
      if (this.terrainMeshes.length > 0) {
        const hits = this.raycaster.intersectObjects(this.terrainMeshes, false);
        if (hits.length > 0) return { pt: hits[0].point, hit: true };
      }
      const planePt = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.horizPlane, planePt)) {
        return { pt: planePt, hit: false };
      }
      return null;
    };

    const cfg = SITE_CONFIGS[this.activeSiteId];
    const bounds = (cfg && cfg.walkBounds) || { minZ: -9.5, maxZ: 6.8 };
    let res = tryScreenPct(pctX, pctY);

    if (opts.clampWalkable && (!res || !res.hit || res.pt.z < bounds.minZ)) {
      const lowerRes = tryScreenPct(pctX, Math.max(49, pctY));
      if (lowerRes) res = lowerRes;
    }

    if (!res) return { x: 0, y: this.getGroundHeightAt(0, 0), z: 0, hit: false };

    if (opts.clampWalkable) {
      const clamped = this.clampWalkableWorld(res.pt.x, res.pt.z);
      return { x: clamped.x, y: clamped.y, z: clamped.z, hit: res.hit };
    }
    return { x: res.pt.x, y: res.pt.y, z: res.pt.z, hit: res.hit };
  }

  projectWorldToScreen(wx, wy, wz) {
    if (!this.camera) return { pctX: 50, pctY: 70, dist: 12, visible: true };
    this.tmpVec.set(wx, wy, wz);
    const dist = this.camera.position.distanceTo(this.tmpVec);
    this.tmpVec.project(this.camera);
    return {
      pctX: (this.tmpVec.x * 0.5 + 0.5) * 100,
      pctY: (-this.tmpVec.y * 0.5 + 0.5) * 100,
      dist,
      visible: this.tmpVec.z >= -1 && this.tmpVec.z <= 1
    };
  }

  getBaseExploreDistance(wx, wy, wz) {
    this.tmpVec.set(wx, wy, wz);
    return this.baseExplorePos.distanceTo(this.tmpVec);
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
    this.targetFocus = { x: 0, z: 0 };
    this.currentFocus = { x: 0, z: 0 };

    const exploreFov = cfg.exploreFov || 37;
    this.camera.fov = exploreFov;
    this.camera.updateProjectionMatrix();

    this.baseExplorePos.set(...cfg.exploreCamPos);
    this.baseExploreTarget.set(...cfg.exploreCamTarget);
    this.baseInspectPos.set(...cfg.inspectCamPos);
    this.baseInspectTarget.set(...cfg.inspectCamTarget);

    this.camera.position.copy(this.baseExplorePos);
    this.controls.target.copy(this.baseExploreTarget);
    this.camera.lookAt(this.baseExploreTarget);
    this.camera.updateMatrixWorld(true);
    this.updateBaseExploreCamera();

    try {
      const [modelRoot, penguinTemplate, machineTemplate, shipTemplate] = await Promise.all([
        this.loadSiteModel(siteId),
        this.loadPenguinActorModel().catch(() => null),
        this.loadMachineActorModel(cfg.machineModelUrl).catch(() => null),
        this.loadShipActorModel(cfg.shipModelUrl).catch(() => null)
      ]);
      if (token !== this.mountToken || this.activeSiteId !== siteId) {
        return false;
      }

      if (this.siteGroup) {
        this.scene.remove(this.siteGroup);
        this.siteGroup = null;
      }

      const wrapper = new THREE.Group();
      wrapper.add(modelRoot);

      this.terrainMeshes = Array.isArray(modelRoot.userData.terrainMeshes)
        ? modelRoot.userData.terrainMeshes
        : [];
      this.terrainHeightGrid = modelRoot.userData.heightGrid || null;

      // Campo de ~460 rocas marcianas 3D reales en Ares Vallis mediante GPU Instancing (2 draw calls)
      const rockField = createInstancedMarsRocks(
        (rx, rz) => this.getGroundHeightAt(rx, rz),
        this.regolithTextures
      );
      wrapper.add(rockField.group);
      this.instancedRockCount = rockField.totalRocks;

      this.marker = createLandingMarker(cfg.landerPos || [0, 0.08, 0]);
      wrapper.add(this.marker.group);

      if (shipTemplate) {
        this.shipState.yaw = typeof cfg.shipDefaultYaw === 'number' ? cfg.shipDefaultYaw : 0.62;
        this.shipState.slopeSampled = false;
        this.shipActor = this.createShipInstance(shipTemplate, cfg.shipScale || 1.05);
        wrapper.add(this.shipActor.group);
        this.animateShipActor(performance.now());
      } else {
        this.shipActor = null;
      }

      if (machineTemplate) {
        this.machineState.yaw = typeof cfg.machineDefaultYaw === 'number' ? cfg.machineDefaultYaw : -0.72;
        this.machineState.slopeSampled = false;
        this.machineActor = this.createMachineInstance(machineTemplate, cfg.machineScale || 1.18);
        wrapper.add(this.machineActor.group);
        this.animateMachineActor(performance.now());
      } else {
        this.machineActor = null;
      }

      if (penguinTemplate) {
        this.penguinActor = this.createPenguinInstance(penguinTemplate, cfg.penguinScale || 0.82);
        wrapper.add(this.penguinActor.group);
        this.animatePenguinActor(performance.now());
      } else {
        this.penguinActor = null;
      }

      this.scene.add(wrapper);
      wrapper.updateMatrixWorld(true);
      this.siteGroup = wrapper;

      containerEl.classList.add('has-3d-canvas');
      if (this.canvas) {
        this.canvas.classList.add('is-ready');
      }

      this.isPaused = false;
      if (typeof callbacks.onReady === 'function') {
        callbacks.onReady(this.getSiteMeta(siteId));
      }
      if (typeof this.onFrameCallback === 'function') {
        this.onFrameCallback(performance.now());
      }
      this.renderOnce();
      this.startLoop();
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
    this.terrainMeshes = [];
    this.terrainHeightGrid = null;
    this.penguinActor = null;
    this.machineActor = null;
    this.shipActor = null;
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
      this.currentParallax.x = 0;
      this.currentParallax.y = 0;
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
      try {
        this.step(now);
      } finally {
        if (!this.isPaused && this.activeSiteId) {
          this.rafId = requestAnimationFrame(tick);
        } else {
          this.rafId = null;
        }
      }
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

  updateAdaptivePixelRatio(now) {
    if (!this.renderer || !this.perfState) return;
    const ps = this.perfState;
    if (ps.lastFrameAt > 0) {
      const dt = now - ps.lastFrameAt;
      if (dt > 0 && dt < 150) {
        ps.accumMs += dt;
        ps.frameCount += 1;
        if (ps.frameCount >= 45) {
          const avgMs = ps.accumMs / ps.frameCount;
          ps.accumMs = 0;
          ps.frameCount = 0;
          let nextRatio = ps.currentPixelRatio;
          if (avgMs > 22.5 && nextRatio > ps.minPixelRatio) {
            nextRatio = Math.max(ps.minPixelRatio, Number((nextRatio - 0.15).toFixed(2)));
          } else if (avgMs < 14.5 && nextRatio < ps.maxPixelRatio) {
            nextRatio = Math.min(ps.maxPixelRatio, Number((nextRatio + 0.1).toFixed(2)));
          }
          if (Math.abs(nextRatio - ps.currentPixelRatio) > 0.01) {
            ps.currentPixelRatio = nextRatio;
            this.renderer.setPixelRatio(nextRatio);
          }
        }
      }
    }
    ps.lastFrameAt = now;
  }

  step(now) {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.updateAdaptivePixelRatio(now);

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
      this.currentParallax.x += (this.targetParallax.x - this.currentParallax.x) * 0.065;
      this.currentParallax.y += (this.targetParallax.y - this.currentParallax.y) * 0.065;
      this.currentFocus.x += (this.targetFocus.x - this.currentFocus.x) * 0.045;
      this.currentFocus.z += (this.targetFocus.z - this.currentFocus.z) * 0.045;
      const px = this.currentParallax.x;
      const py = this.currentParallax.y;
      const fx = this.currentFocus.x;
      const fz = this.currentFocus.z;

      this.camera.position.set(
        this.baseExplorePos.x + fx + px * 0.58,
        this.baseExplorePos.y - py * 0.13,
        this.baseExplorePos.z + fz * 0.65 + py * 0.18
      );
      this.controls.target.set(
        this.baseExploreTarget.x + fx * 1.15 + px * 0.92,
        this.baseExploreTarget.y - py * 0.28,
        this.baseExploreTarget.z + fz * 0.5
      );
      this.camera.lookAt(this.controls.target);
    }

    this.camera.updateMatrixWorld();
    if (this.skyDome) {
      this.skyDome.position.copy(this.camera.position);
    }
    if (typeof this.onFrameCallback === 'function') {
      try {
        this.onFrameCallback(now);
      } catch (err) {
        console.error('[Terrain3D] frame callback error:', err);
      }
    }
    this.animatePenguinActor(now);
    this.animateMachineActor(now);
    this.animateShipActor(now);
    if (this.phobosGroup) {
      this.phobosGroup.rotation.y = -0.35 + Math.sin(now * 0.00006) * 0.12;
    }

    this.renderer.render(this.scene, this.camera);
  }

  getStats() {
    return {
      activeSiteId: this.activeSiteId,
      inspectMode: this.inspectMode,
      isPaused: this.isPaused,
      hasCanvas: Boolean(this.canvas && this.container && this.container.contains(this.canvas)),
      meshCount: this.terrainMeshes.length,
      instancedRockCount: this.instancedRockCount || 0,
      pixelRatio: this.perfState ? this.perfState.currentPixelRatio : 1,
      hasKtx2: Boolean(this.ktx2Loader),
      webglFailed: this.webglFailed
    };
  }
}

const instance = new Terrain3DController();
window.CYBERPENGUINS_TERRAIN_3D = instance;
window.dispatchEvent(new CustomEvent('cyberpenguins:terrain3d-ready'));
