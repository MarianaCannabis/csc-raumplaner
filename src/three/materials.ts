// PBR material factories for P3.2 rich-primitive builders.
//
// Each base material (matWood, matMetal, matFabric, matPlastic, matConcrete)
// loads Color + Normal + Roughness maps from ambientCG CC0 sets in
// public/textures/ambientcg/<kind>/. Textures load async via TextureLoader
// and cache in _texCache — every matWood() call shares the same three
// Texture instances, so 50 oak meshes = 3 HTTP requests total.
//
// Glass, LED, leather stay procedural:
//   matGlassPhys — physical-transmission (IOR 1.5, 90% transmission); a
//     photographed glass surface is less correct than clean optics.
//   matLED — purely emissive, texture would dilute the glow.
//   matLeather — clearcoat, no ambientCG Leather set in the curated batch.
//
// Also exports a sync non-textured API (makeMaterial) for callers that
// want a flat MeshStandardMaterial without PBR maps.

import {
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  DoubleSide,
  TextureLoader,
  RepeatWrapping,
  ClampToEdgeWrapping,
  SRGBColorSpace,
} from 'three';
import type { Texture } from 'three';
import type { GroundMaterial } from '../catalog/grounds.js';

// =============================================================================
// Texture loader + cache
// =============================================================================

const _loader = new TextureLoader();
const _texCache = new Map<string, Texture>();

function tex(url: string, repeat: number = 2, isColor: boolean = false): Texture {
  const cached = _texCache.get(url);
  if (cached) return cached;
  const t = _loader.load(url);
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.repeat.set(repeat, repeat);
  if (isColor) t.colorSpace = SRGBColorSpace;
  _texCache.set(url, t);
  return t;
}

const BASE = import.meta.env.BASE_URL + 'textures/ambientcg/';

function pbrMaps(kind: string, repeat: number) {
  return {
    map: tex(BASE + kind + '/color.jpg', repeat, true),
    normalMap: tex(BASE + kind + '/normal.jpg', repeat, false),
    roughnessMap: tex(BASE + kind + '/roughness.jpg', repeat, false),
  };
}

// =============================================================================
// Textured PBR factories (primary API for builders)
// =============================================================================

export const matWood = (col = 0xffffff) => new MeshStandardMaterial({
  color: col, ...pbrMaps('wood', 2), metalness: 0.0,
});

export const matMetal = (col = 0xffffff) => new MeshStandardMaterial({
  color: col, ...pbrMaps('metal', 1), metalness: 1.0,
});

export const matFabric = (col = 0xffffff) => new MeshPhysicalMaterial({
  color: col, ...pbrMaps('fabric', 3), metalness: 0.0,
  sheen: 1.0, sheenColor: 0x6b7a8a, sheenRoughness: 0.5,
});

export const matPlastic = (col = 0xffffff) => new MeshStandardMaterial({
  color: col, ...pbrMaps('plastic', 1), metalness: 0.0,
});

export const matConcrete = (col = 0xffffff) => new MeshStandardMaterial({
  color: col, ...pbrMaps('concrete', 2), metalness: 0.0,
});

// =============================================================================
// Procedural factories (no texture set / intentionally clean)
// =============================================================================

export const matGlassPhys = (col = 0xaaccdd) => new MeshPhysicalMaterial({
  color: col, transparent: true, opacity: 0.3,
  roughness: 0.0, metalness: 0.0, transmission: 0.9, ior: 1.5,
});

export const matLED = (col = 0xffffff) => new MeshStandardMaterial({
  // P7 Bug-4-Fix: emissiveIntensity 1.5 → 2.0, damit UnrealBloomPass bei
  // threshold 0.85 zuverlässig auslöst. LED-Wand + Exit-Signs glühen sichtbar.
  color: col, emissive: col, emissiveIntensity: 2.0, roughness: 1.0,
});

export const matLeather = (col = 0x4a2a1a) => new MeshPhysicalMaterial({
  color: col, roughness: 0.6, metalness: 0.0, clearcoat: 0.3, clearcoatRoughness: 0.5,
});

// =============================================================================
// Untextured-material API (kept for callers that don't want PBR maps)
// =============================================================================

export type MaterialKey =
  | 'wood'
  | 'metal'
  | 'fabric'
  | 'plastic'
  | 'glass'
  | 'concrete';

