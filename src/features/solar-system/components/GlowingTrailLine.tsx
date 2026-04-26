import { Line } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  type Object3D
} from 'three';
import type { Line2 } from 'three/examples/jsm/lines/Line2.js';
import type { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

type GlowingTrailLineProps = {
  /** Line color (hex string) */
  color: string;
  /** Base opacity (0-1) */
  opacity: number;
  /** Array of 3D positions */
  positions: Array<[number, number, number]>;
  /** Line width in pixels */
  lineWidth?: number;
  /** Glow intensity multiplier (higher = more bloom contribution) */
  glowIntensity?: number;
};

const ignoreRaycast: Object3D['raycast'] = () => undefined;

/**
 * A glowing trail line component using additive blending for soft glow effect.
 * Works with the existing bloom post-processing to create ethereal trails.
 *
 * The glow is achieved by:
 * 1. Using additive blending which makes overlapping lines brighter
 * 2. Boosting color intensity so bright areas trigger bloom
 * 3. Soft opacity for non-distracting appearance
 */
export function GlowingTrailLine({
  color,
  opacity,
  positions,
  lineWidth = 1.5,
  glowIntensity = 1.2
}: GlowingTrailLineProps) {
  const lineRef = useRef<Line2>(null);

  // Compute boosted color for bloom contribution
  const boostedColor = useMemo(() => {
    const baseColor = new Color(color);
    // Boost the color intensity to trigger bloom on bright segments
    return baseColor.multiplyScalar(glowIntensity);
  }, [color, glowIntensity]);

  // Configure the line material for additive blending once on mount
  useEffect(() => {
    if (!lineRef.current) return;

    const material = lineRef.current.material as LineMaterial;
    if (material) {
      material.blending = AdditiveBlending;
      material.transparent = true;
      material.depthWrite = false;
      material.needsUpdate = true;
    }
  }, []);

  return (
    <Line
      ref={lineRef}
      color={boostedColor}
      depthWrite={false}
      frustumCulled={false}
      lineWidth={lineWidth}
      opacity={opacity}
      points={positions}
      raycast={ignoreRaycast}
      renderOrder={1}
      toneMapped={false}
      transparent
    />
  );
}
