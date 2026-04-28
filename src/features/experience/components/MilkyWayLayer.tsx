import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import {
  BackSide,
  ClampToEdgeWrapping,
  LinearFilter,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  Texture
} from 'three';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

const MILKY_WAY_TEXTURE_URL = './sky/milky-way.etc1s.ktx2';
const BASIS_TRANSCODER_PATH = './basis/';
const SKY_TEXTURE_RADIUS_SCALE = 0.5;
const MILKY_WAY_OPACITY = 0.55;
const MILKY_WAY_BRIGHTNESS = 0.45;

const milkyWayVertexShader = /* glsl */ `
varying vec3 vRenderDirection;

void main() {
  vRenderDirection = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const milkyWayFragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform float uOpacity;
uniform float uBrightness;

varying vec3 vRenderDirection;

const float PI = 3.14159265358979323846;
const float TAU = 6.28318530717958647692;
const float OBLIQUITY_COS = 0.9174821430652418;
const float OBLIQUITY_SIN = 0.3977769691126060;

vec3 renderDirectionToJ2000Equatorial(vec3 renderDirection) {
  float eclipticY = -renderDirection.z;
  float eclipticZ = renderDirection.y;

  return normalize(vec3(
    renderDirection.x,
    eclipticY * OBLIQUITY_COS - eclipticZ * OBLIQUITY_SIN,
    eclipticY * OBLIQUITY_SIN + eclipticZ * OBLIQUITY_COS
  ));
}

vec3 j2000EquatorialToGalactic(vec3 equatorial) {
  return normalize(vec3(
    dot(vec3(-0.0548755604, -0.8734370902, -0.4838350155), equatorial),
    dot(vec3(0.4941094279, -0.4448296300, 0.7469822445), equatorial),
    dot(vec3(-0.8676661490, -0.1980763734, 0.4559837762), equatorial)
  ));
}

vec2 galacticTextureUvFromRenderDirection(vec3 renderDirection) {
  vec3 equatorial = renderDirectionToJ2000Equatorial(normalize(renderDirection));
  vec3 galactic = j2000EquatorialToGalactic(equatorial);
  float longitude = atan(galactic.y, galactic.x);

  if (longitude < 0.0) {
    longitude += TAU;
  }

  float latitude = asin(clamp(galactic.z, -1.0, 1.0));

  return vec2(
    fract(0.5 - longitude / TAU),
    latitude / PI + 0.5
  );
}

void main() {
  vec2 uv = galacticTextureUvFromRenderDirection(vRenderDirection);
  vec3 color = texture2D(uTexture, uv).rgb * uBrightness;
  gl_FragColor = vec4(color, uOpacity);
}
`;

type MilkyWayLayerProps = {
  visible?: boolean;
};

export function MilkyWayLayer({ visible = true }: MilkyWayLayerProps) {
  const gl = useThree((state) => state.gl);
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!visible || texture) {
      return;
    }

    let cancelled = false;
    const loader = new KTX2Loader()
      .setTranscoderPath(BASIS_TRANSCODER_PATH)
      .detectSupport(gl);

    loader
      .loadAsync(MILKY_WAY_TEXTURE_URL)
      .then((loadedTexture) => {
        if (cancelled) {
          loadedTexture.dispose();
          return;
        }

        loadedTexture.colorSpace = SRGBColorSpace;
        loadedTexture.minFilter = LinearFilter;
        loadedTexture.magFilter = LinearFilter;
        loadedTexture.wrapS = RepeatWrapping;
        loadedTexture.wrapT = ClampToEdgeWrapping;
        loadedTexture.generateMipmaps = false;
        setTexture(loadedTexture);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.warn('Milky Way sky texture failed to load.', error);
          setTexture(null);
        }
      })
      .finally(() => {
        loader.dispose();
      });

    return () => {
      cancelled = true;
    };
  }, [gl, texture, visible]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  const material = useMemo(() => {
    if (!texture) {
      return null;
    }

    return new ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uOpacity: { value: MILKY_WAY_OPACITY },
        uBrightness: { value: MILKY_WAY_BRIGHTNESS }
      },
      vertexShader: milkyWayVertexShader,
      fragmentShader: milkyWayFragmentShader,
      side: BackSide,
      depthWrite: false,
      depthTest: true,
      transparent: true
    });
  }, [texture]);

  useEffect(() => {
    return () => {
      material?.dispose();
    };
  }, [material]);

  if (!visible || !texture || !material) {
    return null;
  }

  return (
    <mesh
      material={material}
      frustumCulled={false}
      renderOrder={-3}
      scale={SKY_TEXTURE_RADIUS_SCALE}
    >
      <sphereGeometry args={[1, 64, 32]} />
    </mesh>
  );
}
