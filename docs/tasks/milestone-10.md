# Milestone 10: Rendering And Performance Refinement

Status: Complete

## Goal

Refine the rendering stack after the sky-catalog milestone by improving orbital trail presentation. The shipped scope focused on trail stability and build impact; the broader pole-artifact audit and deeper `/debug` visual validation are deferred to the optional rendering audit milestone.

## Scope

- Make orbital trails thicker and more stable while preserving the existing sampled positions, trail windows, reference-frame behavior, and layer visibility.
- Defer pole-artifact audit and mitigation to the optional rendering audit milestone.
- Defer deeper `/debug` visual validation to the optional rendering audit milestone.

## Delivered

- Trail rendering now uses constant-width opaque screen-space ribbons with consistent overview and focused-view appearance.
- Trail sampling now resamples from the existing Hermite interpolation path with per-body cadence multipliers.
- Ready previous chunks are stitched into trail history so long trail windows are not capped by the active chunk start after prefetch warms the cache.
- Production build output was reviewed for bundle-size regressions.

## Out Of Scope

- Star brightness, star point-size, constellation validation, and other sky-layer refinements.
- New user-facing rendering controls beyond the existing layer toggles.
- Beaded trail markers or 3D tube trails.
- A cube-sphere rewrite unless the audit shows smaller fixes are insufficient.

## Checklist

### Phase 1: Trail Rendering

- [x] Review the current `GlowingTrailLine` and prepared trail material seams before adding new rendering infrastructure.
- [x] Tune trails into screen-space-stable ribbons without additive hot spots at sampled point joins.
- [x] Preserve current trail data flow, trail windows, reference-frame behavior, and layer visibility.
- [x] Make trail sampling cadence configurable per body and independent from source ephemeris cadence.
- [x] Regenerate trails across ready previous chunks so long trail windows are not capped by the active chunk start.
- [x] Keep the `trails` layer toggle behavior unchanged.
- [x] Keep trail appearance consistent between overview and focused views.
- [ ] Verify overview and focused views keep trails readable without overpowering bodies. (Deferred to optional rendering audit milestone.)

### Phase 2: Pole Artifact Audit

- [ ] Inspect the Sun, all planets, and the Moon in overview and focused views.
- [ ] Record which bodies show visible pole artifacts and which material path each affected body uses.
- [ ] Check whether artifacts are caused by geometry density, texture UV behavior, shader sampling, bump or normal mapping, cloud shells, or rings.
- [ ] Prioritize fixes by visible impact.

Deferred to optional rendering audit milestone.

### Phase 3: Pole Artifact Mitigation

- [ ] Apply targeted fixes for confirmed high-impact artifacts.
- [ ] Prefer local material, shader, texture-coordinate, or geometry-segment changes before larger geometry rewrites.
- [ ] Re-evaluate cube-sphere or shader-only alternatives only if smaller fixes are not enough.
- [ ] Confirm fixes do not introduce texture seams, lighting regressions, or mobile rendering inconsistencies.

Deferred to optional rendering audit milestone.

### Phase 4: Performance And Bundle Check

- [ ] Capture `/debug` behavior before and after the trail rendering change.
- [ ] Check `/debug` with updated trails visible in overview and at least one focused-body view.
- [x] Review production build output for bundle-size regressions.
- [ ] Add mobile fallbacks only if measured or manual testing shows a real issue.

Remaining unchecked items are deferred to optional rendering audit milestone.

### Phase 5: Docs And Closeout

- [x] Update `docs/architecture.md` if rendering behavior changes.
- [x] Update `docs/roadmap.md` when the milestone status or delivered behavior changes.
- [x] Record any deferred rendering work explicitly instead of implying it is complete.

## Deferred

Tracked in `docs/tasks/optional-rendering-audit-and-validation.md`:

- manual overview and focused-view trail readability checks
- pole-artifact audit across the Sun, planets, and Moon
- targeted pole-artifact mitigation if the audit confirms high-impact issues
- deeper `/debug` behavior checks with updated trails visible
- mobile rendering fallbacks only if measured or manual validation shows a real issue

## Verification

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. Manual visual check:
   - overview trails are thicker, stable, readable, and not overpowering
   - focused-body and overview modes keep the same trail appearance
   - SSB and Earth-centered reference frames still render correct trail shapes
   - existing layer toggles still behave correctly for touched rendering paths
   - pole artifacts are reduced on affected bodies without new seams or lighting regressions
   - `/debug` remains smooth with updated trails visible
   - mobile viewport remains usable

## Locked Decisions

- Trail target: stable ribbon-style trails, not beaded rings or 3D tubes.
- Pole-artifact scope: all spherical bodies are in scope after an audit.
- Controls scope: no new user-facing rendering controls beyond existing layer toggles.
- Sky scope: stars and constellations are out of scope.
