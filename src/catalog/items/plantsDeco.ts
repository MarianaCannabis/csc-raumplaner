import type { CatalogItem } from '../types.js';

const BASE = import.meta.env.BASE_URL + 'models/kenney/furniture/plants-deco/';
const ATTR = 'Kenney Furniture Kit 2.0 — CC0';

export const PLANTS_DECO: CatalogItem[] = [
  { id: 'kn-plant-1',      cat: '🌱 Pflanzen & Deko', icon: '🌱', name: 'Pflanze klein 1', w: 0.25, d: 0.25, h: 0.3, modelUrl: BASE + 'plantSmall1.glb',     modelAttribution: ATTR },
  { id: 'kn-plant-2',      cat: '🌱 Pflanzen & Deko', icon: '🌿', name: 'Pflanze klein 2', w: 0.25, d: 0.25, h: 0.35, modelUrl: BASE + 'plantSmall2.glb',    modelAttribution: ATTR },
  { id: 'kn-plant-3',      cat: '🌱 Pflanzen & Deko', icon: '🍀', name: 'Pflanze klein 3', w: 0.25, d: 0.25, h: 0.4, modelUrl: BASE + 'plantSmall3.glb',     modelAttribution: ATTR },
  { id: 'kn-potted-plant', cat: '🌱 Pflanzen & Deko', icon: '🪴', name: 'Topf-Pflanze',    w: 0.4, d: 0.4, h: 1.0, modelUrl: BASE + 'pottedPlant.glb',       modelAttribution: ATTR },
  { id: 'kn-rug-round',    cat: '🌱 Pflanzen & Deko', icon: '⭕', name: 'Teppich rund',    w: 1.5, d: 1.5, h: 0.02, modelUrl: BASE + 'rugRound.glb',        modelAttribution: ATTR },
  { id: 'kn-rug-rect',     cat: '🌱 Pflanzen & Deko', icon: '▬', name: 'Teppich rechteckig', w: 2.0, d: 1.2, h: 0.02, modelUrl: BASE + 'rugRectangle.glb', modelAttribution: ATTR },
  { id: 'kn-lamp-floor-r', cat: '🌱 Pflanzen & Deko', icon: '💡', name: 'Stehlampe rund',  w: 0.35, d: 0.35, h: 1.6, modelUrl: BASE + 'lampRoundFloor.glb', modelAttribution: ATTR },
  { id: 'kn-lamp-floor-sq',cat: '🌱 Pflanzen & Deko', icon: '💡', name: 'Stehlampe eckig', w: 0.35, d: 0.35, h: 1.6, modelUrl: BASE + 'lampSquareFloor.glb', modelAttribution: ATTR },
  { id: 'kn-lamp-wall',    cat: '🌱 Pflanzen & Deko', icon: '💡', name: 'Wandlampe',       w: 0.2, d: 0.2, h: 0.3, modelUrl: BASE + 'lampWall.glb',          modelAttribution: ATTR },
  { id: 'kn-trashcan',     cat: '🌱 Pflanzen & Deko', icon: '🗑', name: 'Mülleimer',       w: 0.3, d: 0.3, h: 0.5, modelUrl: BASE + 'trashcan.glb',          modelAttribution: ATTR },
];
