import { type BodyDefinition, type BodyId } from '../domain/body';

export const cinematicBodyStates: BodyDefinition[] = [
  {
    id: 'saturn',
    displayName: 'Saturn',
    color: '#cdb075',
    radius: 1.35,
    position: [-2.8, 0, 0],
    hasRings: true
  },
  {
    id: 'earth',
    displayName: 'Earth',
    color: '#3a7bd5',
    radius: 0.72,
    position: [0.5, 0, 0]
  },
  {
    id: 'moon',
    displayName: 'Moon',
    color: '#b0b4be',
    radius: 0.25,
    position: [1.8, -0.2, 0]
  }
];

export function getBodyById(bodyId: BodyId) {
  return cinematicBodyStates.find((body) => body.id === bodyId);
}
