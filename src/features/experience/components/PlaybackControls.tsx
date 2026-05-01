import './playback-controls.css';
import { type PlaybackDirection } from '../state/useSimulationClock';

type PlaybackControlsProps = {
  canDecreaseSpeed: boolean;
  canIncreaseSpeed: boolean;
  direction: PlaybackDirection;
  isPaused: boolean;
  isPlaybackBlocked: boolean;
  playbackRateLabel: string;
  requestedUtc: string;
  onDecreaseSpeed: () => void;
  onIncreaseSpeed: () => void;
  onSelectDirection: (direction: PlaybackDirection) => void;
  onTogglePaused: () => void;
};

export function PlaybackControls({
  canDecreaseSpeed,
  canIncreaseSpeed,
  direction,
  isPaused,
  isPlaybackBlocked,
  playbackRateLabel,
  requestedUtc,
  onDecreaseSpeed,
  onIncreaseSpeed,
  onSelectDirection,
  onTogglePaused
}: PlaybackControlsProps) {
  return (
    <div className="playback-controls" aria-label="Simulation playback controls">
      <div className="playback-controls__time">
        <span className="playback-controls__time-label">Simulation time</span>
        <time dateTime={requestedUtc}>{formatUtcTimestamp(requestedUtc)}</time>
      </div>
      <div className="playback-controls__transport">
        <div className="playback-controls__direction" aria-label="Playback direction">
          <button
            aria-label="Set playback direction to reverse"
            aria-pressed={direction === 'reverse'}
            className="playback-controls__direction-button"
            type="button"
            onClick={() => onSelectDirection('reverse')}
          >
            Reverse
          </button>
          <button
            aria-label="Set playback direction to forward"
            aria-pressed={direction === 'forward'}
            className="playback-controls__direction-button"
            type="button"
            onClick={() => onSelectDirection('forward')}
          >
            Forward
          </button>
        </div>
        <button
          aria-label="Decrease simulation speed"
          className="playback-controls__button"
          disabled={!canDecreaseSpeed}
          type="button"
          onClick={onDecreaseSpeed}
        >
          <MinusIcon />
        </button>
        <button
          aria-label={isPaused ? 'Resume simulation' : 'Pause simulation'}
          className="playback-controls__button playback-controls__button--primary"
          disabled={isPaused && isPlaybackBlocked}
          type="button"
          onClick={onTogglePaused}
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </button>
        <div className="playback-controls__speed" aria-label={`Simulation speed ${playbackRateLabel}`}>
          {playbackRateLabel}
        </div>
        <button
          aria-label="Increase simulation speed"
          className="playback-controls__button"
          disabled={!canIncreaseSpeed}
          type="button"
          onClick={onIncreaseSpeed}
        >
          <PlusIcon />
        </button>
      </div>
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

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="9" y1="5" x2="9" y2="19" />
      <line x1="15" y1="5" x2="15" y2="19" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
