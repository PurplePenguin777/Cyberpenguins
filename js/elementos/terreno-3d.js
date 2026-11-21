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

const PENGUIN_MODEL_URL = 'assets/models/cyberpenguin.glb?v=20261121y';
const SOJOURNER_MODEL_URL = 'assets/models/sojourner.glb?v=20261121y';
const SHIP_MODEL_URL = 'assets/models/nave-pinguino.glb?v=20261121ad';
const PHOBOS_MODEL_URL = 'assets/models/phobos.glb?v=20261121y';
const DEIMOS_MODEL_URL = 'assets/models/deimos.glb?v=20261121y';
const SAMPLES_MODEL_URL = 'assets/models/mars-samples.glb?v=20261121y';

const SITE_CONFIGS = {
  'ares-vallis': {
    modelUrl: 'assets/models/ares-vallis-terrain.glb?v=20261121y',
    machineModelUrl: SOJOURNER_MODEL_URL,
    machineScale: 1.18,
    machineDefaultYaw: -0.72,
    shipModelUrl: SHIP_MODEL_URL,
    shipScale: 1.82,
    shipDefaultYaw: 0.36,
    sampleModelUrl: SAMPLES_MODEL_URL,
    sampleNodeMap: {
      // Escalas realistas (1 unidad ≈ 1 m): Barnacle Bill ~30 cm, Yogi ~1 m, Scooby Doo ~60 cm
      'sample-mars-4': { node: 'BarnacleBill', scale: 0.95, yaw: 0.45 },
      'sample-mars-5': { node: 'Yogi', scale: 1.9, yaw: -0.65 },
      'sample-mars-6': { node: 'ScoobyDoo', scale: 1.2, yaw: 0.25 }
    },
    titleEs: 'Ares Vallis',
    titleEn: 'Ares Vallis',
    exploreFov: 37,
    inspectFov: 42,
    exploreCamPos: [-1.15, 1.96, 10.6],
    exploreCamTarget: [1.35, 0.72, -12.0],
    inspectCamPos: [8.5, 6.5, 11.5],
    inspectCamTarget: [0.0, 0.45, -0.5],
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

function createVolcanicRockTextures(size = 256) {
  const albCanvas = document.createElement('canvas');
  albCanvas.width = size;
  albCanvas.height = size;
  const albCtx = albCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext('2d');

  if (!albCtx || !bumpCtx) return { map: null, bumpMap: null };

  const albImg = albCtx.createImageData(size, size);
  const bumpImg = bumpCtx.createImageData(size, size);
  const aData = albImg.data;
  const bData = bumpImg.data;
  const rand = createSeededRng(19970709);

  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const strata = 0.5 + 0.5 * Math.sin((v * 10.0 + Math.sin(u * Math.PI * 4.0) * 0.35) * Math.PI);
      const grain = rand();
      const pitWave = Math.abs(Math.sin(u * 34.0 + Math.sin(v * 21.0)) * Math.cos(v * 27.0 + Math.cos(u * 17.0)));
      const pit = pitWave < 0.14 ? (1.0 - pitWave / 0.14) : 0.0;
      const dustCoat = clampVal((1.0 - v) * 0.55 + strata * 0.25 + (grain - 0.5) * 0.15, 0, 1);

      const baseR = 138 + dustCoat * 58 - pit * 68 + (grain - 0.5) * 24;
      const baseG = 96 + dustCoat * 38 - pit * 52 + (grain - 0.5) * 18;
      const baseB = 78 + dustCoat * 24 - pit * 44 + (grain - 0.5) * 14;
      const hVal = clampVal(0.55 + strata * 0.22 + (grain - 0.5) * 0.26 - pit * 0.48, 0, 1);

      const idx = (y * size + x) * 4;
      aData[idx] = Math.round(clampVal(baseR, 30, 245));
      aData[idx + 1] = Math.round(clampVal(baseG, 24, 225));
      aData[idx + 2] = Math.round(clampVal(baseB, 20, 210));
      aData[idx + 3] = 255;

      const bv = Math.round(hVal * 255);
      bData[idx] = bv;
      bData[idx + 1] = bv;
      bData[idx + 2] = bv;
      bData[idx + 3] = 255;
    }
  }
  albCtx.putImageData(albImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);

  const map = new THREE.CanvasTexture(albCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.needsUpdate = true;

  return { map, bumpMap };
}

function createSmoothMarsRockGeometry(wSegs = 22, hSegs = 16, seed = 42) {
  // Geometría indexada con normales suaves (cero facetas poligonales planas)
  const geo = new THREE.SphereGeometry(1.0, wSegs, hSegs);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const n1 = Math.sin(vx * 2.4 + seed) * Math.cos(vy * 2.8 - seed * 0.5);
    const n2 = Math.cos(vz * 3.9 + vx * 1.9 + seed * 0.7) * Math.sin(vy * 3.3 + seed * 0.3);
    const n3 = Math.sin(vx * 6.2 - vz * 5.4 + vy * 4.8);
    const disp = 0.88 + 0.14 * n1 + 0.07 * n2 + 0.03 * n3;
    const flatBottom = vy < -0.22 ? 0.58 : 1.0;
    pos.setXYZ(i, vx * 1.18 * disp, vy * 0.68 * disp * flatBottom, vz * 0.94 * disp);
  }
  geo.computeVertexNormals();
  return geo;
}

