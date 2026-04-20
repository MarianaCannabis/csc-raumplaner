import type { Room, PlacedObject, RuleContext } from './types.js';
import { evaluateAll } from './registry.js';
import { CO2_FACTOR_DE } from '../config/defaults.js';

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
export function calcCapacity(rooms: Room[], meta?: { sqmPerPerson?: number }): CapacityResult {
  // P5.3: User-konfigurierbares m²/Person-Verhältnis via projMeta. Fällt
  // auf ASR-A1.2-Standard 2.0 zurück wenn nicht gesetzt.
  const m2PerMember = (meta && typeof meta.sqmPerPerson === 'number' && meta.sqmPerPerson > 0)
    ? meta.sqmPerPerson
    : M2_PER_MEMBER;
  let total = 0;
  let totalM2 = 0;
  const details: CapacityDetail[] = [];
  for (const r of rooms) {
    const area = r.w * r.d;
    const cap = Math.floor(area / m2PerMember);
    total += cap;
    totalM2 += area;
    details.push({ name: r.name, area: area.toFixed(1), cap });
  }
  return {
    total,
    maxCalculated: total,
    totalM2,
    m2PerMember,
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

// =============================================================================
// FIRE SAFETY — DIN EN 3 / ASR A2.2 / §15 MBO / ASR A3.4/3
// =============================================================================

export interface FireSafetyResult {
  /** 0–100 percent: fraction of 4 sub-checks passed. */
  score: number;
  extinguishersCount: number;
  extinguishersRequired: number;
  smokeDetectorsCount: number;
  smokeDetectorsRequired: number;
  emergencyExitsCount: number;
  emergencyLightsCount: number;
  extinguishersOk: boolean;
  smokeDetectorsOk: boolean;
  emergencyExitsOk: boolean;
  emergencyLightsOk: boolean;
  /** Legacy "Brandschutz erfüllt" gate: löscher AND rauchmelder ok. */
  overallOk: boolean;
  totalArea: number;
  /** Actionable shortfall list, German, legacy-style. */
  issues: string[];
}

export function calcFireSafety(ctx: RuleContext): FireSafetyResult {
  const { rooms, objects, meta } = ctx;
  const totalArea = rooms.reduce((s, r) => s + r.w * r.d, 0);

  // DIN EN 3 / ASR A2.2: 1 extinguisher per 200 m², minimum 1 per
  // Brandabschnitt → floor gives room count; we pick the larger of the
  // two requirements.
  // P5.3: Wenn der Operator eine echte Personenzahl angibt (statt der
  // Auto-Kapazitäts-Schätzung), schlägt die 1-pro-100-Personen-Regel
  // zusätzlich zu.
  let extinguishersRequired = Math.max(rooms.length, Math.ceil(totalArea / 200));
  if (meta && typeof meta.plannedPeopleCount === 'number' && meta.plannedPeopleCount > 0) {
    extinguishersRequired = Math.max(extinguishersRequired, Math.ceil(meta.plannedPeopleCount / 100));
  }
  const extinguishersCount = objects.filter((o) => o.typeId === 'sec-ext').length;

  // §15 MBO: 1 smoke detector per room.
  const smokeDetectorsRequired = rooms.length;
  const smokeDetectorsCount = objects.filter((o) => o.typeId === 'sec-smoke').length;

  const emergencyExitsCount = objects.filter((o) => o.typeId === 'sec-sign-exit').length;
  const emergencyLightsCount = objects.filter((o) => o.typeId === 'sec-emlight').length;

  const extinguishersOk = extinguishersCount >= extinguishersRequired;
  const smokeDetectorsOk = smokeDetectorsCount >= smokeDetectorsRequired;
  const emergencyExitsOk = emergencyExitsCount >= 1;
  const emergencyLightsOk = emergencyLightsCount >= 1;
  const overallOk = extinguishersOk && smokeDetectorsOk;

  const issues: string[] = [];
  if (!extinguishersOk) {
    issues.push(`${extinguishersRequired - extinguishersCount} weitere Feuerlöscher erforderlich`);
  }
  if (!smokeDetectorsOk) {
    issues.push(`${smokeDetectorsRequired - smokeDetectorsCount} weitere Rauchmelder erforderlich`);
  }
  if (!emergencyExitsOk) issues.push('Mind. 1 Notausgang-Schild fehlt');
  if (!emergencyLightsOk) issues.push('Notbeleuchtung fehlt');

  const passedCount = [
    extinguishersOk,
    smokeDetectorsOk,
    emergencyExitsOk,
    emergencyLightsOk,
  ].filter(Boolean).length;
  const score = Math.round((passedCount / 4) * 100);

  return {
    score,
    extinguishersCount,
    extinguishersRequired,
    smokeDetectorsCount,
    smokeDetectorsRequired,
    emergencyExitsCount,
    emergencyLightsCount,
    extinguishersOk,
    smokeDetectorsOk,
    emergencyExitsOk,
    emergencyLightsOk,
    overallOk,
    totalArea,
    issues,
  };
}

// =============================================================================
// ACCESSIBILITY — DIN 18040
// =============================================================================

const ACCESS_DOOR_TYPE_RE = /^(at-|door|tür)/i;
const ACCESS_AUTO_DOOR_TYPES = new Set(['at-karussel', 'at-barriere']);
const ACCESS_MIN_DOOR_WIDTH_M = 0.9;
const ACCESS_MIN_TURN_DIAM_M = 2.0; // Legacy: every room ≥ 2×2 m.

export interface AccessibilityCheck {
  label: string;
  ok: boolean;
  points: number;
  max: number;
}

export interface AccessibilityResult {
  /** 0–100 percent: weighted checks. */
  score: number;
  points: number;
  maxPoints: number;
  checks: AccessibilityCheck[];
}

export function calcAccessibilityScore(ctx: RuleContext): AccessibilityResult {
  const { rooms, objects } = ctx;

  // Legacy used `findItem(typeId).arch === 'door'`. We approximate via
  // typeId prefix — same heuristic as the room-door-width rule and the
  // escape-route worker.
  const hasWideDoor = objects.some((o) => {
    if (!ACCESS_DOOR_TYPE_RE.test(o.typeId)) return false;
    const w = typeof o['w'] === 'number' ? (o['w'] as number) : 0;
    return w >= ACCESS_MIN_DOOR_WIDTH_M;
  });

  // Note: legacy `rooms.every(...)` returns true vacuously for 0 rooms —
  // preserved here so the score doesn't drift on empty layouts. Users see
  // a full 20 pts while no room exists; that matches pre-P2.2 behaviour.
  const turningRadiusOk = rooms.every(
    (r) => r.w >= ACCESS_MIN_TURN_DIAM_M && r.d >= ACCESS_MIN_TURN_DIAM_M,
  );

  const checks: AccessibilityCheck[] = [
    { label: 'Türbreite ≥ 90cm', ok: hasWideDoor, points: 0, max: 20 },
    {
      label: 'WC vorhanden',
      ok: rooms.some((r) => /wc/i.test(r.name)),
      points: 0,
      max: 15,
    },
    {
      label: 'Rampe/Aufzug',
      ok: objects.some((o) => o.typeId === 'rollstuhlrampe'),
      points: 0,
      max: 15,
    },
    { label: 'Wendekr. ≥150cm', ok: turningRadiusOk, points: 0, max: 20 },
    {
      label: 'Notaussch.-Schild',
      ok: objects.some((o) => o.typeId === 'sec-sign-exit'),
      points: 0,
      max: 15,
    },
    {
      label: 'Automatiktür',
      ok: objects.some((o) => ACCESS_AUTO_DOOR_TYPES.has(o.typeId)),
      points: 0,
      max: 15,
    },
  ];
  for (const c of checks) c.points = c.ok ? c.max : 0;
  const points = checks.reduce((s, c) => s + c.points, 0);
  const maxPoints = checks.reduce((s, c) => s + c.max, 0);
  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;

  return { score, points, maxPoints, checks };
}

// =============================================================================
// ENERGY CERTIFICATE — GEG-Anlehnung (nicht rechtsverbindlich)
// =============================================================================

export type EnergyLabel = 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D';

export interface EnergyCertificateResult {
  totalArea: number;
  /** Annual consumption in kWh (heating + lighting, legacy formula). */
  kwh: number;
  kwhPerM2: number;
  label: EnergyLabel;
  labelColor: string;
  /** Annual CO₂ emissions in kg, using CO2_FACTOR_DE from defaults. */
  co2Kg: number;
}

const ENERGY_LABEL_COLORS: Record<EnergyLabel, string> = {
  'A++': '#00aa00',
  'A+': '#44cc00',
  A: '#88dd00',
  B: '#ccdd00',
  C: '#ffcc00',
  D: '#ff8800',
};

// P5.3: Multiplikatoren für Dämmstandards. 1.0 = GEG-2024-Neubau;
// EnEV-2016 ist etwas weniger effizient; KfW-55/40 sind geförderte
// Sanierungen mit deutlich besserer Energiebilanz.
const ENERGY_CLASS_FACTOR: Record<string, number> = {
  GEG2024: 1.0,
  EnEV2016: 1.15,
  KfW55: 0.55,
  KfW40: 0.40,
};

export function energyCertificate(
  rooms: Room[],
  meta?: { energyClass?: 'GEG2024' | 'EnEV2016' | 'KfW55' | 'KfW40' },
): EnergyCertificateResult {
  const totalArea = rooms.reduce((s, r) => s + r.w * r.d, 0);
  // Legacy formula (generateEnergyCertificate pre-P2.2):
  //   lighting_kWh = area · 8 W/m² · 8 h/day · 365 d / 1000
  //   heating_kWh  = area · 50 W/m³ · 2000 HDD / 1000
  // Residential-oriented thresholds; see FUNCTIONS-AUDIT §5.2 for the
  // known issue with commercial-scale kWh/m² skew.
  const baseKwh = (totalArea * 8 / 1000 * 8 * 365) + (totalArea * 50 / 1000 * 2000);
  // P5.3: Dämmstandard-Faktor aus meta.energyClass anwenden.
  const factor = meta && meta.energyClass ? (ENERGY_CLASS_FACTOR[meta.energyClass] ?? 1.0) : 1.0;
  const kwh = baseKwh * factor;
  const kwhPerM2 = totalArea > 0 ? kwh / totalArea : 0;
  const label: EnergyLabel =
    kwhPerM2 < 30 ? 'A++' :
    kwhPerM2 < 50 ? 'A+' :
    kwhPerM2 < 75 ? 'A' :
    kwhPerM2 < 100 ? 'B' :
    kwhPerM2 < 130 ? 'C' : 'D';
  // Legacy used a hardcoded 0.4 kg/kWh — we now use the centralised
  // 363 g/kWh from defaults.ts (P2.0d), aligning with calcCO2Footprint.
  const co2Kg = Math.round(kwh * (CO2_FACTOR_DE.value / 1000));
  return {
    totalArea,
    kwh: Math.round(kwh),
    kwhPerM2,
    label,
    labelColor: ENERGY_LABEL_COLORS[label],
    co2Kg,
  };
}
