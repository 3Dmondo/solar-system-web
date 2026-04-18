import { useEffect, useRef, useState } from 'react';
import { type BodyId, type ViewTargetId } from '../../solar-system/domain/body';
import { getBodyById } from '../../solar-system/data/mockBodyCatalog';
import './experience-hud.css';

const jumpToGroups: Array<{ label: string; bodyIds: BodyId[] }> = [
  {
    label: 'Quick picks',
    bodyIds: ['sun', 'earth', 'moon', 'saturn']
  },
  {
    label: 'Inner planets',
    bodyIds: ['mercury', 'venus', 'mars']
  },
  {
    label: 'Outer planets',
    bodyIds: ['jupiter', 'uranus', 'neptune']
  }
];

type ExperienceHudProps = {
  focusedBodyId: ViewTargetId;
  isCoarsePointer: boolean;
  onFocusBody: (bodyId: BodyId) => void;
  onReturnToOverview: () => void;
};

export function ExperienceHud({
  focusedBodyId,
  isCoarsePointer,
  onFocusBody,
  onReturnToOverview
}: ExperienceHudProps) {
  const body = focusedBodyId === 'overview' ? null : getBodyById(focusedBodyId);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [jumpMenuVisible, setJumpMenuVisible] = useState(false);
  const jumpButtonRef = useRef<HTMLButtonElement | null>(null);
  const jumpPanelRef = useRef<HTMLDivElement | null>(null);
  const showingOverview = focusedBodyId === 'overview';

  useEffect(() => {
    if (showingOverview) {
      return;
    }

    setJumpMenuVisible(false);
  }, [showingOverview]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setInstructionsVisible(false);
        setJumpMenuVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!jumpMenuVisible) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (
        jumpPanelRef.current?.contains(target) ||
        jumpButtonRef.current?.contains(target)
      ) {
        return;
      }

      setJumpMenuVisible(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [jumpMenuVisible]);

  const handleFocusBody = (bodyId: BodyId) => {
    setJumpMenuVisible(false);
    onFocusBody(bodyId);
  };

  return (
    <div className="experience-hud">
      <button
        aria-expanded={instructionsVisible}
        aria-label="Show interaction help"
        className="experience-hud__help-button"
        type="button"
        onClick={() => {
          setJumpMenuVisible(false);
          setInstructionsVisible((value) => !value);
        }}
      >
        ?
      </button>
      {!showingOverview ? (
        <button
          aria-label="Return to solar system overview"
          className="experience-hud__overview-button"
          type="button"
          onClick={onReturnToOverview}
        >
          Overview
        </button>
      ) : null}
      <div className="experience-hud__title">{body?.displayName ?? 'Solar System'}</div>
      <div className="experience-hud__subtitle">
        {showingOverview
          ? 'Use Jump to or double tap or double click a body to focus it from the overview'
          : 'Use Overview to recover the wider system, or double tap or double click another body to refocus'}
      </div>
      {showingOverview ? (
        <div className="experience-hud__action-row">
          <button
            ref={jumpButtonRef}
            aria-expanded={jumpMenuVisible}
            aria-haspopup="dialog"
            aria-label="Open jump to bodies"
            className="experience-hud__jump-button"
            type="button"
            onClick={() => {
              setInstructionsVisible(false);
              setJumpMenuVisible((value) => !value);
            }}
          >
            Jump to
          </button>
        </div>
      ) : null}
      {showingOverview && jumpMenuVisible ? (
        <div
          ref={jumpPanelRef}
          className={[
            'experience-hud__jump-panel',
            isCoarsePointer
              ? 'experience-hud__jump-panel--sheet'
              : 'experience-hud__jump-panel--popover'
          ].join(' ')}
          role="dialog"
          aria-label="Jump to bodies"
        >
          <div className="experience-hud__jump-header">
            <div className="experience-hud__jump-title">Jump to</div>
            <button
              aria-label="Close jump to bodies"
              className="experience-hud__jump-close-button"
              type="button"
              onClick={() => setJumpMenuVisible(false)}
            >
              Close
            </button>
          </div>
          {jumpToGroups.map((group) => (
            <div
              key={group.label}
              className="experience-hud__jump-group"
              role="group"
              aria-label={group.label}
            >
              <div className="experience-hud__jump-group-label">{group.label}</div>
              <div className="experience-hud__jump-grid">
                {group.bodyIds.map((bodyId) => {
                  const targetBody = getBodyById(bodyId);

                  if (!targetBody) {
                    return null;
                  }

                  return (
                    <button
                      key={targetBody.id}
                      aria-label={`Jump to ${targetBody.displayName}`}
                      className="experience-hud__jump-target-button"
                      type="button"
                      onClick={() => handleFocusBody(targetBody.id)}
                    >
                      {targetBody.displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {instructionsVisible ? (
        <div className="experience-hud__instructions" role="dialog" aria-label="Interaction help">
          <div>Desktop: drag to orbit, wheel to zoom, double click a body, or use Jump to focus.</div>
          <div>Mobile: drag to orbit, pinch to zoom, double tap a body, or use Jump to focus.</div>
          <div>Use Overview while focused, or zoom farther out to recover a broader view.</div>
        </div>
      ) : null}
    </div>
  );
}
