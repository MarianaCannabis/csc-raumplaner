/**
 * Multi-Floor Phase 2 (Mega-Sammel #4) — Treppen-Mindestbreite-Regel.
 *
 * Bauordnung: Treppen in Notausgangs-Pflicht-Bereichen müssen mind. 1.20 m
 * breit sein. Schmaler = Critical-Fail.
 *
 * Identifikation einer Treppe: typeId beginnt mit 'stairs-'. Object-Width
 * (`w`) wird gegen Mindestmaß geprüft (Default-Catalog-w kann durch User
 * überschrieben werden).
 */

import { registerRule } from '../registry.js';

const MIN_WIDTH_M = 1.2;

registerRule({
  id: 'stairs-min-width',
  label: 'Treppen-Mindestbreite (Bauordnung 1.20m)',
  category: 'escape',
  severity: 'critical',
  modes: ['room'],
  icon: '🪜',
  check({ objects }) {
    const stairs = objects.filter((o) => typeof o.typeId === 'string' && o.typeId.startsWith('stairs-'));
    if (stairs.length === 0) return { passed: null };
    const tooNarrow = stairs.filter((s) => {
      const w = typeof s.w === 'number' ? s.w : 0;
      return w < MIN_WIDTH_M;
    });
    if (tooNarrow.length > 0) {
      return {
        passed: false,
        details:
          tooNarrow.length +
          ' Treppe(n) unter ' +
          MIN_WIDTH_M +
          'm Breite (Notausgang-Pflicht). Bei Mehrgeschossigkeit kritisch.',
      };
    }
    return { passed: true };
  },
});
