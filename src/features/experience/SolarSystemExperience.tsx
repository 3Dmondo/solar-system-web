import { ExperienceHud } from './components/ExperienceHud';
import { ExperienceScene } from './components/ExperienceScene';
import { DebugFpsOverlay } from './components/DebugFpsOverlay';
import { useCoarsePointer } from './hooks/useCoarsePointer';
import { useFocusedBody } from './state/useFocusedBody';
import {
  useResolvedBodyCatalog
} from './state/useResolvedBodyCatalog';
import { useSimulationClock } from './state/useSimulationClock';
import { type BodyCatalogSource } from '../solar-system/data/bodyStateStore';

type SolarSystemExperienceProps = {
  catalogSource?: BodyCatalogSource;
  showDebugOverlay?: boolean;
};

export function SolarSystemExperience({
  catalogSource,
  showDebugOverlay = false
}: SolarSystemExperienceProps) {
  const { focusedBodyId, setFocusedBodyId } = useFocusedBody('overview');
  const isCoarsePointer = useCoarsePointer();
  const {
    cyclePlaybackRate,
    isPaused,
    playbackRateLabel,
    requestedUtc,
    togglePaused
  } = useSimulationClock();
  const { catalog, status, error } = useResolvedBodyCatalog(requestedUtc, catalogSource);

  return (
    <main className="experience-shell" aria-label="Solar system experience">
      <ExperienceScene
        catalog={catalog}
        focusedBodyId={focusedBodyId}
        isCoarsePointer={isCoarsePointer}
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
      {showDebugOverlay ? <DebugFpsOverlay /> : null}
    </main>
  );
}