function createInstancedMarsRocks(getHeightFn) {
  const group = new THREE.Group();
  group.name = 'InstancedMarsRockField';
  const rand = createSeededRng(199707042);
  const rockTex = createVolcanicRockTextures(256);

  // Zonas despejadas: nave Ranger, spawn de Cyberpenguin, Sojourner y las 3 muestras recolectables
  const clearZones = [
    { x: -4.6, z: 1.4, r: 3.4 },  // Ranger VTOL
    { x: -2.2, z: 1.8, r: 2.2 },  // Spawn Cyberpenguin
    { x: 2.35, z: 0.45, r: 2.1 }, // Sojourner
    { x: -1.15, z: 8.8, r: 4.5 }, // Frente inmediato de la cámara (evita rocas gigantes en primerísimo plano)
    { x: 0.0, z: 0.0, r: 1.6 }
  ];
  const isClear = (x, z) => {
    for (let i = 0; i < clearZones.length; i += 1) {
      const c = clearZones[i];
      if (Math.hypot(x - c.x, z - c.z) < c.r) return false;
    }
    return true;
  };

  const palette = [
    new THREE.Color('#c99478'), // Polvo ocre sobre andesita
    new THREE.Color('#a47a66'), // Basalto marciano erosionado
    new THREE.Color('#d4a285'), // Costra clara de regolito
    new THREE.Color('#8e6e5e'), // Roca volcánica oscura
    new THREE.Color('#b8856b')  // Tono medio de Ares Vallis
  ];

  const dummy = new THREE.Object3D();

  // Nivel LOD 0 (Primer plano: 160 rocas suaves y texturizadas en 1 sola draw call)
  const nearGeo = createSmoothMarsRockGeometry(24, 16, 11.3);
  const nearMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: rockTex.map,
    bumpMap: rockTex.bumpMap,
    bumpScale: 0.045,
    roughness: 0.94,
    metalness: 0.03
  });
  const nearCount = 160;
  const nearInst = new THREE.InstancedMesh(nearGeo, nearMat, nearCount);
  const rockColliders = [];
  let placedNear = 0;
  let attempts = 0;
  while (placedNear < nearCount && attempts < 1500) {
    attempts += 1;
    const ang = rand() * Math.PI * 2;
    const dist = 2.8 + Math.pow(rand(), 0.78) * 16.0;
    const rx = Math.cos(ang) * dist;
    const rz = Math.sin(ang) * dist - 1.5;
    if (!isClear(rx, rz)) continue;

    const s = 0.055 + Math.pow(rand(), 2.6) * 0.22;
    const sx = s * (0.85 + rand() * 0.45);
    const sy = s * (0.62 + rand() * 0.42);
    const sz = s * (0.85 + rand() * 0.45);
    const rFoot = Math.max(sx, sz) * 0.8;
    const ry = Math.min(
      getHeightFn(rx, rz),
      getHeightFn(rx + rFoot, rz),
      getHeightFn(rx - rFoot, rz),
      getHeightFn(rx, rz + rFoot),
      getHeightFn(rx, rz - rFoot)
    );
    dummy.position.set(rx, ry - sy * 0.28, rz);
    dummy.rotation.set((rand() - 0.5) * 0.4, rand() * Math.PI * 2, (rand() - 0.5) * 0.4);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    nearInst.setMatrixAt(placedNear, dummy.matrix);
    nearInst.setColorAt(placedNear, palette[Math.floor(rand() * palette.length)]);

    // Registrar colisionador físico real de cada roca cercana (radio y altura sobre el suelo)
    const physR = Math.max(sx, sz) * 0.92;
    const physH = Math.max(0.03, sy * 0.72 - s * 0.14);
    if (physR >= 0.07) {
      rockColliders.push({ x: rx, z: rz, r: physR, h: physH, baseY: ry });
    }
    placedNear += 1;
  }
  nearInst.count = placedNear;
  nearInst.instanceMatrix.needsUpdate = true;
  if (nearInst.instanceColor) nearInst.instanceColor.needsUpdate = true;
  nearInst.frustumCulled = true;
  group.add(nearInst);

  // Nivel LOD 1 (Plano medio/lejano: 260 rocas de la planicie de Ares Vallis en 1 sola draw call)
  const farGeo = createSmoothMarsRockGeometry(14, 10, 29.7);
  const farMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: rockTex.map,
    roughness: 0.96,
    metalness: 0.02
  });
  const farCount = 260;
  const farInst = new THREE.InstancedMesh(farGeo, farMat, farCount);
  let placedFar = 0;
  attempts = 0;
  while (placedFar < farCount && attempts < 1800) {
    attempts += 1;
    const ang = rand() * Math.PI * 2;
    const dist = 12.0 + Math.pow(rand(), 0.72) * 23.0;
    const rx = Math.cos(ang) * dist;
    const rz = Math.sin(ang) * dist - 4.0;
    if (!isClear(rx, rz)) continue;

    const s = 0.14 + Math.pow(rand(), 2.2) * 0.48;
    const rFoot = s * 0.85;
    const ry = Math.min(
      getHeightFn(rx, rz),
      getHeightFn(rx + rFoot, rz),
      getHeightFn(rx - rFoot, rz),
      getHeightFn(rx, rz + rFoot),
      getHeightFn(rx, rz - rFoot)
    );
    dummy.position.set(rx, ry - s * 0.36, rz);
    dummy.rotation.set((rand() - 0.5) * 0.5, rand() * Math.PI * 2, (rand() - 0.5) * 0.5);
    dummy.scale.set(s * (0.8 + rand() * 0.5), s * (0.58 + rand() * 0.45), s * (0.8 + rand() * 0.5));
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

  return { group, totalRocks: placedNear + placedFar, rockColliders };
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
    this.sampleModelCache = new Map();
    this.sampleActors = new Map();
    this.rockColliders = [];
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
    this.speakingActor = null;
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
      slopeSampled: false,
      speakBlend: 0,
      lastAnimTime: 0
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
      jumpHeight: 0,
      speakBlend: 0
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
    this.dialogueZoom = {
      active: false,
      progress: 0,
      camPos: new THREE.Vector3(),
      targetPos: new THREE.Vector3()
    };
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
        controls.maxPolarAngle = Math.PI * 0.465;
        controls.minPolarAngle = 0.08;
        controls.minDistance = 0.85;
        controls.maxDistance = 58;
        controls.enablePan = true;
        controls.enabled = false;

        // Doble clic o toque en el canvas 3D para enfocar y centrar la vista en cualquier objeto o terreno
        canvas.addEventListener('dblclick', (event) => {
          if (!this.inspectMode || !this.camera || !this.controls) return;
          const rect = canvas.getBoundingClientRect();
          const ndc = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
          );
          this.raycaster.setFromCamera(ndc, this.camera);
          const actors = [];
          if (this.penguinActor && this.penguinActor.group) actors.push(this.penguinActor.group);
          if (this.machineActor && this.machineActor.group) actors.push(this.machineActor.group);
          if (this.shipActor && this.shipActor.group) actors.push(this.shipActor.group);
          this.sampleActors.forEach((entry) => {
            if (entry.group && entry.group.visible) actors.push(entry.group);
          });
          const actorHits = this.raycaster.intersectObjects(actors, true);
          if (actorHits.length > 0) {
            const pt = actorHits[0].point;
            this.focusOnPoint(pt.x, pt.y + 0.2, pt.z);
            return;
          }
          if (this.terrainMeshes.length > 0) {
            const hits = this.raycaster.intersectObjects(this.terrainMeshes, false);
            if (hits.length > 0) {
              const pt = hits[0].point;
              this.focusOnPoint(pt.x, pt.y + 0.3, pt.z);
            }
          }
        });

        let lastInspectTap = 0;
        canvas.addEventListener('touchend', (event) => {
          if (!this.inspectMode || !this.camera || !this.controls) return;
          const now = performance.now();
          if (now - lastInspectTap < 320 && event.changedTouches && event.changedTouches.length === 1) {
            const touch = event.changedTouches[0];
            const rect = canvas.getBoundingClientRect();
            const ndc = new THREE.Vector2(
              ((touch.clientX - rect.left) / rect.width) * 2 - 1,
              -((touch.clientY - rect.top) / rect.height) * 2 + 1
            );
            this.raycaster.setFromCamera(ndc, this.camera);
            const actors = [];
            if (this.penguinActor && this.penguinActor.group) actors.push(this.penguinActor.group);
            if (this.machineActor && this.machineActor.group) actors.push(this.machineActor.group);
            if (this.shipActor && this.shipActor.group) actors.push(this.shipActor.group);
            this.sampleActors.forEach((entry) => {
              if (entry.group && entry.group.visible) actors.push(entry.group);
            });
            const actorHits = this.raycaster.intersectObjects(actors, true);
            if (actorHits.length > 0) {
              const pt = actorHits[0].point;
              this.focusOnPoint(pt.x, pt.y + 0.2, pt.z);
              return;
            }
            if (this.terrainMeshes.length > 0) {
              const hits = this.raycaster.intersectObjects(this.terrainMeshes, false);
              if (hits.length > 0) {
                const pt = hits[0].point;
                this.focusOnPoint(pt.x, pt.y + 0.3, pt.z);
              }
            }
          }
          lastInspectTap = now;
        });

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

  hasSampleActors() {
    return Boolean(this.sampleActors && this.sampleActors.size > 0);
  }

  loadSamplesModel(modelUrl) {
    if (!modelUrl) return Promise.resolve(null);
    if (this.sampleModelCache.has(modelUrl)) {
      return this.sampleModelCache.get(modelUrl);
    }
    const promise = new Promise((resolve, reject) => {
      this.loader.load(
        modelUrl,
        (gltf) => {
          const root = gltf.scene || new THREE.Group();
          root.traverse((obj) => {
            if (!obj.isMesh || !obj.material) return;
            obj.material.side = THREE.FrontSide;
            if (typeof obj.material.metalness === 'number') {
              obj.material.metalness = Math.min(obj.material.metalness, 0.08);
            }
            obj.material.needsUpdate = true;
          });
          resolve(root);
        },
        undefined,
        (err) => {
          this.sampleModelCache.delete(modelUrl);
          reject(err);
        }
      );
    });
    this.sampleModelCache.set(modelUrl, promise);
    return promise;
  }

  createSampleActors(templateRoot, sampleNodeMap) {
    const map = new Map();
    if (!templateRoot || !sampleNodeMap) return map;
    Object.entries(sampleNodeMap).forEach(([sampleId, spec]) => {
      const srcNode = templateRoot.getObjectByName(spec.node);
      if (!srcNode) return;
      const meshClone = srcNode.clone(true);
      meshClone.position.set(0, 0, 0);
      meshClone.scale.setScalar(spec.scale || 1.2);
      meshClone.rotation.set(0, spec.yaw || 0, 0);
      // Normalizar la base exacta de cada roca a y = 0 para que jamás flote sobre el suelo
      meshClone.updateMatrixWorld(true);
      const localBox = new THREE.Box3().setFromObject(meshClone);
      if (Number.isFinite(localBox.min.y)) {
        meshClone.position.y -= localBox.min.y;
      }

      const shadow = createPenguinContactShadow();
      const sRad = (spec.scale || 1.2) * (spec.node === 'Yogi' ? 1.55 : 0.95);
      shadow.scale.set(sRad, 1, sRad);
      shadow.position.set(0, 0.025, 0);

      const group = new THREE.Group();
      group.name = `SampleActor_${sampleId}`;
      group.add(shadow);
      group.add(meshClone);
      group.visible = false;
      map.set(sampleId, { group, mesh: meshClone, shadow, spec });
    });
    return map;
  }

  syncSampleActors(sampleAnchors = {}, collectedIds = []) {
    if (!this.sampleActors || this.sampleActors.size === 0) return;
    const collectedSet = new Set(Array.isArray(collectedIds) ? collectedIds : []);
    this.sampleActors.forEach((entry, sampleId) => {
      const anchor = sampleAnchors[sampleId];
      if (!anchor || collectedSet.has(sampleId)) {
        entry.group.visible = false;
        return;
      }
      const sc = (entry.spec && entry.spec.scale) || 1.2;
      const rEdge = (entry.spec && entry.spec.node === 'Yogi' ? 0.45 : 0.24) * sc;
      const minY = Math.min(
        this.getGroundHeightAt(anchor.x, anchor.z),
        this.getGroundHeightAt(anchor.x + rEdge, anchor.z),
        this.getGroundHeightAt(anchor.x - rEdge, anchor.z),
        this.getGroundHeightAt(anchor.x, anchor.z + rEdge),
        this.getGroundHeightAt(anchor.x, anchor.z - rEdge)
      );
      if (entry.group.position.y !== minY - 0.045 || entry.group.position.x !== anchor.x || entry.group.position.z !== anchor.z) {
        entry.group.position.set(anchor.x, minY - 0.045, anchor.z);
        entry._cachedPeak = null;
      }
      entry.group.visible = true;
    });
  }

  getSampleWorldPeak(sampleId) {
    if (!this.sampleActors) return null;
    const entry = this.sampleActors.get(sampleId);
    if (!entry || !entry.group || !entry.group.visible) return null;
    if (
      entry._cachedPeak &&
      entry._cachedGroupY === entry.group.position.y &&
      entry._cachedGroupX === entry.group.position.x &&
      entry._cachedGroupZ === entry.group.position.z
    ) {
      return entry._cachedPeak;
    }
    const targetObj = entry.mesh || entry.group;
    // Actualiza también la cadena de padres: si no, la matriz del grupo aún es la identidad
    // (posición 0,0,0) y todas las balizas se calculan cerca del origen del mundo.
    targetObj.updateWorldMatrix(true, true);
    // Centro visual real: promedio (x, z) de los vértices VISIBLES (por encima del terreno) de la
    // franja superior de la roca. Si parte de la roca queda enterrada en la ladera, el centro de su
    // malla no coincide con la masa que realmente se ve, y la marca quedaba desplazada.
    const v = new THREE.Vector3();
    const pts = [];
    let minY = Infinity;
    let maxY = -Infinity;
    targetObj.traverse((o) => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      const pos = o.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 1) {
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        const ground = this.getGroundHeightAt(v.x, v.z);
        if (Number.isFinite(ground) && v.y < ground + 0.015) continue; // enterrado
        pts.push(v.x, v.y, v.z);
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
      }
    });
    if (pts.length === 0 || !Number.isFinite(maxY)) return null;
    const bandY = maxY - (maxY - minY) * 0.5;
    let sx = 0;
    let sz = 0;
    let n = 0;
    for (let i = 0; i < pts.length; i += 3) {
      if (pts[i + 1] >= bandY) {
        sx += pts[i];
        sz += pts[i + 2];
        n += 1;
      }
    }
    if (n === 0) return null;
    entry._cachedGroupX = entry.group.position.x;
    entry._cachedGroupY = entry.group.position.y;
    entry._cachedGroupZ = entry.group.position.z;
    entry._cachedPeak = {
      x: sx / n,
      y: maxY + 0.035,
      z: sz / n
    };
    return entry._cachedPeak;
  }

  getShipWorldPeak() {
    if (!this.shipActor || !this.shipActor.group || !this.shipActor.group.visible) return null;
    const g = this.shipActor.group;
    g.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(g);
    if (!Number.isFinite(box.min.x) || !Number.isFinite(box.max.y)) return null;
    return {
      x: (box.min.x + box.max.x) * 0.5,
      y: box.max.y + 0.12,
      z: (box.min.z + box.max.z) * 0.5
    };
  }

  getMachineWorldPeak() {
    if (!this.machineActor || !this.machineActor.group || !this.machineActor.group.visible) return null;
    const actor = this.machineActor;
    const mst = this.machineState;
    // Cúspide estática de la antena de Sojourner en reposo (independiente de la vibración dinámica de la antena)
    // para que el globo de diálogo permanezca 100% inmóvil y estable mientras la antena oscila libremente debajo
    const scale = actor.scale || 1.18;
    return {
      x: mst.x,
      y: mst.y + (0.60 * scale),
      z: mst.z
    };
  }

  getPenguinWorldPeak() {
    if (!this.penguinActor || !this.penguinActor.group || !this.penguinActor.group.visible) return null;
    const actor = this.penguinActor;
    const st = this.penguinState;
    const scale = actor.scale || 0.82;
    // Cúspide estática de la parte superior del casco de Cyberpenguin en reposo
    return {
      x: st.x,
      y: st.y + (st.jumpHeight || 0) + (1.24 * scale),
      z: st.z
    };
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
            const isCanopyGlass =
              obj.name === 'CanopyGlass' ||
              obj.material.name === 'RangerCanopyQuartzGlass';
            if (isCanopyGlass) {
              // Vidrio aeroespacial de sílice fundida negro brillante (estilo Ranger de Interstellar):
              // refleja el sol marciano y filtra radiación UV/IR extrema del espacio.
              obj.material = new THREE.MeshPhysicalMaterial({
                name: 'RangerCanopyQuartzGlass',
                color: new THREE.Color('#090d16'),
                roughness: 0.05,
                metalness: 0.18,
                clearcoat: 1.0,
                clearcoatRoughness: 0.04,
                reflectivity: 0.95,
                side: THREE.FrontSide
              });
              obj.material.needsUpdate = true;
              return;
            }
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

  setSpeakingActor(speaker) {
    this.speakingActor = (speaker === 'penguin' || speaker === 'machine' || speaker === 'ship') ? speaker : null;
  }

  setDialogueZoom(active, charA, charB) {
    if (active && charA && charB) {
      this.dialogueZoom.active = true;
      const midX = (charA.x + charB.x) * 0.5;
      const midY = ((charA.y || 0) + (charB.y || 0)) * 0.5;
      const midZ = (charA.z + charB.z) * 0.5;

      const dx = charB.x - charA.x;
      const dz = charB.z - charA.z;
      const dist = Math.hypot(dx, dz) || 1.15;
      const ux = dx / dist;
      const uz = dz / dist;

      // Normal perpendicular orientada hacia el frente (+Z hacia la cámara)
      // para que Cyberpenguin quede a la izquierda y la máquina a la derecha (cara a cara)
      let nx = -uz;
      let nz = ux;
      if (nz < 0.25) {
        nx = uz;
        nz = -ux;
        if (nz < 0.25) {
          nx = 0;
          nz = 1;
        }
      }

      // Distancia de encuadre con zoom moderado (alejado un poco para dar holgura a los globos encima de cada uno)
      const camDist = Math.max(3.85, Math.min(4.45, dist * 3.35));
      this.dialogueZoom.camPos.set(
        midX + nx * camDist,
        midY + 0.74,
        midZ + nz * camDist
      );
      this.dialogueZoom.targetPos.set(
        midX,
        midY + 0.58,
        midZ
      );
    } else {
      this.dialogueZoom.active = Boolean(active);
    }
  }

  animateMachineActor(now) {
    if (!this.machineActor) return;
    const actor = this.machineActor;
    const mst = this.machineState;
    const dt = mst.lastAnimTime > 0 ? Math.min(0.08, Math.max(0.001, (now - mst.lastAnimTime) * 0.001)) : 0.016;
    mst.lastAnimTime = now;

    mst.speakBlend += ((this.speakingActor === 'machine' ? 1 : 0) - mst.speakBlend) * Math.min(1, dt * 9);
    const sb = mst.speakBlend;

    actor.rigRoot.position.set(mst.x, mst.y, mst.z);
    actor.rigRoot.rotation.set(mst.pitch, mst.yaw, mst.roll);

    if (actor.shadow) {
      actor.shadow.position.set(mst.x, mst.y + 0.014, mst.z);
      actor.shadow.rotation.set(0, mst.yaw, 0);
    }

    // Vibración suave de la antena látigo UHF en la brisa marciana (+ pulso al hablar/transmitir)
    if (actor.antenna) {
      actor.antenna.rotation.z = Math.sin(now * 0.0042) * 0.035 + Math.sin(now * 0.028) * 0.13 * sb;
      actor.antenna.rotation.x = Math.cos(now * 0.0031) * 0.025 + Math.cos(now * 0.021) * 0.09 * sb;
    }

    // Micro-escaneo periódico de las ruedas direccionales delanteras y del brazo APXS
    const steerAngle = Math.sin(now * 0.0011) * 0.14;
    if (actor.wheelFL) actor.wheelFL.rotation.y = steerAngle;
    if (actor.wheelFR) actor.wheelFR.rotation.y = steerAngle;
    if (actor.wheelRL) actor.wheelRL.rotation.y = -steerAngle * 0.6;
    if (actor.wheelRR) actor.wheelRR.rotation.y = -steerAngle * 0.6;

    if (actor.apxsArm) {
      actor.apxsArm.rotation.x = Math.sin(now * 0.0018) * 0.045 + Math.sin(now * 0.014) * 0.085 * sb;
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
    const speakTarget = (this.speakingActor === 'penguin' && jh < 0.02) ? 1 : 0;
    st.speakBlend += (speakTarget - st.speakBlend) * Math.min(1, dt * 9);
    const sb = st.speakBlend;
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
      // Estabilización de cabeza al caminar + ladeo curioso de bebé pingüino (head-tilt kawaii) en reposo + gestos al hablar
      const idleLookY = Math.sin(now * 0.0012) * 0.11 * (1 - wb);
      const curiousWave = Math.sin(now * 0.0017);
      const idleTiltZ = Math.sign(curiousWave) * Math.pow(Math.abs(curiousWave), 1.6) * 0.095 * (1 - wb);
      const speakNod = (Math.sin(now * 0.016) * 0.06 + Math.sin(now * 0.029) * 0.03) * sb;
      const speakTilt = Math.sin(now * 0.009) * 0.055 * sb;
      actor.head.rotation.z = -sinP * 0.095 * wb + idleTiltZ + speakTilt;
      actor.head.rotation.y = -cosP * 0.04 * wb + idleLookY;
      actor.head.rotation.x = -0.03 * wb + Math.sin(now * 0.0023) * 0.025 * (1 - wb) + speakNod;
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
    const speakFlap = (0.07 + Math.abs(Math.sin(now * 0.011)) * 0.1) * sb;
    const speakSwing = Math.sin(now * 0.013) * 0.09 * sb;
    if (actor.flipperL) {
      // Aletas ligeramente abiertas desde el hombro + pequeño aleteo feliz en el aire / al hablar
      actor.flipperL.rotation.z = 0.04 + 0.09 * wb + Math.max(0, sinP) * 0.075 * wb + jumpFlap + speakFlap;
      actor.flipperL.rotation.x = -sinP * 0.14 * wb + speakSwing;
    }
    if (actor.flipperR) {
      actor.flipperR.rotation.z = -(0.04 + 0.09 * wb + Math.max(0, -sinP) * 0.075 * wb + jumpFlap + speakFlap);
      actor.flipperR.rotation.x = sinP * 0.14 * wb - speakSwing;
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

  getPhysicalSampleMeta(sampleId) {
    const entry = this.sampleActors && this.sampleActors.get(sampleId);
    if (!entry || !entry.group.visible) return null;
    const node = entry.spec && entry.spec.node;
    const sc = (entry.spec && entry.spec.scale) || 1.2;
    if (node === 'Yogi') {
      return { x: entry.group.position.x, z: entry.group.position.z, r: 0.48 * sc, h: 0.72 * sc, walkable: false };
    }
    if (node === 'BarnacleBill') {
      return { x: entry.group.position.x, z: entry.group.position.z, r: 0.24 * sc, h: 0.34 * sc, walkable: false };
    }
    // Scooby Doo es una losa plana baja (~18 cm): Cyberpenguin puede subirse encima o rodearla
    return { x: entry.group.position.x, z: entry.group.position.z, r: 0.28 * sc, h: 0.14 * sc, walkable: true };
  }

  /**
   * Resuelve la posición física real (x, y, z) de Cyberpenguin frente a todos los volúmenes 3D:
   * - Nave Ranger VTOL: caja orientada (OBB) ajustada al casco real (sin cerca gigante invisible)
   * - Sojourner Rover: volumen ajustado a sus 6 ruedas (r = 0.38 u + radio corporal del pingüino)
   * - Rocas altas (Yogi, Barnacle Bill, rocas grandes): deslizamiento tangencial exacto sin atravesarlas
   * - Rocas bajas/planas (Scooby Doo y cantos bajos <= 0.18 u): Cyberpenguin sube físicamente sobre ellas
   */
  resolvePhysicalPosition(wx, wz, penguinRadius = 0.21) {
    let x = wx;
    let z = wz;
    const pr = penguinRadius;

    for (let pass = 0; pass < 2; pass += 1) {
      // 1. Caja orientada (OBB) ajustada al fuselaje real del Ranger VTOL
      if (this.shipActor && this.shipState) {
        const sx = this.shipState.x;
        const sz = this.shipState.z;
        const yaw = this.shipState.yaw || 0.36;
        const sc = this.shipActor.scale || 1.82;
        const dx = x - sx;
        const dz = z - sz;
        const cosY = Math.cos(-yaw);
        const sinY = Math.sin(-yaw);
        // Transformar al espacio local del Ranger (+Z nariz, +X costado de la rampa)
        const lx = dx * cosY + dz * sinY;
        const lz = -dx * sinY + dz * cosY;
        const halfW = 0.78 * sc;
        const halfL = 1.08 * sc;
        const cx = clampVal(lx, -halfW, halfW);
        const cz = clampVal(lz, -halfL, halfL);
        const ex = lx - cx;
        const ez = lz - cz;
        const dist = Math.hypot(ex, ez);
        if (dist < pr) {
          let nlx = lx;
          let nlz = lz;
          if (dist > 1e-4) {
            nlx = cx + (ex / dist) * pr;
            nlz = cz + (ez / dist) * pr;
          } else {
            // Dentro del OBB: empujar hacia la cara más cercana
            const penX = halfW - Math.abs(lx);
            const penZ = halfL - Math.abs(lz);
            if (penX < penZ) {
              nlx = (lx >= 0 ? 1 : -1) * (halfW + pr);
            } else {
              nlz = (lz >= 0 ? 1 : -1) * (halfL + pr);
            }
          }
          const cosF = Math.cos(yaw);
          const sinF = Math.sin(yaw);
          x = sx + nlx * cosF + nlz * sinF;
          z = sz - nlx * sinF + nlz * cosF;
        }
      }

      // 2. Sojourner Rover (volumen compacto real de sus 6 ruedas: r = 0.38 * scale)
      if (this.machineActor && this.machineState) {
        const mx = this.machineState.x;
        const mz = this.machineState.z;
        const mr = 0.36 * (this.machineActor.scale || 1.18) + pr;
        const dx = x - mx;
        const dz = z - mz;
        const d = Math.hypot(dx, dz);
        if (d < mr) {
          if (d < 1e-4) {
            x = mx - mr;
          } else {
            x = mx + (dx / d) * mr;
            z = mz + (dz / d) * mr;
          }
        }
      }

      // 3. Rocas recolectables altas (Yogi, Barnacle Bill)
      if (this.sampleActors && this.sampleActors.size > 0) {
        this.sampleActors.forEach((_entry, sampleId) => {
          const meta = this.getPhysicalSampleMeta(sampleId);
          if (!meta || meta.walkable) return;
          const minD = meta.r + pr;
          const dx = x - meta.x;
          const dz = z - meta.z;
          const d = Math.hypot(dx, dz);
          if (d < minD) {
            if (d < 1e-4) {
              z = meta.z + minD;
            } else {
              x = meta.x + (dx / d) * minD;
              z = meta.z + (dz / d) * minD;
            }
          }
        });
      }

      // 4. Rocas ambientales altas del canal de Ares Vallis (h > 0.16 u -> rodear; <= 0.16 u -> pisar encima)
      if (this.rockColliders && this.rockColliders.length > 0) {
        for (let i = 0; i < this.rockColliders.length; i += 1) {
          const rk = this.rockColliders[i];
          if (rk.h <= 0.16) continue;
          const minD = rk.r + pr * 0.85;
          const dx = x - rk.x;
          const dz = z - rk.z;
          const dSq = dx * dx + dz * dz;
          if (dSq < minD * minD) {
            const d = Math.sqrt(dSq);
            if (d < 1e-4) {
              z = rk.z + minD;
            } else {
              x = rk.x + (dx / d) * minD;
              z = rk.z + (dz / d) * minD;
            }
          }
        }
      }
    }

    // Calcular altura física de apoyo: terreno + subida suave sobre rocas bajas/planas (como Scooby Doo)
    let y = this.getGroundHeightAt(x, z);

    if (this.sampleActors && this.sampleActors.size > 0) {
      this.sampleActors.forEach((_entry, sampleId) => {
        const meta = this.getPhysicalSampleMeta(sampleId);
        if (!meta || !meta.walkable) return;
        const d = Math.hypot(x - meta.x, z - meta.z);
        const outerR = meta.r + pr * 0.65;
        if (d < outerR) {
          const t = clampVal(1.0 - d / outerR, 0, 1);
          const smoothStep = t * t * (3 - 2 * t);
          y = Math.max(y, this.getGroundHeightAt(meta.x, meta.z) + meta.h * smoothStep);
        }
      });
    }

    if (this.rockColliders && this.rockColliders.length > 0) {
      for (let i = 0; i < this.rockColliders.length; i += 1) {
        const rk = this.rockColliders[i];
        if (rk.h > 0.16) continue;
        const outerR = rk.r + pr * 0.55;
        const dx = x - rk.x;
        const dz = z - rk.z;
        const dSq = dx * dx + dz * dz;
        if (dSq < outerR * outerR) {
          const t = clampVal(1.0 - Math.sqrt(dSq) / outerR, 0, 1);
          const smoothStep = t * t * (3 - 2 * t);
          y = Math.max(y, rk.baseY + rk.h * smoothStep);
        }
      }
    }

    return { x, y, z };
  }

  /**
   * Avanza a Cyberpenguin un paso suave de longitud `stepDist` desde (curX, curZ) hacia
   * (targetX, targetZ) usando dirección tangencial anticipada (steering) alrededor de
   * obstáculos sólidos, manteniendo velocidad constante sin tirones ni saltos bruscos.
   */
  computeSteeredStep(curX, curZ, targetX, targetZ, stepDist, penguinRadius = 0.21, prevDir = null) {
    const toX = targetX - curX;
    const toZ = targetZ - curZ;
    const distToTarget = Math.hypot(toX, toZ);
    if (distToTarget < 1e-4) {
      const p = this.resolvePhysicalPosition(curX, curZ, penguinRadius);
      return { ...p, dirX: prevDir ? prevDir.x : 0, dirZ: prevDir ? prevDir.z : 1 };
    }

    let dirX = toX / distToTarget;
    let dirZ = toZ / distToTarget;
    const lookHalo = 0.52;

    const applyAvoidance = (ox, oz, obsR) => {
      const safeR = obsR + penguinRadius;
      // Si el destino está justo al borde de este objeto (p. ej. al ir a recoger la roca o hablar con Sojourner),
      // NO repeler al pingüino: dejar que se acerque directo y pare suavemente sin vibrar.
      if (Math.hypot(targetX - ox, targetZ - oz) < safeR + 0.48) return;

      const rx = curX - ox;
      const rz = curZ - oz;
      const d = Math.hypot(rx, rz);
      const outerR = safeR + lookHalo;
      if (d >= outerR || d < 1e-4) return;

      const toObsX = -rx / d;
      const toObsZ = -rz / d;
      const forwardDot = dirX * toObsX + dirZ * toObsZ;
      if (forwardDot < 0.05) return;

      // Usar dirección previa (si existe) para mantener histéresis y evitar que oscile izq/der
      const refX = prevDir ? prevDir.x : dirX;
      const refZ = prevDir ? prevDir.z : dirZ;
      const cross = refX * toObsZ - refZ * toObsX;
      const turnSign = cross >= 0 ? 1 : -1;
      const tangX = -toObsZ * turnSign;
      const tangZ = toObsX * turnSign;

      const t = clampVal(1.0 - (d - safeR) / lookHalo, 0, 1);
      const w = t * t * (3 - 2 * t) * 0.85;
      dirX = dirX * (1 - w) + tangX * w;
      dirZ = dirZ * (1 - w) + tangZ * w;
      const len = Math.hypot(dirX, dirZ) || 1;
      dirX /= len;
      dirZ /= len;
    };

    // 1. Evitación suave alrededor de la nave Ranger
    if (this.shipActor && this.shipState) {
      applyAvoidance(this.shipState.x, this.shipState.z, 1.35);
    }
    // 2. Evitación suave alrededor de Sojourner
    if (this.machineActor && this.machineState) {
      applyAvoidance(this.machineState.x, this.machineState.z, 0.36 * (this.machineActor.scale || 1.18));
    }
    // 3. Evitación suave alrededor de Yogi y Barnacle Bill
    if (this.sampleActors && this.sampleActors.size > 0) {
      this.sampleActors.forEach((_entry, sampleId) => {
        const meta = this.getPhysicalSampleMeta(sampleId);
        if (!meta || meta.walkable) return;
        applyAvoidance(meta.x, meta.z, meta.r);
      });
    }
    // 4. Evitación suave alrededor de rocas ambientales altas
    if (this.rockColliders && this.rockColliders.length > 0) {
      for (let i = 0; i < this.rockColliders.length; i += 1) {
        const rk = this.rockColliders[i];
        if (rk.h <= 0.16) continue;
        applyAvoidance(rk.x, rk.z, rk.r);
      }
    }

    // Filtro paso-bajo sobre el vector de dirección para eliminar cualquier vibración de giro
    if (prevDir) {
      const blend = 0.24;
      dirX = prevDir.x * (1 - blend) + dirX * blend;
      dirZ = prevDir.z * (1 - blend) + dirZ * blend;
      const len = Math.hypot(dirX, dirZ) || 1;
      dirX /= len;
      dirZ /= len;
    }

    const moveDist = Math.min(stepDist, distToTarget);
    const nextX = curX + dirX * moveDist;
    const nextZ = curZ + dirZ * moveDist;
    const p = this.resolvePhysicalPosition(nextX, nextZ, penguinRadius);
    return { ...p, dirX, dirZ };
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
      const [modelRoot, penguinTemplate, machineTemplate, shipTemplate, sampleTemplate] = await Promise.all([
        this.loadSiteModel(siteId),
        this.loadPenguinActorModel().catch(() => null),
        this.loadMachineActorModel(cfg.machineModelUrl).catch(() => null),
        this.loadShipActorModel(cfg.shipModelUrl).catch(() => null),
        this.loadSamplesModel(cfg.sampleModelUrl).catch(() => null)
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

      // Campo de ~420 rocas marcianas 3D reales en Ares Vallis mediante GPU Instancing (2 draw calls)
      const rockField = createInstancedMarsRocks(
        (rx, rz) => this.getGroundHeightAt(rx, rz)
      );
      wrapper.add(rockField.group);
      this.instancedRockCount = rockField.totalRocks;
      this.rockColliders = rockField.rockColliders || [];

      this.sampleActors = this.createSampleActors(sampleTemplate, cfg.sampleNodeMap);
      this.sampleActors.forEach((entry) => wrapper.add(entry.group));

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
    this.speakingActor = null;
    this.sampleActors = new Map();
    this.rockColliders = [];
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

  focusOnPoint(x, y, z, duration = 480) {
    if (!this.inspectMode || !this.controls) return;
    const fromT = this.controls.target.clone();
    const toT = new THREE.Vector3(x, y, z);
    const startT = performance.now();
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - startT) / duration));
      const ease = 1 - Math.pow(1 - t, 3);
      this.controls.target.lerpVectors(fromT, toT, ease);
      if (t < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  setInspectMode(enabled) {
    const next = Boolean(enabled) && Boolean(this.activeSiteId);
    if (this.inspectMode === next) return this.inspectMode;

    this.inspectMode = next;

    if (next) {
      // Centrar el punto focal inicial directamente en Cyberpenguin y Sojourner
      const focusTarget = this.baseInspectTarget.clone();
      if (this.penguinActor && this.penguinActor.group) {
        focusTarget.x = this.penguinState.x * 0.65 + (this.machineActor ? this.machineState.x * 0.35 : 0);
        focusTarget.z = this.penguinState.z * 0.65 + (this.machineActor ? this.machineState.z * 0.35 : 0);
        focusTarget.y = this.getGroundHeightAt(focusTarget.x, focusTarget.z) + 0.35;
      }
      const initialCamPos = new THREE.Vector3(focusTarget.x + 3.4, focusTarget.y + 2.5, focusTarget.z + 5.2);

      this.camTransition = {
        startTime: performance.now(),
        duration: 720,
        fromPos: this.camera.position.clone(),
        fromTarget: this.controls.target.clone(),
        toPos: initialCamPos,
        toTarget: focusTarget,
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
        if (this.terrainMeshes.length > 0) {
          // Mantener el foco de la cámara dentro del mapa y sobre la superficie
          const tgt = this.controls.target;
          const maxPanR = 26.0;
          const tgtR = Math.hypot(tgt.x, tgt.z);
          if (tgtR > maxPanR) {
            const s = maxPanR / tgtR;
            tgt.x *= s;
            tgt.z *= s;
          }
          const tgtGround = this.getGroundHeightAt(tgt.x, tgt.z);
          if (tgt.y < tgtGround + 0.25) {
            tgt.y = tgtGround + 0.25;
          }

          // Colisión de la cámara con el suelo para impedir que baje por debajo del terreno
          const cx = this.camera.position.x;
          const cz = this.camera.position.z;
          const groundY = this.getGroundHeightAt(cx, cz);
          const minCamY = groundY + 0.22;
          if (this.camera.position.y < minCamY) {
            this.camera.position.y = minCamY;
          }
        }
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

      const normCamX = this.baseExplorePos.x + fx + px * 0.58;
      const normCamY = this.baseExplorePos.y - py * 0.13;
      const normCamZ = this.baseExplorePos.z + fz * 0.65 + py * 0.18;

      const normTgtX = this.baseExploreTarget.x + fx * 1.15 + px * 0.92;
      const normTgtY = this.baseExploreTarget.y - py * 0.28;
      const normTgtZ = this.baseExploreTarget.z + fz * 0.5;

      const targetZoom = this.dialogueZoom.active ? 1.0 : 0.0;
      this.dialogueZoom.progress += (targetZoom - this.dialogueZoom.progress) * 0.075;
      const zp = this.dialogueZoom.progress;

      const baseFov = (this.siteConfig && this.siteConfig.exploreFov) || 37;
      if (zp > 0.001) {
        // Enfoque cinematográfico lateral frente a frente con zoom moderado (FOV 34°)
        const curFov = baseFov - (3.0 * zp);
        if (Math.abs(this.camera.fov - curFov) > 0.01) {
          this.camera.fov = curFov;
          this.camera.updateProjectionMatrix();
        }

        this.camera.position.set(
          normCamX + (this.dialogueZoom.camPos.x - normCamX) * zp,
          normCamY + (this.dialogueZoom.camPos.y - normCamY) * zp,
          normCamZ + (this.dialogueZoom.camPos.z - normCamZ) * zp
        );
        this.controls.target.set(
          normTgtX + (this.dialogueZoom.targetPos.x - normTgtX) * zp,
          normTgtY + (this.dialogueZoom.targetPos.y - normTgtY) * zp,
          normTgtZ + (this.dialogueZoom.targetPos.z - normTgtZ) * zp
        );
      } else {
        if (Math.abs(this.camera.fov - baseFov) > 0.01) {
          this.camera.fov = baseFov;
          this.camera.updateProjectionMatrix();
        }
        this.camera.position.set(normCamX, normCamY, normCamZ);
        this.controls.target.set(normTgtX, normTgtY, normTgtZ);
      }
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
