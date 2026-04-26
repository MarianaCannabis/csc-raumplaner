/**
 * Multi-Floor Phase 1 (Mega-Sammel ACBD #7-10 / Roadmap v3.0 #2).
 *
 * Pure Floor-Management-Funktionen. UI + 3D-Stacked-Render bleibt
 * im Inline-Script (existing renderFloorTabs/switchFloor/confirmFloor).
 *
 * Floor-Datenmodell:
 *   { id, name, height, zOffset (computed), order }
 *
 * order: -1 für KG, 0 für EG, 1 für OG1, etc. Höhe pro Floor konfigurierbar
 * (Default 3.0 m). zOffset wird kumulativ aus den Höhen berechnet — wenn EG
 * 3m hat, ist OG1 zOffset=3.0; bei OG1 mit 2.5m Höhe ist OG2 zOffset=5.5.
 *
 * Phase 2 (eigene Sitzung): 3D-Treppen-Geometrie, Treppen-Compliance,
 * Treppen-Verbindungs-Logik.
 */

export interface Floor {
  id: string;
  name: string;
  height: number;     // in Metern
  zOffset: number;    // computed
  order: number;      // sort-key
}

export const DEFAULT_FLOOR_HEIGHT = 3.0;

export function getDefaultFloors(): Floor[] {
  return [
    { id: 'eg', name: 'Erdgeschoss', height: DEFAULT_FLOOR_HEIGHT, zOffset: 0, order: 0 },
  ];
}

/**
 * Recomputes zOffset für alle Floors basierend auf Höhe + Order.
 * EG bleibt bei zOffset=0; höhere Floors stapeln sich oben drauf;
 * KG (order<0) liegt unter EG (negative zOffset).
 */
export function recomputeZOffsets(floors: Floor[]): Floor[] {
  const sorted = [...floors].sort((a, b) => a.order - b.order);
  // EG ist Anker (zOffset=0). Über EG: kumulativ + height. Unter EG:
  // kumulativ - height des darunter liegenden Floors.
  const eg = sorted.find((f) => f.order === 0) ?? sorted[0];
  if (!eg) return [];
  const result: Floor[] = sorted.map((f) => ({ ...f }));
  // EG zuerst
  const egIdx = result.findIndex((f) => f.id === eg.id);
  if (egIdx !== -1) result[egIdx]!.zOffset = 0;
  // Floors über EG: kumulativ
  let zAbove = eg.height;
  for (const f of result.filter((f) => f.order > 0).sort((a, b) => a.order - b.order)) {
    const idx = result.findIndex((x) => x.id === f.id);
    if (idx !== -1) result[idx]!.zOffset = zAbove;
    zAbove += f.height;
  }
  // Floors unter EG: negativ kumulativ
  let zBelow = 0;
  for (const f of result.filter((f) => f.order < 0).sort((a, b) => b.order - a.order)) {
    zBelow -= f.height;
    const idx = result.findIndex((x) => x.id === f.id);
    if (idx !== -1) result[idx]!.zOffset = zBelow;
  }
  return result;
}

function nextFloorId(floors: Floor[]): string {
  const ids = new Set(floors.map((f) => f.id));
  let i = 1;
  while (ids.has('floor_' + i)) i++;
  return 'floor_' + i;
}

/**
 * Fügt einen neuen Floor hinzu.
 * - position='above': order = max(order)+1
 * - position='below': order = min(order)-1
 */
export function addFloor(floors: Floor[], position: 'above' | 'below'): Floor[] {
  const orders = floors.map((f) => f.order);
  let newOrder: number;
  let defaultName: string;
  if (position === 'above') {
    newOrder = Math.max(...orders, 0) + 1;
    defaultName = newOrder === 1 ? '1. OG' : newOrder + '. OG';
  } else {
    newOrder = Math.min(...orders, 0) - 1;
    defaultName = newOrder === -1 ? 'Keller' : newOrder + '. UG';
  }
  const newFloor: Floor = {
    id: nextFloorId(floors),
    name: defaultName,
    height: DEFAULT_FLOOR_HEIGHT,
    zOffset: 0,
    order: newOrder,
  };
  return recomputeZOffsets([...floors, newFloor]);
}

export function removeFloor(floors: Floor[], id: string): Floor[] {
  if (floors.length <= 1) return floors;  // Mindestens 1 Floor muss bleiben
  return recomputeZOffsets(floors.filter((f) => f.id !== id));
}

export function renameFloor(floors: Floor[], id: string, newName: string): Floor[] {
  return floors.map((f) => (f.id === id ? { ...f, name: newName } : f));
}

export function setFloorHeight(floors: Floor[], id: string, height: number): Floor[] {
  if (height <= 0 || !Number.isFinite(height)) return floors;
  const next = floors.map((f) => (f.id === id ? { ...f, height } : f));
  return recomputeZOffsets(next);
}

/**
 * Floor-Validation: für UI/PR-Integration. Returnt Liste der Probleme,
 * leer = OK.
 */
export function validateFloors(floors: Floor[]): string[] {
  const issues: string[] = [];
  if (floors.length === 0) issues.push('Mindestens ein Floor erforderlich');
  const ids = new Set<string>();
  for (const f of floors) {
    if (ids.has(f.id)) issues.push(`Doppelte Floor-ID: ${f.id}`);
    ids.add(f.id);
    if (f.height <= 0) issues.push(`Floor "${f.name}" hat ungültige Höhe: ${f.height}`);
  }
  const orders = floors.map((f) => f.order);
  if (new Set(orders).size !== orders.length) issues.push('Doppelte Order-Werte (Floor-Reihenfolge)');
  return issues;
}

/**
 * Lookup-Helper.
 */
export function getFloorById(floors: Floor[], id: string): Floor | null {
  return floors.find((f) => f.id === id) ?? null;
}

export function getFloorAbove(floors: Floor[], id: string): Floor | null {
  const f = getFloorById(floors, id);
  if (!f) return null;
  const above = floors
    .filter((x) => x.order > f.order)
    .sort((a, b) => a.order - b.order);
  return above[0] ?? null;
}

export function getFloorBelow(floors: Floor[], id: string): Floor | null {
  const f = getFloorById(floors, id);
  if (!f) return null;
  const below = floors
    .filter((x) => x.order < f.order)
    .sort((a, b) => b.order - a.order);
  return below[0] ?? null;
}
