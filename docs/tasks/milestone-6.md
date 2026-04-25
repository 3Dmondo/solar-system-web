# Milestone 6 Task List

## Status

Planned

## Goal

Make bodies visible and selectable at all zoom levels, add essential UI controls (fullscreen, layer visibility), and lay the groundwork for future UI expansion.

## Current Repo Snapshot

- Milestone 5 is complete with real ephemeris-driven positions, simulation clock, physical alignment, and mobile-compatible world-space shaders.
- Bodies become invisible at far zoom levels when their screen-space radius drops below a few pixels.
- Body selection requires hitting the 3D mesh, which is impossible for sub-pixel bodies.
- The Sun has no special far-distance rendering.
- No fullscreen capability exists.
- No layer visibility controls exist.
- Trails are always visible with opacity varying by focus state.

## Agreed Milestone Direction

- Add body indicator billboards that appear automatically when bodies are too small to see.
- Make indicator billboards selectable with the same interaction model as body meshes (double-click/tap).
- Handle indicator overlap when distant bodies cluster by applying a radial spread algorithm.
- Add a Sun impostor with bloom post-processing for visibility from far distances.
- Blend smoothly between rendered Sun sphere and impostor based on screen-space radius.
- Add a collapsible layer visibility panel with toggles for trails and body indicators.
- Design the layer panel interface to accommodate future cinematic-scale toggle.
- Add a floating fullscreen button in the top-right corner.
- Verify body discovery and selection work correctly on both desktop and mobile.

## Progress Checklist

### Phase 1: Body Indicator Billboards

- [ ] 6.1.1 Create `BodyIndicator` component — camera-facing billboard rendered at body position with fixed screen-space diameter (8-12px), using body's presentation color and subtle glow effect.
- [ ] 6.1.2 Create `useScreenSpaceRadius` hook — compute body's on-screen radius in pixels each frame using camera projection; cache or batch calculations for performance.
- [ ] 6.1.3 Implement auto-threshold logic — show indicator billboard when body radius < ~4px on screen.
- [ ] 6.1.4 Make indicators selectable — add pointer event handlers (`onPointerDown`, `onDoubleClick`) matching `PlanetBody.tsx` pattern; ensure touch target is at least 44px for accessibility.
- [ ] 6.1.5 Create `useIndicatorSpread` hook — detect screen-space position overlaps and apply radial spread algorithm to offset overlapping indicators while maintaining selection accuracy.
- [ ] 6.1.6 Integrate body indicators into scene — render conditionally in `ExperienceScene.tsx` based on auto-threshold and layer visibility.

### Phase 2: Sun Impostor And Bloom

- [ ] 6.2.1 Create `SunImpostor` component — bright billboard sprite with radial gradient texture or shader for soft falloff.
- [ ] 6.2.2 Create `PostProcessing` component — add `EffectComposer` from `@react-three/postprocessing` with selective bloom effect.
- [ ] 6.2.3 Configure bloom for Sun impostor — use emissive threshold or layer mask; tune intensity to avoid washing out the scene.
- [ ] 6.2.4 Implement gradual blend — full sphere when Sun radius > ~20px, full impostor when < ~4px, opacity blend between thresholds.
- [ ] 6.2.5 Integrate Sun impostor into scene — both sphere and impostor can exist simultaneously; opacity controls which is visible.

### Phase 3: Layer Visibility Controls

- [ ] 6.3.1 Create `useLayerVisibility` hook — define layers (`trails`, `bodyIndicators`) with default visibility; design interface for future `labels` and `cinematicScale` layers.
- [ ] 6.3.2 Create `LayerPanel` component — collapsible floating panel with toggle switches; minimal footprint, collapsed by default, mobile-friendly touch targets.
- [ ] 6.3.3 Wire layer visibility to scene — conditionally render `<OrbitTrails>` based on `trails` layer; conditionally render indicators based on `bodyIndicators` layer.

### Phase 4: Fullscreen Button

- [ ] 6.4.1 Create `FullscreenButton` component — floating button using browser Fullscreen API (`document.documentElement.requestFullscreen`); handle API availability with graceful degradation.
- [ ] 6.4.2 Position and style — top-right floating corner; glassmorphic style consistent with existing HUD; toggle icon between enter/exit states; accessible focus states.

### Phase 5: Integration And Testing

- [ ] 6.5.1 Update `SolarSystemExperience.tsx` — orchestrate layer visibility hook, pass visibility to scene, render fullscreen button and layer panel.
- [ ] 6.5.2 Manual desktop verification — body indicators appear at correct threshold, indicators are selectable, overlapping indicators spread correctly, Sun impostor transitions smoothly with bloom, layer toggles work, fullscreen works.
- [ ] 6.5.3 Manual mobile verification — touch selection on indicators works, fullscreen works on supported browsers, layer panel is usable on small screens.
- [ ] 6.5.4 Unit tests — screen-space radius calculation, indicator overlap detection and spread, layer visibility state transitions, fullscreen state handling.

## Files To Create

- `src/features/solar-system/components/BodyIndicator.tsx` — billboard indicator component
- `src/features/solar-system/components/SunImpostor.tsx` — bright Sun impostor
- `src/features/solar-system/components/PostProcessing.tsx` — bloom effect wrapper
- `src/features/solar-system/hooks/useScreenSpaceRadius.ts` — screen-space size calculation
- `src/features/solar-system/hooks/useIndicatorSpread.ts` — overlap detection and spread algorithm
- `src/features/experience/components/LayerPanel.tsx` — collapsible layer visibility toggles
- `src/features/experience/components/FullscreenButton.tsx` — fullscreen toggle
- `src/features/experience/state/useLayerVisibility.ts` — layer state management

## Files To Modify

- `src/features/experience/SolarSystemExperience.tsx` — wire new state and components
- `src/features/experience/components/ExperienceScene.tsx` — conditional rendering based on layers, add PostProcessing
- `src/features/solar-system/components/OrbitTrails.tsx` — respect layer visibility
- `package.json` — add `@react-three/postprocessing` dependency
- `docs/architecture.md` — document new components

## Verification

1. **Visual threshold test**: Zoom out until Neptune disappears → verify indicator circle appears → verify clicking circle focuses Neptune.
2. **Indicator overlap test**: Zoom out far enough that outer planets cluster → verify indicators spread apart → verify clicking spread indicator still focuses correct body.
3. **Sun impostor test**: Focus on Neptune → verify Sun appears as bright impostor with bloom glow → zoom toward Sun → verify smooth transition to sphere.
4. **Layer toggle test**: Toggle off "Body indicators" → verify circles disappear → toggle off "Trails" → verify trails disappear.
5. **Fullscreen test**: Click fullscreen button → verify browser enters fullscreen → click again → verify exit.
6. **Mobile verification**: Repeat selection and fullscreen tests on touch device.
7. **Accessibility**: Keyboard navigation for fullscreen button; touch targets ≥ 44px for indicators.
8. **Automated tests**: `pnpm test` passes; new unit tests for hooks.

## Deferred To Later Milestones

- Body labels (may be added to layer panel when implemented)
- Cinematic scale toggle (M8 will add this to the layer panel)
- Reference frame controls (M7)
- Trail styling refinements (M7)
