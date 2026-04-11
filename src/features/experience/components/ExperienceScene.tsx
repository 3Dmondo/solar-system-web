import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { OrbitControls } from '@react-three/drei';
import { PlanetBody } from '../../solar-system/components/PlanetBody';
import { getControlProfile } from '../domain/controlProfile';
import { cinematicBodyStates } from '../../solar-system/data/mockBodyCatalog';
import { type BodyId } from '../../solar-system/domain/body';
import { getFocusCameraPosition, getFocusTarget } from '../../solar-system/domain/focus';

type ExperienceSceneProps = {
  focusedBodyId: BodyId;
  isCoarsePointer: boolean;
  onFocusBody: (bodyId: BodyId) => void;
};

type ControlsHandle = {
  target: Vector3;
  update: () => void;
  addEventListener: (type: 'start', listener: () => void) => void;
  removeEventListener: (type: 'start', listener: () => void) => void;
};

export function ExperienceScene({
  focusedBodyId,
  isCoarsePointer,
  onFocusBody
}: ExperienceSceneProps) {
  const controlProfile = getControlProfile(isCoarsePointer);

  return (
    <Canvas camera={{ position: getFocusCameraPosition('saturn'), fov: 40 }} shadows>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.14} />
      <directionalLight
        castShadow
        intensity={2.7}
        position={[10, 6, 8]}
        shadow-bias={-0.00015}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
        shadow-camera-bottom={-8}
        shadow-camera-far={28}
        shadow-camera-left={-8}
        shadow-camera-near={1}
        shadow-camera-right={8}
        shadow-camera-top={8}
      />
      <FocusCameraRig controlProfile={controlProfile} focusedBodyId={focusedBodyId} />

      {cinematicBodyStates.map((body) => (
        <PlanetBody
          key={body.id}
          body={body}
          focused={body.id === focusedBodyId}
          onSelect={onFocusBody}
        />
      ))}
    </Canvas>
  );
}

function FocusCameraRig({
  controlProfile,
  focusedBodyId
}: {
  controlProfile: ReturnType<typeof getControlProfile>;
  focusedBodyId: BodyId;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<ControlsHandle | null>(null);
  const desiredTarget = useRef(new Vector3(...getFocusTarget(focusedBodyId)));
  const desiredCameraPosition = useRef(new Vector3(...getFocusCameraPosition(focusedBodyId)));
  const isTransitioning = useRef(false);

  useEffect(() => {
    desiredTarget.current.set(...getFocusTarget(focusedBodyId));
    desiredCameraPosition.current.set(...getFocusCameraPosition(focusedBodyId));
    isTransitioning.current = true;
  }, [focusedBodyId]);

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    const handleStart = () => {
      isTransitioning.current = false;
    };

    controls.addEventListener('start', handleStart);

    return () => {
      controls.removeEventListener('start', handleStart);
    };
  }, []);

  useFrame((_, delta) => {
    if (!isTransitioning.current) {
      return;
    }

    const easing = 1 - Math.exp(-delta * 4.5);

    camera.position.lerp(desiredCameraPosition.current, easing);
    controlsRef.current?.target.lerp(desiredTarget.current, easing);
    controlsRef.current?.update();

    const cameraSettled =
      camera.position.distanceToSquared(desiredCameraPosition.current) < 0.0001;
    const targetSettled =
      controlsRef.current?.target.distanceToSquared(desiredTarget.current) ?? 0;

    if (cameraSettled && targetSettled < 0.0001) {
      camera.position.copy(desiredCameraPosition.current);
      controlsRef.current?.target.copy(desiredTarget.current);
      controlsRef.current?.update();
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={(value) => {
        controlsRef.current = value as ControlsHandle | null;
      }}
      dampingFactor={controlProfile.dampingFactor}
      enablePan={false}
      enableDamping
      maxDistance={controlProfile.maxDistance}
      maxPolarAngle={controlProfile.maxPolarAngle}
      minDistance={controlProfile.minDistance}
      minPolarAngle={controlProfile.minPolarAngle}
      rotateSpeed={controlProfile.rotateSpeed}
      zoomSpeed={controlProfile.zoomSpeed}
    />
  );
}
