import { isSystemTargetId, type ViewTargetId } from '../../solar-system/domain/body';
import { type FocusedBodyFacts } from '../domain/bodyFacts';
import { type ResolvedBodyCatalogStatus } from '../state/useResolvedBodyCatalog';
import './experience-hud.css';

type ExperienceHudProps = {
  catalogError: Error | null;
  catalogStatus: ResolvedBodyCatalogStatus;
  focusedBodyFacts?: FocusedBodyFacts | null;
  focusedBodyId: ViewTargetId;
  focusedBodyDisplayName: string | null;
  rangeWarning?: {
    title: string;
    detail: string;
    hint: string;
  } | null;
  onClose?: () => void;
};

export function ExperienceHud({
  catalogError,
  catalogStatus,
  focusedBodyFacts = null,
  focusedBodyId,
  focusedBodyDisplayName,
  rangeWarning = null,
  onClose
}: ExperienceHudProps) {
  const showingOverview = focusedBodyId === 'overview';
  const showingSystem = isSystemTargetId(focusedBodyId);
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
      {onClose ? (
        <button
          aria-label="Close information panel"
          className="experience-hud__close"
          type="button"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      ) : null}
      <div className="experience-hud__title">{focusedBodyDisplayName ?? 'Solar System'}</div>
      <div className="experience-hud__subtitle">
        {showingOverview
          ? 'Interactive solar system overview'
          : showingSystem
            ? 'Planetary system view'
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
      {!showingOverview && focusedBodyFacts ? (
        <section className="experience-hud__facts" aria-label="Focused body facts">
          <div className="experience-hud__facts-heading">Facts</div>
          <div className="experience-hud__facts-summary">
            {focusedBodyFacts.summaryParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="experience-hud__fact-list">
            {focusedBodyFacts.rows.map((row) => (
              <div className="experience-hud__fact-row" key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
