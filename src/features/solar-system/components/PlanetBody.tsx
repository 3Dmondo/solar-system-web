import { useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { type ThreeEvent } from '@react-three/fiber';
import { Mesh } from 'three';
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
  const lastTouchTapRef = useRef(0);
  const meshRef = useRef<Mesh>(null);
  const sphereSegments = body.material === 'moon' ? 128 : 64;

  useFrame((_, delta) => {
    if (!meshRef.current || !body.surfaceRotationSpeed) {
      return;
    }

    meshRef.current.rotation.y += delta * body.surfaceRotationSpeed;
  });

  const handleDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(body.id);
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    if (event.pointerType !== 'touch') {
      return;
    }

    const now = performance.now();

    if (now - lastTouchTapRef.current < 320) {
      onSelect(body.id);
      lastTouchTapRef.current = 0;
      return;
    }

    lastTouchTapRef.current = now;
  };

  return (
    <group position={body.position}>
      <mesh
        castShadow
        {...meshProps}
        ref={meshRef}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        receiveShadow
        rotation={body.surfaceRotation}
        scale={focused ? 1.04 : 1}
      >
        <sphereGeometry args={[body.radius, sphereSegments, sphereSegments]} />
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
        <SaturnRings
          bodyId={body.id}
          bodyPosition={body.position}
          onSelect={onSelect}
          radius={body.radius}
        />
      ) : body.material === 'earth' ? (
        <EarthCloudLayer focused={focused} radius={body.radius} />
      ) : null}
    </group>
  );
}
