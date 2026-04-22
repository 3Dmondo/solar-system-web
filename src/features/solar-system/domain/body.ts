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
  focusOffset: [number, number, number];
  surfaceRotation?: [number, number, number];
  surfaceRotationSpeed?: number;
  hasRings?: boolean;
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

export type BodyEphemerisProvider = {
  getBodyMetadata: () => BodyMetadata[];
  loadSnapshotAtUtc: (utc: Date | string) => Promise<BodyEphemerisSnapshot>;
  prefetchAroundUtc: (utc: Date | string) => Promise<void>;
  clearCache: () => void;
};
