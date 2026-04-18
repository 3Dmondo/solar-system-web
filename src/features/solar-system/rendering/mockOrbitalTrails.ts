import { type BodyDefinition, type BodyId } from '../domain/body';

type MockOrbitalTrail = {
  bodyId: BodyId;
  center: [number, number, number];
  color: string;
  radius: number;
  verticalOffset: number;
};

const ORBIT_CENTER_BY_BODY: Partial<Record<BodyId, BodyId>> = {
  mercury: 'sun',
  venus: 'sun',
  earth: 'sun',
  moon: 'earth',
  mars: 'sun',
  jupiter: 'sun',
  saturn: 'sun',
  uranus: 'sun',
  neptune: 'sun'
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function fromRgb(r: number, g: number, b: number) {
  const toHex = (channel: number) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lightenHex(hex: string) {
  const color = toRgb(hex);
  return fromRgb(
    color.r * 0.4,
    color.g * 0.4,
    color.b * 0.4
  );
}

function getBodyMap(bodies: BodyDefinition[]) {
  return new Map(bodies.map((body) => [body.id, body]));
}

export function getMockOrbitalTrails(bodies: BodyDefinition[]): MockOrbitalTrail[] {
  const bodyMap = getBodyMap(bodies);

  return bodies.flatMap((body) => {
    const centerBodyId = ORBIT_CENTER_BY_BODY[body.id];

    if (!centerBodyId) {
      return [];
    }

    const centerBody = bodyMap.get(centerBodyId);

    if (!centerBody) {
      return [];
    }

    const radius = Math.hypot(
      body.position[0] - centerBody.position[0],
      body.position[2] - centerBody.position[2]
    );

    if (radius <= 0) {
      return [];
    }

    return [
      {
        bodyId: body.id,
        center: centerBody.position,
        color: lightenHex(body.color),
        radius,
        verticalOffset: body.position[1] - centerBody.position[1]
      }
    ];
  });
}

export function buildCircularTrailPoints(
  radius: number,
  verticalOffset: number,
  segments = 180
) {
  const points: Array<[number, number, number]> = [];

  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    points.push([Math.cos(angle) * radius, verticalOffset, Math.sin(angle) * radius]);
  }

  if (points.length > 0) {
    points.push([...points[0]!] as [number, number, number]);
  }

  return points;
}
