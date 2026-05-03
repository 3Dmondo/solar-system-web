# Milestone 14: Satellite Textures And Physical Metadata

Status: Complete

## Goal

Adopt approved NASA texture assets for the full deployed major-moon catalog and refresh the committed physical metadata snapshot so all current satellites can use generated radii, facts, pole axes, and rotation rates when SPICE provides them.

## Delivered

- Added NASA 3D Resources JPG runtime textures for the Milestone 13 restored fast moons: Phobos, Deimos, Io, Europa, Mimas, Enceladus, Tethys, Dione, Ariel, and Miranda.
- Kept the existing reduced major-moon texture assets unchanged for Ganymede, Callisto, Rhea, Titan, Iapetus, Umbriel, Titania, Oberon, and Triton.
- Updated `bodyTextures.ts` so every currently deployed major moon with an approved NASA texture uses the shared texture-backed material path instead of the solid-color fallback.
- Updated `public/ephemeris/body-metadata.json` from the SpiceNet metadata-only workflow. The snapshot now contains all 29 current deployed body ids, and every major moon has generated radius, shape, GM-derived facts, pole orientation, and rotation model fields from the NAIF text kernels.
- Updated the sibling SpiceNet `scripts/Update-WebDataMetadataSnapshot.ps1` body list so future snapshot refreshes request the full current web body set.

## Texture Source Matrix

| Body | Runtime file | Source URL | Source / realism | Credit | Decision |
| --- | --- | --- | --- | --- | --- |
| Phobos | `2k_phobos.jpg` | https://science.nasa.gov/3d-resources/mars-phobos/ | Viking/USGS processed map | NASA/JPL/Solar System Simulator | Adopted |
| Deimos | `2k_deimos.jpg` | https://science.nasa.gov/3d-resources/mars-deimos/ | Viking/USGS processed map | NASA/JPL/Solar System Simulator | Adopted |
| Io | `2k_io.jpg` | https://science.nasa.gov/3d-resources/jupiter-io-a/ | Voyager/USGS mosaic with polar data gaps | USGS, JPL, & Caltech | Adopted |
| Europa | `2k_europa.jpg` | https://science.nasa.gov/3d-resources/jupiter-europa/ | Voyager/USGS mosaic | USGS, JPL, & Caltech | Adopted |
| Mimas | `2k_mimas.jpg` | https://science.nasa.gov/3d-resources/saturn-mimas/ | Voyager mosaic | NASA/JPL/Caltech generated planetary maps | Adopted |
| Enceladus | `2k_enceladus.jpg` | https://science.nasa.gov/3d-resources/saturn-enceladus/ | Voyager mosaic | NASA/JPL/Caltech generated planetary maps | Adopted |
| Tethys | `2k_tethys.jpg` | https://science.nasa.gov/3d-resources/saturn-tethys/ | Voyager mosaic | NASA/JPL/Caltech generated planetary maps | Adopted |
| Dione | `2k_dione.jpg` | https://science.nasa.gov/3d-resources/saturn-dione/ | Voyager mosaic | NASA/JPL/Caltech generated planetary maps | Adopted |
| Ariel | `2k_ariel.jpg` | https://science.nasa.gov/3d-resources/uranus-ariel/ | Voyager/USGS mosaic | USGS/Tammy Becker & JPL/Caltech | Adopted |
| Miranda | `2k_miranda.jpg` | https://science.nasa.gov/3d-resources/uranus-miranda/ | Voyager/USGS mosaic | USGS/Tammy Becker & JPL/Caltech | Adopted |

License gate:

- NASA 3D Resources says the assets are free to download and use and points to NASA Images and Media Usage Guidelines.
- NASA media guidance says NASA texture maps and polygon data are generally not subject to U.S. copyright in the United States and can be used for computer graphical simulations and Internet web pages, with NASA/source acknowledgement and no implied endorsement.
- No adopted source page was marked as third-party copyrighted. Large TIFF originals were not adopted.

## 3D Shape Research Spike

NASA model inventory for future shape work:

| Body | NASA model page | GLTF size | USDZ size | Milestone 14 decision |
| --- | --- | ---: | ---: | --- |
| Phobos | https://science.nasa.gov/resource/phobos-mars-moon-3d-model | 3.68 MB | 970.37 KB | Candidate for first non-spherical mesh prototype |
| Deimos | https://science.nasa.gov/resource/deimos-mars-moon-3d-model/ | 1.53 MB | 673.54 KB | Candidate for first non-spherical mesh prototype |
| Io | https://science.nasa.gov/resource/io-3d-model/ | 16.67 MB | 1.78 MB | Documented only; likely too heavy for first mesh pass |
| Europa | https://science.nasa.gov/resource/europa-3d-model/ | 11.72 MB | 1.59 MB | Documented only |
| Mimas | https://science.nasa.gov/resource/mimas-3d-model/ | 6.11 MB | 1.18 MB | Documented only |
| Enceladus | https://science.nasa.gov/resource/enceladus-3d-model/ | 17.10 MB | 3.35 MB | Documented only |
| Tethys | https://science.nasa.gov/resource/tethys-3d-model/ | 14.72 MB | 3.08 MB | Documented only |
| Dione | https://science.nasa.gov/resource/dione-3d-model/ | 17.21 MB | 2.95 MB | Documented only |
| Ariel | https://science.nasa.gov/resource/ariel-3d-model/ | 1.30 MB | 584.89 KB | Documented only |
| Miranda | https://science.nasa.gov/resource/miranda-3d-model/ | 672.79 KB | 444.68 KB | Documented only |

No GLTF assets were committed, no `GLTFLoader` path was added, and all deployed moons remain sphere meshes in this milestone. A future shape milestone should prototype Phobos and Deimos first, measuring orientation, scale, mesh complexity, picking behavior, shared lighting compatibility, and static-hosting bundle impact before changing runtime rendering.

## Verification

2026-05-03 automated checks:

- `pnpm lint` passed.
- `pnpm test` passed: 41 files, 212 tests. Existing non-fatal test warning remains for multiple Three.js imports.
- `pnpm build` passed. The existing large chunk warning remains, and the output now includes the newly adopted moon texture assets.
- Metadata spot check passed: `public/ephemeris/body-metadata.json` contains all 29 current deployed body ids, with radius, pole, rotation, and GM-derived fields for every current major moon.

Manual visual inspection still remains recommended before closeout acceptance:

- Focus every newly textured moon.
- Confirm texture loading, seams, poles, orientation, and shared world-space lighting.
- Re-check focused Mars, Jupiter, Saturn, and Uranus system views for picking, labels, indicators, and trails.

## Locked Decisions

- Scope is the current deployed major-moon set, not new bodies.
- SPICE/NAIF metadata is the authority for physical metadata when available.
- NASA JPG texture assets are the runtime tier; TIFF originals stay out of git.
- 3D shapes are research-only in Milestone 14.
