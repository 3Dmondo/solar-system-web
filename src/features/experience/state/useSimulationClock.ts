import { useEffect, useState } from 'react';

export type UseSimulationClockOptions = {
  startAt?: Date | string;
  tickIntervalMs?: number;
};

const defaultTickIntervalMs = 1000;
const defaultPlaybackRateMultiplier = 1;

export const simulationPlaybackRateOptions = [
  { label: '1x', multiplier: 1 },
  { label: '1m/s', multiplier: 60 },
  { label: '1h/s', multiplier: 3_600 },
  { label: '1d/s', multiplier: 86_400 }
] as const;

export function useSimulationClock(options: UseSimulationClockOptions = {}) {
  const {
    startAt = new Date(),
    tickIntervalMs = defaultTickIntervalMs
  } = options;
  const [simulationTimeMs, setSimulationTimeMs] = useState(() => normalizeStartAt(startAt).getTime());
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRateMultiplier, setPlaybackRateMultiplier] = useState(defaultPlaybackRateMultiplier);

  useEffect(() => {
    if (!Number.isFinite(tickIntervalMs) || tickIntervalMs <= 0) {
      throw new Error('tickIntervalMs must be a finite number greater than zero');
    }

    if (isPaused) {
      return;
    }

    let previousRealTimeMs = Date.now();
    const intervalId = window.setInterval(() => {
      const currentRealTimeMs = Date.now();
      const elapsedRealTimeMs = currentRealTimeMs - previousRealTimeMs;

      previousRealTimeMs = currentRealTimeMs;
      setSimulationTimeMs((value) => value + elapsedRealTimeMs * playbackRateMultiplier);
    }, tickIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaused, playbackRateMultiplier, tickIntervalMs]);

  return {
    isPaused,
    pause: () => setIsPaused(true),
    playbackRateLabel: getPlaybackRateLabel(playbackRateMultiplier),
    playbackRateMultiplier,
    requestedUtc: new Date(simulationTimeMs).toISOString(),
    resume: () => setIsPaused(false),
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
