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
  type: string;
  name: string;
  lat: number;
  lon: number;
}

export interface ProjectMeta {
  memberCount?: number;
  address?: string;
  ageVerification?: boolean;
  pois?: Poi[];
  /** Geocoded lat/lon of the address — filled by loadProjectPois(). */
  geocode?: { lat: number; lon: number };
}

export interface RuleContext {
  rooms: Room[];
  objects: PlacedObject[];
  meta?: ProjectMeta;
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
  check(ctx: RuleContext): RuleResult;
}
