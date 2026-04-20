// P5.1 — Event-Katalog +100%. 111 neue Items über 11 Kategorien mit
// Rich-Primitive-Buildern aus src/three/eventBuilders.ts.
//
// ID-Konvention: ev-<slug>. Dimensionen sind realistisch — Stage-Modul
// 1×1×0.4 m (Standardnorm), Reihenstuhl 0.45 m Sitzhöhe, Pavillon 3×3 m
// Kantenlänge, etc. Kategorie-Icons zum schnellen Visual-Scan.

import type { PrimitiveCatalogItem } from './primitives.js';

// 1. Bühne & Podium (10)
export const EVENT_STAGE: PrimitiveCatalogItem[] = [
  { id: 'ev-stage-mod-1x1',  cat: '🎭 Bühne', icon: '🟫', name: 'Bühnenmodul 1×1×0.4 m',   w: 1.0, d: 1.0, h: 0.4, builder: 'buildStageModule' },
  { id: 'ev-stage-mod-2x1',  cat: '🎭 Bühne', icon: '🟫', name: 'Bühnenmodul 2×1×0.4 m',   w: 2.0, d: 1.0, h: 0.4, builder: 'buildStageModule' },
  { id: 'ev-stage-step',     cat: '🎭 Bühne', icon: '📶', name: 'Bühnenstufe 3-stufig',    w: 1.0, d: 0.9, h: 0.4, builder: 'buildStageStep' },
  { id: 'ev-stage-ramp',     cat: '🎭 Bühne', icon: '⤴', name: 'Bühnenrampe (Barrierefrei)',w: 1.2, d: 2.4, h: 0.4, builder: 'buildStageRamp' },
  { id: 'ev-stage-corner',   cat: '🎭 Bühne', icon: '◱', name: 'Bühnen-Eckmodul',         w: 1.0, d: 1.0, h: 0.4, builder: 'buildStageCorner' },
  { id: 'ev-stage-skirt',    cat: '🎭 Bühne', icon: '🪟', name: 'Bühnen-Seitenblende',     w: 2.0, d: 0.1, h: 0.4, builder: 'buildStageSkirt' },
  { id: 'ev-stage-rail',     cat: '🎭 Bühne', icon: '🚧', name: 'Bühnen-Geländer',         w: 1.0, d: 0.08, h: 1.1, builder: 'buildStageRailGuard' },
  { id: 'ev-catwalk-1m',     cat: '🎭 Bühne', icon: '▬', name: 'Catwalk-Modul 1 m',       w: 1.0, d: 1.2, h: 0.6, builder: 'buildCatwalk' },
  { id: 'ev-drape',          cat: '🎭 Bühne', icon: '🎀', name: 'Molton-Vorhang 4 m',      w: 4.0, d: 0.05, h: 3.5, builder: 'buildDrape' },
  { id: 'ev-rostrum-xl',     cat: '🎭 Bühne', icon: '🏛', name: 'Podest-Kombi XL 3 Stufen', w: 2.0, d: 2.0, h: 0.9, builder: 'buildRostrumXL' },
  { id: 'ev-side-blind',     cat: '🎭 Bühne', icon: '🪪', name: 'Seiten-Blende 2 m',       w: 2.0, d: 0.08, h: 2.2, builder: 'buildSideBlind' },
];

