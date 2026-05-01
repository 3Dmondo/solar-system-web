import { useMemo } from 'react';
import {
  getBodyDiscoveryGroups,
  type BodyId,
  type ViewTargetId
} from '../../solar-system/domain/body';
import { type ResolvedBodyCatalog } from '../../solar-system/data/bodyStateStore';
import './jump-to-selector.css';

type JumpToSelectorProps = {
  catalog: ResolvedBodyCatalog;
  focusedBodyId: ViewTargetId;
  isExpanded: boolean;
  onClose: () => void;
  onFocusBody: (bodyId: BodyId) => void;
  onReturnToOverview: () => void;
  onToggleExpanded: () => void;
};

export function JumpToSelector({
  catalog,
  focusedBodyId,
  isExpanded,
  onClose,
  onFocusBody,
  onReturnToOverview,
  onToggleExpanded
}: JumpToSelectorProps) {
  const jumpGroups = useMemo(
    () => getBodyDiscoveryGroups(catalog.metadata.map((metadata) => metadata.id)),
    [catalog.metadata]
  );
  const showingOverview = focusedBodyId === 'overview';

  const handleReturnToOverview = () => {
    if (!showingOverview) {
      onReturnToOverview();
    }

    onClose();
  };

  const handleFocusBody = (bodyId: BodyId) => {
    onFocusBody(bodyId);
    onClose();
  };

  return (
    <div className="jump-to-selector-container">
      <button
        aria-expanded={isExpanded}
        aria-haspopup="dialog"
        aria-label="Open jump to bodies"
        className="jump-to-selector__toggle"
        type="button"
        title="Jump to"
        onClick={onToggleExpanded}
      >
        <JumpIcon />
      </button>

      {isExpanded ? (
        <div
          className="jump-to-selector__panel"
          role="dialog"
          aria-label="Jump to bodies"
        >
          <div className="jump-to-selector__header">
            <span className="jump-to-selector__title">Jump to</span>
            <button
              aria-label="Close jump to bodies"
              className="jump-to-selector__close"
              type="button"
              onClick={onClose}
            >
              <CloseIcon />
            </button>
          </div>

          <button
            aria-label={showingOverview ? 'Overview selected' : 'Jump to overview'}
            aria-pressed={showingOverview}
            className="jump-to-selector__overview"
            disabled={showingOverview}
            type="button"
            onClick={handleReturnToOverview}
          >
            <span>Overview</span>
            {showingOverview ? (
              <span className="jump-to-selector__selected-mark" aria-hidden="true">
                <CheckIcon />
              </span>
            ) : null}
          </button>

          {jumpGroups.map((group) => (
            <div
              key={group.label}
              className="jump-to-selector__group"
              role="group"
              aria-label={group.label}
            >
              <div className="jump-to-selector__group-label">{group.label}</div>
              <div className="jump-to-selector__list">
                {group.bodyIds.map((bodyId) => {
                  const targetBody = catalog.metadata.find((body) => body.id === bodyId);

                  if (!targetBody) {
                    return null;
                  }

                  const isSelected = targetBody.id === focusedBodyId;

                  return (
                    <button
                      key={targetBody.id}
                      aria-label={`Jump to ${targetBody.displayName}`}
                      aria-pressed={isSelected}
                      className="jump-to-selector__target"
                      type="button"
                      onClick={() => handleFocusBody(targetBody.id)}
                    >
                      <span>{targetBody.displayName}</span>
                      {isSelected ? (
                        <span className="jump-to-selector__selected-mark" aria-hidden="true">
                          <CheckIcon />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function JumpIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
      <path d="m7 12 2-2" />
      <path d="m17 12-2-2" />
    </svg>
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

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
