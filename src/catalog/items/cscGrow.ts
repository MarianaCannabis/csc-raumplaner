import type { CatalogItem } from '../types.js';

// CSC-spezifische Anbau-/Eigenanbau-Ausstattung. Reine Primitive mit
// PBR-Material-Hint — keine GLTF-Modelle nötig. Die Standard-Katalog-
// BUILTIN-Liste hat dafür nichts Vergleichbares.
export const CSC_GROW: CatalogItem[] = [
  { id: 'csc-grow-tent-s',  cat: '🌿 Anbau', icon: '🏕', name: 'Grow-Tent klein (60×60×160)',  w: 0.6, d: 0.6, h: 1.6, col: 0x1a1a1a, material: 'fabric' },
  { id: 'csc-grow-tent-m',  cat: '🌿 Anbau', icon: '🏕', name: 'Grow-Tent mittel (120×120×200)', w: 1.2, d: 1.2, h: 2.0, col: 0x1a1a1a, material: 'fabric' },
  { id: 'csc-grow-tent-l',  cat: '🌿 Anbau', icon: '🏕', name: 'Grow-Tent groß (240×120×200)', w: 2.4, d: 1.2, h: 2.0, col: 0x1a1a1a, material: 'fabric' },
  { id: 'csc-led-panel',    cat: '🌿 Anbau', icon: '💡', name: 'LED Grow-Panel (60×60)',      w: 0.6, d: 0.6, h: 0.08, col: 0xaaaaaa, material: 'metal' },
  { id: 'csc-led-bar',      cat: '🌿 Anbau', icon: '💡', name: 'LED Grow-Bar (120cm)',       w: 1.2, d: 0.1, h: 0.08, col: 0xaaaaaa, material: 'metal' },
  { id: 'csc-fan-vent',     cat: '🌿 Anbau', icon: '💨', name: 'Abluftventilator',           w: 0.3, d: 0.3, h: 0.3, col: 0x555555, material: 'metal' },
  { id: 'csc-carbon-filter',cat: '🌿 Anbau', icon: '🫧', name: 'Aktivkohlefilter',           w: 0.25, d: 0.25, h: 0.5, col: 0x666666, material: 'metal' },
  { id: 'csc-climate-ctl',  cat: '🌿 Anbau', icon: '🌡', name: 'Klima-Controller',           w: 0.15, d: 0.08, h: 0.2, col: 0x2a2a2a, material: 'plastic' },
  { id: 'csc-dry-rack',     cat: '🌿 Anbau', icon: '🥬', name: 'Trocknungs-Netz-Rack (6-Ebenen)', w: 0.6, d: 0.6, h: 1.8, col: 0x888888, material: 'metal' },
  { id: 'csc-manicure-tbl', cat: '🌿 Anbau', icon: '🪴', name: 'Maniküre-Tisch (Blütenputz)', w: 1.2, d: 0.6, h: 0.9, col: 0xc8a070, material: 'wood' },
];
