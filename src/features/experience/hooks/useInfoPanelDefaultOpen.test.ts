import { afterEach, describe, expect, it, vi } from 'vitest';
import { getIsInfoPanelDefaultOpen } from './useInfoPanelDefaultOpen';

describe('useInfoPanelDefaultOpen', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia
    });
  });

  it('defaults the HUD open outside mobile portrait layouts', () => {
    mockMatchMedia(true);

    expect(getIsInfoPanelDefaultOpen()).toBe(true);
  });

  it('defaults the HUD closed in mobile portrait layouts', () => {
    mockMatchMedia(false);

    expect(getIsInfoPanelDefaultOpen()).toBe(false);
  });
});

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}
