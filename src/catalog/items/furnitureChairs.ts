import type { CatalogItem } from '../types.js';

const BASE = import.meta.env.BASE_URL + 'models/kenney/furniture/chairs/';
const ATTR = 'Kenney Furniture Kit 2.0 — CC0';

export const CHAIRS: CatalogItem[] = [
  { id: 'kn-chair',          cat: '🪑 Stühle', icon: '🪑', name: 'Stuhl einfach',       w: 0.5, d: 0.5, h: 0.9, modelUrl: BASE + 'chair.glb',                  modelAttribution: ATTR },
  { id: 'kn-chair-cushion',  cat: '🪑 Stühle', icon: '🪑', name: 'Stuhl gepolstert',    w: 0.5, d: 0.55, h: 0.9, modelUrl: BASE + 'chairCushion.glb',          modelAttribution: ATTR },
  { id: 'kn-chair-desk',     cat: '🪑 Stühle', icon: '💺', name: 'Bürostuhl',           w: 0.55, d: 0.55, h: 1.0, modelUrl: BASE + 'chairDesk.glb',            modelAttribution: ATTR },
  { id: 'kn-chair-mod-cush', cat: '🪑 Stühle', icon: '🪑', name: 'Designstuhl gepolstert', w: 0.55, d: 0.55, h: 0.85, modelUrl: BASE + 'chairModernCushion.glb',   modelAttribution: ATTR },
  { id: 'kn-chair-mod-frm',  cat: '🪑 Stühle', icon: '🪑', name: 'Designstuhl Gestell', w: 0.55, d: 0.55, h: 0.85, modelUrl: BASE + 'chairModernFrameCushion.glb', modelAttribution: ATTR },
  { id: 'kn-chair-rounded',  cat: '🪑 Stühle', icon: '🪑', name: 'Stuhl rund',          w: 0.55, d: 0.55, h: 0.85, modelUrl: BASE + 'chairRounded.glb',          modelAttribution: ATTR },
  { id: 'kn-lounge-chair',   cat: '🪑 Stühle', icon: '🛋', name: 'Lounge-Sessel',       w: 0.8, d: 0.85, h: 0.9, modelUrl: BASE + 'loungeChair.glb',            modelAttribution: ATTR },
  { id: 'kn-lounge-design',  cat: '🪑 Stühle', icon: '🛋', name: 'Lounge-Design-Sessel',w: 0.85, d: 0.85, h: 0.9, modelUrl: BASE + 'loungeDesignChair.glb',     modelAttribution: ATTR },
];
