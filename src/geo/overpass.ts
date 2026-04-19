// Nominatim (geocode) + Overpass (POI) wrappers for the KCanG distance rule.
// Both services are free but rate-limited; we keep calls explicit (user
// triggers via the "POIs laden" button, not on every keystroke).

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

export async function geocode(address: string): Promise<GeocodeResult | null> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
    encodeURIComponent(address);
  const r = await fetch(url, {
    headers: { 'User-Agent': 'csc-raumplaner/0.1' },
  });
  if (!r.ok) return null;
  const data = (await r.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  const first = data[0];
  if (!first) return null;
  return { lat: +first.lat, lon: +first.lon, displayName: first.display_name };
}

// Protected-POI types under KCanG § 13: Schulen, Kinder- und Jugendein-
// richtungen, Kinderspielplätze, Sportstätten. 'youth' is carried through
// the type union as reserved — community-centre tagging in OSM is too
// irregular to query reliably; can be added later with a curated filter.
export type PoiType = 'school' | 'kindergarten' | 'youth' | 'playground' | 'sports';

export interface Poi {
  type: PoiType;
  name: string;
  lat: number;
  lon: number;
}

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { amenity?: string; leisure?: string; name?: string };
}

// Radius stays at 500 m (200 m rule + headroom for map visualisation).
export async function fetchPois(
  lat: number,
  lon: number,
  radiusM = 500,
): Promise<Poi[]> {
  const query = `[out:json][timeout:25];
    ( node["amenity"~"school|kindergarten"](around:${radiusM},${lat},${lon});
      way["amenity"~"school|kindergarten"](around:${radiusM},${lat},${lon});
      node["leisure"="playground"](around:${radiusM},${lat},${lon});
      way["leisure"="playground"](around:${radiusM},${lat},${lon});
      node["leisure"~"sports_centre|pitch|stadium"](around:${radiusM},${lat},${lon});
      way["leisure"~"sports_centre|pitch|stadium"](around:${radiusM},${lat},${lon}); );
    out center tags;`;
  const r = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
  });
  if (!r.ok) throw new Error('Overpass ' + r.status);
  const data = (await r.json()) as { elements?: OverpassElement[] };
  const out: Poi[] = [];
  for (const e of data.elements ?? []) {
    const pLat = e.lat ?? e.center?.lat;
    const pLon = e.lon ?? e.center?.lon;
    if (pLat == null || pLon == null) continue;
    const amenity = e.tags?.amenity;
    const leisure = e.tags?.leisure;
    let type: PoiType;
    if (amenity === 'kindergarten') type = 'kindergarten';
    else if (amenity === 'school') type = 'school';
    else if (leisure === 'playground') type = 'playground';
    else type = 'sports';
    out.push({
      type,
      name: e.tags?.name ?? amenity ?? leisure ?? 'POI',
      lat: pLat,
      lon: pLon,
    });
  }
  return out;
}

/** Great-circle distance in metres between two WGS-84 lat/lon points. */
export function haversineM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
