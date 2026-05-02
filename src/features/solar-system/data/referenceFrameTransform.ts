import type {
  BodyDefinition,
  BodySnapshot,
  BodyState,
  BodyTrail
} from '../domain/body';
import { isSatellite, getParentBody } from '../domain/body';
import type { ReferenceFrame } from '../domain/referenceFrame';
import type { ResolvedBodyCatalog } from './bodyStateStore';

/**
 * Transforms a resolved body catalog to a new reference frame.
 * Works in scene-space coordinates (after scaling from km).
 *
 * - For SSB frame (originBodyId=null): satellite parent-relative trails are
 *   offset to the parent's current SSB position.
 * - For body-centered frames: body positions are transformed, non-satellite trails
 *   are already frame-relative, and satellite parent-relative trails are offset
 *   to the transformed parent position.
 *
 * @param catalog - Original catalog (positions SSB-centered, trails may be frame-relative)
 * @param frame - Target reference frame
 * @returns Transformed catalog
 */
export function transformCatalogToFrame(
  catalog: ResolvedBodyCatalog,
  frame: ReferenceFrame
): ResolvedBodyCatalog {
  const { snapshot, metadata } = catalog;

  // SSB frame: only transform satellite trails to parent-relative
  if (frame.originBodyId === null) {
    const transformedSnapshot: BodySnapshot = {
      ...snapshot,
      trails: transformTrailsForSatellites(snapshot.trails, snapshot.bodies)
    };

    return {
      metadata,
      snapshot: transformedSnapshot,
      bodies: mergeTransformedBodies(metadata, transformedSnapshot.bodies)
    };
  }

  // Find the origin body position
  const originBody = snapshot.bodies.find((b) => b.id === frame.originBodyId);
  if (!originBody) {
    // If origin body not found, return unchanged (shouldn't happen with valid frames)
    return catalog;
  }

  const originPosition = originBody.position;

  // Transform all body positions
  const transformedBodyStates: BodyState[] = snapshot.bodies.map((body) => ({
    id: body.id,
    position: subtractVector(body.position, originPosition)
  }));

  // Non-satellite trails are already frame-relative. Satellite trails remain
  // parent-relative from the provider and are centered on the transformed parent.
  const transformedTrails = transformTrailsForSatellitesInFrame(
    snapshot.trails,
    transformedBodyStates
  );

  const transformedSnapshot: BodySnapshot = {
    ...snapshot,
    bodies: transformedBodyStates,
    trails: transformedTrails
  };

  return {
    metadata,
    snapshot: transformedSnapshot,
    bodies: mergeTransformedBodies(metadata, transformedBodyStates)
  };
}

/**
 * Merge transformed body positions with metadata.
 */
function mergeTransformedBodies(
  metadata: ResolvedBodyCatalog['metadata'],
  bodyStates: BodyState[]
): BodyDefinition[] {
  const statesById = new Map(bodyStates.map((b) => [b.id, b]));

  return metadata.flatMap((meta) => {
    const state = statesById.get(meta.id);
    if (!state) return [];
    return [{ ...meta, ...state }];
  });
}

/**
 * Handle satellite trails in a body-centered frame.
 * Satellite trails are parent-relative from the provider, so offset them to be
 * centered on their parent's position in the selected frame.
 * Non-satellite trails are left unchanged.
 */
function transformTrailsForSatellitesInFrame(
  trails: BodyTrail[],
  transformedBodies: BodyState[]
): BodyTrail[] {
  const bodiesById = new Map(transformedBodies.map((b) => [b.id, b]));

  return trails.map((trail) => {
    if (isSatellite(trail.id)) {
      const parentId = getParentBody(trail.id);
      const parentBody = parentId ? bodiesById.get(parentId) : null;

      if (parentBody && trail.positions.length > 0) {
        return {
          id: trail.id,
          positions: trail.positions.map((pos) => addVector(pos, parentBody.position))
        };
      }
    }

    // Non-satellite trails are already correct (frame-relative from provider)
    return trail;
  });
}

/**
 * For SSB frame, handle satellite trails as parent-relative.
 * Since satellite trail positions are already computed as (satellite - parent),
 * we add parent's current position to show the orbit around where the parent currently is.
 */
function transformTrailsForSatellites(
  trails: BodyTrail[],
  bodies: BodyState[]
): BodyTrail[] {
  const bodiesById = new Map(bodies.map((b) => [b.id, b]));

  return trails.map((trail) => {
    if (isSatellite(trail.id)) {
      const parentId = getParentBody(trail.id);
      const parentBody = parentId ? bodiesById.get(parentId) : null;

      if (parentBody && trail.positions.length > 0) {
        // Trail positions are already (satellite - parent) at each sample time
        // Add parent's current position to show orbit around parent
        return {
          id: trail.id,
          positions: trail.positions.map((pos) => addVector(pos, parentBody.position))
        };
      }
    }

    // Non-satellite trails unchanged
    return trail;
  });
}

function subtractVector(
  a: [number, number, number],
  b: [number, number, number]
): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function addVector(
  a: [number, number, number],
  b: [number, number, number]
): [number, number, number] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
