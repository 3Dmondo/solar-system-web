import { SolarSystemExperience } from './features/experience/SolarSystemExperience';
import { getCurrentDebugExperienceOptions } from './features/experience/debug/debugRoute';
import { createConfiguredWebBodyCatalogSource } from './features/solar-system/data/webBodyCatalogRuntime';

const configuredCatalogSource = createConfiguredWebBodyCatalogSource(import.meta.env)

export function App() {
  const debugExperienceOptions = getCurrentDebugExperienceOptions()

  return (
    <SolarSystemExperience
      catalogSource={configuredCatalogSource}
      showDebugOverlay={debugExperienceOptions.showDebugOverlay}
      simulationClockStartAt={debugExperienceOptions.clockStartAt}
    />
  );
}
