import { type Camera, Vector3 } from 'three';
import {
  getParentBody,
  isSatellite,
  type BodyDefinition,
  type BodyId,
  type ViewTargetId
} from './body';

export const SATELLITE_ADORNMENT_VISIBILITY = {
  minParentSeparationPx: 44,
  parentRadiusMultiplier: 1.15,
  parentRadiusPaddingPx: 24
} as const;

export type SatelliteAdornmentVisibilityInput = {
  isSatellite: boolean;
  forcedVisible?: boolean;
  parentScreenRadiusPx?: number;
  screenSeparationFromParentPx?: number;
};

export function shouldShowSatelliteAdornment({
  isSatellite,
  forcedVisible = false,
  parentScreenRadiusPx,
  screenSeparationFromParentPx
}: SatelliteAdornmentVisibilityInput): boolean {
  if (!isSatellite || forcedVisible) {
    return true;
  }

  if (
    parentScreenRadiusPx == null ||
    screenSeparationFromParentPx == null ||
    !Number.isFinite(parentScreenRadiusPx) ||
    !Number.isFinite(screenSeparationFromParentPx)
  ) {
    return true;
  }

  const minSeparationPx = Math.max(
    SATELLITE_ADORNMENT_VISIBILITY.minParentSeparationPx,
    parentScreenRadiusPx * SATELLITE_ADORNMENT_VISIBILITY.parentRadiusMultiplier +
      SATELLITE_ADORNMENT_VISIBILITY.parentRadiusPaddingPx
  );

  return screenSeparationFromParentPx >= minSeparationPx;
}

const tempVec = new Vector3();
const tempParentVec = new Vector3();

export function shouldShowBodySatelliteAdornment(
  body: BodyDefinition,
  bodiesById: Map<BodyId, BodyDefinition>,
  camera: Camera,
  viewportWidth: number,
  viewportHeight: number,
  fov: number,
  focusedBodyId: ViewTargetId
) {
  if (!isSatellite(body.id)) {
    return true;
  }

  const parentId = getParentBody(body.id);
  const parent = parentId ? bodiesById.get(parentId) : undefined;

  if (!parent || focusedBodyId === body.id || focusedBodyId === parentId) {
    return true;
  }

  const bodyScreenPosition = projectToScreen(body.position, camera, viewportWidth, viewportHeight);
  const parentScreenPosition = projectToScreen(parent.position, camera, viewportWidth, viewportHeight);
  const screenSeparationFromParentPx = Math.hypot(
    bodyScreenPosition[0] - parentScreenPosition[0],
    bodyScreenPosition[1] - parentScreenPosition[1]
  );
  const parentScreenRadiusPx = getScreenRadiusPx(parent, camera, viewportHeight, fov);

  return shouldShowSatelliteAdornment({
    isSatellite: true,
    parentScreenRadiusPx,
    screenSeparationFromParentPx
  });
}

function projectToScreen(
  worldPosition: [number, number, number],
  camera: Camera,
  viewportWidth: number,
  viewportHeight: number
): [number, number] {
  tempVec.set(...worldPosition);
  tempVec.project(camera);

  return [
    ((tempVec.x + 1) / 2) * viewportWidth,
    ((tempVec.y + 1) / 2) * viewportHeight
  ];
}

function getScreenRadiusPx(
  body: BodyDefinition,
  camera: Camera,
  viewportHeight: number,
  fov: number
) {
  tempParentVec.set(...body.position);
  const distance = tempParentVec.distanceTo(camera.position);

  if (distance <= body.radius) {
    return viewportHeight;
  }

  const angularRadius = Math.asin(Math.min(body.radius / distance, 1));
  const fovRad = (fov * Math.PI) / 180;
  return (angularRadius / fovRad) * viewportHeight;
}
