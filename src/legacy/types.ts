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
