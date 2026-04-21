import { SolarSystemExperience } from './features/experience/SolarSystemExperience';
import { createConfiguredWebBodyCatalogSource } from './features/solar-system/data/webBodyCatalogRuntime';

const configuredCatalogSource = createConfiguredWebBodyCatalogSource(import.meta.env)

export function App() {
  return <SolarSystemExperience catalogSource={configuredCatalogSource} />;
}