// 2. Bestuhlung & Tische (11)
export const EVENT_SEATING: PrimitiveCatalogItem[] = [
  { id: 'ev-row-chair',        cat: '🪑 Bestuhlung', icon: '🪑', name: 'Reihenstuhl',              w: 0.45, d: 0.5, h: 0.85, builder: 'buildRowChair' },
  { id: 'ev-conf-chair',       cat: '🪑 Bestuhlung', icon: '🪑', name: 'Konferenzstuhl gepolstert', w: 0.5, d: 0.55, h: 0.88, builder: 'buildConfChair' },
  { id: 'ev-armchair-event',   cat: '🪑 Bestuhlung', icon: '🛋', name: 'Event-Sessel (Leder)',     w: 0.75, d: 0.8, h: 0.9, builder: 'buildArmchairEvent' },
  { id: 'ev-folding-chair',    cat: '🪑 Bestuhlung', icon: '🪑', name: 'Klappstuhl',               w: 0.42, d: 0.45, h: 0.85, builder: 'buildFoldingChair' },
  { id: 'ev-barstool-high',    cat: '🪑 Bestuhlung', icon: '🪑', name: 'Barhocker hoch',           w: 0.38, d: 0.38, h: 0.75, builder: 'buildBarstoolHigh' },
  { id: 'ev-banquet-table',    cat: '🪑 Bestuhlung', icon: '🍽', name: 'Banketttisch 180×75',      w: 1.8, d: 0.75, h: 0.74, builder: 'buildBanquetTable' },
  { id: 'ev-lounge-table',     cat: '🪑 Bestuhlung', icon: '🛋', name: 'Loungetisch',              w: 1.0, d: 0.6, h: 0.45, builder: 'buildLoungeTable' },
  { id: 'ev-round-table-6p',   cat: '🪑 Bestuhlung', icon: '⭕', name: 'Runder Tisch Ø150 (6P)',   w: 1.5, d: 1.5, h: 0.74, builder: 'buildRoundTable6p' },
  { id: 'ev-catering-high',    cat: '🪑 Bestuhlung', icon: '🍸', name: 'Stehtisch (Catering)',     w: 0.8, d: 0.8, h: 1.1, builder: 'buildCateringHighTable' },
  { id: 'ev-folding-table',    cat: '🪑 Bestuhlung', icon: '📐', name: 'Klapptisch 120×75',        w: 1.2, d: 0.75, h: 0.74, builder: 'buildFoldingTable' },
  { id: 'ev-bistro-table',     cat: '🪑 Bestuhlung', icon: '☕', name: 'Bistrotisch rund Ø70',     w: 0.7, d: 0.7, h: 0.75, builder: 'buildBistroTable' },
];

// 3. Technik & Medien (10)
export const EVENT_TECH: PrimitiveCatalogItem[] = [
  { id: 'ev-projector-stand',  cat: '📡 Technik', icon: '📽', name: 'Projektor auf Stativ',     w: 0.3, d: 0.3, h: 1.5, builder: 'buildProjectorStand' },
  { id: 'ev-proj-screen-lg',   cat: '📡 Technik', icon: '⬜', name: 'Projektions-Leinwand 4 m',  w: 4.0, d: 0.3, h: 2.5, builder: 'buildProjectionScreenLarge' },
  { id: 'ev-mobile-led-wall',  cat: '📡 Technik', icon: '📺', name: 'Mobile LED-Wand 2×2',      w: 2.0, d: 0.15, h: 2.0, builder: 'buildMobileLedWall' },
  { id: 'ev-video-pillar',     cat: '📡 Technik', icon: '🗼', name: 'Video-Säule 2 m',          w: 0.5, d: 0.5, h: 2.0, builder: 'buildVideoPillar' },
  { id: 'ev-touchscreen-kiosk',cat: '📡 Technik', icon: '📱', name: 'Touchscreen-Stele',        w: 0.55, d: 0.4, h: 1.4, builder: 'buildTouchscreenKiosk' },
  { id: 'ev-translator-booth', cat: '📡 Technik', icon: '🎙', name: 'Übersetzerkabine 1×1',     w: 1.0, d: 1.0, h: 1.8, builder: 'buildTranslatorBooth' },
  { id: 'ev-fm-desk',          cat: '📡 Technik', icon: '🎛', name: 'FOH-Regiepult',            w: 1.4, d: 0.8, h: 0.95, builder: 'buildFMDesk' },
  { id: 'ev-cable-ramp',       cat: '📡 Technik', icon: '🧵', name: 'Kabel-Brücke 1 m',         w: 1.0, d: 0.4, h: 0.08, builder: 'buildCableRamp' },
  { id: 'ev-control-desk',     cat: '📡 Technik', icon: '🎚', name: 'Technik-Pult Einzelplatz', w: 1.6, d: 0.8, h: 0.78, builder: 'buildControlDesk' },
  { id: 'ev-truss-square',     cat: '📡 Technik', icon: '🪜', name: 'Truss 4-Punkt 3 m',        w: 3.0, d: 0.3, h: 3.5, builder: 'buildTrussSquare' },
];

