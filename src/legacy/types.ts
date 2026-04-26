/**
 * Minimal-Shapes der Legacy-Datenstrukturen, ergänzt nach Bedarf während P17.
 * Ziel ist NICHT die komplette Form abzubilden — nur die Felder die das
 * jeweilige Modul bei der Extraktion braucht. Wenn ein neues Modul mehr
 * Felder benötigt, hier ergänzen statt im Modul selbst zu casten.
 */

export interface CompletedRoom {
  id: string;
  name?: string;
  x: number;
  y: number;
  w: number;
  d: number;
  floorId?: string;
  // weitere Felder hinzufügen wenn andere Module sie brauchen
}

export interface SceneObject {
  typeId: string;
  // weitere Felder hinzufügen wenn andere Module sie brauchen
}

/**
 * Multi-Floor Phase 2 (Mega-Sammel #1): Treppen-Konfiguration. Nur straight
 * in Phase 2; L/Wendel kommen in Phase 3. Werte in Metern.
 */
export interface StairsConfig {
  /** 'straight' = einläufig, 'l' = L-Treppe mit 90° Podest, 'spiral' = Wendeltreppe. */
  shape: 'straight' | 'l' | 'spiral';
  /** Stufen-Höhe in m (Bauordnung: max 0.19). */
  stepHeight: number;
  /** Stufen-Tiefe in m. Bei spiral ungenutzt (durch Radius/Rotation bestimmt). */
  stepDepth: number;
  /** Anzahl Stufen — totalHeight = stepCount * stepHeight. */
  stepCount: number;
  /** Geländer rechts (Default true). */
  withRailing: boolean;
  /**
   * Phase 3 #4: Bei shape='l' — wieviele Stufen vor dem Podest liegen
   * (Lauf 1). Lauf 2 hat dann (stepCount - landingAfter). Default = floor(stepCount/2).
   */
  landingAfter?: number;
  /** Phase 4: Wendeltreppe-Außenradius (m). Default 1.2. */
  outerRadius?: number;
  /** Phase 4: Mittel-Pfosten-Radius (m). Default 0.2. */
  innerRadius?: number;
  /** Phase 4: Gesamt-Rotation in rad — z.B. Math.PI*1.5 für 270°. Default Math.PI*1.5. */
  totalRotation?: number;
}

/**
 * Multi-Floor Phase 2: Floor-Verbindung. Wird gesetzt wenn eine Treppe
 * platziert wird — die Treppe verbindet zwei adjacente Floors.
 */
export interface FloorConnection {
  fromFloorId: string;
  toFloorId: string;
}
