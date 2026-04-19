// PBR material factory for primitive items (items with a `material` hint
// in the catalog but no GLTF modelUrl). Textures come in a follow-up
// (ambientcg CC0 set); for now each factory returns a plain
// MeshStandardMaterial with sensible roughness/metalness per category.
//
// Consumers pass a `color` (default per category if omitted) so custom-
// coloured catalog items still drive through the factory.

import { MeshStandardMaterial, DoubleSide } from 'three';

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
}

const SPECS: Record<MaterialKey, MaterialSpec> = {
  wood:     { defaultColor: 0xc8a572, roughness: 0.65, metalness: 0.02 },
  metal:    { defaultColor: 0x888888, roughness: 0.25, metalness: 0.80 },
  fabric:   { defaultColor: 0x444466, roughness: 0.95, metalness: 0.00 },
  plastic:  { defaultColor: 0x333333, roughness: 0.50, metalness: 0.00 },
  glass:    { defaultColor: 0x88ccff, roughness: 0.02, metalness: 0.00, transparent: true, opacity: 0.35, doubleSide: true },
  concrete: { defaultColor: 0x888880, roughness: 0.90, metalness: 0.00 },
};

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

// Convenience aliases for call sites that want named factories.
export const woodMaterial     = (c?: number) => makeMaterial('wood', c);
export const metalMaterial    = (c?: number) => makeMaterial('metal', c);
export const fabricMaterial   = (c?: number) => makeMaterial('fabric', c);
export const plasticMaterial  = (c?: number) => makeMaterial('plastic', c);
export const glassMaterial    = (c?: number) => makeMaterial('glass', c);
export const concreteMaterial = (c?: number) => makeMaterial('concrete', c);
