# Minor Task: Period-Capped Trail Windows

Status: Complete

## Start Point

Fast satellites could render trails longer than one local orbit because `defaultTrailWindowDays` only accepted practical integer-looking values in the registry. Phobos was the clearest example: its orbital period is about `0.319` days, but its configured trail window was `1` day.

## Goal

Keep every configured trail time window no longer than the body's orbital period, while allowing fractional-day windows for fast satellites.

## Accepted Rule

- The Sun keeps `defaultTrailWindowDays: 0` and has no `orbitalPeriodDays`.
- Every planet and natural satellite has `orbitalPeriodDays` in the body registry.
- Every body with `orbitalPeriodDays` must satisfy `defaultTrailWindowDays <= orbitalPeriodDays`.
- Existing shorter windows remain unchanged unless they exceed one orbit.
- Trail sampling remains runtime-compatible with fractional day windows; no generated-data schema change is required.

## Closeout Notes

- Added `orbitalPeriodDays` to the registry and presentation metadata path.
- Capped Mercury, Venus, Mars, fast restored moons, and several major-moon trail windows to one orbit or less.
- Phobos now uses a fractional `0.31891` day trail window.
- Added registry invariant tests and an explicit fractional-day trail sampler regression.

## Verification

1. `pnpm test -- body.test.ts webEphemerisTrails.test.ts`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`
