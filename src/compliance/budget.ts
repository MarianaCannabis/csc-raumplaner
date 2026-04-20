// P4.6 — Messe-Budget-Rechner. Schätzt die Gesamtkosten eines Messestandes
// aus Stand-Fläche, platzierten Messe-Items, optional verlegtem Teppich.
//
// Alle Preise stammen aus src/config/defaults.ts mit lastVerified-Datum.
// Realistische 2026er-Sätze für deutsche B2B-Messen; Mari-Jane und generic
// Showroom nutzen dieselbe Kostenstruktur, nur maxHeight + Days variieren.

import {
  MESSE_QM_PRICE_PER_DAY,
  MESSE_SETUP_PER_ITEM,
  MESSE_ELECTRICITY_FLAT,
  MESSE_WIFI_FLAT,
  MESSE_CARPET_PRICE_PER_QM,
} from '../config/defaults.js';

export interface BudgetRoom {
  w: number;
  d: number;
  [k: string]: unknown;
}

export interface BudgetGround {
  w: number;
  d: number;
  material?: string;
  [k: string]: unknown;
}

export interface BudgetObject {
  typeId: string;
  [k: string]: unknown;
}

export interface BudgetLine {
  label: string;
  eur: number;
}

export interface BudgetResult {
  standRent: number;
  setupCost: number;
  electricity: number;
  wifi: number;
  carpetCost: number;
  totalEUR: number;
  breakdown: BudgetLine[];
  /** How many days were used — echoed back so UI can label clearly. */
  days: number;
  /** Area in m² — floor sum across all rooms. */
  areaQm: number;
}

export interface BudgetContext {
  rooms: BudgetRoom[];
  objects: BudgetObject[];
  grounds?: BudgetGround[];
  meta?: { messeDays?: number; [k: string]: unknown };
}

/** Heuristic to flag items as "messe-relevant" for the per-item setup cost.
 *  Primary path is the item-id prefix from the Messe catalog. Secondary
 *  path catches Rich-Primitive items that a Messe stand typically hauls
 *  (reception, counter, conference table, sofa, flag). */
function isMesseItem(typeId: string): boolean {
  if (typeId.startsWith('msg-')) return true;
  // Whitelist of rich-primitive ids that operators routinely bring to a booth.
  const messeRich = new Set([
    'p-reception',
    'p-wait-bench',
    'p-sofa-2',
    'p-sofa-3',
    'p-coffee-table',
    'p-conf-table',
    'p-office-chair',
    'p-potted-plant-m',
    'p-potted-plant-l',
    'p-floor-lamp',
    'p-wall-art',
  ]);
  return messeRich.has(typeId);
}

export function calcMesseBudget(ctx: BudgetContext): BudgetResult {
  const days = ctx.meta?.messeDays ?? 3;
  // Stand-Fläche = Summe aller Räume (Messe-Templates haben meist 1 Raum).
  const areaQm = ctx.rooms.reduce((s, r) => s + r.w * r.d, 0);
  const standRent = Math.round(areaQm * MESSE_QM_PRICE_PER_DAY.value * days);

  const messeItemCount = ctx.objects.filter((o) => isMesseItem(o.typeId)).length;
  const setupCost = messeItemCount * MESSE_SETUP_PER_ITEM.value;

  const electricity = MESSE_ELECTRICITY_FLAT.value;
  const wifi = MESSE_WIFI_FLAT.value;

  // Teppich-Kosten nur für Grounds, deren Material ein Bodenbelag ist —
  // Rasen/Schotter sind auf Messen keine berechenbare Teppichfläche.
  const CARPET_MATERIALS = new Set(['carpet', 'linoleum', 'tile', 'rubber', 'stage']);
  const carpetQm = (ctx.grounds ?? [])
    .filter((g) => !g.material || CARPET_MATERIALS.has(g.material))
    .reduce((s, g) => s + g.w * g.d, 0);
  const carpetCost = Math.round(carpetQm * MESSE_CARPET_PRICE_PER_QM.value);

  const totalEUR = standRent + setupCost + electricity + wifi + carpetCost;

  const breakdown: BudgetLine[] = [
    { label: `Standmiete ${areaQm.toFixed(1)} m² × ${days} Tage × ${MESSE_QM_PRICE_PER_DAY.value} €/m²/Tag`, eur: standRent },
    { label: `Aufbau & Transport — ${messeItemCount} Messe-Items × ${MESSE_SETUP_PER_ITEM.value} €`, eur: setupCost },
    { label: `Stromanschluss (Grundpaket)`, eur: electricity },
    { label: `WLAN (Messepaket)`, eur: wifi },
  ];
  if (carpetCost > 0) {
    breakdown.push({
      label: `Teppich/Belag — ${carpetQm.toFixed(1)} m² × ${MESSE_CARPET_PRICE_PER_QM.value} €/m²`,
      eur: carpetCost,
    });
  }

  return {
    standRent,
    setupCost,
    electricity,
    wifi,
    carpetCost,
    totalEUR,
    breakdown,
    days,
    areaQm,
  };
}

/** Format a number as EUR with thousands separator (de-DE style). */
export function fmtEUR(n: number): string {
  return n.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';
}
