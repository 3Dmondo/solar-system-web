export type AnchoredTrailLineGeometry = {
  anchor: [number, number, number];
  points: Array<[number, number, number]>;
};

const zeroVector: [number, number, number] = [0, 0, 0];

export function createAnchoredTrailLineGeometry(
  positions: Array<[number, number, number]>
): AnchoredTrailLineGeometry {
  if (positions.length === 0) {
    return {
      anchor: zeroVector,
      points: []
    };
  }

  const anchor = getAveragePosition(positions);

  return {
    anchor,
    points: positions.map((position) => [
      position[0] - anchor[0],
      position[1] - anchor[1],
      position[2] - anchor[2]
    ])
  };
}

function getAveragePosition(
  positions: Array<[number, number, number]>
): [number, number, number] {
  const sum = positions.reduce(
    (total, position) => {
      total[0] += position[0];
      total[1] += position[1];
      total[2] += position[2];

      return total;
    },
    [0, 0, 0] as [number, number, number]
  );
  const positionCount = positions.length;

  return [
    sum[0] / positionCount,
    sum[1] / positionCount,
    sum[2] / positionCount
  ];
}
