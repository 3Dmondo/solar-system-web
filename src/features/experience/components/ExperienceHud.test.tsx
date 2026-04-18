import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExperienceHud } from './ExperienceHud';

describe('ExperienceHud', () => {
  afterEach(() => {
    cleanup();
  });

  const renderHud = (focusedBodyId: 'overview' | 'saturn' = 'overview') =>
    render(
      <ExperienceHud
        focusedBodyId={focusedBodyId}
        isCoarsePointer={false}
        onFocusBody={vi.fn()}
        onReturnToOverview={vi.fn()}
      />
    );

  it('shows the focused body name and lets the user return to the overview', async () => {
    const user = userEvent.setup();
    const onFocusBody = vi.fn();
    const onReturnToOverview = vi.fn();

    render(
      <ExperienceHud
        focusedBodyId="saturn"
        isCoarsePointer={false}
        onFocusBody={onFocusBody}
        onReturnToOverview={onReturnToOverview}
      />
    );

    expect(screen.getByText('Saturn')).toBeInTheDocument();
    expect(screen.getByText(/use overview to recover the wider system/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Return to solar system overview' }));

    expect(onFocusBody).not.toHaveBeenCalled();
    expect(onReturnToOverview).toHaveBeenCalledTimes(1);
  });

  it('opens jump to and focuses a selected body', async () => {
    const user = userEvent.setup();
    const onFocusBody = vi.fn();

    render(
      <ExperienceHud
        focusedBodyId="overview"
        isCoarsePointer={false}
        onFocusBody={onFocusBody}
        onReturnToOverview={() => undefined}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open jump to bodies' }));
    await user.click(screen.getByRole('button', { name: 'Jump to Earth' }));

    expect(onFocusBody).toHaveBeenCalledWith('earth');
  });

  it('closes jump to when escape is pressed', async () => {
    const user = userEvent.setup();

    renderHud();

    await user.click(screen.getByRole('button', { name: 'Open jump to bodies' }));

    expect(screen.getByRole('dialog', { name: 'Jump to bodies' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Jump to bodies' })).not.toBeInTheDocument();
  });

  it('toggles interaction instructions', async () => {
    const user = userEvent.setup();

    render(
      <ExperienceHud
        focusedBodyId="overview"
        isCoarsePointer={false}
        onFocusBody={() => undefined}
        onReturnToOverview={() => undefined}
      />
    );

    const helpButton = screen.getAllByRole('button', { name: 'Show interaction help' })[0]!;

    await user.click(helpButton);

    expect(screen.getByText(/Desktop: drag to orbit, wheel to zoom, double click a body, or use Jump to focus/i)).toBeInTheDocument();
    expect(screen.getByText(/Mobile: drag to orbit, pinch to zoom, double tap a body, or use Jump to focus/i)).toBeInTheDocument();
    expect(screen.getByText(/Use Overview while focused/i)).toBeInTheDocument();
  });
});
