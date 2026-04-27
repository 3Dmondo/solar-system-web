import { Line } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import {
  Color,
  NormalBlending,
  type Object3D
} from 'three';
import type { Line2 } from 'three/examples/jsm/lines/Line2.js';
import type { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

type GlowingTrailLineProps = {
  /** Line color (hex string) */
  color: string;
  /** Array of 3D positions */
  positions: Array<[number, number, number]>;
  /** Line width in pixels */
  lineWidth?: number;
  /** Color intensity multiplier. Kept below 1 to avoid join hot spots. */
  colorIntensity?: number;
};

const ignoreRaycast: Object3D['raycast'] = () => undefined;

/**
 * A stable screen-space trail ribbon.
 * It uses normal opaque blending so adjacent fat-line segments do not create
 * brighter hot spots where sampled trail points join.
 */
export function GlowingTrailLine({
  color,
  positions,
  lineWidth = 2.35,
  colorIntensity = 0.85
}: GlowingTrailLineProps) {
  const lineRef = useRef<Line2>(null);

  const trailColor = useMemo(() => {
    const baseColor = new Color(color);
    return baseColor.multiplyScalar(colorIntensity);
  }, [color, colorIntensity]);

  useEffect(() => {
    if (!lineRef.current) return;

    const material = lineRef.current.material as LineMaterial;
    if (material) {
      material.blending = NormalBlending;
      material.transparent = false;
      material.depthWrite = false;
      material.needsUpdate = true;
    }
  }, []);

  return (
    <Line
      ref={lineRef}
      color={trailColor}
      depthWrite={false}
      frustumCulled={false}
      lineWidth={lineWidth}
      points={positions}
      raycast={ignoreRaycast}
      renderOrder={1}
      toneMapped={false}
    />
  );
}
