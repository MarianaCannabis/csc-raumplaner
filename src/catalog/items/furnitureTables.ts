import type { CatalogItem } from '../types.js';

const BASE = import.meta.env.BASE_URL + 'models/kenney/furniture/tables/';
const ATTR = 'Kenney Furniture Kit 2.0 — CC0';

export const TABLES: CatalogItem[] = [
  { id: 'kn-table',           cat: '🪵 Tische', icon: '🪵', name: 'Tisch rechteckig',  w: 1.4, d: 0.8,  h: 0.75, modelUrl: BASE + 'table.glb',              modelAttribution: ATTR },
  { id: 'kn-table-glass',     cat: '🪵 Tische', icon: '🪟', name: 'Glastisch',         w: 1.4, d: 0.8,  h: 0.75, modelUrl: BASE + 'tableGlass.glb',         modelAttribution: ATTR },
  { id: 'kn-table-round',     cat: '🪵 Tische', icon: '⚪', name: 'Runder Tisch',      w: 1.0, d: 1.0,  h: 0.75, modelUrl: BASE + 'tableRound.glb',         modelAttribution: ATTR },
  { id: 'kn-table-coffee',    cat: '🪵 Tische', icon: '☕', name: 'Couchtisch',        w: 1.0, d: 0.6,  h: 0.4,  modelUrl: BASE + 'tableCoffee.glb',        modelAttribution: ATTR },
  { id: 'kn-table-coffee-gl', cat: '🪵 Tische', icon: '☕', name: 'Glas-Couchtisch',   w: 1.0, d: 0.6,  h: 0.4,  modelUrl: BASE + 'tableCoffeeGlass.glb',   modelAttribution: ATTR },
  { id: 'kn-table-coffee-sq', cat: '🪵 Tische', icon: '☕', name: 'Couchtisch quadr.', w: 0.7, d: 0.7,  h: 0.4,  modelUrl: BASE + 'tableCoffeeSquare.glb',  modelAttribution: ATTR },
  { id: 'kn-table-cross',     cat: '🪵 Tische', icon: '🪵', name: 'Tisch Kreuzfuß',    w: 1.4, d: 0.8,  h: 0.75, modelUrl: BASE + 'tableCross.glb',         modelAttribution: ATTR },
  { id: 'kn-side-table',      cat: '🪵 Tische', icon: '🪵', name: 'Beistelltisch',     w: 0.45, d: 0.45, h: 0.55, modelUrl: BASE + 'sideTable.glb',         modelAttribution: ATTR },
];
