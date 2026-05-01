import {
  BODY_IDS,
  getBodyRegistryEntry,
  getParentBody,
  isSatellite,
  type BodyId
} from './body';

/**
 * Reference frame identifiers.
 * - 'ssb': Solar System Barycenter (true gravitational center)
 * - Body ids: centered on a loaded body, currently exposed for loaded parent systems
 *
 * `earth` remains the current baseline body-centered frame id.
 */
export type ReferenceFrameId = 'ssb' | BodyId;

/**
 * Reference frame definition.
 */
export type ReferenceFrame = {
  id: ReferenceFrameId;
  shortLabel: string;
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
const SSB_REFERENCE_FRAME: ReferenceFrame = {
  id: 'ssb',
  shortLabel: 'SSB',
  displayName: 'Solar System Barycenter',
  description: 'View centered on the solar system center of mass',
  originBodyId: null
};

export const REFERENCE_FRAMES: ReferenceFrame[] = [
  SSB_REFERENCE_FRAME,
  createBodyCenteredReferenceFrame('earth')
];

/**
 * Default reference frame on app start.
 */
export const DEFAULT_REFERENCE_FRAME_ID: ReferenceFrameId = 'ssb';

/**
 * Look up a reference frame by ID.
 */
export function getReferenceFrame(id: ReferenceFrameId): ReferenceFrame {
  if (id === 'ssb') {
    return SSB_REFERENCE_FRAME;
  }

  if (!isBodyId(id)) {
    throw new Error(`Unknown reference frame: ${id}`);
  }

  return createBodyCenteredReferenceFrame(id);
}

/**
 * Build the frame menu for the currently loaded catalog. The baseline catalog
 * keeps Earth-centered available through the Moon, while expanded catalogs add
 * parent system centers such as Mars, Jupiter, Saturn, Uranus, and Neptune when
 * their satellites are loaded.
 */
export function getReferenceFramesForLoadedBodies(
  availableBodyIds: Iterable<BodyId>
): ReferenceFrame[] {
  const availableBodyIdSet = new Set(availableBodyIds);
  const centeredBodyIds = new Set<BodyId>();

  for (const bodyId of availableBodyIdSet) {
    if (!isSatellite(bodyId)) {
      continue;
    }

    const parentId = getParentBody(bodyId);

    if (parentId && availableBodyIdSet.has(parentId)) {
      centeredBodyIds.add(parentId);
    }
  }

  return [
    SSB_REFERENCE_FRAME,
    ...BODY_IDS.filter((bodyId) => centeredBodyIds.has(bodyId)).map((bodyId) =>
      createBodyCenteredReferenceFrame(bodyId)
    )
  ];
}

/**
 * Check if a reference frame requires position transformation.
 * SSB frame uses original ephemeris positions; body-centered frames need subtraction.
 */
export function frameRequiresTransformation(frame: ReferenceFrame): boolean {
  return frame.originBodyId !== null;
}

function createBodyCenteredReferenceFrame(bodyId: BodyId): ReferenceFrame {
  const body = getBodyRegistryEntry(bodyId);

  return {
    id: bodyId,
    shortLabel: body.displayName,
    displayName: `${body.displayName}-centered`,
    description: `View centered on ${body.displayName}`,
    originBodyId: bodyId
  };
}

function isBodyId(value: string): value is BodyId {
  return (BODY_IDS as string[]).includes(value);
}
