import type { BodyId } from './body';

/**
 * Reference frame identifiers.
 * - 'ssb': Solar System Barycenter (true gravitational center)
 * - 'earth': Earth-centered frame
 *
 * Extensible to other body-centered frames in the future.
 */
export type ReferenceFrameId = 'ssb' | 'earth';

/**
 * Reference frame definition.
 */
export type ReferenceFrame = {
  id: ReferenceFrameId;
  displayName: string;
  description: string;
  /**
   * The body whose position becomes the origin.
   * null for SSB (barycenter is already at origin in the ephemeris data).
   */
  originBodyId: BodyId | null;
};

/**
 * All available reference frames.
 */
export const REFERENCE_FRAMES: ReferenceFrame[] = [
  {
    id: 'ssb',
    displayName: 'Solar System Barycenter',
    description: 'View centered on the solar system center of mass',
    originBodyId: null
  },
  {
    id: 'earth',
    displayName: 'Earth-centered',
    description: 'View centered on Earth, showing apparent motion',
    originBodyId: 'earth'
  }
];

/**
 * Default reference frame on app start.
 */
export const DEFAULT_REFERENCE_FRAME_ID: ReferenceFrameId = 'ssb';

/**
 * Look up a reference frame by ID.
 */
export function getReferenceFrame(id: ReferenceFrameId): ReferenceFrame {
  const frame = REFERENCE_FRAMES.find((f) => f.id === id);
  if (!frame) {
    throw new Error(`Unknown reference frame: ${id}`);
  }
  return frame;
}

/**
 * Check if a reference frame requires position transformation.
 * SSB frame uses original ephemeris positions; body-centered frames need subtraction.
 */
export function frameRequiresTransformation(frame: ReferenceFrame): boolean {
  return frame.originBodyId !== null;
}
