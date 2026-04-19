import type { CatalogItem } from '../types.js';

const BASE = import.meta.env.BASE_URL + 'models/kenney/furniture/kitchen/';
const ATTR = 'Kenney Furniture Kit 2.0 — CC0';

export const KITCHEN: CatalogItem[] = [
  { id: 'kn-kitchen-bar',         cat: '🍳 Küche', icon: '🧱', name: 'Küchen-Tresen',       w: 1.2, d: 0.6, h: 0.9, modelUrl: BASE + 'kitchenBar.glb',           modelAttribution: ATTR },
  { id: 'kn-kitchen-cab',         cat: '🍳 Küche', icon: '🗄', name: 'Unterschrank',        w: 0.6, d: 0.6, h: 0.85, modelUrl: BASE + 'kitchenCabinet.glb',      modelAttribution: ATTR },
  { id: 'kn-kitchen-cab-drawer',  cat: '🍳 Küche', icon: '🗄', name: 'Unterschrank Schubladen', w: 0.6, d: 0.6, h: 0.85, modelUrl: BASE + 'kitchenCabinetDrawer.glb', modelAttribution: ATTR },
  { id: 'kn-kitchen-cab-upper',   cat: '🍳 Küche', icon: '🗄', name: 'Hängeschrank',        w: 0.6, d: 0.35, h: 0.7, modelUrl: BASE + 'kitchenCabinetUpper.glb',  modelAttribution: ATTR },
  { id: 'kn-kitchen-coffee',      cat: '🍳 Küche', icon: '☕', name: 'Kaffeemaschine',      w: 0.3, d: 0.3, h: 0.4, modelUrl: BASE + 'kitchenCoffeeMachine.glb', modelAttribution: ATTR },
  { id: 'kn-kitchen-fridge',      cat: '🍳 Küche', icon: '🧊', name: 'Kühlschrank',         w: 0.65, d: 0.65, h: 1.8, modelUrl: BASE + 'kitchenFridge.glb',      modelAttribution: ATTR },
  { id: 'kn-kitchen-microwave',   cat: '🍳 Küche', icon: '📡', name: 'Mikrowelle',          w: 0.5, d: 0.4, h: 0.3, modelUrl: BASE + 'kitchenMicrowave.glb',    modelAttribution: ATTR },
  { id: 'kn-kitchen-sink',        cat: '🍳 Küche', icon: '🚰', name: 'Spülbecken',          w: 0.8, d: 0.6, h: 0.85, modelUrl: BASE + 'kitchenSink.glb',        modelAttribution: ATTR },
  { id: 'kn-kitchen-stove',       cat: '🍳 Küche', icon: '🔥', name: 'Herd',                w: 0.6, d: 0.6, h: 0.9, modelUrl: BASE + 'kitchenStove.glb',        modelAttribution: ATTR },
  { id: 'kn-kitchen-blender',     cat: '🍳 Küche', icon: '🥤', name: 'Mixer',               w: 0.2, d: 0.2, h: 0.4, modelUrl: BASE + 'kitchenBlender.glb',      modelAttribution: ATTR },
];
