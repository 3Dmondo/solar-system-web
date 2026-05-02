import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Vector3 } from 'three';
import { type BodyDefinition } from '../domain/body';
import { SunImpostor } from './SunImpostor';
import { computeSunImpostorOpacity } from './sunImpostorOpacity';

// Reusable vector for calculations
const tempVec = new Vector3();

type SunImpostorWrapperProps = {
  sunBody: BodyDefinition;
};

/**
 * Wrapper component that manages SunImpostor visibility and opacity
 * based on the Sun's screen-space radius.
 */
export function SunImpostorWrapper({ sunBody }: SunImpostorWrapperProps) {
  const { camera, size } = useThree();
  const [opacity, setOpacity] = useState(0);
  const lastOpacityRef = useRef(0);

  useFrame(() => {
    // Compute screen-space radius of the Sun using live position
    tempVec.set(...sunBody.position);
    const distance = tempVec.distanceTo(camera.position);

    if (distance <= sunBody.radius) {
      // Camera inside the Sun - don't show impostor
      if (lastOpacityRef.current !== 0) {
        lastOpacityRef.current = 0;
        setOpacity(0);
      }
      return;
    }

    const fov = 'fov' in camera ? (camera.fov as number) : 50;
    const fovRad = (fov * Math.PI) / 180;
    const angularRadius = Math.asin(Math.min(sunBody.radius / distance, 1));
    const screenRadius = (angularRadius / fovRad) * size.height;

    // Compute the target opacity
    const targetOpacity = computeSunImpostorOpacity(screenRadius);

    // Smooth the opacity transition
    const blendFactor = 0.15;
    const smoothedOpacity =
      lastOpacityRef.current + (targetOpacity - lastOpacityRef.current) * blendFactor;

    // Only update state if the change is significant
    if (Math.abs(smoothedOpacity - lastOpacityRef.current) > 0.01) {
      lastOpacityRef.current = smoothedOpacity;
      setOpacity(smoothedOpacity);
    }
  });

  // Don't render if fully transparent
  if (opacity < 0.01) {
    return null;
  }

  return <SunImpostor sunBody={sunBody} opacity={opacity} />;
}
