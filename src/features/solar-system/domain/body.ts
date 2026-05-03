export type BodyMaterial = 'basic' | 'sun' | 'saturn' | 'earth' | 'moon' | 'venus';

export type BodyCategory = 'star' | 'planet' | 'natural-satellite';
export type BodySpinInitialPhaseStrategy = 'prime-meridian-solar-noon';

type BodySystemGroupId =
  | 'solar-system'
  | 'earth-system'
  | 'mars-system'
  | 'jupiter-system'
  | 'saturn-system'
  | 'uranus-system'
  | 'neptune-system';

type BodyRegistryEntry = {
  naifBodyId: number;
  parentId: string | null;
  category: BodyCategory;
  systemGroupId: BodySystemGroupId;
  displayName: string;
  color: string;
  material?: BodyMaterial;
  radius: number;
  defaultTrailWindowDays?: number;
  trailSampleRateMultiplier?: number;
  focusOffset: [number, number, number];
  hasRings?: boolean;
  spinInitialPhaseStrategy?: BodySpinInitialPhaseStrategy;
};

const BODY_SYSTEM_GROUP_DEFINITIONS: Array<{ id: BodySystemGroupId; label: string }> = [
  {
    id: 'solar-system',
    label: 'Solar system'
  },
  {
    id: 'earth-system',
    label: 'Earth system'
  },
  {
    id: 'mars-system',
    label: 'Mars system'
  },
  {
    id: 'jupiter-system',
    label: 'Jupiter system'
  },
  {
    id: 'saturn-system',
    label: 'Saturn system'
  },
  {
    id: 'uranus-system',
    label: 'Uranus system'
  },
  {
    id: 'neptune-system',
    label: 'Neptune system'
  }
];

function majorMoonEntry({
  naifBodyId,
  parentId,
  systemGroupId,
  displayName,
  color,
  radius,
  defaultTrailWindowDays,
  trailSampleRateMultiplier = 6
}: {
  naifBodyId: number;
  parentId: string;
  systemGroupId: BodySystemGroupId;
  displayName: string;
  color: string;
  radius: number;
  defaultTrailWindowDays: number;
  trailSampleRateMultiplier?: number;
}): BodyRegistryEntry {
  return {
    naifBodyId,
    parentId,
    category: 'natural-satellite',
    systemGroupId,
    displayName,
    color,
    material: 'basic',
    radius,
    defaultTrailWindowDays,
    trailSampleRateMultiplier,
    focusOffset: [0, Math.max(0.03, radius * 0.5), Math.max(0.55, radius * 7.7)]
  };
}

