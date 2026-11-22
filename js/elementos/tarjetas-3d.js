/**
 * Renderizador 3D compartido para las tarjetas de misión del menú inicial
 * (La Luna, Marte, Espacio profundo) utilizando Three.js + modelos .glb reales.
 *
 * Usa un único WebGLRenderer offscreen que rasteriza cada escena 3D y vuelca
 * el fotograma en el `<canvas>` de cada tarjeta sin consumir múltiples contextos WebGL.
 */
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/three/loaders/GLTFLoader.js';
import { KTX2Loader } from '../vendor/three/loaders/KTX2Loader.js';
import { MeshoptDecoder } from '../vendor/three/libs/meshopt_decoder.module.js';

const V_TAG = '20261121bn';

const MODEL_URLS = {
  marsTerrain: 'assets/models/ares-vallis-terrain.glb?v=20261121y',
  sojourner: 'assets/models/sojourner.glb?v=20261121y',
  marsSamples: 'assets/models/mars-samples.glb?v=20261121y',
  phobos: 'assets/models/phobos.glb?v=20261121y',
  lunaTerrain: `assets/models/luna-terrain.glb?v=${V_TAG}`,
  apolloEagle: `assets/models/apollo-eagle.glb?v=${V_TAG}`,
  eros433: `assets/models/eros-433.glb?v=${V_TAG}`,
  nearShoemaker: `assets/models/near-shoemaker.glb?v=${V_TAG}`
};

const TEXTURE_URLS = {
  milkyWay: `assets/textures/via-lactea.jpg?v=${V_TAG}`,
  earth: `assets/textures/tierra-4k.jpg?v=${V_TAG}`,
  earthClouds: `assets/textures/nubes-tierra.jpg?v=${V_TAG}`,
  eros: `assets/textures/eros.jpg?v=${V_TAG}`
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

function createRegolithTextures(seed = 19970704, warmMarsTint = true, repeatCount = 36) {
  const size = 256;
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
  const rand = createSeededRng(seed);

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

      if (warmMarsTint) {
        aData[idx] = Math.round(clampVal(mul * 255, 0, 255));
        aData[idx + 1] = Math.round(clampVal(mul * 251, 0, 255));
        aData[idx + 2] = Math.round(clampVal(mul * 246, 0, 255));
      } else {
        aData[idx] = Math.round(clampVal(mul * 250, 0, 255));
        aData[idx + 1] = Math.round(clampVal(mul * 251, 0, 255));
        aData[idx + 2] = Math.round(clampVal(mul * 255, 0, 255));
      }
      aData[idx + 3] = 255;
    }
  }
  bumpCtx.putImageData(bumpImg, 0, 0);
  albedoCtx.putImageData(albImg, 0, 0);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(repeatCount, repeatCount);
  bumpMap.needsUpdate = true;

  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.wrapS = THREE.RepeatWrapping;
  albedoMap.wrapT = THREE.RepeatWrapping;
  albedoMap.repeat.set(repeatCount, repeatCount);
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

