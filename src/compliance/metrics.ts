import type { Room, PlacedObject, RuleContext } from './types.js';
import { evaluateAll } from './registry.js';

// =============================================================================
// CAPACITY
// =============================================================================

export interface CapacityDetail {
  name: string;
  /** Raum-Fläche in m², auf 1 Nachkommastelle formatiert (Legacy-Format). */
  area: string;
  cap: number;
}

export interface CapacityResult {
  /** Summe pro-Raum `floor(area_i / m2PerMember)` — **Legacy-Formel**, nicht
   *  dasselbe wie `floor(totalM2 / m2PerMember)`: für Räume [3.5, 3.5] gibt
   *  Legacy 2, Aggregat 3. Gezielt per-Raum-Floor erhalten, weil Bruchstück-
   *  Flächen am Rand keine Person tragen. */
  total: number;
  /** Alias für `total` — von neueren Callsites als benennender Feldname genutzt. */
  maxCalculated: number;
  /** Kapazitäts-Basis: Summe aller Raum-Flächen (m²). */
  totalM2: number;
  /** KCanG-Richtwert Flächenbedarf. */
  m2PerMember: number;
  /** KCanG § 11 Obergrenze (500 Mitglieder). */
  hardLimit: number;
  /** `min(total, hardLimit)` — effektiv zulässig. */
  effective: number;
  /** Pro-Raum-Breakdown im Legacy-Format für UI-Listen. */
  details: CapacityDetail[];
}

const M2_PER_MEMBER = 2.0;
const KCANG_HARD_LIMIT = 500;

/** Flächen-basierte Kapazitäts-Rechnung. Input-Filter (z. B. nur curFloor)
 *  liegt beim Caller — diese Funktion rechnet über genau die Räume, die
 *  sie bekommt. */
export function calcCapacity(rooms: Room[]): CapacityResult {
  let total = 0;
  let totalM2 = 0;
  const details: CapacityDetail[] = [];
  for (const r of rooms) {
    const area = r.w * r.d;
    const cap = Math.floor(area / M2_PER_MEMBER);
    total += cap;
    totalM2 += area;
    details.push({ name: r.name, area: area.toFixed(1), cap });
  }
  return {
    total,
    maxCalculated: total,
    totalM2,
    m2PerMember: M2_PER_MEMBER,
    hardLimit: KCANG_HARD_LIMIT,
    effective: Math.min(total, KCANG_HARD_LIMIT),
    details,
  };
}

// =============================================================================
// HEALTH SCORE
// =============================================================================

export interface HealthFlags {
  /** localStorage.getItem('csc-autosave') truthy — legacy signal for "user
   *  has projects safely stored". */
  autosaveEnabled?: boolean;
  /** SB_URL + SB_KEY both present — legacy signal for "cloud backup
   *  configured". Does NOT measure actual sync success. */
  cloudConnected?: boolean;
}

export interface HealthScoreBreakdown {
  /** 0–100, gerundet. Identisch zum Legacy-Rückgabewert `_healthScore`. */
  score: number;
  /** KCanG-Anteil (0–40). */
  kcangPoints: number;
  /** Raum-Anzahl-Anteil (0–15). */
  roomPoints: number;
  /** Möbel-Anzahl-Anteil (0–15). */
  furniturePoints: number;
  /** Sicherheits-Kern-Objekte (0–15). */
  securityPoints: number;
  /** Backup/Cloud-Konfiguration (0–15). */
  backupPoints: number;
  details: {
    kcangPassed: number;
    kcangTotal: number;
    roomCount: number;
    furnitureCount: number;
    securityCoverageRatio: number;
    autosaveOk: boolean;
    cloudOk: boolean;
  };
}

// Legacy-Gewichtung aus index.html:14936 (vor der Extraktion).
// Summe: 40 + 15 + 15 + 15 + 15 = 100. NICHT ändern ohne bewusste
// Entscheidung — sonst driftet jeder Health-Score gegen alle bisher
// gespeicherten Projekte.
const W_KCANG = 40;
const W_ROOMS = 15;
const W_FURNITURE = 15;
const W_SECURITY = 15;
const W_AUTOSAVE = 8; // Legacy teilt die 15 % "Backup" in 8 + 7 auf.
const W_CLOUD = 7;

const SECURITY_CORE_TYPES = ['sec-cam-ceil', 'sec-smoke', 'sec-ext'];

export function calcHealthScore(
  ctx: RuleContext,
  flags: HealthFlags = {},
): HealthScoreBreakdown {
  const entries = evaluateAll(ctx);
  // Legacy bridge semantics: passed:null ⇒ "not applicable" ⇒ treat as pass
  // (otherwise rules like poiCscDistance without an address would drag the
  // score down every time).
  const kcangPassed = entries.filter((e) => e.passed !== false).length;
  const kcangTotal = entries.length;
  const kcangRatio = kcangTotal > 0 ? kcangPassed / kcangTotal : 0;
  const kcangPoints = kcangRatio * W_KCANG;

  // Rooms (Legacy: >=3 full, >=1 half, else none)
  const roomCount = ctx.rooms.length;
  const roomPoints = roomCount >= 3 ? W_ROOMS : roomCount >= 1 ? Math.round(W_ROOMS / 2) : 0;

  // Furniture (Legacy: >=10 full, >=3 half, else none)
  const furnitureCount = ctx.objects.length;
  const furniturePoints =
    furnitureCount >= 10 ? W_FURNITURE : furnitureCount >= 3 ? Math.round(W_FURNITURE / 2) : 0;

  // Security-core type coverage
  const coveredSec = SECURITY_CORE_TYPES.filter((t) =>
    ctx.objects.some((o) => o.typeId === t),
  ).length;
  const securityCoverageRatio = coveredSec / SECURITY_CORE_TYPES.length;
  const securityPoints = securityCoverageRatio * W_SECURITY;

  const autosaveOk = !!flags.autosaveEnabled;
  const cloudOk = !!flags.cloudConnected;
  const backupPoints = (autosaveOk ? W_AUTOSAVE : 0) + (cloudOk ? W_CLOUD : 0);

  const raw = kcangPoints + roomPoints + furniturePoints + securityPoints + backupPoints;
  const score = Math.round(raw);

  return {
    score,
    kcangPoints: Math.round(kcangPoints),
    roomPoints,
    furniturePoints,
    securityPoints: Math.round(securityPoints),
    backupPoints,
    details: {
      kcangPassed,
      kcangTotal,
      roomCount,
      furnitureCount,
      securityCoverageRatio,
      autosaveOk,
      cloudOk,
    },
  };
}

// Avoid "imported but unused" on PlacedObject — keep the import so readers
// see the full context shape this module consumes.
export type { PlacedObject };
