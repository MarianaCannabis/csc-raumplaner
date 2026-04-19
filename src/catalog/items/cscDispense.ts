import type { CatalogItem } from '../types.js';

// CSC-Ausgabebereich: Theke, Beratung, Kasse, Warteschlange.
export const CSC_DISPENSE: CatalogItem[] = [
  { id: 'csc-theke-klein',  cat: '🏪 Ausgabe', icon: '🧾', name: 'Ausgabetheke kompakt (1,2m)', w: 1.2, d: 0.6, h: 0.95, col: 0xc8a572, material: 'wood' },
  { id: 'csc-theke-lang',   cat: '🏪 Ausgabe', icon: '🧾', name: 'Ausgabetheke lang (2,5m)',     w: 2.5, d: 0.7, h: 0.95, col: 0xc8a572, material: 'wood' },
  { id: 'csc-beratung-tbl', cat: '🏪 Ausgabe', icon: '🪑', name: 'Beratungsplatz mit 2 Stühlen',  w: 1.6, d: 0.8, h: 0.75, col: 0x8a6030, material: 'wood' },
  { id: 'csc-wait-row-3',   cat: '🏪 Ausgabe', icon: '🪑', name: 'Warteraum-Bank 3er',           w: 1.8, d: 0.5, h: 0.9, col: 0x444466, material: 'fabric' },
  { id: 'csc-kasse',        cat: '🏪 Ausgabe', icon: '💶', name: 'Münzkasse / Geldlade',         w: 0.3, d: 0.35, h: 0.15, col: 0x888888, material: 'metal' },
  { id: 'csc-tablet-halter',cat: '🏪 Ausgabe', icon: '📱', name: 'Tablet-Halter für Theke',      w: 0.25, d: 0.15, h: 0.4, col: 0x2a2a2a, material: 'metal' },
  { id: 'csc-display-menu', cat: '🏪 Ausgabe', icon: '📋', name: 'Digital-Menü-Display',         w: 0.8, d: 0.05, h: 1.2, col: 0x111111, material: 'plastic' },
  { id: 'csc-queue-post',   cat: '🏪 Ausgabe', icon: '🚧', name: 'Warteschlangen-Pfosten (Gurt)', w: 0.1, d: 0.1, h: 1.0, col: 0x888888, material: 'metal' },
];