function createEarthAtmosphereRim() {
  const geo = new THREE.SphereGeometry(3.95, 32, 24);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
    uniforms: {
      uGlowColor: { value: new THREE.Color('#60a5fa') }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uGlowColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float rim = pow(clamp(1.0 - max(dot(-vNormal, vViewDir), 0.0), 0.0, 1.0), 3.0);
        gl_FragColor = vec4(uGlowColor, rim * 0.65);
      }
    `
  });
  return new THREE.Mesh(geo, mat);
}

function createSoftContactShadow(radiusX = 1.0, radiusZ = 1.0, opacity = 0.56) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(size * 0.5, size * 0.5, 2, size * 0.5, size * 0.5, size * 0.48);
    grad.addColorStop(0, `rgba(6, 4, 3, ${opacity})`);
    grad.addColorStop(0.55, `rgba(10, 6, 4, ${opacity * 0.42})`);
    grad.addColorStop(1, 'rgba(10, 6, 4, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(radiusX, radiusZ);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 2;
  return mesh;
}

function createScatteredRocks(terrainMeshes, raycaster, downDir, rayOrigin, paletteHex, seed, count = 48) {
  const geo = new THREE.DodecahedronGeometry(1.0, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const n = 1.0 + 0.16 * Math.sin(vx * 3.1 + vy * 2.2) * Math.cos(vz * 2.7 - vx * 1.9);
    pos.setXYZ(i, vx * n, vy * 0.68 * n, vz * n);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0.03
  });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const rand = createSeededRng(seed);
  const dummy = new THREE.Object3D();
  const palette = paletteHex.map((h) => new THREE.Color(h));

  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < 500) {
    attempts += 1;
    const ang = rand() * Math.PI * 2;
    const dist = 1.45 + Math.pow(rand(), 0.72) * 10.5;
    const rx = Math.cos(ang) * dist;
    const rz = Math.sin(ang) * dist - 1.5;
    // Dejar libre la zona central inmediata bajo el héroe
    if (Math.hypot(rx + 0.35, rz - 0.35) < 1.35) continue;

    rayOrigin.set(rx, 24, rz);
    raycaster.set(rayOrigin, downDir);
    const hits = raycaster.intersectObjects(terrainMeshes, false);
    if (!hits || hits.length === 0) continue;

    const groundY = hits[0].point.y;
    const s = 0.05 + Math.pow(rand(), 1.9) * 0.16;
    dummy.position.set(rx, groundY - s * 0.22, rz);
    dummy.rotation.set((rand() - 0.5) * 0.4, rand() * Math.PI * 2, (rand() - 0.5) * 0.4);
    dummy.scale.set(s * (0.85 + rand() * 0.5), s * (0.65 + rand() * 0.45), s * (0.85 + rand() * 0.5));
    dummy.updateMatrix();
    inst.setMatrixAt(placed, dummy.matrix);
    inst.setColorAt(placed, palette[Math.floor(rand() * palette.length)]);
    placed += 1;
  }
  inst.count = placed;
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  return inst;
}

class HomeCards3DController {
  constructor() {
    this.renderer = null;
    this.loader = new GLTFLoader();
    this.ktx2Loader = null;
    if (MeshoptDecoder && typeof this.loader.setMeshoptDecoder === 'function') {
      this.loader.setMeshoptDecoder(MeshoptDecoder);
    }
    this.textureLoader = new THREE.TextureLoader();

    this.textures = new Map();
    this.glbCache = new Map();
    this.cards = new Map();
    this.errors = [];

    this.resizeObserver = null;
    this.rafId = null;
    this.lastRenderAt = 0;
    this.isPaused = true;
    this.webglFailed = false;

    this.raycaster = new THREE.Raycaster();
    this.downDir = new THREE.Vector3(0, -1, 0);
    this.rayOrigin = new THREE.Vector3();

    this._onVisibilityChange = () => {
      if (document.hidden) {
        this.stopLoop();
      } else if (!this.isPaused) {
        this.startLoop();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }
  }

  ensureRenderer() {
    if (this.webglFailed) return false;
    if (this.renderer) return true;
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = 480;
      offscreen.height = 240;

      const renderer = new THREE.WebGLRenderer({
        canvas: offscreen,
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
        preserveDrawingBuffer: true
      });
      renderer.setPixelRatio(1);
      renderer.setSize(480, 240, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;

      try {
        if (typeof KTX2Loader === 'function') {
          this.ktx2Loader = new KTX2Loader()
            .setTranscoderPath('js/vendor/three/libs/basis/')
            .detectSupport(renderer);
          this.loader.setKTX2Loader(this.ktx2Loader);
        }
      } catch (_ktxErr) {
        // Fallback silencioso si no hay soporte KTX2
      }

      this.renderer = renderer;
      return true;
    } catch (err) {
      this.webglFailed = true;
      this.errors.push(`renderer: ${err && err.message ? err.message : String(err)}`);
      return false;
    }
  }

  loadTexture(url) {
    if (this.textures.has(url)) {
      return this.textures.get(url);
    }
    const promise = new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          resolve(tex);
        },
        undefined,
        (err) => reject(err)
      );
    });
    this.textures.set(url, promise);
    return promise;
  }

  loadGlb(url) {
    if (this.glbCache.has(url)) {
      return this.glbCache.get(url);
    }
    const promise = new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => resolve(gltf.scene || new THREE.Group()),
        undefined,
        (err) => {
          this.glbCache.delete(url);
          reject(err);
        }
      );
    });
    this.glbCache.set(url, promise);
    return promise;
  }

  sanitizeMaterials(root, { roughnessMin = 0.22, metalnessMax = 0.22 } = {}) {
    root.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      obj.material.side = THREE.FrontSide;
      const matName = obj.material.name || '';
      if (matName.includes('QuartzGlass') || matName.includes('Optics') || matName.includes('CyanLens')) {
        obj.material.needsUpdate = true;
        return;
      }
      if (typeof obj.material.metalness === 'number') {
        obj.material.metalness = Math.min(obj.material.metalness, metalnessMax);
      }
      if (typeof obj.material.roughness === 'number') {
        obj.material.roughness = Math.max(obj.material.roughness, roughnessMin);
      }
      obj.material.needsUpdate = true;
    });
  }

  sampleTerrainY(terrainMeshes, x, z, fallback = 0) {
    if (!terrainMeshes || terrainMeshes.length === 0) return fallback;
    this.rayOrigin.set(x, 28, z);
    this.raycaster.set(this.rayOrigin, this.downDir);
    const hits = this.raycaster.intersectObjects(terrainMeshes, false);
    if (hits && hits.length > 0) {
      return hits[0].point.y;
    }
    return fallback;
  }

  async buildMarsCardScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xd69d76, 0.0175);

    const sunDir = new THREE.Vector3(-0.56, 0.36, -0.74).normalize();
    const skyDome = createMarsSkyDome(sunDir);
    scene.add(skyDome);

    const hemi = new THREE.HemisphereLight(0xf6dfd0, 0x7a3e26, 1.05);
    scene.add(hemi);
    const sunLight = new THREE.DirectionalLight(0xffe7cf, 2.25);
    sunLight.position.copy(sunDir).multiplyScalar(80);
    scene.add(sunLight);
    const frontFill = new THREE.DirectionalLight(0xfff5e8, 1.25);
    frontFill.position.set(12, 26, 44);
    scene.add(frontFill);
    scene.add(new THREE.AmbientLight(0x9e654e, 0.34));

    const camera = new THREE.PerspectiveCamera(32, 2, 0.15, 280);

    const [terrainSrc, sojournerSrc, samplesSrc, phobosSrc] = await Promise.all([
      this.loadGlb(MODEL_URLS.marsTerrain),
      this.loadGlb(MODEL_URLS.sojourner),
      this.loadGlb(MODEL_URLS.marsSamples),
      this.loadGlb(MODEL_URLS.phobos)
    ]);

    const terrainRoot = terrainSrc.clone(true);
    const regolith = createRegolithTextures(19970704, true, 36);
    const terrainMeshes = [];
    terrainRoot.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: regolith.albedoMap,
        vertexColors: Boolean(obj.geometry && obj.geometry.attributes && obj.geometry.attributes.color),
        roughness: 0.95,
        metalness: 0.02,
        bumpMap: regolith.bumpMap,
        bumpScale: 0.095
      });
      mat.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec2 vTerrainXZ;')
          .replace('#include <begin_vertex>', 'vTerrainXZ = position.xz;\n#include <begin_vertex>');
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', '#include <common>\nvarying vec2 vTerrainXZ;')
          .replace(
            '#include <fog_fragment>',
            '#include <fog_fragment>\n#ifdef USE_FOG\nfloat edgeR = length(vTerrainXZ) / 43.5;\nfloat edgeBlend = smoothstep(0.74, 0.97, edgeR);\ngl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, edgeBlend);\n#endif'
          );
      };
      mat.customProgramCacheKey = () => 'card-mars-radial-fog-v1';
      obj.material = mat;
      terrainMeshes.push(obj);
    });
    scene.add(terrainRoot);

    // Sojourner 3D héroe apoyado con inclinación natural del terreno
    const sojX = -0.35;
    const sojZ = 0.65;
    const sojYaw = -0.68;
    const sojGroundY = this.sampleTerrainY(terrainMeshes, sojX, sojZ, 0);
    const dStep = 0.24;
    const sinY = Math.sin(sojYaw);
    const cosY = Math.cos(sojYaw);
    const hF = this.sampleTerrainY(terrainMeshes, sojX + sinY * dStep, sojZ + cosY * dStep, sojGroundY);
    const hB = this.sampleTerrainY(terrainMeshes, sojX - sinY * dStep, sojZ - cosY * dStep, sojGroundY);
    const hL = this.sampleTerrainY(terrainMeshes, sojX + cosY * dStep, sojZ - sinY * dStep, sojGroundY);
    const hR = this.sampleTerrainY(terrainMeshes, sojX - cosY * dStep, sojZ + sinY * dStep, sojGroundY);

    const sojRoot = sojournerSrc.clone(true);
    this.sanitizeMaterials(sojRoot, { roughnessMin: 0.24, metalnessMax: 0.22 });
    const sojRig = sojRoot.getObjectByName('SojournerRoot') || sojRoot;
    sojRig.scale.setScalar(1.38);
    sojRig.position.set(sojX, sojGroundY - 0.015, sojZ);
    sojRig.rotation.set(
      clampVal(Math.atan2(hB - hF, dStep * 2) * 0.72, -0.25, 0.25),
      sojYaw,
      clampVal(Math.atan2(hR - hL, dStep * 2) * 0.72, -0.25, 0.25)
    );
    scene.add(sojRoot);

    const sojShadow = createSoftContactShadow(1.35, 1.55, 0.56);
    sojShadow.position.set(sojX, sojGroundY + 0.015, sojZ);
    sojShadow.rotation.y = sojYaw;
    scene.add(sojShadow);
    const sojAntenna = sojRoot.getObjectByName('Antenna') || null;

    // Rocas emblemáticas Yogi y Barnacle Bill
    const sampleSpecs = [
      { node: 'Yogi', x: 1.95, z: -0.95, scale: 1.55, yaw: -0.65 },
      { node: 'BarnacleBill', x: -1.85, z: 1.45, scale: 0.92, yaw: 0.45 }
    ];
    sampleSpecs.forEach((sp) => {
      const node = samplesSrc.getObjectByName(sp.node);
      if (!node) return;
      const rock = node.clone(true);
      this.sanitizeMaterials(rock, { roughnessMin: 0.65, metalnessMax: 0.08 });
      rock.position.set(0, 0, 0);
      rock.scale.setScalar(sp.scale);
      rock.rotation.set(0, sp.yaw, 0);
      rock.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(rock);
      if (Number.isFinite(box.min.y)) rock.position.y -= box.min.y;
      const gY = this.sampleTerrainY(terrainMeshes, sp.x, sp.z, 0);
      rock.position.x += sp.x;
      rock.position.y += gY - 0.045;
      rock.position.z += sp.z;
      scene.add(rock);

      const rSh = createSoftContactShadow(sp.scale * 1.15, sp.scale * 1.15, 0.48);
      rSh.position.set(sp.x, gY + 0.012, sp.z);
      scene.add(rSh);
    });

    // Guijarros marcianos dispersos
    scene.add(createScatteredRocks(
      terrainMeshes,
      this.raycaster,
      this.downDir,
      this.rayOrigin,
      ['#5b3222', '#703d29', '#49291e', '#864e35'],
      19970704,
      48
    ));

    // Luna marciana Fobos en el cielo
    const phobos = phobosSrc.clone(true);
    const pBox = new THREE.Box3().setFromObject(phobos);
    const pSize = new THREE.Vector3();
    pBox.getSize(pSize);
    const maxDim = Math.max(pSize.x, pSize.y, pSize.z, 0.001);
    phobos.scale.setScalar(1.85 / maxDim);
    phobos.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      obj.material.fog = false;
      obj.material.roughness = 0.96;
      obj.material.metalness = 0.02;
      if (obj.material.color) obj.material.color.set('#e8cfc0');
      if (obj.material.emissive) {
        obj.material.emissive.set('#7a5346');
        obj.material.emissiveIntensity = 0.44;
      }
      obj.material.needsUpdate = true;
    });
    phobos.position.set(-5.4, 4.6, -34.0);
    phobos.rotation.set(0.22, -0.45, -0.16);
    scene.add(phobos);

    const baseCamPos = new THREE.Vector3(-0.78, sojGroundY + 0.86, 3.68);
    const baseTarget = new THREE.Vector3(0.22, sojGroundY + 0.42, -0.65);
    camera.position.copy(baseCamPos);
    camera.lookAt(baseTarget);

    return {
      scene,
      camera,
      animate: (tSec) => {
        camera.position.x = baseCamPos.x + Math.sin(tSec * 0.42) * 0.07;
        camera.position.y = baseCamPos.y + Math.cos(tSec * 0.35) * 0.02;
        camera.lookAt(baseTarget);
        if (sojAntenna) {
          sojAntenna.rotation.z = Math.sin(tSec * 2.1) * 0.022;
          sojAntenna.rotation.x = Math.cos(tSec * 1.7) * 0.016;
        }
        phobos.rotation.y = -0.45 + Math.sin(tSec * 0.12) * 0.14;
      }
    };
  }

  async buildMoonCardScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040710, 0.0085);

    const [milkyWayTex, earthTex, cloudsTex, terrainSrc, eagleSrc] = await Promise.all([
      this.loadTexture(TEXTURE_URLS.milkyWay),
      this.loadTexture(TEXTURE_URLS.earth),
      this.loadTexture(TEXTURE_URLS.earthClouds),
      this.loadGlb(MODEL_URLS.lunaTerrain),
      this.loadGlb(MODEL_URLS.apolloEagle)
    ]);

    // Cúpula estelar fotográfica real 360° de la Vía Láctea
    const skyGeo = new THREE.SphereGeometry(180, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: milkyWayTex,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    // Girar u=0.5 (centro de la Vía Láctea) hacia -Z detrás del paisaje lunar
    skyDome.rotation.set(0.22, Math.PI * 0.52, -0.22);
    scene.add(skyDome);

    // Salida de la Tierra (Earthrise) en 3D sobre el horizonte derecho
    const earthGroup = new THREE.Group();
    earthGroup.position.set(11.8, 7.2, -46.0);
    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.65, 48, 32),
      new THREE.MeshStandardMaterial({
        map: earthTex,
        roughness: 0.84,
        metalness: 0.04,
        fog: false,
        emissive: new THREE.Color('#091933'),
        emissiveIntensity: 0.22
      })
    );
    // Mostrar Américas/Atlántico iluminados hacia cámara
    earthMesh.rotation.y = 0.85;
    earthMesh.rotation.z = 0.24;
    earthGroup.add(earthMesh);

    const cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.72, 48, 32),
      new THREE.MeshStandardMaterial({
        map: cloudsTex,
        transparent: true,
        opacity: 0.56,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false
      })
    );
    cloudsMesh.rotation.y = 1.05;
    earthGroup.add(cloudsMesh);
    scene.add(earthGroup);

    // Iluminación solar en el vacío lunar: sol lateral marcado + luz refleja azul de la Tierra
    const sunKey = new THREE.DirectionalLight(0xfffcf5, 2.55);
    sunKey.position.set(-28, 22, 18);
    scene.add(sunKey);

    const earthShine = new THREE.DirectionalLight(0x9ec5ff, 0.72);
    earthShine.position.set(18, 14, 24);
    scene.add(earthShine);

    scene.add(new THREE.HemisphereLight(0xd1d5db, 0x1e293b, 0.44));

    const camera = new THREE.PerspectiveCamera(32, 2, 0.15, 280);

    // Terreno lunar 3D con regolito real (sin círculos ni marcas dibujadas)
    const terrainRoot = terrainSrc.clone(true);
    const regolith = createRegolithTextures(19690720, false, 40);
    const terrainMeshes = [];
    terrainRoot.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      obj.material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: regolith.albedoMap,
        vertexColors: Boolean(obj.geometry && obj.geometry.attributes && obj.geometry.attributes.color),
        roughness: 0.96,
        metalness: 0.02,
        bumpMap: regolith.bumpMap,
        bumpScale: 0.09
      });
      terrainMeshes.push(obj);
    });
    scene.add(terrainRoot);

    // Guijarros lunares dispersos
    scene.add(createScatteredRocks(
      terrainMeshes,
      this.raycaster,
      this.downDir,
      this.rayOrigin,
      ['#7e848d', '#636972', '#a1a7b0', '#4f555e'],
      19690720,
      46
    ));

    // Módulo Lunar Apollo 11 «Eagle» apoyado firmemente en Mare Tranquillitatis
    const eagleX = -0.35;
    const eagleZ = 0.25;
    const eagleYaw = 0.44;
    const eagleGroundY = this.sampleTerrainY(terrainMeshes, eagleX, eagleZ, 0);

    const eagleRoot = eagleSrc.clone(true);
    this.sanitizeMaterials(eagleRoot, { roughnessMin: 0.22, metalnessMax: 0.22 });
    const eagleRig = eagleRoot.getObjectByName('EagleRoot') || eagleRoot;
    eagleRig.scale.setScalar(1.0);
    eagleRig.position.set(eagleX, eagleGroundY - 0.02, eagleZ);
    eagleRig.rotation.set(0, eagleYaw, 0);
    scene.add(eagleRoot);

    const eagleShadow = createSoftContactShadow(2.85, 2.85, 0.62);
    eagleShadow.position.set(eagleX, eagleGroundY + 0.015, eagleZ);
    scene.add(eagleShadow);

    const baseCamPos = new THREE.Vector3(-0.85, eagleGroundY + 1.55, 5.85);
    const baseTarget = new THREE.Vector3(0.32, eagleGroundY + 1.08, -1.2);
    camera.position.copy(baseCamPos);
    camera.lookAt(baseTarget);

    return {
      scene,
      camera,
      animate: (tSec) => {
        camera.position.x = baseCamPos.x + Math.sin(tSec * 0.36) * 0.065;
        camera.position.y = baseCamPos.y + Math.cos(tSec * 0.28) * 0.02;
        camera.lookAt(baseTarget);
        earthMesh.rotation.y = 0.85 + tSec * 0.025;
        cloudsMesh.rotation.y = 1.05 + tSec * 0.036;
      }
    };
  }

  async buildDeepSpaceCardScene() {
    const scene = new THREE.Scene();

    const [milkyWayTex, erosTex, erosSrc, nearSrc] = await Promise.all([
      this.loadTexture(TEXTURE_URLS.milkyWay),
      this.loadTexture(TEXTURE_URLS.eros),
      this.loadGlb(MODEL_URLS.eros433),
      this.loadGlb(MODEL_URLS.nearShoemaker)
    ]);

    // Cúpula estelar fotográfica real 360° de la Vía Láctea
    const skyGeo = new THREE.SphereGeometry(180, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: milkyWayTex,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    skyDome.rotation.set(0.28, Math.PI * 0.48, -0.32);
    scene.add(skyDome);

    // Iluminación cósmica solar intensa + sutil rebote frío espacial para lectura incluso bloqueada
    const sunKey = new THREE.DirectionalLight(0xfff9ee, 2.75);
    sunKey.position.set(-22, 16, 20);
    scene.add(sunKey);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.62);
    rimLight.position.set(14, -8, -18);
    scene.add(rimLight);

    scene.add(new THREE.AmbientLight(0x3b4963, 0.38));

    const camera = new THREE.PerspectiveCamera(34, 2, 0.15, 280);
    camera.position.set(0.0, 0.28, 4.75);
    camera.lookAt(0.05, 0.02, 0.0);

    // Asteroide 433 Eros con su textura fotográfica real de la NASA (eros.jpg)
    const erosGroup = erosSrc.clone(true);
    erosGroup.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: erosTex,
        bumpMap: erosTex,
        bumpScale: 0.09,
        roughness: 0.94,
        metalness: 0.03
      });
    });
    const baseErosRotY = -0.52;
    erosGroup.position.set(0.95, -0.06, -0.42);
    erosGroup.scale.setScalar(0.92);
    erosGroup.rotation.set(0.24, baseErosRotY, -0.22);
    scene.add(erosGroup);

    // Sonda NEAR Shoemaker en gravedad cero orbitando Eros
    const nearGroup = nearSrc.clone(true);
    this.sanitizeMaterials(nearGroup, { roughnessMin: 0.22, metalnessMax: 0.22 });
    const baseNearPos = new THREE.Vector3(-1.14, 0.12, 1.08);
    nearGroup.position.copy(baseNearPos);
    nearGroup.scale.setScalar(0.74);
    nearGroup.rotation.set(0.28, 0.64, -0.16);
    scene.add(nearGroup);

    return {
      scene,
      camera,
      animate: (tSec) => {
        erosGroup.rotation.y = baseErosRotY + tSec * 0.12;
        nearGroup.position.y = baseNearPos.y + Math.sin(tSec * 1.05) * 0.055;
        nearGroup.rotation.x = 0.28 + Math.sin(tSec * 0.72) * 0.03;
        nearGroup.rotation.z = -0.16 + Math.cos(tSec * 0.64) * 0.03;
      }
    };
  }

  ensureCardEntry(cardId) {
    if (!this.cards.has(cardId)) {
      this.cards.set(cardId, {
        id: cardId,
        canvas: null,
        container: null,
        ready: false,
        loading: false,
        built: null,
        width: 480,
        height: 240
      });
    }
    return this.cards.get(cardId);
  }

  loadCard(cardId) {
    const entry = this.ensureCardEntry(cardId);
    if (entry.ready || entry.loading) return;
    entry.loading = true;

    let builder;
    if (cardId === 'moon') builder = this.buildMoonCardScene();
    else if (cardId === 'mars') builder = this.buildMarsCardScene();
    else builder = this.buildDeepSpaceCardScene();

    builder
      .then((built) => {
        entry.built = built;
        entry.ready = true;
        entry.loading = false;
        this.renderCard(entry, performance.now());
      })
      .catch((err) => {
        entry.loading = false;
        this.errors.push(`${cardId}: ${err && err.message ? err.message : String(err)}`);
      });
  }

  syncCanvasSize(entry) {
    if (!entry.canvas) return;
    const host = entry.container || entry.canvas;
    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rawW = rect.width > 0 ? Math.round(rect.width * dpr) : entry.width;
    const rawH = rect.height > 0 ? Math.round(rect.height * dpr) : entry.height;
    const w = clampVal(rawW, 240, 640);
    const h = clampVal(rawH, 120, 320);

    entry.width = w;
    entry.height = h;
    if (entry.canvas.width !== w) entry.canvas.width = w;
    if (entry.canvas.height !== h) entry.canvas.height = h;
  }

  renderCard(entry, now) {
    if (!this.renderer || !entry || !entry.ready || !entry.built || !entry.canvas) return;
    if (!document.contains(entry.canvas)) return;

    this.syncCanvasSize(entry);
    const w = entry.width;
    const h = entry.height;
    if (w <= 0 || h <= 0) return;

    const { scene, camera, animate } = entry.built;
    if (typeof animate === 'function') {
      animate(now * 0.001);
    }

    const rCanvas = this.renderer.domElement;
    if (rCanvas.width !== w || rCanvas.height !== h) {
      this.renderer.setSize(w, h, false);
    }
    const aspect = w / h;
    if (Math.abs(camera.aspect - aspect) > 0.01) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }

    this.renderer.render(scene, camera);

    const ctx2d = entry.canvas.getContext('2d');
    if (ctx2d) {
      ctx2d.drawImage(rCanvas, 0, 0, w, h);
    }
    if (!entry.canvas.classList.contains('is-ready')) {
      entry.canvas.classList.add('is-ready');
    }
  }

  renderAll(now = performance.now()) {
    this.cards.forEach((entry) => {
      if (entry.ready && entry.canvas) {
        this.renderCard(entry, now);
      }
    });
  }

  mountAll(rootEl) {
    if (!this.ensureRenderer()) return false;
    const scope = rootEl || document;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    } else if (typeof ResizeObserver === 'function') {
      this.resizeObserver = new ResizeObserver((entries) => {
        const now = performance.now();
        entries.forEach((re) => {
          const id = re.target && re.target.getAttribute('data-scene');
          const entry = id ? this.cards.get(id) : null;
          if (entry && entry.ready) {
            this.renderCard(entry, now);
          }
        });
      });
    }

    ['moon', 'mars', 'deep-space'].forEach((cardId) => {
      const container = scope.querySelector(`.chapter-scene[data-scene="${cardId}"]`);
      const canvas = container ? container.querySelector('.chapter-card-3d-canvas') : null;
      const entry = this.ensureCardEntry(cardId);
      entry.container = container;
      entry.canvas = canvas;
      if (container && this.resizeObserver) {
        this.resizeObserver.observe(container);
      }
      if (canvas) {
        this.syncCanvasSize(entry);
        if (entry.ready) {
          this.renderCard(entry, performance.now());
        } else {
          this.loadCard(cardId);
        }
      }
    });

    return true;
  }

  startLoop() {
    if (this.isPaused || this.rafId || !this.renderer || document.hidden) return;
    const tick = (now) => {
      if (this.isPaused || document.hidden) {
        this.rafId = null;
        return;
      }
      if (now - this.lastRenderAt >= 32) {
        this.lastRenderAt = now;
        this.renderAll(now);
      }
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

  pause() {
    this.isPaused = true;
    this.stopLoop();
  }

  resume() {
    if (!this.ensureRenderer()) return;
    this.isPaused = false;
    this.renderAll(performance.now());
    this.startLoop();
  }

  getStats() {
    const readyCards = [];
    this.cards.forEach((entry, id) => {
      if (entry.ready && entry.canvas && entry.canvas.classList.contains('is-ready')) {
        readyCards.push(id);
      }
    });
    return {
      readyCards,
      isPaused: this.isPaused,
      hasRenderer: Boolean(this.renderer),
      webglFailed: this.webglFailed,
      errors: this.errors.slice()
    };
  }
}

const homeCards3D = new HomeCards3DController();
window.CYBERPENGUINS_HOME_CARDS_3D = homeCards3D;
window.dispatchEvent(new CustomEvent('cyberpenguins:homecards3d-ready'));
