# Mobile Testing

## Recommended Strategy

Use three levels of testing:

- browser device emulation for quick iteration
- real-device testing on the same local network for interaction and performance checks
- occasional production-preview testing to catch dev/prod differences

## Local Network Testing

Start the dev server with host exposure:

```powershell
pnpm dev -- --host
```

Open the printed LAN URL from the mobile device while both devices are on the same network.

## Production-Like Testing

Use a production preview when needed:

```powershell
pnpm build
pnpm preview -- --host
```

Open the printed LAN URL from the mobile device.

## Manual Checklist

- one-finger orbit feels stable
- pinch zoom works smoothly
- tap to focus selects the intended body
- focus animation stops when the user interrupts it
- no browser page scroll or gesture interference occurs during scene interaction
- performance remains acceptable after a few minutes of use
- the UI remains readable in portrait and landscape

## Browser Coverage

- use desktop emulation for every small step
- use at least one real Android browser during interaction milestones
- test Safari on iPhone later if available because mobile WebGL behavior can differ
