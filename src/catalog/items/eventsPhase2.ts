// P5.1-Phase2 — Zweite Verdopplungswelle der Event-Kategorien.
// Fokus: Items aus dem P5.1-Phase2-Spec die im bisherigen Katalog
// (Phase 1) noch nicht vorhanden sind. Viele nutzen bestehende
// Phase-1-Builder mit anderen Dimensionen (z.B. buildBanquetTable für
// alle Banketttisch-Varianten, buildStageModule für Bühnentile); neue
// einzigartige Builder (Proszenium, Lesepult, Spiegelkugel,
// Billardtisch-Cousin etc.) leben in src/three/eventBuildersPhase2.ts.

import type { PrimitiveCatalogItem } from './primitives.js';

// Bühne (+9)
export const EVENT_STAGE_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-stage-tile-60',    cat: '🎭 Bühne', icon: '◾', name: 'Bühnenboden-Tile 60×60',      w: 0.6, d: 0.6, h: 0.02, builder: 'buildStageTile' },
  { id: 'ev-stage-tile-100',   cat: '🎭 Bühne', icon: '◾', name: 'Bühnenboden-Tile 1×1',       w: 1.0, d: 1.0, h: 0.02, builder: 'buildStageTile' },
  { id: 'ev-proscenium-arch',  cat: '🎭 Bühne', icon: '🏛', name: 'Proszenium-Rahmen',           w: 6.0, d: 0.3, h: 4.5, builder: 'buildProscenium' },
  { id: 'ev-lectern',          cat: '🎭 Bühne', icon: '📖', name: 'Lesepult (Moderator)',       w: 0.6, d: 0.45, h: 1.15, builder: 'buildLectern' },
  { id: 'ev-interval-wall',    cat: '🎭 Bühne', icon: '🪟', name: 'Interval-Trennwand 2 m',     w: 2.0, d: 0.08, h: 2.2, builder: 'buildIntervalWall' },
  { id: 'ev-podium-kombi-s',   cat: '🎭 Bühne', icon: '📶', name: 'Podest-Kombi klein',         w: 1.5, d: 1.5, h: 0.6, builder: 'buildRostrumXL' },
  { id: 'ev-podium-kombi-m',   cat: '🎭 Bühne', icon: '📶', name: 'Podest-Kombi mittel',        w: 2.5, d: 2.5, h: 0.9, builder: 'buildRostrumXL' },
  { id: 'ev-rail-curved',      cat: '🎭 Bühne', icon: '🚧', name: 'Bühnen-Geländer rund 1.5 m', w: 1.5, d: 0.08, h: 1.1, builder: 'buildStageRailGuard' },
  { id: 'ev-drape-gold',       cat: '🎭 Bühne', icon: '🎀', name: 'Samt-Vorhang Gold 5 m',       w: 5.0, d: 0.06, h: 4.0, builder: 'buildDrape' },
];

// Bestuhlung (+10)
export const EVENT_SEATING_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-cinema-chair',       cat: '🪑 Bestuhlung', icon: '🎬', name: 'Kinostuhl mit Armlehnen', w: 0.55, d: 0.7, h: 1.0, builder: 'buildCinemaChair' },
  { id: 'ev-swivel-barstool',    cat: '🪑 Bestuhlung', icon: '🔄', name: 'Drehbarhocker',           w: 0.42, d: 0.42, h: 0.78, builder: 'buildSwivelBarstool' },
  { id: 'ev-tribune-row',        cat: '🪑 Bestuhlung', icon: '🏟', name: 'Tribünen-Reihe (4-Pers)',  w: 2.4, d: 0.8, h: 0.9, builder: 'buildTribuneRow' },
  { id: 'ev-audience-bench',     cat: '🪑 Bestuhlung', icon: '🪑', name: 'Zuschauer-Bank 2 m',       w: 2.0, d: 0.4, h: 0.45, builder: 'buildAudienceBench' },
  { id: 'ev-round-table-4p',     cat: '🪑 Bestuhlung', icon: '⭕', name: 'Runder Tisch Ø120 (4P)',   w: 1.2, d: 1.2, h: 0.74, builder: 'buildRoundTable6p' },
  { id: 'ev-round-table-8p',     cat: '🪑 Bestuhlung', icon: '⭕', name: 'Runder Tisch Ø180 (8P)',   w: 1.8, d: 1.8, h: 0.74, builder: 'buildRoundTable6p' },
  { id: 'ev-banquet-rect-220',   cat: '🪑 Bestuhlung', icon: '🍽', name: 'Banketttisch 220×80',      w: 2.2, d: 0.8, h: 0.74, builder: 'buildBanquetTable' },
  { id: 'ev-folding-table-180',  cat: '🪑 Bestuhlung', icon: '📐', name: 'Klapptisch 180×75',        w: 1.8, d: 0.75, h: 0.74, builder: 'buildFoldingTable' },
  { id: 'ev-exec-conf-chair',    cat: '🪑 Bestuhlung', icon: '🪑', name: 'Executive-Konferenzstuhl', w: 0.6, d: 0.65, h: 1.0, builder: 'buildConfChair' },
  { id: 'ev-barstool-wood',      cat: '🪑 Bestuhlung', icon: '🪑', name: 'Barhocker Holz',           w: 0.4, d: 0.4, h: 0.8, builder: 'buildBarstoolHigh' },
];

