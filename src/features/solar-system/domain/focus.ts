import { EMPTY_RESOLVED_BODY_CATALOG, type ResolvedBodyCatalog } from '../data/bodyStateStore'
import { type ViewTargetId } from './body';

export type FocusTransitionProfile = {
  cameraEasingRate: number;
  targetEasingRate: number;
  settleDistanceSquared: number;
};

export type CameraClipPlanes = {
  near: number;
  far: number;
};

export const DEFAULT_CAMERA_FOV_DEGREES = 40;

const DEFAULT_OVERVIEW_CAMERA_POSITION: [number, number, number] = [0, 14, 46];
const DEFAULT_OVERVIEW_CAMERA_DISTANCE = Math.hypot(...DEFAULT_OVERVIEW_CAMERA_POSITION);
const DEFAULT_OVERVIEW_CAMERA_DIRECTION = DEFAULT_OVERVIEW_CAMERA_POSITION.map(
  (value) => value / DEFAULT_OVERVIEW_CAMERA_DISTANCE
) as [number, number, number];
const BODY_FOCUS_DISTANCE_IN_RADII = 10;
const STATIC_OVERVIEW_SCENE_RADIUS_THRESHOLD = 36;
const OVERVIEW_FRAMING_PADDING = 1.08;
const SATURN_VISIBLE_RADIUS_MULTIPLIER = 2.25;
const MIN_CAMERA_NEAR = 0.01;
const MIN_CAMERA_FAR = 100;

export function getFocusDistance(
  bodyId: ViewTargetId,
  catalog: ResolvedBodyCatalog = EMPTY_RESOLVED_BODY_CATALOG,
  aspect = 1
): number {
  if (bodyId === 'overview') {
    return getOverviewCameraDistance(catalog, aspect);
  }

  const body = catalog.bodies.find((candidate) => candidate.id === bodyId);

  if (!body) {
    return Math.hypot(0, 2.2, 7.5);
  }

  return body.radius * BODY_FOCUS_DISTANCE_IN_RADII;
}

export function getFocusTarget(
  bodyId: ViewTargetId,
  catalog: ResolvedBodyCatalog = EMPTY_RESOLVED_BODY_CATALOG
): [number, number, number] {
  if (bodyId === 'overview') {
    return [0, 0, 0];
  }

  const body = catalog.bodies.find((candidate) => candidate.id === bodyId);

  if (!body) {
    return [0, 0, 0];
  }

  return body.position;
}

export function getFocusCameraPosition(
  bodyId: ViewTargetId,
  catalog: ResolvedBodyCatalog = EMPTY_RESOLVED_BODY_CATALOG,
  aspect = 1
): [number, number, number] {
  if (bodyId === 'overview') {
    const overviewDistance = getOverviewCameraDistance(catalog, aspect);

    return [
      DEFAULT_OVERVIEW_CAMERA_DIRECTION[0] * overviewDistance,
      DEFAULT_OVERVIEW_CAMERA_DIRECTION[1] * overviewDistance,
      DEFAULT_OVERVIEW_CAMERA_DIRECTION[2] * overviewDistance
    ];
  }

  const body = catalog.bodies.find((candidate) => candidate.id === bodyId);

  if (!body) {
    return [0, 2.2, 7.5];
  }

  const focusDistance = getFocusDistance(bodyId, catalog, aspect);
  const focusDirection = getNormalizedFocusDirection(body.focusOffset);

  return [
    body.position[0] + focusDirection[0] * focusDistance,
    body.position[1] + focusDirection[1] * focusDistance,
    body.position[2] + focusDirection[2] * focusDistance
  ];
}

