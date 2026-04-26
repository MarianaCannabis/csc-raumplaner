/**
 * Multi-Floor Phase 2 (Mega-Sammel #4) — Treppen-Verbindungs-Check.
 *
 * Bei mehreren Floors muss mindestens 1 Treppe vorhanden sein die zwei
 * adjacente Floors verbindet (sonst können obere/untere Floors nicht
 * erreicht werden — Bauordnung: kein erreichbarer Notausgang).
 *
 * Pragmatische Prüfung:
 *   - Wenn `objects` >=1 stairs-Item enthält UND mind. 2 Floors registriert
 *     sind → passed.
 *   - Wenn 2+ Floors aber 0 Treppen → critical-Fail.
 *   - Wenn nur 1 Floor → N/A.
 *
 * Kein Position-Check pro Floor — das käme Phase 3 (zusammen mit
 * 3D-Treppen-Floor-Connection-Validation).
 */

import { registerRule } from '../registry.js';

registerRule({
  id: 'stairs-connection',
  label: 'Treppen-Verbindung bei Mehrgeschossigkeit',
  category: 'escape',
  severity: 'critical',
  modes: ['room'],
  icon: '🪜',
  check({ rooms }) {
    // Floors aus rooms ableiten — eindeutige floorIds.
    const floorIds = new Set<string>();
    for (const r of rooms) {
      const fid = (r as { floorId?: string }).floorId;
      if (typeof fid === 'string' && fid) floorIds.add(fid);
    }
    if (floorIds.size <= 1) return { passed: null }; // N/A bei 1 Floor

    // Floor-Manager-API über window holen (graceful degradation).
    const w = window as unknown as {
      cscFloors?: { isStackedView?: () => boolean };
      floors?: Array<{ id: string }>;
      objects?: Array<{ typeId?: string }>;
    };
    const objs = w.objects ?? [];
    const stairs = objs.filter(
      (o) => typeof o.typeId === 'string' && o.typeId.startsWith('stairs-'),
    );
    if (stairs.length === 0) {
      return {
        passed: false,
        details:
          'Mehrere Etagen erfasst (' +
          floorIds.size +
          '), aber keine Treppe platziert. Notausgang nicht gewährleistet.',
      };
    }
    return { passed: true };
  },
});
