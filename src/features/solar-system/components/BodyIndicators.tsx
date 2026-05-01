import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { isStar, type BodyDefinition, type BodyId } from '../domain/body';
import { BodyIndicator, INDICATOR_THRESHOLDS } from './BodyIndicator';

type BodyIndicatorsProps = {
  bodies: BodyDefinition[];
  onSelect: (bodyId: BodyId) => void;
  visible?: boolean;
};

// Reusable vector for calculations
const tempVec = new Vector3();

/**
 * Manages all body indicators in the scene.
 * Computes screen-space radii and visibility per body.
 * Excludes stars since they have their own impostor handling.
 */
export function BodyIndicators({
  bodies,
  onSelect,
  visible = true
}: BodyIndicatorsProps) {
  const { camera, size } = useThree();
  const [visibilityMap, setVisibilityMap] = useState<Map<BodyId, boolean>>(new Map());
  const lastVisibilityRef = useRef<Map<BodyId, boolean>>(new Map());

  const indicatorBodies = useMemo(
    () => bodies.filter((body) => !isStar(body.id)),
    [bodies]
  );

  // Update visibility state each frame
  useFrame(() => {
    if (!visible) return;

    const fov = 'fov' in camera ? (camera.fov as number) : 50;
    let hasChanged = false;
    const newVisibility = new Map<BodyId, boolean>();

    for (const body of indicatorBodies) {
      tempVec.set(...body.position);
      const distance = tempVec.distanceTo(camera.position);

      if (distance <= body.radius) {
        newVisibility.set(body.id, false);
        continue;
      }

      const angularRadius = Math.asin(Math.min(body.radius / distance, 1));
      const fovRad = (fov * Math.PI) / 180;
      const screenRadius = (angularRadius / fovRad) * size.height;

      const shouldShow = screenRadius < INDICATOR_THRESHOLDS.showBelowPx;
      newVisibility.set(body.id, shouldShow);

      if (lastVisibilityRef.current.get(body.id) !== shouldShow) {
        hasChanged = true;
      }
    }

    if (hasChanged || lastVisibilityRef.current.size !== newVisibility.size) {
      lastVisibilityRef.current = newVisibility;
      setVisibilityMap(new Map(newVisibility));
    }
  });

  if (!visible) return null;

  return (
    <>
      {indicatorBodies.map((body) => (
        <BodyIndicator
          key={body.id}
          body={body}
          onSelect={onSelect}
          visible={visibilityMap.get(body.id) ?? false}
        />
      ))}
    </>
  );
}