// Technik (+10)
export const EVENT_TECH_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-projector-10k',    cat: '📡 Technik', icon: '📽', name: 'Projektor 10k-Lumen',       w: 0.5, d: 0.7, h: 0.3, builder: 'buildBeamer' },
  { id: 'ev-screen-3m',        cat: '📡 Technik', icon: '⬜', name: 'Leinwand 3 m',              w: 3.0, d: 0.3, h: 2.3, builder: 'buildProjectionScreenLarge' },
  { id: 'ev-screen-5m',        cat: '📡 Technik', icon: '⬜', name: 'Leinwand 5 m (Cinemascope)', w: 5.0, d: 0.3, h: 2.7, builder: 'buildProjectionScreenLarge' },
  { id: 'ev-led-p39-2x2',      cat: '📡 Technik', icon: '📺', name: 'LED-Wand P3.9 2×2',         w: 2.0, d: 0.15, h: 2.0, builder: 'buildMobileLedWall' },
  { id: 'ev-led-p39-3x2',      cat: '📡 Technik', icon: '📺', name: 'LED-Wand P3.9 3×2',         w: 3.0, d: 0.15, h: 2.0, builder: 'buildMobileLedWall' },
  { id: 'ev-truss-tall',       cat: '📡 Technik', icon: '🪜', name: 'Truss 4 m hoch',             w: 4.0, d: 0.3, h: 4.5, builder: 'buildTrussSquare' },
  { id: 'ev-mixer-16ch',       cat: '📡 Technik', icon: '🎛', name: 'Mischpult 16-Kanal',         w: 1.2, d: 0.6, h: 0.22, builder: 'buildMixerConsole' },
  { id: 'ev-lavalier-mic',     cat: '📡 Technik', icon: '🎙', name: 'Lavalier-Mikrofon',          w: 0.05, d: 0.03, h: 0.4, builder: 'buildLavalierMic' },
  { id: 'ev-media-server',     cat: '📡 Technik', icon: '💾', name: 'Media-Server (Playout)',     w: 0.5, d: 0.6, h: 0.45, builder: 'buildMediaServer' },
  { id: 'ev-touchscreen-pro',  cat: '📡 Technik', icon: '📱', name: 'Touchscreen-Stele 32"',     w: 0.65, d: 0.45, h: 1.7, builder: 'buildTouchscreenKiosk' },
];

// Licht (+9)
export const EVENT_LIGHT_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-moving-head-beam',  cat: '💡 Licht', icon: '🎆', name: 'Moving-Head Beam',       w: 0.38, d: 0.38, h: 0.6, builder: 'buildMovingHead' },
  { id: 'ev-par-led-rgbw',      cat: '💡 Licht', icon: '🔦', name: 'PAR-LED RGBW',           w: 0.25, d: 0.3, h: 0.6, builder: 'buildParLight' },
  { id: 'ev-pyro-candle',       cat: '💡 Licht', icon: '🎇', name: 'Pyro-Kerze (LED)',       w: 0.12, d: 0.12, h: 0.7, builder: 'buildPyroCandle' },
  { id: 'ev-mirror-ball',       cat: '💡 Licht', icon: '🪩', name: 'Spiegelkugel 40 cm',     w: 0.4, d: 0.4, h: 2.5, builder: 'buildMirrorBall' },
  { id: 'ev-wash-light',        cat: '💡 Licht', icon: '🌈', name: 'Wash-Light (Zoom)',       w: 0.3, d: 0.35, h: 0.65, builder: 'buildWashLight' },
  { id: 'ev-profile-spot',      cat: '💡 Licht', icon: '🎯', name: 'Profilscheinwerfer',      w: 0.3, d: 0.7, h: 0.7, builder: 'buildProfileSpot' },
  { id: 'ev-laser-rgb',         cat: '💡 Licht', icon: '🟢', name: 'Laser-Projektor RGB',    w: 0.35, d: 0.4, h: 0.25, builder: 'buildLaserProjector' },
  { id: 'ev-fog-machine-pro',   cat: '💡 Licht', icon: '🌫', name: 'Hazer Pro (Dunst)',      w: 0.5, d: 0.6, h: 0.4, builder: 'buildHazer' },
  { id: 'ev-gobo-beamer',       cat: '💡 Licht', icon: '📽', name: 'Gobo-Projektor',         w: 0.3, d: 0.45, h: 0.3, builder: 'buildBeamer' },
];