// 4. Licht & Effekte (10)
export const EVENT_LIGHT: PrimitiveCatalogItem[] = [
  { id: 'ev-moving-head',   cat: '💡 Licht', icon: '🎆', name: 'Moving-Head',        w: 0.35, d: 0.35, h: 0.55, builder: 'buildMovingHead' },
  { id: 'ev-par-light',     cat: '💡 Licht', icon: '🔦', name: 'PAR-Scheinwerfer',   w: 0.25, d: 0.3, h: 0.6, builder: 'buildParLight' },
  { id: 'ev-led-bar',       cat: '💡 Licht', icon: '🌈', name: 'LED-Bar 1 m',         w: 1.0, d: 0.1, h: 0.6, builder: 'buildLedBar' },
  { id: 'ev-strobe',        cat: '💡 Licht', icon: '⚡', name: 'Stroboskop',         w: 0.4, d: 0.15, h: 0.3, builder: 'buildStrobe' },
  { id: 'ev-fog-machine',   cat: '💡 Licht', icon: '🌫', name: 'Nebelmaschine',      w: 0.35, d: 0.5, h: 0.3, builder: 'buildFogMachine' },
  { id: 'ev-confetti-cannon',cat: '💡 Licht', icon: '🎊', name: 'Konfetti-Kanone',   w: 0.2, d: 0.2, h: 0.7, builder: 'buildConfettiCannon' },
  { id: 'ev-beamer',        cat: '💡 Licht', icon: '📽', name: 'Beamer Profi',        w: 0.5, d: 0.45, h: 0.25, builder: 'buildBeamer' },
  { id: 'ev-follow-spot',   cat: '💡 Licht', icon: '🎯', name: 'Follow-Spot',         w: 0.45, d: 0.8, h: 1.5, builder: 'buildFollowSpot' },
  { id: 'ev-hazer',         cat: '💡 Licht', icon: '☁', name: 'Hazer (Dunstmaschine)',w: 0.4, d: 0.5, h: 0.3, builder: 'buildHazer' },
  { id: 'ev-uv-bar',        cat: '💡 Licht', icon: '🟣', name: 'UV-/Schwarzlicht-Bar',w: 1.0, d: 0.1, h: 0.6, builder: 'buildUvBar' },
];

// 5. Beschallung (10)
export const EVENT_SOUND: PrimitiveCatalogItem[] = [
  { id: 'ev-line-array',    cat: '🔊 Beschallung', icon: '📢', name: 'Line-Array-Element',  w: 0.6, d: 0.4, h: 0.35, builder: 'buildLineArrayElement' },
  { id: 'ev-subwoofer',     cat: '🔊 Beschallung', icon: '🔊', name: 'Subwoofer 18"',       w: 0.65, d: 0.65, h: 0.75, builder: 'buildSubwoofer' },
  { id: 'ev-floor-monitor', cat: '🔊 Beschallung', icon: '🎧', name: 'Bodenmonitor Wedge',  w: 0.6, d: 0.4, h: 0.35, builder: 'buildFloorMonitor' },
  { id: 'ev-mic-stand',     cat: '🔊 Beschallung', icon: '🎙', name: 'Mikrofon-Stativ',     w: 0.3, d: 0.3, h: 1.7, builder: 'buildMicStand' },
  { id: 'ev-mic-handheld',  cat: '🔊 Beschallung', icon: '🎤', name: 'Handheld-Mikrofon',   w: 0.08, d: 0.08, h: 0.25, builder: 'buildMicHandheld' },
  { id: 'ev-headset-mic',   cat: '🔊 Beschallung', icon: '🎧', name: 'Headset-Mikrofon',    w: 0.2, d: 0.08, h: 0.2, builder: 'buildHeadsetMic' },
  { id: 'ev-mixer-console', cat: '🔊 Beschallung', icon: '🎛', name: 'Mischpult Digital',   w: 1.0, d: 0.7, h: 0.25, builder: 'buildMixerConsole' },
  { id: 'ev-wireless-rack', cat: '🔊 Beschallung', icon: '📻', name: 'Funkstrecken-Rack 19"',w: 0.5, d: 0.45, h: 0.9, builder: 'buildWirelessRack' },
  { id: 'ev-speaker-stand', cat: '🔊 Beschallung', icon: '🎚', name: 'Lautsprecherstativ',  w: 0.9, d: 0.9, h: 2.0, builder: 'buildSpeakerStand' },
  { id: 'ev-active-column', cat: '🔊 Beschallung', icon: '📢', name: 'Active Column',        w: 0.3, d: 0.3, h: 2.0, builder: 'buildActiveColumn' },
];

