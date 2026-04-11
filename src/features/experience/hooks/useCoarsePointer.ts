import { useEffect, useState } from 'react';

const coarsePointerQuery = '(pointer: coarse)';

export function useCoarsePointer() {
  const [isCoarsePointer, setIsCoarsePointer] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(coarsePointerQuery).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(coarsePointerQuery);
    const update = () => {
      setIsCoarsePointer(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener('change', update);

    return () => {
      mediaQuery.removeEventListener('change', update);
    };
  }, []);

  return isCoarsePointer;
}
