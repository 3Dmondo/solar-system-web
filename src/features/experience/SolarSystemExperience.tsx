import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  getBodyRegistryEntry,
  getSystemTargetParentBody,
  isSystemTargetId,
  type ViewTargetId
} from '../solar-system/domain/body';
import { type ReferenceFrameId } from '../solar-system/domain/referenceFrame';
import { type LayerId } from './state/useLayerVisibility';
import { ExperienceControlRail } from './components/ExperienceControlRail';
import { ExperienceHud } from './components/ExperienceHud';
import { ExperienceScene } from './components/ExperienceScene';
import { DebugFpsOverlay } from './components/DebugFpsOverlay';
import { PlaybackControls } from './components/PlaybackControls';
import { useCoarsePointer } from './hooks/useCoarsePointer';
import {
  getIsInfoPanelDefaultOpen,
  useInfoPanelDefaultOpen
} from './hooks/useInfoPanelDefaultOpen';
import { useFocusedBody } from './state/useFocusedBody';
import { useLayerVisibility } from './state/useLayerVisibility';
import { useReferenceFrame } from './state/useReferenceFrame';
import { useCatalogTimeRange } from './state/useCatalogTimeRange';
import { getFocusedBodyFacts } from './domain/bodyFacts';
import {
  applyInfoPanelDefault,
  closeExperiencePopoverPanel,
  openExperiencePopoverPanel,
  type ExperiencePopoverPanel
} from './domain/infoPanelVisibility';
import {
  useResolvedBodyCatalog
} from './state/useResolvedBodyCatalog';
import { useSimulationClock } from './state/useSimulationClock';
import { SimulationClockContext } from './state/SimulationClockContext';
import { setRuntimeDebugMetricsEnabled } from './debug/runtimeDebugMetrics';
import {
  type BodyCatalogSource,
  type ResolvedBodyCatalog,
  type SupportedTimeRange
} from '../solar-system/data/bodyStateStore';
import { transformCatalogToFrame } from '../solar-system/data/referenceFrameTransform';
import { getReferenceFramesForLoadedBodies } from '../solar-system/domain/referenceFrame';

type SolarSystemExperienceProps = {
  catalogSource?: BodyCatalogSource;
  showDebugOverlay?: boolean;
  simulationClockStartAt?: Date | string;
};

