import { describe, expect, it } from 'vitest';
import { renderDirectionToGalacticTextureUv, type UnitVector3 } from './milkyWayTextureCoordinates';

describe('milkyWayTextureCoordinates', () => {
  it('maps the galactic center render direction to the center of the NASA galactic texture', () => {
    const uv = renderDirectionToGalacticTextureUv(
      normalize([-0.054876, -0.096477, 0.993821])
    );

    expect(uv[0]).toBeCloseTo(0.5, 5);
    expect(uv[1]).toBeCloseTo(0.5, 5);
  });

  it('maps the north galactic pole to the top of the texture', () => {
    const uv = renderDirectionToGalacticTextureUv(
      normalize([-0.867666, 0.497147, 0.000352])
    );

    expect(uv[1]).toBeCloseTo(1, 5);
  });

  it('maps positive galactic longitude left of center because NASA longitude increases left', () => {
    const uv = renderDirectionToGalacticTextureUv(
      normalize([0.494109, 0.862286, 0.110991])
    );

    expect(uv[0]).toBeCloseTo(0.25, 5);
    expect(uv[1]).toBeCloseTo(0.5, 5);
  });
});

function normalize(vector: UnitVector3): UnitVector3 {
  const length = Math.hypot(...vector);
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}
