import { type BodyId, type BodyMetadata } from '../domain/body'
import { EARTH_SURFACE_ROTATION_SPEED } from '../rendering/earthMotion'
import { SATURN_SPHERE_TILT } from '../rendering/saturnRings'

export const presentationBodyMetadata: BodyMetadata[] = [
  {
    id: 'sun',
    displayName: 'Sun',
    color: '#ffd27a',
    material: 'sun',
    radius: 2.6,
    focusOffset: [0, 0.7, 8.8],
    surfaceRotationSpeed: 0.01
  },
  {
    id: 'mercury',
    displayName: 'Mercury',
    color: '#9f9183',
    radius: 0.25,
    focusOffset: [0, 0.12, 1.8],
    surfaceRotationSpeed: 0.014
  },
  {
    id: 'venus',
    displayName: 'Venus',
    color: '#d2a777',
    material: 'venus',
    radius: 0.52,
    focusOffset: [0, 0.18, 2.6],
    surfaceRotationSpeed: 0.011
  },
  {
    id: 'earth',
    displayName: 'Earth',
    color: '#3a7bd5',
    material: 'earth',
    radius: 0.72,
    focusOffset: [0, 0.25, 3.2],
    surfaceRotationSpeed: EARTH_SURFACE_ROTATION_SPEED
  },
  {
    id: 'moon',
    displayName: 'Moon',
    color: '#b0b4be',
    material: 'moon',
    radius: 0.22,
    focusOffset: [0, 0.12, 1.7],
    surfaceRotationSpeed: 0.018
  },
  {
    id: 'mars',
    displayName: 'Mars',
    color: '#bf6c4e',
    radius: 0.38,
    focusOffset: [0, 0.14, 2.2],
    surfaceRotationSpeed: 0.07
  },
  {
    id: 'jupiter',
    displayName: 'Jupiter',
    color: '#c9a678',
    radius: 1.55,
    focusOffset: [0, 0.52, 6.4],
    surfaceRotationSpeed: 0.045
  },
  {
    id: 'saturn',
    displayName: 'Saturn',
    color: '#cdb075',
    material: 'saturn',
    radius: 1.35,
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
    focusOffset: [0, 0.3, 4],
    surfaceRotationSpeed: 0.026
  },
  {
    id: 'neptune',
    displayName: 'Neptune',
    color: '#557fda',
    radius: 0.88,
    focusOffset: [0, 0.28, 3.8],
    surfaceRotationSpeed: 0.024
  }
]

export function getPresentationBodyMetadataById(bodyId: BodyId) {
  return presentationBodyMetadata.find((body) => body.id === bodyId)
}
