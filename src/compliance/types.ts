export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  [k: string]: unknown;
}

export interface PlacedObject {
  id: string;
  typeId: string;
  x: number;
  y: number;
  [k: string]: unknown;
}

export interface Poi {
  type: 'school' | 'kindergarten' | 'youth' | 'playground' | 'sports';
  name: string;
  lat: number;
  lon: number;
}

export interface ProjectMeta {
  memberCount?: number;
  address?: string;
  ageVerification?: boolean;
  /** KCanG § 23 — name of the designated prevention officer. */
  preventionOfficer?: string;
  /** KCanG § 14 — operator confirmation that all windows carry visual
   *  screening (foil/film). Project-level flag; geometry-per-window is
   *  not required for compliance. */
  windowsFilmed?: boolean;
  pois?: Poi[];
  /** Geocoded lat/lon of the address — filled by loadProjectPois(). */
  geocode?: { lat: number; lon: number };
  /** P4.4: Messe-mode height cap in metres. When set, any placed object
   *  whose top edge (py + h) exceeds this value fails the messeHeightLimit
   *  rule. Typical values: 2.5 (Mari-Jane Stand), 4.0 (B2B-Messe open ceil).
   *  Undefined = rule skipped (not applicable). */
  maxHeight?: number;
  /** P4.6: Days the stand is open (used by calcMesseBudget). */
  messeDays?: number;

  /** P5.3: m² pro Person für Kapazitätsberechnung. Default 2.0 (ASR A1.2).
   *  Operator kann z.B. für Konferenz-Layout auf 1.5 senken. */
  sqmPerPerson?: number;
  /** P5.3: GEG/EnEV-Klasse für Energie-Ausweis. Multipliziert den
   *  kWh/m²-Wert: 'GEG2024'=1.0, 'EnEV2016'=1.15, 'KfW55'=0.55, 'KfW40'=0.40.
   *  Default 'GEG2024'. */
  energyClass?: 'GEG2024' | 'EnEV2016' | 'KfW55' | 'KfW40';
  /** P5.3: Geplante Personenzahl zur Fire-Safety-Auslegung. Wenn gesetzt,
   *  überschreibt die Feuerlöscher-Berechnung `max(rooms, ceil(people/100))`. */
  plannedPeopleCount?: number;
  /** P5.3: Budget-Obergrenze in € für Kostenrechner/Warnungen.
   *  Null = keine Warnung. */
  budgetCap?: number;
  /** P5.3: AI-Security-Audit-Schwellwert (Score-Punkte) unter dem das
   *  Audit als kritisch markiert. Default 60. */
  securityThresholdPct?: number;

  /** P6.8: Aus einer hochgeladenen Messe-Ordnung extrahierte Regeln.
   *  Pro Projekt temporär gespeichert, nicht zentral registriert.
   *  Struktur ist KI-erzeugt, daher sehr tolerant gegenüber Variationen. */
  regulationRules?: Array<{
    category: 'height' | 'distance' | 'fire' | 'electrical' | 'structural' | 'other';
    severity: 'critical' | 'high' | 'medium' | 'low';
    label: string;
    description: string;
    value?: number;
    unit?: string;
  }>;
  /** P6.8: Name der Quell-Datei (für UI-Referenz). */
  regulationSource?: string;
  /** P6.8: ISO-Datum des Imports. */
  regulationImportedAt?: string;
}

export interface RuleContext {
  rooms: Room[];
  objects: PlacedObject[];
  meta?: ProjectMeta;
  /** Set by evaluateForRoom() when running a 'room'-scoped rule. */
  currentRoom?: Room;
}

export interface RuleResult {
  passed: boolean | null; // null = not applicable
  details?: string;
  markers?: unknown[]; // reserved for 2D overlay in P1.4
  autofix?: () => void;
}

export type RuleCategory =
  | 'room'
  | 'security'
  | 'capacity'
  | 'fire'
  | 'accessibility'
  | 'poi'
  | 'member'
  | 'youth'
  | 'screen'
  | 'escape';

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Rule {
  id: string;
  label: string;
  category: RuleCategory;
  severity: RuleSeverity;
  /** Default 'project'. 'room' rules skip evaluateAll() and are run only
   *  by evaluateForRoom() with currentRoom set. */
  scope?: 'project' | 'room';
  /** Optional single-glyph badge marker for canvas overlays (per-room). */
  icon?: string;
  check(ctx: RuleContext): RuleResult;
}
