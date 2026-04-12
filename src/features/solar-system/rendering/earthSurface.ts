import {
  LinearFilter,
  LinearMipMapLinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader
} from 'three';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader.js';

const textureLoader = new TextureLoader();
const tiffLoader = new TIFFLoader();
const earthDayTextureUrl = new URL('../../../../assets/textures/2k_earth_daymap.jpg', import.meta.url).href;
const earthNightTextureUrl = new URL('../../../../assets/textures/2k_earth_nightmap.jpg', import.meta.url)
  .href;
const earthCloudTextureUrl = new URL('../../../../assets/textures/2k_earth_clouds.jpg', import.meta.url)
  .href;
const earthSpecularTextureUrl = new URL('../../../../assets/textures/2k_earth_specular_map.tif', import.meta.url)
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

export function loadEarthSpecularTexture() {
  const texture = tiffLoader.load(earthSpecularTextureUrl, (loadedTexture) => {
    const image = loadedTexture.image;
    const width = image?.width;
    const height = image?.height;
    const data = image?.data;

    if (!width || !height || !data) {
      return;
    }

    const safeData = data as Uint8Array;

    // Repair obviously broken scanlines from the decoded TIFF by borrowing from neighbors.
    for (let row = 1; row < height - 1; row += 1) {
      let rowSum = 0;

      for (let column = 0; column < width; column += 1) {
        rowSum += safeData[(row * width + column) * 4] ?? 0;
      }

      if (rowSum !== 0) {
        continue;
      }

      for (let column = 0; column < width; column += 1) {
        const currentIndex = (row * width + column) * 4;
        const previousIndex = ((row - 1) * width + column) * 4;
        const nextIndex = ((row + 1) * width + column) * 4;

        safeData[currentIndex] = Math.round(((safeData[previousIndex] ?? 0) + (safeData[nextIndex] ?? 0)) * 0.5);
        safeData[currentIndex + 1] = Math.round(
          ((safeData[previousIndex + 1] ?? 0) + (safeData[nextIndex + 1] ?? 0)) * 0.5
        );
        safeData[currentIndex + 2] = Math.round(
          ((safeData[previousIndex + 2] ?? 0) + (safeData[nextIndex + 2] ?? 0)) * 0.5
        );
        safeData[currentIndex + 3] = 255;
      }
    }

    loadedTexture.needsUpdate = true;
  });

  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipMapLinearFilter;
  texture.wrapS = RepeatWrapping;

  return texture;
}
