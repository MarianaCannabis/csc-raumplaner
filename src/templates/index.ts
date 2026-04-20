// P4.5 — Messe and Showroom stand templates.
//
// Each template provides rooms + objects + optional projMeta. Loaded via
// window.cscTemplates and merged into the existing ROOM_TEMPLATES picker
// in index.html. Mari-Jane variants all carry maxHeight=2.5 so the
// P4.4 messeHeightLimit rule auto-fires when the template is applied.
//
// Item IDs referenced below must exist in:
//   - Legacy BUILTIN catalog (index.html) — e.g. 'emp-theke', 'regal'
//   - TS Messe catalog (src/catalog/items/messe.ts) — 'msg-backwall-3' etc.
//   - TS Rich primitives — 'p-sofa-2', 'p-reception' etc.

export interface TemplateRoom {
  name: string;
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  floorColor?: string;
  wallColor?: string;
}

export interface TemplateObject {
  typeId: string;
  x: number;
  y: number;
  rot?: number;
  py?: number;
}

export interface TemplateMeta {
  maxHeight?: number;
  messeDays?: number;
}

export type TemplateTag = 'csc' | 'messe' | 'showroom';

export interface StandTemplate {
  id: string;
  name: string;
  icon: string;
  desc: string;
  size: string;
  tag: TemplateTag;
  rooms: TemplateRoom[];
  objects: TemplateObject[];
  meta?: TemplateMeta;
}

// =============================================================================
// Mari-Jane Messe-Templates (Cannabis-Messe in Berlin — specific branding
// constraints, alle ≤ 2.5 m Standhöhe per Hallenordnung)
// =============================================================================

const MARI_JANE_REIHE: StandTemplate = {
  id: 'mari-jane-reihe-12m2',
  name: 'Mari-Jane Reihenstand 12 m²',
  icon: '📐',
  desc: 'Reihenstand 4×3 m — Rückwand + rechte Seitenwand',
  size: '12 m²',
  tag: 'messe',
  rooms: [
    { name: 'Reihenstand', x: 0, y: 0, w: 4, d: 3, h: 2.5, floorColor: '#3a5a3a', wallColor: '#ffffff' },
  ],
  objects: [
    // Rückwand hinten (4 m breit)
    { typeId: 'msg-backwall-4', x: 0, y: 0.05, rot: 0 },
    // Info-Theke vorn
    { typeId: 'msg-counter-front', x: 1.1, y: 2.2, rot: 180 },
    // Zwei Stühle hinter der Theke
    { typeId: 'p-office-chair', x: 1.2, y: 1.3, rot: 180 },
    { typeId: 'p-office-chair', x: 2.0, y: 1.3, rot: 180 },
    // Roll-up links
    { typeId: 'msg-rollup', x: 0.2, y: 0.3, rot: 0 },
    // Beachflag rechts vorn
    { typeId: 'msg-flag', x: 3.6, y: 2.5, rot: 0 },
    // Deko-Pflanzen
    { typeId: 'p-potted-plant-m', x: 0.3, y: 2.5, rot: 0 },
    { typeId: 'p-potted-plant-m', x: 3.5, y: 0.3, rot: 0 },
  ],
  meta: { maxHeight: 2.5, messeDays: 3 },
};

const MARI_JANE_ECK: StandTemplate = {
  id: 'mari-jane-eck-24m2',
  name: 'Mari-Jane Eckstand 24 m²',
  icon: '📐',
  desc: 'Eckstand 6×4 m — 2 angrenzende Wände, Lounge-Zone',
  size: '24 m²',
  tag: 'messe',
  rooms: [
    { name: 'Eckstand', x: 0, y: 0, w: 6, d: 4, h: 2.5, floorColor: '#3a5a3a', wallColor: '#ffffff' },
  ],
  objects: [
    // Zwei Rückwände in L-Form
    { typeId: 'msg-backwall-3', x: 0, y: 0.05, rot: 0 },
    { typeId: 'msg-backwall-3', x: 3, y: 0.05, rot: 0 },
    // LED-Wand-Modul mittig auf der Rückwand
    { typeId: 'msg-led-wall', x: 2.5, y: 0.2, rot: 0, py: 0.7 },
    // Info-Theke mittig
    { typeId: 'msg-counter-front', x: 2.1, y: 1.5, rot: 0 },
    // Lounge rechts: 2 Sofas + Couchtisch
    { typeId: 'p-sofa-2', x: 4.0, y: 2.5, rot: 0 },
    { typeId: 'p-sofa-2', x: 4.0, y: 0.8, rot: 180 },
    { typeId: 'p-coffee-table', x: 4.4, y: 1.7, rot: 0 },
    // Roll-ups links+rechts
    { typeId: 'msg-rollup', x: 0.2, y: 3.5, rot: 0 },
    { typeId: 'msg-rollup', x: 5.0, y: 3.5, rot: 0 },
    // Beachflag Eingang
    { typeId: 'msg-flag', x: 5.6, y: 3.7, rot: 0 },
    // Pflanzen
    { typeId: 'p-potted-plant-l', x: 0.3, y: 2.5, rot: 0 },
    { typeId: 'p-potted-plant-m', x: 3.8, y: 3.6, rot: 0 },
  ],
  meta: { maxHeight: 2.5, messeDays: 3 },
};

