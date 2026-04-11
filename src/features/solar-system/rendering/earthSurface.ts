import { SRGBColorSpace, TextureLoader } from 'three';

const textureLoader = new TextureLoader();
const earthDayTextureUrl = new URL('../../../../assets/textures/2k_earth_daymap.jpg', import.meta.url).href;
const earthNightTextureUrl = new URL('../../../../assets/textures/2k_earth_nightmap.jpg', import.meta.url)
  .href;
const earthCloudTextureUrl = new URL('../../../../assets/textures/2k_earth_clouds.jpg', import.meta.url)
  .href;

export function loadEarthDayTexture() {
  const texture = textureLoader.load(earthDayTextureUrl);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function loadEarthNightTexture() {
  const texture = textureLoader.load(earthNightTextureUrl);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function loadEarthCloudTexture() {
  return textureLoader.load(earthCloudTextureUrl);
}
