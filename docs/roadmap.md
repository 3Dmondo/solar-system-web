# Roadmap

## Milestone 1: Foundation And Planet Showcase

- scaffold app and toolchain
- add test infrastructure
- build fullscreen scene shell
- add camera controls for desktop and mobile
- add mocked data provider
- render Saturn, Earth, and Moon
- support click and tap focus transitions

Current status:
The scaffold, documentation baseline, pnpm setup, and initial validation pipeline are complete. The current interaction layer includes body-specific focus targets, interruptible focus animation, overlap-safe selection, and tuned desktop/mobile orbit controls. Saturn now uses local texture assets for its surface and rings, with corrected ring-texture cropping, aligned sphere tilt, real shadow-capable lighting, and a shader-driven ring shadow on the planet with a softened terminator fade. Earth now also has an asset-based surface material pass plus a first cloud shell layer. The next action is visual inspection before continuing.

## Milestone 2: Saturn Rendering Pass

- ring geometry and materials
- ring shadows on Saturn
- Saturn shadow on rings
- improved lighting tuning

## Milestone 3: Earth And Moon Rendering Pass

- Earth texture support
- ocean specular highlights
- cloud layer
- Moon surface detail improvements

## Milestone 4: Quality Tiers

- configurable quality presets
- mobile-friendly fallbacks
- performance tuning

## Milestone 5: Time And Data Abstraction

- stabilize `BodyStateProvider`
- support fixed-time snapshots cleanly
- prepare import path for future generated ephemeris assets

## Milestone 6: Real Positions

- introduce offline-generated data assets
- integrate JPL/SPICE-derived body positions
- add time controls

## Milestone 7: Full Solar System Explorer

- broaden body catalog
- support broader navigation model
- add educational exploration features
