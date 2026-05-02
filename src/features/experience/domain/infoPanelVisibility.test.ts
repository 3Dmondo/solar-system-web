import { describe, expect, it } from 'vitest';
import {
  applyInfoPanelDefault,
  closeExperiencePopoverPanel,
  openExperiencePopoverPanel,
  type ExperiencePanelState
} from './infoPanelVisibility';

const openInfoState: ExperiencePanelState = {
  activePopoverPanel: null,
  isInfoPanelOpen: true,
  restoreInfoPanelAfterPopoverClose: false
};

describe('infoPanelVisibility', () => {
  it('keeps the information panel visible when wide layouts open another rail panel', () => {
    expect(openExperiencePopoverPanel(openInfoState, 'help', true)).toEqual({
      activePopoverPanel: 'help',
      isInfoPanelOpen: true,
      restoreInfoPanelAfterPopoverClose: false
    });
  });

  it('temporarily hides and restores the information panel in mobile portrait layouts', () => {
    const withHelpOpen = openExperiencePopoverPanel(openInfoState, 'help', false);

    expect(withHelpOpen).toEqual({
      activePopoverPanel: 'help',
      isInfoPanelOpen: false,
      restoreInfoPanelAfterPopoverClose: true
    });
    expect(closeExperiencePopoverPanel(withHelpOpen)).toEqual(openInfoState);
  });

  it('does not restore the information panel when it was already hidden', () => {
    const hiddenInfoState: ExperiencePanelState = {
      activePopoverPanel: null,
      isInfoPanelOpen: false,
      restoreInfoPanelAfterPopoverClose: false
    };
    const withHelpOpen = openExperiencePopoverPanel(hiddenInfoState, 'help', false);

    expect(withHelpOpen).toEqual({
      activePopoverPanel: 'help',
      isInfoPanelOpen: false,
      restoreInfoPanelAfterPopoverClose: false
    });
    expect(closeExperiencePopoverPanel(withHelpOpen)).toEqual(hiddenInfoState);
  });

  it('applies orientation defaults when no popover is active', () => {
    expect(applyInfoPanelDefault(openInfoState, false)).toEqual({
      activePopoverPanel: null,
      isInfoPanelOpen: false,
      restoreInfoPanelAfterPopoverClose: false
    });
  });
});
