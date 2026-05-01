import { useRef } from 'react';
import {
  type LayerId,
  type LayerVisibility,
  type LayerConfig
} from '../state/useLayerVisibility';
import './layer-panel.css';

type LayerPanelProps = {
  isExpanded: boolean;
  visibility: LayerVisibility;
  layerConfigs: LayerConfig[];
  onClose: () => void;
  onToggleExpanded: () => void;
  onToggleLayer: (layerId: LayerId) => void;
};

export function LayerPanel({
  isExpanded,
  visibility,
  layerConfigs,
  onClose,
  onToggleExpanded,
  onToggleLayer
}: LayerPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="layer-panel-container">
      <button
        ref={buttonRef}
        className="layer-panel__toggle"
        onClick={onToggleExpanded}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Close layer panel' : 'Open layer panel'}
        title="Toggle layers"
        type="button"
      >
        <LayersIcon />
      </button>

      {isExpanded ? (
        <div ref={panelRef} className="layer-panel" role="dialog" aria-label="Layer visibility">
          <div className="layer-panel__header">
            <span className="layer-panel__title">Layers</span>
            <button
              className="layer-panel__close"
              onClick={onClose}
              aria-label="Close layer panel"
              type="button"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="layer-panel__list">
            {layerConfigs.map((config) => (
              <button
                key={config.id}
                className="layer-panel__item"
                type="button"
                aria-pressed={visibility[config.id]}
                onClick={() => onToggleLayer(config.id)}
              >
                <span className="layer-panel__label">{config.label}</span>
                <span
                  aria-hidden="true"
                  className={`layer-panel__check ${visibility[config.id] ? 'layer-panel__check--on' : ''}`}
                >
                  {visibility[config.id] ? <CheckIcon /> : null}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LayersIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
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

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
