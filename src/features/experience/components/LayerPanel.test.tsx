import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayerPanel } from './LayerPanel';
import { LAYER_CONFIGS, type LayerVisibility } from '../state/useLayerVisibility';

describe('LayerPanel', () => {
  afterEach(() => {
    cleanup();
  });

  const visibility: LayerVisibility = {
    trails: true,
    bodyIndicators: true,
    labels: false,
    satellites: true,
    milkyWay: true,
    stars: true,
    constellations: false
  };

  it('uses check rows instead of switch controls', () => {
    render(
      <LayerPanel
        isExpanded
        visibility={visibility}
        layerConfigs={LAYER_CONFIGS}
        onClose={vi.fn()}
        onToggleExpanded={vi.fn()}
        onToggleLayer={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Layer visibility' })).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Orbital trails' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Body labels' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles a selected layer row', async () => {
    const user = userEvent.setup();
    const onToggleLayer = vi.fn();

    render(
      <LayerPanel
        isExpanded
        visibility={visibility}
        layerConfigs={LAYER_CONFIGS}
        onClose={vi.fn()}
        onToggleExpanded={vi.fn()}
        onToggleLayer={onToggleLayer}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Body labels' }));

    expect(onToggleLayer).toHaveBeenCalledWith('labels');
  });
});
