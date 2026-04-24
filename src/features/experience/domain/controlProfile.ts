import { EMPTY_RESOLVED_BODY_CATALOG, type ResolvedBodyCatalog } from '../../solar-system/data/bodyStateStore'
import { type ViewTargetId } from '../../solar-system/domain/body';
import {
  getFocusDistance,
  getSceneOverviewRadius,
  getViewTargetVisibleRadius
} from '../../solar-system/domain/focus';

export type ControlProfile = {
  dampingFactor: number;
  rotateSpeed: number;
  zoomSpeed: number;
  minPolarAngle: number;
  maxPolarAngle: number;
};

export type ControlDistanceRange = {
  minDistance: number;
  maxDistance: number;
};

const staticOverviewSceneRadiusThreshold = 36;

export function getControlProfile(isCoarsePointer: boolean): ControlProfile {
  if (isCoarsePointer) {
    return {
      dampingFactor: 0.12,
      rotateSpeed: 0.85,
      zoomSpeed: 0.9,
      minPolarAngle: 0.2,
      maxPolarAngle: Math.PI - 0.2
    };
  }

  return {
    dampingFactor: 0.09,
    rotateSpeed: 0.65,
    zoomSpeed: 0.8,
    minPolarAngle: 0.12,
    maxPolarAngle: Math.PI - 0.12
  };
}

export function getControlDistanceRange(
  focusedBodyId: ViewTargetId,
  catalog: ResolvedBodyCatalog = EMPTY_RESOLVED_BODY_CATALOG,
  isCoarsePointer = false
): ControlDistanceRange {
  const baseRange = isCoarsePointer
    ? { minDistance: 1.6, maxDistance: 52 }
    : { minDistance: 1.4, maxDistance: 56 };
  const sceneRadius = getSceneOverviewRadius(catalog);

  if (sceneRadius <= staticOverviewSceneRadiusThreshold) {
    return baseRange;
  }

  const overviewDistance = getFocusDistance('overview', catalog);

  if (focusedBodyId === 'overview') {
    return {
      minDistance: Math.max(baseRange.minDistance, getOverviewMinDistance(catalog)),
      maxDistance: Math.max(baseRange.maxDistance, overviewDistance * 6)
    };
  }

  const visibleRadius = getViewTargetVisibleRadius(focusedBodyId, catalog);
  const focusDistance = getFocusDistance(focusedBodyId, catalog);

  return {
    minDistance: Math.max(baseRange.minDistance, visibleRadius * 1.15, focusDistance * 0.25),
    maxDistance: Math.max(baseRange.maxDistance, overviewDistance * 1.25, focusDistance * 64)
  };
}

function getOverviewMinDistance(
  catalog: ResolvedBodyCatalog = EMPTY_RESOLVED_BODY_CATALOG
) {
  const nonCentralBodyDistances = catalog.bodies
    .map((body) => Math.hypot(...body.position))
    .filter((distance) => distance > 0);
  const nearestBodyDistance = nonCentralBodyDistances.length > 0
    ? Math.min(...nonCentralBodyDistances)
    : 0;
  const centralBodyVisibleRadius = catalog.bodies.reduce((maxRadius, body) => {
    if (Math.hypot(...body.position) > 0) {
      return maxRadius;
    }

    return Math.max(maxRadius, body.hasRings ? body.radius * 2.25 : body.radius);
  }, 0);

  return Math.max(
    centralBodyVisibleRadius * 2,
    nearestBodyDistance > 0 ? nearestBodyDistance * 0.2 : 0
  );
}
