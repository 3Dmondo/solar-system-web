import { useEffect, useMemo, useState } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial
} from 'three';
import {
  getSpectralColor,
  getStarCatalogLoader,
  raHoursDecDegreesToRenderFrame,
  type Star,
  type StarCatalog
} from '../../solar-system/domain/starCatalog';

// Star shader - renders magnitude-based size and brightness with spectral colors
const starVertexShader = /* glsl */ `
attribute float aMagnitude;
attribute vec3 aColor;

uniform float uBrightnessScale;
uniform float uMinSize;
uniform float uMaxSize;

varying vec3 vColor;
varying float vBrightness;

void main() {
  // Convert magnitude to 0-1 range (mag -1.5 to 6.5)
  // Lower magnitude = brighter star
  float normalizedMag = clamp((aMagnitude + 1.5) / 8.0, 0.0, 1.0);
  float inverseMag = 1.0 - normalizedMag;
  
  // Linear brightness with floor so dim stars remain visible
  vBrightness = (0.3 + inverseMag * 0.7) * uBrightnessScale;
  
  // Size: linear interpolation with minimum floor
  float pointSize = mix(uMinSize, uMaxSize, inverseMag);
  
  vColor = aColor;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Fixed point size - stars are at infinity, no distance scaling
  gl_PointSize = pointSize;
}
`;

const starFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vBrightness;

void main() {
  // Circular point with soft edge
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center) * 2.0;
  
  // Soft circular falloff
  float alpha = 1.0 - smoothstep(0.5, 1.0, dist);
  alpha *= vBrightness;
  
  if (alpha < 0.01) discard;
  
  // Apply color with brightness
  vec3 color = vColor * vBrightness;
  
  gl_FragColor = vec4(color, alpha);
}
`;

type StarFieldProps = {
  /** Whether to show the star field */
  visible?: boolean;
  /** Brightness multiplier (0-2, default 1) */
  brightnessScale?: number;
};

/**
 * Renders a realistic star field using point sprites.
 * Stars are loaded from the HYG catalog and positioned using real RA/Dec coordinates.
 * Brightness and size are determined by apparent magnitude.
 */
export function StarField({
  visible = true,
  brightnessScale = 1.0
}: StarFieldProps) {
  const [catalog, setCatalog] = useState<StarCatalog | null>(null);

  // Load star catalog on mount
  useEffect(() => {
    const loader = getStarCatalogLoader();
    loader.loadStars().then(setCatalog).catch(console.error);
  }, []);

  // Build geometry from catalog - computed once and reused
  const { geometry, material } = useMemo(() => {
    if (!catalog) {
      return { geometry: null, material: null };
    }

    const stars = catalog.stars;
    const positions = new Float32Array(stars.length * 3);
    const magnitudes = new Float32Array(stars.length);
    const colors = new Float32Array(stars.length * 3);

    stars.forEach((star: Star, i: number) => {
      // Convert RA (hours) / Dec (degrees) to render frame unit vector
      const [x, y, z] = raHoursDecDegreesToRenderFrame(star.ra, star.dec);

      // Keep local positions unit-length; SkyLayer applies dynamic shell scale.
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Store magnitude for shader
      magnitudes[i] = star.mag;

      // Get spectral color
      const [r, g, b] = getSpectralColor(star.spect);
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    });

    const geom = new BufferGeometry();
    geom.setAttribute('position', new BufferAttribute(positions, 3));
    geom.setAttribute('aMagnitude', new BufferAttribute(magnitudes, 1));
    geom.setAttribute('aColor', new BufferAttribute(colors, 3));

    const mat = new ShaderMaterial({
      uniforms: {
        uBrightnessScale: { value: brightnessScale },
        uMinSize: { value: 1.5 },
        uMaxSize: { value: 5.0 }
      },
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending
    });

    return { geometry: geom, material: mat };
  }, [catalog, brightnessScale]);

  // Update material uniforms
  useEffect(() => {
    if (material && material.uniforms.uBrightnessScale) {
      material.uniforms.uBrightnessScale.value = brightnessScale;
    }
  }, [material, brightnessScale]);

  if (!visible || !geometry || !material) {
    return null;
  }

  return (
    <points
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={-1}
    />
  );
}
