import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { type Object3D } from 'three';
import { mockedSolarSystemBodies } from '../data/mockBodyCatalog';
import { buildCircularTrailPoints, getMockOrbitalTrails } from '../rendering/mockOrbitalTrails';

const ignoreRaycast: Object3D['raycast'] = () => null;
const TRAIL_LINE_WIDTH = 1.4;

export function OrbitalTrails() {
  const trails = useMemo(() => getMockOrbitalTrails(mockedSolarSystemBodies), []);

  return (
    <group renderOrder={-0.5}>
      {trails.map((trail) => {
        const points = buildCircularTrailPoints(trail.radius, trail.verticalOffset);

        return (
          <Line
            key={trail.bodyId}
            color={trail.color}
            lineWidth={TRAIL_LINE_WIDTH}
            points={points}
            position={trail.center}
            raycast={ignoreRaycast}
            renderOrder={-0.5}
            transparent={false}
          />
        );
      })}
    </group>
  );
}
