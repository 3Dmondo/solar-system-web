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
varying vec3 vEarthWorldNormal;
varying vec3 vEarthWorldPosition;`
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

        shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          `#include <worldpos_vertex>
vEarthWorldPosition = worldPosition.xyz;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>
uniform sampler2D earthNightTexture;
uniform vec3 earthLightDirection;
varying vec2 vEarthUv;
varying vec3 vEarthWorldNormal;
varying vec3 vEarthWorldPosition;

vec3 applyEarthNightLights(vec3 baseColor) {
  vec3 worldNormal = normalize(vEarthWorldNormal);
  vec3 lightDirection = normalize(earthLightDirection);
  float lightFacing = max(dot(worldNormal, lightDirection), 0.0);
  float nightMask = 1.0 - smoothstep(0.08, 0.24, lightFacing);
  vec3 nightColor = texture2D(earthNightTexture, vEarthUv).rgb;
  vec3 viewDirection = normalize(cameraPosition - vEarthWorldPosition);
  vec3 halfVector = normalize(lightDirection + viewDirection);
  float blueBias = baseColor.b - max(baseColor.r, baseColor.g);
  float waterMask = smoothstep(0.02, 0.16, blueBias);
  float specularTerm = pow(max(dot(worldNormal, halfVector), 0.0), 10.0);
  float fresnel = pow(1.0 - max(dot(worldNormal, viewDirection), 0.0), 2.5);
  float oceanSpecular = waterMask * specularTerm * lightFacing * (0.18 + fresnel * 0.32);

  vec3 darkenedDay = baseColor * mix(0.18, 1.0, 1.0 - nightMask);
  vec3 specularColor = vec3(0.7, 0.84, 0.96) * oceanSpecular * 2.0;

  return darkenedDay + nightColor * nightMask * 0.7 + specularColor;
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
