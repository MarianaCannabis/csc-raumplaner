import type { CatalogItem } from '../types.js';

const KN = import.meta.env.BASE_URL + 'models/kenney/furniture/office/';
const QN = import.meta.env.BASE_URL + 'models/quaternius/interior/';
const KENNEY = 'Kenney Furniture Kit 2.0 — CC0';
const QUATERNIUS = 'Quaternius via Poly Pizza — CC0';

export const OFFICE: CatalogItem[] = [
  // Kenney
  { id: 'kn-desk',         cat: '💼 Büro', icon: '🗃', name: 'Schreibtisch',           w: 1.4, d: 0.7, h: 0.75, modelUrl: KN + 'desk.glb',            modelAttribution: KENNEY },
  { id: 'kn-desk-corner',  cat: '💼 Büro', icon: '🗃', name: 'Eck-Schreibtisch',       w: 1.6, d: 1.6, h: 0.75, modelUrl: KN + 'deskCorner.glb',      modelAttribution: KENNEY },
  { id: 'kn-pc-keyboard',  cat: '💼 Büro', icon: '⌨️', name: 'Tastatur',               w: 0.45, d: 0.18, h: 0.03, modelUrl: KN + 'computerKeyboard.glb', modelAttribution: KENNEY },
  { id: 'kn-pc-mouse',     cat: '💼 Büro', icon: '🖱', name: 'Maus',                   w: 0.12, d: 0.07, h: 0.04, modelUrl: KN + 'computerMouse.glb',    modelAttribution: KENNEY },
  { id: 'kn-pc-screen',    cat: '💼 Büro', icon: '🖥', name: 'Monitor',                w: 0.6, d: 0.2, h: 0.45, modelUrl: KN + 'computerScreen.glb',   modelAttribution: KENNEY },
  { id: 'kn-laptop',       cat: '💼 Büro', icon: '💻', name: 'Laptop',                 w: 0.38, d: 0.28, h: 0.03, modelUrl: KN + 'laptop.glb',          modelAttribution: KENNEY },
  // Quaternius — shelves, drawers, nightstands
  { id: 'qn-shelf-large',  cat: '💼 Büro', icon: '🗄', name: 'Regal groß',             w: 1.2, d: 0.35, h: 2.0, modelUrl: QN + 'shelf-large.glb',        modelAttribution: QUATERNIUS },
  { id: 'qn-shelf-small',  cat: '💼 Büro', icon: '🗄', name: 'Regal klein',            w: 0.8, d: 0.3, h: 1.2, modelUrl: QN + 'shelf-small.glb',        modelAttribution: QUATERNIUS },
  { id: 'qn-shelf-small-2',cat: '💼 Büro', icon: '🗄', name: 'Regal klein 2',          w: 0.8, d: 0.3, h: 1.2, modelUrl: QN + 'shelf-small-TfdgUV2RYe.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-drawer',       cat: '💼 Büro', icon: '🗄', name: 'Kommode',                w: 0.8, d: 0.45, h: 0.85, modelUrl: QN + 'drawer.glb',            modelAttribution: QUATERNIUS },
  { id: 'qn-drawer-2',     cat: '💼 Büro', icon: '🗄', name: 'Kommode 2',              w: 0.8, d: 0.45, h: 0.85, modelUrl: QN + 'drawer-8xZQEZL2w3.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-drawer-3',     cat: '💼 Büro', icon: '🗄', name: 'Kommode 3',              w: 0.8, d: 0.45, h: 0.85, modelUrl: QN + 'drawer-G1H0wnCHQf.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-drawer-4',     cat: '💼 Büro', icon: '🗄', name: 'Kommode 4',              w: 0.8, d: 0.45, h: 0.85, modelUrl: QN + 'drawer-N3ERi89OeO.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-drawer-5',     cat: '💼 Büro', icon: '🗄', name: 'Kommode 5',              w: 0.8, d: 0.45, h: 0.85, modelUrl: QN + 'drawer-T4uDbyP90C.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-nightstand',   cat: '💼 Büro', icon: '🗄', name: 'Nachttisch',             w: 0.4, d: 0.4, h: 0.5, modelUrl: QN + 'night-stand.glb',          modelAttribution: QUATERNIUS },
  { id: 'qn-nightstand-2', cat: '💼 Büro', icon: '🗄', name: 'Nachttisch 2',           w: 0.4, d: 0.4, h: 0.5, modelUrl: QN + 'night-stand-08S1j15Jcx.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-nightstand-3', cat: '💼 Büro', icon: '🗄', name: 'Nachttisch 3',           w: 0.4, d: 0.4, h: 0.5, modelUrl: QN + 'night-stand-7cobkfclNv.glb', modelAttribution: QUATERNIUS },
];
