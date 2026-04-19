import { registerRule } from '../registry.js';
import type { PlacedObject, Room } from '../types.js';

// Accessible door clear-width per DIN 18040-1: ≥ 0.9 m. We don't have
// catalog metadata (`arch === 'door'`) inside the TS context, so we
// match door-ish typeIds directly — mirrors the escape-route worker's
// door heuristic.

const DOOR_TYPE = /^(at-|door|tür)/i;
const MIN_DOOR_WIDTH_M = 0.9;

function inRoom(o: PlacedObject, r: Room): boolean {
  return o.x >= r.x && o.x <= r.x + r.w && o.y >= r.y && o.y <= r.y + r.d;
}

registerRule({
  id: 'room-door-width',
  label: 'Türbreite ≥ 0,9 m',
  category: 'accessibility',
  severity: 'high',
  scope: 'room',
  icon: '🚪',
  check({ objects, currentRoom }) {
    if (!currentRoom) return { passed: null };
    const doors = objects.filter(
      (o) => DOOR_TYPE.test(o.typeId) && inRoom(o, currentRoom),
    );
    if (doors.length === 0) return { passed: null };
    const tooNarrow = doors
      .map((o) => ({ w: typeof o['w'] === 'number' ? (o['w'] as number) : 0, o }))
      .filter((d) => d.w < MIN_DOOR_WIDTH_M);
    if (tooNarrow.length === 0) {
      return { passed: true, details: `${doors.length} Tür(en), alle ≥ ${MIN_DOOR_WIDTH_M} m` };
    }
    return {
      passed: false,
      details: `${tooNarrow.length} Tür(en) < ${MIN_DOOR_WIDTH_M} m (${tooNarrow
        .map((d) => d.w.toFixed(2) + ' m')
        .join(', ')})`,
    };
  },
});
