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
The scaffold, documentation baseline, pnpm setup, and initial validation pipeline are complete. The current interaction layer includes body-specific focus targets, interruptible focus animation, overlap-safe selection, double-activation body focus, tuned desktop/mobile orbit controls, and an in-app help overlay. Saturn now uses local texture assets for its surface and rings, with corrected ring-texture cropping, aligned sphere tilt, real shadow-capable lighting, a shader-driven ring shadow on the planet with a softened terminator fade, slow surface self-rotation, and a simplified custom ring-lighting/planet-occlusion pass with equal two-sided brightness and built-in ring shadow receiving disabled for now. Earth now has an asset-based surface material pass with day, night, cloud, specular, and normal-map support, using PNG exports for the specular and normal maps, a rotating cloud shell layer, a first ocean-specular pass through the local specular map, a light cloud-shadow term on the surface, slow surface self-rotation, and cloud/shadow motion derived from the planet rotation speed with a small Earth-linked cloud drift. Venus now uses the Solar System Scope surface map plus a semi-transparent cloud shell driven by the same reusable cloud-layer technique as Earth with Venus-specific transparency tuning. Moon now uses NASA SVS color and height-map assets for its surface pass, with a first displacement-style relief pass on denser Moon geometry. A first GitHub Pages deployment workflow is also configured. Milestone 1 is considered closed. Milestone 2 now includes a mocked Sun-centered overview with all planets plus the Moon, broader zoom-driven navigation, Sun-centered lighting for the general scene, a more orbit-like fixed arrangement across the ecliptic disk, local Solar System Scope texture maps for the Sun plus the remaining overview planets, a Milky Way star-sphere background, and mocked orbital trails for the planets plus the Moon. The shared Sun-direction convention has been corrected so Earth and Saturn are back on the same overview lighting model as the rest of the scene. The next action is the broader interaction and readability pass.

Follow-up issues carried from Milestone 1:

- improve planet texture rendering at the poles
- evaluate cube-sphere geometry as a future pole-artifact mitigation path
- evaluate shader/impostor techniques as an alternative path for pole handling and long-term rendering flexibility

## Milestone 2: Mocked Solar System Overview

- add Sun and all 8 planets in fixed mocked positions
- choose an overview-friendly mocked scale model
- render the whole system in one scene
- preserve focus transitions from overview to single-body view
- support returning cleanly from focused view back to overview
- add continuous self-rotation for all rendered planets
- add mocked orbital trails
- add star background rendering
- keep desktop and mobile navigation comfortable in both overview and focused modes

## Milestone 3: Solar System Interaction Pass

- improve body selection and navigation in the multi-body scene
- add clearer overview-to-focus camera choreography
- refine labels or minimal discovery aids if needed
- improve trail readability and background composition
- verify desktop and mobile interaction now that stars and trails are both present

## Milestone 4: Time And Data Abstraction

- stabilize `BodyStateProvider`
- support fixed-time snapshots cleanly
- prepare import path for future generated ephemeris assets

## Milestone 5: Real Positions

- introduce offline-generated data assets
- integrate JPL/SPICE-derived body positions
- add time controls
- replace mocked circular trails with sampled historical point sequences from the real ephemerides
- support trail windows such as “one past revolution around the Sun” for each body
- evaluate smoothing of sampled trail points into visually continuous curves where that improves readability

## Milestone 6: Reference Frames And Trail UX

- add reference-frame selection in the UI
- support Sun-centered and solar-system-barycenter views cleanly
- support planet-centered views for satellites and local systems
- draw satellite trails relative to their planet when that frame is active
- render trails as epicycles when the active frame is not the Sun or the solar-system barycenter
- design the more sophisticated controls needed to switch frame, trail window, and trail style without overwhelming the fullscreen experience

## Milestone 7: Quality And Rendering Improvements

- configurable quality presets if needed
- mobile-friendly fallbacks if future complexity requires them
- targeted rendering improvements beyond the current milestone 1 body passes
- resolve planet texture rendering artifacts near the poles

Potential solutions for pole rendering:

- cube-sphere geometry with compatible UV/material handling
- shader or impostor-based sphere rendering that avoids standard pole distortion

## Milestone 8: Full Solar System Explorer

- broaden body catalog
- support broader navigation model
- add educational exploration features
