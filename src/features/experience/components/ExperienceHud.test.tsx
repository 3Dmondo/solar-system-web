import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExperienceHud } from './ExperienceHud';
import { getResolvedBodyCatalog } from '../../solar-system/data/bodyStateStore';

describe('ExperienceHud', () => {
  afterEach(() => {
    cleanup();
  });

  const catalog = getResolvedBodyCatalog();

  const renderHud = (focusedBodyId: 'overview' | 'saturn' = 'overview') =>
    render(
      <ExperienceHud
        catalog={catalog}
        catalogError={null}
        catalogStatus="ready"
        focusedBodyId={focusedBodyId}
        isCoarsePointer={false}
        isSimulationPaused={false}
        requestedUtc="2000-01-01T12:00:00Z"
        onFocusBody={vi.fn()}
        onReturnToOverview={vi.fn()}
        onToggleSimulationPaused={vi.fn()}
      />
    );

  it('shows the focused body name and lets the user return to the overview', async () => {
    const user = userEvent.setup();
    const onFocusBody = vi.fn();
    const onReturnToOverview = vi.fn();

    render(
      <ExperienceHud
        catalog={catalog}
        catalogError={null}
        catalogStatus="ready"
        focusedBodyId="saturn"
        isCoarsePointer={false}
        isSimulationPaused={false}
        requestedUtc="2000-01-01T12:00:00Z"
        onFocusBody={onFocusBody}
        onReturnToOverview={onReturnToOverview}
        onToggleSimulationPaused={vi.fn()}
      />
    );

    expect(screen.getByText('Saturn')).toBeInTheDocument();
    expect(screen.getByText(/focused body view/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Return to solar system overview' }));

    expect(onFocusBody).not.toHaveBeenCalled();
    expect(onReturnToOverview).toHaveBeenCalledTimes(1);
  });

  it('opens jump to and focuses a selected body', async () => {
    const user = userEvent.setup();
    const onFocusBody = vi.fn();

    render(
      <ExperienceHud
        catalog={catalog}
        catalogError={null}
        catalogStatus="ready"
        focusedBodyId="overview"
        isCoarsePointer={false}
        isSimulationPaused={false}
        requestedUtc="2000-01-01T12:00:00Z"
        onFocusBody={onFocusBody}
        onReturnToOverview={() => undefined}
        onToggleSimulationPaused={vi.fn()}
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
        catalog={catalog}
        catalogError={null}
        catalogStatus="ready"
        focusedBodyId="overview"
        isCoarsePointer={false}
        isSimulationPaused={false}
        requestedUtc="2000-01-01T12:34:56Z"
        onFocusBody={() => undefined}
        onReturnToOverview={() => undefined}
        onToggleSimulationPaused={vi.fn()}
      />
    );

    const helpButton = screen.getAllByRole('button', { name: 'Show interaction help' })[0]!;

    expect(screen.getByText(/interactive solar system overview/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Desktop: drag to orbit, wheel to zoom, double click a body, or use Jump to focus/i)
    ).not.toBeInTheDocument();

    await user.click(helpButton);

    expect(screen.getByText(/Desktop: drag to orbit, wheel to zoom, double click a body, or use Jump to focus/i)).toBeInTheDocument();
    expect(screen.getByText(/Mobile: drag to orbit, pinch to zoom, double tap a body, or use Jump to focus/i)).toBeInTheDocument();
    expect(screen.getByText(/Use Overview while focused/i)).toBeInTheDocument();
    expect(screen.getByText('2000-01-01 12:34:56 UTC')).toBeInTheDocument();
    expect(screen.getByText(/running in real time/i)).toBeInTheDocument();
  });

  it('shows a fallback status message when real ephemeris loading fails', () => {
    render(
      <ExperienceHud
        catalog={catalog}
        catalogError={new Error('Network exploded')}
        catalogStatus="error"
        focusedBodyId="overview"
        isCoarsePointer={false}
        isSimulationPaused={false}
        requestedUtc="2000-01-01T12:00:00Z"
        onFocusBody={() => undefined}
        onReturnToOverview={() => undefined}
        onToggleSimulationPaused={vi.fn()}
      />
    );

    expect(screen.getByText(/showing the fallback snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/network exploded/i)).toBeInTheDocument();
  });

  it('shows a loading message without claiming the fallback snapshot is active', () => {
    render(
      <ExperienceHud
        catalog={catalog}
        catalogError={null}
        catalogStatus="loading"
        focusedBodyId="overview"
        isCoarsePointer={false}
        isSimulationPaused={false}
        requestedUtc="2000-01-01T12:00:00Z"
        onFocusBody={() => undefined}
        onReturnToOverview={() => undefined}
        onToggleSimulationPaused={vi.fn()}
      />
    );

    expect(screen.getByText(/loading real positions for the requested time/i)).toBeInTheDocument();
    expect(screen.queryByText(/showing the fallback snapshot/i)).not.toBeInTheDocument();
  });

  it('toggles the pause or resume simulation control', async () => {
    const user = userEvent.setup();
    const onToggleSimulationPaused = vi.fn();

    render(
      <ExperienceHud
        catalog={catalog}
        catalogError={null}
        catalogStatus="ready"
        focusedBodyId="overview"
        isCoarsePointer={false}
        isSimulationPaused
        requestedUtc="2000-01-01T12:00:00Z"
        onFocusBody={() => undefined}
        onReturnToOverview={() => undefined}
        onToggleSimulationPaused={onToggleSimulationPaused}
      />
    );

    expect(screen.getByText(/paused/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resume simulation' }));

    expect(onToggleSimulationPaused).toHaveBeenCalledTimes(1);
  });
});
