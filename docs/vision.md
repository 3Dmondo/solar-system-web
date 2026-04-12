# Vision

## Product Goal

Build a web-based solar system visualizer for GitHub Pages that feels like a realistic educational explorer.

## Current Experience

The current public milestone is a fullscreen planet showcase focused on:

- Saturn
- Earth
- Moon

The user can:

- orbit the camera around the focused body
- zoom in and out
- double click or double tap a body to focus it

This milestone is considered complete and serves as the rendering and interaction foundation for the broader solar-system view.

## Next Experience

The next implementation focus is a mocked full-solar-system scene including:

- Sun
- Mercury
- Venus
- Earth
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune

The user should be able to:

- start from an overall solar-system view
- focus any single body from that larger scene
- move back and forth between overview and focused exploration
- see mocked orbital trails
- see a star background behind the system
- observe continuous self-rotation on the rendered bodies

## Design Direction

- minimal fullscreen presentation
- visually polished first
- mobile and desktop support from day one
- visually pleasing non-realistic scale by default
- future option to switch to real proportions

## Long-Term Direction

- move from mocked data to NASA/JPL ephemerides-backed positions
- support arbitrary date/time selection
- support different time rates
- expand beyond planets to additional solar system objects
- keep the final site fully static and offline-capable on GitHub Pages

## Non-Goals For The Next Mocked Solar-System Step

- production ephemerides integration
- realistic orbital mechanics
- final-scale body and distance realism
- additional object classes beyond Sun and planets

## Workflow Expectations

- work in small incremental steps
- after each step, pause for visual inspection before moving on
- keep project documentation aligned with the implemented state
