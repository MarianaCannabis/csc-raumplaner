// P4.1 — Ground-material library for the new Flächen (ground-plane) feature.
//
// A GroundMaterial describes a floor surface independent of a Raum (which has
// walls). Grounds are rendered both in 2D (tinted polygon under rooms) and 3D
// (PlaneGeometry on y=0.001 with PBR map).
//
// textureFolder points at public/textures/ambientcg/<slug>/ — the same 3-map
// convention (color.jpg, normal.jpg, roughness.jpg) used by PBR furniture.
// Set to undefined for "plain" — renders as flat color without PBR maps.
//
// tint is the default color; the per-ground `color` field can override it
// (tint is multiplied with the map so 0xffffff = pure texture, 0xcc2222 =
// red-stained texture, etc.).

export interface GroundMaterial {
  id: string;
  label: string;
  icon: string;
  /** Subfolder name under public/textures/ambientcg/. Undefined = no texture (flat color). */
  textureFolder?: string;
  /** Default tint. Multiplied with the diffuse map. */
  tint: number;
  roughness: number;
  metalness: number;
  /** Texture repeat count per metre. Larger tiles = lower value. */
  repeat: number;
}

export const GROUND_MATERIALS: GroundMaterial[] = [
  { id: 'carpet',   label: 'Teppich',      icon: '🟫', textureFolder: 'fabric',   tint: 0x4a5c70, roughness: 0.95, metalness: 0.0, repeat: 2 },
  { id: 'linoleum', label: 'Linoleum',     icon: '⬜', textureFolder: 'plastic',  tint: 0xe0e0e0, roughness: 0.3,  metalness: 0.0, repeat: 1 },
  { id: 'tile',     label: 'Fliesen',      icon: '◼️', textureFolder: 'tiles',    tint: 0xcccccc, roughness: 0.2,  metalness: 0.0, repeat: 2 },
  { id: 'wood',     label: 'Holz/Parkett', icon: '🟤', textureFolder: 'wood',     tint: 0x8b5a2b, roughness: 0.7,  metalness: 0.0, repeat: 2 },
  { id: 'concrete', label: 'Beton',        icon: '⚪', textureFolder: 'concrete', tint: 0xaaaaaa, roughness: 0.85, metalness: 0.0, repeat: 2 },
  { id: 'grass',    label: 'Rasen',        icon: '🟩', textureFolder: 'grass',    tint: 0x3e6b2a, roughness: 1.0,  metalness: 0.0, repeat: 3 },
  { id: 'gravel',   label: 'Schotter',     icon: '🔘', textureFolder: 'gravel',   tint: 0x7a7a6a, roughness: 0.95, metalness: 0.0, repeat: 3 },
  { id: 'dirt',     label: 'Erde',         icon: '🟫', textureFolder: 'dirt',     tint: 0x6b4423, roughness: 1.0,  metalness: 0.0, repeat: 3 },
  { id: 'asphalt',  label: 'Asphalt',      icon: '⬛', textureFolder: 'asphalt',  tint: 0x2a2a2a, roughness: 0.85, metalness: 0.0, repeat: 3 },
  { id: 'rubber',   label: 'Gummi',        icon: '◾', textureFolder: 'plastic',  tint: 0x1a1a1a, roughness: 0.9,  metalness: 0.0, repeat: 2 },
  { id: 'stage',    label: 'Bühne (Holz)', icon: '🎭', textureFolder: 'wood',     tint: 0x4a3020, roughness: 0.6,  metalness: 0.0, repeat: 2 },
  { id: 'plain',    label: 'Einfarbig',    icon: '⬜',                            tint: 0xffffff, roughness: 0.5,  metalness: 0.0, repeat: 1 },
];

export function findGroundMaterial(id: string): GroundMaterial | undefined {
  return GROUND_MATERIALS.find((m) => m.id === id);
}
