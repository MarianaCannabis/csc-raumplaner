import { registerRule } from '../registry.js';

// Conservative minimum areas per room type. WC < 3 m² is cramped; a social
// lounge under 10 m² isn't really one. Rule returns passed:null for rooms
// whose name doesn't match a known category — it can't judge a generic
// "Raum 3" name.

interface MinAreaProfile {
  minM2: number;
  match: RegExp;
  label: string;
}

const PROFILES: MinAreaProfile[] = [
  { match: /wc|toilet/i, minM2: 3, label: 'WC' },
  { match: /sozial|lounge/i, minM2: 10, label: 'Sozialbereich' },
];

registerRule({
  id: 'room-min-area',
  label: 'Mindestfläche nach Raumtyp',
  category: 'accessibility',
  severity: 'medium',
  scope: 'room',
  icon: '📐',
  check({ currentRoom }) {
    if (!currentRoom) return { passed: null };
    const profile = PROFILES.find((p) => p.match.test(currentRoom.name));
    if (!profile) return { passed: null };
    const area = currentRoom.w * currentRoom.d;
    const ok = area >= profile.minM2;
    return {
      passed: ok,
      details: ok
        ? undefined
        : `${profile.label} "${currentRoom.name}" nur ${area.toFixed(1)} m² (< ${profile.minM2} m²)`,
    };
  },
});
