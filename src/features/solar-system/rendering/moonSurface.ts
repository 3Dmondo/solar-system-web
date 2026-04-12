import { SRGBColorSpace, TextureLoader } from 'three';

const textureLoader = new TextureLoader();
const moonDayTextureUrl = new URL('../../../../assets/textures/lroc_color_2k.jpg', import.meta.url).href;
const moonHeightTextureUrl = new URL('../../../../assets/textures/ldem_3_8bit.jpg', import.meta.url).href;

export function loadMoonDayTexture() {
  const texture = textureLoader.load(moonDayTextureUrl);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function loadMoonHeightTexture() {
  return textureLoader.load(moonHeightTextureUrl);
}
