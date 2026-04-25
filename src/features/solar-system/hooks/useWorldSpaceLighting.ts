/**
 * Hook for managing world-space lighting in planet materials.
 *
 * This hook consolidates the common pattern of:
 * 1. Computing the light direction from body position to sun
 * 2. Storing a shader ref for uniform updates
 * 3. Updating the light direction uniform each frame
 *
 * Use this hook in material components that need dynamic light direction updates.
 */

import { useCallback, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { ShaderRef } from '../rendering/shaderInjection';
import { getSunLightDirection } from '../rendering/sunLighting';

export type UseWorldSpaceLightingOptions = {
  /** Body center position in world coordinates */
  bodyPosition: [number, number, number];
  /** Sun position in world coordinates */
  sunPosition: [number, number, number];
};

export type UseWorldSpaceLightingResult = {
  /** Current light direction vector (body -> sun, normalized) */
  lightDirection: Vector3;
  /** Ref to attach to the compiled shader for uniform updates */
  shaderRef: React.MutableRefObject<ShaderRef | null>;
  /**
   * Callback to register the shader from onBeforeCompile.
   * Pass this as part of your onBeforeCompile handler:
   * ```
   * onBeforeCompile={(shader) => {
   *   registerShader(shader);
   *   // other setup...
   * }}
   * ```
   */
  registerShader: (shader: ShaderRef) => void;
};

/**
 * Hook for managing world-space lighting direction in planet materials.
 *
 * This hook:
 * 1. Computes the initial light direction from body to sun
 * 2. Provides a shader ref for uniform updates
 * 3. Updates the lightDirection uniform each frame via useFrame
 *
 * @example
 * ```tsx
 * function MyMaterial({ bodyPosition, sunPosition }) {
 *   const { lightDirection, shaderRef, registerShader } = useWorldSpaceLighting({
 *     bodyPosition,
 *     sunPosition,
 *   });
 *
 *   return (
 *     <meshStandardMaterial
 *       onBeforeCompile={(shader) => {
 *         registerShader(shader);
 *         setupBasicDiffuseMaterial(shader, lightDirection);
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function useWorldSpaceLighting({
  bodyPosition,
  sunPosition,
}: UseWorldSpaceLightingOptions): UseWorldSpaceLightingResult {
  // Compute initial light direction
  const lightDirection = useMemo(
    () => getSunLightDirection(bodyPosition, sunPosition),
    [bodyPosition, sunPosition]
  );

  // Ref to hold the compiled shader for uniform updates
  const shaderRef = useRef<ShaderRef | null>(null);

  // Callback to register the shader
  const registerShader = useCallback((shader: ShaderRef) => {
    shaderRef.current = shader;
  }, []);

  // Update light direction uniform each frame
  useFrame(() => {
    const shader = shaderRef.current;
    if (!shader?.uniforms.lightDirection) {
      return;
    }
    shader.uniforms.lightDirection.value.copy(lightDirection);
  });

  return {
    lightDirection,
    shaderRef,
    registerShader,
  };
}
