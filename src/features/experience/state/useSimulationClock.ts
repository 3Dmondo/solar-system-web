import { useEffect, useRef, useState } from 'react';
import { measureRuntimeDebugMetric } from '../debug/runtimeDebugMetrics';

export type UseSimulationClockOptions = {
  maxUtcMs?: number
  minUtcMs?: number
  startAt?: Date | string;
  tickIntervalMs?: number;
  updateMode?: 'interval' | 'animation-frame';
};

export type PlaybackDirection = 'reverse' | 'forward'
export type PlaybackBoundaryState = 'start' | 'end' | null

const defaultTickIntervalMs = 1000;
const defaultPlaybackRateMultiplier = 1;
const defaultUpdateMode = 'animation-frame';
const secondsPerDay = 86_400;

export const simulationPlaybackRateOptions = [
  { label: '1x', multiplier: 1 },
  { label: '1m/s', multiplier: 60 },
  { label: '1h/s', multiplier: 3_600 },
  { label: '1d/s', multiplier: secondsPerDay },
  { label: '1mo/s', multiplier: 30 * secondsPerDay },
  { label: '1y/s', multiplier: 365 * secondsPerDay }
] as const;

export function useSimulationClock(options: UseSimulationClockOptions = {}) {
  const {
    maxUtcMs,
    minUtcMs,
    startAt = new Date(),
    tickIntervalMs = defaultTickIntervalMs,
    updateMode = defaultUpdateMode
  } = options;
  const [simulationTimeMs, setSimulationTimeMs] = useState(() =>
    clampUtcMs(normalizeStartAt(startAt).getTime(), minUtcMs, maxUtcMs)
  );
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setPlaybackDirection] = useState<PlaybackDirection>('forward');
  const [speedMultiplier, setSpeedMultiplier] = useState(defaultPlaybackRateMultiplier);
  const [boundaryState, setBoundaryState] = useState<PlaybackBoundaryState>(null);
  // Capture the simulation start time once at mount (stable across re-renders).
  const simulationInitialUtcMs = useRef(normalizeStartAt(startAt).getTime()).current;
  const playbackRateMultiplier = direction === 'reverse' ? -speedMultiplier : speedMultiplier;
  const speedIndex = getPlaybackRateIndex(speedMultiplier);
  const isPlaybackBlocked =
    getBlockingBoundaryForDirection(simulationTimeMs, direction, minUtcMs, maxUtcMs) !== null;

  useEffect(() => {
    setSimulationTimeMs((value) => {
      const clampedValue = clampUtcMs(value, minUtcMs, maxUtcMs);

      if (clampedValue !== value) {
        setIsPaused(true);
        setBoundaryState(clampedValue < value ? 'end' : 'start');
      }

      return clampedValue;
    });
  }, [maxUtcMs, minUtcMs]);

  useEffect(() => {
    if (
      updateMode === 'interval'
      && (!Number.isFinite(tickIntervalMs) || tickIntervalMs <= 0)
    ) {
      throw new Error('tickIntervalMs must be a finite number greater than zero');
    }

    if (isPaused) {
      return;
    }

    const getCurrentRealTimeMs =
      updateMode === 'animation-frame'
        ? () => performance.now()
        : () => Date.now();
    let previousRealTimeMs = getCurrentRealTimeMs();

    const advanceSimulationClock = () => {
      measureRuntimeDebugMetric('clockAdvancement', () => {
        const currentRealTimeMs = getCurrentRealTimeMs();
        const elapsedRealTimeMs = currentRealTimeMs - previousRealTimeMs;

        previousRealTimeMs = currentRealTimeMs;
        setSimulationTimeMs((value) => {
          const nextValue = value + elapsedRealTimeMs * playbackRateMultiplier;
          const clampedValue = clampUtcMs(nextValue, minUtcMs, maxUtcMs);

          if (clampedValue !== nextValue) {
            setIsPaused(true);
            setBoundaryState(clampedValue < nextValue ? 'end' : 'start');
          }

          return clampedValue;
        });
      });
    };

    if (updateMode === 'animation-frame') {
      let animationFrameId = 0;

      const handleAnimationFrame = () => {
        advanceSimulationClock();
        animationFrameId = window.requestAnimationFrame(handleAnimationFrame);
      };

      animationFrameId = window.requestAnimationFrame(handleAnimationFrame);

      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }

    const intervalId = window.setInterval(() => {
      advanceSimulationClock();
    }, tickIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaused, maxUtcMs, minUtcMs, playbackRateMultiplier, tickIntervalMs, updateMode]);

  const pause = () => setIsPaused(true);
  const play = () => {
    const nextBoundaryState = getBlockingBoundaryForDirection(
      simulationTimeMs,
      direction,
      minUtcMs,
      maxUtcMs
    );

    setBoundaryState(nextBoundaryState);

    if (nextBoundaryState) {
      setIsPaused(true);
      return;
    }

    setIsPaused(false);
  };
  const increaseSpeed = () => {
    setSpeedMultiplier((currentMultiplier) =>
      simulationPlaybackRateOptions[
        Math.min(getPlaybackRateIndex(currentMultiplier) + 1, simulationPlaybackRateOptions.length - 1)
      ]!.multiplier
    );
  };
  const decreaseSpeed = () => {
    setSpeedMultiplier((currentMultiplier) =>
      simulationPlaybackRateOptions[
        Math.max(getPlaybackRateIndex(currentMultiplier) - 1, 0)
      ]!.multiplier
    );
  };
  const selectDirection = (nextDirection: PlaybackDirection) => {
    setPlaybackDirection(nextDirection);
    setBoundaryState(
      getBlockingBoundaryForDirection(simulationTimeMs, nextDirection, minUtcMs, maxUtcMs)
    );
  };

  return {
    boundaryState,
    canDecreaseSpeed: speedIndex > 0,
    canIncreaseSpeed: speedIndex < simulationPlaybackRateOptions.length - 1,
    direction,
    decreaseSpeed,
    increaseSpeed,
    isPaused,
    isPlaybackBlocked,
    pause,
    play,
    playbackRateLabel: getPlaybackRateLabel(speedMultiplier),
    playbackRateMultiplier,
    requestedUtc: new Date(simulationTimeMs).toISOString(),
    selectDirection,
    playForward: () => {
      selectDirection('forward');
      const nextBoundaryState = getBlockingBoundaryForDirection(
        simulationTimeMs,
        'forward',
        minUtcMs,
        maxUtcMs
      );

      if (!nextBoundaryState) {
        setIsPaused(false);
      }
    },
    playReverse: () => {
      selectDirection('reverse');
      const nextBoundaryState = getBlockingBoundaryForDirection(
        simulationTimeMs,
        'reverse',
        minUtcMs,
        maxUtcMs
      );

      if (!nextBoundaryState) {
        setIsPaused(false);
      }
    },
    resume: play,
    simulationInitialUtcMs,
    cyclePlaybackRate: () =>
      setSpeedMultiplier((currentMultiplier) =>
        simulationPlaybackRateOptions[
          Math.min(getPlaybackRateIndex(currentMultiplier) + 1, simulationPlaybackRateOptions.length - 1)
        ]!.multiplier
      ),
    setPlaybackRateMultiplier: (nextMultiplier: number) => {
      setPlaybackDirection(nextMultiplier < 0 ? 'reverse' : 'forward');
      setSpeedMultiplier(Math.max(Math.abs(nextMultiplier), defaultPlaybackRateMultiplier));
    },
    stepForwardPlaybackRate: increaseSpeed,
    stepReversePlaybackRate: decreaseSpeed,
    speedMultiplier,
    togglePaused: () => {
      if (isPaused) {
        play();
      } else {
        pause();
      }
    }
  };
}

