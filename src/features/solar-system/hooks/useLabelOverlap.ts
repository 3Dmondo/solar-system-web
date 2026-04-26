import { useThree } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import { Camera, Vector3 } from 'three';
import { type BodyId, getParentBody, isSatellite } from '../domain/body';

/**
 * Estimated label dimensions in pixels for overlap detection.
 * Labels are approximately 70px wide and 20px tall.
 */
const LABEL_WIDTH_PX = 70;
const LABEL_HEIGHT_PX = 20;

/** Minimum separation between label centers in pixels */
const MIN_SEPARATION_PX = 40;

/** Maximum spread distance from original position in pixels */
const MAX_SPREAD_PX = 80;

/** Number of iterations for the spreading algorithm */
const SPREAD_ITERATIONS = 3;

/** Smoothing factor for offset transitions (lower = smoother) */
const BLEND_FACTOR = 0.3;

export type LabelPosition = {
  bodyId: BodyId;
  screenX: number;
  screenY: number;
  /** Vertical offset already applied (label above body) */
  baseOffsetY: number;
};

export type LabelOverlapResult = {
  /** Whether the label should be hidden due to hierarchy occlusion */
  occluded: boolean;
  /** Screen-space offset [x, y] in pixels to apply for spreading */
  offset: [number, number];
};

// Reusable vector for projection calculations
const tempVec = new Vector3();

/**
 * Projects a world position to screen coordinates.
 * Returns [x, y] in pixels from bottom-left corner.
 */
function projectToScreen(
  worldPosition: [number, number, number],
  camera: Camera,
  width: number,
  height: number
): [number, number] {
  tempVec.set(...worldPosition);
  tempVec.project(camera);

  // Convert from NDC (-1 to 1) to screen pixels
  const x = ((tempVec.x + 1) / 2) * width;
  const y = ((tempVec.y + 1) / 2) * height;

  return [x, y];
}

/**
 * Check if two label bounding boxes overlap.
 */
function labelsOverlap(
  a: { x: number; y: number },
  b: { x: number; y: number },
  width: number = LABEL_WIDTH_PX,
  height: number = LABEL_HEIGHT_PX
): boolean {
  return (
    Math.abs(a.x - b.x) < width &&
    Math.abs(a.y - b.y) < height
  );
}

/**
 * Compute spread offsets for labels using iterative pushing algorithm.
 * Similar to useIndicatorSpread but with label-specific separation.
 */
function computeSpreadOffsets(
  positions: Array<{
    bodyId: BodyId;
    screenX: number;
    screenY: number;
  }>,
  minSeparation: number,
  maxSpread: number,
  iterations: number
): Map<BodyId, [number, number]> {
  if (positions.length <= 1) {
    return new Map();
  }

  // Initialize offsets to zero
  const offsets = new Map<BodyId, [number, number]>();
  for (const pos of positions) {
    offsets.set(pos.bodyId, [0, 0]);
  }

  // Iteratively push apart overlapping labels
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < positions.length; i++) {
      const posA = positions[i]!;
      const offsetA = offsets.get(posA.bodyId)!;
      const screenAx = posA.screenX + offsetA[0];
      const screenAy = posA.screenY + offsetA[1];

      for (let j = i + 1; j < positions.length; j++) {
        const posB = positions[j]!;
        const offsetB = offsets.get(posB.bodyId)!;
        const screenBx = posB.screenX + offsetB[0];
        const screenBy = posB.screenY + offsetB[1];

        const dx = screenBx - screenAx;
        const dy = screenBy - screenAy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minSeparation && distance > 0.001) {
          // Calculate push direction and amount
          const overlap = minSeparation - distance;
          const pushAmount = overlap / 2;
          const dirX = dx / distance;
          const dirY = dy / distance;

          // Push both labels apart
          offsetA[0] -= dirX * pushAmount;
          offsetA[1] -= dirY * pushAmount;
          offsetB[0] += dirX * pushAmount;
          offsetB[1] += dirY * pushAmount;
        } else if (distance < 0.001) {
          // Exactly overlapping - push horizontally (prefer horizontal spread for labels)
          const pushAmount = minSeparation / 2;
          offsetA[0] -= pushAmount;
          offsetB[0] += pushAmount;
        }
      }
    }
  }

  // Clamp offsets to max spread distance
  offsets.forEach((offset, bodyId) => {
    const length = Math.sqrt(offset[0] * offset[0] + offset[1] * offset[1]);
    if (length > maxSpread) {
      const scale = maxSpread / length;
      offset[0] *= scale;
      offset[1] *= scale;
    }
    offsets.set(bodyId, offset);
  });

  return offsets;
}

