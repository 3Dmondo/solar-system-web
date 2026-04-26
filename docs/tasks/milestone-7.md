# Milestone 7: Reference Frames And Trail UX

Status: In Progress

## Overview

Add reference frame selection (Solar System Barycenter / Earth-centered) that transforms all body positions and trails, with satellite trails always shown parent-relative. Replace the current trail rendering with glowing lines using additive blending. Use background prefetch to extend outer planet trail history.

## Goals

- Add reference-frame selection with two initial options: Solar System Barycenter (SSB) and Earth-centered
- Design the reference frame system to be extensible for future body-centered frames
- Keep reference frame selection independent from focus/overview modes
- Transform all body positions to the selected frame (e.g., Earth at origin when Earth-centered)
- Render satellite trails (Moon) always parent-relative, regardless of selected frame
- Replace trail rendering with glowing lines using additive blending for soft glow effect
- Extend trail history further into the past for outer planets via background chunk prefetch

## Key Design Decisions

1. **Reference frame selection independent of focus**: Focusing on Saturn while in Earth-centered mode tracks Saturn's transformed position; the camera follows Saturn in Earth-relative coordinates.

2. **Satellite trails always parent-relative**: The Moon's trail always shows its orbit around Earth, regardless of whether SSB or Earth-centered frame is selected. This is achieved by computing trail positions relative to the parent body.

3. **Scene-space transformation**: Position transformation is applied after loading the catalog (in scene coordinates) rather than in the ephemeris provider. This keeps the transformation reactive to frame selection changes.

4. **True SSB data**: The ephemeris data uses true solar system barycenter (NAIF ID 0) as the center, not Sun-centered.

5. **No trail window controls**: Trail appearance is tuned via code rather than exposed as user controls. Glow intensity and opacity are adjusted for visual quality.

## Implementation Checklist

### Phase 1: Reference Frame State & Transformation Layer

- [x] Define reference frame types (`ReferenceFrameId`, `ReferenceFrame`) with SSB and Earth options
- [x] Create `useReferenceFrame` hook for managing selected frame state
- [x] Add `transformCatalogToFrame` utility for scene-space position transformation
- [x] Integrate transformation into `SolarSystemExperience` via `useMemo`
- [x] Unit tests for transformation utilities (16 test cases)

### Phase 2: Satellite Parent-Relative Trails & Time-Based Trail Sampling

- [x] Leverage existing `isSatellite` and `getParentBody` helpers from body.ts
- [x] Implement `computeSatelliteTrailAroundParent` for SSB frame
- [x] Implement `transformTrailsForSatellitesInFrame` for body-centered frames
- [x] Add `sampleRelativeTrailAtTdbTime` for time-based relative trail computation
- [x] Thread `trailOriginBodyId` through provider chain (`LoadSnapshotOptions` → `LoadCatalogOptions`)
- [x] Compute trail positions relative to origin body at each sample time (not just current time)
- [x] Satellite trails show orbit around parent regardless of frame selection
- [x] Unit test coverage for satellite trail positioning

### Phase 3: Glowing Trail Rendering

- [x] Create `GlowingTrailLine` component with additive blending
- [x] Boost color intensity for bloom post-processing contribution
- [x] Replace `Line` usage in `OrbitTrails` with `GlowingTrailLine`
- [x] Tune trail opacity for better visibility (overview: 0.35, focused: 0.65)

### Phase 4: Reference Frame UI Control

- [x] Create `ReferenceFrameSelector` floating component
- [x] Style selector with glassmorphic design matching layer panel
- [x] Position selector above layer panel on the right side
- [x] Integrate selector into `SolarSystemExperience`

### Phase 5: Performance Optimization & Extended Trail History

- [x] Trail epoch quantization (100ms) to prevent per-frame recomputation
- [x] Cached relative trail sampler with pre-computed interior positions
- [x] Satellite trails computed parent-relative at provider level
- [x] Fixed different sample rate handling (Moon vs Earth)
- [x] Removed per-frame useFrame blending check in GlowingTrailLine
- [ ] Extend `prefetchAroundUtc` to load chunks further into the past
- [ ] Increase LRU cache capacity from 4 to 6-8 chunks
- [ ] Review outer planet trail window defaults

## Files Changed

### New Files

- `src/features/solar-system/domain/referenceFrame.ts` — Reference frame type definitions and helpers
- `src/features/experience/state/useReferenceFrame.ts` — Frame selection state hook
- `src/features/solar-system/data/referenceFrameTransform.ts` — Position transformation utilities
- `src/features/solar-system/data/referenceFrameTransform.test.ts` — Unit tests for transformation
- `src/features/solar-system/components/GlowingTrailLine.tsx` — Glowing trail line component
- `src/features/experience/components/ReferenceFrameSelector.tsx` — UI selector component
- `src/features/experience/components/reference-frame-selector.css` — Selector styles
- `src/features/solar-system/rendering/trailShaderMaterial.ts` — Custom LineMaterial for GPU trail transformation (prepared for future use)