export const BODY_REGISTRY = {
  sun: {
    naifBodyId: 10,
    parentId: null,
    category: 'star',
    systemGroupId: 'solar-system',
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
    category: 'planet',
    systemGroupId: 'solar-system',
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
    category: 'planet',
    systemGroupId: 'solar-system',
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
    category: 'planet',
    systemGroupId: 'solar-system',
    displayName: 'Earth',
    color: '#3a7bd5',
    material: 'earth',
    radius: 0.72,
    defaultTrailWindowDays: 365,
    trailSampleRateMultiplier: 2,
    focusOffset: [0, 0.25, 3.2],
    spinInitialPhaseStrategy: 'prime-meridian-solar-noon'
  },
  moon: {
    naifBodyId: 301,
    parentId: 'earth',
    category: 'natural-satellite',
    systemGroupId: 'earth-system',
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
    category: 'planet',
    systemGroupId: 'solar-system',
    displayName: 'Mars',
    color: '#bf6c4e',
    radius: 0.38,
    defaultTrailWindowDays: 720,
    trailSampleRateMultiplier: 2,
    focusOffset: [0, 0.14, 2.2]
  },
  phobos: majorMoonEntry({
    naifBodyId: 401,
    parentId: 'mars',
    systemGroupId: 'mars-system',
    displayName: 'Phobos',
    color: '#8c7467',
    radius: 0.055,
    defaultTrailWindowDays: 1,
    trailSampleRateMultiplier: 10
  }),
  deimos: majorMoonEntry({
    naifBodyId: 402,
    parentId: 'mars',
    systemGroupId: 'mars-system',
    displayName: 'Deimos',
    color: '#9a8778',
    radius: 0.045,
    defaultTrailWindowDays: 2,
    trailSampleRateMultiplier: 10
  }),
  jupiter: {
    naifBodyId: 599,
    parentId: 'sun',
    category: 'planet',
    systemGroupId: 'solar-system',
    displayName: 'Jupiter',
    color: '#c9a678',
    radius: 1.55,
    defaultTrailWindowDays: 4_332,
    focusOffset: [0, 0.52, 6.4]
  },
  io: majorMoonEntry({
    naifBodyId: 501,
    parentId: 'jupiter',
    systemGroupId: 'jupiter-system',
    displayName: 'Io',
    color: '#d6c76a',
    radius: 0.18,
    defaultTrailWindowDays: 2,
    trailSampleRateMultiplier: 10
  }),
  europa: majorMoonEntry({
    naifBodyId: 502,
    parentId: 'jupiter',
    systemGroupId: 'jupiter-system',
    displayName: 'Europa',
    color: '#d7c5ad',
    radius: 0.16,
    defaultTrailWindowDays: 4,
    trailSampleRateMultiplier: 10
  }),
  ganymede: majorMoonEntry({
    naifBodyId: 503,
    parentId: 'jupiter',
    systemGroupId: 'jupiter-system',
    displayName: 'Ganymede',
    color: '#a99078',
    radius: 0.24,
    defaultTrailWindowDays: 8,
    trailSampleRateMultiplier: 8
  }),
  callisto: majorMoonEntry({
    naifBodyId: 504,
    parentId: 'jupiter',
    systemGroupId: 'jupiter-system',
    displayName: 'Callisto',
    color: '#796b62',
    radius: 0.22,
    defaultTrailWindowDays: 17,
    trailSampleRateMultiplier: 6
  }),
  saturn: {
    naifBodyId: 699,
    parentId: 'sun',
    category: 'planet',
    systemGroupId: 'solar-system',
    displayName: 'Saturn',
    color: '#cdb075',
    material: 'saturn',
    radius: 1.35,
    defaultTrailWindowDays: 8_000,
    focusOffset: [0, 0.45, 5.8],
    hasRings: true
  },
  mimas: majorMoonEntry({
    naifBodyId: 601,
    parentId: 'saturn',
    systemGroupId: 'saturn-system',
    displayName: 'Mimas',
    color: '#bdb7aa',
    radius: 0.06,
    defaultTrailWindowDays: 1,
    trailSampleRateMultiplier: 10
  }),
  enceladus: majorMoonEntry({
    naifBodyId: 602,
    parentId: 'saturn',
    systemGroupId: 'saturn-system',
    displayName: 'Enceladus',
    color: '#dfe3e4',
    radius: 0.075,
    defaultTrailWindowDays: 2,
    trailSampleRateMultiplier: 10
  }),
  tethys: majorMoonEntry({
    naifBodyId: 603,
    parentId: 'saturn',
    systemGroupId: 'saturn-system',
    displayName: 'Tethys',
    color: '#c9c3b9',
    radius: 0.09,
    defaultTrailWindowDays: 2,
    trailSampleRateMultiplier: 10
  }),
  dione: majorMoonEntry({
    naifBodyId: 604,
    parentId: 'saturn',
    systemGroupId: 'saturn-system',
    displayName: 'Dione',
    color: '#beb8ae',
    radius: 0.095,
    defaultTrailWindowDays: 3,
    trailSampleRateMultiplier: 8
  }),
  rhea: majorMoonEntry({
    naifBodyId: 605,
    parentId: 'saturn',
    systemGroupId: 'saturn-system',
    displayName: 'Rhea',
    color: '#b4afa5',
    radius: 0.12,
    defaultTrailWindowDays: 5,
    trailSampleRateMultiplier: 8
  }),
  titan: majorMoonEntry({
    naifBodyId: 606,
    parentId: 'saturn',
    systemGroupId: 'saturn-system',
    displayName: 'Titan',
    color: '#c7934e',
    radius: 0.24,
    defaultTrailWindowDays: 16,
    trailSampleRateMultiplier: 6
  }),
  iapetus: majorMoonEntry({
    naifBodyId: 608,
    parentId: 'saturn',
    systemGroupId: 'saturn-system',
    displayName: 'Iapetus',
    color: '#9d9182',
    radius: 0.115,
    defaultTrailWindowDays: 79,
    trailSampleRateMultiplier: 4
  }),
  uranus: {
    naifBodyId: 799,
    parentId: 'sun',
    category: 'planet',
    systemGroupId: 'solar-system',
    displayName: 'Uranus',
    color: '#92c9d6',
    radius: 0.92,
    defaultTrailWindowDays: 9_125,
    focusOffset: [0, 0.3, 4]
  },
  ariel: majorMoonEntry({
    naifBodyId: 701,
    parentId: 'uranus',
    systemGroupId: 'uranus-system',
    displayName: 'Ariel',
    color: '#bfc7ca',
    radius: 0.095,
    defaultTrailWindowDays: 3,
    trailSampleRateMultiplier: 9
  }),
  umbriel: majorMoonEntry({
    naifBodyId: 702,
    parentId: 'uranus',
    systemGroupId: 'uranus-system',
    displayName: 'Umbriel',
    color: '#777d82',
    radius: 0.095,
    defaultTrailWindowDays: 4,
    trailSampleRateMultiplier: 9
  }),
  titania: majorMoonEntry({
    naifBodyId: 703,
    parentId: 'uranus',
    systemGroupId: 'uranus-system',
    displayName: 'Titania',
    color: '#a5adb0',
    radius: 0.13,
    defaultTrailWindowDays: 9,
    trailSampleRateMultiplier: 9
  }),
  oberon: majorMoonEntry({
    naifBodyId: 704,
    parentId: 'uranus',
    systemGroupId: 'uranus-system',
    displayName: 'Oberon',
    color: '#928a83',
    radius: 0.125,
    defaultTrailWindowDays: 14,
    trailSampleRateMultiplier: 8
  }),
  miranda: majorMoonEntry({
    naifBodyId: 705,
    parentId: 'uranus',
    systemGroupId: 'uranus-system',
    displayName: 'Miranda',
    color: '#aeb6b8',
    radius: 0.065,
    defaultTrailWindowDays: 2,
    trailSampleRateMultiplier: 10
  }),
  neptune: {
    naifBodyId: 899,
    parentId: 'sun',
    category: 'planet',
    systemGroupId: 'solar-system',
    displayName: 'Neptune',
    color: '#557fda',
    radius: 0.88,
    defaultTrailWindowDays: 9_125,
    focusOffset: [0, 0.28, 3.8]
  },
  triton: majorMoonEntry({
    naifBodyId: 801,
    parentId: 'neptune',
    systemGroupId: 'neptune-system',
    displayName: 'Triton',
    color: '#b9bec5',
    radius: 0.16,
    defaultTrailWindowDays: 6,
    trailSampleRateMultiplier: 8
  })
} satisfies Record<string, BodyRegistryEntry>;