// Beschallung (+10)
export const EVENT_SOUND_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-line-array-d2',    cat: '🔊 Beschallung', icon: '📢', name: 'Line-Array D&B Q1',    w: 0.8, d: 0.4, h: 0.3, builder: 'buildLineArrayElement' },
  { id: 'ev-sub-double',       cat: '🔊 Beschallung', icon: '🔊', name: 'Doppel-Subwoofer',     w: 1.3, d: 0.65, h: 0.75, builder: 'buildSubwoofer' },
  { id: 'ev-monitor-wedge-pro',cat: '🔊 Beschallung', icon: '🎧', name: 'Monitor-Wedge Pro',    w: 0.7, d: 0.45, h: 0.4, builder: 'buildFloorMonitor' },
  { id: 'ev-powered-12',       cat: '🔊 Beschallung', icon: '📢', name: 'Powered Speaker 12"',  w: 0.4, d: 0.45, h: 0.7, builder: 'buildActiveColumn' },
  { id: 'ev-delay-line-speaker',cat: '🔊 Beschallung', icon: '⏱', name: 'Delay-Line Satellit',  w: 0.3, d: 0.35, h: 0.55, builder: 'buildActiveColumn' },
  { id: 'ev-in-ear-rx',        cat: '🔊 Beschallung', icon: '🎧', name: 'In-Ear-Receiver',      w: 0.5, d: 0.3, h: 0.5, builder: 'buildWirelessRack' },
  { id: 'ev-mic-stand-tall',   cat: '🔊 Beschallung', icon: '🎙', name: 'Mikrofon-Stativ hoch', w: 0.5, d: 0.5, h: 2.2, builder: 'buildMicStand' },
  { id: 'ev-mic-condenser',    cat: '🔊 Beschallung', icon: '🎤', name: 'Studio-Kondensator',    w: 0.1, d: 0.1, h: 0.3, builder: 'buildMicHandheld' },
  { id: 'ev-speaker-stand-xl', cat: '🔊 Beschallung', icon: '🎚', name: 'Lautsprecherstativ XL', w: 1.0, d: 1.0, h: 2.5, builder: 'buildSpeakerStand' },
  { id: 'ev-sub-wireless',     cat: '🔊 Beschallung', icon: '🔊', name: 'Kompakt-Subwoofer',    w: 0.55, d: 0.55, h: 0.65, builder: 'buildSubwoofer' },
];

// Catering (+10)
export const EVENT_CATERING_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-glass-bar',        cat: '🍽 Catering', icon: '🍸', name: 'Gläser-Bar',             w: 2.0, d: 0.5, h: 1.1, builder: 'buildGlassBar' },
  { id: 'ev-bar-backwall',     cat: '🍽 Catering', icon: '🍾', name: 'Bar-Rückwand',           w: 2.5, d: 0.4, h: 2.4, builder: 'buildBarBackWall' },
  { id: 'ev-dishwasher-pro',   cat: '🍽 Catering', icon: '🧼', name: 'Gewerbe-Spülmaschine',    w: 0.6, d: 0.6, h: 0.85, builder: 'buildDishwasherCommercial' },
  { id: 'ev-beverage-cooler',  cat: '🍽 Catering', icon: '🧊', name: 'Getränke-Kühler Glas',   w: 0.6, d: 0.6, h: 1.8, builder: 'buildBeverageCooler' },
  { id: 'ev-chafing-2gn',      cat: '🍽 Catering', icon: '🍲', name: 'Warmhaltebehälter GN2/1', w: 0.65, d: 0.55, h: 0.3, builder: 'buildChafingDish' },
  { id: 'ev-thermos-container',cat: '🍽 Catering', icon: '☕', name: 'Thermobehälter 25 L',    w: 0.5, d: 0.4, h: 0.6, builder: 'buildCoffeeStation' },
  { id: 'ev-serving-tower',    cat: '🍽 Catering', icon: '🧁', name: 'Etagère-Turm 5 Ebenen',   w: 0.45, d: 0.45, h: 0.7, builder: 'buildDessertStand' },
  { id: 'ev-buffet-long',      cat: '🍽 Catering', icon: '🍛', name: 'Buffet lang 3 m',         w: 3.0, d: 0.75, h: 0.74, builder: 'buildBuffetTable' },
  { id: 'ev-juice-triple',     cat: '🍽 Catering', icon: '🥤', name: 'Saftspender 3-Tank',     w: 0.6, d: 0.35, h: 0.65, builder: 'buildJuiceDispenser' },
  { id: 'ev-cart-plates',      cat: '🍽 Catering', icon: '🛒', name: 'Tellerwagen',             w: 0.55, d: 0.5, h: 1.0, builder: 'buildDishTrolley' },
];

