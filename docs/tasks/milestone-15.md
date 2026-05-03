# Milestone 15: Non-Spherical Moon Shapes

Status: Planned

## Start Point

Milestone 15 starts after Milestone 14's satellite texture and physical-metadata pass. The current deployed major-moon catalog still renders every moon as a sphere, even though `public/ephemeris/body-metadata.json` now includes generated shape fields and Milestone 14 documented NASA model availability for several irregular moons.

Milestone 14 identified Phobos and Deimos as the first non-spherical mesh candidates because their NASA GLTF assets are small enough for a focused prototype. Heavier moon models should stay documented until the first shape path proves orientation, scale, lighting, picking, and bundle impact.

## Goal

Add a production-ready non-spherical rendering path for selected irregular moons, starting with Phobos and Deimos, while preserving the existing shared material, focus, indicator, label, and trail behavior.

## Scope

- Prototype imported GLTF moon meshes for Phobos and Deimos using the NASA model inventory documented in Milestone 14.
- Keep spherical rendering as the fallback for every body without an approved runtime mesh.
- Use generated physical metadata radii and shape fields to validate mesh scale and focus behavior.
- Keep texture licensing and attribution aligned with the Milestone 14 NASA usage gate.
- Measure the bundle and runtime impact of committing or serving mesh assets through the static GitHub Pages build.
- Expand to additional selected moons only after the first two bodies pass visual and performance gates.

## Out Of Scope

- Adding new bodies to the generated ephemeris catalog.
- Replacing all moon spheres in one pass.
- Shipping large GLTF originals without size review.
- Adding terrain displacement, crater geometry synthesis, or procedural shape generation.
- Changing orbital data cadence or generated-data format.

## Candidate Shape Matrix

| Body | NASA model page | Milestone 14 GLTF size | First-pass decision |
| --- | --- | ---: | --- |
| Phobos | https://science.nasa.gov/resource/phobos-mars-moon-3d-model | 3.68 MB | Primary prototype |
| Deimos | https://science.nasa.gov/resource/deimos-mars-moon-3d-model/ | 1.53 MB | Primary prototype |
| Miranda | https://science.nasa.gov/resource/miranda-3d-model/ | 672.79 KB | Candidate after first path validates |
| Ariel | https://science.nasa.gov/resource/ariel-3d-model/ | 1.30 MB | Candidate after first path validates |
| Mimas | https://science.nasa.gov/resource/mimas-3d-model/ | 6.11 MB | Documented only until size and visual value justify it |
| Europa | https://science.nasa.gov/resource/europa-3d-model/ | 11.72 MB | Documented only |
| Tethys | https://science.nasa.gov/resource/tethys-3d-model/ | 14.72 MB | Documented only |
| Io | https://science.nasa.gov/resource/io-3d-model/ | 16.67 MB | Documented only |
| Enceladus | https://science.nasa.gov/resource/enceladus-3d-model/ | 17.10 MB | Documented only |
| Dione | https://science.nasa.gov/resource/dione-3d-model/ | 17.21 MB | Documented only |

## Checklist

### Phase 1: Asset Gate

- [ ] Re-check NASA model pages for Phobos and Deimos usage terms, credit lines, file formats, and any third-party restrictions.
- [ ] Record adopted mesh assets and processing notes in `assets/textures/ATTRIBUTION.txt` or a new nearby mesh attribution file.
- [ ] Choose the runtime mesh tier, including whether to use original GLTF, optimized GLB, Draco, Meshopt, or another static-friendly compression path.
- [ ] Keep source originals out of git unless explicitly approved.
- [ ] Document the exact conversion command for any optimized runtime asset.

### Phase 2: Runtime Mesh Path

- [ ] Add a body-shape asset registry that maps selected `BodyId` values to approved mesh assets without disturbing the texture registry.
- [ ] Add a mesh-loading path in `PlanetBody` or a dedicated child component while preserving the current material routing for textured and solid bodies.
- [ ] Apply the same world-space lighting behavior used by shared textured materials.
- [ ] Align imported mesh orientation with the existing physical pole and spin pipeline.
- [ ] Scale imported geometry so the rendered body matches the physical mean radius and remains compatible with focus distance, screen-space radius, labels, and indicators.
- [ ] Preserve raycasting and selection behavior for non-spherical bodies.

### Phase 3: Validation

- [ ] Focus Phobos and Deimos from overview and Mars-system views.
- [ ] Validate seams, orientation, poles, lighting direction, and self-rotation behavior.
- [ ] Confirm labels and indicators still appear at sensible distances.
- [ ] Confirm trails and parent-relative Mars-system framing are unchanged.
- [ ] Review production bundle output and static asset sizes after mesh adoption.
- [ ] Decide whether Miranda or Ariel should be added in the same milestone or deferred.

## Verification

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. Manual desktop and mobile focused-view checks for every mesh-backed moon
5. Browser console check for missing mesh, texture, or decoder assets
6. Bundle and static asset size review against the current GitHub Pages delivery budget

## Locked Decisions

- First implementation priority is Phobos and Deimos.
- Spherical rendering remains the default fallback.
- Mesh work must reuse the existing physical pole, spin, lighting, focus, and interaction contracts.
- Additional moon meshes are optional follow-ups gated by size, orientation confidence, and visible value.
- This milestone does not expand the body catalog.
