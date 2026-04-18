import { getBodyById } from '../data/mockBodyCatalog';
import { type ViewTargetId } from './body';

export type FocusTransitionProfile = {
  cameraEasingRate: number;
  targetEasingRate: number;
  settleDistanceSquared: number;
};

export function getFocusDistance(bodyId: ViewTargetId): number {
  if (bodyId === 'overview') {
    return Math.hypot(0, 14, 46);
  }

  const body = getBodyById(bodyId);

  if (!body) {
    return Math.hypot(0, 2.2, 7.5);
  }

  return Math.hypot(...body.focusOffset);
}

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

export function getFocusCameraPositionForViewDirection(
  bodyId: ViewTargetId,
  viewDirection: [number, number, number]
): [number, number, number] {
  if (bodyId === 'overview') {
    return getFocusCameraPosition('overview');
  }

  const body = getBodyById(bodyId);

  if (!body) {
    return getFocusCameraPosition(bodyId);
  }

  const directionLength = Math.hypot(...viewDirection);

  if (directionLength === 0) {
    return getFocusCameraPosition(bodyId);
  }

  const focusDistance = getFocusDistance(bodyId);
  const normalizedDirection = viewDirection.map((value) => value / directionLength) as [
    number,
    number,
    number
  ];

  return [
    body.position[0] + normalizedDirection[0] * focusDistance,
    body.position[1] + normalizedDirection[1] * focusDistance,
    body.position[2] + normalizedDirection[2] * focusDistance
  ];
}

export function getFocusTransitionProfile(
  fromBodyId: ViewTargetId,
  toBodyId: ViewTargetId
): FocusTransitionProfile {
  if (fromBodyId === 'overview' && toBodyId !== 'overview') {
    return {
      cameraEasingRate: 3.8,
      targetEasingRate: 5.6,
      settleDistanceSquared: 0.0001
    };
  }

  if (fromBodyId !== 'overview' && toBodyId === 'overview') {
    return {
      cameraEasingRate: 5.4,
      targetEasingRate: 4.2,
      settleDistanceSquared: 0.0001
    };
  }

  return {
    cameraEasingRate: 4.5,
    targetEasingRate: 4.5,
    settleDistanceSquared: 0.0001
  };
}
