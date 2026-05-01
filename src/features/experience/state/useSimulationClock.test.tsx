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
        tickIntervalMs: 1000,
        updateMode: 'interval'
      })
    );

    expect(result.current.requestedUtc).toBe('2000-01-01T12:00:00.000Z');
    expect(result.current.playbackRateLabel).toBe('1x');

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
        tickIntervalMs: 1000,
        updateMode: 'interval'
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

  it('supports changing the playback rate without resetting the current time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2000-01-01T12:00:00Z'));

    const { result } = renderHook(() =>
      useSimulationClock({
        startAt: '2000-01-01T12:00:00Z',
        tickIntervalMs: 1000,
        updateMode: 'interval'
      })
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.requestedUtc).toBe('2000-01-01T12:00:02.000Z');

    act(() => {
      result.current.cyclePlaybackRate();
    });

    expect(result.current.playbackRateLabel).toBe('1m/s');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.requestedUtc).toBe('2000-01-01T12:02:02.000Z');
  });

  it('advances the simulation clock on every animation frame by default', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2000-01-01T12:00:00Z'));

    const { result } = renderHook(() =>
      useSimulationClock({
        startAt: '2000-01-01T12:00:00Z'
      })
    );

    expect(result.current.requestedUtc).toBe('2000-01-01T12:00:00.000Z');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(Date.parse(result.current.requestedUtc)).toBeGreaterThan(
      Date.parse('2000-01-01T12:00:00.000Z')
    );
    expect(Date.parse(result.current.requestedUtc)).toBeLessThanOrEqual(
      Date.parse('2000-01-01T12:00:00.120Z')
    );
  });

  it('saturates playback-rate increases at the fastest preset', () => {
    const { result } = renderHook(() =>
      useSimulationClock({
        tickIntervalMs: 1000,
        updateMode: 'interval'
      })
    );

    act(() => {
      result.current.cyclePlaybackRate();
      result.current.cyclePlaybackRate();
      result.current.cyclePlaybackRate();
      result.current.cyclePlaybackRate();
      result.current.cyclePlaybackRate();
      result.current.cyclePlaybackRate();
    });

    expect(result.current.playbackRateLabel).toBe('1y/s');
    expect(result.current.canIncreaseSpeed).toBe(false);
  });

  it('supports reverse playback without changing the displayed speed label sign', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2000-01-01T12:00:00Z'));

    const { result } = renderHook(() =>
      useSimulationClock({
        startAt: '2000-01-01T12:00:00Z',
        tickIntervalMs: 1000,
        updateMode: 'interval'
      })
    );

    act(() => {
      result.current.playReverse();
    });

    expect(result.current.playbackRateMultiplier).toBe(-1);
    expect(result.current.playbackRateLabel).toBe('1x');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.requestedUtc).toBe('2000-01-01T11:59:57.000Z');
  });

  it('increases and decreases speed without changing direction or cycling', () => {
    const { result } = renderHook(() =>
      useSimulationClock({
        tickIntervalMs: 1000,
        updateMode: 'interval'
      })
    );

    act(() => {
      result.current.stepForwardPlaybackRate();
      result.current.stepForwardPlaybackRate();
      result.current.stepForwardPlaybackRate();
      result.current.stepForwardPlaybackRate();
    });

    expect(result.current.playbackRateMultiplier).toBe(30 * 86_400);
    expect(result.current.playbackRateLabel).toBe('1mo/s');

    act(() => {
      result.current.stepForwardPlaybackRate();
    });

    expect(result.current.playbackRateMultiplier).toBe(365 * 86_400);
    expect(result.current.playbackRateLabel).toBe('1y/s');

    act(() => {
      result.current.decreaseSpeed();
    });

    expect(result.current.playbackRateMultiplier).toBe(30 * 86_400);
    expect(result.current.playbackRateLabel).toBe('1mo/s');

    act(() => {
      result.current.decreaseSpeed();
      result.current.decreaseSpeed();
      result.current.decreaseSpeed();
      result.current.decreaseSpeed();
      result.current.decreaseSpeed();
    });

    expect(result.current.playbackRateMultiplier).toBe(1);
    expect(result.current.playbackRateLabel).toBe('1x');
    expect(result.current.canDecreaseSpeed).toBe(false);
  });

  it('play forward and play reverse preserve the current absolute speed', () => {
    const { result } = renderHook(() =>
      useSimulationClock({
        tickIntervalMs: 1000,
        updateMode: 'interval'
      })
    );

    act(() => {
      result.current.stepForwardPlaybackRate();
      result.current.stepForwardPlaybackRate();
      result.current.playReverse();
    });

    expect(result.current.playbackRateMultiplier).toBe(-3_600);

    act(() => {
      result.current.playForward();
    });

    expect(result.current.playbackRateMultiplier).toBe(3_600);
  });

  it('clamps and pauses at the max range during forward playback', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2000-01-01T12:00:00Z'));

    const maxUtcMs = Date.parse('2000-01-01T12:00:02Z');
    const { result } = renderHook(() =>
      useSimulationClock({
        startAt: '2000-01-01T12:00:00Z',
        maxUtcMs,
        tickIntervalMs: 1000,
        updateMode: 'interval'
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.requestedUtc).toBe('2000-01-01T12:00:02.000Z');
    expect(result.current.isPaused).toBe(true);
    expect(result.current.boundaryState).toBe('end');
    expect(result.current.isPlaybackBlocked).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.requestedUtc).toBe('2000-01-01T12:00:02.000Z');
  });

  it('clamps and pauses at the min range during reverse playback', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2000-01-01T12:00:00Z'));

    const minUtcMs = Date.parse('2000-01-01T11:59:58Z');
    const { result } = renderHook(() =>
      useSimulationClock({
        startAt: '2000-01-01T12:00:00Z',
        minUtcMs,
        tickIntervalMs: 1000,
        updateMode: 'interval'
      })
    );

    act(() => {
      result.current.selectDirection('reverse');
      result.current.play();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.requestedUtc).toBe('2000-01-01T11:59:58.000Z');
    expect(result.current.isPaused).toBe(true);
    expect(result.current.boundaryState).toBe('start');
  });

  it('changing direction away from a boundary clears the blocked state', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2000-01-01T12:00:00Z'));

    const maxUtcMs = Date.parse('2000-01-01T12:00:02Z');
    const { result } = renderHook(() =>
      useSimulationClock({
        startAt: '2000-01-01T12:00:00Z',
        maxUtcMs,
        tickIntervalMs: 1000,
        updateMode: 'interval'
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.boundaryState).toBe('end');

    act(() => {
      result.current.selectDirection('reverse');
    });

    expect(result.current.boundaryState).toBeNull();
    expect(result.current.isPlaybackBlocked).toBe(false);
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
