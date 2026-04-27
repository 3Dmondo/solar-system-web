/**
 * Star catalog types and loader.
 *
 * Loads the HYG-derived star catalog for rendering a real star field.
 */

// --- Star Types ---

export type Star = {
  /** Right ascension in degrees (0-360) */
  ra: number
  /** Declination in degrees (-90 to +90) */
  dec: number
  /** Apparent magnitude (smaller = brighter) */
  mag: number
  /** Spectral type (first 1-2 characters, e.g., "A0", "G2", "M1") */
  spect?: string
  /** Proper name (e.g., "Sirius", "Vega") */
  name?: string
}

export type StarCatalog = {
  version: string
  source: string
  count: number
  stars: Star[]
}

// --- Constellation Types ---

/** A line segment defined by [RA hours, Dec degrees] endpoints */
export type ConstellationPoint = [raHours: number, decDegrees: number]

export type ConstellationLine = ConstellationPoint[]

export type Constellation = {
  /** IAU 3-letter constellation ID (e.g., "Ori", "UMa") */
  id: string
  /** Full constellation name */
  name: string
  /** Array of line strips connecting stars */
  lines: ConstellationLine[]
}

export type ConstellationCatalog = {
  version: string
  source: string
  constellations: Constellation[]
}

// --- Spectral Type to Color Mapping ---

/** Maps spectral class to RGB color (approximate) */
const SPECTRAL_COLORS: Record<string, [number, number, number]> = {
  O: [0.6, 0.7, 1.0],   // Blue
  B: [0.7, 0.8, 1.0],   // Blue-white
  A: [0.9, 0.9, 1.0],   // White
  F: [1.0, 1.0, 0.9],   // Yellow-white
  G: [1.0, 1.0, 0.8],   // Yellow (like Sun)
  K: [1.0, 0.85, 0.7],  // Orange
  M: [1.0, 0.7, 0.6],   // Red
}

/**
 * Get RGB color for a spectral type.
 * Falls back to white if type is unknown.
 */
export function getSpectralColor(spect?: string): [number, number, number] {
  const white: [number, number, number] = [1.0, 1.0, 1.0]
  if (!spect || spect.length === 0) {
    return white
  }
  const firstChar = spect.charAt(0)
  const classLetter = firstChar.toUpperCase()
  const color = SPECTRAL_COLORS[classLetter]
  return color ?? white
}

// --- Coordinate Conversion ---

const DEG_TO_RAD = Math.PI / 180
const HOURS_TO_RAD = Math.PI / 12

// J2000 ecliptic obliquity for equatorial-to-ecliptic conversion
const J2000_ECLIPTIC_OBLIQUITY_RADIANS = (23.439291111 * Math.PI) / 180
const J2000_ECLIPTIC_OBLIQUITY_COSINE = Math.cos(J2000_ECLIPTIC_OBLIQUITY_RADIANS)
const J2000_ECLIPTIC_OBLIQUITY_SINE = Math.sin(J2000_ECLIPTIC_OBLIQUITY_RADIANS)

/**
 * Convert RA (degrees) and Dec (degrees) to unit vector in J2000 equatorial frame.
 * X points to vernal equinox, Z points to north celestial pole, Y completes right-hand system.
 */
export function raDecDegreesToJ2000(raDeg: number, decDeg: number): [number, number, number] {
  const raRad = raDeg * DEG_TO_RAD
  const decRad = decDeg * DEG_TO_RAD
  const cosDec = Math.cos(decRad)

  return [
    cosDec * Math.cos(raRad),
    cosDec * Math.sin(raRad),
    Math.sin(decRad)
  ]
}

/**
 * Convert RA (hours) and Dec (degrees) to unit vector in J2000 equatorial frame.
 */
export function raHoursDecDegreesToJ2000(raHours: number, decDeg: number): [number, number, number] {
  const raRad = raHours * HOURS_TO_RAD
  const decRad = decDeg * DEG_TO_RAD
  const cosDec = Math.cos(decRad)

  return [
    cosDec * Math.cos(raRad),
    cosDec * Math.sin(raRad),
    Math.sin(decRad)
  ]
}

/**
 * Transform J2000 equatorial unit vector to app render frame (ecliptic-aligned, Y-up).
 * Matches the transformation used for body positions in ephemerisSceneMapping.ts.
 */
export function j2000ToRenderFrame(v: [number, number, number]): [number, number, number] {
  // Step 1: Rotate from equatorial to ecliptic
  const ecliptic: [number, number, number] = [
    v[0],
    v[1] * J2000_ECLIPTIC_OBLIQUITY_COSINE + v[2] * J2000_ECLIPTIC_OBLIQUITY_SINE,
    -v[1] * J2000_ECLIPTIC_OBLIQUITY_SINE + v[2] * J2000_ECLIPTIC_OBLIQUITY_COSINE
  ]
  // Step 2: Swap axes to Y-up render frame: [X, Z, -Y]
  return [ecliptic[0], ecliptic[2], -ecliptic[1]]
}

/**
 * Convert RA (degrees) and Dec (degrees) directly to render frame position.
 */
export function raDecDegreesToRenderFrame(raDeg: number, decDeg: number): [number, number, number] {
  const j2000 = raDecDegreesToJ2000(raDeg, decDeg)
  return j2000ToRenderFrame(j2000)
}

/**
 * Convert RA (hours) and Dec (degrees) directly to render frame position.
 */
export function raHoursDecDegreesToRenderFrame(raHours: number, decDeg: number): [number, number, number] {
  const j2000 = raHoursDecDegreesToJ2000(raHours, decDeg)
  return j2000ToRenderFrame(j2000)
}

// --- Loader ---

export type StarCatalogLoader = {
  loadStars: () => Promise<StarCatalog>
  loadConstellations: () => Promise<ConstellationCatalog>
  clearCache: () => void
}

export function createStarCatalogLoader(
  basePath: string = './stars',
  fetchImpl: typeof fetch = fetch
): StarCatalogLoader {
  let starsPromise: Promise<StarCatalog> | null = null
  let constellationsPromise: Promise<ConstellationCatalog> | null = null

  const loadJson = async (url: string) => {
    const response = await fetchImpl(url)
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  return {
    loadStars: () => {
      if (!starsPromise) {
        starsPromise = loadJson(`${basePath}/catalog.json`).catch((error) => {
          starsPromise = null
          throw error
        })
      }
      return starsPromise
    },

    loadConstellations: () => {
      if (!constellationsPromise) {
        constellationsPromise = loadJson(`${basePath}/constellations.json`).catch((error) => {
          constellationsPromise = null
          throw error
        })
      }
      return constellationsPromise
    },

    clearCache: () => {
      starsPromise = null
      constellationsPromise = null
    }
  }
}

// --- Default Loader Instance ---

let defaultLoader: StarCatalogLoader | null = null

export function getStarCatalogLoader(): StarCatalogLoader {
  if (!defaultLoader) {
    defaultLoader = createStarCatalogLoader()
  }
  return defaultLoader
}
