import type { CatalogItem } from '../types.js';

const QN = import.meta.env.BASE_URL + 'models/quaternius/interior/';
const QUATERNIUS = 'Quaternius via Poly Pizza — CC0';

// Tür-Varianten neben den at-std/at-sec/at-schiebe etc. im Legacy-BUILTIN.
// RC3/T30/T90 sind CSC-Primitive mit arch:'door' → buildDoor3D.
// Quaternius-Varianten liefern Low-Poly-GLTFs für visuelle Abwechslung.
export const DOORS: CatalogItem[] = [
  // CSC-Primitive (aus P3.2a)
  { id: 'at-rc3', cat: '🚪 Türen+', icon: '🔒', name: 'Sicherheitstür RC3 (widerstandsfähiger als RC2)', w: 1.0, d: 0.22, h: 2.2, col: 0x2a2a2a, arch: 'door', material: 'metal' },
  { id: 'at-t30', cat: '🚪 Türen+', icon: '🟧', name: 'Brandschutztür T30 (EI2 30-C)', w: 1.0, d: 0.08, h: 2.1, col: 0x8a6030, arch: 'door', material: 'wood' },
  { id: 'at-t90', cat: '🚪 Türen+', icon: '🟥', name: 'Brandschutztür T90 (EI2 90-C)', w: 1.0, d: 0.10, h: 2.1, col: 0x3a3a3a, arch: 'door', material: 'metal' },
  // Quaternius — visuelle Tür-Varianten (Low-Poly)
  { id: 'qn-door',        cat: '🚪 Türen+', icon: '🚪', name: 'Tür Low-Poly',          w: 1.0, d: 0.15, h: 2.1, modelUrl: QN + 'door.glb',                modelAttribution: QUATERNIUS },
  { id: 'qn-door-2',      cat: '🚪 Türen+', icon: '🚪', name: 'Tür Variante 2',        w: 1.0, d: 0.15, h: 2.1, modelUrl: QN + 'door-8it1hH1oRu.glb',     modelAttribution: QUATERNIUS },
  { id: 'qn-door-3',      cat: '🚪 Türen+', icon: '🚪', name: 'Tür Variante 3',        w: 1.0, d: 0.15, h: 2.1, modelUrl: QN + 'door-KGt4ztcKrM.glb',     modelAttribution: QUATERNIUS },
  { id: 'qn-door-4',      cat: '🚪 Türen+', icon: '🚪', name: 'Tür Variante 4',        w: 1.0, d: 0.15, h: 2.1, modelUrl: QN + 'door-TOMs7NG2FG.glb',     modelAttribution: QUATERNIUS },
  { id: 'qn-door-5',      cat: '🚪 Türen+', icon: '🚪', name: 'Tür Variante 5',        w: 1.0, d: 0.15, h: 2.1, modelUrl: QN + 'door-atrxVW0q9N.glb',     modelAttribution: QUATERNIUS },
  { id: 'qn-door-6',      cat: '🚪 Türen+', icon: '🚪', name: 'Tür Variante 6',        w: 1.0, d: 0.15, h: 2.1, modelUrl: QN + 'door-b0AIfzp6VL.glb',     modelAttribution: QUATERNIUS },
  { id: 'qn-door-7',      cat: '🚪 Türen+', icon: '🚪', name: 'Tür Variante 7',        w: 1.0, d: 0.15, h: 2.1, modelUrl: QN + 'door-ihXwSN12P1.glb',     modelAttribution: QUATERNIUS },
  { id: 'qn-door-8',      cat: '🚪 Türen+', icon: '🚪', name: 'Tür Variante 8',        w: 1.0, d: 0.15, h: 2.1, modelUrl: QN + 'door-xuFNaNLzfE.glb',     modelAttribution: QUATERNIUS },
  { id: 'qn-door-double', cat: '🚪 Türen+', icon: '🚪', name: 'Doppeltür (Low-Poly)',  w: 1.8, d: 0.15, h: 2.1, modelUrl: QN + 'door-double.glb',          modelAttribution: QUATERNIUS },
];
