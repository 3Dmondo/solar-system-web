import { useMemo } from 'react';
import { type Object3D } from 'three';
import { mockedSolarSystemBodies } from '../data/mockBodyCatalog';
import { buildCircularTrailPositions, getMockOrbitalTrails } from '../rendering/mockOrbitalTrails';

const ignoreRaycast: Object3D['raycast'] = () => null;

export function OrbitalTrails() {
  const trails = useMemo(() => getMockOrbitalTrails(mockedSolarSystemBodies), []);

  return (
    <group renderOrder={-0.5}>
      {trails.map((trail) => {
        const positions = buildCircularTrailPositions(trail.radius, trail.verticalOffset);

        return (
          <lineLoop key={trail.bodyId} position={trail.center} raycast={ignoreRaycast}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              color={trail.color}
              depthWrite={false}
              opacity={trail.opacity}
              toneMapped={false}
              transparent
            />
          </lineLoop>
        );
      })}
    </group>
  );
}
