// P5.2 — CSC-Katalog +100%. ~37 neue Rich-Primitive-Items die die
// bestehenden CSC-Kategorien (Anbau, Sicherheit, Ausgabe, Lager,
// Sozial, Sanitär) um fehlende Realismus-Items erweitern.
//
// Mehrere Items reusen bestehende Builder aus primitiveBuilders.ts bzw.
// eventBuilders.ts (z.B. Tresor XL → buildSafeBox mit größeren Maßen,
// Tablet-Kiosk → buildTouchscreenKiosk). Neue Builder in cscBuilders.ts.

import type { PrimitiveCatalogItem } from './primitives.js';

// 1. Anbau (+8)
export const CSC_ANBAU_EXP: PrimitiveCatalogItem[] = [
  { id: 'csc-seedling-station',  cat: '🌿 Anbau', icon: '🌱', name: 'Keim-Station mit LED',        w: 0.8, d: 0.5, h: 0.6, builder: 'buildSeedlingStation' },
  { id: 'csc-cutting-cabinet',   cat: '🌿 Anbau', icon: '🌿', name: 'Stecklings-Schrank',           w: 0.9, d: 0.5, h: 1.8, builder: 'buildCuttingCabinet' },
  { id: 'csc-drying-net',        cat: '🌿 Anbau', icon: '🕸', name: 'Trocken-Netz 6-Ebenen (hängend)', w: 0.8, d: 0.8, h: 1.5, builder: 'buildDryingNet' },
  { id: 'csc-manicure-station',  cat: '🌿 Anbau', icon: '✂', name: 'Maniküre-Tisch + Lupenlicht', w: 1.2, d: 0.6, h: 0.9, builder: 'buildCommunalTable' },
  { id: 'csc-packaging-station', cat: '🌿 Anbau', icon: '📦', name: 'Verpackungs-Station',         w: 1.4, d: 0.7, h: 1.0, builder: 'buildPackagingStation' },
  { id: 'csc-compost-bin',       cat: '🌿 Anbau', icon: '♻', name: 'Kompost-Behälter',            w: 0.6, d: 0.6, h: 0.9, builder: 'buildCompostBin' },
  { id: 'csc-ph-ec-meter',       cat: '🌿 Anbau', icon: '🧪', name: 'pH/EC-Messstation',           w: 0.25, d: 0.15, h: 0.3, builder: 'buildPhEcMeter' },
  { id: 'csc-irrigation-tank',   cat: '🌿 Anbau', icon: '💧', name: 'Bewässerungs-Tank 200 L',     w: 0.6, d: 0.6, h: 1.0, builder: 'buildIrrigationTank' },
];

// 2. Sicherheit (+7)
export const CSC_SECURITY_EXP: PrimitiveCatalogItem[] = [
  { id: 'csc-safe-xl',             cat: '🔐 Sicherheit', icon: '🔒', name: 'Tresor XL (Standtresor)',   w: 0.8, d: 0.8, h: 1.5, builder: 'buildSafeBox' },
  { id: 'csc-safer-room-panel',    cat: '🔐 Sicherheit', icon: '🛡', name: 'Safer-Room-Panel (verstärkt)', w: 1.2, d: 0.1, h: 2.4, builder: 'buildSaferRoomPanel' },
  { id: 'csc-airlock-door',        cat: '🔐 Sicherheit', icon: '🚪', name: 'Schleusen-Tür (druckdicht)', w: 1.0, d: 0.3, h: 2.1, builder: 'buildAirlockDoor' },
  { id: 'csc-walkthrough-scanner', cat: '🔐 Sicherheit', icon: '🚨', name: 'Durchgang-Scanner',         w: 1.0, d: 0.2, h: 2.2, builder: 'buildWalkthroughScanner' },
  { id: 'csc-biometric-reader',    cat: '🔐 Sicherheit', icon: '🫵', name: 'Biometrie-Leser (Finger)',  w: 0.15, d: 0.1, h: 0.2, builder: 'buildBiometricReader' },
  { id: 'csc-panic-button',        cat: '🔐 Sicherheit', icon: '🆘', name: 'Panic-Button (Wand)',       w: 0.15, d: 0.06, h: 0.15, builder: 'buildPanicButton' },
  { id: 'csc-alarm-strobe',        cat: '🔐 Sicherheit', icon: '🚨', name: 'Alarm-Blitzleuchte m. Sirene', w: 0.2, d: 0.12, h: 0.25, builder: 'buildAlarmStrobe' },
];

// 3. Ausgabe (+5)
export const CSC_DISPENSE_EXP: PrimitiveCatalogItem[] = [
  { id: 'csc-tasting-corner',     cat: '🏪 Ausgabe', icon: '👃', name: 'Probier-Ecke (Aromatest)',   w: 1.6, d: 0.7, h: 1.1, builder: 'buildTastingCorner' },
  { id: 'csc-consult-booth',      cat: '🏪 Ausgabe', icon: '🗣', name: 'Beratungs-Booth (3-Wand)',   w: 2.0, d: 1.8, h: 2.0, builder: 'buildConsultationBooth' },
  { id: 'csc-tablet-kiosk',       cat: '🏪 Ausgabe', icon: '📱', name: 'Tablet-Kiosk (Bestellung)',  w: 0.4, d: 0.3, h: 1.3, builder: 'buildTouchscreenKiosk' },
  { id: 'csc-order-terminal',     cat: '🏪 Ausgabe', icon: '🖥', name: 'Online-Bestell-Terminal',    w: 0.5, d: 0.5, h: 1.5, builder: 'buildOrderTerminal' },
  { id: 'csc-merch-display',      cat: '🏪 Ausgabe', icon: '👕', name: 'Merch-Display (3-Ebenen)',   w: 1.0, d: 0.4, h: 1.7, builder: 'buildMerchDisplay' },
];

