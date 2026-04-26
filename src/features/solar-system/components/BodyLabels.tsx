import type { BodyDefinition, BodyId } from '../domain/body';
import { BodyLabel } from './BodyLabel';

type BodyLabelsProps = {
  bodies: BodyDefinition[];
  onSelect: (bodyId: BodyId) => void;
  visible?: boolean;
};

/**
 * Manages all body labels in the scene.
 * Labels are text overlays that help identify bodies at a glance.
 * Each label handles its own visibility based on screen-space size.
 */
export function BodyLabels({
  bodies,
  onSelect,
  visible = true
}: BodyLabelsProps) {
  if (!visible) return null;

  return (
    <>
      {bodies.map((body) => (
        <BodyLabel key={body.id} body={body} onSelect={onSelect} visible />
      ))}
    </>
  );
}
