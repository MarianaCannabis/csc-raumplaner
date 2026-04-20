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
