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

export const STAND_TEMPLATES: StandTemplate[] = [
  MARI_JANE_REIHE,
  MARI_JANE_ECK,
  MARI_JANE_INSEL,
  GENERIC_SHOWROOM,
];

export function findTemplate(id: string): StandTemplate | undefined {
  return STAND_TEMPLATES.find((t) => t.id === id);
}