export type BodyId = keyof typeof BODY_REGISTRY;

export type SystemTargetId = `system:${BodyId}`;

export type ViewTargetId = BodyId | 'overview' | SystemTargetId;

export const BODY_IDS = Object.keys(BODY_REGISTRY) as BodyId[];

export const BODY_JUMP_GROUPS: Array<{ label: string; bodyIds: BodyId[] }> = [];

export const BODY_SYSTEM_GROUPS: Array<{ label: string; bodyIds: BodyId[] }> =
  BODY_SYSTEM_GROUP_DEFINITIONS.map(({ id, label }) => ({
    label,
    bodyIds: BODY_IDS.filter((bodyId) => getBodyRegistryEntry(bodyId).systemGroupId === id)
  })).filter((group) => group.bodyIds.length > 0);

export function getBodyDiscoveryGroups(availableBodyIds: Iterable<BodyId>) {
  const availableBodyIdSet = new Set(availableBodyIds);
  const groups: Array<{ label: string; bodyIds: BodyId[] }> = [];

  for (const group of BODY_SYSTEM_GROUPS) {
    const bodyIds = group.bodyIds.filter((bodyId) => availableBodyIdSet.has(bodyId));

    if (bodyIds.length === 0) {
      continue;
    }

    groups.push({
      label: group.label,
      bodyIds
    });
  }

  return groups;
}

export type BodySystemTarget = {
  id: SystemTargetId;
  parentBodyId: BodyId;
  label: string;
  satelliteBodyIds: BodyId[];
};

