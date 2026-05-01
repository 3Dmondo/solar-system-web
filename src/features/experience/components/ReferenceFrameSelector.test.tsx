import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReferenceFrameSelector } from './ReferenceFrameSelector';
import { getReferenceFrame } from '../../solar-system/domain/referenceFrame';

describe('ReferenceFrameSelector', () => {
  afterEach(() => {
    cleanup();
  });

  const frames = [
    getReferenceFrame('ssb'),
    getReferenceFrame('earth'),
    getReferenceFrame('jupiter')
  ];

  it('shows compact names-only frame options', () => {
    render(
      <ReferenceFrameSelector
        isExpanded
        selectedFrameId="ssb"
        availableFrames={frames}
        onClose={vi.fn()}
        onSelectFrame={vi.fn()}
        onToggleExpanded={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'SSB' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Earth' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jupiter' })).toBeInTheDocument();
    expect(screen.queryByText(/view centered on/i)).not.toBeInTheDocument();
  });

  it('selects a frame and closes the selector', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSelectFrame = vi.fn();

    render(
      <ReferenceFrameSelector
        isExpanded
        selectedFrameId="ssb"
        availableFrames={frames}
        onClose={onClose}
        onSelectFrame={onSelectFrame}
        onToggleExpanded={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Earth' }));

    expect(onSelectFrame).toHaveBeenCalledWith('earth');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
