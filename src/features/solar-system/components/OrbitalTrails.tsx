import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { type Object3D } from 'three';
import { type BodyDefinition } from '../domain/body';
import { buildCircularTrailPoints, getMockOrbitalTrails } from '../rendering/mockOrbitalTrails';

const ignoreRaycast: Object3D['raycast'] = () => null;
const TRAIL_LINE_WIDTH = 1.4;

type OrbitalTrailsProps = {
  bodies: BodyDefinition[];
};

export function OrbitalTrails({ bodies }: OrbitalTrailsProps) {
  const trails = useMemo(() => getMockOrbitalTrails(bodies), [bodies]);

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