### Modified Files

- `src/features/experience/SolarSystemExperience.tsx` — Hook integration and transformation wiring
- `src/features/solar-system/components/OrbitTrails.tsx` — Switch to GlowingTrailLine
- `src/features/solar-system/components/GlowingTrailLine.tsx` — One-time material setup (removed per-frame blending check)
- `src/features/solar-system/data/webEphemerisTrails.ts` — Added `createRelativeTrailSampler` with cached interior positions; handles different sample rates
- `src/features/solar-system/domain/body.ts` — Added `LoadSnapshotOptions` type
- `src/features/solar-system/data/webEphemerisProvider.ts` — Trail epoch quantization, cached samplers, satellite parent-relative sampling
- `src/features/solar-system/data/bodyStateStore.ts` — Added `LoadCatalogOptions` type
- `src/features/solar-system/data/webBodyCatalogSource.ts` — Passes `trailOriginBodyId` to provider
- `src/features/experience/state/useResolvedBodyCatalog.ts` — Accepts `LoadCatalogOptions` parameter

## Verification

1. `pnpm test` passes with 126 tests including 16 transformation tests
2. `pnpm build` completes without errors
3. Visual verification:
   - SSB frame shows elliptical orbits
   - Earth frame shows cycloid-like retrograde loops for outer planets (not ellipses)
   - Mars shows proper retrograde loops in Earth-centered view
   - Moon trail always shows orbit around Earth in both frames
   - Trails glow with additive blending
4. UI verification:
   - Reference frame selector appears and works on desktop/mobile
   - Frame switch updates scene smoothly
5. Focus interaction:
   - Camera tracks bodies correctly in transformed coordinates

## Technical Notes

### Time-Based Relative Trail Sampling

The original approach of subtracting the origin body's current position from all trail points only produces correct shapes for the SSB frame. For Earth-centered view to show proper cycloid/retrograde shapes, each trail point must be computed relative to the origin body's position at that sample's time, not the current time.

This is implemented via `sampleRelativeTrailAtTdbTime` which:
1. Takes the origin body ID and sample times
2. For each sample time, interpolates both the target body and origin body positions
3. Computes the difference, yielding proper cycloid shapes in non-inertial frames

### Performance Optimizations

The initial implementation had severe performance issues in Earth-centered mode (60fps → 15fps) due to:
1. **Per-frame trail recomputation**: 2000+ Hermite interpolations every frame
2. **Uncached relative samplers**: Creating new sampler objects repeatedly
3. **Per-frame blending checks**: useFrame hook running every frame

The optimizations implemented:
1. **Trail epoch quantization**: Trails only regenerate every 100ms via `trailQuantizationSeconds`. Movement at solar system scale is imperceptible at this interval.
2. **Cached relative trail sampler**: `createRelativeTrailSampler` pre-computes and caches interior sample positions. Only start/end points require fresh interpolation.
3. **Interior position caching**: `interiorPositionsByRangeKey` Map caches sliced arrays by range, avoiding repeated allocations.
4. **Parent-relative satellite sampling**: Provider computes satellite trails relative to parent at sample time, not current time. Transform layer just adds parent's current position.
5. **Different sample rate handling**: Bodies have different sample rates (Moon has ~1306 samples, Earth has fewer). Origin positions are interpolated at target body's sample times when counts differ.
6. **One-time material setup**: Removed useFrame hook from GlowingTrailLine; blending configured once via useEffect.

### Modified Files

- `src/features/solar-system/data/webEphemerisTrails.ts` — Added `sampleRelativeTrailAtTdbTime`
- `src/features/solar-system/domain/body.ts` — Added `LoadSnapshotOptions` type
- `src/features/solar-system/data/webEphemerisProvider.ts` — Uses relative trail sampler when origin specified
- `src/features/solar-system/data/bodyStateStore.ts` — Added `LoadCatalogOptions` type
- `src/features/solar-system/data/webBodyCatalogSource.ts` — Passes `trailOriginBodyId` to provider
- `src/features/experience/state/useResolvedBodyCatalog.ts` — Accepts `LoadCatalogOptions`
- `src/features/experience/SolarSystemExperience.tsx` — Passes frame origin to catalog hook

## Deferred

- Extended chunk prefetch for outer planet trail history (Phase 5)
- Tail-fade treatment for trails
- Reverse playback (separate milestone)
- Explicit date picking (separate milestone)
