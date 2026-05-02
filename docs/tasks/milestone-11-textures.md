# Milestone 11: Moon Texture Research And Adoption

Status: Planned

## Goal

Find usable surface textures for solar-system moons, then adopt only the candidates whose source pages claim rights compatible with this MIT repository and static GitHub Pages distribution.

This task supports Milestone 11 rendering polish. It does not change the ephemeris body set, reintroduce fast moons, or replace Milestone 13 cadence work.

## Scope

- Search the web for texture candidates for deployed reduced moons, deferred major moons, and useful extra moon candidates outside the current rendered set.
- Prioritize realistic, official, or scientifically derived source-imagery maps.
- Fall back to artistic or fictional maps only when they are clearly labeled and no realistic usable candidate is available.
- Prefer official NASA, JPL, and USGS source pages before mirrors or third-party collections.
- Accept only sources with explicit reusable terms compatible with this repo, such as NASA or JPL usage-guideline assets, public domain, CC0, or CC BY 4.0.
- Reject unclear licensing, noncommercial-only, no-derivatives-only, permission-required, or third-party copyrighted assets without direct reusable terms.
- Keep non-rendered extra textures as documented candidates only unless a later milestone adds those bodies to the registry and generated data.

## Seed Sources

- NASA 3D Resources: https://science.nasa.gov/3d-resources/
- NASA Images and Media Guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/
- Jupiter - Europa: https://science.nasa.gov/3d-resources/jupiter-europa/
- Jupiter - Callisto: https://science.nasa.gov/3d-resources/jupiter-callisto/
- Saturn - Rhea: https://science.nasa.gov/3d-resources/saturn-rhea/
- Neptune - Triton: https://science.nasa.gov/3d-resources/neptune-triton/
- Mars - Phobos: https://science.nasa.gov/3d-resources/mars-phobos/

Initial source read:

- NASA 3D Resources describes the hub as a repository of 3D models and textures, says the assets are free to download and use, and points users to NASA image and media guidelines.
- NASA media guidance says NASA texture-map media are generally not subject to U.S. copyright, may be used for computer graphical simulations and web pages, should acknowledge NASA as the source, must not imply endorsement, and may include third-party copyrighted items that need separate permission when marked as such.
- Individual NASA 3D Resources texture pages should still be checked per body for credit lines, realism notes, source organization, and any third-party warning.

## Candidate Tiers

Deployed reduced moons:

- Ganymede
- Callisto
- Rhea
- Titan
- Iapetus
- Umbriel
- Titania
- Oberon
- Triton

Deferred major moons:

- Phobos
- Deimos
- Io
- Europa
- Mimas
- Enceladus
- Tethys
- Dione
- Ariel
- Miranda

Extra moon candidates:

- Charon
- Any other solar-system moon with a usable texture discovered during source search

## Checklist

### Phase 1: Research Matrix

- [ ] Create a candidate matrix for every body in the deployed reduced and deferred major-moon tiers.
- [ ] Record candidate URL, source organization, source body name, realism level, file formats, source resolution or file size, license or usage claim, required credit line, and adoption decision.
- [ ] Search official NASA, JPL, and USGS pages first for each body.
- [ ] Search reputable open-license repositories only when official sources are missing, unsuitable, or lower quality than a clearly licensed alternative.
- [ ] Prefer source pages over mirrors; use mirrors only to discover original source metadata.
- [ ] Mark artistic, fictional, painted, or gap-filled maps explicitly in the matrix.
- [ ] Record extra moon candidates separately from currently renderable bodies.

### Phase 2: License And Attribution Gate

- [ ] Confirm every selected source page claims reusable rights compatible with this repository.
- [ ] Confirm NASA or JPL assets do not carry marked third-party copyright restrictions requiring separate permission.
- [ ] Reject any candidate whose license is ambiguous, noncommercial-only, no-derivatives-only, or permission-required.
- [ ] For every adopted texture, update `assets/textures/ATTRIBUTION.txt` with body name, file name, source URL, source claim or license, required credit line, processing notes, and realism classification.
- [ ] Label artistic or fictional adopted textures as such in attribution and task notes.

### Phase 3: Asset Adoption

- [ ] Download only selected textures after the license gate passes.
- [ ] Store adopted runtime textures in `assets/textures` with stable lower-case names such as `2k_ganymede.jpg`.
- [ ] Prefer one runtime tier around 2k equirectangular JPG or PNG unless source quality, dimensions, or file size justify a different choice.
- [ ] Keep large originals out of git unless explicitly approved.
- [ ] Document any local source-original path and conversion command when resizing or format conversion is needed.
- [ ] Keep the existing NASA Moon texture and height-map path unchanged unless a later task explicitly chooses a replacement.

### Phase 4: Runtime Integration

- [ ] Extend the shared texture path so natural satellites can use texture-backed materials without custom material work.
- [ ] Keep bodies without approved textures on `SolidBodyMaterial`.
- [ ] Preserve the existing custom material paths for Earth, Venus, Moon, and Saturn.
- [ ] Add or update unit coverage if the implementation introduces a new moon texture map or material metadata path.
- [ ] Update `docs/architecture.md` if adopted moon textures become part of the runtime rendering model.
- [ ] Update `docs/roadmap.md` only if this task changes the delivered Milestone 11 scope.

## Verification

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. Manual focused-view checks for every newly textured rendered moon:
   - texture loads without console errors
   - body is not mirrored or upside down
   - seams and poles are acceptable
   - lighting still works through the shared world-space shader path
   - bundle and build output remain reasonable for GitHub Pages

## Locked Decisions

- First adoption priority is the currently deployed reduced moon set.
- Deferred fast moons may be researched now but should not be reintroduced into generated data by this task.
- NASA, JPL, and USGS source pages are preferred over mirrors when they provide enough license and credit information.
- NASA, JPL, public-domain, CC0, and CC BY 4.0 assets are acceptable defaults when the source page makes those terms clear.
- Artistic or fictional textures are acceptable only as labeled fallbacks.
- This task does not add new ephemeris bodies.