const MARI_JANE_INSEL: StandTemplate = {
  id: 'mari-jane-insel-48m2',
  name: 'Mari-Jane Inselstand 48 m²',
  icon: '🏝',
  desc: 'Inselstand 8×6 m — offen, großer Lounge-Bereich',
  size: '48 m²',
  tag: 'messe',
  rooms: [
    { name: 'Inselstand', x: 0, y: 0, w: 8, d: 6, h: 2.5, floorColor: '#3a5a3a', wallColor: '#cccccc' },
  ],
  objects: [
    // Zentrale Info-Theke (U-Form, 2 Counter)
    { typeId: 'msg-counter-front', x: 3.2, y: 2.7, rot: 0 },
    { typeId: 'msg-counter-front', x: 3.2, y: 3.5, rot: 180 },
    { typeId: 'p-reception', x: 5.0, y: 3.0, rot: 90 },
    // Große LED-Wand zentral (freistehend)
    { typeId: 'msg-led-wall', x: 3.5, y: 2.0, rot: 0, py: 0.5 },
    // Lounge-Zone 1: Eck-Sofa + Couchtisch (vorne links)
    { typeId: 'p-sofa-3', x: 0.5, y: 4.5, rot: 0 },
    { typeId: 'p-coffee-table', x: 1.2, y: 3.5, rot: 0 },
    { typeId: 'p-sofa-2', x: 0.5, y: 3.0, rot: 0 },
    // Lounge-Zone 2: Konferenztisch (vorne rechts)
    { typeId: 'p-conf-table', x: 5.5, y: 4.2, rot: 0 },
    { typeId: 'p-office-chair', x: 5.3, y: 4.0, rot: 0 },
    { typeId: 'p-office-chair', x: 6.8, y: 4.0, rot: 0 },
    { typeId: 'p-office-chair', x: 5.3, y: 5.4, rot: 180 },
    { typeId: 'p-office-chair', x: 6.8, y: 5.4, rot: 180 },
    // 4 Beachflags (je eine pro Ecke)
    { typeId: 'msg-flag', x: 0.3, y: 0.3, rot: 0 },
    { typeId: 'msg-flag', x: 7.5, y: 0.3, rot: 0 },
    { typeId: 'msg-flag', x: 0.3, y: 5.7, rot: 0 },
    { typeId: 'msg-flag', x: 7.5, y: 5.7, rot: 0 },
    // Roll-ups verteilt
    { typeId: 'msg-rollup', x: 2.0, y: 0.3, rot: 0 },
    { typeId: 'msg-rollup', x: 5.5, y: 0.3, rot: 0 },
    // Deko
    { typeId: 'p-potted-plant-l', x: 1.0, y: 0.8, rot: 0 },
    { typeId: 'p-potted-plant-l', x: 7.0, y: 0.8, rot: 0 },
    { typeId: 'p-floor-lamp', x: 2.5, y: 5.3, rot: 0 },
  ],
  meta: { maxHeight: 2.5, messeDays: 3 },
};

// =============================================================================
// Generic Showroom — B2B-Messe mit offener Hallenhöhe (Boot Düsseldorf, Dmexco)
// =============================================================================

