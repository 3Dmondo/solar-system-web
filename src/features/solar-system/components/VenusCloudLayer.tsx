import { useMemo } from 'react';
import { PlanetCloudLayer } from './PlanetCloudLayer';
import { loadVenusCloudTexture } from '../rendering/venusSurface';

// Venus atmosphere super-rotates faster than the surface. We use a factor of
// 60 relative to the surface to give the cloud layer a visible drift while
// staying physically directionally correct (retrograde = negative velocity).
const VENUS_CLOUD_RELATIVE_SPEED_FACTOR = 60;

type VenusCloudLayerProps = {
  angularVelocityRadPerSec: number;
  bodyPosition: [number, number, number];
  focused: boolean;
  poleDirectionRender?: [number, number, number];
  radius: number;
  sunPosition: [number, number, number];
};

export function VenusCloudLayer({
  angularVelocityRadPerSec,
  bodyPosition,
  focused,
  poleDirectionRender,
  radius,
  sunPosition
}: VenusCloudLayerProps) {
  const cloudTexture = useMemo(() => loadVenusCloudTexture(), []);

  return (
    <PlanetCloudLayer
      alphaTexture={cloudTexture}
      angularVelocityRadPerSec={angularVelocityRadPerSec * VENUS_CLOUD_RELATIVE_SPEED_FACTOR}
      bodyPosition={bodyPosition}
      colorTexture={cloudTexture}
      focused={focused}
      opacity={2.5}
      poleDirectionRender={poleDirectionRender}
      radius={radius}
      shellScaleDefault={1.018}
      shellScaleFocused={1.048}
      sunPosition={sunPosition}
      transparencyHeuristic={{
        maxAlpha: 0.58,
        minLuminance: 0.18,
        maxLuminance: 0.98,
        power: 1.1
      }}
    />
  );
}
