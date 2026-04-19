import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3, type Group } from 'three';

// Shared loader instance — GLTFLoader is stateless per-call, safe to reuse.
const loader = new GLTFLoader();

// Promise cache so the same modelUrl is fetched/parsed only once. The cached
// promise resolves to the ORIGINAL scene; every loadModel() caller gets a
// `clone(true)` so scene graphs don't share mutable transforms or meshes.
const cache = new Map<string, Promise<Group>>();

export interface LoadedModel {
  scene: Group;
  /** Source URL — handy for debug logs and cache-invalidation. */
  url: string;
}

export function loadModel(url: string): Promise<LoadedModel> {
  let promise = cache.get(url);
  if (!promise) {
    promise = new Promise<Group>((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(gltf.scene),
        undefined,
        (err) => reject(err),
      );
    });
    cache.set(url, promise);
  }
  return promise.then((scene) => ({ scene: scene.clone(true), url }));
}

/**
 * Scale a loaded model uniformly so its bounding box fits within the given
 * catalog-item dimensions (meters). Uses the smallest axis ratio so the
 * model shrinks to fit without stretching. Recentres so the bottom of the
 * bounding box sits at y=0 and x/z are centred — matches the origin
 * convention of primitive furniture in build3DObj().
 */
export function fitToBounds(
  scene: Group,
  target: { w: number; d: number; h: number },
): void {
  const box = new Box3().setFromObject(scene);
  const size = new Vector3();
  box.getSize(size);
  if (size.x === 0 || size.y === 0 || size.z === 0) return;
  const sx = target.w / size.x;
  const sy = target.h / size.y;
  const sz = target.d / size.z;
  const s = Math.min(sx, sy, sz);
  scene.scale.setScalar(s);
  // Recompute box after scaling so we can recentre against the final size.
  const newBox = new Box3().setFromObject(scene);
  const center = new Vector3();
  newBox.getCenter(center);
  scene.position.sub(new Vector3(center.x, newBox.min.y, center.z));
}
