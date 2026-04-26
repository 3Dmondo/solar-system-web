import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { BodyDefinition, BodyId } from '../domain/body';
import {
  useLabelOverlap,
  type LabelOverlapResult
} from '../hooks/useLabelOverlap';
import { BodyLabel } from './BodyLabel';

type BodyLabelsProps = {
  bodies: BodyDefinition[];
  onSelect: (bodyId: BodyId) => void;
  visible?: boolean;
};

/**
 * Manages all body labels in the scene.
 * Labels are text overlays that help identify bodies at a glance.
 * Handles overlap detection: satellites occluded when overlapping parent,
 * same-level bodies (planets) spread apart.
 */
export function BodyLabels({
  bodies,
  onSelect,
  visible = true
}: BodyLabelsProps) {
  const { computeOverlaps } = useLabelOverlap();
  const overlapResultsRef = useRef<Map<BodyId, LabelOverlapResult>>(new Map());

  // Compute overlap state each frame
  useFrame(() => {
    if (!visible || bodies.length === 0) {
      overlapResultsRef.current.clear();
      return;
    }

    const visibleLabels = bodies.map((body) => ({
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
            onSelect={onSelect}
            visible
            occluded={overlapResult?.occluded ?? false}
            screenOffset={overlapResult?.offset}
          />
        );
      })}
    </>
  );
}
