import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FrontSide, Mesh, type Texture } from 'three';
import { getSunLightDirection } from '../rendering/sunLighting';

type CloudAlphaHeuristic = {
  maxAlpha: number;
  minLuminance: number;
  maxLuminance: number;
  power: number;
};

type PlanetCloudLayerProps = {
  alphaTexture: Texture;
  bodyPosition: [number, number, number];
  color?: string;
  colorTexture?: Texture;
  focused: boolean;
  lightFacingThresholds?: [number, number];
  maxVisibility?: number;
  minVisibility?: number;
  opacity: number;
  radius: number;
  rotationSpeed: number;
  shellScaleDefault: number;
  shellScaleFocused: number;
  transparencyHeuristic?: CloudAlphaHeuristic;
};

export function PlanetCloudLayer({
  alphaTexture,
  bodyPosition,
  color = '#ffffff',
  colorTexture,
  focused,
  lightFacingThresholds = [0, 0.22],
  maxVisibility = 1,
  minVisibility = 0.08,
  opacity,
  radius,
  rotationSpeed,
  shellScaleDefault,
  shellScaleFocused,
  transparencyHeuristic
}: PlanetCloudLayerProps) {
  const lightDirection = getSunLightDirection(bodyPosition);
  const cloudMeshRef = useRef<Mesh>(null);
  const shellScale = focused ? shellScaleFocused : shellScaleDefault;

  useFrame((_, delta) => {
    if (!cloudMeshRef.current) {
      return;
    }

    cloudMeshRef.current.rotation.y += delta * rotationSpeed;
  });

  return (
    <mesh ref={cloudMeshRef} scale={shellScale}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        alphaMap={alphaTexture}
        alphaTest={0.08}
        color={color}
        depthWrite={false}
        map={colorTexture ?? null}
        metalness={0}
        opacity={opacity}
        roughness={0.95}
        side={FrontSide}
        transparent
        onBeforeCompile={(shader) => {
          shader.uniforms.cloudLightDirection = { value: lightDirection };
          shader.uniforms.cloudMinVisibility = { value: minVisibility };
          shader.uniforms.cloudMaxVisibility = { value: maxVisibility };
          shader.uniforms.cloudLightMin = { value: lightFacingThresholds[0] };
          shader.uniforms.cloudLightMax = { value: lightFacingThresholds[1] };
          shader.uniforms.cloudAlphaMax = {
            value: transparencyHeuristic?.maxAlpha ?? 1
          };
          shader.uniforms.cloudAlphaMinLuminance = {
            value: transparencyHeuristic?.minLuminance ?? 0
          };
          shader.uniforms.cloudAlphaMaxLuminance = {
            value: transparencyHeuristic?.maxLuminance ?? 1
          };
          shader.uniforms.cloudAlphaPower = {
            value: transparencyHeuristic?.power ?? 1
          };

          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
varying vec3 vCloudWorldNormal;`
          );

          shader.vertexShader = shader.vertexShader.replace(
            '#include <defaultnormal_vertex>',
            `#include <defaultnormal_vertex>
vCloudWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `#include <common>
uniform vec3 cloudLightDirection;
uniform float cloudMinVisibility;
uniform float cloudMaxVisibility;
uniform float cloudLightMin;
uniform float cloudLightMax;
uniform float cloudAlphaMax;
uniform float cloudAlphaMinLuminance;
uniform float cloudAlphaMaxLuminance;
uniform float cloudAlphaPower;
varying vec3 vCloudWorldNormal;`
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `float cloudLightFacing = max(dot(normalize(vCloudWorldNormal), normalize(cloudLightDirection)), 0.0);
float cloudVisibility = mix(
  cloudMinVisibility,
  cloudMaxVisibility,
  smoothstep(cloudLightMin, cloudLightMax, cloudLightFacing)
);
float cloudLuminance = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
float cloudAlphaHeuristic = pow(
  smoothstep(cloudAlphaMinLuminance, cloudAlphaMaxLuminance, cloudLuminance),
  cloudAlphaPower
);

gl_FragColor.rgb *= cloudVisibility;
gl_FragColor.a *= cloudVisibility * mix(1.0, cloudAlphaHeuristic, cloudAlphaMax);

#include <dithering_fragment>`
          );
        }}
      />
    </mesh>
  );
}
