export type ScaleMode = 'cinematic' | 'realistic';

export function getSceneScaleLabel(mode: ScaleMode) {
  return mode === 'cinematic' ? 'Cinematic scale' : 'Realistic scale';
}
