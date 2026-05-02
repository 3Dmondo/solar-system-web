import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group, Vector3 } from 'three';
import type { BodyDefinition } from '../domain/body';
import { BODY_LABEL_HTML_Z_INDEX_RANGE } from './bodyLabelLayering';

/**
 * Visibility thresholds for body labels in pixels.
 * Labels appear when body is visible enough to need identification
 * but small enough that text is helpful.
 */
const LABEL_THRESHOLDS = {
  /** Hide label when body's screen-space radius exceeds this (too big, obvious what it is) */
  hideAbovePx: 80
} as const;

/** Minimum screen-space offset in pixels above the body/indicator */
const MIN_LABEL_OFFSET_PX = 20;

/** Size of the indicator billboard in pixels (must match BodyIndicator) */
const INDICATOR_SIZE_PX = 24;

type BodyLabelProps = {
  body: BodyDefinition;
  /** Whether to show the label (controlled by parent) */
  visible?: boolean;
  /** Screen-space offset [x, y] in pixels for spreading apart overlapping labels */
  screenOffset?: [number, number];
  /** Whether the label is hidden due to hierarchy occlusion (satellite overlapping parent) */
  occluded?: boolean;
};

// Reusable vector to avoid allocations
const tempPosition = new Vector3();

/**
 * A text label that follows a body in 3D space.
 * Rendered as HTML overlay positioned above the body or its indicator.
 * Passive by design so labels do not compete with app chrome or scene hit targets.
 */
export function BodyLabel({
  body,
  visible = true,
  screenOffset,
  occluded = false
}: BodyLabelProps) {
  const groupRef = useRef<Group>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);

  // Update position and visibility each frame.
  // Priority -1 ensures this runs BEFORE the Html component's useFrame (priority 0),
  // so the group position is set before Html projects it to screen space.
  // This prevents oscillation at high simulation speeds.
  useFrame(({ camera, size }) => {
    if (!groupRef.current) return;

    // Update position to track body
    groupRef.current.position.set(...body.position);

    // Compute screen-space radius for visibility threshold
    tempPosition.set(...body.position);
    const distance = tempPosition.distanceTo(camera.position);

    if (distance <= body.radius) {
      // Camera inside body - hide label
      if (isVisibleRef.current && htmlRef.current) {
        htmlRef.current.style.display = 'none';
        isVisibleRef.current = false;
      }
      return;
    }

    const fov = 'fov' in camera ? (camera.fov as number) : 50;
    const angularRadius = Math.asin(Math.min(body.radius / distance, 1));
    const fovRad = (fov * Math.PI) / 180;
    const screenRadius = (angularRadius / fovRad) * size.height;

    // Hide when body is very large on screen (obvious what it is)
    const shouldShow = screenRadius < LABEL_THRESHOLDS.hideAbovePx;
    
    if (htmlRef.current) {
      if (shouldShow !== isVisibleRef.current) {
        htmlRef.current.style.display = shouldShow ? 'block' : 'none';
        isVisibleRef.current = shouldShow;
      }

      if (shouldShow) {
        // Compute the offset needed to place label above the visible element
        // When far away, the indicator is visible (INDICATOR_SIZE_PX tall)
        // When close, the planet sphere is visible (screenRadius * 2 diameter)
        const visualHeightPx = Math.max(screenRadius, INDICATOR_SIZE_PX / 2);
        const totalOffsetPx = visualHeightPx + MIN_LABEL_OFFSET_PX;

        // Combine vertical offset with any screen-space spread offset
        const offsetX = screenOffset?.[0] ?? 0;
        const offsetY = screenOffset?.[1] ?? 0;

        // Apply the combined offset via CSS transform
        // Negative Y moves up in screen space; positive X moves right
        htmlRef.current.style.transform = `translate(${offsetX}px, ${-totalOffsetPx - offsetY}px)`;
      }
    }
  }, -1); // Priority -1: run before Html's useFrame

  if (!visible || occluded) return null;

  return (
    <group ref={groupRef}>
      <Html
        center
        zIndexRange={BODY_LABEL_HTML_Z_INDEX_RANGE}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        <div ref={htmlRef} style={{ display: 'block', pointerEvents: 'none' }}>
          <BodyLabelText displayName={body.displayName} />
        </div>
      </Html>
    </group>
  );
}

export function BodyLabelText({ displayName }: { displayName: string }) {
  return (
    <div
      className="body-label"
      style={{
        background: 'transparent',
        border: 'none',
        padding: '4px 8px',
        color: '#fff',
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 500,
        textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
        letterSpacing: '0.02em',
        opacity: 0.9,
        pointerEvents: 'none'
      }}
    >
      {displayName}
    </div>
  );
}
