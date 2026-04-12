import { Vector3 } from 'three';
import { MOCK_SUN_POSITION } from '../data/mockBodyCatalog';

export function getSunLightDirection(bodyPosition: [number, number, number]) {
  return new Vector3(...MOCK_SUN_POSITION).sub(new Vector3(...bodyPosition)).normalize();
}
