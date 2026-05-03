import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JumpToSelector } from './JumpToSelector';
import { resolveBodyCatalog } from '../../solar-system/data/bodyStateStore';
import { presentationBodyMetadata } from '../../solar-system/data/bodyPresentation';
import { type BodyId } from '../../solar-system/domain/body';

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
        onFocusTarget={vi.fn()}
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
        onFocusTarget={onFocusBody}
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
        onFocusTarget={vi.fn()}
        onReturnToOverview={onReturnToOverview}
        onToggleExpanded={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Jump to overview' }));

    expect(onReturnToOverview).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows selectable system rows for loaded parent-satellite systems', () => {
    render(
      <JumpToSelector
        catalog={catalog}
        focusedBodyId="overview"
        isExpanded
        onClose={vi.fn()}
        onFocusTarget={vi.fn()}
        onReturnToOverview={vi.fn()}
        onToggleExpanded={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Jump to Jupiter system' }))
      .toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jump to Saturn system' }))
      .toBeInTheDocument();
  });

  it('selects a system target and closes the panel', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onFocusTarget = vi.fn();

    render(
      <JumpToSelector
        catalog={catalog}
        focusedBodyId="overview"
        isExpanded
        onClose={onClose}
        onFocusTarget={onFocusTarget}
        onReturnToOverview={vi.fn()}
        onToggleExpanded={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Jump to Jupiter system' }));

    expect(onFocusTarget).toHaveBeenCalledWith('system:jupiter');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not show system rows without a loaded parent and satellite pair', () => {
    const partialCatalog = createCatalogForBodyIds(['sun', 'jupiter', 'ganymede']);
    const missingParentCatalog = createCatalogForBodyIds(['ganymede']);

    const { rerender } = render(
      <JumpToSelector
        catalog={partialCatalog}
        focusedBodyId="overview"
        isExpanded
        onClose={vi.fn()}
        onFocusTarget={vi.fn()}
        onReturnToOverview={vi.fn()}
        onToggleExpanded={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Jump to Jupiter system' }))
      .toBeInTheDocument();

    rerender(
      <JumpToSelector
        catalog={missingParentCatalog}
        focusedBodyId="overview"
        isExpanded
        onClose={vi.fn()}
        onFocusTarget={vi.fn()}
        onReturnToOverview={vi.fn()}
        onToggleExpanded={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'Jump to Jupiter system' }))
      .not.toBeInTheDocument();
  });
});

function createCatalogForBodyIds(bodyIds: BodyId[]) {
  const metadata = presentationBodyMetadata.filter((body) => bodyIds.includes(body.id));

  return resolveBodyCatalog(
    metadata,
    {
      capturedAt: '2000-01-01T12:00:00.000Z',
      bodies: metadata.map((body, index) => ({
        id: body.id,
        position: [index * 10, 0, 0] as [number, number, number]
      })),
      trails: []
    }
  );
}
