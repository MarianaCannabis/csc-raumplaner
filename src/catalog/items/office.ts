import type { CatalogItem } from '../types.js';

const BASE = import.meta.env.BASE_URL + 'models/kenney/furniture/office/';
const ATTR = 'Kenney Furniture Kit 2.0 — CC0';

export const OFFICE: CatalogItem[] = [
  { id: 'kn-desk',         cat: '💼 Büro', icon: '🗃', name: 'Schreibtisch',           w: 1.4, d: 0.7, h: 0.75, modelUrl: BASE + 'desk.glb',            modelAttribution: ATTR },
  { id: 'kn-desk-corner',  cat: '💼 Büro', icon: '🗃', name: 'Eck-Schreibtisch',       w: 1.6, d: 1.6, h: 0.75, modelUrl: BASE + 'deskCorner.glb',      modelAttribution: ATTR },
  { id: 'kn-pc-keyboard',  cat: '💼 Büro', icon: '⌨️', name: 'Tastatur',               w: 0.45, d: 0.18, h: 0.03, modelUrl: BASE + 'computerKeyboard.glb', modelAttribution: ATTR },
  { id: 'kn-pc-mouse',     cat: '💼 Büro', icon: '🖱', name: 'Maus',                   w: 0.12, d: 0.07, h: 0.04, modelUrl: BASE + 'computerMouse.glb',    modelAttribution: ATTR },
  { id: 'kn-pc-screen',    cat: '💼 Büro', icon: '🖥', name: 'Monitor',                w: 0.6, d: 0.2, h: 0.45, modelUrl: BASE + 'computerScreen.glb',   modelAttribution: ATTR },
  { id: 'kn-laptop',       cat: '💼 Büro', icon: '💻', name: 'Laptop',                 w: 0.38, d: 0.28, h: 0.03, modelUrl: BASE + 'laptop.glb',          modelAttribution: ATTR },
];
