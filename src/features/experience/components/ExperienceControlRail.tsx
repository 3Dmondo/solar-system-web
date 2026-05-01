import { useEffect, useRef, useState } from 'react';
import { type BodyId, type ViewTargetId } from '../../solar-system/domain/body';
import { type ResolvedBodyCatalog } from '../../solar-system/data/bodyStateStore';
import { type ReferenceFrame, type ReferenceFrameId } from '../../solar-system/domain/referenceFrame';
import { type LayerConfig, type LayerId, type LayerVisibility } from '../state/useLayerVisibility';
import { FullscreenButton } from './FullscreenButton';
import { JumpToSelector } from './JumpToSelector';
import { LayerPanel } from './LayerPanel';
import { ReferenceFrameSelector } from './ReferenceFrameSelector';
import './experience-control-rail.css';

type ActivePanel = 'help' | 'jump' | 'frame' | 'layers';

type ExperienceControlRailProps = {
  availableFrames: ReferenceFrame[];
  catalog: ResolvedBodyCatalog;
  focusedBodyId: ViewTargetId;
  layerConfigs: LayerConfig[];
  selectedFrameId: ReferenceFrameId;
  visibility: LayerVisibility;
  onFocusBody: (bodyId: BodyId) => void;
  onReturnToOverview: () => void;
  onSelectFrame: (frameId: ReferenceFrameId) => void;
  onToggleLayer: (layerId: LayerId) => void;
};

export function ExperienceControlRail({
  availableFrames,
  catalog,
  focusedBodyId,
  layerConfigs,
  selectedFrameId,
  visibility,
  onFocusBody,
  onReturnToOverview,
  onSelectFrame,
  onToggleLayer
}: ExperienceControlRailProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activePanel) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (railRef.current?.contains(target)) {
        return;
      }

      setActivePanel(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePanel(null);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePanel]);

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel));
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  return (
    <div ref={railRef} className="experience-control-rail" aria-label="Experience controls">
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
        onFocusBody={onFocusBody}
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
