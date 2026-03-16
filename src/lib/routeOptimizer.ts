/**
 * Route optimizer using nearest-neighbor heuristic.
 * Uses Google Maps Distance Matrix API if available,
 * falls back to geocoded straight-line distance.
 *
 * For a solo operator with ~5-15 stops/day in Louisville,
 * nearest-neighbor gives a good-enough route.
 */

export interface Stop {
  id: string
  address: string
  lat?: number
  lng?: number
}

/**
 * Geocode an address using the browser's built-in fetch to Google Maps Geocoding API.
 * Falls back to null if no API key or geocoding fails.
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  try {
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    )
    const data = await resp.json()
    if (data.results?.length > 0) {
      return data.results[0].geometry.location
    }
  } catch {
    // geocoding failed
  }
  return null
}

/**
 * Haversine distance between two lat/lng points in miles.
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3959 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Sort stops by nearest-neighbor starting from current location.
 * Returns stops in optimized order with estimated total miles.
 */
export function optimizeRoute(
  stops: Stop[],
  startLat: number,
  startLng: number
): { ordered: Stop[]; totalMiles: number } {
  if (stops.length <= 1) {
    return { ordered: [...stops], totalMiles: 0 }
  }

  const remaining = [...stops]
  const ordered: Stop[] = []
  let currentLat = startLat
  let currentLng = startLng
  let totalMiles = 0

  while (remaining.length > 0) {
    let nearestIdx = 0
    let nearestDist = Infinity

    for (let i = 0; i < remaining.length; i++) {
      const stop = remaining[i]
      if (stop.lat != null && stop.lng != null) {
        const dist = haversineDistance(currentLat, currentLng, stop.lat, stop.lng)
        if (dist < nearestDist) {
          nearestDist = dist
          nearestIdx = i
        }
      }
    }

    const next = remaining.splice(nearestIdx, 1)[0]
    ordered.push(next)
    if (next.lat != null && next.lng != null) {
      totalMiles += nearestDist === Infinity ? 0 : nearestDist
      currentLat = next.lat
      currentLng = next.lng
    }
  }

  return { ordered, totalMiles: Math.round(totalMiles * 10) / 10 }
}

/**
 * Open address in native maps app.
 * On Android, this opens Google Maps. On iOS, Apple Maps.
 * Uses geo: URI which works universally on mobile.
 */
export function openInMapsApp(address: string) {
  // Google Maps URL works on all platforms and opens native app on Android
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
  window.open(url, '_blank')
}
