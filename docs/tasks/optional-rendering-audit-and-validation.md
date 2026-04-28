# Optional Milestone: Rendering Audit And Validation

Status: Optional Backlog

## Goal

Close the rendering validation work deferred from Milestone 10 without blocking the Milestone 11 catalog expansion. This milestone is optional because the shipped Milestone 10 scope already delivered the trail-rendering refinement and production build check.

## Scope

- Verify the new ribbon trails in overview and focused views.
- Audit visible pole artifacts across the Sun, all 8 planets, and the Moon.
- Apply targeted pole-artifact fixes only after affected bodies and material paths are confirmed.
- Use `/debug` to check rendering behavior with updated trails visible.
- Add mobile fallbacks only if measured or manual testing shows a real issue.

## Out Of Scope

- Catalog expansion or new body registry work.
- New sky-layer features or brightness controls.
- New user-facing rendering controls beyond existing layer toggles.
- Cube-sphere rewrites unless the audit shows smaller fixes are insufficient.

## Checklist

### Phase 1: Trail Readability Validation

- [ ] Verify overview trails are readable without overpowering bodies.
- [ ] Verify focused-body trails keep the same visual character as overview trails.
- [ ] Confirm SSB and Earth-centered reference frames still render correct trail shapes.
- [ ] Confirm the existing `trails` layer toggle behavior remains unchanged.

### Phase 2: Pole Artifact Audit

- [ ] Inspect the Sun, all planets, and the Moon in overview and focused views.
- [ ] Record which bodies show visible pole artifacts.
- [ ] Record which material path each affected body uses.
- [ ] Check whether artifacts come from geometry density, texture UV behavior, shader sampling, bump or normal mapping, cloud shells, or rings.
- [ ] Prioritize fixes by visible impact.

### Phase 3: Targeted Mitigation

- [ ] Apply local material, shader, texture-coordinate, or geometry-segment fixes for confirmed high-impact artifacts.
- [ ] Re-evaluate cube-sphere or shader-only alternatives only if smaller fixes are not enough.
- [ ] Confirm fixes do not introduce texture seams, lighting regressions, or mobile rendering inconsistencies.

### Phase 4: Performance And Mobile Check

- [ ] Check `/debug` with updated trails visible in overview.
- [ ] Check `/debug` with updated trails visible in at least one focused-body view.
- [ ] Add mobile fallbacks only if measured or manual testing shows a real issue.

## Verification

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. Manual visual checks:
   - overview and focused trails are stable, readable, and not overpowering
   - pole artifacts are reduced on affected bodies without new seams or lighting regressions
   - `/debug` remains smooth with updated trails visible
   - mobile viewport remains usable

## Locked Decisions

- This milestone is optional and unnumbered.
- Milestone 11 can proceed before this work is scheduled.
- Trail target remains stable ribbon-style trails, not beaded rings or 3D tubes.
- Pole-artifact fixes should start with the smallest confirmed mitigation.
