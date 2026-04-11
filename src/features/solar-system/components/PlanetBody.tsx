import { type ThreeElements } from '@react-three/fiber';
import { type ThreeEvent } from '@react-three/fiber';
import { type BodyDefinition, type BodyId } from '../domain/body';
import { EarthCloudLayer } from './EarthCloudLayer';
import { EarthSurfaceMaterial } from './EarthSurfaceMaterial';
import { MoonSurfaceMaterial } from './MoonSurfaceMaterial';
import { SaturnRings } from './SaturnRings';
import { SaturnSurfaceMaterial } from './SaturnSurfaceMaterial';

type PlanetBodyProps = ThreeElements['mesh'] & {
  body: BodyDefinition;
  focused: boolean;
  onSelect: (bodyId: BodyId) => void;
};

export function PlanetBody({ body, focused, onSelect, ...meshProps }: PlanetBodyProps) {
  const handleSelect = (event: ThreeEvent<MouseEvent | PointerEvent>) => {
    event.stopPropagation();
    onSelect(body.id);
  };

  return (
    <group position={body.position}>
      <mesh
        castShadow
        {...meshProps}
        onClick={handleSelect}
        onPointerDown={handleSelect}
        receiveShadow
        rotation={body.surfaceRotation}
        scale={focused ? 1.04 : 1}
      >
        <sphereGeometry args={[body.radius, 64, 64]} />
        {body.material === 'saturn' ? (
          <SaturnSurfaceMaterial
            bodyPosition={body.position}
            color={body.color}
            radius={body.radius}
          />
        ) : body.material === 'earth' ? (
          <EarthSurfaceMaterial />
        ) : body.material === 'moon' ? (
          <MoonSurfaceMaterial />
        ) : (
          <meshStandardMaterial color={body.color} metalness={0.02} roughness={0.92} />
        )}
      </mesh>

      {body.hasRings ? (
        <SaturnRings radius={body.radius} onSelect={() => onSelect(body.id)} />
      ) : body.material === 'earth' ? (
        <EarthCloudLayer focused={focused} radius={body.radius} />
      ) : null}
    </group>
  );
}
