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
      <meshBasicMaterial
        alphaMap={alphaTexture}
        alphaTest={0.08}
        color={color}
        depthWrite={false}
        map={colorTexture ?? null}
        opacity={opacity}
        side={FrontSide}
        transparent
        onBeforeCompile={(shader) => {
          shader.uniforms.cloudLightDirection = { value: lightDirection };
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

          // meshBasicMaterial: inject world normal after project_vertex
          shader.vertexShader = shader.vertexShader.replace(
            '#include <project_vertex>',
            `#include <project_vertex>
vCloudWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);`
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `#include <common>
uniform vec3 cloudLightDirection;
uniform float cloudAlphaMax;
uniform float cloudAlphaMinLuminance;
uniform float cloudAlphaMaxLuminance;
uniform float cloudAlphaPower;
varying vec3 vCloudWorldNormal;

const float CLOUD_AMBIENT = 0.02;

float computeCloudDiffuse(vec3 normal, vec3 lightDir) {
  float diffuse = max(dot(normal, lightDir), 0.0);
  return CLOUD_AMBIENT + (1.0 - CLOUD_AMBIENT) * diffuse;
}`
          );

          // meshBasicMaterial: apply custom lighting after map is sampled
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `#include <map_fragment>
vec3 cloudNormal = normalize(vCloudWorldNormal);
vec3 cloudLightDir = normalize(cloudLightDirection);
float cloudDiffuse = computeCloudDiffuse(cloudNormal, cloudLightDir);
float cloudLuminance = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
float cloudAlphaHeuristic = pow(
  smoothstep(cloudAlphaMinLuminance, cloudAlphaMaxLuminance, cloudLuminance),
  cloudAlphaPower
);

diffuseColor.rgb *= cloudDiffuse;
diffuseColor.a *= mix(1.0, cloudAlphaHeuristic, cloudAlphaMax);`
          );
        }}
      />
    </mesh>
  );
}
