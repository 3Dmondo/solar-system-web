import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { type BodyId } from '../solar-system/domain/body';
import { type ReferenceFrameId } from '../solar-system/domain/referenceFrame';
import { type LayerId } from './state/useLayerVisibility';
import { ExperienceControlRail, type ExperienceControlPanel } from './components/ExperienceControlRail';
import { ExperienceHud } from './components/ExperienceHud';
import { ExperienceScene } from './components/ExperienceScene';
import { DebugFpsOverlay } from './components/DebugFpsOverlay';
import { PlaybackControls } from './components/PlaybackControls';
import { useCoarsePointer } from './hooks/useCoarsePointer';
import { getIsWideViewport, useWideViewport } from './hooks/useWideViewport';
import { useFocusedBody } from './state/useFocusedBody';
import { useLayerVisibility } from './state/useLayerVisibility';
import { useReferenceFrame } from './state/useReferenceFrame';
import { useCatalogTimeRange } from './state/useCatalogTimeRange';
import {
  useResolvedBodyCatalog
} from './state/useResolvedBodyCatalog';
import { useSimulationClock } from './state/useSimulationClock';
import { SimulationClockContext } from './state/SimulationClockContext';
import { setRuntimeDebugMetricsEnabled } from './debug/runtimeDebugMetrics';
import { type BodyCatalogSource, type SupportedTimeRange } from '../solar-system/data/bodyStateStore';
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
  const isWideViewport = useWideViewport();
  const [activeControlPanel, setActiveControlPanel] = useState<ExperienceControlPanel | null>(
    () => (getIsWideViewport() ? 'info' : null)
  );
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
    setActiveControlPanel((currentPanel) => {
      if (currentPanel !== 'info' && currentPanel !== null) {
        return currentPanel;
      }

      return isWideViewport ? 'info' : null;
    });
  }, [isWideViewport]);

  // Load catalog with trails computed relative to the selected reference frame's origin
  const { catalog: baseCatalog, status, error } = useResolvedBodyCatalog(
    requestedUtc,
    catalogSource,
    { trailOriginBodyId: selectedFrame.originBodyId }
  );

  // Transform body positions to selected reference frame
  // (trails are already frame-relative from the provider)
  const catalog = useMemo(
    () => transformCatalogToFrame(baseCatalog, selectedFrame),
    [baseCatalog, selectedFrame]
  );
  const availableFrames = useMemo(
    () => getReferenceFramesForLoadedBodies(baseCatalog.metadata.map((metadata) => metadata.id)),
    [baseCatalog.metadata]
  );
  const focusedBodyDisplayName =
    focusedBodyId === 'overview'
      ? null
      : catalog.metadata.find((metadata) => metadata.id === focusedBodyId)?.displayName ?? null;
  const rangeWarning =
    boundaryState && supportedTimeRange
      ? createRangeWarning(boundaryState, supportedTimeRange)
      : null;

  const handleFocusBody = (bodyId: BodyId) => {
    setFocusedBodyId(bodyId);
  };

  const handleSelectFrame = (frameId: ReferenceFrameId) => {
    selectFrame(frameId);
  };

  const handleToggleLayer = (layerId: LayerId) => {
    toggleLayer(layerId);
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
        {activeControlPanel === 'info' ? (
          <ExperienceHud
            catalogError={error}
            catalogStatus={status}
            focusedBodyId={focusedBodyId}
            focusedBodyDisplayName={focusedBodyDisplayName}
            rangeWarning={rangeWarning}
          />
        ) : null}
        <ExperienceControlRail
          activePanel={activeControlPanel}
          catalog={catalog}
          focusedBodyId={focusedBodyId}
          selectedFrameId={selectedFrame.id}
          availableFrames={availableFrames}
          visibility={visibility}
          layerConfigs={layerConfigs}
          onFocusBody={handleFocusBody}
          onReturnToOverview={() => setFocusedBodyId('overview')}
          onSelectFrame={handleSelectFrame}
          onSetActivePanel={setActiveControlPanel}
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
