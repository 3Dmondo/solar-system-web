import { useState } from 'react';
import { type BodyId } from '../../solar-system/domain/body';
import { getBodyById } from '../../solar-system/data/mockBodyCatalog';
import './experience-hud.css';

type ExperienceHudProps = {
  focusedBodyId: BodyId;
};

export function ExperienceHud({ focusedBodyId }: ExperienceHudProps) {
  const body = getBodyById(focusedBodyId);
  const [instructionsVisible, setInstructionsVisible] = useState(false);

  return (
    <div className="experience-hud">
      <button
        aria-expanded={instructionsVisible}
        aria-label="Show interaction help"
        className="experience-hud__help-button"
        type="button"
        onClick={() => setInstructionsVisible((value) => !value)}
      >
        ?
      </button>
      <div className="experience-hud__title">{body?.displayName ?? 'Unknown body'}</div>
      <div className="experience-hud__subtitle">Double tap or double click a body to focus</div>
      {instructionsVisible ? (
        <div className="experience-hud__instructions" role="dialog" aria-label="Interaction help">
          <div>Desktop: drag to orbit, wheel to zoom, double click a body to focus.</div>
          <div>Mobile: drag to orbit, pinch to zoom, double tap a body to focus.</div>
        </div>
      ) : null}
    </div>
  );
}
