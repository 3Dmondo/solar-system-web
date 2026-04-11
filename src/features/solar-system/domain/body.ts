export type BodyId = 'saturn' | 'earth' | 'moon';

export type BodyMaterial = 'basic' | 'saturn' | 'earth' | 'moon';

export type BodyDefinition = {
  id: BodyId;
  displayName: string;
  color: string;
  material?: BodyMaterial;
  radius: number;
  position: [number, number, number];
  focusOffset: [number, number, number];
  surfaceRotation?: [number, number, number];
  hasRings?: boolean;
};