// 4. Lager (+5)
export const CSC_LAGER_EXP: PrimitiveCatalogItem[] = [
  { id: 'csc-gitterbox',       cat: '📦 Lager', icon: '🗃', name: 'Gitterbox (Lagerbehälter)',     w: 1.2, d: 0.8, h: 1.0, builder: 'buildGitterbox' },
  { id: 'csc-europallet',      cat: '📦 Lager', icon: '🟫', name: 'Europalette 1200×800',          w: 1.2, d: 0.8, h: 0.14, builder: 'buildEuroPallet' },
  { id: 'csc-vacuum-sealer',   cat: '📦 Lager', icon: '🌬', name: 'Vakuum-Verpackungsmaschine',    w: 0.5, d: 0.4, h: 0.35, builder: 'buildVacuumSealer' },
  { id: 'csc-label-printer',   cat: '📦 Lager', icon: '🏷', name: 'Etiketten-Drucker-Station',     w: 0.35, d: 0.25, h: 0.3, builder: 'buildLabelPrinter' },
  { id: 'csc-batch-tracking',  cat: '📦 Lager', icon: '📊', name: 'Batch-Tracking-Station',        w: 0.9, d: 0.6, h: 1.5, builder: 'buildBatchTrackingStation' },
];

// 5. Sozial (+7)
export const CSC_SOCIAL_EXP: PrimitiveCatalogItem[] = [
  { id: 'csc-lounge-pouf',     cat: '🛋 Sozial', icon: '🪑', name: 'Loungepouf (rund, gepolstert)', w: 0.55, d: 0.55, h: 0.4, builder: 'buildLoungePouf' },
  { id: 'csc-beanbag',         cat: '🛋 Sozial', icon: '🧸', name: 'Sitzsack XL',                   w: 1.0, d: 1.0, h: 0.7, builder: 'buildBeanbag' },
  { id: 'csc-communal-table',  cat: '🛋 Sozial', icon: '🍴', name: 'Gemeinschaftstisch 3 m',        w: 3.0, d: 0.9, h: 0.75, builder: 'buildCommunalTable' },
  { id: 'csc-bouldering-wall', cat: '🛋 Sozial', icon: '🧗', name: 'Boulderwand (Holds)',           w: 3.0, d: 0.4, h: 3.0, builder: 'buildBoulderingWall' },
  { id: 'csc-foosball',        cat: '🛋 Sozial', icon: '⚽', name: 'Tischkicker',                   w: 1.4, d: 0.8, h: 0.9, builder: 'buildFoosball' },
  { id: 'csc-dartboard',       cat: '🛋 Sozial', icon: '🎯', name: 'Dartscheibe im Schrank',        w: 0.6, d: 0.1, h: 0.6, builder: 'buildDartboard' },
  { id: 'csc-arcade-cabinet',  cat: '🛋 Sozial', icon: '🕹', name: 'Arcade-Automat (nostalgisch)',  w: 0.75, d: 0.9, h: 1.9, builder: 'buildArcadeCabinet' },
];

// 6. Sanitär (+5)
export const CSC_SANITARY_EXP: PrimitiveCatalogItem[] = [
  { id: 'csc-accessible-wc',    cat: '🚻 Sanitär', icon: '♿', name: 'Behinderten-WC mit Griffen',   w: 0.8, d: 0.7, h: 0.9, builder: 'buildAccessibleWc' },
  { id: 'csc-changing-table',   cat: '🚻 Sanitär', icon: '👶', name: 'Wickeltisch klappbar',         w: 0.9, d: 0.55, h: 1.0, builder: 'buildChangingTable' },
  { id: 'csc-urinal-block',     cat: '🚻 Sanitär', icon: '🚹', name: 'Urinal-Block (3er)',           w: 1.5, d: 0.5, h: 1.2, builder: 'buildUrinalBlock' },
  { id: 'csc-towel-dispenser',  cat: '🚻 Sanitär', icon: '🧻', name: 'Papierhandtuch-Spender',       w: 0.3, d: 0.12, h: 0.4, builder: 'buildTowelDispenser' },
  { id: 'csc-tissue-dispenser', cat: '🚻 Sanitär', icon: '🤧', name: 'Taschentuch-Spender',          w: 0.25, d: 0.12, h: 0.08, builder: 'buildTissueDispenser' },
];

export const CSC_EXPANSION_ITEMS: PrimitiveCatalogItem[] = [
  ...CSC_ANBAU_EXP,
  ...CSC_SECURITY_EXP,
  ...CSC_DISPENSE_EXP,
  ...CSC_LAGER_EXP,
  ...CSC_SOCIAL_EXP,
  ...CSC_SANITARY_EXP,
];
