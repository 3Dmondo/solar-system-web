export type BodyId = 'saturn' | 'earth' | 'moon';

export type BodyDefinition = {
  id: BodyId;
  displayName: string;
  color: string;
  radius: number;
  position: [number, number, number];
  focusOffset: [number, number, number];
  surfaceRotation?: [number, number, number];
  hasRings?: boolean;
};
