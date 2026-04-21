import { registerRule } from '../registry.js';
import { haversineM } from '../../geo/overpass.js';

// KCanG § 13: CSC must keep ≥ 200 m straight-line distance from schools,
// Kinder- und Jugendeinrichtungen, Kinderspielplätzen, and Sportstätten.
// The 200 m threshold is the Bund-level floor; some Länder exceed it —
// operators should verify against the local Ausführungsverordnung.
//
// Reference point: the geocoded project address (meta.geocode). POIs are
// loaded via the "POIs laden" button which populates meta.pois from an
// Overpass query within a 500 m search radius (buffer so close-by POIs
// are still visible on the map even if they don't trigger the rule).
const DISTANCE_THRESHOLD_M = 200;

registerRule({
  id: 'poiCscDistance',
  label: 'Abstand 200 m zu Schulen/Kitas/Spielplätzen/Sportstätten (§ 13 KCanG)',
  category: 'poi',
  severity: 'critical',
  modes: ['room'],
  check({ meta }) {
    if (!meta?.address) return { passed: null, details: 'Adresse nicht gesetzt' };
    const pois = meta.pois ?? [];
    if (pois.length === 0) {
      return { passed: null, details: 'Keine POIs geladen — Button "POIs laden" drücken' };
    }
    const origin = meta.geocode;
    if (!origin) return { passed: null, details: 'Geocoding fehlt' };
    const tooClose = pois.filter(
      (p) => haversineM(origin.lat, origin.lon, p.lat, p.lon) < DISTANCE_THRESHOLD_M,
    );
    if (tooClose.length === 0) {
      return {
        passed: true,
        details: `${pois.length} POI(s) im Umkreis, alle ≥ ${DISTANCE_THRESHOLD_M} m`,
      };
    }
    return {
      passed: false,
      details: `${tooClose.length} Konflikt(e): ${tooClose
        .slice(0, 3)
        .map((p) => p.name)
        .join(', ')}${tooClose.length > 3 ? ', …' : ''}`,
    };
  },
});