export function getFocusCameraPositionForViewDirection(
  bodyId: ViewTargetId,
  viewDirection: [number, number, number],
  catalog: ResolvedBodyCatalog = EMPTY_RESOLVED_BODY_CATALOG,
  aspect = 1
): [number, number, number] {
  if (bodyId === 'overview') {
    return getFocusCameraPosition('overview', catalog, aspect);
  }

  const body = catalog.bodies.find((candidate) => candidate.id === bodyId);

  if (!body) {
    return getFocusCameraPosition(bodyId, catalog);
  }

  const directionLength = Math.hypot(...viewDirection);

  if (directionLength === 0) {
    return getFocusCameraPosition(bodyId, catalog);
  }

  const focusDistance = getFocusDistance(bodyId, catalog, aspect);
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

export function getSceneOverviewRadius(
  catalog: ResolvedBodyCatalog = EMPTY_RESOLVED_BODY_CATALOG
) {
  return catalog.bodies.reduce((maximumRadius, body) => {
    const bodyDistance = Math.hypot(...body.position);
    const visibleRadius = getVisibleBodyRadius(body);

    return Math.max(maximumRadius, bodyDistance + visibleRadius);
  }, 0);
}

export function getViewTargetVisibleRadius(
  bodyId: ViewTargetId,
  catalog: ResolvedBodyCatalog = EMPTY_RESOLVED_BODY_CATALOG
) {
  if (bodyId === 'overview') {
    return getSceneOverviewRadius(catalog);
  }

  const body = catalog.bodies.find((candidate) => candidate.id === bodyId);

  if (!body) {
    return 0;
  }

  return getVisibleBodyRadius(body);
}

export function getCameraClipPlanes(
  bodyId: ViewTargetId,
  cameraPosition: [number, number, number],
  target: [number, number, number],
  catalog: ResolvedBodyCatalog = EMPTY_RESOLVED_BODY_CATALOG
): CameraClipPlanes {
  const targetRadius = getViewTargetVisibleRadius(bodyId, catalog);
  const cameraDistanceToTarget = getDistance(cameraPosition, target);
  const farthestBodyDistance = catalog.bodies.reduce((maximumDistance, body) => {
    const bodyDistance = getDistance(cameraPosition, body.position) + getVisibleBodyRadius(body);

    return Math.max(maximumDistance, bodyDistance);
  }, 0);
  const far = Math.max(
    MIN_CAMERA_FAR,
    farthestBodyDistance * 1.1,
    cameraDistanceToTarget + targetRadius * 2
  );
  const surfaceClearance = Math.max(cameraDistanceToTarget - targetRadius, MIN_CAMERA_NEAR);
  const near = Math.max(
    MIN_CAMERA_NEAR,
    Math.min(surfaceClearance * 0.5, Math.max(targetRadius * 0.25, 0.1), far * 0.5)
  );

  if (far <= near) {
    return {
      near: Math.max(MIN_CAMERA_NEAR, far / 1000),
      far: Math.max(far, MIN_CAMERA_FAR)
    };
  }

  return {
    near,
    far
  };
}

function getOverviewCameraDistance(
  catalog: ResolvedBodyCatalog,
  aspect: number
) {
  const sceneRadius = getSceneOverviewRadius(catalog);

  if (sceneRadius <= STATIC_OVERVIEW_SCENE_RADIUS_THRESHOLD) {
    return DEFAULT_OVERVIEW_CAMERA_DISTANCE;
  }

  const halfVerticalFieldOfView = (DEFAULT_CAMERA_FOV_DEGREES * Math.PI) / 360;
  const normalizedAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const halfHorizontalFieldOfView = Math.atan(
    Math.tan(halfVerticalFieldOfView) * normalizedAspect
  );
  const limitingHalfFieldOfView = Math.min(
    halfVerticalFieldOfView,
    halfHorizontalFieldOfView
  );

  if (!Number.isFinite(limitingHalfFieldOfView) || limitingHalfFieldOfView <= 0) {
    return DEFAULT_OVERVIEW_CAMERA_DISTANCE;
  }

  return Math.max(
    DEFAULT_OVERVIEW_CAMERA_DISTANCE,
    (sceneRadius * OVERVIEW_FRAMING_PADDING) / Math.sin(limitingHalfFieldOfView)
  );
}

function getVisibleBodyRadius(body: ResolvedBodyCatalog['bodies'][number]) {
  return body.hasRings ? body.radius * SATURN_VISIBLE_RADIUS_MULTIPLIER : body.radius;
}

function getDistance(
  left: [number, number, number],
  right: [number, number, number]
) {
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]);
}

function getNormalizedFocusDirection(
  focusOffset: [number, number, number]
): [number, number, number] {
  const focusOffsetLength = Math.hypot(...focusOffset);

  if (focusOffsetLength <= 0) {
    return [0, 0, 1];
  }

  return [
    focusOffset[0] / focusOffsetLength,
    focusOffset[1] / focusOffsetLength,
    focusOffset[2] / focusOffsetLength
  ];
}
