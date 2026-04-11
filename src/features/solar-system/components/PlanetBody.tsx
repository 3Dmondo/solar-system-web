import { type ThreeElements } from '@react-three/fiber';
import { type ThreeEvent } from '@react-three/fiber';
import { type BodyDefinition, type BodyId } from '../domain/body';
import { SaturnRings } from './SaturnRings';

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
        scale={focused ? 1.04 : 1}
      >
        <sphereGeometry args={[body.radius, 64, 64]} />
        <meshStandardMaterial
          color={body.color}
          metalness={0.02}
          roughness={body.hasRings ? 0.82 : 0.92}
        />
      </mesh>

      {body.hasRings ? (
        <SaturnRings radius={body.radius} onSelect={() => onSelect(body.id)} />
      ) : null}
    </group>
  );
}
