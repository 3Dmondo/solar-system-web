export type FocusViewState = {
  cameraPosition: [number, number, number];
  target: [number, number, number];
};

export function translateFocusView(
  view: FocusViewState,
  delta: [number, number, number]
): FocusViewState {
  return {
    cameraPosition: [
      view.cameraPosition[0] + delta[0],
      view.cameraPosition[1] + delta[1],
      view.cameraPosition[2] + delta[2]
    ],
    target: [
      view.target[0] + delta[0],
      view.target[1] + delta[1],
      view.target[2] + delta[2]
    ]
  };
}
