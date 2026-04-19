import { registerRule } from '../registry.js';
import { haversineM } from '../../geo/overpass.js';

// KCanG §5 Abs. 2: CSC must be ≥ 100 m away from schools, Kitas, playgrounds,
// and sports facilities. We geocode the project address once (cached in
// meta.geocode) and treat that as the reference point. POIs come from
// Overpass in a 500 m radius so "close misses" are still visible.
registerRule({
  id: 'poi100m',
  label: '100m Abstand zu Schulen/Kitas/Sportstätten',
  category: 'poi',
  severity: 'critical',
  check({ meta }) {
    if (!meta?.address) return { passed: null, details: 'Adresse nicht gesetzt' };
    const pois = meta.pois ?? [];
    if (pois.length === 0) {
      return { passed: null, details: 'Keine POIs geladen — Button "POIs laden" drücken' };
    }
    const origin = meta.geocode;
    if (!origin) return { passed: null, details: 'Geocoding fehlt' };
    const tooClose = pois.filter(
      (p) => haversineM(origin.lat, origin.lon, p.lat, p.lon) < 100,
    );
    if (tooClose.length === 0) {
      return {
        passed: true,
        details: `${pois.length} POI(s) in 500m Umkreis, alle ≥ 100m`,
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
