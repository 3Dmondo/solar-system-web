import { type BodyDefinition, type BodyId } from '../domain/body';
import { SATURN_SPHERE_TILT } from '../rendering/saturnRings';

export const cinematicBodyStates: BodyDefinition[] = [
  {
    id: 'saturn',
    displayName: 'Saturn',
    color: '#cdb075',
    material: 'saturn',
    radius: 1.35,
    position: [-2.8, 0, 0],
    focusOffset: [0, 0.45, 5.8],
    surfaceRotation: [SATURN_SPHERE_TILT, 0, 0],
    hasRings: true
  },
  {
    id: 'earth',
    displayName: 'Earth',
    color: '#3a7bd5',
    material: 'earth',
    radius: 0.72,
    position: [0.5, 0, 0],
    focusOffset: [0, 0.25, 3.2]
  },
  {
    id: 'moon',
    displayName: 'Moon',
    color: '#b0b4be',
    material: 'moon',
    radius: 0.25,
    position: [1.8, -0.2, 0],
    focusOffset: [0, 0.15, 1.9]
  }
];

export function getBodyById(bodyId: BodyId) {
  return cinematicBodyStates.find((body) => body.id === bodyId);
}
