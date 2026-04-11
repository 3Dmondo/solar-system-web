export type ControlProfile = {
  dampingFactor: number;
  rotateSpeed: number;
  zoomSpeed: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
};

export function getControlProfile(isCoarsePointer: boolean): ControlProfile {
  if (isCoarsePointer) {
    return {
      dampingFactor: 0.12,
      rotateSpeed: 0.85,
      zoomSpeed: 0.9,
      minDistance: 1.6,
      maxDistance: 13,
      minPolarAngle: 0.2,
      maxPolarAngle: Math.PI - 0.2
    };
  }

  return {
    dampingFactor: 0.09,
    rotateSpeed: 0.65,
    zoomSpeed: 0.8,
    minDistance: 1.4,
    maxDistance: 14,
    minPolarAngle: 0.12,
    maxPolarAngle: Math.PI - 0.12
  };
}
