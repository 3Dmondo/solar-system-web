import { RingGeometry, SRGBColorSpace, TextureLoader } from 'three';

export const SATURN_RING_INNER_MULTIPLIER = 1.25;
export const SATURN_RING_OUTER_MULTIPLIER = 2.25;
export const SATURN_RING_TILT = Math.PI / 2.35;
export const SATURN_SPHERE_TILT = Math.PI / 2 + SATURN_RING_TILT;
export const SATURN_RING_SHADOW_TEXTURE_MIN_U = 0.055;
export const SATURN_RING_SHADOW_TEXTURE_MAX_U = 0.945;
export const SATURN_RING_VISIBLE_TEXTURE_MIN_U = 0.105;
export const SATURN_RING_VISIBLE_TEXTURE_MAX_U = 0.915;

const textureLoader = new TextureLoader();
const saturnRingTextureUrl = new URL('../../../../assets/textures/2k_saturn_ring_alpha.png', import.meta.url)
  .href;

export function createSaturnRingTexture() {
  const texture = textureLoader.load(saturnRingTextureUrl);
  texture.colorSpace = SRGBColorSpace;
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
    const textureU =
      SATURN_RING_VISIBLE_TEXTURE_MIN_U +
      radialT * (SATURN_RING_VISIBLE_TEXTURE_MAX_U - SATURN_RING_VISIBLE_TEXTURE_MIN_U);

    uv.setXY(index, textureU, 0.5);
  }

  uv.needsUpdate = true;

  return geometry;
}

export function createSaturnRingNormal() {
  return [0, -Math.sin(SATURN_RING_TILT), Math.cos(SATURN_RING_TILT)] as const;
}
