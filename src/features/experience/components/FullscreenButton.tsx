import { useCallback, useEffect, useState } from 'react';
import './fullscreen-button.css';

/**
 * Check if the Fullscreen API is available
 */
function isFullscreenSupported(): boolean {
  return (
    typeof document !== 'undefined' &&
    (document.fullscreenEnabled ||
      // Webkit prefix for Safari
      (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled === true)
  );
}

/**
 * Get the current fullscreen element
 */
function getFullscreenElement(): Element | null {
  if (typeof document === 'undefined') return null;
  return (
    document.fullscreenElement ||
    (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
    null
  );
}

/**
 * Request fullscreen for the document element
 */
async function enterFullscreen(): Promise<void> {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    await elem.requestFullscreen();
  } else if ((elem as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
    await (elem as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
  }
}

/**
 * Exit fullscreen mode
 */
async function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
    await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
  }
}

/**
 * Floating fullscreen toggle button.
 * Positioned in the top-right corner with glassmorphic styling.
 * Gracefully degrades when Fullscreen API is not available.
 */
export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported] = useState(isFullscreenSupported);

  // Sync state with actual fullscreen status
  useEffect(() => {
    if (!isSupported) return;

    const handleChange = () => {
      setIsFullscreen(getFullscreenElement() !== null);
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);

    // Check initial state
    handleChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
    };
  }, [isSupported]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (isFullscreen) {
        await exitFullscreen();
      } else {
        await enterFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  }, [isFullscreen]);

  // Don't render if fullscreen is not supported
  if (!isSupported) {
    return null;
  }

  return (
    <button
      className="fullscreen-button"
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
    </button>
  );
}

function EnterFullscreenIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
