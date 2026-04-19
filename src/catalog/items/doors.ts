import type { CatalogItem } from '../types.js';

// Spezialisierte Tür-Varianten, die neben at-std/at-sec/at-schiebe etc. im
// Legacy-BUILTIN fehlen. Alle mit arch:'door' → rendern über buildDoor3D.
export const DOORS: CatalogItem[] = [
  { id: 'at-rc3',       cat: '🚪 Türen+', icon: '🔒', name: 'Sicherheitstür RC3 (widerstandsfähiger als RC2)', w: 1.0, d: 0.22, h: 2.2, col: 0x2a2a2a, arch: 'door', material: 'metal' },
  { id: 'at-t30',       cat: '🚪 Türen+', icon: '🟧', name: 'Brandschutztür T30 (EI2 30-C)', w: 1.0, d: 0.08, h: 2.1, col: 0x8a6030, arch: 'door', material: 'wood' },
  { id: 'at-t90',       cat: '🚪 Türen+', icon: '🟥', name: 'Brandschutztür T90 (EI2 90-C)', w: 1.0, d: 0.10, h: 2.1, col: 0x3a3a3a, arch: 'door', material: 'metal' },
];