/**
 * Hook that computes label visibility and spread offsets.
 *
 * Implements a hybrid strategy:
 * - Hierarchy occlusion: Satellite labels hidden when overlapping their parent
 * - Spreading: Same-level labels (planets) spread apart when overlapping
 */
export function useLabelOverlap() {
  const { camera, size } = useThree();
  const lastOffsetsRef = useRef<Map<BodyId, [number, number]>>(new Map());

  const computeOverlaps = useCallback(
    (
      visibleLabels: Array<{
        bodyId: BodyId;
        worldPosition: [number, number, number];
      }>
    ): Map<BodyId, LabelOverlapResult> => {
      const results = new Map<BodyId, LabelOverlapResult>();

      if (visibleLabels.length === 0) {
        return results;
      }

      // Project all label positions to screen space
      const screenPositions = visibleLabels.map((label) => {
        const [x, y] = projectToScreen(
          label.worldPosition,
          camera,
          size.width,
          size.height
        );
        return {
          bodyId: label.bodyId,
          screenX: x,
          screenY: y
        };
      });

      // Build lookup for quick access
      const positionMap = new Map<BodyId, { screenX: number; screenY: number }>();
      for (const pos of screenPositions) {
        positionMap.set(pos.bodyId, { screenX: pos.screenX, screenY: pos.screenY });
      }

      // Step 1: Determine which satellites should be occluded
      const occludedBodies = new Set<BodyId>();

      for (const pos of screenPositions) {
        if (!isSatellite(pos.bodyId)) continue;

        const parentId = getParentBody(pos.bodyId);
        if (!parentId) continue;

        const parentPos = positionMap.get(parentId);
        if (!parentPos) continue;

        // Check if satellite label overlaps parent label
        if (labelsOverlap(
          { x: pos.screenX, y: pos.screenY },
          { x: parentPos.screenX, y: parentPos.screenY }
        )) {
          occludedBodies.add(pos.bodyId);
        }
      }

      // Step 2: Filter to non-occluded labels for spreading
      const nonOccludedPositions = screenPositions.filter(
        (pos) => !occludedBodies.has(pos.bodyId)
      );

      // Step 3: Compute spread offsets for non-occluded labels
      const spreadOffsets = computeSpreadOffsets(
        nonOccludedPositions,
        MIN_SEPARATION_PX,
        MAX_SPREAD_PX,
        SPREAD_ITERATIONS
      );

      // Step 4: Smooth transitions by blending with previous offsets
      const smoothedOffsets = new Map<BodyId, [number, number]>();

      spreadOffsets.forEach((newOffset, bodyId) => {
        const prevOffset = lastOffsetsRef.current.get(bodyId);
        if (prevOffset) {
          smoothedOffsets.set(bodyId, [
            prevOffset[0] + (newOffset[0] - prevOffset[0]) * BLEND_FACTOR,
            prevOffset[1] + (newOffset[1] - prevOffset[1]) * BLEND_FACTOR
          ]);
        } else {
          smoothedOffsets.set(bodyId, newOffset);
        }
      });

      // Clear offsets for bodies no longer visible
      lastOffsetsRef.current.forEach((_, bodyId) => {
        if (!spreadOffsets.has(bodyId)) {
          // Fade out the offset
          const prev = lastOffsetsRef.current.get(bodyId)!;
          if (Math.abs(prev[0]) > 0.1 || Math.abs(prev[1]) > 0.1) {
            smoothedOffsets.set(bodyId, [
              prev[0] * (1 - BLEND_FACTOR),
              prev[1] * (1 - BLEND_FACTOR)
            ]);
          }
        }
      });

      lastOffsetsRef.current = smoothedOffsets;

      // Step 5: Build final results
      for (const pos of screenPositions) {
        const isOccluded = occludedBodies.has(pos.bodyId);
        const offset = smoothedOffsets.get(pos.bodyId) ?? [0, 0];

        results.set(pos.bodyId, {
          occluded: isOccluded,
          offset
        });
      }

      return results;
    },
    [camera, size.width, size.height]
  );

  return { computeOverlaps };
}

/**
 * Configuration for label overlap behavior (exported for testing)
 */
export const LABEL_OVERLAP_CONFIG = {
  labelWidthPx: LABEL_WIDTH_PX,
  labelHeightPx: LABEL_HEIGHT_PX,
  minSeparationPx: MIN_SEPARATION_PX,
  maxSpreadPx: MAX_SPREAD_PX,
  iterations: SPREAD_ITERATIONS,
  blendFactor: BLEND_FACTOR
} as const;

// Export internals for testing
export const __testing = {
  labelsOverlap,
  computeSpreadOffsets,
  projectToScreen
};
