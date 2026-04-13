# Vision

## Product Goal

Build a web-based solar system visualizer for GitHub Pages that feels like a realistic educational explorer.

## Current Experience

The current public experience is a fullscreen mocked solar-system explorer including:

- Sun
- Mercury
- Venus
- Saturn
- Earth
- Moon
- Mars
- Jupiter
- Uranus
- Neptune

The user can:

- start from an overall solar-system view
- zoom from the overview into individual bodies
- double click or double tap a body to focus it
- see a star background behind the system
- see mocked orbital trails
- observe continuous self-rotation on the rendered bodies

This current mocked overview serves as the rendering and interaction foundation for later ephemeris-backed positions and more sophisticated navigation.

## Next Experience

The next implementation focus is the interaction/readability pass on top of the current mocked solar-system scene.

This includes:

- refining overview readability with stars and trails present
- improving multi-body navigation and focus choreography
- preparing the UI and data boundaries for real ephemeris-driven positions
- deferring more advanced trail behavior until real positions and reference-frame controls arrive

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

## Non-Goals For The Current Phase

- production ephemerides integration
- realistic orbital mechanics
- final-scale body and distance realism
- additional object classes beyond Sun and planets

## Workflow Expectations

- work in small incremental steps
- after each step, pause for visual inspection before moving on
- keep project documentation aligned with the implemented state
