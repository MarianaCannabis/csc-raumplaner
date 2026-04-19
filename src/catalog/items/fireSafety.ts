import type { CatalogItem } from '../types.js';

// Brandschutz-Ergänzungen, die im Legacy-BUILTIN fehlen. Der Großteil
// (Rauchmelder, Feuerlöscher, Sprinkler, RWA, Sign-Exit, Emlight) liegt
// dort bereits — hier nur echt neue Items.
export const FIRE_SAFETY: CatalogItem[] = [
  { id: 'csc-fire-blanket',   cat: '🔥 Brandschutz+', icon: '🟥', name: 'Löschdecke im Behälter', w: 0.4, d: 0.05, h: 0.4, col: 0xdd3333, material: 'fabric' },
  { id: 'csc-fire-hose-cab',  cat: '🔥 Brandschutz+', icon: '💧', name: 'Wandhydrant-Schrank (DIN 14461)', w: 0.7, d: 0.25, h: 1.2, col: 0xdd3333, material: 'metal' },
  { id: 'csc-ext-co2',        cat: '🔥 Brandschutz+', icon: '🧯', name: 'CO₂-Löscher 5kg',        w: 0.18, d: 0.18, h: 0.6, col: 0x111111, material: 'metal' },
];
