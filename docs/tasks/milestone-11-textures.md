# Milestone 11: Moon Texture Research And Adoption

Status: In Progress

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

## 2026-05-02 Adoption Pass

The first runtime adoption pass covers only the deployed reduced moon set. Deferred fast moons and Charon are documented candidates only until later data milestones add or restore those bodies in the generated profile.

License gate result:

- NASA 3D Resources hub says assets are free to download and use and points to NASA Images and Media Usage Guidelines.
- NASA media guidance permits NASA texture-map media for computer graphical simulations and Internet web pages, asks for NASA/source acknowledgement, and warns that third-party copyrighted items must be separately marked.
- The adopted source pages were official NASA Science or NASA Photojournal pages and were not marked as third-party copyrighted.
- Titan uses the real NASA Photojournal Cassini ISS global surface mosaic instead of the fictional NASA 3D Resources Titan concept texture.
- Large TIFF originals were not downloaded. Runtime JPG files were adopted directly except Titan, whose source JPG was resized locally from `5760x2880` to `2048x1024`.

## Candidate Matrix

### Deployed Reduced Moons

| Body | Candidate URL | Source Organization | Source Body Name | Realism Level | Formats / Size | License Or Usage Claim | Required Credit Line | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ganymede | https://science.nasa.gov/3d-resources/jupiter-ganymede/ | NASA 3D Resources; USGS/JPL/Caltech source map | Jupiter - Ganymede | Realistic Voyager/USGS mosaic | JPG 694.26 KB; TIFF 2.99 MB; adopted JPG is 1440x720 | NASA 3D Resources free-to-use assets under NASA media guidelines | USGS, JPL, & Caltech | Adopted as `assets/textures/2k_ganymede.jpg` |
| Callisto | https://science.nasa.gov/3d-resources/jupiter-callisto/ | NASA 3D Resources; USGS/JPL/Caltech source map | Jupiter - Callisto | Realistic Voyager/USGS mosaic | JPG 765.04 KB; TIFF 2.99 MB; adopted JPG is 1440x720 | NASA 3D Resources free-to-use assets under NASA media guidelines | USGS, JPL, & Caltech | Adopted as `assets/textures/2k_callisto.jpg` |
| Rhea | https://science.nasa.gov/3d-resources/saturn-rhea/ | NASA 3D Resources; JPL/Caltech generated planetary maps | Saturn - Rhea | Realistic Voyager mosaic | JPG 447.41 KB; TIFF 2.99 MB; adopted JPG is 1440x720 | NASA 3D Resources free-to-use assets under NASA media guidelines | NASA/JPL/Caltech generated planetary maps | Adopted as `assets/textures/2k_rhea.jpg` |
| Titan | https://science.nasa.gov/photojournal/titan-mosaic-the-surface-under-the-haze/ | NASA Photojournal; Cassini ISS | Titan Mosaic: The Surface Under the Haze | Realistic near-infrared global surface brightness mosaic | JPG 870.16 KB source at 5760x2880; TIFF 10.44 MB; adopted JPG is 2048x1024 | NASA media guidelines | NASA/JPL-Caltech/Univ. Arizona | Adopted as `assets/textures/2k_titan.jpg`; resized from source JPG |
| Titan fallback | https://science.nasa.gov/3d-resources/saturn-titan/ | NASA 3D Resources; JPL/Caltech generated planetary maps | Saturn - Titan | Fictional concept with Voyager color | JPG 48.08 KB; TIFF 783.54 KB | NASA 3D Resources free-to-use assets under NASA media guidelines | NASA/JPL/Caltech generated planetary maps | Rejected because a realistic NASA Photojournal mosaic is available |
| Iapetus | https://science.nasa.gov/3d-resources/saturn-iapetus/ | NASA 3D Resources; JPL/Caltech generated planetary maps | Saturn - Iapetus | Realistic Voyager mosaic | JPG 375.54 KB; TIFF 2.99 MB; adopted JPG is 1440x720 | NASA 3D Resources free-to-use assets under NASA media guidelines | NASA/JPL/Caltech generated planetary maps | Adopted as `assets/textures/2k_iapetus.jpg` |
| Umbriel | https://science.nasa.gov/3d-resources/uranus-umbriel/ | NASA 3D Resources; USGS/JPL/Caltech source map | Uranus - Umbriel | Realistic Voyager/USGS mosaic | JPG 211.58 KB; TIFF 2.99 MB; adopted JPG is 1440x720 | NASA 3D Resources free-to-use assets under NASA media guidelines | USGS/Tammy Becker & JPL/Caltech | Adopted as `assets/textures/2k_umbriel.jpg` |
| Titania | https://science.nasa.gov/3d-resources/uranus-titania/ | NASA 3D Resources; USGS/JPL/Caltech source map | Uranus - Titania | Realistic Voyager/USGS mosaic | JPG 277.46 KB; TIFF 2.99 MB; adopted JPG is 1440x720 | NASA 3D Resources free-to-use assets under NASA media guidelines | USGS/Tammy Becker & JPL/Caltech | Adopted as `assets/textures/2k_titania.jpg` |
| Oberon | https://science.nasa.gov/3d-resources/uranus-oberon/ | NASA 3D Resources; USGS/JPL/Caltech source map | Uranus - Oberon | Realistic Voyager/USGS mosaic | JPG source; TIFF 319.92 KB; adopted JPG is 1440x720 | NASA 3D Resources free-to-use assets under NASA media guidelines | USGS/Tammy Becker & JPL/Caltech | Adopted as `assets/textures/2k_oberon.jpg` |
| Triton | https://science.nasa.gov/3d-resources/neptune-triton/ | NASA 3D Resources; USGS/JPL/Caltech source map | Neptune - Triton | Realistic limited Voyager/USGS stitched mosaic | JPG 236.34 KB; TIFF 2.99 MB; adopted JPG is 1440x720 | NASA 3D Resources free-to-use assets under NASA media guidelines | USGS/Tammy Becker & JPL/Caltech | Adopted as `assets/textures/2k_triton.jpg` |

