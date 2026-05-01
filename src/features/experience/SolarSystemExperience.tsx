import { useLayoutEffect, useMemo } from 'react';
import { ExperienceHud } from './components/ExperienceHud';
import { ExperienceScene } from './components/ExperienceScene';
import { DebugFpsOverlay } from './components/DebugFpsOverlay';
import { FullscreenButton } from './components/FullscreenButton';
import { LayerPanel } from './components/LayerPanel';
import { ReferenceFrameSelector } from './components/ReferenceFrameSelector';
import { useCoarsePointer } from './hooks/useCoarsePointer';
import { useFocusedBody } from './state/useFocusedBody';
import { useLayerVisibility } from './state/useLayerVisibility';
import { useReferenceFrame } from './state/useReferenceFrame';
import {
  useResolvedBodyCatalog
} from './state/useResolvedBodyCatalog';
import { useSimulationClock } from './state/useSimulationClock';
import { SimulationClockContext } from './state/SimulationClockContext';
import { setRuntimeDebugMetricsEnabled } from './debug/runtimeDebugMetrics';
import { type BodyCatalogSource } from '../solar-system/data/bodyStateStore';
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
  const {
    cyclePlaybackRate,
    isPaused,
    playbackRateLabel,
    playbackRateMultiplier,
    requestedUtc,
    simulationInitialUtcMs,
    togglePaused
  } = useSimulationClock({
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
        <ExperienceHud
          catalog={catalog}
          catalogError={error}
          catalogStatus={status}
          focusedBodyId={focusedBodyId}
          isCoarsePointer={isCoarsePointer}
          isSimulationPaused={isPaused}
          playbackRateLabel={playbackRateLabel}
          requestedUtc={requestedUtc}
          onFocusBody={setFocusedBodyId}
          onReturnToOverview={() => setFocusedBodyId('overview')}
          onCyclePlaybackRate={cyclePlaybackRate}
          onToggleSimulationPaused={togglePaused}
        />
        <FullscreenButton />
        <ReferenceFrameSelector
          selectedFrameId={selectedFrame.id}
          availableFrames={availableFrames}
          onSelectFrame={selectFrame}
        />
        <LayerPanel
          visibility={visibility}
          layerConfigs={layerConfigs}
          onToggleLayer={toggleLayer}
        />
        {showDebugOverlay ? <DebugFpsOverlay clockStartAt={simulationClockStartAt} /> : null}
      </main>
    </SimulationClockContext.Provider>
  );
}
