import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PlanetBody } from '../../solar-system/components/PlanetBody';
import { cinematicBodyStates } from '../../solar-system/data/mockBodyCatalog';
import { type BodyId } from '../../solar-system/domain/body';

type ExperienceSceneProps = {
  focusedBodyId: BodyId;
  onFocusBody: (bodyId: BodyId) => void;
};

export function ExperienceScene({ focusedBodyId, onFocusBody }: ExperienceSceneProps) {
  return (
    <Canvas camera={{ position: [0, 2.2, 7.5], fov: 40 }}>
      <color attach="background" args={['#040712']} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[10, 6, 8]} intensity={2.4} castShadow />

      {cinematicBodyStates.map((body) => (
        <PlanetBody
          key={body.id}
          body={body}
          focused={body.id === focusedBodyId}
          onSelect={onFocusBody}
        />
      ))}

      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