### Deferred Major Moons

| Body | Candidate URL | Source Organization | Source Body Name | Realism Level | Formats / Size | License Or Usage Claim | Required Credit Line | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Phobos | https://science.nasa.gov/3d-resources/mars-phobos/ | NASA 3D Resources; USGS/JPL source map | Mars - Phobos | Realistic Viking/USGS processed map | JPG 587.48 KB; TIFF 2.99 MB | NASA 3D Resources free-to-use assets under NASA media guidelines | NASA/JPL/Solar System Simulator | Documented only; deferred until fast-moon cadence restores body |
| Deimos | https://science.nasa.gov/3d-resources/mars-deimos/ | NASA 3D Resources; USGS/JPL source map | Mars - Deimos | Realistic Viking/USGS processed map | JPG 469.17 KB; TIFF 2.99 MB | NASA 3D Resources free-to-use assets under NASA media guidelines | NASA/JPL/Solar System Simulator | Documented only; deferred until fast-moon cadence restores body |
| Io | https://science.nasa.gov/3d-resources/jupiter-io-a/ | NASA 3D Resources; USGS/JPL/Caltech source map | Jupiter - Io (A) | Realistic Voyager/USGS mosaic with polar gaps | JPG 685.55 KB; TIFF 2.99 MB | NASA 3D Resources free-to-use assets under NASA media guidelines | USGS, JPL, & Caltech | Documented only; deferred until fast-moon cadence restores body |
| Europa | https://science.nasa.gov/3d-resources/jupiter-europa/ | NASA 3D Resources; USGS/JPL/Caltech source map | Jupiter - Europa | Realistic Voyager/USGS mosaic | JPG 596.54 KB; TIFF 2.99 MB | NASA 3D Resources free-to-use assets under NASA media guidelines | USGS, JPL, & Caltech | Documented only; deferred until fast-moon cadence restores body |
| Mimas | https://science.nasa.gov/3d-resources/saturn-mimas/ | NASA 3D Resources; JPL/Caltech generated planetary maps | Saturn - Mimas | Realistic Voyager mosaic | JPG 501.00 KB; TIFF 2.99 MB | NASA 3D Resources free-to-use assets under NASA media guidelines | NASA/JPL/Caltech generated planetary maps | Documented only; deferred until fast-moon cadence restores body |
| Enceladus | https://science.nasa.gov/3d-resources/saturn-enceladus/ | NASA 3D Resources; JPL/Caltech generated planetary maps | Saturn - Enceladus | Realistic Voyager mosaic | JPG 461.14 KB; TIFF 2.99 MB | NASA 3D Resources free-to-use assets under NASA media guidelines | NASA/JPL/Caltech generated planetary maps | Documented only; deferred until fast-moon cadence restores body |
| Tethys | https://science.nasa.gov/3d-resources/saturn-tethys/ | NASA 3D Resources; JPL/Caltech generated planetary maps | Saturn - Tethys | Realistic Voyager mosaic | JPG 583.14 KB; TIFF 2.99 MB | NASA 3D Resources free-to-use assets under NASA media guidelines | NASA/JPL/Caltech generated planetary maps | Documented only; deferred until fast-moon cadence restores body |
| Dione | https://science.nasa.gov/3d-resources/saturn-dione/ | NASA 3D Resources; JPL/Caltech generated planetary maps | Saturn - Dione | Realistic Voyager mosaic | JPG 561.19 KB; TIFF 2.99 MB | NASA 3D Resources free-to-use assets under NASA media guidelines | NASA/JPL/Caltech generated planetary maps | Documented only; deferred until fast-moon cadence restores body |
| Ariel | https://science.nasa.gov/3d-resources/uranus-ariel/ | NASA 3D Resources; USGS/JPL/Caltech source map | Uranus - Ariel | Realistic Voyager/USGS mosaic | JPG 248.37 KB; TIFF 2.99 MB | NASA 3D Resources free-to-use assets under NASA media guidelines | USGS/Tammy Becker & JPL/Caltech | Documented only; deferred until fast-moon cadence restores body |
| Miranda | https://science.nasa.gov/3d-resources/uranus-miranda/ | NASA 3D Resources; USGS/JPL/Caltech source map | Uranus - Miranda | Realistic Voyager/USGS mosaic | JPG 313.74 KB; TIFF 2.99 MB | NASA 3D Resources free-to-use assets under NASA media guidelines | USGS/Tammy Becker & JPL/Caltech | Documented only; deferred until fast-moon cadence restores body |

