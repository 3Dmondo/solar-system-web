import { useMemo } from 'react';
import { Vector3 } from 'three';
import { loadEarthDayTexture, loadEarthNightTexture } from '../rendering/earthSurface';

export function EarthSurfaceMaterial() {
  const dayTexture = useMemo(() => loadEarthDayTexture(), []);
  const nightTexture = useMemo(() => loadEarthNightTexture(), []);

  return (
    <meshStandardMaterial
      color="#ffffff"
      map={dayTexture}
      metalness={0.02}
      onBeforeCompile={(shader) => {
        shader.uniforms.earthNightTexture = { value: nightTexture };
        shader.uniforms.earthLightDirection = { value: new Vector3(10, 6, 8).normalize() };

        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `#include <common>
varying vec2 vEarthUv;
varying vec3 vEarthWorldNormal;`
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <uv_vertex>',
          `#include <uv_vertex>
vEarthUv = uv;`
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <defaultnormal_vertex>',
          `#include <defaultnormal_vertex>
vEarthWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>
uniform sampler2D earthNightTexture;
uniform vec3 earthLightDirection;
varying vec2 vEarthUv;
varying vec3 vEarthWorldNormal;

vec3 applyEarthNightLights(vec3 baseColor) {
  float lightFacing = max(dot(normalize(vEarthWorldNormal), normalize(earthLightDirection)), 0.0);
  float nightMask = 1.0 - smoothstep(0.08, 0.24, lightFacing);
  vec3 nightColor = texture2D(earthNightTexture, vEarthUv).rgb;

  vec3 darkenedDay = baseColor * mix(0.18, 1.0, 1.0 - nightMask);

  return darkenedDay + nightColor * nightMask * 0.7;
}`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `gl_FragColor.rgb = applyEarthNightLights(gl_FragColor.rgb);

#include <dithering_fragment>`
        );
      }}
      roughness={0.88}
    />
  );
}