// 6. Catering & Service (10)
export const EVENT_CATERING: PrimitiveCatalogItem[] = [
  { id: 'ev-chafing-dish',   cat: '🍽 Catering', icon: '🍲', name: 'Warmhaltebehälter GN1/1', w: 0.55, d: 0.35, h: 0.3, builder: 'buildChafingDish' },
  { id: 'ev-coffee-station', cat: '🍽 Catering', icon: '☕', name: 'Kaffeestation Profi',    w: 0.5, d: 0.5, h: 0.75, builder: 'buildCoffeeStation' },
  { id: 'ev-juice-dispenser',cat: '🍽 Catering', icon: '🥤', name: 'Saftspender Doppel',     w: 0.4, d: 0.3, h: 0.6, builder: 'buildJuiceDispenser' },
  { id: 'ev-dish-trolley',   cat: '🍽 Catering', icon: '🛒', name: 'Geschirrwagen',           w: 0.7, d: 0.5, h: 1.0, builder: 'buildDishTrolley' },
  { id: 'ev-tray-cart',      cat: '🍽 Catering', icon: '🍱', name: 'Tablett-Wagen',           w: 0.6, d: 0.45, h: 0.95, builder: 'buildTrayCart' },
  { id: 'ev-serving-counter',cat: '🍽 Catering', icon: '🥗', name: 'Servier-Theke m. Niesschutz',w: 1.8, d: 0.7, h: 1.05, builder: 'buildServingCounter' },
  { id: 'ev-ice-machine',    cat: '🍽 Catering', icon: '🧊', name: 'Eiswürfel-Bereiter',      w: 0.6, d: 0.6, h: 0.9, builder: 'buildIceMachine' },
  { id: 'ev-buffet-table',   cat: '🍽 Catering', icon: '🍛', name: 'Buffet-Tisch mit Rock',   w: 2.0, d: 0.75, h: 0.74, builder: 'buildBuffetTable' },
  { id: 'ev-dessert-stand',  cat: '🍽 Catering', icon: '🧁', name: 'Etagère-Turm 3 Ebenen',   w: 0.4, d: 0.4, h: 0.5, builder: 'buildDessertStand' },
  { id: 'ev-punch-bowl',     cat: '🍽 Catering', icon: '🥣', name: 'Bowle-Schale mit Sockel', w: 0.4, d: 0.4, h: 0.35, builder: 'buildPunchBowl' },
];