// Deko (+10)
export const EVENT_DECO_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-chair-cover',       cat: '🌿 Deko', icon: '🪑', name: 'Stuhl-Hülle (Formal)',       w: 0.45, d: 0.5, h: 0.95, builder: 'buildChairCover' },
  { id: 'ev-table-linen',       cat: '🌿 Deko', icon: '🎀', name: 'Tischwäsche-Drape',         w: 1.8, d: 0.75, h: 0.78, builder: 'buildTableLinen' },
  { id: 'ev-centerpiece-lux',   cat: '🌿 Deko', icon: '💐', name: 'Centerpiece Lux mit Kerze', w: 0.35, d: 0.35, h: 0.5, builder: 'buildCenterpieceLux' },
  { id: 'ev-candle-stand',      cat: '🌿 Deko', icon: '🕯', name: 'Kerzenständer hoch',        w: 0.25, d: 0.25, h: 1.2, builder: 'buildCandleStand' },
  { id: 'ev-welcome-board',     cat: '🌿 Deko', icon: '🎉', name: 'Willkommensschild (Easel)', w: 0.8, d: 0.5, h: 1.4, builder: 'buildWelcomeBoard' },
  { id: 'ev-tall-plant-xl',     cat: '🌿 Deko', icon: '🌴', name: 'Kübelpflanze XL 2.5 m',      w: 0.6, d: 0.6, h: 2.5, builder: 'buildTallPlant' },
  { id: 'ev-string-lights-10',  cat: '🌿 Deko', icon: '✨', name: 'Lichterkette 10 m',         w: 10.0, d: 0.05, h: 3.0, builder: 'buildStringLights' },
  { id: 'ev-artwork-single',    cat: '🌿 Deko', icon: '🖼', name: 'Einzelbild gerahmt 80×60',   w: 0.8, d: 0.03, h: 0.6, builder: 'buildArtworkSet' },
  { id: 'ev-drape-curtain-red', cat: '🌿 Deko', icon: '🪟', name: 'Drape-Vorhang Rot 3 m',     w: 3.0, d: 0.08, h: 3.0, builder: 'buildDrapeCurtain' },
  { id: 'ev-vase-floor-xxl',    cat: '🌿 Deko', icon: '🏺', name: 'Bodenvase XXL 1.5 m',       w: 0.45, d: 0.45, h: 1.5, builder: 'buildVaseTall' },
];

