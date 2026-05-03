# Bug: Focused View Sky Layers Flicker Between Frames

Status: Reported
Date: 2026-05-03

## Summary

When focused on a body, background stars and constellation lines can appear and disappear from one frame to another. The flicker is visible in the provided GIF capture and distracts from focused-body inspection.

## Environment

- App surface: Solar-system focused-body scene with stars and constellations enabled
- Browser/device: Unknown
- Route or URL: Local dev server
- Build/deploy context: Reproduced consistently on local dev server; not yet reproduced on the GitHub Pages deployment
- Relevant time or data state: Reproduced while focusing outer-planet moons; GIF shows a focused cratered gray moon with stars and constellation overlays visible

## Steps To Reproduce

1. Open the solar-system experience.
2. Focus an outer-planet moon so the camera enters focused-body mode.
3. Leave stars and constellations visible from the Layers panel.
4. Observe the background during the jump-to transition or while manually orbiting the camera with the mouse.
5. Stop moving the camera and observe the settled background state.

## Actual Behavior

During camera motion, including jump-to transitions and manual mouse orbiting, background stars and constellation segments pop in and out between adjacent frames. After the camera stops moving, the background becomes stable, but some stars and constellation lines remain missing. In the provided 120-frame GIF, the focused body and trail lines remain visually stable, while portions of the star and constellation background intermittently disappear and reappear.

## Expected Behavior

Stars and constellation overlays should remain stable, complete, and readable from frame to frame while focused on a body. They should not flicker, pop, or intermittently disappear during camera transitions, manual orbiting, or after the camera settles.

## Evidence

- Screenshots: User provided `.tmp/background-artifact.gif`.
- Frame inspection: The GIF was extracted locally into 120 frames under `.tmp/background-artifact-frames/` and contact sheets under `.tmp/background-artifact-sheets/`.
- User clarification: The trail lines are okay; the problem is the background stars and constellations appearing and disappearing frame-to-frame.
- User clarification: The effect is transient while the camera moves during a jump-to transition or manual mouse orbiting. Once camera movement stops, the background stabilizes, but some constellation lines and stars remain missing.
- User clarification: The issue is consistently reproducible when focusing outer-planet moons on the local dev server, but has not yet reproduced on the GitHub Pages deployment.
- Console/log output: Not inspected; none provided.
- Network/debug observations: Not inspected; none provided.
- Related files or code areas:
  - `src/features/experience/components/SkyLayer.tsx` keeps the sky group centered on the active camera and scales it from camera near/far clip planes each frame.
  - `src/features/experience/domain/skyLayer.ts` currently derives the sky shell radius as `far * 0.98` when possible.
  - `src/features/experience/components/ConstellationLines.tsx` renders all constellation segments as one additive `lineSegments` geometry with `depthWrite: false`, `frustumCulled: false`, and `renderOrder={-2}`.
  - `src/features/experience/components/StarField.tsx` renders the star catalog as additive points with `depthWrite: false`, `frustumCulled: false`, and `renderOrder={-1}`.
  - `src/features/experience/components/ExperienceScene.tsx` renders `SkyLayer` before trails, indicators, labels, the Sun impostor, and body meshes.

## Frequency And Scope

Consistently reproducible on the local dev server when focusing outer-planet moons. The transient flicker occurs while the camera moves during jump-to transitions or manual mouse orbiting. After the camera settles, the sky layers stop flickering, but some stars and constellation lines remain missing. The issue has not yet reproduced on the GitHub Pages deployment.

## Recent Changes

Recent sky-related architecture includes the real star-catalog sky layer, default-on constellation overlays, the Milky Way sky texture layer, and dynamic camera-centered sky-shell scaling. Milestone 14 primarily changed satellite textures and physical metadata, so any relationship to this artifact is unconfirmed.

## Suspected Area

Likely sky-layer rendering or focused-camera interaction with sky geometry in local development. A solver should isolate the star and constellation layers by toggling `Stars`, `Constellations`, and `Milky Way` individually while reproducing the focused view on outer-planet moons. Because the settled view remains stable but incomplete, also inspect whether camera movement or clip-plane/sky-shell updates leave the star and constellation geometry in a partially culled, depth-tested, or otherwise stale render state. Orbital trails are not the reported problem.

## Open Questions

- Which browser, device, viewport size, and route or deployment were used?
- Does the flicker disappear when only `Constellations`, only `Stars`, or only `Milky Way` is toggled off?
- Which outer-planet moons reproduce it most reliably?
- Is the local dev server running in normal Vite dev mode, preview mode, or another local serving mode?
- Are there any WebGL console warnings during the artifact?
