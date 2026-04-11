import { type ThreeElements } from '@react-three/fiber';
import { type ThreeEvent } from '@react-three/fiber';
import { type BodyDefinition, type BodyId } from '../domain/body';
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
        {body.hasRings ? (
          <SaturnSurfaceMaterial
            bodyPosition={body.position}
            color={body.color}
            radius={body.radius}
          />
        ) : (
          <meshStandardMaterial color={body.color} metalness={0.02} roughness={0.92} />
        )}
      </mesh>

      {body.hasRings ? (
        <SaturnRings radius={body.radius} onSelect={() => onSelect(body.id)} />
      ) : null}
    </group>
  );
}
