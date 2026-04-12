import { useMemo } from 'react';
import { loadMoonDayTexture, loadMoonHeightTexture } from '../rendering/moonSurface';

export function MoonSurfaceMaterial() {
  const moonTexture = useMemo(() => loadMoonDayTexture(), []);
  const moonHeightTexture = useMemo(() => loadMoonHeightTexture(), []);

  return (
    <meshStandardMaterial
      color="#ffffff"
      bumpMap={moonHeightTexture}
      bumpScale={1.5}
      displacementMap={moonHeightTexture}
      displacementScale={0.010}
      map={moonTexture}
      metalness={0.01}
      roughness={0.96}
    />
  );
}
