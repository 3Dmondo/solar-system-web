import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JumpToSelector } from './JumpToSelector';
import { resolveBodyCatalog } from '../../solar-system/data/bodyStateStore';
import { presentationBodyMetadata } from '../../solar-system/data/bodyPresentation';

describe('JumpToSelector', () => {
  afterEach(() => {
    cleanup();
  });

  const catalog = resolveBodyCatalog(
    presentationBodyMetadata,
    {
      capturedAt: '2000-01-01T12:00:00.000Z',
      bodies: presentationBodyMetadata.map((body, index) => ({
        id: body.id,
        position: [index * 10, 0, 0] as [number, number, number]
      })),
      trails: []
    }
  );

  it('shows overview first and removes quick picks', () => {
    render(
      <JumpToSelector
        catalog={catalog}
        focusedBodyId="overview"
        isExpanded
        onClose={vi.fn()}
        onFocusBody={vi.fn()}
        onReturnToOverview={vi.fn()}
        onToggleExpanded={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Overview selected' })).toBeDisabled();
    expect(screen.queryByRole('group', { name: 'Quick picks' })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Solar system' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Earth system' })).toBeInTheDocument();
  });

  it('focuses a selected body and closes the panel', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onFocusBody = vi.fn();

    render(
      <JumpToSelector
        catalog={catalog}
        focusedBodyId="overview"
        isExpanded
        onClose={onClose}
        onFocusBody={onFocusBody}
        onReturnToOverview={vi.fn()}
        onToggleExpanded={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Jump to Earth' }));

    expect(onFocusBody).toHaveBeenCalledWith('earth');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('returns to overview from a focused body', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onReturnToOverview = vi.fn();

    render(
      <JumpToSelector
        catalog={catalog}
        focusedBodyId="saturn"
        isExpanded
        onClose={onClose}
        onFocusBody={vi.fn()}
        onReturnToOverview={onReturnToOverview}
        onToggleExpanded={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Jump to overview' }));

    expect(onReturnToOverview).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
