import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { presentationBodyMetadata } from '../../solar-system/data/bodyPresentation';
import { resolveBodyCatalog } from '../../solar-system/data/bodyStateStore';
import { getReferenceFrame } from '../../solar-system/domain/referenceFrame';
import { LAYER_CONFIGS, type LayerVisibility } from '../state/useLayerVisibility';
import { ExperienceControlRail } from './ExperienceControlRail';

describe('ExperienceControlRail', () => {
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
  const visibility: LayerVisibility = {
    trails: true,
    bodyIndicators: true,
    labels: false,
    satellites: true,
    milkyWay: true,
    stars: true,
    constellations: false
  };

  it('exposes an information toggle in the rail', async () => {
    const user = userEvent.setup();
    const onSetActivePanel = vi.fn();

    renderRail({ activePanel: null, onSetActivePanel });

    const infoButton = screen.getByRole('button', { name: 'Show information panel' });
    expect(infoButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(infoButton);

    expect(onSetActivePanel).toHaveBeenCalledWith('info');
  });

  it('allows the active information layer to be hidden', async () => {
    const user = userEvent.setup();
    const onSetActivePanel = vi.fn();

    renderRail({ activePanel: 'info', onSetActivePanel });

    const infoButton = screen.getByRole('button', { name: 'Hide information panel' });
    expect(infoButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(infoButton);

    expect(onSetActivePanel).toHaveBeenCalledWith(null);
  });

  it('replaces the information layer when opening another rail panel', async () => {
    const user = userEvent.setup();
    const onSetActivePanel = vi.fn();

    renderRail({ activePanel: 'info', onSetActivePanel });

    await user.click(screen.getByRole('button', { name: 'Show interaction help' }));

    expect(onSetActivePanel).toHaveBeenCalledWith('help');
  });

  function renderRail({
    activePanel,
    onSetActivePanel
  }: {
    activePanel: 'info' | 'help' | 'jump' | 'frame' | 'layers' | null;
    onSetActivePanel: (panel: 'info' | 'help' | 'jump' | 'frame' | 'layers' | null) => void;
  }) {
    render(
      <ExperienceControlRail
        activePanel={activePanel}
        availableFrames={[getReferenceFrame('ssb')]}
        catalog={catalog}
        focusedBodyId="overview"
        layerConfigs={LAYER_CONFIGS}
        selectedFrameId="ssb"
        visibility={visibility}
        onFocusBody={vi.fn()}
        onReturnToOverview={vi.fn()}
        onSelectFrame={vi.fn()}
        onSetActivePanel={onSetActivePanel}
        onToggleLayer={vi.fn()}
      />
    );
  }
});
