import { SRGBColorSpace, TextureLoader } from 'three';

const textureLoader = new TextureLoader();

export function loadEarthDayTexture() {
  const texture = textureLoader.load('./assets/textures/2k_earth_daymap.jpg');
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function loadEarthNightTexture() {
  const texture = textureLoader.load('./assets/textures/2k_earth_nightmap.jpg');
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
