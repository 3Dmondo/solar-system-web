import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { BackSide, Mesh } from 'three';
import { loadStarBackgroundTexture } from '../rendering/starBackground';

const STAR_BACKGROUND_RADIUS = 420;
const ignoreRaycast: Mesh['raycast'] = () => null;

export function StarBackground() {
  const texture = useMemo(() => loadStarBackgroundTexture(), []);
  const backgroundRef = useRef<Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!backgroundRef.current) {
      return;
    }

    backgroundRef.current.position.copy(camera.position);
  });

  return (
    <mesh
      ref={backgroundRef}
      raycast={ignoreRaycast}
      rotation={[0.14, 0.5, 0]}
      renderOrder={-1}
    >
      <sphereGeometry args={[STAR_BACKGROUND_RADIUS, 48, 48]} />
      <meshBasicMaterial
        color="#b8c3f5"
        depthWrite={false}
        map={texture}
        opacity={0.5}
        side={BackSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}
