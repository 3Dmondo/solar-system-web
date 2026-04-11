# Repository Instructions

These instructions apply to every session in this repository.

## Working Agreement

- Keep all markdown files under `docs/` updated and aligned with the current state of the project.
- After each implementation step, stop and wait for user visual inspection before continuing to the next step.
- Prefer small, reviewable increments over large multi-feature changes.
- When a decision changes the plan, update the relevant docs in the same step as the code.

## Documentation Expectations

- `docs/vision.md` must reflect current product goals, milestone scope, and non-goals.
- `docs/architecture.md` must reflect the actual chosen stack and structural decisions.
- `docs/roadmap.md` must reflect the current milestone sequence and status at a high level.
- `docs/tasks/*.md` must reflect the actionable checklist for the active milestone.
- `docs/decisions/*.md` should capture durable architectural or workflow decisions.

## Delivery Expectations

- Favor maintainable code and clear module boundaries.
- Keep rendering logic, data logic, and UI logic separated.
- Preserve mobile and desktop usability from the start.
- Treat test coverage as a project requirement and expand it as features are added.

## Session Behavior

- At the start of a task, read the relevant docs before making changes.
- Before editing files, briefly state the step being implemented.
- After finishing a step, summarize what changed, how it was verified, and what should be inspected visually.
- Do not continue automatically past a visual milestone without user confirmation.

## Practical Notes

- The project uses `pnpm`.
- The app is intended for static hosting on GitHub Pages.
- Early milestones use mocked data behind abstractions that can later support JPL/SPICE-derived data.
