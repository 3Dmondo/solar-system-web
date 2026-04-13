import { useMemo } from 'react';
import { PlanetCloudLayer } from './PlanetCloudLayer';
import { loadVenusCloudTexture } from '../rendering/venusSurface';

type VenusCloudLayerProps = {
  bodyPosition: [number, number, number];
  focused: boolean;
  radius: number;
  rotationSpeed: number;
};

export function VenusCloudLayer({
  bodyPosition,
  focused,
  radius,
  rotationSpeed
}: VenusCloudLayerProps) {
  const cloudTexture = useMemo(() => loadVenusCloudTexture(), []);

  return (
    <PlanetCloudLayer
      alphaTexture={cloudTexture}
      bodyPosition={bodyPosition}
      colorTexture={cloudTexture}
      focused={focused}
      maxVisibility={0.96}
      minVisibility={0.28}
      opacity={2.5}
      radius={radius}
      rotationSpeed={rotationSpeed * 0.90}
      shellScaleDefault={1.018}
      shellScaleFocused={1.048}
      transparencyHeuristic={{
        maxAlpha: 0.58,
        minLuminance: 0.18,
        maxLuminance: 0.98,
        power: 1.1
      }}
    />
  );
}
