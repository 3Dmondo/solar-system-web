import { useState } from 'react';
import { type ViewTargetId } from '../../solar-system/domain/body';

export function useFocusedBody(initialBodyId: ViewTargetId) {
  const [focusedBodyId, setFocusedBodyId] = useState<ViewTargetId>(initialBodyId);

  return {
    focusedBodyId,
    setFocusedBodyId
  };
}
