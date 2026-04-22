import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { OrbitControls } from '@react-three/drei';
import { PlanetBody } from '../../solar-system/components/PlanetBody';
import { getControlDistanceRange, getControlProfile } from '../domain/controlProfile';
import { translateFocusView } from '../domain/focusTracking';
import { type ResolvedBodyCatalog } from '../../solar-system/data/bodyStateStore';
import { type BodyId, type ViewTargetId } from '../../solar-system/domain/body';
import {
  DEFAULT_CAMERA_FOV_DEGREES,
  getCameraClipPlanes,
  getFocusCameraPosition,
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
  const controlDistanceRange = getControlDistanceRange(
    focusedBodyId,
    catalog,
    isCoarsePointer
  );
  const bodies = catalog.bodies;
  const sunPosition = bodies.find((body) => body.id === 'sun')?.position ?? [0, 0, 0];
  const initialAspect = getInitialCameraAspect();

  return (
    <Canvas
      camera={{
        position: getFocusCameraPosition('overview', catalog, initialAspect),
        fov: DEFAULT_CAMERA_FOV_DEGREES,
        near: 0.01,
        far: 25_000_000
      }}
      shadows
    >
      <color attach="background" args={['#000000']} />
      <StarBackground />
      <ambientLight intensity={0.1} />
      <pointLight decay={0} distance={0} intensity={4.8} position={sunPosition} />
      <FocusCameraRig
        catalog={catalog}
        controlDistanceRange={controlDistanceRange}
        controlProfile={controlProfile}
        focusedBodyId={focusedBodyId}
      />

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
  controlDistanceRange,
  controlProfile,
  focusedBodyId
}: {
  catalog: ResolvedBodyCatalog;
  controlDistanceRange: ReturnType<typeof getControlDistanceRange>;
  controlProfile: ReturnType<typeof getControlProfile>;
  focusedBodyId: ViewTargetId;
}) {
  const { camera, size } = useThree();
  const cameraAspect = size.width / Math.max(size.height, 1);
  const controlsRef = useRef<ControlsHandle | null>(null);
  const desiredTarget = useRef(new Vector3(...getFocusTarget(focusedBodyId, catalog)));
  const desiredCameraPosition = useRef(
    new Vector3(...getFocusCameraPosition(focusedBodyId, catalog, cameraAspect))
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

    transitionProfileRef.current = getFocusTransitionProfile(
      previousFocusedBodyId.current,
      focusedBodyId
    );
    desiredTarget.current.copy(nextFocusTarget);
    desiredCameraPosition.current.set(
      ...(focusedBodyId === 'overview'
        ? getFocusCameraPosition(focusedBodyId, catalog, cameraAspect)
        : getFocusCameraPosition(focusedBodyId, catalog, cameraAspect))
    );

    if (focusedBodyId !== 'overview') {
      controlsRef.current?.target.copy(nextFocusTarget);
      controlsRef.current?.update();
    }

    trackedFocusTarget.current.copy(nextFocusTarget);
    previousFocusedBodyId.current = focusedBodyId;
    isTransitioning.current = true;
  }, [camera, cameraAspect, catalog, focusedBodyId]);

  useEffect(() => {
    const nextFocusTarget = new Vector3(...getFocusTarget(focusedBodyId, catalog));

    if (focusedBodyId === 'overview') {
      trackedFocusTarget.current.copy(nextFocusTarget);
      return;
    }

    const focusDelta = nextFocusTarget.clone().sub(trackedFocusTarget.current);

    if (focusDelta.lengthSq() === 0) {
      trackedFocusTarget.current.copy(nextFocusTarget);
      return;
    }

    const nextFocusCameraPosition = new Vector3(
      ...getFocusCameraPosition(focusedBodyId, catalog, cameraAspect)
    );

    if (isTransitioning.current) {
      desiredTarget.current.copy(nextFocusTarget);
      desiredCameraPosition.current.copy(nextFocusCameraPosition);
    } else {
      const currentTarget = controlsRef.current?.target ?? trackedFocusTarget.current;
      const translatedFocusView = translateFocusView(
        {
          cameraPosition: [camera.position.x, camera.position.y, camera.position.z],
          target: [currentTarget.x, currentTarget.y, currentTarget.z]
        },
        [focusDelta.x, focusDelta.y, focusDelta.z]
      );

      camera.position.set(...translatedFocusView.cameraPosition);
      controlsRef.current?.target.set(...translatedFocusView.target);
      desiredTarget.current.set(...translatedFocusView.target);
      desiredCameraPosition.current.set(...translatedFocusView.cameraPosition);
      controlsRef.current?.update();
    }

    trackedFocusTarget.current.copy(nextFocusTarget);
  }, [camera, cameraAspect, catalog, focusedBodyId]);

  useEffect(() => {
    if (focusedBodyId !== 'overview') {
      return;
    }

    const nextFocusTarget = new Vector3(...getFocusTarget('overview', catalog));
    const nextCameraPosition = new Vector3(
      ...getFocusCameraPosition('overview', catalog, cameraAspect)
    );
    const currentTarget = controlsRef.current?.target ?? trackedFocusTarget.current;
    const shouldRetargetOverview =
      currentTarget.distanceToSquared(desiredTarget.current) < 0.25 &&
      camera.position.distanceToSquared(desiredCameraPosition.current) < 0.25;

    desiredTarget.current.copy(nextFocusTarget);
    desiredCameraPosition.current.copy(nextCameraPosition);
    trackedFocusTarget.current.copy(nextFocusTarget);

    if (isTransitioning.current || !shouldRetargetOverview) {
      return;
    }

    camera.position.copy(nextCameraPosition);
    controlsRef.current?.target.copy(nextFocusTarget);
    controlsRef.current?.update();
  }, [camera, cameraAspect, catalog, focusedBodyId]);

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
    const currentTarget = controlsRef.current?.target ?? desiredTarget.current;
    const clipPlanes = getCameraClipPlanes(
      focusedBodyId,
      [camera.position.x, camera.position.y, camera.position.z],
      [currentTarget.x, currentTarget.y, currentTarget.z],
      catalog
    );

    if (
      Math.abs(camera.near - clipPlanes.near) > Math.max(0.01, camera.near * 0.05) ||
      Math.abs(camera.far - clipPlanes.far) > Math.max(1, camera.far * 0.05)
    ) {
      camera.near = clipPlanes.near;
      camera.far = clipPlanes.far;
      camera.updateProjectionMatrix();
    }

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
      maxDistance={controlDistanceRange.maxDistance}
      maxPolarAngle={controlProfile.maxPolarAngle}
      minDistance={controlDistanceRange.minDistance}
      minPolarAngle={controlProfile.minPolarAngle}
      rotateSpeed={controlProfile.rotateSpeed}
      zoomSpeed={controlProfile.zoomSpeed}
    />
  );
}

function getInitialCameraAspect() {
  if (typeof window === 'undefined') {
    return 1;
  }

  return window.innerWidth / Math.max(window.innerHeight, 1);
}
