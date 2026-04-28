# Milestone 12: Milky Way Sky Texture Layer

Status: Complete

## Goal

Add the EXR-derived Milky Way image as an optional background sky layer behind the existing HYG star points and constellation lines.

## Scope

- Convert the source EXR into a deployed `public/sky/milky-way.etc1s.ktx2` texture.
- Use the local source file `C:\Users\Edmondo.Silvestri\Downloads\milkyway_2020_8k_gal.exr`.
- Treat the source as a NASA SVS galactic-coordinate Milky Way background, not a celestial-coordinate star map.
- Use KTX2 with Basis Universal ETC1S/BasisLZ compression, tonemapped to 8-bit sRGB.
- Start without mipmaps because the layer is camera-centered at a fixed apparent distance and should read as low-frequency galactic glow.
- Add mipmaps only if manual rotation tests show shimmer or aliasing.
- Keep the real star catalog and constellation overlays as independent layers.
- Keep the 122 MB EXR source out of git unless explicitly approved.

## Out Of Scope

- Replacing the HYG star catalog layer.
- Adding star brightness or Milky Way opacity controls beyond the existing layer toggle.
- Shipping multiple quality tiers before the first mobile-first texture is validated.

## Checklist

### Phase 1: Runtime Layer

- [x] Add a `milkyWay` layer visibility flag, default on.
- [x] Expose the layer in the existing layer panel.
- [x] Make constellations default on alongside the Milky Way layer.
- [x] Add a KTX2-backed `MilkyWayLayer` under the shared camera-centered sky anchor.
- [x] Sample the galactic-coordinate texture by render direction instead of default sphere UVs.
- [x] Add Three.js Basis transcoder runtime files under `public/basis/`.
- [x] Make the missing generated KTX2 asset non-fatal until the texture is produced.

### Phase 2: Asset Pipeline

- [x] Confirm source image and attribution text.
- [x] Tonemap the EXR to LDR sRGB.
- [x] Resize first pass to `4096x2048`.
- [x] Evaluate an `8192x4096` texture and revert to `4096x2048` after browser memory use was too high.
- [x] Encode `public/sky/milky-way.etc1s.ktx2` with ETC1S and no mipmaps.
- [x] Target roughly 2-6 MB for the first mobile-first pass.
- [x] Confirm ETC1S quality is acceptable for the first shipped pass.
- [x] Confirm no-mipmap behavior is acceptable for the first shipped pass.
- [x] Update `public/sky/ATTRIBUTION.txt` with source and credit details.

### Phase 3: Visual Integration

- [x] Verify the Milky Way appears behind catalog stars.
- [x] Confirm planet geometry occludes the Milky Way layer instead of the texture compositing over bodies.
- [x] Confirm stars and constellations stay independently toggleable and readable.
- [x] Confirm texture orientation is not mirrored or upside down.
- [x] Align the galactic-coordinate source to the current RA/Dec/ecliptic star layer in shader space.
- [x] Reduce Milky Way shader brightness so it reads as a background layer.
- [x] Check desktop and mobile viewport readability.
- [x] Check `/debug` with the layer enabled.

## Conversion Notes

Current generated target:

- File: `public/sky/milky-way.etc1s.ktx2`
- Size: 837,832 bytes
- Dimensions: `4096x2048`
- Mip levels: 1
- Supercompression: BasisLZ
- Note: an `8192x4096` KTX2 was tested but reverted because browser memory use was too high.

Recommended regeneration command:

```powershell
toktx --t2 --encode etc1s --qlevel 128 --clevel 3 --filter lanczos4 --resize 4096x2048 public/sky/milky-way.etc1s.ktx2 <tonemapped-source.png>
```

Rejected 8k test asset command shape:

```powershell
toktx --t2 --encode etc1s --qlevel 128 --clevel 3 --filter lanczos4 --resize 8192x4096 public/sky/milky-way.etc1s.ktx2 <tonemapped-source.png>
```

Do not include `--mipmap` for the first pass. Add mipmaps only after shimmer is observed in manual rotation testing.

If ETC1S loses too much Milky Way structure, try a higher `--qlevel` before switching to:

```powershell
toktx --t2 --encode uastc --zcmp 18 --filter lanczos4 --resize 4096x2048 public/sky/milky-way.uastc.ktx2 <tonemapped-source.png>
```

## Verification

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. Manual visual checks:
   - Milky Way layer is on by default
   - constellation layer is on by default
   - layer toggle loads and shows the generated KTX2 texture
   - stars and constellations remain readable
   - slow camera rotation does not shimmer noticeably
   - `/debug` remains smooth

## Locked Decisions

- The Milky Way texture is an additional layer, not a replacement for the star catalog.
- The Milky Way and constellation layers default on but remain toggleable.
- The first generated asset uses KTX2 ETC1S without mipmaps.
- The source EXR is not committed by default.
- The selected NASA source is the galactic-coordinate 8k Milky Way background: `milkyway_2020_8k_gal.exr`.
- The galactic map is sampled directionally: render-space direction -> J2000 equatorial -> galactic longitude/latitude -> NASA plate carree UV.
- The deployed texture target is `4096x2048`; `8192x4096` was rejected after browser memory testing.