// Eingang (+9)
export const EVENT_ENTRY_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-people-counter',     cat: '🚪 Eingang', icon: '🔢', name: 'Zählwerk (Zutritte)',    w: 0.3, d: 0.15, h: 1.6, builder: 'buildPeopleCounter' },
  { id: 'ev-access-card-scanner',cat: '🚪 Eingang', icon: '💳', name: 'Karten-Zutrittsleser',  w: 0.2, d: 0.1, h: 0.2, builder: 'buildAccessCardScanner' },
  { id: 'ev-post-rope-gold',     cat: '🚪 Eingang', icon: '🪢', name: 'Absperrpfosten Gold',    w: 0.4, d: 0.4, h: 0.95, builder: 'buildPostRope' },
  { id: 'ev-gate-wide',          cat: '🚪 Eingang', icon: '🚧', name: 'Absperrgitter 2.5 m',    w: 2.5, d: 0.6, h: 1.1, builder: 'buildMobileGate' },
  { id: 'ev-turnstile-full',     cat: '🚪 Eingang', icon: '🔄', name: 'Drehkreuz Vollhöhe',     w: 0.8, d: 1.2, h: 2.3, builder: 'buildTurnstile' },
  { id: 'ev-checkpoint-xl',      cat: '🚪 Eingang', icon: '🛡', name: 'Security-Checkpoint XL', w: 2.0, d: 1.2, h: 1.3, builder: 'buildSecurityCheckpoint' },
  { id: 'ev-welcome-sign-tall',  cat: '🚪 Eingang', icon: '👋', name: 'Aufsteller 2 m',         w: 0.9, d: 0.3, h: 2.0, builder: 'buildWelcomeSign' },
  { id: 'ev-entrance-arch-big',  cat: '🚪 Eingang', icon: '🏛', name: 'Eingangsbogen 4 m',      w: 4.0, d: 0.5, h: 3.5, builder: 'buildEntranceArch' },
  { id: 'ev-bag-scanner-xray',   cat: '🚪 Eingang', icon: '🧳', name: 'Röntgen-Scanner XL',     w: 0.9, d: 2.2, h: 1.5, builder: 'buildBagScanner' },
];

// Workshop (+10)
export const EVENT_WORKSHOP_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-flipchart-pro',     cat: '📚 Workshop', icon: '📋', name: 'Flipchart Pro 80×100',     w: 0.85, d: 0.85, h: 1.9, builder: 'buildFlipchart' },
  { id: 'ev-pinboard-large',    cat: '📚 Workshop', icon: '📌', name: 'Pinnwand 1.5×1.2',         w: 1.5, d: 0.6, h: 1.7, builder: 'buildPinboard' },
  { id: 'ev-moderation-xl',     cat: '📚 Workshop', icon: '🧰', name: 'Moderationskoffer XL',     w: 0.65, d: 0.35, h: 0.25, builder: 'buildModerationCase' },
  { id: 'ev-breakout-table-lg', cat: '📚 Workshop', icon: '🪑', name: 'Breakout-Tisch 6P',        w: 2.0, d: 1.0, h: 0.74, builder: 'buildBreakoutTable' },
  { id: 'ev-group-table-6',     cat: '📚 Workshop', icon: '🔲', name: 'Gruppentisch 6-Pers oval', w: 2.0, d: 1.2, h: 0.74, builder: 'buildGroupTable4' },
  { id: 'ev-whiteboard-large',  cat: '📚 Workshop', icon: '📝', name: 'Whiteboard 200×120',       w: 2.0, d: 0.6, h: 2.1, builder: 'buildWhiteboardMobile' },
  { id: 'ev-easel-gallery',     cat: '📚 Workshop', icon: '🎨', name: 'Galerie-Staffelei',        w: 0.7, d: 0.7, h: 1.85, builder: 'buildEasel' },
  { id: 'ev-podium-speaker-lg', cat: '📚 Workshop', icon: '🎤', name: 'Rednerpult Hi-End',        w: 0.7, d: 0.55, h: 1.2, builder: 'buildPodiumSpeaker' },
  { id: 'ev-handout-rack-xl',   cat: '📚 Workshop', icon: '📚', name: 'Prospekt-Ständer XL',     w: 0.5, d: 0.3, h: 1.8, builder: 'buildHandoutRack' },
  { id: 'ev-info-standup',      cat: '📚 Workshop', icon: '🗣', name: 'Info-Aufsteller (A-Form)', w: 0.6, d: 0.6, h: 1.1, builder: 'buildWelcomeSign' },
];

