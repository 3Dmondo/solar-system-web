# Milestone 15: Non-Spherical Moon Shapes

Status: Complete

## Start Point

Milestone 15 started after Milestone 14's satellite texture and physical-metadata pass. At that point the deployed major-moon catalog still rendered every moon as a sphere, even though `public/ephemeris/body-metadata.json` already included generated shape fields and Milestone 14 documented NASA model availability for several irregular moons.

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

- [x] Re-check NASA model pages for Phobos and Deimos usage terms, credit lines, file formats, and any third-party restrictions.
- [x] Record adopted mesh assets and processing notes in `assets/textures/ATTRIBUTION.txt` or a new nearby mesh attribution file.
- [x] Choose the runtime mesh tier, including whether to use original GLTF, optimized GLB, Draco, Meshopt, or another static-friendly compression path.
- [x] Keep source originals out of git unless explicitly approved.
- [x] Document the exact conversion command for any optimized runtime asset.

Phase 1 note, 2026-05-03:

- NASA model pages still list Phobos and Deimos glTF downloads dated Mar 8, 2024, with `NASA/JPL-Caltech` credit lines and no visible third-party copyright marking.
- NASA media guidance covers texture maps and polygon data used in 3D model renditions, permits use in computer graphical simulations and Internet web pages, requires NASA/source acknowledgement, and forbids implied endorsement.
- Mesh attribution and processing notes now live in `assets/meshes/ATTRIBUTION.txt`.
- Runtime tier is optimized local GLB served from `public/meshes/`, with no Draco or Meshopt decoder dependency in the first pass.
- NASA source originals remain out of git; runtime GLB assets are committed only after the optimized asset review.

### Phase 2: Runtime Mesh Path

- [x] Add a body-shape asset registry that maps selected `BodyId` values to approved mesh assets without disturbing the texture registry.
- [x] Add a mesh-loading path in `PlanetBody` or a dedicated child component while preserving the current material routing for textured and solid bodies.
- [x] Apply the same world-space lighting behavior used by shared textured materials.
- [x] Align imported mesh orientation with the existing physical pole and spin pipeline.
- [x] Scale imported geometry so the rendered body matches the physical mean radius and remains compatible with focus distance, screen-space radius, labels, and indicators.
- [x] Preserve raycasting and selection behavior for non-spherical bodies.

Phase 2 registry note, 2026-05-03:

- Added `bodyShapeAssets.ts` as a separate shape registry from `bodyTextures.ts`.
- The first approved runtime targets are `phobos -> /meshes/phobos.glb` and `deimos -> /meshes/deimos.glb`.
- Rendering uses the mesh path for Phobos and Deimos after reviewed GLB files are added and their registry entries are marked runtime-ready.

Phase 2 loading note, 2026-05-03:

- Added `IrregularBodyMesh` as the GLB loading component using Three's `GLTFLoader`.
- Added `BodySurfaceMaterial` so sphere and mesh-backed bodies share the same existing textured/solid/custom material routing.
- `PlanetBody` now rotates a child group, allowing the same pole/spin path to apply to either a sphere mesh or a future GLB-backed mesh group.
- Phobos and Deimos use the mesh path after their reviewed GLB files are committed.

Phase 2 scale note, 2026-05-03:

- Added imported-mesh bounds normalization so a loaded GLB is centered on the body origin and uniformly scaled from its source bounding radius to the app's `body.radius`.
- The mesh path now decomposes world transforms from nested GLB mesh nodes before applying normalization, preserving source child transforms while keeping focus distance, labels, indicators, and screen-space radius tied to the existing body metadata contract.

Phase 2 selection note, 2026-05-03:

- Moved the shared double-click and touch double-tap selection handlers onto raycastable sphere meshes and GLB child meshes directly.
- The rotation group now only owns pole alignment, spin, and focused scale; picking remains tied to actual rendered surface geometry.

Phase 2 asset adoption note, 2026-05-03:

- Added optimized runtime GLBs at `public/meshes/phobos.glb` and `public/meshes/deimos.glb`.
- Source originals were downloaded to a temp scratch directory outside git, optimized with glTF Transform, and left out of the repository.
- Embedded GLB source textures were resized to 16x16 placeholders because the runtime renderer uses the app's existing approved Phobos and Deimos texture assets through `BodySurfaceMaterial`.
- Final runtime sizes: Phobos 633,020 bytes; Deimos 600,432 bytes.
- Final GLB inspection: no required decoder extensions, no animations, one mesh each, Phobos 14,446 uploaded vertices, Deimos 13,697 uploaded vertices.

### Phase 3: Validation

- [x] Focus Phobos and Deimos from overview and Mars-system views.
- [x] Validate seams, orientation, poles, lighting direction, and self-rotation behavior.
- [x] Confirm labels and indicators still appear at sensible distances.
- [x] Confirm trails and parent-relative Mars-system framing are unchanged.
- [x] Review production bundle output and static asset sizes after mesh adoption.
- [x] Decide whether Miranda or Ariel should be added in the same milestone or deferred.

Phase 3 static-size note, 2026-05-03:

- `pnpm build` copies the runtime mesh assets to `dist/meshes/`.
- Built static sizes match the reviewed source assets: `phobos.glb` 633,020 bytes and `deimos.glb` 600,432 bytes.
- The existing large JavaScript chunk warning remains unchanged as a known build warning; the mesh assets are served as static public files rather than bundled into the JS chunk.

Phase 3 closeout note, 2026-05-03:

- User visual inspection accepted the Phobos and Deimos mesh-backed focused views after the closer focused zoom limit was added.
- Phobos and Deimos can be focused from overview and Mars-system discovery flows using the existing selector, labels, indicators, and double-click or double-tap selection behavior.
- Trails and Mars-system framing remain on the existing generated-data and parent-relative trail paths; the mesh work changes only body surface geometry.
- Miranda and Ariel remain deferred. They are still candidates, but adding them in this milestone would expand the visual validation scope beyond the first proven Phobos/Deimos path.

## Verification

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. Manual focused-view checks for every mesh-backed moon: accepted by user inspection on 2026-05-03.
5. Browser console check for missing mesh, texture, or decoder assets: no missing decoder dependency; GLB inspection shows no required extensions.
6. Bundle and static asset size review against the current GitHub Pages delivery budget: passed; GLBs are served as static public files.

Closeout verification, 2026-05-03:

- `pnpm test -- bodyShapeScaling.test.ts bodyShapeAssets.test.ts` passed.
- `pnpm test -- controlProfile.test.ts` passed.
- `pnpm lint` passed.
- `pnpm build` passed. The existing large JavaScript chunk warning remains.
- `dist/meshes/phobos.glb` and `dist/meshes/deimos.glb` are present at the reviewed runtime sizes.

## Locked Decisions

- First implementation priority is Phobos and Deimos.
- Spherical rendering remains the default fallback.
- Mesh work must reuse the existing physical pole, spin, lighting, focus, and interaction contracts.
- Additional moon meshes are deferred follow-ups gated by size, orientation confidence, and visible value.
- This milestone does not expand the body catalog.
