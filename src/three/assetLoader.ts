// P3.2a Phase G: lazy-load Three.js + GLTFLoader. Vite splits them into a
// separate chunk — projects that never place a GLTF item (only legacy
// primitives) don't pay the 240 KB download cost for Three core.
//
// Cache layer (Promise-per-URL) stays in place so concurrent placements of
// the same catalog item fetch/parse once.

import type { Group } from 'three';

// Module-level cached constructors + loader. Populated on first ensureLoaded()
// call and reused thereafter. Typed loosely to avoid pulling `three` into the
// synchronous import graph — fitToBounds only runs AFTER loadModel in
// practice (build3DObj chains them), so by then these are warm.
let _Box3Ctor: any = null;
let _Vector3Ctor: any = null;
let _loader: any = null;
let _ensurePromise: Promise<void> | null = null;

async function ensureLoaded(): Promise<void> {
  if (_loader && _Box3Ctor && _Vector3Ctor) return;
  if (_ensurePromise) return _ensurePromise;
  _ensurePromise = (async () => {
    const [three, loaderMod] = await Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
    ]);
    _Box3Ctor = three.Box3;
    _Vector3Ctor = three.Vector3;
    _loader = new loaderMod.GLTFLoader();
  })();
  return _ensurePromise;
}

const cache = new Map<string, Promise<Group>>();

export interface LoadedModel {
  scene: Group;
  /** Source URL — debug + cache-invalidation. */
  url: string;
}

export async function loadModel(url: string): Promise<LoadedModel> {
  await ensureLoaded();
  let promise = cache.get(url);
  if (!promise) {
    promise = new Promise<Group>((resolve, reject) => {
      _loader.load(
        url,
        (gltf: { scene: Group }) => resolve(gltf.scene),
        undefined,
        (err: unknown) => reject(err),
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
 * convention of primitive furniture in build3DObj.
 *
 * Precondition: ensureLoaded() must have completed (i.e., at least one
 * loadModel() call has run). Safe no-op if called too early.
 */
export function fitToBounds(
  scene: Group,
  target: { w: number; d: number; h: number },
): void {
  if (!_Box3Ctor || !_Vector3Ctor) return;
  const box = new _Box3Ctor().setFromObject(scene);
  const size = new _Vector3Ctor();
  box.getSize(size);
  if (size.x === 0 || size.y === 0 || size.z === 0) return;
  const sx = target.w / size.x;
  const sy = target.h / size.y;
  const sz = target.d / size.z;
  const s = Math.min(sx, sy, sz);
  scene.scale.setScalar(s);
  const newBox = new _Box3Ctor().setFromObject(scene);
  const center = new _Vector3Ctor();
  newBox.getCenter(center);
  scene.position.sub(new _Vector3Ctor(center.x, newBox.min.y, center.z));
}
