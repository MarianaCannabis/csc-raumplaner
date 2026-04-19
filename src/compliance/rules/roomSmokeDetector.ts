import { registerRule } from '../registry.js';
import type { PlacedObject, Room } from '../types.js';

function inRoom(o: PlacedObject, r: Room): boolean {
  return o.x >= r.x && o.x <= r.x + r.w && o.y >= r.y && o.y <= r.y + r.d;
}

registerRule({
  id: 'room-smoke',
  label: 'Rauchmelder im Raum',
  category: 'fire',
  severity: 'high',
  scope: 'room',
  icon: '🔥',
  check({ objects, currentRoom }) {
    if (!currentRoom) return { passed: null };
    const has = objects.some((o) => o.typeId === 'sec-smoke' && inRoom(o, currentRoom));
    return {
      passed: has,
      details: has ? undefined : `Kein Rauchmelder in "${currentRoom.name}"`,
    };
  },
});
