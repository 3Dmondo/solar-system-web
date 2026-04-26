import { Billboard } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Color, Group, Mesh, ShaderMaterial, Vector3 } from 'three';
import { type BodyDefinition, type BodyId } from '../domain/body';

// Default indicator size in pixels (circumference diameter)
const INDICATOR_SIZE_PX = 24;

const indicatorVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const indicatorFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uGlowIntensity;

varying vec2 vUv;

void main() {
  // Distance from center (0.5, 0.5) in UV space
  vec2 center = vUv - 0.5;
  float dist = length(center) * 2.0;
  
  // Ring parameters
  float ringRadius = 0.7;
  float ringThickness = 0.12;
  float innerEdge = ringRadius - ringThickness;
  float outerEdge = ringRadius + ringThickness;
  
  // Sharp ring with soft edges
  float ring = smoothstep(innerEdge - 0.08, innerEdge, dist) * 
               (1.0 - smoothstep(outerEdge, outerEdge + 0.08, dist));
  
  // Subtle outer glow
  float glow = (1.0 - smoothstep(outerEdge, 1.0, dist)) * uGlowIntensity * 0.3;
  
  float alpha = max(ring, glow);
  
  if (alpha < 0.01) discard;
  
  gl_FragColor = vec4(uColor, alpha);
}
`;

type BodyIndicatorProps = {
  body: BodyDefinition;
  onSelect: (bodyId: BodyId) => void;
  /** Whether to show the indicator (controlled by screen-space threshold) */
  visible?: boolean;
  /** Optional screen-space offset for overlap spreading */
  screenOffset?: [number, number];
};

// Reusable vector to avoid allocations
const tempPosition = new Vector3();
const tempRight = new Vector3();
const tempUp = new Vector3();
const tempForward = new Vector3();

/**
 * A camera-facing billboard indicator for bodies that are too small to see.
 * Rendered as a ring (circumference) with fixed screen-space size and subtle glow.
 * Selectable via double-click or double-tap.
 */
export function BodyIndicator({
  body,
  onSelect,
  visible = true,
  screenOffset
}: BodyIndicatorProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const lastTouchTapRef = useRef(0);

  // Parse the hex color
  const colorObj = useMemo(() => new Color(body.color), [body.color]);

  // Create shader material
  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uColor: { value: colorObj },
        uGlowIntensity: { value: 0.6 }
      },
      vertexShader: indicatorVertexShader,
      fragmentShader: indicatorFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending
    });
  }, [colorObj]);

  // Update position and scale each frame to track body and maintain fixed screen-space size
  useFrame(({ camera, size }) => {
    if (!groupRef.current || !meshRef.current) return;

    // Update group position to track body
    tempPosition.set(...body.position);
    
    const distance = tempPosition.distanceTo(camera.position);

    // Compute the world-space size needed for a fixed pixel size
    // Using the vertical FOV and viewport height
    const fov = 'fov' in camera ? (camera.fov as number) : 50;
    const fovRad = (fov * Math.PI) / 180;
    const pixelSizeInWorld =
      (2 * distance * Math.tan(fovRad / 2)) / size.height;

    // Use the larger of indicator size or min touch target for hit testing
    // But visually display the smaller indicator
    const visualSize = INDICATOR_SIZE_PX * pixelSizeInWorld;

    // Use the visual size for rendering
    meshRef.current.scale.setScalar(visualSize);

    // Apply screen offset if provided (for overlap spreading)
    if (screenOffset) {
      // Convert screen offset to world offset in the camera plane
      camera.matrixWorld.extractBasis(tempRight, tempUp, tempForward);
      
      const offsetX = screenOffset[0] * pixelSizeInWorld;
      const offsetY = screenOffset[1] * pixelSizeInWorld;
      
      groupRef.current.position.set(
        body.position[0] + tempRight.x * offsetX + tempUp.x * offsetY,
        body.position[1] + tempRight.y * offsetX + tempUp.y * offsetY,
        body.position[2] + tempRight.z * offsetX + tempUp.z * offsetY
      );
    } else {
      groupRef.current.position.set(...body.position);
    }
  });

  const handleDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(body.id);
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    if (event.pointerType !== 'touch') {
      return;
    }

    const now = performance.now();

    if (now - lastTouchTapRef.current < 320) {
      onSelect(body.id);
      lastTouchTapRef.current = 0;
      return;
    }

    lastTouchTapRef.current = now;
  };

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh
          ref={meshRef}
          onDoubleClick={handleDoubleClick}
          onPointerDown={handlePointerDown}
          material={material}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      </Billboard>
    </group>
  );
}

/**
 * Configuration for body indicator visibility thresholds
 */
export const INDICATOR_THRESHOLDS = {
  /** Show indicator when body's screen-space radius drops below this (pixels) */
  showBelowPx: 4,
  /** Hide indicator when body's screen-space radius exceeds this (pixels) */
  hideAbovePx: 8
} as const;
