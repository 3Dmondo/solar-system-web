import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type ReferenceFrame,
  type ReferenceFrameId
} from '../../solar-system/domain/referenceFrame';
import './reference-frame-selector.css';

type ReferenceFrameSelectorProps = {
  selectedFrameId: ReferenceFrameId;
  availableFrames: ReferenceFrame[];
  onSelectFrame: (frameId: ReferenceFrameId) => void;
};

/**
 * Floating selector for choosing the reference frame.
 * Shows a compact button that expands to reveal frame options.
 * Positioned near the layer panel.
 */
export function ReferenceFrameSelector({
  selectedFrameId,
  availableFrames,
  onSelectFrame
}: ReferenceFrameSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedFrame = availableFrames.find((f) => f.id === selectedFrameId);
  const shortLabel = selectedFrameId === 'ssb' ? 'SSB' : 'Earth';

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSelectFrame = useCallback(
    (frameId: ReferenceFrameId) => {
      onSelectFrame(frameId);
      setIsExpanded(false);
    },
    [onSelectFrame]
  );

  // Close panel when clicking outside
  useEffect(() => {
    if (!isExpanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setIsExpanded(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  return (
    <div className="reference-frame-selector-container">
      <button
        ref={buttonRef}
        className="reference-frame-selector__toggle"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-label={`Reference frame: ${selectedFrame?.displayName ?? selectedFrameId}. Click to change.`}
        title={`Frame: ${selectedFrame?.displayName ?? selectedFrameId}`}
      >
        <FrameIcon />
        <span className="reference-frame-selector__label">{shortLabel}</span>
      </button>

      {isExpanded ? (
        <div
          ref={panelRef}
          className="reference-frame-selector__panel"
          role="dialog"
          aria-label="Select reference frame"
        >
          <div className="reference-frame-selector__header">
            <span className="reference-frame-selector__title">Reference Frame</span>
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
              >
                <span className="reference-frame-selector__option-name">
                  {frame.displayName}
                </span>
                <span className="reference-frame-selector__option-desc">
                  {frame.description}
                </span>
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
      {/* Crosshair / target icon representing frame center */}
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  );
}