export function getBodySystemTargets(availableBodyIds: Iterable<BodyId>): BodySystemTarget[] {
  const availableBodyIdSet = new Set(availableBodyIds);

  return BODY_IDS.flatMap((parentBodyId) => {
    if (!availableBodyIdSet.has(parentBodyId) || isSatellite(parentBodyId)) {
      return [];
    }

    const satelliteBodyIds = BODY_IDS.filter(
      (bodyId) =>
        availableBodyIdSet.has(bodyId) &&
        isSatellite(bodyId) &&
        getParentBody(bodyId) === parentBodyId
    );

    if (satelliteBodyIds.length === 0) {
      return [];
    }

    return [
      {
        id: createSystemTargetId(parentBodyId),
        parentBodyId,
        label: `${getBodyRegistryEntry(parentBodyId).displayName} system`,
        satelliteBodyIds
      }
    ];
  });
}

export function createSystemTargetId(parentBodyId: BodyId): SystemTargetId {
  return `system:${parentBodyId}`;
}

export function isSystemTargetId(targetId: ViewTargetId): targetId is SystemTargetId {
  return typeof targetId === 'string' && targetId.startsWith('system:');
}

export function getSystemTargetParentBody(targetId: SystemTargetId): BodyId {
  const parentBodyId = targetId.slice('system:'.length) as BodyId;

  if (!BODY_IDS.includes(parentBodyId)) {
    throw new Error(`Unknown system target: ${targetId}`);
  }

  return parentBodyId;
}

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

export function getBodyCategory(bodyId: BodyId) {
  return getBodyRegistryEntry(bodyId).category;
}

export function isStar(bodyId: BodyId): boolean {
  return getBodyCategory(bodyId) === 'star';
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
  /** Optional strategy for initializing the first rendered spin phase. */
  spinInitialPhaseStrategy?: BodySpinInitialPhaseStrategy;
  /** Compact physical facts derived from generated metadata for informational UI. */
  facts?: BodyFacts;
};

export type BodyFacts = {
  meanRadiusKm?: number;
  approximateSurfaceGravityMps2?: number;
  approximateBulkDensityKgPerM3?: number;
  provenance: string;
};

export type BodyPhysicalShape = {
  equatorialRadiusKm?: number;
  polarRadiusKm?: number;
  volumeEquivalentRadiusKm?: number;
  flattening?: number;
  approximateVolumeKm3?: number;
  isTriAxial?: boolean;
  isApproximatelySpherical?: boolean;
};

export type BodyPhysicalProperties = {
  referenceRadiusKm?: number;
  approximateMassKg?: number;
  approximateSurfaceGravityMps2?: number;
  approximateEscapeVelocityKmPerSec?: number;
  approximateBulkDensityKgPerM3?: number;
};

export type BodyPoleOrientation = {
  referenceEpoch?: string;
  axialTiltDegreesRelativeToJ2000Ecliptic?: number;
  poleRightAscensionDegreesAtReferenceEpoch?: number;
  poleDeclinationDegreesAtReferenceEpoch?: number;
  northPoleUnitVectorJ2000?: [number, number, number];
};

export type BodyRotationModel = {
  siderealRotationPeriodHours?: number;
  primeMeridianRateDegreesPerDay?: number;
  isRetrograde?: boolean;
};

export type BodyPhysicalMetadata = {
  id: BodyId;
  naifBodyId: number;
  radiiKm?: [number, number, number];
  meanRadiusKm?: number;
  gravitationalParameterKm3PerSec2?: number;
  shape?: BodyPhysicalShape;
  physicalProperties?: BodyPhysicalProperties;
  poleOrientation?: BodyPoleOrientation;
  rotationModel?: BodyRotationModel;
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
  return getBodyCategory(bodyId) === 'natural-satellite';
}

/**
 * Returns the parent body ID, or null for the Sun.
 */
export function getParentBody(bodyId: BodyId): BodyId | null {
  return BODY_HIERARCHY[bodyId];
}

export function getTidalLockTargetBody(bodyId: BodyId): BodyId | null {
  return isSatellite(bodyId) ? getParentBody(bodyId) : null;
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
   * Body ID to use as the origin for non-satellite trail positions.
   * Satellite trails remain relative to their parent body so frame transforms can
   * center local orbits on the transformed parent position.
   */
  trailOriginBodyId?: BodyId | null;
};

export type BodyEphemerisProvider = {
  getBodyMetadata: () => BodyMetadata[];
  loadSnapshotAtUtc: (utc: Date | string, options?: LoadSnapshotOptions) => Promise<BodyEphemerisSnapshot>;
  prefetchAroundUtc: (utc: Date | string) => Promise<void>;
  clearCache: () => void;
};
