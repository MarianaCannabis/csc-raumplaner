import type { CatalogItem } from '../types.js';

const KN = import.meta.env.BASE_URL + 'models/kenney/furniture/chairs/';
const QN = import.meta.env.BASE_URL + 'models/quaternius/interior/';
const KENNEY = 'Kenney Furniture Kit 2.0 — CC0';
const QUATERNIUS = 'Quaternius via Poly Pizza — CC0';

export const CHAIRS: CatalogItem[] = [
  // Kenney
  { id: 'kn-chair',          cat: '🪑 Stühle', icon: '🪑', name: 'Stuhl einfach',       w: 0.5, d: 0.5, h: 0.9, modelUrl: KN + 'chair.glb',                  modelAttribution: KENNEY },
  { id: 'kn-chair-cushion',  cat: '🪑 Stühle', icon: '🪑', name: 'Stuhl gepolstert',    w: 0.5, d: 0.55, h: 0.9, modelUrl: KN + 'chairCushion.glb',          modelAttribution: KENNEY },
  { id: 'kn-chair-desk',     cat: '🪑 Stühle', icon: '💺', name: 'Bürostuhl',           w: 0.55, d: 0.55, h: 1.0, modelUrl: KN + 'chairDesk.glb',            modelAttribution: KENNEY },
  { id: 'kn-chair-mod-cush', cat: '🪑 Stühle', icon: '🪑', name: 'Designstuhl gepolstert', w: 0.55, d: 0.55, h: 0.85, modelUrl: KN + 'chairModernCushion.glb',   modelAttribution: KENNEY },
  { id: 'kn-chair-mod-frm',  cat: '🪑 Stühle', icon: '🪑', name: 'Designstuhl Gestell', w: 0.55, d: 0.55, h: 0.85, modelUrl: KN + 'chairModernFrameCushion.glb', modelAttribution: KENNEY },
  { id: 'kn-chair-rounded',  cat: '🪑 Stühle', icon: '🪑', name: 'Stuhl rund',          w: 0.55, d: 0.55, h: 0.85, modelUrl: KN + 'chairRounded.glb',          modelAttribution: KENNEY },
  { id: 'kn-lounge-chair',   cat: '🪑 Stühle', icon: '🛋', name: 'Lounge-Sessel',       w: 0.8, d: 0.85, h: 0.9, modelUrl: KN + 'loungeChair.glb',            modelAttribution: KENNEY },
  { id: 'kn-lounge-design',  cat: '🪑 Stühle', icon: '🛋', name: 'Lounge-Design-Sessel',w: 0.85, d: 0.85, h: 0.9, modelUrl: KN + 'loungeDesignChair.glb',     modelAttribution: KENNEY },
  // Quaternius
  { id: 'qn-chair',          cat: '🪑 Stühle', icon: '🪑', name: 'Stuhl (Low-Poly)',    w: 0.5, d: 0.5, h: 0.9, modelUrl: QN + 'chair.glb',                  modelAttribution: QUATERNIUS },
  { id: 'qn-chair-alt',      cat: '🪑 Stühle', icon: '🪑', name: 'Stuhl Variante',      w: 0.5, d: 0.5, h: 0.9, modelUrl: QN + 'chair-Rlyhe93NNe.glb',       modelAttribution: QUATERNIUS },
  { id: 'qn-stool',          cat: '🪑 Stühle', icon: '🪑', name: 'Hocker',              w: 0.4, d: 0.4, h: 0.5, modelUrl: QN + 'stool.glb',                  modelAttribution: QUATERNIUS },
];
