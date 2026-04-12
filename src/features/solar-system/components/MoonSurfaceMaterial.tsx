import { useMemo } from 'react';
import { loadMoonDayTexture, loadMoonHeightTexture } from '../rendering/moonSurface';

export function MoonSurfaceMaterial() {
  const moonTexture = useMemo(() => loadMoonDayTexture(), []);
  const moonHeightTexture = useMemo(() => loadMoonHeightTexture(), []);

  return (
    <meshStandardMaterial
      color="#f2f4f7"
      bumpMap={moonHeightTexture}
      bumpScale={1.5}
      map={moonTexture}
      metalness={0.01}
      roughness={0.96}
    />
  );
}
