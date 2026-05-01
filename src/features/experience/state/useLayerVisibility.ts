import { useCallback, useState } from 'react';

/**
 * Layer identifiers for scene visibility control.
 * Designed to accommodate future layers like 'cinematicScale'.
 */
export type LayerId =
  | 'trails'
  | 'bodyIndicators'
  | 'labels'
  | 'satellites'
  | 'milkyWay'
  | 'stars'
  | 'constellations';

/**
 * Future layer identifiers (not yet implemented)
 */
export type FutureLayerId = 'cinematicScale';

export type LayerVisibility = Record<LayerId, boolean>;

export type LayerConfig = {
  id: LayerId;
  label: string;
  description?: string;
  defaultVisible: boolean;
};

/**
 * Configuration for all available layers
 */
export const LAYER_CONFIGS: LayerConfig[] = [
  {
    id: 'trails',
    label: 'Orbital trails',
    description: 'Show orbital path traces for each body',
    defaultVisible: true
  },
  {
    id: 'bodyIndicators',
    label: 'Body indicators',
    description: 'Show indicator circles when bodies are too small to see',
    defaultVisible: true
  },
  {
    id: 'labels',
    label: 'Body labels',
    description: 'Show text labels identifying each body',
    defaultVisible: true
  },
  {
    id: 'satellites',
    label: 'Satellites',
    description: 'Show natural satellites and their related markers',
    defaultVisible: true
  },
  {
    id: 'milkyWay',
    label: 'Milky Way',
    description: 'Show the compressed Milky Way sky texture',
    defaultVisible: true
  },
  {
    id: 'stars',
    label: 'Stars',
    description: 'Show real star catalog background',
    defaultVisible: true
  },
  {
    id: 'constellations',
    label: 'Constellations',
    description: 'Show constellation line patterns',
    defaultVisible: true
  }
];

/**
 * Default visibility state for all layers
 */
const DEFAULT_VISIBILITY: LayerVisibility = {
  trails: true,
  bodyIndicators: true,
  labels: true,
  satellites: true,
  milkyWay: true,
  stars: true,
  constellations: true
};

/**
 * Hook for managing scene layer visibility.
 * Returns the current visibility state and a toggle function.
 */
export function useLayerVisibility(
  initialVisibility: Partial<LayerVisibility> = {}
) {
  const [visibility, setVisibility] = useState<LayerVisibility>({
    ...DEFAULT_VISIBILITY,
    ...initialVisibility
  });

  const toggleLayer = useCallback((layerId: LayerId) => {
    setVisibility((prev) => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  }, []);

  const setLayerVisible = useCallback((layerId: LayerId, visible: boolean) => {
    setVisibility((prev) => ({
      ...prev,
      [layerId]: visible
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setVisibility(DEFAULT_VISIBILITY);
  }, []);

  return {
    visibility,
    toggleLayer,
    setLayerVisible,
    resetToDefaults,
    layerConfigs: LAYER_CONFIGS
  };
}

export type UseLayerVisibilityReturn = ReturnType<typeof useLayerVisibility>;
