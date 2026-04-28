const DEG_TO_RAD = Math.PI / 180;
const J2000_ECLIPTIC_OBLIQUITY_RADIANS = 23.439291111 * DEG_TO_RAD;
const J2000_ECLIPTIC_OBLIQUITY_COSINE = Math.cos(J2000_ECLIPTIC_OBLIQUITY_RADIANS);
const J2000_ECLIPTIC_OBLIQUITY_SINE = Math.sin(J2000_ECLIPTIC_OBLIQUITY_RADIANS);
const TAU = Math.PI * 2;

// J2000 equatorial to IAU Galactic rotation matrix.
const EQUATORIAL_TO_GALACTIC = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [0.4941094279, -0.44482963, 0.7469822445],
  [-0.867666149, -0.1980763734, 0.4559837762]
] as const;

export type UnitVector3 = [number, number, number];
export type TextureUv = [u: number, v: number];

export function renderDirectionToGalacticTextureUv(direction: UnitVector3): TextureUv {
  const renderDirection = normalize(direction);
  const equatorial = renderDirectionToJ2000Equatorial(renderDirection);
  const galactic = multiplyMatrixVector(EQUATORIAL_TO_GALACTIC, equatorial);
  const longitude = positiveRadians(Math.atan2(galactic[1], galactic[0]));
  const latitude = Math.asin(clamp(galactic[2], -1, 1));

  return [
    positiveUnit(0.5 - longitude / TAU),
    latitude / Math.PI + 0.5
  ];
}

function renderDirectionToJ2000Equatorial(renderDirection: UnitVector3): UnitVector3 {
  const eclipticY = -renderDirection[2];
  const eclipticZ = renderDirection[1];

  return normalize([
    renderDirection[0],
    eclipticY * J2000_ECLIPTIC_OBLIQUITY_COSINE -
      eclipticZ * J2000_ECLIPTIC_OBLIQUITY_SINE,
    eclipticY * J2000_ECLIPTIC_OBLIQUITY_SINE +
      eclipticZ * J2000_ECLIPTIC_OBLIQUITY_COSINE
  ]);
}

function multiplyMatrixVector(
  matrix: typeof EQUATORIAL_TO_GALACTIC,
  vector: UnitVector3
): UnitVector3 {
  return normalize([
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2],
    matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2]
  ]);
}

function normalize(vector: UnitVector3): UnitVector3 {
  const length = Math.hypot(vector[0], vector[1], vector[2]);

  if (length === 0 || !Number.isFinite(length)) {
    return [1, 0, 0];
  }

  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function positiveRadians(radians: number) {
  return radians < 0 ? radians + TAU : radians;
}

function positiveUnit(value: number) {
  const wrapped = value % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
}
