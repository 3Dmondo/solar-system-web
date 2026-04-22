import { Vector3 } from 'three';

export function getSunLightDirection(bodyPosition: [number, number, number]) {
  return new Vector3(-bodyPosition[0], -bodyPosition[1], -bodyPosition[2]).normalize()
}
