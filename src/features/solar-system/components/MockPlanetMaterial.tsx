import { useMemo } from 'react';
import { type BodyId } from '../domain/body';
import { loadMockBodyTexture } from '../rendering/mockBodyTextures';

type MockPlanetMaterialProps = {
  bodyId: BodyId;
  color: string;
};

export function MockPlanetMaterial({ bodyId, color }: MockPlanetMaterialProps) {
  const texture = useMemo(() => loadMockBodyTexture(bodyId), [bodyId]);

  return (
    <meshStandardMaterial
      color={color}
      map={texture}
      metalness={0.01}
      roughness={bodyId === 'sun' ? 0.72 : 0.93}
      emissive={bodyId === 'sun' ? color : '#000000'}
      emissiveMap={bodyId === 'sun' ? texture : null}
      emissiveIntensity={bodyId === 'sun' ? 1.15 : 0}
    />
  );
}
