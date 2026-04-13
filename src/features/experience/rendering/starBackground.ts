import { RepeatWrapping, SRGBColorSpace, Texture, TextureLoader } from 'three';

const textureLoader = new TextureLoader();
const starBackgroundTextureUrl = new URL('../../../../assets/textures/8k_stars_milky_way.jpg', import.meta.url)
  .href;

let cachedTexture: Texture | null = null;

export function loadStarBackgroundTexture() {
  if (cachedTexture) {
    return cachedTexture;
  }

  const texture = textureLoader.load(starBackgroundTextureUrl);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  cachedTexture = texture;
  return texture;
}
