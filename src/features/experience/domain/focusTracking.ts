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

export function getFocusViewCameraOffsetDistanceSquared(
  currentView: FocusViewState,
  desiredView: FocusViewState
) {
  const currentOffset = getCameraOffset(currentView);
  const desiredOffset = getCameraOffset(desiredView);

  return (
    (currentOffset[0] - desiredOffset[0]) ** 2 +
    (currentOffset[1] - desiredOffset[1]) ** 2 +
    (currentOffset[2] - desiredOffset[2]) ** 2
  );
}

function getCameraOffset(view: FocusViewState): [number, number, number] {
  return [
    view.cameraPosition[0] - view.target[0],
    view.cameraPosition[1] - view.target[1],
    view.cameraPosition[2] - view.target[2]
  ];
}
