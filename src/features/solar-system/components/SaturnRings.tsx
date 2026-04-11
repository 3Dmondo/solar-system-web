import { useMemo, useRef } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { DoubleSide } from 'three';
import { type BodyId } from '../domain/body';
import {
  createSaturnRingGeometry,
  createSaturnRingTexture,
  SATURN_RING_TILT
} from '../rendering/saturnRings';

type SaturnRingsProps = {
  bodyId: BodyId;
  onSelect: (bodyId: BodyId) => void;
  radius: number;
};

export function SaturnRings({ bodyId, onSelect, radius }: SaturnRingsProps) {
  const ringTexture = useMemo(() => createSaturnRingTexture(), []);
  const geometry = useMemo(() => createSaturnRingGeometry(radius), [radius]);
  const lastTouchTapRef = useRef(0);

  const handleDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(bodyId);
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    if (event.pointerType !== 'touch') {
      return;
    }

    const now = performance.now();

    if (now - lastTouchTapRef.current < 320) {
      onSelect(bodyId);
      lastTouchTapRef.current = 0;
      return;
    }

    lastTouchTapRef.current = now;
  };

  return (
    <mesh
      geometry={geometry}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      receiveShadow
      rotation={[SATURN_RING_TILT, 0, 0]}
    >
      <meshStandardMaterial
        color="#fff6dd"
        depthWrite={false}
        emissive="#5f4c26"
        emissiveIntensity={0.22}
        map={ringTexture}
        metalness={0.02}
        opacity={1}
        roughness={0.96}
        side={DoubleSide}
        transparent
      />
    </mesh>
  );
}