// Outdoor (+9)
export const EVENT_OUTDOOR_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-beach-lounger-set',  cat: '⛺ Outdoor', icon: '🏖', name: 'Strandliegen-Set',        w: 2.2, d: 2.0, h: 0.5, builder: 'buildBeachLoungerSet' },
  { id: 'ev-pavilion-sidewall',  cat: '⛺ Outdoor', icon: '🪟', name: 'Pavillon-Seitenwand 3 m', w: 3.0, d: 0.05, h: 2.5, builder: 'buildPavilionSidewall' },
  { id: 'ev-pavilion-4x4',       cat: '⛺ Outdoor', icon: '⛺', name: 'Faltpavillon 4×4',        w: 4.0, d: 4.0, h: 3.0, builder: 'buildPavilion' },
  { id: 'ev-tent-6x4',           cat: '⛺ Outdoor', icon: '⛺', name: 'Zelt 6×4',                w: 6.0, d: 4.0, h: 3.0, builder: 'buildTentLarge' },
  { id: 'ev-beertable-xl',       cat: '⛺ Outdoor', icon: '🍺', name: 'Biertisch-Garnitur XL',   w: 2.5, d: 1.0, h: 0.8, builder: 'buildBeerTableSet' },
  { id: 'ev-patio-heater-gas',   cat: '⛺ Outdoor', icon: '🔥', name: 'Gas-Heizpilz XL',         w: 0.85, d: 0.85, h: 2.3, builder: 'buildPatioHeater' },
  { id: 'ev-rain-sail-6x6',      cat: '⛺ Outdoor', icon: '⛱', name: 'Sonnensegel 6×6',         w: 6.0, d: 6.0, h: 3.2, builder: 'buildRainSail' },
  { id: 'ev-bench-outdoor-3m',   cat: '⛺ Outdoor', icon: '🪑', name: 'Outdoor-Bank 3 m',        w: 3.0, d: 0.55, h: 0.85, builder: 'buildOutdoorBench' },
  { id: 'ev-umbrella-lg',        cat: '⛺ Outdoor', icon: '☂', name: 'Gastro-Sonnenschirm 3 m', w: 3.0, d: 3.0, h: 2.5, builder: 'buildGardenUmbrella' },
];

// Equipment (+10)
export const EVENT_EQUIPMENT_P2: PrimitiveCatalogItem[] = [
  { id: 'ev-tripod-spotlight',  cat: '⚙ Equipment', icon: '💡', name: 'LED-Spot auf Stativ',    w: 0.3, d: 0.3, h: 2.0, builder: 'buildTripodSpotlight' },
  { id: 'ev-generator-xl',      cat: '⚙ Equipment', icon: '⚡', name: 'Notstromaggregat 25 kW', w: 0.9, d: 1.4, h: 1.0, builder: 'buildGenerator' },
  { id: 'ev-cable-drum-100',    cat: '⚙ Equipment', icon: '🔌', name: 'Kabeltrommel 100 m',     w: 0.65, d: 0.45, h: 0.65, builder: 'buildCableDrum' },
  { id: 'ev-heater-tower',      cat: '⚙ Equipment', icon: '🔆', name: 'Heiz-Tower 2.5 kW',      w: 0.4, d: 0.4, h: 1.8, builder: 'buildHeatLamp' },
  { id: 'ev-fan-cooling',       cat: '⚙ Equipment', icon: '💨', name: 'Kühl-Ventilator groß',    w: 0.75, d: 0.4, h: 2.0, builder: 'buildFanIndustrial' },
  { id: 'ev-dehumidifier-lg',   cat: '⚙ Equipment', icon: '💧', name: 'Luftentfeuchter 50 L/Tag',w: 0.5, d: 0.4, h: 0.9, builder: 'buildDehumidifier' },
  { id: 'ev-power-distro-cee',  cat: '⚙ Equipment', icon: '🔋', name: 'CEE-Verteiler 63 A',     w: 0.6, d: 0.3, h: 0.55, builder: 'buildPowerDistro' },
  { id: 'ev-flightcase-xl',     cat: '⚙ Equipment', icon: '📦', name: 'Flightcase XL',          w: 1.2, d: 0.7, h: 0.8, builder: 'buildCaseFlight' },
  { id: 'ev-toolbox-pro',       cat: '⚙ Equipment', icon: '🧰', name: 'Werkzeugkoffer Pro',     w: 0.6, d: 0.3, h: 0.3, builder: 'buildToolbox' },
  { id: 'ev-extension-strip',   cat: '⚙ Equipment', icon: '🔌', name: 'Verlängerungs-Steckbox 8-fach', w: 0.55, d: 0.18, h: 0.12, builder: 'buildExtensionBox' },
];

export const EVENT_ITEMS_P2: PrimitiveCatalogItem[] = [
  ...EVENT_STAGE_P2,
  ...EVENT_SEATING_P2,
  ...EVENT_TECH_P2,
  ...EVENT_LIGHT_P2,
  ...EVENT_SOUND_P2,
  ...EVENT_CATERING_P2,
  ...EVENT_DECO_P2,
  ...EVENT_ENTRY_P2,
  ...EVENT_WORKSHOP_P2,
  ...EVENT_OUTDOOR_P2,
  ...EVENT_EQUIPMENT_P2,
];
