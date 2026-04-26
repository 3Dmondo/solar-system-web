import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Group, Vector3 } from 'three';
import type { BodyDefinition, BodyId } from '../domain/body';

/**
 * Visibility thresholds for body labels in pixels.
 * Labels appear when body is visible enough to need identification
 * but small enough that text is helpful.
 */
export const LABEL_THRESHOLDS = {
  /** Hide label when body's screen-space radius exceeds this (too big, obvious what it is) */
  hideAbovePx: 80,
  /** Always show label when body's screen-space radius is below this */
  showBelowPx: 60
} as const;

type BodyLabelProps = {
  body: BodyDefinition;
  onSelect: (bodyId: BodyId) => void;
  /** Whether to show the label (controlled by parent) */
  visible?: boolean;
};

// Reusable vector to avoid allocations
const tempPosition = new Vector3();

/**
 * A text label that follows a body in 3D space.
 * Rendered as HTML overlay positioned slightly above the body.
 * Selectable via click or tap to focus the body.
 */
export function BodyLabel({ body, onSelect, visible = true }: BodyLabelProps) {
  const groupRef = useRef<Group>(null);
  const [computedVisible, setComputedVisible] = useState(true);

  // Update position and visibility each frame
  useFrame(({ camera, size }) => {
    if (!groupRef.current) return;

    // Update position to track body
    groupRef.current.position.set(...body.position);

    // Compute screen-space radius for visibility threshold
    tempPosition.set(...body.position);
    const distance = tempPosition.distanceTo(camera.position);

    if (distance <= body.radius) {
      // Camera inside body - hide label
      if (computedVisible) setComputedVisible(false);
      return;
    }

    const fov = 'fov' in camera ? (camera.fov as number) : 50;
    const angularRadius = Math.asin(Math.min(body.radius / distance, 1));
    const fovRad = (fov * Math.PI) / 180;
    const screenRadius = (angularRadius / fovRad) * size.height;

    // Hide when body is very large on screen (obvious what it is)
    const shouldShow = screenRadius < LABEL_THRESHOLDS.hideAbovePx;
    if (shouldShow !== computedVisible) {
      setComputedVisible(shouldShow);
    }
  });

  const handleClick = () => {
    onSelect(body.id);
  };

  if (!visible || !computedVisible) return null;

  // Offset the label above the body by a small multiple of its radius
  // Using body.radius ensures the label clears the sphere
  const labelOffset = body.radius * 1.5;

  return (
    <group ref={groupRef}>
      <Html
        position={[0, labelOffset, 0]}
        center
        style={{
          pointerEvents: 'auto',
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        <button
          onClick={handleClick}
          className="body-label"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px 8px',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
            letterSpacing: '0.02em',
            opacity: 0.9,
            transition: 'opacity 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
        >
          {body.displayName}
        </button>
      </Html>
    </group>
  );
}
