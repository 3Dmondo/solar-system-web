import { useMemo } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  DoubleSide,
  LinearFilter,
  RingGeometry,
  SRGBColorSpace
} from 'three';

type SaturnRingsProps = {
  radius: number;
  onSelect: (event: ThreeEvent<MouseEvent | PointerEvent>) => void;
};

export function SaturnRings({ radius, onSelect }: SaturnRingsProps) {
  const ringTexture = useMemo(() => createRingTexture(), []);
  const geometry = useMemo(() => createRingGeometry(radius), [radius]);

  return (
    <mesh
      castShadow
      geometry={geometry}
      onClick={onSelect}
      onPointerDown={onSelect}
      receiveShadow
      rotation={[Math.PI / 2.35, 0, 0]}
    >
      <meshStandardMaterial
        alphaMap={ringTexture}
        alphaTest={0.08}
        color="#d8c39a"
        depthWrite={false}
        map={ringTexture}
        metalness={0.02}
        opacity={0.95}
        roughness={0.96}
        side={DoubleSide}
        transparent
      />
    </mesh>
  );
}

function createRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 32;

  const context = canvas.getContext('2d');

  if (!context) {
    return new CanvasTexture(canvas);
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x += 1) {
    const t = x / (canvas.width - 1);
    const alpha = getRingAlpha(t);
    const tone = getRingTone(t);
    const lightness = 62 + tone * 18;

    context.fillStyle = `hsla(38, 42%, ${lightness}%, ${alpha})`;
    context.fillRect(x, 0, 1, canvas.height);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function createRingGeometry(radius: number) {
  const innerRadius = radius * 1.25;
  const outerRadius = radius * 2.25;
  const geometry = new RingGeometry(innerRadius, outerRadius, 256, 1);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;

  if (!position || !uv) {
    return geometry;
  }

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const radialDistance = Math.sqrt(x * x + y * y);
    const radialT = (radialDistance - innerRadius) / (outerRadius - innerRadius);

    uv.setXY(index, radialT, 0.5);
  }

  uv.needsUpdate = true;

  return geometry;
}

function getRingAlpha(t: number) {
  if (t < 0.1) {
    return 0;
  }

  if (t < 0.18) {
    return 0.12;
  }

  if (t < 0.28) {
    return 0.34;
  }

  if (t < 0.45) {
    return 0.62;
  }

  if (t < 0.58) {
    return 0.38;
  }

  if (t < 0.72) {
    return 0.72;
  }

  if (t < 0.9) {
    return 0.46;
  }

  return 0.18;
}

function getRingTone(t: number) {
  const waves =
    Math.sin(t * 52) * 0.06 +
    Math.sin(t * 140) * 0.03 +
    Math.cos(t * 18) * 0.04;

  return Math.max(-0.14, Math.min(0.16, waves));
}