// 7. Dekoration (10)
export const EVENT_DECO: PrimitiveCatalogItem[] = [
  { id: 'ev-tall-plant',      cat: '🌿 Deko', icon: '🌴', name: 'Hohe Kübelpflanze 2 m',  w: 0.5, d: 0.5, h: 2.0, builder: 'buildTallPlant' },
  { id: 'ev-partition-panel', cat: '🌿 Deko', icon: '🪟', name: 'Deko-Trennwand 1.2×2',    w: 1.2, d: 0.1, h: 2.0, builder: 'buildPartitionPanel', imageMapFace: 'front', imageMapAspect: 'cover' },
  { id: 'ev-artwork-set',     cat: '🌿 Deko', icon: '🖼', name: 'Wandbilder-Triptychon',   w: 1.5, d: 0.04, h: 0.8, builder: 'buildArtworkSet' },
  { id: 'ev-balloon-bouquet', cat: '🌿 Deko', icon: '🎈', name: 'Ballontraube',            w: 0.7, d: 0.7, h: 1.6, builder: 'buildBalloonBouquet' },
  { id: 'ev-fire-torch',      cat: '🌿 Deko', icon: '🔥', name: 'Dekofackel (LED)',        w: 0.2, d: 0.2, h: 1.6, builder: 'buildFireTorch' },
  { id: 'ev-fire-bowl',       cat: '🌿 Deko', icon: '🔥', name: 'Feuerschale (LED)',       w: 0.7, d: 0.7, h: 0.7, builder: 'buildFireBowl' },
  { id: 'ev-string-lights',   cat: '🌿 Deko', icon: '✨', name: 'Lichterkette 5 m',         w: 5.0, d: 0.05, h: 3.0, builder: 'buildStringLights' },
  { id: 'ev-centerpiece',     cat: '🌿 Deko', icon: '💐', name: 'Tisch-Centerpiece',       w: 0.35, d: 0.35, h: 0.4, builder: 'buildCenterpiece' },
  { id: 'ev-drape-curtain',   cat: '🌿 Deko', icon: '🪟', name: 'Drape-Vorhang 2 m',        w: 2.0, d: 0.08, h: 3.0, builder: 'buildDrapeCurtain' },
  { id: 'ev-vase-tall',       cat: '🌿 Deko', icon: '🏺', name: 'Bodenvase hoch',          w: 0.35, d: 0.35, h: 1.0, builder: 'buildVaseTall' },
];

// 8. Eingang & Ordner (10)
export const EVENT_ENTRY: PrimitiveCatalogItem[] = [
  { id: 'ev-post-rope',       cat: '🚪 Eingang', icon: '🪢', name: 'Absperrpfosten m. Seil', w: 0.4, d: 0.4, h: 0.95, builder: 'buildPostRope' },
  { id: 'ev-mobile-gate',     cat: '🚪 Eingang', icon: '🚧', name: 'Absperrgitter 2 m',      w: 2.0, d: 0.6, h: 1.1, builder: 'buildMobileGate' },
  { id: 'ev-metal-detector',  cat: '🚪 Eingang', icon: '🚨', name: 'Metalldetektor-Torbogen',w: 1.0, d: 0.2, h: 2.2, builder: 'buildMetalDetector' },
  { id: 'ev-turnstile',       cat: '🚪 Eingang', icon: '🔄', name: 'Drehkreuz',              w: 0.6, d: 1.0, h: 1.1, builder: 'buildTurnstile' },
  { id: 'ev-info-desk-event', cat: '🚪 Eingang', icon: 'ℹ', name: 'Info-Pult mit Leuchtschild',w: 1.6, d: 0.7, h: 1.1, builder: 'buildInfoDesk', imageMapFace: 'front', imageMapAspect: 'cover' },
  { id: 'ev-security-chk',    cat: '🚪 Eingang', icon: '🛡', name: 'Security-Checkpoint',    w: 1.4, d: 1.0, h: 1.2, builder: 'buildSecurityCheckpoint' },
  { id: 'ev-queue-divider',   cat: '🚪 Eingang', icon: '↔', name: 'Queue-Gurtständer',      w: 0.4, d: 0.4, h: 1.0, builder: 'buildQueueDivider' },
  { id: 'ev-welcome-sign',    cat: '🚪 Eingang', icon: '👋', name: 'Willkommens-Aufsteller', w: 0.9, d: 0.3, h: 1.8, builder: 'buildWelcomeSign', imageMapFace: 'front', imageMapAspect: 'contain' },
  { id: 'ev-entrance-arch',   cat: '🚪 Eingang', icon: '🏛', name: 'Eingangsbogen',          w: 3.0, d: 0.4, h: 3.0, builder: 'buildEntranceArch' },
  { id: 'ev-bag-scanner',     cat: '🚪 Eingang', icon: '🧳', name: 'Gepäck-Scanner',         w: 0.7, d: 1.8, h: 1.4, builder: 'buildBagScanner' },
];

