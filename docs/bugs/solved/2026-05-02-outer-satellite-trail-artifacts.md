# Bug: Outer Satellite Trail Artifacts

Status: Resolved
Date: 2026-05-02

## Summary

Trail artifacts are occasionally visible for some bodies and appear systematically reproducible for satellites of the outer planets. The provided animation shows a moving artifact near Umbriel, where a thin trail segment persists through the animation as an incorrect straight line near or through the body instead of following the expected local satellite orbit.

## Environment

- App surface: Orbital trail rendering for generated ephemeris bodies
- Browser/device: Unknown
- Route or URL: Main solar-system experience; exact route unknown
- Build/deploy context: After Milestone 11 reduced major-moon deployment and Milestone 10 trail-rendering changes; exact branch, commit, and local/deployed context unknown
- Relevant time or data state: Unknown; evidence animation is stored locally at `C:\Dev\repos\3Dmondo\solar-system-web\.tmp\trail-artifact-2.gif`

## Steps To Reproduce

1. Open the solar-system experience with orbital trails and satellites enabled.
2. Focus or inspect an outer-planet satellite, with Umbriel as a known repro candidate.
3. Observe the satellite trail while orbiting, zooming, or letting the simulation advance.

## Actual Behavior

The satellite trail can show an incorrect straight artifact segment near the body. In the provided Umbriel animation, a vertical-looking trail segment cuts through or very near the body instead of rendering only the expected local orbital path.

## Expected Behavior

Satellite trails should remain visually stable and continuous around their parent planet, without stray straight segments, jumps, or lines that pass through the body unless the actual sampled orbit does so.

## Evidence

- Screenshots/animation: `C:\Dev\repos\3Dmondo\solar-system-web\.tmp\trail-artifact-2.gif`; all `138` frames were extracted into a contact sheet at `C:\Dev\repos\3Dmondo\solar-system-web\.tmp\trail-artifact-2-contact-sheet.png`, showing Umbriel with a persistent straight trail artifact that moves over time.
- Console/log output: Unknown
- Network/debug observations: Unknown
- Related files or code areas:
  - `src/features/solar-system/components/OrbitTrails.tsx`
  - `src/features/solar-system/components/GlowingTrailLine.tsx`
  - `src/features/solar-system/data/webEphemerisProvider.ts`
  - `src/features/solar-system/data/webEphemerisTrails.ts`
  - `src/features/solar-system/data/ephemerisSceneMapping.ts`
  - `src/features/solar-system/data/referenceFrameTransform.ts`
  - `src/features/solar-system/rendering/trailShaderMaterial.ts`

## Frequency And Scope

Reported as occasional for bodies in general and systematically reproducible for satellites of outer planets. Umbriel is the concrete observed example. Other Uranus, Neptune, Saturn, or Jupiter satellites should be checked to determine whether the issue scales with parent distance from the scene origin.

## Recent Changes

Milestone 10 changed trails to constant-width screen-space ribbons. Milestone 11 added the reduced major-moon catalog and parent-relative satellite trail behavior, including outer-planet satellites such as Umbriel, Titania, Oberon, Triton, and selected Saturn and Jupiter moons.

## Suspected Area

Possible floating-point precision issue in the trail rendering path. The provider samples satellite trails relative to the parent by default, but the scene/frame transform later offsets those small local trail coordinates by the parent body's current world position. For outer-planet systems, this can place small satellite-orbit deltas on top of very large absolute scene coordinates before the `Line`/fat-line shader projects them, which may expose GPU `float` precision or camera-relative cancellation artifacts in focused views.

Other possibilities to verify include incorrect chunk stitching at trail segment boundaries, stale cached trail samples around chunk transitions, or an unintended double transform between parent-relative sampling and frame-specific trail transforms.

## Closeout

Root cause: Confirmed rendering precision issue in the `GlowingTrailLine` path. Satellite trail samples were correctly generated parent-relative, but `referenceFrameTransform` expanded them back onto the parent planet's large scene-space position before `@react-three/drei`/Three fat-line geometry received the points. For outer-planet satellites such as Umbriel, that put very small local orbit deltas into large absolute geometry attributes, making the screen-space line shader vulnerable to float precision loss and stray straight segments in focused views.

Fix summary: Trail line geometry is now anchored near its own sampled path. `GlowingTrailLine` sends local delta points to the fat-line geometry and applies the averaged path position as the line object's transform, preserving world placement while keeping GPU line attributes small.

Changed files:

- `src/features/solar-system/components/GlowingTrailLine.tsx`
- `src/features/solar-system/rendering/trailLineGeometry.ts`
- `src/features/solar-system/rendering/trailLineGeometry.test.ts`
- `docs/bugs/solved/2026-05-02-outer-satellite-trail-artifacts.md`

Verification:

- Inspected `C:\Dev\repos\3Dmondo\solar-system-web\.tmp\trail-artifact-2-contact-sheet.png` and confirmed the reported Umbriel straight-segment artifact shape.
- `pnpm test -- src/features/solar-system/rendering/trailLineGeometry.test.ts` passed after rerunning outside the sandbox because Vitest/esbuild hit `spawn EPERM` in the sandbox.
- `pnpm build` passed.
- `pnpm lint` passed with one pre-existing warning in `src/features/solar-system/components/SunImpostor.tsx`.
- `pnpm test` passed: 36 files, 176 tests.
- User confirmed the visual fix after inspection.

Remaining risks or follow-ups:

- The separate saved report for focused outer-planet trail gaps remains open and was not addressed by this fix.

## Open Questions

- Which exact bodies reproduce besides Umbriel?
- Does the artifact appear only in SSB frame, only in parent-centered frames, or both?
- Does it correlate with focused view, overview zoom-in, playback speed, chunk boundaries, or camera orbit angle?
- Is the artifact visible on all browsers/devices or only on specific GPU/browser combinations?
- Does disabling/re-enabling the trails layer or changing the reference frame clear the artifact?
