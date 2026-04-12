import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FrontSide, Mesh, Vector3 } from 'three';
import { loadEarthCloudTexture } from '../rendering/earthSurface';

type EarthCloudLayerProps = {
  focused: boolean;
  radius: number;
};

export function EarthCloudLayer({ focused, radius }: EarthCloudLayerProps) {
  const cloudTexture = useMemo(() => loadEarthCloudTexture(), []);
  const shellScale = focused ? 1.05 : 1.01;
  const cloudMeshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!cloudMeshRef.current) {
      return;
    }

    cloudMeshRef.current.rotation.y += delta * 0.005;
  });

  return (
    <mesh ref={cloudMeshRef} scale={shellScale}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        alphaMap={cloudTexture}
        depthWrite={false}
        opacity={0.58}
        side={FrontSide}
        transparent
        color="#ffffff"
        alphaTest={0.08}
        roughness={0.95}
        metalness={0}
        onBeforeCompile={(shader) => {
          shader.uniforms.earthLightDirection = { value: new Vector3(10, 6, 8).normalize() };

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
uniform vec3 earthLightDirection;
varying vec3 vCloudWorldNormal;`
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `float cloudLightFacing = max(dot(normalize(vCloudWorldNormal), normalize(earthLightDirection)), 0.0);
float cloudVisibility = mix(0.08, 1.0, smoothstep(0.0, 0.22, cloudLightFacing));
gl_FragColor.rgb *= cloudVisibility;
gl_FragColor.a *= cloudVisibility;

#include <dithering_fragment>`
          );
        }}
      />
    </mesh>
  );
}
