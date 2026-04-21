import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { OrbitControls } from '@react-three/drei';
import { PlanetBody } from '../../solar-system/components/PlanetBody';
import { OrbitalTrails } from '../../solar-system/components/OrbitalTrails';
import { getControlProfile } from '../domain/controlProfile';
import { translateFocusView } from '../domain/focusTracking';
import { type ResolvedBodyCatalog } from '../../solar-system/data/bodyStateStore';
import { type BodyId, type ViewTargetId } from '../../solar-system/domain/body';
import {
  getFocusCameraPosition,
  getFocusCameraPositionForViewDirection,
  getFocusTarget,
  getFocusTransitionProfile
} from '../../solar-system/domain/focus';
import { StarBackground } from './StarBackground';

type ExperienceSceneProps = {
  catalog: ResolvedBodyCatalog;
  focusedBodyId: ViewTargetId;
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
  catalog,
  focusedBodyId,
  isCoarsePointer,
  onFocusBody
}: ExperienceSceneProps) {
  const controlProfile = getControlProfile(isCoarsePointer);
  const bodies = catalog.bodies;
  const sunPosition = bodies.find((body) => body.id === 'sun')?.position ?? [0, 0, 0];

  return (
    <Canvas camera={{ position: getFocusCameraPosition('overview', catalog), fov: 40 }} shadows>
      <color attach="background" args={['#000000']} />
      <StarBackground />
      <ambientLight intensity={0.1} />
      <pointLight decay={0} distance={0} intensity={4.8} position={sunPosition} />
      <FocusCameraRig catalog={catalog} controlProfile={controlProfile} focusedBodyId={focusedBodyId} />
      <OrbitalTrails bodies={bodies} />

      {bodies.map((body) => (
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
  catalog,
  controlProfile,
  focusedBodyId
}: {
  catalog: ResolvedBodyCatalog;
  controlProfile: ReturnType<typeof getControlProfile>;
  focusedBodyId: ViewTargetId;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<ControlsHandle | null>(null);
  const desiredTarget = useRef(new Vector3(...getFocusTarget(focusedBodyId, catalog)));
  const desiredCameraPosition = useRef(
    new Vector3(...getFocusCameraPosition(focusedBodyId, catalog))
  );
  const trackedFocusTarget = useRef(new Vector3(...getFocusTarget(focusedBodyId, catalog)));
  const previousFocusedBodyId = useRef<ViewTargetId>(focusedBodyId);
  const transitionProfileRef = useRef(
    getFocusTransitionProfile(focusedBodyId, focusedBodyId)
  );
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (previousFocusedBodyId.current === focusedBodyId) {
      return;
    }

    const nextFocusTarget = new Vector3(...getFocusTarget(focusedBodyId, catalog));
    const currentTarget = controlsRef.current?.target ?? trackedFocusTarget.current;
    const currentViewOffset = camera.position.clone().sub(currentTarget);

    transitionProfileRef.current = getFocusTransitionProfile(
      previousFocusedBodyId.current,
      focusedBodyId
    );
    desiredTarget.current.copy(nextFocusTarget);
    desiredCameraPosition.current.set(
      ...(focusedBodyId === 'overview'
        ? getFocusCameraPosition(focusedBodyId, catalog)
        : getFocusCameraPositionForViewDirection(focusedBodyId, [
            currentViewOffset.x,
            currentViewOffset.y,
            currentViewOffset.z
          ], catalog))
    );
    trackedFocusTarget.current.copy(nextFocusTarget);
    previousFocusedBodyId.current = focusedBodyId;
    isTransitioning.current = true;
  }, [camera, catalog, focusedBodyId]);

  useEffect(() => {
    const nextFocusTarget = new Vector3(...getFocusTarget(focusedBodyId, catalog));
    const focusDelta = nextFocusTarget.clone().sub(trackedFocusTarget.current);

    if (focusedBodyId === 'overview' || focusDelta.lengthSq() === 0) {
      trackedFocusTarget.current.copy(nextFocusTarget);
      return;
    }

    const focusView = translateFocusView(
      {
        cameraPosition: [camera.position.x, camera.position.y, camera.position.z],
        target: [
          controlsRef.current?.target.x ?? trackedFocusTarget.current.x,
          controlsRef.current?.target.y ?? trackedFocusTarget.current.y,
          controlsRef.current?.target.z ?? trackedFocusTarget.current.z
        ]
      },
      [focusDelta.x, focusDelta.y, focusDelta.z]
    );

    if (isTransitioning.current) {
      desiredTarget.current.set(...focusView.target);
      desiredCameraPosition.current.set(...focusView.cameraPosition);
    } else {
      camera.position.set(...focusView.cameraPosition);
      controlsRef.current?.target.set(...focusView.target);
      controlsRef.current?.update();
    }

    trackedFocusTarget.current.copy(nextFocusTarget);
  }, [camera, catalog, focusedBodyId]);

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

    const cameraEasing =
      1 - Math.exp(-delta * transitionProfileRef.current.cameraEasingRate);
    const targetEasing =
      1 - Math.exp(-delta * transitionProfileRef.current.targetEasingRate);

    camera.position.lerp(desiredCameraPosition.current, cameraEasing);
    controlsRef.current?.target.lerp(desiredTarget.current, targetEasing);
    controlsRef.current?.update();

    const cameraSettled =
      camera.position.distanceToSquared(desiredCameraPosition.current) <
      transitionProfileRef.current.settleDistanceSquared;
    const targetSettled =
      controlsRef.current?.target.distanceToSquared(desiredTarget.current) ?? 0;

    if (cameraSettled && targetSettled < transitionProfileRef.current.settleDistanceSquared) {
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
