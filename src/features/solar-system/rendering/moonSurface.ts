import { SRGBColorSpace, TextureLoader } from 'three';

const textureLoader = new TextureLoader();

export function loadMoonDayTexture() {
  const texture = textureLoader.load('./assets/textures/2k_moon.jpg');
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
