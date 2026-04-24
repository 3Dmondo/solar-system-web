import { useEffect, useRef, useState } from 'react';
import { measureRuntimeDebugMetric } from '../debug/runtimeDebugMetrics';

export type UseSimulationClockOptions = {
  startAt?: Date | string;
  tickIntervalMs?: number;
  updateMode?: 'interval' | 'animation-frame';
};

const defaultTickIntervalMs = 1000;
const defaultPlaybackRateMultiplier = 1;
const defaultUpdateMode = 'animation-frame';

export const simulationPlaybackRateOptions = [
  { label: '1x', multiplier: 1 },
  { label: '1m/s', multiplier: 60 },
  { label: '1h/s', multiplier: 3_600 },
  { label: '1d/s', multiplier: 86_400 }
] as const;

export function useSimulationClock(options: UseSimulationClockOptions = {}) {
  const {
    startAt = new Date(),
    tickIntervalMs = defaultTickIntervalMs,
    updateMode = defaultUpdateMode
  } = options;
  const [simulationTimeMs, setSimulationTimeMs] = useState(() => normalizeStartAt(startAt).getTime());
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRateMultiplier, setPlaybackRateMultiplier] = useState(defaultPlaybackRateMultiplier);
  // Capture the simulation start time once at mount (stable across re-renders).
  const simulationInitialUtcMs = useRef(normalizeStartAt(startAt).getTime()).current;

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
        setSimulationTimeMs((value) => value + elapsedRealTimeMs * playbackRateMultiplier);
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
  }, [isPaused, playbackRateMultiplier, tickIntervalMs, updateMode]);

  return {
    isPaused,
    pause: () => setIsPaused(true),
    playbackRateLabel: getPlaybackRateLabel(playbackRateMultiplier),
    playbackRateMultiplier,
    requestedUtc: new Date(simulationTimeMs).toISOString(),
    resume: () => setIsPaused(false),
    simulationInitialUtcMs,
    cyclePlaybackRate: () =>
      setPlaybackRateMultiplier((currentMultiplier) =>
        getNextPlaybackRateMultiplier(currentMultiplier)
      ),
    setPlaybackRateMultiplier,
    togglePaused: () => setIsPaused((value) => !value)
  };
}

function normalizeStartAt(startAt: Date | string) {
  const startDate = typeof startAt === 'string' ? new Date(startAt) : startAt;

  if (Number.isNaN(startDate.getTime())) {
    throw new Error('startAt must be a valid Date or ISO-8601 string');
  }

  return startDate;
}

function getNextPlaybackRateMultiplier(currentMultiplier: number) {
  const currentIndex = simulationPlaybackRateOptions.findIndex(
    (option) => option.multiplier === currentMultiplier
  );

  if (currentIndex < 0) {
    return defaultPlaybackRateMultiplier;
  }

  return simulationPlaybackRateOptions[
    (currentIndex + 1) % simulationPlaybackRateOptions.length
  ]!.multiplier;
}

function getPlaybackRateLabel(playbackRateMultiplier: number) {
  return (
    simulationPlaybackRateOptions.find(
      (option) => option.multiplier === playbackRateMultiplier
    )?.label ?? `${playbackRateMultiplier}x`
  );
}
