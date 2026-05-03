import { Suspense, useMemo, useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { type ThreeEvent } from '@react-three/fiber';
import { Group, Quaternion, Vector3 } from 'three';
import { type BodyDefinition, type BodyId } from '../domain/body';
import { useSimulationClockContext } from '../../experience/state/SimulationClockContext';
import { BodySurfaceMaterial } from './BodySurfaceMaterial';
import { EarthCloudLayer } from './EarthCloudLayer';
import { IrregularBodyMesh } from './IrregularBodyMesh';
import { SaturnRings } from './SaturnRings';
import { VenusCloudLayer } from './VenusCloudLayer';
import { getRenderableBodyShapeAsset } from '../rendering/bodyShapeAssets'

// Module-level reusable objects to avoid allocating per frame.
const Y_UP = new Vector3(0, 1, 0)

type PlanetBodyProps = ThreeElements['mesh'] & {
  body: BodyDefinition;
  focused: boolean;
  onSelect: (bodyId: BodyId) => void;
  sunPosition: [number, number, number];
  /** Current scene position for a satellite's parent, used for tidal locking. */
  tidalLockTargetPosition?: [number, number, number] | null;
};

export function PlanetBody({
  body,
  focused,
  onSelect,
  sunPosition,
  tidalLockTargetPosition,
  ...meshProps
}: PlanetBodyProps) {
  const lastTouchTapRef = useRef(0);
  const bodyRotationRef = useRef<Group>(null);
  const sphereSegments = body.material === 'sun' ? 96 : body.material === 'moon' ? 128 : 64;
  const { playbackRateMultiplier, isPaused, simulationInitialUtcMs } = useSimulationClockContext();
  const bodyShapeAsset = getRenderableBodyShapeAsset(body.id)

  // Quaternion aligning the body Y axis to its physical north pole direction.
  const poleAlignQuat = useMemo(() => {
    if (!body.poleDirectionRender) {
      return new Quaternion()
    }
    const poleVec = new Vector3(...body.poleDirectionRender).normalize()
    return new Quaternion().setFromUnitVectors(Y_UP, poleVec)
  }, [body.poleDirectionRender])

  // Reused per-frame objects: one quaternion for the spin component plus a
  // helper vector for the satellite tidal-lock computation.
  const spinQuat = useMemo(() => new Quaternion(), [])
  const scratchVec = useMemo(() => new Vector3(), [])
  const spinAngleRef = useRef(0)
  const isSpinInitializedRef = useRef(false)

  useFrame((_, delta) => {
    if (!bodyRotationRef.current || !body.poleDirectionRender || body.angularVelocityRadPerSec == null) {
      return;
    }

    if (
      !isSpinInitializedRef.current &&
      body.spinInitialPhaseStrategy === 'prime-meridian-solar-noon'
    ) {
      isSpinInitializedRef.current = true
      spinAngleRef.current = computePrimeMeridianSolarNoonSpinAngle(
        body.position, sunPosition, poleAlignQuat, simulationInitialUtcMs
      )
    } else if (!isSpinInitializedRef.current) {
      isSpinInitializedRef.current = true
    }

    const simDelta = isPaused ? 0 : delta * playbackRateMultiplier

    if (tidalLockTargetPosition) {
      // --- Tidal lock: satellite always faces its parent ---
      // Compute the direction from satellite to parent projected onto the satellite's equatorial plane.
      const poleVec = scratchVec.set(...body.poleDirectionRender).normalize()
      const moonToEarth = new Vector3(
        tidalLockTargetPosition[0] - body.position[0],
        tidalLockTargetPosition[1] - body.position[1],
        tidalLockTargetPosition[2] - body.position[2]
      ).normalize()
      const poleComponent = moonToEarth.dot(poleVec)
      const equatorialDir = moonToEarth.clone()
        .sub(poleVec.clone().multiplyScalar(poleComponent))
      if (equatorialDir.lengthSq() < 1e-8) {
        return
      }
      equatorialDir.normalize()
      // Transform equatorial direction into the pre-pole-aligned frame.
      const localFaceDir = equatorialDir.clone()
        .applyQuaternion(poleAlignQuat.clone().invert())
      const angle = Math.atan2(localFaceDir.x, localFaceDir.z)
      spinQuat.setFromAxisAngle(Y_UP, angle)
    } else {
      // --- Standard prograde/retrograde spin ---
      spinAngleRef.current += body.angularVelocityRadPerSec * simDelta
      spinQuat.setFromAxisAngle(Y_UP, spinAngleRef.current)
    }

    bodyRotationRef.current.quaternion.copy(poleAlignQuat).multiply(spinQuat)
  });

  const handleDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(body.id);
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    if (event.pointerType !== 'touch') {
      return;
    }

    const now = performance.now();

    if (now - lastTouchTapRef.current < 320) {
      onSelect(body.id);
      lastTouchTapRef.current = 0;
      return;
    }

    lastTouchTapRef.current = now;
  };

  return (
    <group position={body.position}>
      <group
        ref={bodyRotationRef}
        scale={focused ? 1.04 : 1}
      >
        {bodyShapeAsset ? (
          <Suspense
            fallback={(
              <mesh
                castShadow
                {...meshProps}
                onDoubleClick={handleDoubleClick}
                onPointerDown={handlePointerDown}
                receiveShadow
              >
                <sphereGeometry args={[body.radius, sphereSegments, sphereSegments]} />
                <BodySurfaceMaterial body={body} sunPosition={sunPosition} />
              </mesh>
            )}
          >
            <IrregularBodyMesh
              asset={bodyShapeAsset}
              body={body}
              meshProps={meshProps}
              onDoubleClick={handleDoubleClick}
              onPointerDown={handlePointerDown}
              sunPosition={sunPosition}
            />
          </Suspense>
        ) : (
          <mesh
            castShadow
            {...meshProps}
            onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDown}
            receiveShadow
          >
            <sphereGeometry args={[body.radius, sphereSegments, sphereSegments]} />
            <BodySurfaceMaterial body={body} sunPosition={sunPosition} />
          </mesh>
        )}
      </group>

      {body.hasRings ? (
        <SaturnRings
          bodyId={body.id}
          bodyPosition={body.position}
          onSelect={onSelect}
          poleDirectionRender={body.poleDirectionRender}
          radius={body.radius}
          sunPosition={sunPosition}
        />
      ) : body.material === 'earth' ? (
        <EarthCloudLayer
          bodyPosition={body.position}
          focused={focused}
          poleDirectionRender={body.poleDirectionRender}
          radius={body.radius}
          sunPosition={sunPosition}
        />
      ) : body.material === 'venus' ? (
        <VenusCloudLayer
          angularVelocityRadPerSec={body.angularVelocityRadPerSec ?? 0}
          bodyPosition={body.position}
          focused={focused}
          poleDirectionRender={body.poleDirectionRender}
          radius={body.radius}
          sunPosition={sunPosition}
        />
      ) : null}
    </group>
  );
}

