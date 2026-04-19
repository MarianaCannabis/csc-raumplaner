import { registerRule } from '../registry.js';
import type { Room, PlacedObject } from '../types.js';

// Sichtschutz: KCanG requires that cannabis activity isn't visible from the
// street. For every window-typed object in a room, at least one screening
// element (blind, curtain, frosted glass) must be placed in the SAME room.
//
// We recognise windows by typeId prefix — the legacy catalog uses `aw-` for
// architectural windows (aw-sm, aw-md, aw-lg, aw-sf-*, aw-kipp, aw-dach,
// aw-rund, aw-fest, aw-milchgl, …). Milchglas is self-screening and
// satisfies the rule on its own.
//
// Screens: typeId starts with `sec-blind`, or includes gardine/curtain/
// vorhang (legacy catalog variants).

const WINDOW_PREFIX = /^aw-/;
const SELF_SCREEN_TYPE = /milchgl/i; // frosted glass = screen by itself
const SCREEN_MATCH = /^(sec-blind|gardine|curtain|vorhang)/i;

function inRoom(o: PlacedObject, r: Room): boolean {
  return o.x >= r.x && o.x <= r.x + r.w && o.y >= r.y && o.y <= r.y + r.d;
}

registerRule({
  id: 'visualScreen',
  label: 'Sichtschutz für Fenster',
  category: 'screen',
  severity: 'high',
  check({ rooms, objects }) {
    const windows = objects.filter((o) => WINDOW_PREFIX.test(o.typeId));
    if (windows.length === 0) {
      return { passed: null, details: 'Keine Fenster im Plan' };
    }
    const unscreened: string[] = [];
    for (const win of windows) {
      if (SELF_SCREEN_TYPE.test(win.typeId)) continue; // milk-glass
      const room = rooms.find((r) => inRoom(win, r));
      if (!room) continue; // window outside any room — ignore
      const screened = objects.some(
        (s) => SCREEN_MATCH.test(s.typeId) && inRoom(s, room),
      );
      if (!screened) unscreened.push(`${win.typeId} in ${room.name}`);
    }
    if (unscreened.length === 0) {
      return { passed: true, details: `${windows.length} Fenster, alle mit Sichtschutz` };
    }
    return {
      passed: false,
      details: `${unscreened.length} Fenster ohne Sichtschutz: ${unscreened.slice(0, 3).join(', ')}${unscreened.length > 3 ? ', …' : ''}`,
    };
  },
});
