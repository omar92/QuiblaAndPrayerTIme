/**
 * Qibla calculations using spherical trigonometry.
 * Mecca (Kaaba) Coordinates:
 * Latitude: 21.422487° N (21° 25' 21")
 * Longitude: 39.826206° E (39° 49' 34")
 */

export const MECCA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
  altitude: 300, // meters above sea level
  name: 'Mecca (The Holy Kaaba)',
  arabicName: 'مكة المكرمة - الكعبة المشرفة',
};

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculates the great-circle forward azimuth (bearing) from user location to Mecca.
 * Returns angle in degrees [0, 360) clockwise from True North.
 */
export function calculateQiblaDirection(userLat: number, userLng: number): number {
  const phi1 = toRadians(userLat);
  const phi2 = toRadians(MECCA_COORDINATES.latitude);
  const deltaLambda = toRadians(MECCA_COORDINATES.longitude - userLng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const bearingRad = Math.atan2(y, x);
  let bearingDeg = toDegrees(bearingRad);

  return (bearingDeg + 360) % 360;
}

/**
 * Calculates great-circle distance to the Kaaba in kilometers and miles.
 */
export function calculateDistanceToMecca(userLat: number, userLng: number): {
  km: number;
  miles: number;
} {
  const phi1 = toRadians(userLat);
  const phi2 = toRadians(MECCA_COORDINATES.latitude);
  const deltaPhi = toRadians(MECCA_COORDINATES.latitude - userLat);
  const deltaLambda = toRadians(MECCA_COORDINATES.longitude - userLng);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = Math.round(EARTH_RADIUS_KM * c);
  const distanceMiles = Math.round(distanceKm * 0.621371);

  return { km: distanceKm, miles: distanceMiles };
}

/**
 * Calculates compass heading relative to True North.
 * If user points compass towards targetBearing, the offset is targetBearing - deviceHeading.
 */
export function calculateRelativeQibla(
  deviceHeading: number,
  qiblaBearing: number
): {
  relativeAngle: number;
  isAligned: boolean;
  diffFromTarget: number;
} {
  // Normalize both between 0 and 360
  const normHeading = (deviceHeading + 360) % 360;
  const normTarget = (qiblaBearing + 360) % 360;

  // Relative rotation for dial pointer
  let relative = (normTarget - normHeading + 360) % 360;

  // Shortest angular difference (-180 to +180)
  let diff = relative;
  if (diff > 180) diff -= 360;

  const isAligned = Math.abs(diff) <= 3; // within 3 degrees is considered facing Qibla

  return {
    relativeAngle: relative,
    isAligned,
    diffFromTarget: Math.round(diff),
  };
}

export function formatDegrees(deg: number): string {
  const rounded = Math.round(deg * 10) / 10;
  return `${rounded.toFixed(1)}°`;
}
