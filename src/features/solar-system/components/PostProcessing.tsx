import { EffectComposer, Bloom } from '@react-three/postprocessing';

type PostProcessingProps = {
  /** Enable bloom effect */
  enableBloom?: boolean;
  /** Bloom intensity (default: 0.2) */
  bloomIntensity?: number;
  /** Bloom luminance threshold - only pixels brighter than this will bloom (default: 0.9) */
  bloomThreshold?: number;
  /** Bloom luminance smoothing (default: 0.025) */
  bloomSmoothing?: number;
};

/**
 * Post-processing effects wrapper for the scene.
 * Currently supports selective bloom for bright elements like the Sun impostor.
 */
export function PostProcessing({
  enableBloom = true,
  bloomIntensity = 0.2,
  bloomThreshold = 0.9,
  bloomSmoothing = 0.025
}: PostProcessingProps) {
  if (!enableBloom) {
    return null;
  }

  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={bloomSmoothing}
        mipmapBlur
      />
    </EffectComposer>
  );
}

/**
 * Default bloom configuration values
 */
export const BLOOM_DEFAULTS = {
  intensity: 0.2,
  threshold: 0.9,
  smoothing: 0.025
} as const;
