import type { CatalogItem } from '../types.js';

const KN = import.meta.env.BASE_URL + 'models/kenney/furniture/plants-deco/';
const QN = import.meta.env.BASE_URL + 'models/quaternius/interior/';
const KENNEY = 'Kenney Furniture Kit 2.0 — CC0';
const QUATERNIUS = 'Quaternius via Poly Pizza — CC0';

export const PLANTS_DECO: CatalogItem[] = [
  // Kenney plants/rugs/lamps/trashcan
  { id: 'kn-plant-1',      cat: '🌱 Pflanzen & Deko', icon: '🌱', name: 'Pflanze klein 1', w: 0.25, d: 0.25, h: 0.3, modelUrl: KN + 'plantSmall1.glb',     modelAttribution: KENNEY },
  { id: 'kn-plant-2',      cat: '🌱 Pflanzen & Deko', icon: '🌿', name: 'Pflanze klein 2', w: 0.25, d: 0.25, h: 0.35, modelUrl: KN + 'plantSmall2.glb',    modelAttribution: KENNEY },
  { id: 'kn-plant-3',      cat: '🌱 Pflanzen & Deko', icon: '🍀', name: 'Pflanze klein 3', w: 0.25, d: 0.25, h: 0.4, modelUrl: KN + 'plantSmall3.glb',     modelAttribution: KENNEY },
  { id: 'kn-potted-plant', cat: '🌱 Pflanzen & Deko', icon: '🪴', name: 'Topf-Pflanze',    w: 0.4, d: 0.4, h: 1.0, modelUrl: KN + 'pottedPlant.glb',       modelAttribution: KENNEY },
  { id: 'kn-rug-round',    cat: '🌱 Pflanzen & Deko', icon: '⭕', name: 'Teppich rund',    w: 1.5, d: 1.5, h: 0.02, modelUrl: KN + 'rugRound.glb',        modelAttribution: KENNEY },
  { id: 'kn-rug-rect',     cat: '🌱 Pflanzen & Deko', icon: '▬', name: 'Teppich rechteckig', w: 2.0, d: 1.2, h: 0.02, modelUrl: KN + 'rugRectangle.glb', modelAttribution: KENNEY },
  { id: 'kn-trashcan',     cat: '🌱 Pflanzen & Deko', icon: '🗑', name: 'Mülleimer',       w: 0.3, d: 0.3, h: 0.5, modelUrl: KN + 'trashcan.glb',          modelAttribution: KENNEY },
  // Quaternius plants
  { id: 'qn-houseplant',   cat: '🌱 Pflanzen & Deko', icon: '🪴', name: 'Zimmerpflanze', w: 0.4, d: 0.4, h: 0.9, modelUrl: QN + 'houseplant.glb',           modelAttribution: QUATERNIUS },
  { id: 'qn-houseplant-2', cat: '🌱 Pflanzen & Deko', icon: '🪴', name: 'Zimmerpflanze 2', w: 0.4, d: 0.4, h: 0.9, modelUrl: QN + 'houseplant-IBLX2Jz90O.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-houseplant-3', cat: '🌱 Pflanzen & Deko', icon: '🪴', name: 'Zimmerpflanze 3', w: 0.4, d: 0.4, h: 0.9, modelUrl: QN + 'houseplant-VtJh4Irl4w.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-houseplant-4', cat: '🌱 Pflanzen & Deko', icon: '🪴', name: 'Zimmerpflanze 4', w: 0.4, d: 0.4, h: 0.9, modelUrl: QN + 'houseplant-bfLOqIV5uP.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-houseplant-5', cat: '🌱 Pflanzen & Deko', icon: '🪴', name: 'Zimmerpflanze 5', w: 0.4, d: 0.4, h: 0.9, modelUrl: QN + 'houseplant-dveIJ0xNpX.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-houseplant-6', cat: '🌱 Pflanzen & Deko', icon: '🪴', name: 'Zimmerpflanze 6', w: 0.4, d: 0.4, h: 0.9, modelUrl: QN + 'houseplant-f6GPjbEgg0.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-cactus',       cat: '🌱 Pflanzen & Deko', icon: '🌵', name: 'Kaktus',          w: 0.3, d: 0.3, h: 0.6, modelUrl: QN + 'cactus.glb',              modelAttribution: QUATERNIUS },
  { id: 'qn-dead-plant',   cat: '🌱 Pflanzen & Deko', icon: '🥀', name: 'Vertrocknete Pflanze', w: 0.3, d: 0.3, h: 0.7, modelUrl: QN + 'dead-houseplant.glb', modelAttribution: QUATERNIUS },
  // Quaternius decoration
  { id: 'qn-rug',          cat: '🌱 Pflanzen & Deko', icon: '▬', name: 'Teppich',         w: 2.0, d: 1.2, h: 0.02, modelUrl: QN + 'rug.glb',                modelAttribution: QUATERNIUS },
  { id: 'qn-round-rug',    cat: '🌱 Pflanzen & Deko', icon: '⭕', name: 'Teppich rund',    w: 1.5, d: 1.5, h: 0.02, modelUrl: QN + 'round-rug.glb',         modelAttribution: QUATERNIUS },
  { id: 'qn-fireplace',    cat: '🌱 Pflanzen & Deko', icon: '🔥', name: 'Kamin',           w: 1.2, d: 0.5, h: 1.2, modelUrl: QN + 'fireplace.glb',           modelAttribution: QUATERNIUS },
  { id: 'qn-column',       cat: '🌱 Pflanzen & Deko', icon: '🏛', name: 'Säule rund',      w: 0.4, d: 0.4, h: 3.0, modelUrl: QN + 'column-round.glb',       modelAttribution: QUATERNIUS },
  { id: 'qn-curtains',     cat: '🌱 Pflanzen & Deko', icon: '🪟', name: 'Vorhänge',        w: 1.4, d: 0.1, h: 2.2, modelUrl: QN + 'curtains-double.glb',    modelAttribution: QUATERNIUS },
  // Quaternius trashcans
  { id: 'qn-trash-sm',     cat: '🌱 Pflanzen & Deko', icon: '🗑', name: 'Mülleimer klein', w: 0.25, d: 0.25, h: 0.4, modelUrl: QN + 'trashcan-small.glb',   modelAttribution: QUATERNIUS },
  { id: 'qn-trash-sm-2',   cat: '🌱 Pflanzen & Deko', icon: '🗑', name: 'Mülleimer klein 2', w: 0.25, d: 0.25, h: 0.4, modelUrl: QN + 'trashcan-small-ZWYTK2SmBA.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-trash-lg',     cat: '🌱 Pflanzen & Deko', icon: '🗑', name: 'Mülleimer groß',  w: 0.4, d: 0.4, h: 0.7, modelUrl: QN + 'trashcan-large.glb',      modelAttribution: QUATERNIUS },
  { id: 'qn-trash',        cat: '🌱 Pflanzen & Deko', icon: '🗑', name: 'Mülleimer',       w: 0.3, d: 0.3, h: 0.5, modelUrl: QN + 'trashcan.glb',            modelAttribution: QUATERNIUS },
  { id: 'qn-trash-alt',    cat: '🌱 Pflanzen & Deko', icon: '🗑', name: 'Mülleimer Variante', w: 0.3, d: 0.3, h: 0.5, modelUrl: QN + 'trashcan-vlVx279xut.glb', modelAttribution: QUATERNIUS },
];
