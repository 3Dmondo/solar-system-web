import { useEffect, useRef, useState } from 'react';
import {
  BODY_JUMP_GROUPS,
  type BodyId,
  type ViewTargetId
} from '../../solar-system/domain/body';
import {
  type ResolvedBodyCatalog
} from '../../solar-system/data/bodyStateStore';
import { type ResolvedBodyCatalogStatus } from '../state/useResolvedBodyCatalog';
import './experience-hud.css';

type ExperienceHudProps = {
  catalog: ResolvedBodyCatalog;
  catalogError: Error | null;
  catalogStatus: ResolvedBodyCatalogStatus;
  focusedBodyId: ViewTargetId;
  isCoarsePointer: boolean;
  isSimulationPaused: boolean;
  playbackRateLabel: string;
  requestedUtc: string;
  onFocusBody: (bodyId: BodyId) => void;
  onCyclePlaybackRate: () => void;
  onReturnToOverview: () => void;
  onToggleSimulationPaused: () => void;
};

export function ExperienceHud({
  catalog,
  catalogError,
  catalogStatus,
  focusedBodyId,
  isCoarsePointer,
  isSimulationPaused,
  playbackRateLabel,
  requestedUtc,
  onFocusBody,
  onCyclePlaybackRate,
  onReturnToOverview,
  onToggleSimulationPaused
}: ExperienceHudProps) {
  const snapshotBodies = catalog.bodies;
  const body = focusedBodyId === 'overview'
    ? null
    : snapshotBodies.find((targetBody) => targetBody.id === focusedBodyId);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [jumpMenuVisible, setJumpMenuVisible] = useState(false);
  const jumpButtonRef = useRef<HTMLButtonElement | null>(null);
  const jumpPanelRef = useRef<HTMLDivElement | null>(null);
  const showingOverview = focusedBodyId === 'overview';
  const hasJumpTargets = catalog.metadata.length > 0;
  const statusMessage =
    catalogStatus === 'loading'
      ? 'Loading real positions for the requested time.'
      : catalogStatus === 'error'
        ? `Real ephemeris data is unavailable right now. ${catalogError?.message ?? ''}`.trim()
        : null;

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
          ? 'Interactive solar system overview'
          : 'Focused body view'}
      </div>
      <div className="experience-hud__clock">
        <span className="experience-hud__clock-label">Simulation time</span>
        <time dateTime={requestedUtc}>{formatUtcTimestamp(requestedUtc)}</time>
        <span className="experience-hud__clock-state">
          {isSimulationPaused
            ? `Paused at ${playbackRateLabel}`
            : `Running at ${playbackRateLabel}`}
        </span>
      </div>
      {statusMessage ? (
        <div className="experience-hud__status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}
      <div className="experience-hud__action-row">
        <button
          aria-label={isSimulationPaused ? 'Resume simulation' : 'Pause simulation'}
          className="experience-hud__control-button"
          type="button"
          onClick={onToggleSimulationPaused}
        >
          {isSimulationPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          aria-label="Change simulation playback rate"
          className="experience-hud__control-button"
          type="button"
          onClick={onCyclePlaybackRate}
        >
          Rate {playbackRateLabel}
        </button>
        {hasJumpTargets ? (
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
        ) : null}
      </div>
      {hasJumpTargets && jumpMenuVisible ? (
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
          {BODY_JUMP_GROUPS.map((group) => (
            <div
              key={group.label}
              className="experience-hud__jump-group"
              role="group"
              aria-label={group.label}
            >
              <div className="experience-hud__jump-group-label">{group.label}</div>
              <div className="experience-hud__jump-grid">
                {group.bodyIds.map((bodyId) => {
                  const targetBody = catalog.metadata.find((body) => body.id === bodyId);

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
          <div>Use Rate to step through the current playback speeds.</div>
          <div>Use Overview while focused, or zoom farther out to recover a broader view.</div>
        </div>
      ) : null}
    </div>
  );
}

function formatUtcTimestamp(utc: string) {
  const utcDate = new Date(utc);

  if (Number.isNaN(utcDate.getTime())) {
    return 'Invalid UTC time';
  }

  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utcDate.getUTCDate()).padStart(2, '0');
  const hours = String(utcDate.getUTCHours()).padStart(2, '0');
  const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(utcDate.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}
