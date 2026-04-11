import { getBodyById } from '../data/mockBodyCatalog';
import { type BodyId } from './body';

export function getFocusTarget(bodyId: BodyId): [number, number, number] {
  const body = getBodyById(bodyId);

  if (!body) {
    return [0, 0, 0];
  }

  return body.position;
}

export function getFocusCameraPosition(bodyId: BodyId): [number, number, number] {
  const body = getBodyById(bodyId);

  if (!body) {
    return [0, 2.2, 7.5];
  }

  return [
    body.position[0] + body.focusOffset[0],
    body.position[1] + body.focusOffset[1],
    body.position[2] + body.focusOffset[2]
  ];
}
