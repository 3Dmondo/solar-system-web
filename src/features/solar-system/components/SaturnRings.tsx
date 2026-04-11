import { useMemo } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { DoubleSide } from 'three';
import {
  createSaturnRingGeometry,
  createSaturnRingTexture,
  SATURN_RING_TILT
} from '../rendering/saturnRings';

type SaturnRingsProps = {
  radius: number;
  onSelect: (event: ThreeEvent<MouseEvent | PointerEvent>) => void;
};

export function SaturnRings({ radius, onSelect }: SaturnRingsProps) {
  const ringTexture = useMemo(() => createSaturnRingTexture(), []);
  const geometry = useMemo(() => createSaturnRingGeometry(radius), [radius]);

  return (
    <mesh
      geometry={geometry}
      onClick={onSelect}
      onPointerDown={onSelect}
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