// 9. Workshop & Seminar (10)
export const EVENT_WORKSHOP: PrimitiveCatalogItem[] = [
  { id: 'ev-flipchart',       cat: '📚 Workshop', icon: '📋', name: 'Flipchart Dreibein',       w: 0.7, d: 0.7, h: 1.8, builder: 'buildFlipchart' },
  { id: 'ev-pinboard',        cat: '📚 Workshop', icon: '📌', name: 'Pinnwand mobil',          w: 1.2, d: 0.6, h: 1.5, builder: 'buildPinboard', imageMapFace: 'front', imageMapAspect: 'cover' },
  { id: 'ev-moderation-case', cat: '📚 Workshop', icon: '🧰', name: 'Moderationskoffer',       w: 0.5, d: 0.3, h: 0.2, builder: 'buildModerationCase' },
  { id: 'ev-breakout-table',  cat: '📚 Workshop', icon: '🪑', name: 'Breakout-Tisch 4P',       w: 1.4, d: 0.8, h: 0.74, builder: 'buildBreakoutTable' },
  { id: 'ev-group-table-4',   cat: '📚 Workshop', icon: '🔲', name: 'Gruppentisch 4er quadr.', w: 1.4, d: 1.4, h: 0.74, builder: 'buildGroupTable4' },
  { id: 'ev-whiteboard-mob',  cat: '📚 Workshop', icon: '📝', name: 'Whiteboard mobil 150×100',w: 1.5, d: 0.6, h: 1.85, builder: 'buildWhiteboardMobile' },
  { id: 'ev-easel',           cat: '📚 Workshop', icon: '🎨', name: 'Staffelei',               w: 0.6, d: 0.6, h: 1.7, builder: 'buildEasel' },
  { id: 'ev-podium-speaker',  cat: '📚 Workshop', icon: '🎤', name: 'Rednerpult',              w: 0.6, d: 0.5, h: 1.2, builder: 'buildPodiumSpeaker' },
  { id: 'ev-handout-rack',    cat: '📚 Workshop', icon: '📚', name: 'Prospekt-Ständer',        w: 0.4, d: 0.3, h: 1.6, builder: 'buildHandoutRack' },
  { id: 'ev-noteblock-pack',  cat: '📚 Workshop', icon: '📓', name: 'Moderationsblöcke (5er)', w: 0.3, d: 0.25, h: 0.4, builder: 'buildNoteblockPack' },
];

// 10. Outdoor & Zelte (9)
export const EVENT_OUTDOOR: PrimitiveCatalogItem[] = [
  { id: 'ev-pavilion-3x3',    cat: '⛺ Outdoor', icon: '⛺', name: 'Faltpavillon 3×3',        w: 3.0, d: 3.0, h: 2.8, builder: 'buildPavilion' },
  { id: 'ev-tent-5x5',        cat: '⛺ Outdoor', icon: '⛺', name: 'Zelt 5×5',                w: 5.0, d: 5.0, h: 3.2, builder: 'buildTentLarge' },
  { id: 'ev-tent-10x10',      cat: '⛺ Outdoor', icon: '⛺', name: 'Zelt 10×10',              w: 10.0, d: 10.0, h: 4.0, builder: 'buildTentLarge' },
  { id: 'ev-beertable-set',   cat: '⛺ Outdoor', icon: '🍺', name: 'Biertisch-Garnitur',      w: 2.2, d: 0.9, h: 0.75, builder: 'buildBeerTableSet' },
  { id: 'ev-patio-heater',    cat: '⛺ Outdoor', icon: '🔥', name: 'Heizpilz (Wärmestrahler)',w: 0.8, d: 0.8, h: 2.2, builder: 'buildPatioHeater' },
  { id: 'ev-rain-sail',       cat: '⛺ Outdoor', icon: '⛱', name: 'Sonnensegel 4×4',         w: 4.0, d: 4.0, h: 3.0, builder: 'buildRainSail' },
  { id: 'ev-portable-toilet', cat: '⛺ Outdoor', icon: '🚽', name: 'Mobile Toilette',         w: 1.0, d: 1.2, h: 2.3, builder: 'buildPortableToilet' },
  { id: 'ev-windscreen',      cat: '⛺ Outdoor', icon: '🪟', name: 'Windschutz 3 m',          w: 3.0, d: 0.1, h: 1.8, builder: 'buildWindscreen' },
  { id: 'ev-garden-umbrella', cat: '⛺ Outdoor', icon: '☂', name: 'Gastro-Sonnenschirm',     w: 2.5, d: 2.5, h: 2.5, builder: 'buildGardenUmbrella' },
  { id: 'ev-outdoor-bench',   cat: '⛺ Outdoor', icon: '🪑', name: 'Outdoor-Bank 2 m',        w: 2.0, d: 0.55, h: 0.85, builder: 'buildOutdoorBench' },
];

