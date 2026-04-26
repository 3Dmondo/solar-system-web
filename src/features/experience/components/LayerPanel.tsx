import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type LayerId,
  type LayerVisibility,
  type LayerConfig
} from '../state/useLayerVisibility';
import './layer-panel.css';

type LayerPanelProps = {
  visibility: LayerVisibility;
  layerConfigs: LayerConfig[];
  onToggleLayer: (layerId: LayerId) => void;
};

/**
 * Collapsible floating panel for toggling layer visibility.
 * Positioned on the right side, collapsed by default.
 * Mobile-friendly with touch-accessible toggle switches.
 */
export function LayerPanel({
  visibility,
  layerConfigs,
  onToggleLayer
}: LayerPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isExpanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setIsExpanded(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  return (
    <div className="layer-panel-container">
      <button
        ref={buttonRef}
        className="layer-panel__toggle"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Close layer panel' : 'Open layer panel'}
        title="Toggle layers"
      >
        <LayersIcon />
      </button>

      {isExpanded ? (
        <div ref={panelRef} className="layer-panel" role="dialog" aria-label="Layer visibility">
          <div className="layer-panel__header">
            <span className="layer-panel__title">Layers</span>
            <button
              className="layer-panel__close"
              onClick={() => setIsExpanded(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="layer-panel__list">
            {layerConfigs.map((config) => (
              <label key={config.id} className="layer-panel__item">
                <span className="layer-panel__label">{config.label}</span>
                <button
                  className={`layer-panel__switch ${visibility[config.id] ? 'layer-panel__switch--on' : ''}`}
                  role="switch"
                  aria-checked={visibility[config.id]}
                  onClick={() => onToggleLayer(config.id)}
                >
                  <span className="layer-panel__switch-thumb" />
                </button>
              </label>
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
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
