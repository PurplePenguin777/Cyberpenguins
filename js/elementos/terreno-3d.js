/**
 * Motor 3D de terrenos reales (Three.js + glTF 2.0 / .glb)
 * Renderiza topografía planetaria auténtica extraída de DTMs de la NASA/ESA
 * dentro de #stage-backdrop-layer, exponiendo Raycasting y proyección 3D->pantalla
 * para anclar y mover Cyberpenguin y las entidades sobre el relieve real.
 */
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/three/loaders/GLTFLoader.js';
import { OrbitControls } from '../vendor/three/controls/OrbitControls.js';

const PENGUIN_MODEL_URL = 'assets/models/cyberpenguin.glb?v=20261121f';

const SITE_CONFIGS = {
  'ares-vallis': {
    modelUrl: 'assets/models/ares-vallis-terrain.glb',
    titleEs: 'Ares Vallis · 19.09°N, 33.25°W · ESA/NASA Mars Express HRSC DTM (H3147_0000_DA4)',
    titleEn: 'Ares Vallis · 19.09°N, 33.25°W · ESA/NASA Mars Express HRSC DTM (H3147_0000_DA4)',
    hintEs: 'Arrastra para orbitar · Rueda/pellizco para zoom · Clic derecho para desplazar',
    hintEn: 'Drag to orbit · Scroll/pinch to zoom · Right-drag to pan',
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
    this.modelCache = new Map();
    this.penguinModelPromise = null;
    this.penguinActor = null;
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xd69d76, 0.0175);

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

        const frontFill = new THREE.DirectionalLight(0xfff1e0, 0.85);
        frontFill.position.set(16, 22, 42);
        scene.add(frontFill);

        const fillAmb = new THREE.AmbientLight(0x8c5540, 0.26);
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
      // Los pingüinos estabilizan la cabeza compensando parte del balanceo lateral del tronco
      const idleLookY = Math.sin(now * 0.0011) * 0.075 * (1 - wb);
      const idleTiltZ = Math.cos(now * 0.0015) * 0.025 * (1 - wb);
      actor.head.rotation.z = -sinP * 0.095 * wb + idleTiltZ;
      actor.head.rotation.y = -cosP * 0.04 * wb + idleLookY;
      actor.head.rotation.x = -0.03 * wb;
      if (actor.helmetGlass) {
        actor.helmetGlass.rotation.copy(actor.head.rotation);
      }
    }

    const jumpFlap = Math.min(0.55, jh * 0.65);
    if (actor.flipperL) {
      // Aletas ligeramente abiertas para equilibrar el centro de masa al caminar
      actor.flipperL.rotation.z = 0.12 + 0.13 * wb + Math.max(0, sinP) * 0.085 * wb + jumpFlap;
      actor.flipperL.rotation.x = -sinP * 0.15 * wb;
    }
    if (actor.flipperR) {
      actor.flipperR.rotation.z = -(0.12 + 0.13 * wb + Math.max(0, -sinP) * 0.085 * wb + jumpFlap);
      actor.flipperR.rotation.x = sinP * 0.15 * wb;
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

  getGroundHeightAt(wx, wz) {
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
      const [modelRoot, penguinTemplate] = await Promise.all([
        this.loadSiteModel(siteId),
        this.loadPenguinActorModel().catch(() => null)
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

      this.marker = createLandingMarker(cfg.landerPos || [0, 0.08, 0]);
      wrapper.add(this.marker.group);

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
    this.penguinActor = null;
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

    this.renderer.render(this.scene, this.camera);
  }

  getStats() {
    return {
      activeSiteId: this.activeSiteId,
      inspectMode: this.inspectMode,
      isPaused: this.isPaused,
      hasCanvas: Boolean(this.canvas && this.container && this.container.contains(this.canvas)),
      meshCount: this.terrainMeshes.length,
      webglFailed: this.webglFailed
    };
  }
}

const instance = new Terrain3DController();
window.CYBERPENGUINS_TERRAIN_3D = instance;
window.dispatchEvent(new CustomEvent('cyberpenguins:terrain3d-ready'));
