import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, type ReactNode } from 'react';
import { Group } from 'three';
import { getSkyShellRadius } from '../domain/skyLayer';

type SkyLayerProps = {
  children: ReactNode;
};

/**
 * Shared sky anchor for stars and constellations.
 * Keeps sky geometry centered on the camera with a radius that remains
 * inside the active camera clip planes.
 */
export function SkyLayer({ children }: SkyLayerProps) {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.matrixAutoUpdate = false;
    }
  }, []);

  // Run after default-priority scene updates so we read final camera transform.
  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const radius = getSkyShellRadius(state.camera.near, state.camera.far);
    groupRef.current.position.copy(state.camera.position);
    groupRef.current.scale.setScalar(radius);
    groupRef.current.updateMatrix();
    groupRef.current.updateMatrixWorld();
  }, 1);

  return <group ref={groupRef}>{children}</group>;
}
