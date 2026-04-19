// PBR material factory for primitive items.
//
// Two tiers:
//
//   makeMaterial(kind, colorOverride?)        — synchronous, untextured.
//     Returns a MeshStandardMaterial with per-kind roughness/metalness
//     defaults. Used by call sites that need a material NOW and can't
//     await. Looks fine under the scene's lighting; less realistic
//     than the textured variant.
//
//   makeMaterialWithTextures(kind, colorOverride?) — async, PBR-textured.
//     Lazy-loads three's TextureLoader on first call, then lazy-loads
//     the ambientCG set for the requested kind. Returns a Promise of
//     a MeshStandardMaterial with color/normal/roughness maps bound.
//     Textures + material instances are cached, so repeated calls for
//     the same kind resolve without reloading.
//
// Texture sets live in public/textures/ambientcg/<kind>/ and are served
// at runtime from the Vite BASE_URL path. All sets are ambientCG CC0.

import { MeshStandardMaterial, DoubleSide } from 'three';
import type { Texture } from 'three';

export type MaterialKey =
  | 'wood'
  | 'metal'
  | 'fabric'
  | 'plastic'
  | 'glass'
  | 'concrete';

interface MaterialSpec {
  defaultColor: number;
  roughness: number;
  metalness: number;
  transparent?: boolean;
  opacity?: number;
  doubleSide?: boolean;
  /** ambientCG texture-set folder under public/textures/ambientcg/.
   *  Missing for 'glass' — glass is best procedural. */
  textureFolder?: string;
  /** UV tile repeat. Higher = more detail per area, less stretch. */
  uvRepeat?: number;
}

const SPECS: Record<MaterialKey, MaterialSpec> = {
  wood:     { defaultColor: 0xc8a572, roughness: 0.65, metalness: 0.02, textureFolder: 'wood050',    uvRepeat: 2 },
  metal:    { defaultColor: 0x888888, roughness: 0.25, metalness: 0.80, textureFolder: 'metal032',   uvRepeat: 2 },
  fabric:   { defaultColor: 0x444466, roughness: 0.95, metalness: 0.00, textureFolder: 'fabric070',  uvRepeat: 3 },
  plastic:  { defaultColor: 0x333333, roughness: 0.50, metalness: 0.00, textureFolder: 'plastic008', uvRepeat: 1 },
  glass:    { defaultColor: 0x88ccff, roughness: 0.02, metalness: 0.00, transparent: true, opacity: 0.35, doubleSide: true },
  concrete: { defaultColor: 0x888880, roughness: 0.90, metalness: 0.00, textureFolder: 'concrete033', uvRepeat: 2 },
};

// -----------------------------------------------------------------------------
// Sync factory (untextured)
// -----------------------------------------------------------------------------

export function makeMaterial(kind: MaterialKey, colorOverride?: number): MeshStandardMaterial {
  const spec = SPECS[kind];
  const mat = new MeshStandardMaterial({
    color: colorOverride ?? spec.defaultColor,
    roughness: spec.roughness,
    metalness: spec.metalness,
  });
  if (spec.transparent) {
    mat.transparent = true;
    mat.opacity = spec.opacity ?? 0.5;
  }
  if (spec.doubleSide) mat.side = DoubleSide;
  return mat;
}

export const woodMaterial     = (c?: number) => makeMaterial('wood', c);
export const metalMaterial    = (c?: number) => makeMaterial('metal', c);
export const fabricMaterial   = (c?: number) => makeMaterial('fabric', c);
export const plasticMaterial  = (c?: number) => makeMaterial('plastic', c);
export const glassMaterial    = (c?: number) => makeMaterial('glass', c);
export const concreteMaterial = (c?: number) => makeMaterial('concrete', c);

// -----------------------------------------------------------------------------
// Async factory (textured)
// -----------------------------------------------------------------------------

interface TextureTriple {
  color: Texture;
  normal: Texture;
  roughness: Texture;
}

let _threeMod: typeof import('three') | null = null;
let _textureLoader: { load(u: string, cb: (t: Texture) => void, onProgress?: any, onError?: (e: unknown) => void): Texture } | null = null;
let _loaderPromise: Promise<void> | null = null;

async function ensureLoader(): Promise<void> {
  if (_textureLoader && _threeMod) return;
  if (_loaderPromise) return _loaderPromise;
  _loaderPromise = (async () => {
    const three = await import('three');
    _threeMod = three;
    _textureLoader = new three.TextureLoader();
  })();
  return _loaderPromise;
}

function loadTextureOnce(url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    _textureLoader!.load(
      url,
      (tex) => resolve(tex),
      undefined,
      (err) => reject(err),
    );
  });
}

const _texCache = new Map<MaterialKey, Promise<TextureTriple>>();

async function loadTextureSet(kind: MaterialKey): Promise<TextureTriple | null> {
  const spec = SPECS[kind];
  if (!spec.textureFolder) return null;
  let pending = _texCache.get(kind);
  if (!pending) {
    pending = (async () => {
      await ensureLoader();
      const base = (import.meta.env.BASE_URL ?? '/') + `textures/ambientcg/${spec.textureFolder}/`;
      const [color, normal, roughness] = await Promise.all([
        loadTextureOnce(base + 'color.jpg'),
        loadTextureOnce(base + 'normal.jpg'),
        loadTextureOnce(base + 'roughness.jpg'),
      ]);
      // Tag the color map as sRGB so Three does the right gamma conversion;
      // normal + roughness stay linear.
      if (_threeMod) {
        color.colorSpace = _threeMod.SRGBColorSpace;
        for (const t of [color, normal, roughness]) {
          t.wrapS = _threeMod.RepeatWrapping;
          t.wrapT = _threeMod.RepeatWrapping;
          const r = spec.uvRepeat ?? 1;
          t.repeat.set(r, r);
        }
      }
      return { color, normal, roughness };
    })();
    _texCache.set(kind, pending);
  }
  return pending;
}

/** Async counterpart to makeMaterial() that attaches PBR textures when
 *  an ambientCG set exists for the requested kind. Falls back to the
 *  untextured material for kinds without a folder (glass). */
export async function makeMaterialWithTextures(
  kind: MaterialKey,
  colorOverride?: number,
): Promise<MeshStandardMaterial> {
  const mat = makeMaterial(kind, colorOverride);
  const triple = await loadTextureSet(kind);
  if (!triple) return mat;
  mat.map = triple.color;
  mat.normalMap = triple.normal;
  mat.roughnessMap = triple.roughness;
  mat.needsUpdate = true;
  return mat;
}
