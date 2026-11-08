/**
 * Geolocation helpers with reverse geocoding and fallback nearest-city search.
 */
import { POPULAR_CITIES, DEFAULT_LOCATION } from './cities';

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // Try OpenStreetMap Nominatim reverse geocoding API with 2.5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const address = data.address || {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.suburb ||
        address.county ||
        address.state;
      const country = address.country;

      if (city && country) {
        return `${city}, ${country}`;
      } else if (city) {
        return city;
      }
    }
  } catch (err) {
    // network failure or timeout - fallback to nearest city calculation
  }

  // Fallback: find nearest city in preset list by euclidean distance
  let nearestCity = DEFAULT_LOCATION.name;
  let minDistance = Infinity;

  for (const c of POPULAR_CITIES) {
    const d = Math.hypot(c.latitude - lat, c.longitude - lng);
    if (d < minDistance) {
      minDistance = d;
      nearestCity = `${c.name}, ${c.country}`;
    }
  }

  if (minDistance < 1.0) {
    return nearestCity;
  }

  return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
}