// 11. Equipment & Extras (10)
export const EVENT_EQUIPMENT: PrimitiveCatalogItem[] = [
  { id: 'ev-generator',       cat: '⚙ Equipment', icon: '⚡', name: 'Notstromaggregat 10 kW', w: 0.7, d: 1.0, h: 0.8, builder: 'buildGenerator' },
  { id: 'ev-cable-drum',      cat: '⚙ Equipment', icon: '🔌', name: 'Kabeltrommel 50 m',      w: 0.5, d: 0.35, h: 0.5, builder: 'buildCableDrum' },
  { id: 'ev-heat-lamp',       cat: '⚙ Equipment', icon: '🔆', name: 'Heizstrahler mobil',    w: 0.5, d: 0.5, h: 2.0, builder: 'buildHeatLamp' },
  { id: 'ev-fan-industrial',  cat: '⚙ Equipment', icon: '💨', name: 'Industrie-Ventilator',  w: 0.6, d: 0.3, h: 1.8, builder: 'buildFanIndustrial' },
  { id: 'ev-dehumidifier',    cat: '⚙ Equipment', icon: '💧', name: 'Luftentfeuchter',       w: 0.4, d: 0.3, h: 0.8, builder: 'buildDehumidifier' },
  { id: 'ev-extension-box',   cat: '⚙ Equipment', icon: '🔌', name: 'Verlängerungs-Steckbox', w: 0.4, d: 0.15, h: 0.1, builder: 'buildExtensionBox' },
  { id: 'ev-power-distro',    cat: '⚙ Equipment', icon: '🔋', name: 'CEE-Stromverteiler',    w: 0.5, d: 0.2, h: 0.45, builder: 'buildPowerDistro' },
  { id: 'ev-case-flight',     cat: '⚙ Equipment', icon: '📦', name: 'Flightcase groß',       w: 0.8, d: 0.6, h: 0.7, builder: 'buildCaseFlight' },
  { id: 'ev-toolbox',         cat: '⚙ Equipment', icon: '🧰', name: 'Werkzeugkoffer',        w: 0.45, d: 0.25, h: 0.25, builder: 'buildToolbox' },
  { id: 'ev-walkie-charger',  cat: '⚙ Equipment', icon: '📟', name: 'Funkgerät-Ladestation', w: 0.4, d: 0.2, h: 0.3, builder: 'buildWalkieCharger' },
];

export const EVENT_ITEMS: PrimitiveCatalogItem[] = [
  ...EVENT_STAGE,
  ...EVENT_SEATING,
  ...EVENT_TECH,
  ...EVENT_LIGHT,
  ...EVENT_SOUND,
  ...EVENT_CATERING,
  ...EVENT_DECO,
  ...EVENT_ENTRY,
  ...EVENT_WORKSHOP,
  ...EVENT_OUTDOOR,
  ...EVENT_EQUIPMENT,
];
