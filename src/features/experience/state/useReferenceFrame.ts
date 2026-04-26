import { useCallback, useMemo, useState } from 'react';
import {
  DEFAULT_REFERENCE_FRAME_ID,
  getReferenceFrame,
  REFERENCE_FRAMES,
  type ReferenceFrameId
} from '../../solar-system/domain/referenceFrame';

/**
 * Hook for managing the selected reference frame.
 * Returns the current frame, available frames, and a setter.
 */
export function useReferenceFrame(
  initialFrameId: ReferenceFrameId = DEFAULT_REFERENCE_FRAME_ID
) {
  const [selectedFrameId, setSelectedFrameId] =
    useState<ReferenceFrameId>(initialFrameId);

  // Memoize to avoid creating new object references every render
  const selectedFrame = useMemo(
    () => getReferenceFrame(selectedFrameId),
    [selectedFrameId]
  );

  const selectFrame = useCallback((frameId: ReferenceFrameId) => {
    setSelectedFrameId(frameId);
  }, []);

  const resetToDefault = useCallback(() => {
    setSelectedFrameId(DEFAULT_REFERENCE_FRAME_ID);
  }, []);

  return {
    selectedFrameId,
    selectedFrame,
    selectFrame,
    resetToDefault,
    availableFrames: REFERENCE_FRAMES
  };
}

export type UseReferenceFrameReturn = ReturnType<typeof useReferenceFrame>;
