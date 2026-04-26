import {
  AdditiveBlending,
  Color,
  Vector3
} from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

/**
 * Frame transformation modes for trail rendering.
 * 0 = SSB (no transformation for planets, parent-relative for satellites)
 * 1 = Origin-centered (subtract origin position at each sample time)
 */
export type FrameMode = 0 | 1;

export type TrailLineMaterialParameters = {
  color?: Color | string | number;
  opacity?: number;
  linewidth?: number;
  frameMode?: FrameMode;
  isSatellite?: boolean;
  parentCurrentPosition?: Vector3;
  originCurrentPosition?: Vector3;
  glowIntensity?: number;
};

/**
 * Custom LineMaterial extension for GPU-accelerated trail transformation.
 *
 * Uses onBeforeCompile to inject custom vertex shader code that transforms
 * positions based on the reference frame. The transformation uses uniforms
 * that are updated per-frame rather than rebuilding geometry.
 *
 * For origin-centered frames (Earth-centered):
 * - Each trail vertex is offset by the frame origin's current position
 * - This gives a static cycloid shape (not time-accurate but visually correct)
 *
 * For SSB frame with satellites:
 * - Trail vertices are offset to orbit around parent's current position
 */
export class TrailLineMaterial extends LineMaterial {
  private _frameMode: FrameMode = 0;
  private _isSatellite = false;
  private _parentCurrentPosition = new Vector3();
  private _originCurrentPosition = new Vector3();
  private _boostedColor: Color;
  private _baseColor: Color;
  private _glowIntensity: number;

  constructor(parameters: TrailLineMaterialParameters = {}) {
    super();

    // Set up base properties
    this.transparent = true;
    this.depthWrite = false;
    this.blending = AdditiveBlending;
    this.linewidth = parameters.linewidth ?? 1.5;
    this.opacity = parameters.opacity ?? 1.0;
    this.toneMapped = false;

    // Handle color with glow intensity
    this._glowIntensity = parameters.glowIntensity ?? 1.2;
    this._baseColor = parameters.color instanceof Color
      ? parameters.color.clone()
      : new Color(parameters.color ?? 0xffffff);
    this._boostedColor = this._baseColor.clone().multiplyScalar(this._glowIntensity);
    this.color = this._boostedColor;

    // Initialize transform uniforms
    this._frameMode = parameters.frameMode ?? 0;
    this._isSatellite = parameters.isSatellite ?? false;
    if (parameters.parentCurrentPosition) {
      this._parentCurrentPosition.copy(parameters.parentCurrentPosition);
    }
    if (parameters.originCurrentPosition) {
      this._originCurrentPosition.copy(parameters.originCurrentPosition);
    }

    // Inject custom shader code
    this.onBeforeCompile = (shader) => {
      // Add custom uniforms
      shader.uniforms.uFrameMode = { value: this._frameMode };
      shader.uniforms.uIsSatellite = { value: this._isSatellite ? 1.0 : 0.0 };
      shader.uniforms.uParentCurrentPosition = { value: this._parentCurrentPosition };
      shader.uniforms.uOriginCurrentPosition = { value: this._originCurrentPosition };

      // Inject uniform declarations at the start of vertex shader
      shader.vertexShader = /* glsl */ `
        uniform float uFrameMode;
        uniform float uIsSatellite;
        uniform vec3 uParentCurrentPosition;
        uniform vec3 uOriginCurrentPosition;

        vec3 transformTrailPosition(vec3 pos) {
          if (uFrameMode > 0.5) {
            // Origin-centered frame: offset by origin's current position
            return pos - uOriginCurrentPosition;
          } else if (uIsSatellite > 0.5) {
            // SSB frame + satellite: offset to orbit around parent
            return pos - uOriginCurrentPosition + uParentCurrentPosition;
          }
          // SSB frame + planet: no transformation
          return pos;
        }
      ` + shader.vertexShader;

      // Replace position usage in the vertex shader
      // LineMaterial uses instanceStart and instanceEnd for line segments
      shader.vertexShader = shader.vertexShader.replace(
        'vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );',
        'vec4 start = modelViewMatrix * vec4( transformTrailPosition(instanceStart), 1.0 );'
      );
      shader.vertexShader = shader.vertexShader.replace(
        'vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );',
        'vec4 end = modelViewMatrix * vec4( transformTrailPosition(instanceEnd), 1.0 );'
      );

      // Store shader reference for uniform updates
      (this as TrailLineMaterialWithShader)._shader = shader;
    };

    this.needsUpdate = true;
  }

  get frameMode(): FrameMode {
    return this._frameMode;
  }

  set frameMode(value: FrameMode) {
    this._frameMode = value;
    const shader = (this as TrailLineMaterialWithShader)._shader;
    if (shader?.uniforms.uFrameMode) {
      shader.uniforms.uFrameMode.value = value;
    }
  }

  get isSatellite(): boolean {
    return this._isSatellite;
  }

  set isSatellite(value: boolean) {
    this._isSatellite = value;
    const shader = (this as TrailLineMaterialWithShader)._shader;
    if (shader?.uniforms.uIsSatellite) {
      shader.uniforms.uIsSatellite.value = value ? 1.0 : 0.0;
    }
  }

  get parentCurrentPosition(): Vector3 {
    return this._parentCurrentPosition;
  }

  set parentCurrentPosition(value: Vector3) {
    this._parentCurrentPosition.copy(value);
    const shader = (this as TrailLineMaterialWithShader)._shader;
    if (shader?.uniforms.uParentCurrentPosition) {
      (shader.uniforms.uParentCurrentPosition.value as Vector3).copy(value);
    }
  }

  get originCurrentPosition(): Vector3 {
    return this._originCurrentPosition;
  }

  set originCurrentPosition(value: Vector3) {
    this._originCurrentPosition.copy(value);
    const shader = (this as TrailLineMaterialWithShader)._shader;
    if (shader?.uniforms.uOriginCurrentPosition) {
      (shader.uniforms.uOriginCurrentPosition.value as Vector3).copy(value);
    }
  }

  get glowIntensity(): number {
    return this._glowIntensity;
  }

  set glowIntensity(value: number) {
    this._glowIntensity = value;
    this._boostedColor = this._baseColor.clone().multiplyScalar(value);
    this.color = this._boostedColor;
  }
}

type TrailLineMaterialWithShader = TrailLineMaterial & {
  _shader?: { uniforms: Record<string, { value: unknown }> };
};