const GENERIC_SHOWROOM: StandTemplate = {
  id: 'generic-showroom-36m2',
  name: 'Showroom 36 m²',
  icon: '🏢',
  desc: 'Generischer B2B-Messestand 6×6 m — offene Halle bis 4 m',
  size: '36 m²',
  tag: 'showroom',
  rooms: [
    { name: 'Showroom', x: 0, y: 0, w: 6, d: 6, h: 4.0, floorColor: '#4a4a4a', wallColor: '#ffffff' },
  ],
  objects: [
    // Hohe Backwall-Reihe (4 m H möglich, aber Rückwand-Item ist 2.5 m — stacking/doppelwand in späterem Release)
    { typeId: 'msg-backwall-3', x: 0, y: 0.05, rot: 0 },
    { typeId: 'msg-backwall-3', x: 3, y: 0.05, rot: 0 },
    // Info-Empfang zentral
    { typeId: 'p-reception', x: 2.0, y: 2.2, rot: 0 },
    { typeId: 'p-office-chair', x: 2.6, y: 2.6, rot: 180 },
    // Zwei Konferenztische für Kundengespräche
    { typeId: 'p-conf-table', x: 0.8, y: 4.0, rot: 0 },
    { typeId: 'p-office-chair', x: 0.6, y: 3.8, rot: 0 },
    { typeId: 'p-office-chair', x: 2.1, y: 3.8, rot: 0 },
    { typeId: 'p-office-chair', x: 0.6, y: 5.2, rot: 180 },
    { typeId: 'p-office-chair', x: 2.1, y: 5.2, rot: 180 },
    { typeId: 'p-conf-table', x: 3.6, y: 4.0, rot: 0 },
    { typeId: 'p-office-chair', x: 3.4, y: 3.8, rot: 0 },
    { typeId: 'p-office-chair', x: 4.9, y: 3.8, rot: 0 },
    { typeId: 'p-office-chair', x: 3.4, y: 5.2, rot: 180 },
    { typeId: 'p-office-chair', x: 4.9, y: 5.2, rot: 180 },
    // Branding-Elemente
    { typeId: 'msg-rollup', x: 0.2, y: 2.8, rot: 0 },
    { typeId: 'msg-rollup', x: 5.0, y: 2.8, rot: 0 },
    { typeId: 'msg-led-wall', x: 2.5, y: 0.2, rot: 0, py: 0.7 },
    // Deko
    { typeId: 'p-potted-plant-l', x: 0.3, y: 5.5, rot: 0 },
    { typeId: 'p-potted-plant-l', x: 5.3, y: 5.5, rot: 0 },
  ],
  meta: { maxHeight: 4.0, messeDays: 4 },
};

// =============================================================================
// Zusätzliche Mari-Jane-Größen (P5.4)
// =============================================================================

// Kopfstand 18 m² — 3 Seiten offen, eine Rückwand. Prestige-Variante
// zwischen Reihe und Eck. Häufigste Größe bei Mari-Jane 2024/2025.
const MARI_JANE_KOPFSTAND_18: StandTemplate = {
  id: 'mari-jane-kopfstand-18m2',
  name: 'Mari-Jane Kopfstand 18 m²',
  icon: '📐',
  desc: 'Kopfstand 6×3 m — einzelne Rückwand, 3 Seiten offen',
  size: '18 m²',
  tag: 'messe',
  rooms: [
    { name: 'Kopfstand', x: 0, y: 0, w: 6, d: 3, h: 2.5, floorColor: '#3a5a3a', wallColor: '#ffffff' },
  ],
  objects: [
    { typeId: 'msg-backwall-4', x: 1, y: 0.05, rot: 0 },
    { typeId: 'msg-counter-front', x: 2.1, y: 1.5, rot: 0 },
    { typeId: 'p-office-chair', x: 2.2, y: 0.9, rot: 180 },
    { typeId: 'p-office-chair', x: 3.0, y: 0.9, rot: 180 },
    { typeId: 'msg-rollup', x: 0.3, y: 2.3, rot: 0 },
    { typeId: 'msg-rollup', x: 5.3, y: 2.3, rot: 0 },
    { typeId: 'msg-led-wall', x: 2.5, y: 0.2, rot: 0, py: 0.7 },
    { typeId: 'msg-flag', x: 5.6, y: 2.7, rot: 0 },
    { typeId: 'p-potted-plant-m', x: 0.3, y: 2.5, rot: 0 },
    { typeId: 'p-potted-plant-m', x: 5.3, y: 0.3, rot: 0 },
  ],
  meta: { maxHeight: 2.5, messeDays: 3 },
};

const MARI_JANE_REIHE_6: StandTemplate = {
  id: 'mari-jane-reihenstand-6m2',
  name: 'Mari-Jane Reihenstand 6 m²',
  icon: '📐',
  desc: 'Minimal-Reihenstand 3×2 m — Rückwand + Counter, Basisbestückung',
  size: '6 m²',
  tag: 'messe',
  rooms: [
    { name: 'Reihenstand Klein', x: 0, y: 0, w: 3, d: 2, h: 2.5, floorColor: '#3a5a3a', wallColor: '#ffffff' },
  ],
  objects: [
    { typeId: 'msg-backwall-3', x: 0, y: 0.05, rot: 0 },
    { typeId: 'msg-counter-front', x: 0.6, y: 1.4, rot: 180 },
    { typeId: 'p-office-chair', x: 0.7, y: 0.8, rot: 180 },
    { typeId: 'msg-rollup', x: 0.2, y: 1.6, rot: 0 },
    { typeId: 'msg-flag', x: 2.6, y: 1.7, rot: 0 },
  ],
  meta: { maxHeight: 2.5, messeDays: 3 },
};

