import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LAYER_CONFIGS, useLayerVisibility } from './useLayerVisibility';

describe('useLayerVisibility', () => {
  it('initializes with default visibility (all layers visible)', () => {
    const { result } = renderHook(() => useLayerVisibility());

    expect(result.current.visibility.trails).toBe(true);
    expect(result.current.visibility.bodyIndicators).toBe(true);
    expect(result.current.visibility.labels).toBe(true);
    expect(result.current.visibility.satellites).toBe(true);
    expect(result.current.visibility.milkyWay).toBe(true);
    expect(result.current.visibility.stars).toBe(true);
    expect(result.current.visibility.constellations).toBe(true);
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
    expect(result.current.visibility.satellites).toBe(true);
    expect(result.current.visibility.milkyWay).toBe(true);
    expect(result.current.visibility.stars).toBe(true);
    expect(result.current.visibility.constellations).toBe(true);
  });

  it('provides layer configs', () => {
    const { result } = renderHook(() => useLayerVisibility());

    expect(result.current.layerConfigs).toBe(LAYER_CONFIGS);
    expect(result.current.layerConfigs).toHaveLength(7);

    const [trails, bodyIndicators, labels, satellites, milkyWay, stars, constellations] =
      result.current.layerConfigs;
    expect(trails?.id).toBe('trails');
    expect(bodyIndicators?.id).toBe('bodyIndicators');
    expect(labels?.id).toBe('labels');
    expect(satellites?.id).toBe('satellites');
    expect(milkyWay?.id).toBe('milkyWay');
    expect(stars?.id).toBe('stars');
    expect(constellations?.id).toBe('constellations');
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
