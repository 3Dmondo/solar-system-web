import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FrontSide, Mesh, Quaternion, type Texture, Vector3 } from 'three';
import { getSunLightDirection } from '../rendering/sunLighting';
import { useSimulationClockContext } from '../../experience/state/SimulationClockContext';

const Y_UP = new Vector3(0, 1, 0)

type CloudAlphaHeuristic = {
  maxAlpha: number;
  minLuminance: number;
  maxLuminance: number;
  power: number;
};

type PlanetCloudLayerProps = {
  alphaTexture: Texture;
  angularVelocityRadPerSec: number;
  bodyPosition: [number, number, number];
  color?: string;
  colorTexture?: Texture;
  focused: boolean;
  lightFacingThresholds?: [number, number];
  maxVisibility?: number;
  minVisibility?: number;
  opacity: number;
  poleDirectionRender?: [number, number, number];
  radius: number;
  shellScaleDefault: number;
  shellScaleFocused: number;
  sunPosition: [number, number, number];
  transparencyHeuristic?: CloudAlphaHeuristic;
};

export function PlanetCloudLayer({
  alphaTexture,
  angularVelocityRadPerSec,
  bodyPosition,
  color = '#ffffff',
  colorTexture,
  focused,
  lightFacingThresholds = [0, 0.22],
  maxVisibility = 1,
  minVisibility = 0.08,
  opacity,
  poleDirectionRender,
  radius,
  shellScaleDefault,
  shellScaleFocused,
  sunPosition,
  transparencyHeuristic
}: PlanetCloudLayerProps) {
  const lightDirection = getSunLightDirection(bodyPosition, sunPosition);
  const cloudMeshRef = useRef<Mesh>(null);
  const shaderRef = useRef<{
    uniforms: {
      cloudLightDirection?: { value: Vector3 };
    };
  } | null>(null);
  const shellScale = focused ? shellScaleFocused : shellScaleDefault;
  const { playbackRateMultiplier, isPaused } = useSimulationClockContext();

  // Quaternion aligning the cloud shell Y axis to the body's north pole.
  const poleAlignQuat = useMemo(() => {
    if (!poleDirectionRender) {
      return new Quaternion()
    }
    const poleVec = new Vector3(...poleDirectionRender).normalize()
    return new Quaternion().setFromUnitVectors(Y_UP, poleVec)
  }, [poleDirectionRender])

  const spinQuat = useMemo(() => new Quaternion(), [])
  const cloudAngleRef = useRef(0)

  // Apply initial pole alignment when the pole changes.
  useEffect(() => {
    if (cloudMeshRef.current) {
      cloudMeshRef.current.quaternion.copy(poleAlignQuat)
    }
  }, [poleAlignQuat])

  useFrame((_, delta) => {
    if (!cloudMeshRef.current) {
      return;
    }

    const simDelta = isPaused ? 0 : delta * playbackRateMultiplier
    cloudAngleRef.current += angularVelocityRadPerSec * simDelta
    spinQuat.setFromAxisAngle(Y_UP, cloudAngleRef.current)
    cloudMeshRef.current.quaternion.copy(poleAlignQuat).multiply(spinQuat)

    const cloudLightDirection = shaderRef.current?.uniforms.cloudLightDirection;

    if (cloudLightDirection) {
      cloudLightDirection.value.copy(lightDirection);
    }
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
          shaderRef.current = shader as typeof shaderRef.current;

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
