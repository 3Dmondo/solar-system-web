import { type BodyId, type BodyMetadata } from '../domain/body'

export const presentationBodyMetadata: BodyMetadata[] = [
  {
    id: 'sun',
    displayName: 'Sun',
    color: '#ffd27a',
    material: 'sun',
    radius: 2.6,
    defaultTrailWindowDays: 0,
    focusOffset: [0, 0.7, 8.8]
  },
  {
    id: 'mercury',
    displayName: 'Mercury',
    color: '#9f9183',
    radius: 0.25,
    defaultTrailWindowDays: 120,
    trailSampleRateMultiplier: 2,
    focusOffset: [0, 0.12, 1.8]
  },
  {
    id: 'venus',
    displayName: 'Venus',
    color: '#d2a777',
    material: 'venus',
    radius: 0.52,
    defaultTrailWindowDays: 240,
    trailSampleRateMultiplier: 2,
    focusOffset: [0, 0.18, 2.6]
  },
  {
    id: 'earth',
    displayName: 'Earth',
    color: '#3a7bd5',
    material: 'earth',
    radius: 0.72,
    defaultTrailWindowDays: 365,
    trailSampleRateMultiplier: 2,
    focusOffset: [0, 0.25, 3.2]
  },
  {
    id: 'moon',
    displayName: 'Moon',
    color: '#b0b4be',
    material: 'moon',
    radius: 0.22,
    defaultTrailWindowDays: 27,
    trailSampleRateMultiplier: 5,
    focusOffset: [0, 0.12, 1.7]
  },
  {
    id: 'mars',
    displayName: 'Mars',
    color: '#bf6c4e',
    radius: 0.38,
    defaultTrailWindowDays: 720,
    trailSampleRateMultiplier: 2,
    focusOffset: [0, 0.14, 2.2]
  },
  {
    id: 'jupiter',
    displayName: 'Jupiter',
    color: '#c9a678',
    radius: 1.55,
    defaultTrailWindowDays: 4_332,
    focusOffset: [0, 0.52, 6.4]
  },
  {
    id: 'saturn',
    displayName: 'Saturn',
    color: '#cdb075',
    material: 'saturn',
    radius: 1.35,
    defaultTrailWindowDays: 8_000,
    focusOffset: [0, 0.45, 5.8],
    hasRings: true
  },
  {
    id: 'uranus',
    displayName: 'Uranus',
    color: '#92c9d6',
    radius: 0.92,
    defaultTrailWindowDays: 9_125,
    focusOffset: [0, 0.3, 4]
  },
  {
    id: 'neptune',
    displayName: 'Neptune',
    color: '#557fda',
    radius: 0.88,
    defaultTrailWindowDays: 9_125,
    focusOffset: [0, 0.28, 3.8]
  }
]

export function getPresentationBodyMetadataById(bodyId: BodyId) {
  return presentationBodyMetadata.find((body) => body.id === bodyId)
}
