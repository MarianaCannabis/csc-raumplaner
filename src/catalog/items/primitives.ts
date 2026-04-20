import type { CatalogItem } from '../types.js';
import { MESSE_ITEMS } from './messe.js';

// Rich primitives: items that render via a named builder in
// src/three/primitiveBuilders.ts instead of GLTF or the legacy default
// box. No external asset dependencies; 100% procedural PBR geometry.
export interface PrimitiveCatalogItem extends CatalogItem {
  /** Key in BUILDER_MAP — e.g. 'buildOfficeChair'. */
  builder: string;
}

// Re-export so legacy callers pulling RICH_PRIMITIVES get Messe items too.
export { MESSE_ITEMS };

export const RICH_PRIMITIVES: PrimitiveCatalogItem[] = [
  // ── Büro ─────────────────────────────────────────────────────────
  { id: 'p-office-chair',    cat: '💼 Büro (Rich)',   icon: '🪑', name: 'Bürostuhl (5-Stern, Gas)',    w: 0.6, d: 0.6, h: 0.95, builder: 'buildOfficeChair' },
  { id: 'p-desk',            cat: '💼 Büro (Rich)',   icon: '🗃', name: 'Schreibtisch',                w: 1.4, d: 0.7, h: 0.75, builder: 'buildDesk' },
  { id: 'p-filing-cabinet',  cat: '💼 Büro (Rich)',   icon: '🗄', name: 'Aktenschrank (3 Schubl.)',    w: 0.5, d: 0.55, h: 1.3, builder: 'buildFilingCabinet' },
  { id: 'p-bookshelf',       cat: '💼 Büro (Rich)',   icon: '📚', name: 'Bücherregal',                 w: 0.9, d: 0.35, h: 2.0, builder: 'buildBookshelf' },
  { id: 'p-conf-table',      cat: '💼 Büro (Rich)',   icon: '🪵', name: 'Konferenztisch rund',         w: 1.6, d: 1.6, h: 0.74, builder: 'buildConferenceTable' },
  { id: 'p-whiteboard',      cat: '💼 Büro (Rich)',   icon: '📋', name: 'Whiteboard',                  w: 1.5, d: 0.05, h: 0.9, builder: 'buildWhiteboard' },

  // ── Empfang / Ausgabe ────────────────────────────────────────────
  { id: 'p-reception',       cat: '🏪 Empfang (Rich)',icon: '🧾', name: 'Empfangstheke',               w: 2.0, d: 0.7, h: 1.05, builder: 'buildReceptionDesk' },
  { id: 'p-dispense-counter',cat: '🏪 Empfang (Rich)',icon: '🧪', name: 'Ausgabetheke mit Vitrine',    w: 2.5, d: 0.8, h: 1.05, builder: 'buildDispensingCounter' },
  { id: 'p-consult-booth',   cat: '🏪 Empfang (Rich)',icon: '🤝', name: 'Beratungs-Kabine (3-Wand)',   w: 1.6, d: 1.6, h: 2.0, builder: 'buildConsultingBooth' },
  { id: 'p-wait-bench',      cat: '🏪 Empfang (Rich)',icon: '🪑', name: 'Wartebank (4-Sitzer)',        w: 2.0, d: 0.5, h: 0.85, builder: 'buildWaitingBench' },
  { id: 'p-locker-row',      cat: '🏪 Empfang (Rich)',icon: '🗄', name: 'Spind-Reihe (4 Fächer)',      w: 1.4, d: 0.4, h: 1.8, builder: 'buildLockerRow' },

  // ── CSC-Anbau ────────────────────────────────────────────────────
  { id: 'p-grow-tent-s',     cat: '🌿 Anbau (Rich)',  icon: '🏕', name: 'Grow-Tent klein (60×60)',     w: 0.6, d: 0.6, h: 1.4, builder: 'buildGrowTent' },
  { id: 'p-grow-tent-m',     cat: '🌿 Anbau (Rich)',  icon: '🏕', name: 'Grow-Tent mittel (120×120)',  w: 1.2, d: 1.2, h: 2.0, builder: 'buildGrowTent' },
  { id: 'p-grow-tent-l',     cat: '🌿 Anbau (Rich)',  icon: '🏕', name: 'Grow-Tent groß (240×120)',    w: 2.4, d: 1.2, h: 2.0, builder: 'buildGrowTent' },
  { id: 'p-drying-rack',     cat: '🌿 Anbau (Rich)',  icon: '🥬', name: 'Trocknungs-Rack (6 Tiers)',   w: 0.6, d: 0.6, h: 1.8, builder: 'buildDryingRack' },
  { id: 'p-led-grow',        cat: '🌿 Anbau (Rich)',  icon: '💡', name: 'LED-Grow-Panel',              w: 0.8, d: 0.8, h: 0.15, builder: 'buildLedGrowLight' },
  { id: 'p-vent-fan',        cat: '🌿 Anbau (Rich)',  icon: '💨', name: 'Abluft-Ventilator',           w: 0.3, d: 0.25, h: 0.3, builder: 'buildVentilationFan' },
  { id: 'p-harvest-bin',     cat: '🌿 Anbau (Rich)',  icon: '🪣', name: 'Erntebehälter mit Deckel',    w: 0.5, d: 0.4, h: 0.4, builder: 'buildHarvestBin' },
  { id: 'p-storage-cabinet', cat: '🌿 Anbau (Rich)',  icon: '🗄', name: 'Lager-Schrank 2-türig',       w: 0.8, d: 0.45, h: 1.8, builder: 'buildStorageCabinet' },

  // ── Sicherheit ───────────────────────────────────────────────────
  { id: 'p-safe-box',        cat: '🔐 Sicherheit (Rich)', icon: '🔒', name: 'Tresor (Zahlenschloss)',  w: 0.5, d: 0.5, h: 0.6, builder: 'buildSafeBox' },
  { id: 'p-cam-dome',        cat: '🔐 Sicherheit (Rich)', icon: '📷', name: 'Dome-Kamera',             w: 0.15, d: 0.15, h: 0.1, builder: 'buildDomeCamera' },
  { id: 'p-cam-bullet',      cat: '🔐 Sicherheit (Rich)', icon: '📷', name: 'Bullet-Kamera',           w: 0.08, d: 0.2, h: 0.15, builder: 'buildBulletCamera' },
  { id: 'p-motion-sensor',   cat: '🔐 Sicherheit (Rich)', icon: '🚨', name: 'Bewegungsmelder (PIR)',   w: 0.1, d: 0.06, h: 0.08, builder: 'buildMotionSensor' },
  { id: 'p-alarm-panel',     cat: '🔐 Sicherheit (Rich)', icon: '⚠️', name: 'Alarm-Bedienpanel',       w: 0.2, d: 0.05, h: 0.25, builder: 'buildAlarmPanel' },
  { id: 'p-fire-ext',        cat: '🔐 Sicherheit (Rich)', icon: '🧯', name: 'Feuerlöscher (Schaum)',   w: 0.15, d: 0.15, h: 0.6, builder: 'buildFireExtinguisher' },
  { id: 'p-smoke-det',       cat: '🔐 Sicherheit (Rich)', icon: '🔔', name: 'Rauchmelder (Decke)',     w: 0.12, d: 0.12, h: 0.04, builder: 'buildSmokeDetector' },
  { id: 'p-exit-sign',       cat: '🔐 Sicherheit (Rich)', icon: '🚪', name: 'Notausgang-Schild',       w: 0.4, d: 0.04, h: 0.2, builder: 'buildExitSign' },

  // ── Sozial / Küche ───────────────────────────────────────────────
  { id: 'p-sofa-2',          cat: '🛋 Sozial (Rich)', icon: '🛋', name: 'Sofa 2-Sitzer',               w: 1.8, d: 0.9, h: 0.85, builder: 'buildSofaModule' },
  { id: 'p-sofa-3',          cat: '🛋 Sozial (Rich)', icon: '🛋', name: 'Sofa 3-Sitzer',               w: 2.4, d: 0.9, h: 0.85, builder: 'buildSofaModule' },
  { id: 'p-coffee-table',    cat: '🛋 Sozial (Rich)', icon: '☕', name: 'Couchtisch Glas',             w: 1.1, d: 0.6, h: 0.4, builder: 'buildCoffeeTable' },
  { id: 'p-kitchen-counter', cat: '🍳 Küche (Rich)',  icon: '🧱', name: 'Küchenzeile Unterschrank',    w: 1.2, d: 0.6, h: 0.85, builder: 'buildKitchenCounter' },
  { id: 'p-fridge',          cat: '🍳 Küche (Rich)',  icon: '🧊', name: 'Kühlschrank (French Door)',   w: 0.7, d: 0.7, h: 1.8, builder: 'buildFridge' },
  { id: 'p-sink',            cat: '🍳 Küche (Rich)',  icon: '🚰', name: 'Spülbecken (Edelstahl)',      w: 0.8, d: 0.6, h: 0.85, builder: 'buildSink' },
  { id: 'p-stool',           cat: '🛋 Sozial (Rich)', icon: '🪑', name: 'Hocker (3-beinig)',           w: 0.4, d: 0.4, h: 0.45, builder: 'buildStool' },

  // ── Bau ──────────────────────────────────────────────────────────
  { id: 'p-door-rc2',        cat: '🏗 Bau (Rich)',    icon: '🔒', name: 'Sicherheitstür RC2',          w: 1.0, d: 0.1, h: 2.1, builder: 'buildDoorRC2' },
  { id: 'p-door-t90',        cat: '🏗 Bau (Rich)',    icon: '🟥', name: 'Brandschutztür T90',          w: 1.0, d: 0.1, h: 2.1, builder: 'buildDoorT90' },
  { id: 'p-sliding-door',    cat: '🏗 Bau (Rich)',    icon: '🚪', name: 'Schiebetür (2-flügelig Glas)',w: 2.0, d: 0.1, h: 2.1, builder: 'buildSlidingDoor' },
  { id: 'p-window-frame',    cat: '🏗 Bau (Rich)',    icon: '🪟', name: 'Fenster mit Sprossen',        w: 1.2, d: 0.08, h: 1.2, builder: 'buildWindowFrame' },
  { id: 'p-partition-wall',  cat: '🏗 Bau (Rich)',    icon: '🧱', name: 'Trennwand (modular)',         w: 1.2, d: 0.08, h: 2.4, builder: 'buildPartitionWall' },

  // ── Deko ─────────────────────────────────────────────────────────
  { id: 'p-potted-plant-s',  cat: '🌱 Deko (Rich)',   icon: '🪴', name: 'Topfpflanze klein',           w: 0.3, d: 0.3, h: 0.5, builder: 'buildPottedPlant' },
  { id: 'p-potted-plant-m',  cat: '🌱 Deko (Rich)',   icon: '🪴', name: 'Topfpflanze mittel',          w: 0.4, d: 0.4, h: 0.9, builder: 'buildPottedPlant' },
  { id: 'p-potted-plant-l',  cat: '🌱 Deko (Rich)',   icon: '🪴', name: 'Topfpflanze groß',            w: 0.5, d: 0.5, h: 1.5, builder: 'buildPottedPlant' },
  { id: 'p-wall-art',        cat: '🌱 Deko (Rich)',   icon: '🖼', name: 'Wandbild (Rahmen)',           w: 0.8, d: 0.03, h: 0.6, builder: 'buildWallArt' },
  { id: 'p-floor-lamp',      cat: '🌱 Deko (Rich)',   icon: '💡', name: 'Stehlampe (Schirm)',          w: 0.35, d: 0.35, h: 1.6, builder: 'buildFloorLamp' },

  // ── Messe (P4.2 — image-map support) ─────────────────────────────
  ...MESSE_ITEMS,
];
