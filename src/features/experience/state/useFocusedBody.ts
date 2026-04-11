import { useState } from 'react';
import { type BodyId } from '../../solar-system/domain/body';

export function useFocusedBody(initialBodyId: BodyId) {
  const [focusedBodyId, setFocusedBodyId] = useState<BodyId>(initialBodyId);

  return {
    focusedBodyId,
    setFocusedBodyId
  };
}
