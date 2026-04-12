import { type BodyDefinition, type BodyId } from '../domain/body';
import { EARTH_SURFACE_ROTATION_SPEED } from '../rendering/earthMotion';
import { SATURN_SPHERE_TILT } from '../rendering/saturnRings';

function orbitalPosition(radius: number, degrees: number): [number, number, number] {
  const radians = (degrees * Math.PI) / 180;

  return [Math.cos(radians) * radius, 0, Math.sin(radians) * radius];
}

export const MOCK_SUN_POSITION: [number, number, number] = [0, 0, 0];

export const mockedSolarSystemBodies: BodyDefinition[] = [
  {
    id: 'sun',
    displayName: 'Sun',
    color: '#ffd27a',
    material: 'sun',
    radius: 2.6,
    position: MOCK_SUN_POSITION,
    focusOffset: [0, 0.7, 8.8],
    surfaceRotationSpeed: 0.01
  },
  {
    id: 'mercury',
    displayName: 'Mercury',
    color: '#9f9183',
    radius: 0.25,
    position: orbitalPosition(4.5, 18),
    focusOffset: [0, 0.12, 1.8],
    surfaceRotationSpeed: 0.014
  },
  {
    id: 'venus',
    displayName: 'Venus',
    color: '#d2a777',
    radius: 0.52,
    position: orbitalPosition(6.5, 84),
    focusOffset: [0, 0.18, 2.6],
    surfaceRotationSpeed: 0.011
  },
  {
    id: 'earth',
    displayName: 'Earth',
    color: '#3a7bd5',
    material: 'earth',
    radius: 0.72,
    position: orbitalPosition(9.0, 145),
    focusOffset: [0, 0.25, 3.2],
    surfaceRotationSpeed: EARTH_SURFACE_ROTATION_SPEED
  },
  {
    id: 'moon',
    displayName: 'Moon',
    color: '#b0b4be',
    material: 'moon',
    radius: 0.22,
    position: [-6.3, -0.18, 5.65],
    focusOffset: [0, 0.12, 1.7],
    surfaceRotationSpeed: 0.018
  },
  {
    id: 'mars',
    displayName: 'Mars',
    color: '#bf6c4e',
    radius: 0.38,
    position: orbitalPosition(12.0, 215),
    focusOffset: [0, 0.14, 2.2],
    surfaceRotationSpeed: 0.07
  },
  {
    id: 'jupiter',
    displayName: 'Jupiter',
    color: '#c9a678',
    radius: 1.55,
    position: orbitalPosition(17.0, 280),
    focusOffset: [0, 0.52, 6.4],
    surfaceRotationSpeed: 0.045
  },
  {
    id: 'saturn',
    displayName: 'Saturn',
    color: '#cdb075',
    material: 'saturn',
    radius: 1.35,
    position: orbitalPosition(22.0, 332),
    focusOffset: [0, 0.45, 5.8],
    surfaceRotation: [SATURN_SPHERE_TILT, 0, 0],
    surfaceRotationSpeed: 0.02,
    hasRings: true
  },
  {
    id: 'uranus',
    displayName: 'Uranus',
    color: '#92c9d6',
    radius: 0.92,
    position: orbitalPosition(28.0, 28),
    focusOffset: [0, 0.3, 4],
    surfaceRotationSpeed: 0.026
  },
  {
    id: 'neptune',
    displayName: 'Neptune',
    color: '#557fda',
    radius: 0.88,
    position: orbitalPosition(34.0, 176),
    focusOffset: [0, 0.28, 3.8],
    surfaceRotationSpeed: 0.024
  }
];

export function getBodyById(bodyId: BodyId) {
  return mockedSolarSystemBodies.find((body) => body.id === bodyId);
}
