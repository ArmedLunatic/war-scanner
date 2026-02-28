const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two lat/lon points in kilometres */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * Convert km distance to a [0,1] proximity score.
 * 0 km → 1.0,  1000 km → 0.0 (linear falloff).
 */
export function geoProximity(dKm: number): number {
  return Math.max(0, 1 - dKm / 1000);
}
