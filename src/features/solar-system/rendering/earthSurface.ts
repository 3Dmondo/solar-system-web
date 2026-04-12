import {
  LinearFilter,
  LinearMipMapLinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader
} from 'three';

const textureLoader = new TextureLoader();
const earthDayTextureUrl = new URL('../../../../assets/textures/2k_earth_daymap.jpg', import.meta.url).href;
const earthNightTextureUrl = new URL('../../../../assets/textures/2k_earth_nightmap.jpg', import.meta.url)
  .href;
const earthCloudTextureUrl = new URL('../../../../assets/textures/2k_earth_clouds.jpg', import.meta.url)
  .href;
const earthNormalTextureUrl = new URL('../../../../assets/textures/2k_earth_normal_map.png', import.meta.url)
  .href;
const earthSpecularTextureUrl = new URL('../../../../assets/textures/2k_earth_specular_map.png', import.meta.url)
  .href;

export function loadEarthDayTexture() {
  const texture = textureLoader.load(earthDayTextureUrl);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  return texture;
}

export function loadEarthNightTexture() {
  const texture = textureLoader.load(earthNightTextureUrl);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  return texture;
}

export function loadEarthCloudTexture() {
  const texture = textureLoader.load(earthCloudTextureUrl);
  texture.wrapS = RepeatWrapping;
  return texture;
}

export function loadEarthNormalTexture() {
  const texture = textureLoader.load(earthNormalTextureUrl);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipMapLinearFilter;
  texture.wrapS = RepeatWrapping;

  return texture;
}

export function loadEarthSpecularTexture() {
  const texture = textureLoader.load(earthSpecularTextureUrl);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipMapLinearFilter;
  texture.wrapS = RepeatWrapping;

  return texture;
}
