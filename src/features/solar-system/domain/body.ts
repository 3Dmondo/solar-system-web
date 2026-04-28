export type BodyMaterial = 'basic' | 'sun' | 'saturn' | 'earth' | 'moon' | 'venus';

type BodyRegistryEntry = {
  naifBodyId: number;
  parentId: string | null;
  displayName: string;
  color: string;
  material?: BodyMaterial;
  radius: number;
  defaultTrailWindowDays?: number;
  trailSampleRateMultiplier?: number;
  focusOffset: [number, number, number];
  hasRings?: boolean;
};

export const BODY_REGISTRY = {
  sun: {
    naifBodyId: 10,
    parentId: null,
    displayName: 'Sun',
    color: '#ffd27a',
    material: 'sun',
    radius: 2.6,
    defaultTrailWindowDays: 0,
    focusOffset: [0, 0.7, 8.8]
  },
  mercury: {
    naifBodyId: 199,
    parentId: 'sun',
    displayName: 'Mercury',
    color: '#9f9183',
    radius: 0.25,
    defaultTrailWindowDays: 120,
    trailSampleRateMultiplier: 2,
    focusOffset: [0, 0.12, 1.8]
  },
  venus: {
    naifBodyId: 299,
    parentId: 'sun',
    displayName: 'Venus',
    color: '#d2a777',
    material: 'venus',
    radius: 0.52,
    defaultTrailWindowDays: 240,
    trailSampleRateMultiplier: 2,
    focusOffset: [0, 0.18, 2.6]
  },
  earth: {
    naifBodyId: 399,
    parentId: 'sun',
    displayName: 'Earth',
    color: '#3a7bd5',
    material: 'earth',
    radius: 0.72,
    defaultTrailWindowDays: 365,
    trailSampleRateMultiplier: 2,
    focusOffset: [0, 0.25, 3.2]
  },
  moon: {
    naifBodyId: 301,
    parentId: 'earth',
    displayName: 'Moon',
    color: '#b0b4be',
    material: 'moon',
    radius: 0.22,
    defaultTrailWindowDays: 27,
    trailSampleRateMultiplier: 5,
    focusOffset: [0, 0.12, 1.7]
  },
  mars: {
    naifBodyId: 499,
    parentId: 'sun',
    displayName: 'Mars',
    color: '#bf6c4e',
    radius: 0.38,
    defaultTrailWindowDays: 720,
    trailSampleRateMultiplier: 2,
    focusOffset: [0, 0.14, 2.2]
  },
  jupiter: {
    naifBodyId: 599,
    parentId: 'sun',
    displayName: 'Jupiter',
    color: '#c9a678',
    radius: 1.55,
    defaultTrailWindowDays: 4_332,
    focusOffset: [0, 0.52, 6.4]
  },
  saturn: {
    naifBodyId: 699,
    parentId: 'sun',
    displayName: 'Saturn',
    color: '#cdb075',
    material: 'saturn',
    radius: 1.35,
    defaultTrailWindowDays: 8_000,
    focusOffset: [0, 0.45, 5.8],
    hasRings: true
  },
  uranus: {
    naifBodyId: 799,
    parentId: 'sun',
    displayName: 'Uranus',
    color: '#92c9d6',
    radius: 0.92,
    defaultTrailWindowDays: 9_125,
    focusOffset: [0, 0.3, 4]
  },
  neptune: {
    naifBodyId: 899,
    parentId: 'sun',
    displayName: 'Neptune',
    color: '#557fda',
    radius: 0.88,
    defaultTrailWindowDays: 9_125,
    focusOffset: [0, 0.28, 3.8]
  }
} satisfies Record<string, BodyRegistryEntry>;

export type BodyId = keyof typeof BODY_REGISTRY;

export type ViewTargetId = BodyId | 'overview';

export const BODY_IDS = Object.keys(BODY_REGISTRY) as BodyId[];

export const BODY_JUMP_GROUPS: Array<{ label: string; bodyIds: BodyId[] }> = [
  {
    label: 'Quick picks',
    bodyIds: ['sun', 'earth', 'moon', 'saturn']
  },
  {
    label: 'Inner planets',
    bodyIds: ['mercury', 'venus', 'mars']
  },
  {
    label: 'Outer planets',
    bodyIds: ['jupiter', 'uranus', 'neptune']
  }
];

const bodyIdsByNaifId = new Map<number, BodyId>(
  BODY_IDS.map((bodyId) => [BODY_REGISTRY[bodyId].naifBodyId, bodyId])
);

export function getBodyRegistryEntry(bodyId: BodyId): BodyRegistryEntry {
  return BODY_REGISTRY[bodyId];
}

export function getNaifBodyId(bodyId: BodyId) {
  return getBodyRegistryEntry(bodyId).naifBodyId;
}

export function getBodyIdForNaifBodyId(naifBodyId: number) {
  return bodyIdsByNaifId.get(naifBodyId);
}

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

export const BODY_HIERARCHY = BODY_IDS.reduce(
  (hierarchy, bodyId) => {
    hierarchy[bodyId] = getBodyRegistryEntry(bodyId).parentId as BodyId | null;
    return hierarchy;
  },
  {} as Record<BodyId, BodyId | null>
);

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