const MARI_JANE_REIHE_9: StandTemplate = {
  id: 'mari-jane-reihenstand-9m2',
  name: 'Mari-Jane Reihenstand 9 m²',
  icon: '📐',
  desc: 'Standard-Reihenstand 3×3 m — Rückwand + Counter + Lounge-Hocker',
  size: '9 m²',
  tag: 'messe',
  rooms: [
    { name: 'Reihenstand 9', x: 0, y: 0, w: 3, d: 3, h: 2.5, floorColor: '#3a5a3a', wallColor: '#ffffff' },
  ],
  objects: [
    { typeId: 'msg-backwall-3', x: 0, y: 0.05, rot: 0 },
    { typeId: 'msg-counter-front', x: 0.6, y: 1.5, rot: 0 },
    { typeId: 'p-office-chair', x: 0.7, y: 0.9, rot: 180 },
    { typeId: 'p-office-chair', x: 1.5, y: 0.9, rot: 180 },
    { typeId: 'ev-barstool-high', x: 2.5, y: 2.2, rot: 0 },
    { typeId: 'msg-rollup', x: 0.2, y: 2.5, rot: 0 },
    { typeId: 'msg-flag', x: 2.6, y: 2.7, rot: 0 },
    { typeId: 'p-potted-plant-m', x: 0.3, y: 2.5, rot: 0 },
  ],
  meta: { maxHeight: 2.5, messeDays: 3 },
};

const MARI_JANE_KOPFSTAND_24: StandTemplate = {
  id: 'mari-jane-kopfstand-24m2',
  name: 'Mari-Jane Kopfstand 24 m²',
  icon: '📐',
  desc: 'Großer Kopfstand 8×3 m — Doppel-Rückwand, Counter + Lounge',
  size: '24 m²',
  tag: 'messe',
  rooms: [
    { name: 'Kopfstand XL', x: 0, y: 0, w: 8, d: 3, h: 2.5, floorColor: '#3a5a3a', wallColor: '#ffffff' },
  ],
  objects: [
    { typeId: 'msg-backwall-4', x: 0, y: 0.05, rot: 0 },
    { typeId: 'msg-backwall-4', x: 4, y: 0.05, rot: 0 },
    { typeId: 'msg-led-wall', x: 3.5, y: 0.2, rot: 0, py: 0.7 },
    { typeId: 'msg-counter-front', x: 1.1, y: 1.5, rot: 0 },
    { typeId: 'msg-counter-front', x: 5.1, y: 1.5, rot: 0 },
    { typeId: 'p-sofa-2', x: 3.0, y: 2.2, rot: 180 },
    { typeId: 'p-coffee-table', x: 3.5, y: 1.5, rot: 0 },
    { typeId: 'msg-rollup', x: 0.2, y: 2.7, rot: 0 },
    { typeId: 'msg-rollup', x: 7.3, y: 2.7, rot: 0 },
    { typeId: 'msg-flag', x: 7.6, y: 2.7, rot: 0 },
    { typeId: 'p-potted-plant-l', x: 0.3, y: 2.5, rot: 0 },
    { typeId: 'p-potted-plant-l', x: 7.3, y: 0.3, rot: 0 },
  ],
  meta: { maxHeight: 2.5, messeDays: 3 },
};

