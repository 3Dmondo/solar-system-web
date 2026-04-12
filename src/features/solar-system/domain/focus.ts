import { getBodyById } from '../data/mockBodyCatalog';
import { type ViewTargetId } from './body';

export function getFocusTarget(bodyId: ViewTargetId): [number, number, number] {
  if (bodyId === 'overview') {
    return [0, 0, 0];
  }

  const body = getBodyById(bodyId);

  if (!body) {
    return [0, 0, 0];
  }

  return body.position;
}

export function getFocusCameraPosition(bodyId: ViewTargetId): [number, number, number] {
  if (bodyId === 'overview') {
    return [0, 14, 46];
  }

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
