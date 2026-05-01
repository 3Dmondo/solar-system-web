import { type ReferenceFrame, type ReferenceFrameId } from '../../solar-system/domain/referenceFrame';
import './reference-frame-selector.css';

type ReferenceFrameSelectorProps = {
  isExpanded: boolean;
  selectedFrameId: ReferenceFrameId;
  availableFrames: ReferenceFrame[];
  onClose: () => void;
  onSelectFrame: (frameId: ReferenceFrameId) => void;
  onToggleExpanded: () => void;
};

export function ReferenceFrameSelector({
  isExpanded,
  selectedFrameId,
  availableFrames,
  onClose,
  onSelectFrame,
  onToggleExpanded
}: ReferenceFrameSelectorProps) {
  const selectedFrame = availableFrames.find((frame) => frame.id === selectedFrameId);
  const shortLabel = selectedFrame?.shortLabel ?? selectedFrameId;

  const handleSelectFrame = (frameId: ReferenceFrameId) => {
    onSelectFrame(frameId);
    onClose();
  };

  return (
    <div className="reference-frame-selector-container">
      <button
        className="reference-frame-selector__toggle"
        onClick={onToggleExpanded}
        aria-expanded={isExpanded}
        aria-label={`Reference frame: ${selectedFrame?.displayName ?? selectedFrameId}. Click to change.`}
        title={`Frame: ${selectedFrame?.displayName ?? selectedFrameId}`}
        type="button"
      >
        <FrameIcon />
        <span className="reference-frame-selector__label">{shortLabel}</span>
      </button>

      {isExpanded ? (
        <div
          className="reference-frame-selector__panel"
          role="dialog"
          aria-label="Select reference frame"
        >
          <div className="reference-frame-selector__header">
            <span className="reference-frame-selector__title">Reference Frame</span>
            <button
              className="reference-frame-selector__close"
              onClick={onClose}
              aria-label="Close reference frame selector"
              type="button"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="reference-frame-selector__options">
            {availableFrames.map((frame) => (
              <button
                key={frame.id}
                className={`reference-frame-selector__option ${
                  frame.id === selectedFrameId ? 'reference-frame-selector__option--selected' : ''
                }`}
                onClick={() => handleSelectFrame(frame.id)}
                aria-pressed={frame.id === selectedFrameId}
                type="button"
              >
                <span className="reference-frame-selector__option-name">
                  {frame.shortLabel}
                </span>
                {frame.id === selectedFrameId ? (
                  <span className="reference-frame-selector__selected-mark" aria-hidden="true">
                    <CheckIcon />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FrameIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
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
