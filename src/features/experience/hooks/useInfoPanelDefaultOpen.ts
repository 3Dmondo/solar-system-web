import { useEffect, useState } from 'react';

const infoPanelDefaultOpenQuery = '(min-width: 768px), (orientation: landscape)';

export function getIsInfoPanelDefaultOpen() {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.matchMedia(infoPanelDefaultOpenQuery).matches;
}

export function useInfoPanelDefaultOpen() {
  const [isInfoPanelDefaultOpen, setIsInfoPanelDefaultOpen] = useState(
    getIsInfoPanelDefaultOpen
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(infoPanelDefaultOpenQuery);
    const update = () => {
      setIsInfoPanelDefaultOpen(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener('change', update);

    return () => {
      mediaQuery.removeEventListener('change', update);
    };
  }, []);

  return isInfoPanelDefaultOpen;
}
