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
    const onToggleInfoPanel = vi.fn();

    renderRail({ activePanel: null, isInfoPanelOpen: false, onToggleInfoPanel });

    const infoButton = screen.getByRole('button', { name: 'Show information panel' });
    expect(infoButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(infoButton);

    expect(onToggleInfoPanel).toHaveBeenCalledTimes(1);
  });

  it('allows the active information layer to be hidden', async () => {
    const user = userEvent.setup();
    const onToggleInfoPanel = vi.fn();

    renderRail({ activePanel: null, isInfoPanelOpen: true, onToggleInfoPanel });

    const infoButton = screen.getByRole('button', { name: 'Hide information panel' });
    expect(infoButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(infoButton);

    expect(onToggleInfoPanel).toHaveBeenCalledTimes(1);
  });

  it('opens other rail panels without changing information panel visibility directly', async () => {
    const user = userEvent.setup();
    const onSetActivePanel = vi.fn();

    renderRail({ activePanel: null, isInfoPanelOpen: true, onSetActivePanel });

    await user.click(screen.getByRole('button', { name: 'Show interaction help' }));

    expect(onSetActivePanel).toHaveBeenCalledWith('help');
  });

  it('keeps the information layer open when the scene is clicked outside it', async () => {
    const user = userEvent.setup();
    const onSetActivePanel = vi.fn();

    renderRail({ activePanel: null, isInfoPanelOpen: true, onSetActivePanel });

    await user.pointer({ keys: '[MouseLeft]', target: document.body });

    expect(onSetActivePanel).not.toHaveBeenCalled();
  });

  it('still closes popover panels when the scene is clicked outside them', async () => {
    const user = userEvent.setup();
    const onSetActivePanel = vi.fn();

    renderRail({ activePanel: 'help', onSetActivePanel });

    await user.pointer({ keys: '[MouseLeft]', target: document.body });

    expect(onSetActivePanel).toHaveBeenCalledWith(null);
  });

  function renderRail({
    activePanel,
    isInfoPanelOpen = false,
    onSetActivePanel = vi.fn(),
    onToggleInfoPanel = vi.fn()
  }: {
    activePanel: 'help' | 'jump' | 'frame' | 'layers' | null;
    isInfoPanelOpen?: boolean;
    onSetActivePanel?: (panel: 'help' | 'jump' | 'frame' | 'layers' | null) => void;
    onToggleInfoPanel?: () => void;
  }) {
    render(
      <ExperienceControlRail
        activePanel={activePanel}
        availableFrames={[getReferenceFrame('ssb')]}
        catalog={catalog}
        focusedBodyId="overview"
        isInfoPanelOpen={isInfoPanelOpen}
        layerConfigs={LAYER_CONFIGS}
        selectedFrameId="ssb"
        visibility={visibility}
        onFocusTarget={vi.fn()}
        onReturnToOverview={vi.fn()}
        onSelectFrame={vi.fn()}
        onSetActivePanel={onSetActivePanel}
        onToggleInfoPanel={onToggleInfoPanel}
        onToggleLayer={vi.fn()}
      />
    );
  }
});
