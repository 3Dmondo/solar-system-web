import { useEffect, useState } from 'react';

export type UseSimulationClockOptions = {
  startAt?: Date | string;
  tickIntervalMs?: number;
};

const defaultTickIntervalMs = 1000;

export function useSimulationClock(options: UseSimulationClockOptions = {}) {
  const {
    startAt = new Date(),
    tickIntervalMs = defaultTickIntervalMs
  } = options;
  const [simulationTimeMs, setSimulationTimeMs] = useState(() => normalizeStartAt(startAt).getTime());
  const [isPaused, setIsPaused] = useState(false);

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
      setSimulationTimeMs((value) => value + elapsedRealTimeMs);
    }, tickIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaused, tickIntervalMs]);

  return {
    isPaused,
    pause: () => setIsPaused(true),
    requestedUtc: new Date(simulationTimeMs).toISOString(),
    resume: () => setIsPaused(false),
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
