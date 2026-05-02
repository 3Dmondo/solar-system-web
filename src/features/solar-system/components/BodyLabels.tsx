import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import {
  type BodyDefinition,
  type BodyId,
  type ViewTargetId
} from '../domain/body';
import { shouldShowBodySatelliteAdornment } from '../domain/satelliteAdornmentVisibility';
import {
  useLabelOverlap,
  type LabelOverlapResult
} from '../hooks/useLabelOverlap';
import { BodyLabel } from './BodyLabel';

type BodyLabelsProps = {
  bodies: BodyDefinition[];
  focusedBodyId: ViewTargetId;
  visible?: boolean;
};

/**
 * Manages all body labels in the scene.
 * Labels are passive text overlays that help identify bodies at a glance.
 * Handles overlap detection: satellites occluded when overlapping parent,
 * same-level bodies (planets) spread apart.
 */
export function BodyLabels({
  bodies,
  focusedBodyId,
  visible = true
}: BodyLabelsProps) {
  const { computeOverlaps } = useLabelOverlap();
  const { camera, size } = useThree();
  const overlapResultsRef = useRef<Map<BodyId, LabelOverlapResult>>(new Map());
  const [visibleBodyIds, setVisibleBodyIds] = useState<Set<BodyId>>(
    () => new Set(bodies.map((body) => body.id))
  );
  const lastVisibleBodyIdsRef = useRef<Set<BodyId>>(visibleBodyIds);
  const bodiesById = useMemo(
    () => new Map(bodies.map((body) => [body.id, body])),
    [bodies]
  );

  // Compute overlap state each frame
  useFrame(() => {
    if (!visible || bodies.length === 0) {
      overlapResultsRef.current.clear();
      return;
    }

    const fov = 'fov' in camera ? (camera.fov as number) : 50;
    const nextVisibleBodyIds = new Set<BodyId>();

    for (const body of bodies) {
      if (shouldShowBodySatelliteAdornment(
        body,
        bodiesById,
        camera,
        size.width,
        size.height,
        fov,
        focusedBodyId
      )) {
        nextVisibleBodyIds.add(body.id);
      }
    }

    if (!setsEqual(lastVisibleBodyIdsRef.current, nextVisibleBodyIds)) {
      lastVisibleBodyIdsRef.current = nextVisibleBodyIds;
      setVisibleBodyIds(nextVisibleBodyIds);
    }

    const visibleLabels = bodies.filter((body) => nextVisibleBodyIds.has(body.id)).map((body) => ({
      bodyId: body.id,
      worldPosition: body.position
    }));

    overlapResultsRef.current = computeOverlaps(visibleLabels);
  });

  if (!visible) return null;

  return (
    <>
      {bodies.map((body) => {
        const overlapResult = overlapResultsRef.current.get(body.id);
        return (
          <BodyLabel
            key={body.id}
            body={body}
            visible={visibleBodyIds.has(body.id)}
            occluded={overlapResult?.occluded ?? false}
            screenOffset={overlapResult?.offset}
          />
        );
      })}
    </>
  );
}

function setsEqual(a: Set<BodyId>, b: Set<BodyId>) {
  if (a.size !== b.size) {
    return false;
  }

  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }

  return true;
}
