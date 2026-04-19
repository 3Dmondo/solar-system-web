import {
  type BodyDefinition,
  type BodyId,
  type BodyMetadata,
  type BodySnapshot,
  type BodyState,
  type BodyStateProvider
} from '../domain/body';
import { EARTH_SURFACE_ROTATION_SPEED } from '../rendering/earthMotion';
import { SATURN_SPHERE_TILT } from '../rendering/saturnRings';

function orbitalPosition(radius: number, degrees: number): [number, number, number] {
  const radians = (degrees * Math.PI) / 180;

  return [Math.cos(radians) * radius, 0, Math.sin(radians) * radius];
}

export const MOCK_SUN_POSITION: [number, number, number] = [0, 0, 0];

const MOCK_BODY_CAPTURED_AT = 'mock-overview';

export const mockedBodyMetadata: BodyMetadata[] = [
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
];

export const mockedBodyStates: BodyState[] = [
  {
    id: 'sun',
    position: MOCK_SUN_POSITION
  },
  {
    id: 'mercury',
    position: orbitalPosition(4.5, 18)
  },
  {
    id: 'venus',
    position: orbitalPosition(6.5, 84)
  },
  {
    id: 'earth',
    position: orbitalPosition(9.0, 145)
  },
  {
    id: 'moon',
    position: [-6.3, -0.18, 5.65]
  },
  {
    id: 'mars',
    position: orbitalPosition(12.0, 215)
  },
  {
    id: 'jupiter',
    position: orbitalPosition(17.0, 280)
  },
  {
    id: 'saturn',
    position: orbitalPosition(22.0, 332)
  },
  {
    id: 'uranus',
    position: orbitalPosition(28.0, 28)
  },
  {
    id: 'neptune',
    position: orbitalPosition(34.0, 176)
  }
];

export const mockBodyStateProvider: BodyStateProvider = {
  getBodyMetadata: () => mockedBodyMetadata,
  getSnapshot: () => ({
    capturedAt: MOCK_BODY_CAPTURED_AT,
    bodies: mockedBodyStates
  })
};

export function getMockBodySnapshot() {
  return mockBodyStateProvider.getSnapshot();
}

export function getBodyMetadataById(bodyId: BodyId) {
  return mockedBodyMetadata.find((body) => body.id === bodyId);
}

export function getBodyStateById(snapshot: BodySnapshot, bodyId: BodyId) {
  return snapshot.bodies.find((body) => body.id === bodyId);
}

export function getBodyDefinitionById(snapshot: BodySnapshot, bodyId: BodyId): BodyDefinition | undefined {
  const metadata = getBodyMetadataById(bodyId);
  const state = getBodyStateById(snapshot, bodyId);

  if (!metadata || !state) {
    return undefined;
  }

  return {
    ...metadata,
    ...state
  };
}

export function mergeBodySnapshotWithMetadata(snapshot: BodySnapshot): BodyDefinition[] {
  return mockedBodyMetadata.flatMap((metadata) => {
    const state = getBodyStateById(snapshot, metadata.id);

    if (!state) {
      return [];
    }

    return [
      {
        ...metadata,
        ...state
      }
    ];
  });
}
