export type BodyId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

export type ViewTargetId = BodyId | 'overview';

export type BodyMaterial = 'basic' | 'sun' | 'saturn' | 'earth' | 'moon' | 'venus';

export type BodyMetadata = {
  id: BodyId;
  displayName: string;
  color: string;
  material?: BodyMaterial;
  radius: number;
  defaultTrailWindowDays?: number;
  /**
   * Multiplier applied to the source ephemeris cadence when preparing trail points.
   * A value of 2 samples the trail twice as often as the source ephemeris body cadence.
   */
  trailSampleRateMultiplier?: number;
  focusOffset: [number, number, number];
  surfaceRotation?: [number, number, number];
  surfaceRotationSpeed?: number;
  hasRings?: boolean;
  /** Body north-pole unit vector in the app render frame (ecliptic-aligned, Y-up). */
  poleDirectionRender?: [number, number, number];
  /** Signed angular velocity in rad/s; negative for retrograde bodies. */
  angularVelocityRadPerSec?: number;
};

export type BodyPhysicalShape = {
  equatorialRadiusKm: number;
  polarRadiusKm: number;
  volumeEquivalentRadiusKm: number;
  flattening: number;
  approximateVolumeKm3: number;
  isTriAxial: boolean;
  isApproximatelySpherical: boolean;
};

export type BodyPhysicalProperties = {
  referenceRadiusKm: number;
  approximateMassKg: number;
  approximateSurfaceGravityMps2: number;
  approximateEscapeVelocityKmPerSec: number;
  approximateBulkDensityKgPerM3: number;
};

export type BodyPoleOrientation = {
  referenceEpoch: string;
  axialTiltDegreesRelativeToJ2000Ecliptic: number;
  poleRightAscensionDegreesAtReferenceEpoch: number;
  poleDeclinationDegreesAtReferenceEpoch: number;
  northPoleUnitVectorJ2000: [number, number, number];
};

export type BodyRotationModel = {
  siderealRotationPeriodHours: number;
  primeMeridianRateDegreesPerDay: number;
  isRetrograde: boolean;
};

export type BodyPhysicalMetadata = {
  id: BodyId;
  naifBodyId: number;
  radiiKm: [number, number, number];
  meanRadiusKm: number;
  gravitationalParameterKm3PerSec2: number;
  shape: BodyPhysicalShape;
  physicalProperties: BodyPhysicalProperties;
  poleOrientation: BodyPoleOrientation;
  rotationModel: BodyRotationModel;
};

export type BodyState = {
  id: BodyId;
  position: [number, number, number];
};

export type BodyEphemerisState = {
  id: BodyId;
  positionKm: [number, number, number];
  velocityKmPerSecond: [number, number, number];
};

export type BodyTrail = {
  id: BodyId;
  positions: Array<[number, number, number]>;
};

export type BodyEphemerisTrail = {
  id: BodyId;
  positionsKm: Array<[number, number, number]>;
};

export type BodyDefinition = BodyMetadata & BodyState;

/**
 * Body hierarchy defining parent-child relationships.
 * Planets orbit the Sun; satellites orbit planets.
 * Used for label occlusion (satellite labels hidden when overlapping parent).
 */
export const BODY_HIERARCHY: Record<BodyId, BodyId | null> = {
  sun: null,
  mercury: 'sun',
  venus: 'sun',
  earth: 'sun',
  moon: 'earth',
  mars: 'sun',
  jupiter: 'sun',
  saturn: 'sun',
  uranus: 'sun',
  neptune: 'sun'
};

/**
 * Returns true if the body is a satellite (orbits a non-Sun body).
 */
export function isSatellite(bodyId: BodyId): boolean {
  const parent = BODY_HIERARCHY[bodyId];
  return parent !== null && parent !== 'sun';
}

/**
 * Returns the parent body ID, or null for the Sun.
 */
export function getParentBody(bodyId: BodyId): BodyId | null {
  return BODY_HIERARCHY[bodyId];
}

export type BodySnapshot = {
  capturedAt: string;
  bodies: BodyState[];
  trails: BodyTrail[];
};

export type BodyEphemerisSnapshot = {
  capturedAt: string;
  approximateTdbSecondsFromJ2000: number;
  chunkFileName: string;
  chunkStartTdbSecondsFromJ2000: number;
  chunkEndTdbSecondsFromJ2000: number;
  bodies: BodyEphemerisState[];
  trails: BodyEphemerisTrail[];
};

export type LoadSnapshotOptions = {
  /**
   * Body ID to use as the origin for trail positions.
   * When set, trail positions are computed relative to this body at each sample time.
   * When null/undefined, trails are in SSB-centered coordinates.
   */
  trailOriginBodyId?: BodyId | null;
};

export type BodyEphemerisProvider = {
  getBodyMetadata: () => BodyMetadata[];
  loadSnapshotAtUtc: (utc: Date | string, options?: LoadSnapshotOptions) => Promise<BodyEphemerisSnapshot>;
  prefetchAroundUtc: (utc: Date | string) => Promise<void>;
  clearCache: () => void;
};
