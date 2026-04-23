import { SolarSystemExperience } from './features/experience/SolarSystemExperience';
import { getIsCurrentPathDebugExperience } from './features/experience/debug/debugRoute';
import { createConfiguredWebBodyCatalogSource } from './features/solar-system/data/webBodyCatalogRuntime';

const configuredCatalogSource = createConfiguredWebBodyCatalogSource(import.meta.env)

export function App() {
  const isDebugExperience = getIsCurrentPathDebugExperience()

  return (
    <SolarSystemExperience
      catalogSource={configuredCatalogSource}
      showDebugOverlay={isDebugExperience}
    />
  );
}
