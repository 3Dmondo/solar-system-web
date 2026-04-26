import { useThree } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import { Camera, Vector3 } from 'three';
import { type BodyId } from '../domain/body';

// Minimum separation distance in pixels between indicator centers
const MIN_SEPARATION_PX = 24;
// Maximum radial spread distance in pixels from the original position
const MAX_SPREAD_PX = 60;
// Number of iterations for the spreading algorithm
const SPREAD_ITERATIONS = 3;

type IndicatorPosition = {
  bodyId: BodyId;
  worldPosition: [number, number, number];
  screenPosition: [number, number];
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
 * Applies a radial spread algorithm to separate overlapping indicators.
 * Returns screen-space offsets for each indicator.
 */
function computeSpreadOffsets(
  positions: IndicatorPosition[],
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

  // Iteratively push apart overlapping indicators
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < positions.length; i++) {
      const posA = positions[i]!;
      const offsetA = offsets.get(posA.bodyId)!;
      const screenAx = posA.screenPosition[0] + offsetA[0];
      const screenAy = posA.screenPosition[1] + offsetA[1];

      for (let j = i + 1; j < positions.length; j++) {
        const posB = positions[j]!;
        const offsetB = offsets.get(posB.bodyId)!;
        const screenBx = posB.screenPosition[0] + offsetB[0];
        const screenBy = posB.screenPosition[1] + offsetB[1];

        const dx = screenBx - screenAx;
        const dy = screenBy - screenAy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minSeparation && distance > 0.001) {
          // Calculate push direction and amount
          const overlap = minSeparation - distance;
          const pushAmount = overlap / 2;
          const dirX = dx / distance;
          const dirY = dy / distance;

          // Push both indicators apart
          offsetA[0] -= dirX * pushAmount;
          offsetA[1] -= dirY * pushAmount;
          offsetB[0] += dirX * pushAmount;
          offsetB[1] += dirY * pushAmount;
        } else if (distance < 0.001) {
          // Exactly overlapping - push in a radial pattern
          const angle = (i * 2 * Math.PI) / positions.length;
          const pushAmount = minSeparation / 2;
          offsetA[0] -= Math.cos(angle) * pushAmount;
          offsetA[1] -= Math.sin(angle) * pushAmount;
          offsetB[0] += Math.cos(angle) * pushAmount;
          offsetB[1] += Math.sin(angle) * pushAmount;
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
 * Hook that computes screen-space offsets for overlapping body indicators.
 * Returns a function that calculates spread offsets for a set of visible indicators.
 */
export function useIndicatorSpread() {
  const { camera, size } = useThree();
  const lastOffsetsRef = useRef<Map<BodyId, [number, number]>>(new Map());

  const computeOffsets = useCallback(
    (
      visibleBodies: Array<{
        bodyId: BodyId;
        position: [number, number, number];
      }>
    ): Map<BodyId, [number, number]> => {
      if (visibleBodies.length <= 1) {
        return new Map();
      }

      // Project all body positions to screen space
      const positions: IndicatorPosition[] = visibleBodies.map((body) => ({
        bodyId: body.bodyId,
        worldPosition: body.position,
        screenPosition: projectToScreen(
          body.position,
          camera,
          size.width,
          size.height
        )
      }));

      // Compute spread offsets
      const offsets = computeSpreadOffsets(
        positions,
        MIN_SEPARATION_PX,
        MAX_SPREAD_PX,
        SPREAD_ITERATIONS
      );

      // Smooth transitions by blending with previous offsets
      const smoothedOffsets = new Map<BodyId, [number, number]>();
      const blendFactor = 0.3; // Lower = smoother transitions

      offsets.forEach((newOffset, bodyId) => {
        const prevOffset = lastOffsetsRef.current.get(bodyId);
        if (prevOffset) {
          smoothedOffsets.set(bodyId, [
            prevOffset[0] + (newOffset[0] - prevOffset[0]) * blendFactor,
            prevOffset[1] + (newOffset[1] - prevOffset[1]) * blendFactor
          ]);
        } else {
          smoothedOffsets.set(bodyId, newOffset);
        }
      });

      lastOffsetsRef.current = smoothedOffsets;
      return smoothedOffsets;
    },
    [camera, size.width, size.height]
  );

  return { computeOffsets };
}

/**
 * Configuration for indicator spread behavior
 */
export const SPREAD_CONFIG = {
  minSeparationPx: MIN_SEPARATION_PX,
  maxSpreadPx: MAX_SPREAD_PX,
  iterations: SPREAD_ITERATIONS
} as const;
