import { useMemo } from 'react';
import { EARTH_CLOUD_ANGULAR_VELOCITY_RAD_PER_SEC } from '../rendering/earthMotion';
import { loadEarthCloudTexture } from '../rendering/earthSurface';
import { PlanetCloudLayer } from './PlanetCloudLayer';

type EarthCloudLayerProps = {
  bodyPosition: [number, number, number];
  focused: boolean;
  poleDirectionRender?: [number, number, number];
  radius: number;
  sunPosition: [number, number, number];
};

export function EarthCloudLayer({
  bodyPosition,
  focused,
  poleDirectionRender,
  radius,
  sunPosition
}: EarthCloudLayerProps) {
  const cloudTexture = useMemo(() => loadEarthCloudTexture(), []);

  return (
    <PlanetCloudLayer
      alphaTexture={cloudTexture}
      angularVelocityRadPerSec={EARTH_CLOUD_ANGULAR_VELOCITY_RAD_PER_SEC}
      bodyPosition={bodyPosition}
      focused={focused}
      opacity={0.58}
      poleDirectionRender={poleDirectionRender}
      radius={radius}
      shellScaleDefault={1.01}
      shellScaleFocused={1.05}
      sunPosition={sunPosition}
    />
  );
}
