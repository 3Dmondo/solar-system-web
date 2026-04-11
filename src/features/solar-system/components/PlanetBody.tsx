import { type ThreeElements } from '@react-three/fiber';
import { type ThreeEvent } from '@react-three/fiber';
import { type BodyDefinition, type BodyId } from '../domain/body';

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
        {...meshProps}
        onClick={handleSelect}
        onPointerDown={handleSelect}
        scale={focused ? 1.04 : 1}
      >
        <sphereGeometry args={[body.radius, 64, 64]} />
        <meshStandardMaterial color={body.color} roughness={0.92} metalness={0.02} />
      </mesh>

      {body.hasRings ? (
        <mesh rotation={[Math.PI / 2.35, 0, 0]}>
          <ringGeometry args={[body.radius * 1.25, body.radius * 2.2, 128]} />
          <meshStandardMaterial
            color="#bba27c"
            roughness={0.9}
            metalness={0}
            side={2}
            transparent
            opacity={0.82}
          />
        </mesh>
      ) : null}
    </group>
  );
}
