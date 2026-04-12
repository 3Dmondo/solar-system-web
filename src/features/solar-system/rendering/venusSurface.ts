import { RepeatWrapping, SRGBColorSpace, TextureLoader } from 'three';

const textureLoader = new TextureLoader();
const venusCloudTextureUrl = new URL('../../../../assets/textures/2k_venus_atmosphere.jpg', import.meta.url)
  .href;

export function loadVenusCloudTexture() {
  const texture = textureLoader.load(venusCloudTextureUrl);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  return texture;
}
