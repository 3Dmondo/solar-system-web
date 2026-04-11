import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  RingGeometry,
  SRGBColorSpace
} from 'three';

export const SATURN_RING_INNER_MULTIPLIER = 1.25;
export const SATURN_RING_OUTER_MULTIPLIER = 2.25;
export const SATURN_RING_TILT = Math.PI / 2.35;

export function createSaturnRingTexture() {
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

export function createSaturnRingGeometry(radius: number) {
  const innerRadius = radius * SATURN_RING_INNER_MULTIPLIER;
  const outerRadius = radius * SATURN_RING_OUTER_MULTIPLIER;
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

export function createSaturnRingNormal() {
  return [0, -Math.sin(SATURN_RING_TILT), Math.cos(SATURN_RING_TILT)] as const;
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