### Extra Moon Candidates

| Body | Candidate URL | Source Organization | Source Body Name | Realism Level | Formats / Size | License Or Usage Claim | Required Credit Line | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Charon | https://science.nasa.gov/3d-resources/pluto-charon/ | NASA 3D Resources; JPL/Caltech generated planetary maps | Pluto - Charon | Fictional/faked from Magellan images and ground-based albedo maps | JPG 259.31 KB; TIFF 786.96 KB | NASA 3D Resources free-to-use assets under NASA media guidelines | David Seal & JPL/Caltech | Documented only; not renderable in current body set and fictional fallback |

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

- [x] Create a candidate matrix for every body in the deployed reduced and deferred major-moon tiers.
- [x] Record candidate URL, source organization, source body name, realism level, file formats, source resolution or file size, license or usage claim, required credit line, and adoption decision.
- [x] Search official NASA, JPL, and USGS pages first for each body.
- [x] Search reputable open-license repositories only when official sources are missing, unsuitable, or lower quality than a clearly licensed alternative. No third-party repository was needed because official NASA-hosted candidates were found.
- [x] Prefer source pages over mirrors; use mirrors only to discover original source metadata.
- [x] Mark artistic, fictional, painted, or gap-filled maps explicitly in the matrix.
- [x] Record extra moon candidates separately from currently renderable bodies.

### Phase 2: License And Attribution Gate

- [x] Confirm every selected source page claims reusable rights compatible with this repository.
- [x] Confirm NASA or JPL assets do not carry marked third-party copyright restrictions requiring separate permission.
- [x] Reject any candidate whose license is ambiguous, noncommercial-only, no-derivatives-only, or permission-required. No candidate with those restrictions was adopted.
- [x] For every adopted texture, update `assets/textures/ATTRIBUTION.txt` with body name, file name, source URL, source claim or license, required credit line, processing notes, and realism classification.
- [x] Label artistic or fictional adopted textures as such in attribution and task notes. No fictional texture was adopted; Titan's fictional fallback was rejected in favor of a realistic NASA Photojournal mosaic.

### Phase 3: Asset Adoption

- [x] Download only selected textures after the license gate passes.
- [x] Store adopted runtime textures in `assets/textures` with stable lower-case names such as `2k_ganymede.jpg`.
- [x] Prefer one runtime tier around 2k equirectangular JPG or PNG unless source quality, dimensions, or file size justify a different choice.
- [x] Keep large originals out of git unless explicitly approved.
- [x] Document any local source-original path and conversion command when resizing or format conversion is needed.
- [x] Keep the existing NASA Moon texture and height-map path unchanged unless a later task explicitly chooses a replacement.

### Phase 4: Runtime Integration

- [x] Extend the shared texture path so natural satellites can use texture-backed materials without custom material work.
- [x] Keep bodies without approved textures on `SolidBodyMaterial`.
- [x] Preserve the existing custom material paths for Earth, Venus, Moon, and Saturn.
- [x] Add or update unit coverage if the implementation introduces a new moon texture map or material metadata path.
- [x] Update `docs/architecture.md` if adopted moon textures become part of the runtime rendering model.
- [x] Update `docs/roadmap.md` only if this task changes the delivered Milestone 11 scope. No roadmap update was needed because this adoption pass stays inside the documented Milestone 11 texture scope.

## Verification

2026-05-02 automated checks:

- `pnpm lint` passed with the existing `SunImpostor.tsx` fast-refresh warning.
- `pnpm test` passed: 35 files, 174 tests.
- `pnpm build` passed for the default local profile; the existing large chunk warning remains.
- `pnpm test:e2e` passed after allowing Playwright to update `test-results`.
- Temporary expanded-moons build and Playwright texture sweep passed: Ganymede, Callisto, Rhea, Titan, Iapetus, Umbriel, Titania, Oberon, and Triton each focused successfully and each adopted texture returned HTTP 200 with no page or console errors.

2026-05-02 manual visual checks:

- Visual inspection passed for every newly textured rendered moon.
- Orientation, seams, poles, texture loading, and shared world-space lighting were accepted in focused views.

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
