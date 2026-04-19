import type { CatalogItem } from '../types.js';

const KN = import.meta.env.BASE_URL + 'models/kenney/furniture/tables/';
const QN = import.meta.env.BASE_URL + 'models/quaternius/interior/';
const KENNEY = 'Kenney Furniture Kit 2.0 — CC0';
const QUATERNIUS = 'Quaternius via Poly Pizza — CC0';

export const TABLES: CatalogItem[] = [
  // Kenney
  { id: 'kn-table',           cat: '🪵 Tische', icon: '🪵', name: 'Tisch rechteckig',  w: 1.4, d: 0.8,  h: 0.75, modelUrl: KN + 'table.glb',              modelAttribution: KENNEY },
  { id: 'kn-table-glass',     cat: '🪵 Tische', icon: '🪟', name: 'Glastisch',         w: 1.4, d: 0.8,  h: 0.75, modelUrl: KN + 'tableGlass.glb',         modelAttribution: KENNEY },
  { id: 'kn-table-round',     cat: '🪵 Tische', icon: '⚪', name: 'Runder Tisch',      w: 1.0, d: 1.0,  h: 0.75, modelUrl: KN + 'tableRound.glb',         modelAttribution: KENNEY },
  { id: 'kn-table-coffee',    cat: '🪵 Tische', icon: '☕', name: 'Couchtisch',        w: 1.0, d: 0.6,  h: 0.4,  modelUrl: KN + 'tableCoffee.glb',        modelAttribution: KENNEY },
  { id: 'kn-table-coffee-gl', cat: '🪵 Tische', icon: '☕', name: 'Glas-Couchtisch',   w: 1.0, d: 0.6,  h: 0.4,  modelUrl: KN + 'tableCoffeeGlass.glb',   modelAttribution: KENNEY },
  { id: 'kn-table-coffee-sq', cat: '🪵 Tische', icon: '☕', name: 'Couchtisch quadr.', w: 0.7, d: 0.7,  h: 0.4,  modelUrl: KN + 'tableCoffeeSquare.glb',  modelAttribution: KENNEY },
  { id: 'kn-table-cross',     cat: '🪵 Tische', icon: '🪵', name: 'Tisch Kreuzfuß',    w: 1.4, d: 0.8,  h: 0.75, modelUrl: KN + 'tableCross.glb',         modelAttribution: KENNEY },
  { id: 'kn-side-table',      cat: '🪵 Tische', icon: '🪵', name: 'Beistelltisch',     w: 0.45, d: 0.45, h: 0.55, modelUrl: KN + 'sideTable.glb',         modelAttribution: KENNEY },
  // Quaternius
  { id: 'qn-tbl-round-lg',    cat: '🪵 Tische', icon: '⚪', name: 'Runder Tisch groß', w: 1.2, d: 1.2,  h: 0.75, modelUrl: QN + 'table-round-large.glb',   modelAttribution: QUATERNIUS },
  { id: 'qn-tbl-round-sm',    cat: '🪵 Tische', icon: '⚪', name: 'Runder Tisch klein', w: 0.7, d: 0.7, h: 0.5, modelUrl: QN + 'table-round-small.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-tbl-round-sm-2',  cat: '🪵 Tische', icon: '⚪', name: 'Runder Tisch klein 2', w: 0.7, d: 0.7, h: 0.5, modelUrl: QN + 'table-round-small-57W671WvS2.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-plate',           cat: '🪵 Tische', icon: '🍽', name: 'Deko-Teller',       w: 0.25, d: 0.25, h: 0.03, modelUrl: QN + 'square-plate.glb',     modelAttribution: QUATERNIUS },
];
