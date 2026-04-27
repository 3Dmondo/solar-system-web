export type TrailRenderStyle = {
  lineWidth: number;
  colorIntensity: number;
};

export function getTrailRenderStyle(): TrailRenderStyle {
  return {
    lineWidth: 2.35,
    colorIntensity: 0.85
  };
}
