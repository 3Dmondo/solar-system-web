import { Vector3 } from 'three';

export function getSunLightDirection(
  bodyPosition: [number, number, number],
  sunPosition: [number, number, number] = [0, 0, 0]
) {
  return new Vector3(
    sunPosition[0] - bodyPosition[0],
    sunPosition[1] - bodyPosition[1],
    sunPosition[2] - bodyPosition[2]
  ).normalize()
}
