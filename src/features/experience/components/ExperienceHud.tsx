import { useState } from 'react';
import { type ViewTargetId } from '../../solar-system/domain/body';
import { getBodyById } from '../../solar-system/data/mockBodyCatalog';
import './experience-hud.css';

type ExperienceHudProps = {
  focusedBodyId: ViewTargetId;
};

export function ExperienceHud({ focusedBodyId }: ExperienceHudProps) {
  const body = focusedBodyId === 'overview' ? null : getBodyById(focusedBodyId);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const showingOverview = focusedBodyId === 'overview';

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
      <div className="experience-hud__title">{body?.displayName ?? 'Solar System'}</div>
      <div className="experience-hud__subtitle">
        {showingOverview
          ? 'Double tap or double click a body to focus it from the overview'
          : 'Double tap or double click another body, and zoom out to reframe the wider system'}
      </div>
      {instructionsVisible ? (
        <div className="experience-hud__instructions" role="dialog" aria-label="Interaction help">
          <div>Desktop: drag to orbit, wheel to zoom, double click a body to focus.</div>
          <div>Mobile: drag to orbit, pinch to zoom, double tap a body to focus.</div>
          <div>Zoom farther out to recover a broader view of the mocked solar system.</div>
        </div>
      ) : null}
    </div>
  );
}
