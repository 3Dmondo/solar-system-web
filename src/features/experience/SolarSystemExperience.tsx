import { ExperienceHud } from './components/ExperienceHud';
import { ExperienceScene } from './components/ExperienceScene';
import { useFocusedBody } from './state/useFocusedBody';

export function SolarSystemExperience() {
  const { focusedBodyId, setFocusedBodyId } = useFocusedBody('saturn');

  return (
    <main className="experience-shell" aria-label="Solar system experience">
      <ExperienceScene focusedBodyId={focusedBodyId} onFocusBody={setFocusedBodyId} />
      <ExperienceHud focusedBodyId={focusedBodyId} />
    </main>
  );
}
