import type { CatalogItem } from '../types.js';

const KN = import.meta.env.BASE_URL + 'models/kenney/furniture/kitchen/';
const QN = import.meta.env.BASE_URL + 'models/quaternius/interior/';
const KENNEY = 'Kenney Furniture Kit 2.0 — CC0';
const QUATERNIUS = 'Quaternius via Poly Pizza — CC0';

export const KITCHEN: CatalogItem[] = [
  // Kenney
  { id: 'kn-kitchen-bar',         cat: '🍳 Küche', icon: '🧱', name: 'Küchen-Tresen',       w: 1.2, d: 0.6, h: 0.9, modelUrl: KN + 'kitchenBar.glb',           modelAttribution: KENNEY },
  { id: 'kn-kitchen-cab',         cat: '🍳 Küche', icon: '🗄', name: 'Unterschrank',        w: 0.6, d: 0.6, h: 0.85, modelUrl: KN + 'kitchenCabinet.glb',      modelAttribution: KENNEY },
  { id: 'kn-kitchen-cab-drawer',  cat: '🍳 Küche', icon: '🗄', name: 'Unterschrank Schubladen', w: 0.6, d: 0.6, h: 0.85, modelUrl: KN + 'kitchenCabinetDrawer.glb', modelAttribution: KENNEY },
  { id: 'kn-kitchen-cab-upper',   cat: '🍳 Küche', icon: '🗄', name: 'Hängeschrank',        w: 0.6, d: 0.35, h: 0.7, modelUrl: KN + 'kitchenCabinetUpper.glb',  modelAttribution: KENNEY },
  { id: 'kn-kitchen-coffee',      cat: '🍳 Küche', icon: '☕', name: 'Kaffeemaschine',      w: 0.3, d: 0.3, h: 0.4, modelUrl: KN + 'kitchenCoffeeMachine.glb', modelAttribution: KENNEY },
  { id: 'kn-kitchen-fridge',      cat: '🍳 Küche', icon: '🧊', name: 'Kühlschrank',         w: 0.65, d: 0.65, h: 1.8, modelUrl: KN + 'kitchenFridge.glb',      modelAttribution: KENNEY },
  { id: 'kn-kitchen-microwave',   cat: '🍳 Küche', icon: '📡', name: 'Mikrowelle',          w: 0.5, d: 0.4, h: 0.3, modelUrl: KN + 'kitchenMicrowave.glb',    modelAttribution: KENNEY },
  { id: 'kn-kitchen-sink',        cat: '🍳 Küche', icon: '🚰', name: 'Spülbecken',          w: 0.8, d: 0.6, h: 0.85, modelUrl: KN + 'kitchenSink.glb',        modelAttribution: KENNEY },
  { id: 'kn-kitchen-stove',       cat: '🍳 Küche', icon: '🔥', name: 'Herd',                w: 0.6, d: 0.6, h: 0.9, modelUrl: KN + 'kitchenStove.glb',        modelAttribution: KENNEY },
  { id: 'kn-kitchen-blender',     cat: '🍳 Küche', icon: '🥤', name: 'Mixer',               w: 0.2, d: 0.2, h: 0.4, modelUrl: KN + 'kitchenBlender.glb',      modelAttribution: KENNEY },
  // Quaternius
  { id: 'qn-kitchen-fridge',      cat: '🍳 Küche', icon: '🧊', name: 'Kühlschrank (Variante)', w: 0.65, d: 0.65, h: 1.8, modelUrl: QN + 'kitchen-fridge.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-kitchen-sink',        cat: '🍳 Küche', icon: '🚰', name: 'Spülbecken (Variante)', w: 0.8, d: 0.6, h: 0.85, modelUrl: QN + 'kitchen-sink.glb',   modelAttribution: QUATERNIUS },
  { id: 'qn-oven',                cat: '🍳 Küche', icon: '🔥', name: 'Backofen',            w: 0.6, d: 0.6, h: 0.9, modelUrl: QN + 'oven.glb',                modelAttribution: QUATERNIUS },
];
