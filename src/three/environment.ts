// P3.3 lighting polish: HDRI environment maps + ACES tone-map + soft shadows.
//
// Every WebGLRenderer in the legacy scene gets ACESFilmicToneMapping +
// PCFSoftShadowMap via applyRendererDefaults(). HDRI is loaded async and
// converted to a PMREM environment map (faster sampling than raw cubemap).
//
// Two bundled HDRIs (Poly Haven CC0):
//   /hdri/indoor.hdr   — studio_small_08 (neutral studio key light)
//   /hdri/evening.hdr  — dikhololo_night  (warm-dim evening mood)
//
// Fallback: if the HDRI fetch 404s / is blocked, fallbackEnvironment()
// uses Three's built-in RoomEnvironment — procedural, zero-network. Gives
// PBR materials something to reflect without the network dependency.

import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  PMREMGenerator,
  Vector2,
  type Camera,
  type Scene,
  type Texture,
  type WebGLRenderer,
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const _rgbeLoader = new RGBELoader();
const _envCache = new Map<string, Texture>();

export function applyRendererDefaults(renderer: WebGLRenderer): void {
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
}

export async function loadEnvironment(
  renderer: WebGLRenderer,
  url: string,
): Promise<Texture> {
  const cached = _envCache.get(url);
  if (cached) return cached;
  return new Promise<Texture>((resolve, reject) => {
    _rgbeLoader.load(
      url,
      (hdrTex) => {
        const pmrem = new PMREMGenerator(renderer);
        const envMap = pmrem.fromEquirectangular(hdrTex).texture;
        hdrTex.dispose();
        pmrem.dispose();
        _envCache.set(url, envMap);
        resolve(envMap);
      },
      undefined,
      (err) => reject(err),
    );
  });
}

export function applyEnvironment(scene: Scene, envMap: Texture): void {
  scene.environment = envMap;
  // Intentionally NOT setting scene.background here — the legacy scene has
  // its own sky-sphere / colored background, and overwriting it with the
  // HDRI would fight the user-chosen mood preset. The envMap drives PBR
  // reflections only.
}

export function fallbackEnvironment(renderer: WebGLRenderer, scene: Scene): void {
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
}

/**
 * Create an EffectComposer with a RenderPass + UnrealBloomPass. The bloom
 * settings (strength 0.4, radius 0.6, threshold 0.95) are intentionally
 * conservative — only actual emissive materials (matLED, chandelier
 * glows, exit-sign faces) exceed the threshold. Bright plain colors
 * don't trigger false blooming.
 *
 * Callers hold onto the returned composer and call `.render()` in the
 * animation loop instead of `renderer.render(scene, camera)`. Resize
 * via `composer.setSize(w, h)`.
 */
export function createComposer(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    0.4, // strength — zurückhaltend, damit es nicht übertrieben wirkt
    0.6, // radius
    0.95, // threshold — nur echte emissive-Lichter, keine hellen Farben
  );
  composer.addPass(bloom);
  return composer;
}

/** Tune a directional / sun light for large-scene soft shadows. */
export function tuneSunShadow(sun: {
  castShadow: boolean;
  shadow: {
    mapSize: { width: number; height: number };
    camera: { near: number; far: number; left: number; right: number; top: number; bottom: number };
    bias: number;
    normalBias: number;
  };
}): void {
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 50;
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 15;
  sun.shadow.camera.bottom = -15;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
}
