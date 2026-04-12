import { RepeatWrapping, SRGBColorSpace, Texture, TextureLoader } from 'three';
import { type BodyId } from '../domain/body';

const textureLoader = new TextureLoader();
const textureCache = new Map<BodyId, Texture>();

const textureUrls: Partial<Record<BodyId, string>> = {
  sun: new URL('../../../../assets/textures/2k_sun.jpg', import.meta.url).href,
  mercury: new URL('../../../../assets/textures/2k_mercury.jpg', import.meta.url).href,
  venus: new URL('../../../../assets/textures/2k_venus_atmosphere.jpg', import.meta.url).href,
  mars: new URL('../../../../assets/textures/2k_mars.jpg', import.meta.url).href,
  jupiter: new URL('../../../../assets/textures/2k_jupiter.jpg', import.meta.url).href,
  saturn: new URL('../../../../assets/textures/2k_saturn.jpg', import.meta.url).href,
  uranus: new URL('../../../../assets/textures/2k_uranus.jpg', import.meta.url).href,
  neptune: new URL('../../../../assets/textures/2k_neptune.jpg', import.meta.url).href
};

function configurePlanetTexture(texture: Texture) {
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  return texture;
}

export function loadMockBodyTexture(bodyId: BodyId) {
  const cached = textureCache.get(bodyId);

  if (cached) {
    return cached;
  }

  const textureUrl = textureUrls[bodyId];

  if (!textureUrl) {
    throw new Error(`No overview texture configured for body: ${bodyId}`);
  }

  const texture = configurePlanetTexture(textureLoader.load(textureUrl));
  textureCache.set(bodyId, texture);
  return texture;
}
