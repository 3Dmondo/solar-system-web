export type ExperiencePopoverPanel = 'help' | 'jump' | 'frame' | 'layers';

export type ExperiencePanelState = {
  activePopoverPanel: ExperiencePopoverPanel | null;
  isInfoPanelOpen: boolean;
  restoreInfoPanelAfterPopoverClose: boolean;
};

export function openExperiencePopoverPanel(
  state: ExperiencePanelState,
  panel: ExperiencePopoverPanel,
  shouldKeepInfoPanelVisible: boolean
): ExperiencePanelState {
  if (state.activePopoverPanel === panel) {
    return closeExperiencePopoverPanel(state);
  }

  const shouldTemporarilyHideInfo =
    !shouldKeepInfoPanelVisible && state.isInfoPanelOpen;

  return {
    activePopoverPanel: panel,
    isInfoPanelOpen: shouldTemporarilyHideInfo ? false : state.isInfoPanelOpen,
    restoreInfoPanelAfterPopoverClose:
      state.restoreInfoPanelAfterPopoverClose || shouldTemporarilyHideInfo
  };
}

export function closeExperiencePopoverPanel(
  state: ExperiencePanelState
): ExperiencePanelState {
  return {
    activePopoverPanel: null,
    isInfoPanelOpen:
      state.restoreInfoPanelAfterPopoverClose || state.isInfoPanelOpen,
    restoreInfoPanelAfterPopoverClose: false
  };
}

export function applyInfoPanelDefault(
  state: ExperiencePanelState,
  isInfoPanelDefaultOpen: boolean
): ExperiencePanelState {
  if (state.activePopoverPanel) {
    return state;
  }

  return {
    ...state,
    isInfoPanelOpen: isInfoPanelDefaultOpen,
    restoreInfoPanelAfterPopoverClose: false
  };
}
