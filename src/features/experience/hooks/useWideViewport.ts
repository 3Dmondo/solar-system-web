import { useEffect, useState } from 'react';

const wideViewportQuery = '(min-width: 768px)';

export function getIsWideViewport() {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.matchMedia(wideViewportQuery).matches;
}

export function useWideViewport() {
  const [isWideViewport, setIsWideViewport] = useState(getIsWideViewport);

  useEffect(() => {
    const mediaQuery = window.matchMedia(wideViewportQuery);
    const update = () => {
      setIsWideViewport(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener('change', update);

    return () => {
      mediaQuery.removeEventListener('change', update);
    };
  }, []);

  return isWideViewport;
}
