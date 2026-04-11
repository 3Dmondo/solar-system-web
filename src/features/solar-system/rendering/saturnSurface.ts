import { SRGBColorSpace, TextureLoader } from 'three';

const textureLoader = new TextureLoader();
const saturnSurfaceTextureUrl = new URL('../../../../assets/textures/2k_saturn.jpg', import.meta.url).href;

export function loadSaturnSurfaceTexture() {
  const texture = textureLoader.load(saturnSurfaceTextureUrl);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