function normalizeStartAt(startAt: Date | string) {
  const startDate = typeof startAt === 'string' ? new Date(startAt) : startAt;

  if (Number.isNaN(startDate.getTime())) {
    throw new Error('startAt must be a valid Date or ISO-8601 string');
  }

  return startDate;
}

function getPlaybackRateIndex(currentMultiplier: number) {
  const currentIndex = simulationPlaybackRateOptions.findIndex(
    (option) => option.multiplier === Math.abs(currentMultiplier)
  );

  if (currentIndex < 0) {
    return 0;
  }

  return currentIndex;
}

function getPlaybackRateLabel(playbackRateMultiplier: number) {
  return (
    simulationPlaybackRateOptions.find(
      (option) => option.multiplier === Math.abs(playbackRateMultiplier)
    )?.label ?? `${playbackRateMultiplier}x`
  );
}

function clampUtcMs(value: number, minUtcMs?: number, maxUtcMs?: number) {
  let clampedValue = value;

  if (minUtcMs !== undefined) {
    clampedValue = Math.max(clampedValue, minUtcMs);
  }

  if (maxUtcMs !== undefined) {
    clampedValue = Math.min(clampedValue, maxUtcMs);
  }

  return clampedValue;
}

function getBlockingBoundaryForDirection(
  utcMs: number,
  direction: PlaybackDirection,
  minUtcMs?: number,
  maxUtcMs?: number
): PlaybackBoundaryState {
  if (direction === 'reverse' && minUtcMs !== undefined && utcMs <= minUtcMs) {
    return 'start';
  }

  if (direction === 'forward' && maxUtcMs !== undefined && utcMs >= maxUtcMs) {
    return 'end';
  }

  return null;
}
