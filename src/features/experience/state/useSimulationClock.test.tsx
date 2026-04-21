import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSimulationClock } from './useSimulationClock';

describe('useSimulationClock', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts from the provided datetime and advances in real time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2000-01-01T12:00:00Z'));

    const { result } = renderHook(() =>
      useSimulationClock({
        startAt: '2000-01-01T12:00:00Z',
        tickIntervalMs: 1000
      })
    );

    expect(result.current.requestedUtc).toBe('2000-01-01T12:00:00.000Z');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.requestedUtc).toBe('2000-01-01T12:00:03.000Z');
  });

  it('can pause and resume the simulation clock without losing the current time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2000-01-01T12:00:00Z'));

    const { result } = renderHook(() =>
      useSimulationClock({
        startAt: '2000-01-01T12:00:00Z',
        tickIntervalMs: 1000
      })
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.requestedUtc).toBe('2000-01-01T12:00:02.000Z');
    expect(result.current.isPaused).toBe(false);

    act(() => {
      result.current.pause();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.isPaused).toBe(true);
    expect(result.current.requestedUtc).toBe('2000-01-01T12:00:02.000Z');

    act(() => {
      result.current.resume();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.isPaused).toBe(false);
    expect(result.current.requestedUtc).toBe('2000-01-01T12:00:05.000Z');
  });

  it('rejects invalid start times', () => {
    expect(() =>
      renderHook(() =>
        useSimulationClock({
          startAt: 'not-a-date'
        })
      )
    ).toThrowError(/startAt must be a valid Date or ISO-8601 string/i);
  });
});
