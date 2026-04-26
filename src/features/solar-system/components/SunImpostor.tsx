import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Color, Group, Mesh, ShaderMaterial, Vector3 } from 'three';
import { type BodyDefinition } from '../domain/body';

// Sun color from presentation metadata
const SUN_COLOR = '#ffd27a';
// Impostor thresholds in screen-space pixels (radius)
const FULL_IMPOSTOR_BELOW_PX = 3;
const FULL_SPHERE_ABOVE_PX = 15;
// Impostor visual size in pixels
const IMPOSTOR_SIZE_PX = 20;

const impostorVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const impostorFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  // Distance from center (0.5, 0.5) in UV space
  vec2 center = vUv - 0.5;
  float dist = length(center) * 2.0;
  
  // Core: bright center with soft falloff
  float coreIntensity = (1.0 - smoothstep(0.0, 0.4, dist)) * 0.9;
  
  // Inner glow ring
  float innerGlow = (1.0 - smoothstep(0.3, 0.7, dist)) * 0.5;
  
  // Outer glow: soft radial gradient
  float outerGlow = (1.0 - smoothstep(0.5, 1.0, dist)) * 0.25;
  
  float totalIntensity = coreIntensity + innerGlow + outerGlow;
  float alpha = totalIntensity * uOpacity;
  
  if (alpha < 0.01) discard;
  
  // Slightly warm the core
  vec3 finalColor = uColor * (1.0 + coreIntensity * 0.3);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

// Reusable vector
const tempVec = new Vector3();

type SunImpostorProps = {
  sunBody: BodyDefinition;
  /** Opacity from 0 (hidden) to 1 (fully visible). Controls blend with real Sun sphere. */
  opacity?: number;
};

/**
 * A bright billboard impostor for the Sun, visible from far distances.
 * Features a soft radial gradient with core glow.
 * Opacity should be controlled externally based on screen-space radius threshold.
 */
export function SunImpostor({
  sunBody,
  opacity = 1
}: SunImpostorProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  const colorObj = useMemo(() => new Color(SUN_COLOR), []);

  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uColor: { value: colorObj },
        uOpacity: { value: opacity }
      },
      vertexShader: impostorVertexShader,
      fragmentShader: impostorFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending
    });
  }, [colorObj, opacity]);

  // Update position, opacity, and scale each frame
  useFrame(({ camera, size }) => {
    if (!groupRef.current || !meshRef.current) return;

    // Update opacity uniform
    (material.uniforms.uOpacity as { value: number }).value = opacity;

    // Track Sun position
    groupRef.current.position.set(...sunBody.position);

    tempVec.set(...sunBody.position);
    const distance = tempVec.distanceTo(camera.position);

    // Compute the world-space size for the impostor
    const fov = 'fov' in camera ? (camera.fov as number) : 50;
    const fovRad = (fov * Math.PI) / 180;
    const pixelSizeInWorld =
      (2 * distance * Math.tan(fovRad / 2)) / size.height;

    // Fixed pixel size impostor
    const impostorSize = IMPOSTOR_SIZE_PX * pixelSizeInWorld;

    meshRef.current.scale.setScalar(Math.max(impostorSize, sunBody.radius * 2));
  });

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh ref={meshRef} material={material}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </Billboard>
    </group>
  );
}

/**
 * Computes the opacity for the Sun impostor based on screen-space radius.
 * Returns 0 when sphere is fully visible, 1 when impostor should be fully visible,
 * and a smooth blend in between.
 */
export function computeSunImpostorOpacity(screenSpaceRadius: number): number {
  if (screenSpaceRadius >= FULL_SPHERE_ABOVE_PX) {
    return 0;
  }
  if (screenSpaceRadius <= FULL_IMPOSTOR_BELOW_PX) {
    return 1;
  }

  // Smooth blend between thresholds
  const t =
    (screenSpaceRadius - FULL_IMPOSTOR_BELOW_PX) /
    (FULL_SPHERE_ABOVE_PX - FULL_IMPOSTOR_BELOW_PX);
  // Smoothstep for nicer transition
  return 1 - t * t * (3 - 2 * t);
}

/**
 * Configuration for Sun impostor visibility thresholds
 */
export const SUN_IMPOSTOR_THRESHOLDS = {
  /** Full impostor when Sun radius below this (pixels) */
  fullImpostorBelowPx: FULL_IMPOSTOR_BELOW_PX,
  /** Full sphere (no impostor) when Sun radius above this (pixels) */
  fullSphereAbovePx: FULL_SPHERE_ABOVE_PX
} as const;