const MARI_JANE_INSEL_72: StandTemplate = {
  id: 'mari-jane-insel-72m2',
  name: 'Mari-Jane Inselstand 72 m²',
  icon: '🏝',
  desc: 'XXL Inselstand 12×6 m — offen, Bar-Lounge + Konferenzzone',
  size: '72 m²',
  tag: 'messe',
  rooms: [
    { name: 'Insel XXL', x: 0, y: 0, w: 12, d: 6, h: 2.5, floorColor: '#3a5a3a', wallColor: '#cccccc' },
  ],
  objects: [
    // Zentrale LED-Wand-Tower
    { typeId: 'msg-led-wall', x: 5.5, y: 2.5, rot: 0, py: 0.5 },
    // U-Counter zentral
    { typeId: 'msg-counter-front', x: 4.1, y: 3.0, rot: 0 },
    { typeId: 'msg-counter-front', x: 4.1, y: 3.8, rot: 180 },
    { typeId: 'p-reception', x: 6.0, y: 3.4, rot: 90 },
    // Lounge-Zone 1 (links): Sofas + Couchtisch
    { typeId: 'p-sofa-3', x: 0.5, y: 1.0, rot: 0 },
    { typeId: 'p-sofa-2', x: 0.5, y: 3.0, rot: 0 },
    { typeId: 'p-coffee-table', x: 1.5, y: 2.0, rot: 0 },
    // Konferenz-Zone (rechts): Konferenztisch + Stühle
    { typeId: 'p-conf-table', x: 8.5, y: 3.0, rot: 0 },
    { typeId: 'p-office-chair', x: 8.3, y: 2.8, rot: 0 },
    { typeId: 'p-office-chair', x: 10.0, y: 2.8, rot: 0 },
    { typeId: 'p-office-chair', x: 8.3, y: 4.4, rot: 180 },
    { typeId: 'p-office-chair', x: 10.0, y: 4.4, rot: 180 },
    // Bar-Ecke (vorn rechts)
    { typeId: 'ev-glass-bar', x: 9.5, y: 0.5, rot: 0 },
    { typeId: 'ev-swivel-barstool', x: 9.3, y: 1.2, rot: 180 },
    { typeId: 'ev-swivel-barstool', x: 10.1, y: 1.2, rot: 180 },
    // 6 Beachflags
    { typeId: 'msg-flag', x: 0.3, y: 0.3, rot: 0 },
    { typeId: 'msg-flag', x: 11.5, y: 0.3, rot: 0 },
    { typeId: 'msg-flag', x: 0.3, y: 5.7, rot: 0 },
    { typeId: 'msg-flag', x: 11.5, y: 5.7, rot: 0 },
    { typeId: 'msg-flag', x: 6.0, y: 0.3, rot: 0 },
    { typeId: 'msg-flag', x: 6.0, y: 5.7, rot: 0 },
    // Deko
    { typeId: 'p-potted-plant-l', x: 1.0, y: 0.8, rot: 0 },
    { typeId: 'p-potted-plant-l', x: 10.8, y: 5.0, rot: 0 },
    { typeId: 'ev-string-lights-10', x: 1.0, y: 0.3, rot: 0, py: 2.4 },
  ],
  meta: { maxHeight: 2.5, messeDays: 3 },
};

// Generic Showroom-Varianten für andere Messen (Boot, Dmexco etc.)
const GENERIC_SHOWROOM_24: StandTemplate = {
  id: 'generic-showroom-24m2',
  name: 'Showroom 24 m²',
  icon: '🏢',
  desc: 'Kompakter B2B-Showroom 6×4 m — Empfang + Präsentation',
  size: '24 m²',
  tag: 'showroom',
  rooms: [
    { name: 'Showroom 24', x: 0, y: 0, w: 6, d: 4, h: 4.0, floorColor: '#4a4a4a', wallColor: '#ffffff' },
  ],
  objects: [
    { typeId: 'msg-backwall-3', x: 0, y: 0.05, rot: 0 },
    { typeId: 'msg-backwall-3', x: 3, y: 0.05, rot: 0 },
    { typeId: 'msg-led-wall', x: 2.5, y: 0.2, rot: 0, py: 0.7 },
    { typeId: 'p-reception', x: 2.0, y: 2.0, rot: 0 },
    { typeId: 'p-office-chair', x: 2.6, y: 2.4, rot: 180 },
    { typeId: 'p-conf-table', x: 0.8, y: 2.8, rot: 0 },
    { typeId: 'p-office-chair', x: 0.6, y: 2.6, rot: 0 },
    { typeId: 'p-office-chair', x: 2.1, y: 2.6, rot: 0 },
    { typeId: 'msg-rollup', x: 0.2, y: 3.5, rot: 0 },
    { typeId: 'msg-rollup', x: 5.0, y: 3.5, rot: 0 },
    { typeId: 'p-potted-plant-l', x: 0.3, y: 3.5, rot: 0 },
  ],
  meta: { maxHeight: 4.0, messeDays: 4 },
};

export const STAND_TEMPLATES: StandTemplate[] = [
  MARI_JANE_REIHE_6,
  MARI_JANE_REIHE_9,
  MARI_JANE_REIHE,
  MARI_JANE_KOPFSTAND_18,
  MARI_JANE_KOPFSTAND_24,
  MARI_JANE_ECK,
  MARI_JANE_INSEL,
  MARI_JANE_INSEL_72,
  GENERIC_SHOWROOM_24,
  GENERIC_SHOWROOM,
];

export function findTemplate(id: string): StandTemplate | undefined {
  return STAND_TEMPLATES.find((t) => t.id === id);
}
