import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LAYER_CONFIGS, useLayerVisibility } from './useLayerVisibility';

describe('useLayerVisibility', () => {
  it('initializes with default visibility (all layers visible)', () => {
    const { result } = renderHook(() => useLayerVisibility());

    expect(result.current.visibility.trails).toBe(true);
    expect(result.current.visibility.bodyIndicators).toBe(true);
    expect(result.current.visibility.labels).toBe(true);
  });

  it('accepts initial visibility overrides', () => {
    const { result } = renderHook(() =>
      useLayerVisibility({ trails: false })
    );

    expect(result.current.visibility.trails).toBe(false);
    expect(result.current.visibility.bodyIndicators).toBe(true);
  });

  it('toggles layer visibility', () => {
    const { result } = renderHook(() => useLayerVisibility());

    expect(result.current.visibility.trails).toBe(true);

    act(() => {
      result.current.toggleLayer('trails');
    });

    expect(result.current.visibility.trails).toBe(false);

    act(() => {
      result.current.toggleLayer('trails');
    });

    expect(result.current.visibility.trails).toBe(true);
  });

  it('sets layer visibility explicitly', () => {
    const { result } = renderHook(() => useLayerVisibility());

    act(() => {
      result.current.setLayerVisible('bodyIndicators', false);
    });

    expect(result.current.visibility.bodyIndicators).toBe(false);

    act(() => {
      result.current.setLayerVisible('bodyIndicators', true);
    });

    expect(result.current.visibility.bodyIndicators).toBe(true);
  });

  it('resets to default visibility', () => {
    const { result } = renderHook(() =>
      useLayerVisibility({ trails: false, bodyIndicators: false, labels: false })
    );

    expect(result.current.visibility.trails).toBe(false);
    expect(result.current.visibility.bodyIndicators).toBe(false);
    expect(result.current.visibility.labels).toBe(false);

    act(() => {
      result.current.resetToDefaults();
    });

    expect(result.current.visibility.trails).toBe(true);
    expect(result.current.visibility.bodyIndicators).toBe(true);
    expect(result.current.visibility.labels).toBe(true);
  });

  it('provides layer configs', () => {
    const { result } = renderHook(() => useLayerVisibility());

    expect(result.current.layerConfigs).toBe(LAYER_CONFIGS);
    expect(result.current.layerConfigs).toHaveLength(3);

    const firstConfig = result.current.layerConfigs[0];
    const secondConfig = result.current.layerConfigs[1];
    const thirdConfig = result.current.layerConfigs[2];
    expect(firstConfig).toBeDefined();
    expect(secondConfig).toBeDefined();
    expect(thirdConfig).toBeDefined();
    expect(firstConfig?.id).toBe('trails');
    expect(secondConfig?.id).toBe('bodyIndicators');
    expect(thirdConfig?.id).toBe('labels');
  });

  it('preserves other layer visibility when toggling one', () => {
    const { result } = renderHook(() => useLayerVisibility());

    act(() => {
      result.current.toggleLayer('trails');
    });

    expect(result.current.visibility.trails).toBe(false);
    expect(result.current.visibility.bodyIndicators).toBe(true);

    act(() => {
      result.current.toggleLayer('bodyIndicators');
    });

    expect(result.current.visibility.trails).toBe(false);
    expect(result.current.visibility.bodyIndicators).toBe(false);
  });
});
