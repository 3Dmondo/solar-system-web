import { ExperienceHud } from './components/ExperienceHud';
import { ExperienceScene } from './components/ExperienceScene';
import { useCoarsePointer } from './hooks/useCoarsePointer';
import { useFocusedBody } from './state/useFocusedBody';

export function SolarSystemExperience() {
  const { focusedBodyId, setFocusedBodyId } = useFocusedBody('overview');
  const isCoarsePointer = useCoarsePointer();

  return (
    <main className="experience-shell" aria-label="Solar system experience">
      <ExperienceScene
        focusedBodyId={focusedBodyId}
        isCoarsePointer={isCoarsePointer}
        onFocusBody={setFocusedBodyId}
      />
      <ExperienceHud
        focusedBodyId={focusedBodyId}
        isCoarsePointer={isCoarsePointer}
        onFocusBody={setFocusedBodyId}
        onReturnToOverview={() => setFocusedBodyId('overview')}
      />
    </main>
  );
}