export function SolarSystemExperience({
  catalogSource,
  showDebugOverlay = false,
  simulationClockStartAt
}: SolarSystemExperienceProps) {
  const { focusedBodyId, setFocusedBodyId } = useFocusedBody('overview');
  const isCoarsePointer = useCoarsePointer();
  const isInfoPanelDefaultOpen = useInfoPanelDefaultOpen();
  const [panelState, setPanelState] = useState(() => ({
    activePopoverPanel: null as ExperiencePopoverPanel | null,
    isInfoPanelOpen: getIsInfoPanelDefaultOpen(),
    restoreInfoPanelAfterPopoverClose: false
  }));
  const { range: supportedTimeRange } = useCatalogTimeRange(catalogSource);
  const minUtcMs = supportedTimeRange ? Date.parse(supportedTimeRange.startUtc) : undefined;
  const maxUtcMs = supportedTimeRange ? Date.parse(supportedTimeRange.endUtc) : undefined;
  const {
    boundaryState,
    canDecreaseSpeed,
    canIncreaseSpeed,
    decreaseSpeed,
    direction,
    increaseSpeed,
    isPaused,
    isPlaybackBlocked,
    playbackRateLabel,
    playbackRateMultiplier,
    requestedUtc,
    selectDirection,
    simulationInitialUtcMs,
    togglePaused
  } = useSimulationClock({
    maxUtcMs,
    minUtcMs,
    startAt: simulationClockStartAt
  });
  const { selectedFrame, selectFrame } = useReferenceFrame();
  const { visibility, toggleLayer, layerConfigs } = useLayerVisibility();

  useLayoutEffect(() => {
    setRuntimeDebugMetricsEnabled(showDebugOverlay);

    return () => {
      if (showDebugOverlay) {
        setRuntimeDebugMetricsEnabled(false);
      }
    };
  }, [showDebugOverlay]);

  useEffect(() => {
    setPanelState((state) => applyInfoPanelDefault(state, isInfoPanelDefaultOpen));
  }, [isInfoPanelDefaultOpen]);

  // Load catalog with non-satellite trails computed relative to the selected frame origin.
  // Satellite trails stay parent-relative so the frame transform can place local orbits.
  const { catalog: baseCatalog, status, error } = useResolvedBodyCatalog(
    requestedUtc,
    catalogSource,
    { trailOriginBodyId: selectedFrame.originBodyId }
  );

  // Transform body positions to selected reference frame.
  const catalog = useMemo(
    () => transformCatalogToFrame(baseCatalog, selectedFrame),
    [baseCatalog, selectedFrame]
  );
  const availableFrames = useMemo(
    () => getReferenceFramesForLoadedBodies(baseCatalog.metadata.map((metadata) => metadata.id)),
    [baseCatalog.metadata]
  );
  const focusedBodyDisplayName = getFocusedTargetDisplayName(focusedBodyId, catalog);
  const focusedBodyFacts = getFocusedBodyFacts(
    focusedBodyId === 'overview' || isSystemTargetId(focusedBodyId)
      ? null
      : catalog.metadata.find((metadata) => metadata.id === focusedBodyId)
  );
  const rangeWarning =
    boundaryState && supportedTimeRange
      ? createRangeWarning(boundaryState, supportedTimeRange)
      : null;

  const handleFocusTarget = (targetId: ViewTargetId) => {
    setFocusedBodyId(targetId);
  };

  const handleSelectFrame = (frameId: ReferenceFrameId) => {
    selectFrame(frameId);
  };

  const handleToggleLayer = (layerId: LayerId) => {
    toggleLayer(layerId);
  };

  const handleSetActiveControlPanel = (panel: ExperiencePopoverPanel | null) => {
    setPanelState((state) => {
      if (!panel) {
        return closeExperiencePopoverPanel(state);
      }

      return openExperiencePopoverPanel(state, panel, isInfoPanelDefaultOpen);
    });
  };

  const handleToggleInfoPanel = () => {
    setPanelState((state) => ({
      activePopoverPanel:
        !state.isInfoPanelOpen && state.activePopoverPanel
          ? null
          : state.activePopoverPanel,
      isInfoPanelOpen: !state.isInfoPanelOpen,
      restoreInfoPanelAfterPopoverClose: false
    }));
  };

  const handleCloseInfoPanel = () => {
    setPanelState((state) => ({
      ...state,
      isInfoPanelOpen: false,
      restoreInfoPanelAfterPopoverClose: false
    }));
  };

  return (
    <SimulationClockContext.Provider value={{ playbackRateMultiplier, isPaused, simulationInitialUtcMs }}>
      <main className="experience-shell" aria-label="Solar system experience">
        <ExperienceScene
          catalog={catalog}
          focusedBodyId={focusedBodyId}
          isCoarsePointer={isCoarsePointer}
          layerVisibility={visibility}
          onFocusBody={setFocusedBodyId}
        />
        {panelState.isInfoPanelOpen ? (
          <ExperienceHud
            catalogError={error}
            catalogStatus={status}
            focusedBodyFacts={focusedBodyFacts}
            focusedBodyId={focusedBodyId}
            focusedBodyDisplayName={focusedBodyDisplayName}
            rangeWarning={rangeWarning}
            onClose={handleCloseInfoPanel}
          />
        ) : null}
        <ExperienceControlRail
          activePanel={panelState.activePopoverPanel}
          catalog={catalog}
          focusedBodyId={focusedBodyId}
          isInfoPanelOpen={panelState.isInfoPanelOpen}
          selectedFrameId={selectedFrame.id}
          availableFrames={availableFrames}
          visibility={visibility}
          layerConfigs={layerConfigs}
          onFocusTarget={handleFocusTarget}
          onReturnToOverview={() => setFocusedBodyId('overview')}
          onSelectFrame={handleSelectFrame}
          onSetActivePanel={handleSetActiveControlPanel}
          onToggleInfoPanel={handleToggleInfoPanel}
          onToggleLayer={handleToggleLayer}
        />
        <PlaybackControls
          canDecreaseSpeed={canDecreaseSpeed}
          canIncreaseSpeed={canIncreaseSpeed}
          direction={direction}
          isPaused={isPaused}
          isPlaybackBlocked={isPlaybackBlocked}
          playbackRateLabel={playbackRateLabel}
          requestedUtc={requestedUtc}
          onDecreaseSpeed={decreaseSpeed}
          onIncreaseSpeed={increaseSpeed}
          onSelectDirection={selectDirection}
          onTogglePaused={togglePaused}
        />
        {showDebugOverlay ? <DebugFpsOverlay clockStartAt={simulationClockStartAt} /> : null}
      </main>
    </SimulationClockContext.Provider>
  );
}

function getFocusedTargetDisplayName(
  focusedBodyId: ViewTargetId,
  catalog: ResolvedBodyCatalog
) {
  if (focusedBodyId === 'overview') {
    return null;
  }

  if (isSystemTargetId(focusedBodyId)) {
    const parentBodyId = getSystemTargetParentBody(focusedBodyId);
    return `${getBodyRegistryEntry(parentBodyId).displayName} system`;
  }

  return catalog.metadata.find((metadata) => metadata.id === focusedBodyId)?.displayName ?? null;
}

function createRangeWarning(
  boundaryState: 'start' | 'end',
  range: SupportedTimeRange
) {
  const pausedAt = boundaryState === 'start' ? range.startUtc : range.endUtc;

  return {
    title: 'Ephemeris range reached.',
    detail: `Paused at ${formatUtcTimestamp(pausedAt)}.`,
    hint: `Valid range: ${formatUtcTimestamp(range.startUtc)} to ${formatUtcTimestamp(range.endUtc)}. Switch direction to continue.`
  };
}

function formatUtcTimestamp(utc: string) {
  const utcDate = new Date(utc);

  if (Number.isNaN(utcDate.getTime())) {
    return 'Invalid UTC time';
  }

  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utcDate.getUTCDate()).padStart(2, '0');
  const hours = String(utcDate.getUTCHours()).padStart(2, '0');
  const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}
