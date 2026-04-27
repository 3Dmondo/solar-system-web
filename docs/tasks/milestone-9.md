# Milestone 9: Sky Catalog And Rendering Controls

Status: Complete

## Goal

Replace the decorative star texture sphere with a real star catalog rendered as point primitives, add optional constellation line overlays, and introduce a minimized rendering-configuration UI.

## Data Sources

### Star Catalog: HYG v4.2

- License: CC BY-SA 4.0
- Source: https://codeberg.org/astronexus/hyg
- Filter: magnitude ≤ 6.5 (~9,100 naked-eye visible stars)
- Fields: RA, Dec, magnitude, spectral type, proper name
- Estimated size: ~200-400 KB JSON, ~80-150 KB gzipped

### Constellation Lines: d3-celestial

- License: BSD-3-Clause
- Source: https://github.com/ofrohn/d3-celestial
- Format: GeoJSON with IAU-standard constellation lines
- Coordinate conversion: degrees [-180..180] → J2000 Cartesian

## Checklist

### Phase 1: Data Preparation

- [x] Download HYG v4.2 and filter to magnitude ≤ 6.5
- [x] Convert filtered stars to optimized JSON format
- [x] Create `public/stars/catalog.json`
- [x] Extract d3-celestial constellation lines as a starting reference
- [x] Convert to app coordinate system
- [x] Create `public/stars/constellations.json`
- [x] Add deterministic `scripts/Convert-ConstellationLines.ps1` regeneration workflow
- [x] Create `public/stars/ATTRIBUTION.txt`

### Phase 2: Star Rendering

- [x] Create `src/features/solar-system/domain/starCatalog.ts` with types and loader
- [x] Create `src/features/experience/components/StarField.tsx`
- [x] Implement magnitude-based size and brightness shader
- [x] Apply J2000-to-render-frame transform
- [x] Add optional spectral-type color tinting

### Phase 3: Constellation Lines

- [x] Create `src/features/experience/components/ConstellationLines.tsx`
- [x] Use `THREE.LineSegments` with subtle styling
- [x] Add 'constellations' to `LayerId` union type
- [x] Wire toggle through `useLayerVisibility`
- [x] Add toggle to `LayerPanel`

### Phase 4: Rendering Controls UI

- [x] Extend `LayerPanel` rather than add a new panel
- [x] Add star visibility toggle
- [x] Add constellation lines toggle
- [ ] Add star brightness preset control (Deferred to Milestone 10)
- [x] Keep controls usable on mobile-sized layouts

### Phase 5: Integration

- [x] Remove legacy `StarBackground.tsx` and `starBackground.ts`
- [x] Update `ExperienceScene.tsx` to use new components
- [x] Visual verification: recognizable star patterns across the curated set
- [ ] Performance validation at `/debug` route (Deferred to Milestone 10)
- [ ] Cross-browser testing (Deferred to Milestone 10)
- [x] Update `docs/architecture.md`

## Current State

- The decorative sky texture has been replaced with a real star field sourced from HYG v4.2.
- Stars render from `public/stars/catalog.json` and constellations render from a curated `public/stars/constellations.json` dataset regenerated from d3-celestial source geometry.
- The sky layer now uses a shared camera-centered anchor with clip-plane-aware shell scaling, while star and constellation positions remain precomputed.
- The current catalog contains 8,920 stars and 34 curated constellation figures.

## Deferred Follow-up

- Refine star brightness and point-size tuning for better readability in overview mode.
- Continue validating sky-layer stability during fast focus transitions and wide overview zoom ranges.
- Continue validating constellation stick figures against recognizable sky patterns.
- Add a user-facing star brightness control if the default tuning still feels too faint or too aggressive.
- Re-run manual performance checks with constellations enabled on lower-powered devices.

## Verification

1. `pnpm test`
2. `pnpm build`
3. Manual visual check in the running scene for star visibility and constellation readability
4. Manual performance check with constellation lines enabled

## Files

### New

- `public/stars/catalog.json`
- `public/stars/constellations.json`
- `public/stars/ATTRIBUTION.txt`
- `scripts/Convert-ConstellationLines.ps1`
- `src/features/solar-system/domain/starCatalog.ts`
- `src/features/experience/components/StarField.tsx`
- `src/features/experience/components/ConstellationLines.tsx`
- `src/features/experience/components/SkyLayer.tsx`
- `src/features/experience/domain/skyLayer.ts`
- `src/features/experience/domain/skyLayer.test.ts`

### Modified

- `src/features/experience/components/ExperienceScene.tsx`
- `src/features/experience/state/useLayerVisibility.ts`
- `src/features/experience/components/LayerPanel.tsx`
- `docs/architecture.md`
- `docs/roadmap.md`

### Removed

- `src/features/experience/components/StarBackground.tsx`
- `src/features/experience/rendering/starBackground.ts`
