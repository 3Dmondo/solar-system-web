import { TextureLoader } from 'three';

const textureLoader = new TextureLoader();

export function loadSaturnSurfaceTexture() {
  return textureLoader.load('./assets/textures/2k_saturn.jpg');
}