interface FlatSpec {
  defaultColor: number;
  roughness: number;
  metalness: number;
  transparent?: boolean;
  opacity?: number;
  doubleSide?: boolean;
}

const FLAT_SPECS: Record<MaterialKey, FlatSpec> = {
  wood:     { defaultColor: 0xc8a572, roughness: 0.65, metalness: 0.02 },
  metal:    { defaultColor: 0x888888, roughness: 0.25, metalness: 0.80 },
  fabric:   { defaultColor: 0x444466, roughness: 0.95, metalness: 0.00 },
  plastic:  { defaultColor: 0x333333, roughness: 0.50, metalness: 0.00 },
  glass:    { defaultColor: 0x88ccff, roughness: 0.02, metalness: 0.00, transparent: true, opacity: 0.35, doubleSide: true },
  concrete: { defaultColor: 0x888880, roughness: 0.90, metalness: 0.00 },
};

export function makeMaterial(kind: MaterialKey, colorOverride?: number): MeshStandardMaterial {
  const spec = FLAT_SPECS[kind];
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

// =============================================================================
// Ground-plane factory (P4.1)
// =============================================================================

/**
 * Build a PBR material for a ground plane. If the GroundMaterial has a
 * textureFolder, the ambientCG set at public/textures/ambientcg/<folder>/ is
 * loaded and tinted with `tintOverride ?? mat.tint`. Without a textureFolder
 * (e.g. the 'plain' material), returns a flat-color MeshStandardMaterial.
 *
 * The ground-material's `repeat` value wins over the per-base-material repeat
 * so large outdoor grounds don't end up with postage-stamp textures. Since
 * tex() caches by URL, two grounds sharing the same folder share one Texture
 * instance — fine as long as one repeat setting is acceptable site-wide. If
 * that ever becomes a problem, bust the cache by URL suffix.
 */
// =============================================================================
// Image-map material (P4.2) — user-uploaded image on a flat surface
// =============================================================================

export type ImageAspect = 'contain' | 'cover' | 'stretch';

const _imageTexCache = new Map<string, Texture>();

/**
 * Build a MeshStandardMaterial backed by a user-uploaded image. Accepts a
 * data URL from processUpload() (or any URL the browser can load via
 * TextureLoader). The aspect parameter controls UV mapping for the target
 * plane geometry. Callers size the plane — this factory only handles
 * texture wrap/filter setup.
 *
 * Caching by URL means a reloaded project with 5 duplicate banners pulls
 * one Texture, not five. Cache invalidates implicitly when the user swaps
 * the image (new data URL = new cache key).
 */
export function imageMapMaterial(dataUrl: string, aspect: ImageAspect = 'cover'): MeshStandardMaterial {
  const cached = _imageTexCache.get(dataUrl);
  let texture: Texture;
  if (cached) {
    texture = cached;
  } else {
    texture = _loader.load(dataUrl);
    texture.colorSpace = SRGBColorSpace;
    // 'stretch' distorts the image to exactly fill the UVs (no repeat).
    // 'contain'/'cover' both use clamp-to-edge so the edge pixel extends
    // past the frame without wrap artefacts. The actual contain-vs-cover
    // difference lives in UV math on the plane geometry in each builder.
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    _imageTexCache.set(dataUrl, texture);
  }
  return new MeshStandardMaterial({
    map: texture,
    roughness: 0.9,
    metalness: 0,
    side: DoubleSide,
  });
}

/** Drop a single image URL from the texture cache. Call when removing an
 *  imageMap from an object so the next upload creates a fresh texture. */
export function disposeImageMapTexture(dataUrl: string): void {
  const t = _imageTexCache.get(dataUrl);
  if (t) {
    t.dispose();
    _imageTexCache.delete(dataUrl);
  }
}

export function loadGroundMaterial(mat: GroundMaterial, tintOverride?: number): MeshStandardMaterial {
  const color = tintOverride ?? mat.tint;
  if (!mat.textureFolder) {
    return new MeshStandardMaterial({
      color,
      roughness: mat.roughness,
      metalness: mat.metalness,
    });
  }
  const folderBase = BASE + mat.textureFolder + '/';
  return new MeshStandardMaterial({
    color,
    map: tex(folderBase + 'color.jpg', mat.repeat, true),
    normalMap: tex(folderBase + 'normal.jpg', mat.repeat, false),
    roughnessMap: tex(folderBase + 'roughness.jpg', mat.repeat, false),
    metalness: mat.metalness,
  });
}
