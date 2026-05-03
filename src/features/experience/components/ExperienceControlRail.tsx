import { useEffect, useRef } from 'react';
import { type ViewTargetId } from '../../solar-system/domain/body';
import { type ResolvedBodyCatalog } from '../../solar-system/data/bodyStateStore';
import { type ReferenceFrame, type ReferenceFrameId } from '../../solar-system/domain/referenceFrame';
import { type LayerConfig, type LayerId, type LayerVisibility } from '../state/useLayerVisibility';
import { FullscreenButton } from './FullscreenButton';
import { JumpToSelector } from './JumpToSelector';
import { LayerPanel } from './LayerPanel';
import { ReferenceFrameSelector } from './ReferenceFrameSelector';
import { type ExperiencePopoverPanel } from '../domain/infoPanelVisibility';
import './experience-control-rail.css';

type ExperienceControlRailProps = {
  activePanel: ExperiencePopoverPanel | null;
  availableFrames: ReferenceFrame[];
  catalog: ResolvedBodyCatalog;
  focusedBodyId: ViewTargetId;
  isInfoPanelOpen: boolean;
  layerConfigs: LayerConfig[];
  selectedFrameId: ReferenceFrameId;
  visibility: LayerVisibility;
  onFocusTarget: (targetId: ViewTargetId) => void;
  onReturnToOverview: () => void;
  onSelectFrame: (frameId: ReferenceFrameId) => void;
  onSetActivePanel: (panel: ExperiencePopoverPanel | null) => void;
  onToggleInfoPanel: () => void;
  onToggleLayer: (layerId: LayerId) => void;
};

export function ExperienceControlRail({
  activePanel,
  availableFrames,
  catalog,
  focusedBodyId,
  isInfoPanelOpen,
  layerConfigs,
  selectedFrameId,
  visibility,
  onFocusTarget,
  onReturnToOverview,
  onSelectFrame,
  onSetActivePanel,
  onToggleInfoPanel,
  onToggleLayer
}: ExperienceControlRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activePanel) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const targetElement = event.target instanceof Element ? event.target : null;

      if (
        railRef.current?.contains(target) ||
        targetElement?.closest('.experience-hud')
      ) {
        return;
      }

      onSetActivePanel(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onSetActivePanel(null);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePanel, onSetActivePanel]);

  const togglePanel = (panel: ExperiencePopoverPanel) => {
    onSetActivePanel(activePanel === panel ? null : panel);
  };

  const closePanel = () => {
    onSetActivePanel(null);
  };

  return (
    <div ref={railRef} className="experience-control-rail" aria-label="Experience controls">
      <div className="experience-control-rail__item">
        <button
          aria-label={isInfoPanelOpen ? 'Hide information panel' : 'Show information panel'}
          aria-pressed={isInfoPanelOpen}
          className="experience-control-rail__button"
          title="Info"
          type="button"
          onClick={onToggleInfoPanel}
        >
          i
        </button>
      </div>

      <div className="experience-control-rail__item">
        <button
          aria-expanded={activePanel === 'help'}
          aria-label="Show interaction help"
          className="experience-control-rail__button"
          title="Help"
          type="button"
          onClick={() => togglePanel('help')}
        >
          ?
        </button>
        {activePanel === 'help' ? (
          <div
            className="experience-control-rail__help-panel"
            role="dialog"
            aria-label="Interaction help"
          >
            <div className="experience-control-rail__panel-header">
              <span className="experience-control-rail__panel-title">Help</span>
              <button
                aria-label="Close interaction help"
                className="experience-control-rail__panel-close"
                type="button"
                onClick={closePanel}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="experience-control-rail__help-copy">
              <div>Desktop: drag to orbit, wheel to zoom, double click a body, or use Jump to focus.</div>
              <div>Mobile: drag to orbit, pinch to zoom, double tap a body, or use Jump to focus.</div>
              <div>Use the playback bar to pause, reverse, or change simulation speed.</div>
              <div>Use Overview in Jump to while focused, or zoom farther out to recover a broader view.</div>
            </div>
          </div>
        ) : null}
      </div>

      <FullscreenButton />

      <JumpToSelector
        catalog={catalog}
        focusedBodyId={focusedBodyId}
        isExpanded={activePanel === 'jump'}
        onClose={closePanel}
        onFocusTarget={onFocusTarget}
        onReturnToOverview={onReturnToOverview}
        onToggleExpanded={() => togglePanel('jump')}
      />

      <ReferenceFrameSelector
        availableFrames={availableFrames}
        isExpanded={activePanel === 'frame'}
        selectedFrameId={selectedFrameId}
        onClose={closePanel}
        onSelectFrame={onSelectFrame}
        onToggleExpanded={() => togglePanel('frame')}
      />

      <LayerPanel
        isExpanded={activePanel === 'layers'}
        visibility={visibility}
        layerConfigs={layerConfigs}
        onClose={closePanel}
        onToggleExpanded={() => togglePanel('layers')}
        onToggleLayer={onToggleLayer}
      />
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