/**
 * Computes an initial spin angle so the prime meridian faces the Sun at solar
 * noon (12:00 UTC) and is correctly offset at any other UTC start time.
 *
 * Three.js SphereGeometry maps texture u=0.5 (prime meridian for standard Earth
 * textures) to local +X.  After poleAlignQuat, local +X stays at world +X.
 * Ry(θ) * [1,0,0] = [cos(θ), 0, −sin(θ)], so the angle that aims +X at the
 * Sun's equatorial direction is  atan2(−localSun.z, localSun.x).
 *
 * The UTC correction adds (secondsFromNoon × 2π/86400) so the prime meridian
 * has already rotated the right amount past solar noon at the start time.
 */
function computePrimeMeridianSolarNoonSpinAngle(
  earthPos: [number, number, number],
  sunPos: [number, number, number],
  poleAlignQuat: Quaternion,
  utcMs: number
): number {
  const toSun = new Vector3(
    sunPos[0] - earthPos[0],
    sunPos[1] - earthPos[1],
    sunPos[2] - earthPos[2]
  ).normalize()

  // Bring the Sun direction into the mesh's pre-spin local frame.
  const invPoleAlign = poleAlignQuat.clone().invert()
  const localSun = toSun.applyQuaternion(invPoleAlign)

  // Equatorial magnitude (guard against degenerate case).
  const equatLen = Math.sqrt(localSun.x * localSun.x + localSun.z * localSun.z)
  if (equatLen < 1e-6) return 0

  // Angle to face the prime meridian (+X after Ry) toward the Sun in the equatorial plane.
  const sunAngle = Math.atan2(-localSun.z / equatLen, localSun.x / equatLen)

  // UTC correction: prime meridian faces the Sun at 12:00 UTC (solar noon at Greenwich).
  const utcSecondsOfDay = (utcMs / 1000) % 86400
  const secondsFromNoon = utcSecondsOfDay - 43200
  const utcCorrection = secondsFromNoon * ((2 * Math.PI) / 86400)

  return sunAngle + utcCorrection
}
