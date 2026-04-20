// Catalog item shape for the TS side. Mirrors the legacy BUILTIN[] entries in
// index.html with one addition: `modelUrl` points at a GLB/GLTF file served
// from /public so build3DObj() can swap the primitive with a real mesh.
//
// Fields the legacy uses that we don't need in TS yet (e.g. isKallax,
// winStyle, doorStyle, col3d) are left out — add them when a rule or metric
// actually reads them.

export interface CatalogItem {
  id: string;
  cat: string;
  icon: string;
  name: string;
  w: number;
  d: number;
  h: number;
  /** Fallback primitive colour (0xRRGGBB) when no modelUrl is set. */
  col?: number;
  /** Legacy dispatch tag: 'door' | 'window' | 'security' | 'wall-item' | … */
  arch?: string;
  /** If set, build3DObj loads a GLTF asset from this URL and swaps the
   *  primitive mesh. Relative to the Vite base path; use
   *  `import.meta.env.BASE_URL + 'models/...'` to resolve at build time. */
  modelUrl?: string;
  /** Licence / creator credit string — surfaced in the Credits modal. */
  modelAttribution?: string;
  /** Optional Euler rotation in radians [x,y,z] applied after fitToBounds. */
  modelRotation?: [number, number, number];
  /** PBR material hint for primitive items — picked up by the materials
   *  factory when the item has no modelUrl (falls back to `col` otherwise). */
  material?: 'wood' | 'metal' | 'fabric' | 'plastic' | 'glass' | 'concrete';
  /** P4.2: Marks this item as supporting a user-uploaded image on one of
   *  its faces. When set, the property-panel shows a file-upload control
   *  and the instance gets a per-object `imageMap` data URL. The value
   *  names which face the image lands on (builder-specific). */
  imageMapFace?: 'front' | 'back' | 'top' | 'bottom' | 'both_sides';
  /** P4.2: How the image fits the target plane — 'cover' fills the quad
   *  cropping overflow, 'contain' fits inside with bars, 'stretch' distorts
   *  to exact bounds. Default 'cover'. */
  imageMapAspect?: 'contain' | 'cover' | 'stretch';
}
