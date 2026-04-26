import { useThree } from '@react-three/fiber';
import { useCallback } from 'react';
import { Vector3 } from 'three';

// Reusable vector to avoid allocations in the hot path
const tempVec = new Vector3();

/**
 * Computes the screen-space radius of a sphere in pixels.
 * Uses the geometric projection of the sphere's world-space radius
 * onto the camera's image plane.
 */
export function computeScreenSpaceRadius(
  worldPosition: [number, number, number],
  worldRadius: number,
  cameraPosition: Vector3,
  fov: number,
  aspect: number,
  viewportHeight: number
): number {
  tempVec.set(...worldPosition);
  const distance = tempVec.distanceTo(cameraPosition);

  if (distance <= worldRadius) {
    // Camera is inside or on the sphere surface - body fills the screen
    return Math.max(viewportHeight, viewportHeight * aspect);
  }

  // Compute the angular size of the sphere
  // For a sphere of radius r at distance d, the angular radius is arcsin(r/d)
  // For small angles, sin(θ) ≈ θ, so angular radius ≈ r/d radians
  const angularRadius = Math.asin(Math.min(worldRadius / distance, 1));

  // Convert FOV from degrees to radians (vertical FOV)
  const fovRad = (fov * Math.PI) / 180;

  // The viewport covers fovRad radians vertically
  // Screen radius in pixels = (angularRadius / (fovRad/2)) * (viewportHeight/2)
  const screenRadius = (angularRadius / fovRad) * viewportHeight;

  return screenRadius;
}

/**
 * Returns a function that computes the screen-space radius of a body.
 * The returned function uses the current camera state.
 */
export function useScreenSpaceRadius() {
  const { camera, size } = useThree();

  const getScreenSpaceRadius = useCallback(
    (worldPosition: [number, number, number], worldRadius: number): number => {
      // Perspective camera has fov property
      const fov = 'fov' in camera ? (camera.fov as number) : 50;
      const aspect = size.width / Math.max(size.height, 1);

      return computeScreenSpaceRadius(
        worldPosition,
        worldRadius,
        camera.position,
        fov,
        aspect,
        size.height
      );
    },
    [camera, size]
  );

  return { getScreenSpaceRadius };
}

/**
 * Batch computation of screen-space radii for multiple bodies.
 * More efficient than calling getScreenSpaceRadius in a loop.
 */
export function computeScreenSpaceRadiiBatch(
  bodies: Array<{ position: [number, number, number]; radius: number }>,
  cameraPosition: Vector3,
  fov: number,
  aspect: number,
  viewportHeight: number
): number[] {
  const fovRad = (fov * Math.PI) / 180;
  
  return bodies.map((body) => {
    tempVec.set(...body.position);
    const distance = tempVec.distanceTo(cameraPosition);

    if (distance <= body.radius) {
      return Math.max(viewportHeight, viewportHeight * aspect);
    }

    const angularRadius = Math.asin(Math.min(body.radius / distance, 1));
    return (angularRadius / fovRad) * viewportHeight;
  });
}
