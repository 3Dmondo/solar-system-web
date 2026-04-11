import { type BodyId } from '../../solar-system/domain/body';
import { getBodyById } from '../../solar-system/data/mockBodyCatalog';
import './experience-hud.css';

type ExperienceHudProps = {
  focusedBodyId: BodyId;
};

export function ExperienceHud({ focusedBodyId }: ExperienceHudProps) {
  const body = getBodyById(focusedBodyId);

  return (
    <div className="experience-hud">
      <div className="experience-hud__title">{body?.displayName ?? 'Unknown body'}</div>
      <div className="experience-hud__subtitle">Tap or click a body to focus</div>
    </div>
  );
}
