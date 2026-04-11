import { useMemo } from 'react';
import { loadMoonDayTexture } from '../rendering/moonSurface';

export function MoonSurfaceMaterial() {
  const moonTexture = useMemo(() => loadMoonDayTexture(), []);

  return (
    <meshStandardMaterial
      color="#f2f4f7"
      map={moonTexture}
      metalness={0.01}
      roughness={0.96}
    />
  );
}
