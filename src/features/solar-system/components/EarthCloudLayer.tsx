import { useMemo } from 'react';
import { EARTH_CLOUD_WORLD_ROTATION_SPEED } from '../rendering/earthMotion';
import { loadEarthCloudTexture } from '../rendering/earthSurface';
import { PlanetCloudLayer } from './PlanetCloudLayer';

type EarthCloudLayerProps = {
  bodyPosition: [number, number, number];
  focused: boolean;
  radius: number;
  sunPosition: [number, number, number];
};

export function EarthCloudLayer({
  bodyPosition,
  focused,
  radius,
  sunPosition
}: EarthCloudLayerProps) {
  const cloudTexture = useMemo(() => loadEarthCloudTexture(), []);

  return (
    <PlanetCloudLayer
      alphaTexture={cloudTexture}
      bodyPosition={bodyPosition}
      focused={focused}
      opacity={0.58}
      radius={radius}
      rotationSpeed={EARTH_CLOUD_WORLD_ROTATION_SPEED}
      shellScaleDefault={1.01}
      shellScaleFocused={1.05}
      sunPosition={sunPosition}
    />
  );
}
