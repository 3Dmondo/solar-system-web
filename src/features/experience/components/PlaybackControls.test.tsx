import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaybackControls } from './PlaybackControls';

describe('PlaybackControls', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows simulation time, direction controls, and one visible speed label', () => {
    render(
      <PlaybackControls
        canDecreaseSpeed
        canIncreaseSpeed
        direction="forward"
        isPaused={false}
        isPlaybackBlocked={false}
        playbackRateLabel="1h/s"
        requestedUtc="2000-01-01T12:34:56Z"
        onDecreaseSpeed={vi.fn()}
        onIncreaseSpeed={vi.fn()}
        onSelectDirection={vi.fn()}
        onTogglePaused={vi.fn()}
      />
    );

    expect(screen.getByText('2000-01-01 12:34:56 UTC')).toBeInTheDocument();
    expect(screen.queryByText(/forward at 1h\/s/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set playback direction to forward' }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Simulation speed 1h/s')).toBeInTheDocument();
  });

  it('wires direction, play or pause, and bounded speed controls', async () => {
    const user = userEvent.setup();
    const onDecreaseSpeed = vi.fn();
    const onIncreaseSpeed = vi.fn();
    const onSelectDirection = vi.fn();
    const onTogglePaused = vi.fn();

    render(
      <PlaybackControls
        canDecreaseSpeed
        canIncreaseSpeed
        direction="forward"
        isPaused={false}
        isPlaybackBlocked={false}
        playbackRateLabel="1x"
        requestedUtc="2000-01-01T12:00:00Z"
        onDecreaseSpeed={onDecreaseSpeed}
        onIncreaseSpeed={onIncreaseSpeed}
        onSelectDirection={onSelectDirection}
        onTogglePaused={onTogglePaused}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Set playback direction to reverse' }));
    await user.click(screen.getByRole('button', { name: 'Decrease simulation speed' }));
    await user.click(screen.getByRole('button', { name: 'Pause simulation' }));
    await user.click(screen.getByRole('button', { name: 'Increase simulation speed' }));

    expect(onSelectDirection).toHaveBeenCalledWith('reverse');
    expect(onDecreaseSpeed).toHaveBeenCalledTimes(1);
    expect(onTogglePaused).toHaveBeenCalledTimes(1);
    expect(onIncreaseSpeed).toHaveBeenCalledTimes(1);
  });

  it('disables speed buttons at min and max and blocks play at the outward range edge', () => {
    render(
      <PlaybackControls
        canDecreaseSpeed={false}
        canIncreaseSpeed={false}
        direction="forward"
        isPaused
        isPlaybackBlocked
        playbackRateLabel="1y/s"
        requestedUtc="2000-01-01T12:00:00Z"
        onDecreaseSpeed={vi.fn()}
        onIncreaseSpeed={vi.fn()}
        onSelectDirection={vi.fn()}
        onTogglePaused={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Decrease simulation speed' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase simulation speed' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Resume simulation' })).toBeDisabled();
  });
});
