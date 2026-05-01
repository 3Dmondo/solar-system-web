import { type ViewTargetId } from '../../solar-system/domain/body';
import { type ResolvedBodyCatalogStatus } from '../state/useResolvedBodyCatalog';
import './experience-hud.css';

type ExperienceHudProps = {
  catalogError: Error | null;
  catalogStatus: ResolvedBodyCatalogStatus;
  focusedBodyId: ViewTargetId;
  focusedBodyDisplayName: string | null;
  rangeWarning?: {
    title: string;
    detail: string;
    hint: string;
  } | null;
};

export function ExperienceHud({
  catalogError,
  catalogStatus,
  focusedBodyId,
  focusedBodyDisplayName,
  rangeWarning = null
}: ExperienceHudProps) {
  const showingOverview = focusedBodyId === 'overview';
  const statusMessage =
    rangeWarning
      ? null
      : catalogStatus === 'loading'
      ? 'Loading real positions for the requested time.'
      : catalogStatus === 'error'
        ? `Real ephemeris data is unavailable right now. ${catalogError?.message ?? ''}`.trim()
        : null;

  return (
    <div className="experience-hud">
      <div className="experience-hud__title">{focusedBodyDisplayName ?? 'Solar System'}</div>
      <div className="experience-hud__subtitle">
        {showingOverview
          ? 'Interactive solar system overview'
          : 'Focused body view'}
      </div>
      {statusMessage ? (
        <div className="experience-hud__status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}
      {rangeWarning ? (
        <div className="experience-hud__range-warning" aria-live="polite">
          <div className="experience-hud__range-title">{rangeWarning.title}</div>
          <div>{rangeWarning.detail}</div>
          <div>{rangeWarning.hint}</div>
        </div>
      ) : null}
    </div>
  );
}
