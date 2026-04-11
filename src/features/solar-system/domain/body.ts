export type BodyId = 'saturn' | 'earth' | 'moon';

export type BodyDefinition = {
  id: BodyId;
  displayName: string;
  color: string;
  radius: number;
  position: [number, number, number];
  hasRings?: boolean;
};
