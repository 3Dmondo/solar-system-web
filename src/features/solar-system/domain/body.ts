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
  focusOffset: [number, number, number];
  surfaceRotation?: [number, number, number];
  surfaceRotationSpeed?: number;
  hasRings?: boolean;
};

export type BodyState = {
  id: BodyId;
  position: [number, number, number];
};

export type BodyDefinition = BodyMetadata & BodyState;

export type BodySnapshot = {
  capturedAt: string;
  bodies: BodyState[];
};

export type BodyStateProvider = {
  getBodyMetadata: () => BodyMetadata[];
  getSnapshot: (capturedAt?: string) => BodySnapshot;
};
