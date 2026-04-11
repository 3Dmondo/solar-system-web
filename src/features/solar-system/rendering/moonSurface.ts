import { SRGBColorSpace, TextureLoader } from 'three';

const textureLoader = new TextureLoader();
const moonDayTextureUrl = new URL('../../../../assets/textures/2k_moon.jpg', import.meta.url).href;

export function loadMoonDayTexture() {
  const texture = textureLoader.load(moonDayTextureUrl);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
